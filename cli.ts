import * as fs from "https://deno.land/std@0.159.0/fs/mod.ts";
import { extract } from "https://deno.land/std@0.159.0/encoding/front_matter.ts";
import { DateTimeFormatter } from "https://deno.land/std@0.159.0/datetime/formatter.ts";
import * as path from "https://deno.land/std@0.159.0/path/mod.ts";
import { Feed, FeedOptions } from "https://esm.sh/feed@4.2.2";
import {
  parse as parseTOML,
  stringify,
} from "https://deno.land/std@0.159.0/encoding/toml.ts";
import { default as groupBy } from "https://deno.land/x/lodash@4.17.15-es/groupBy.js";
import { serve } from "https://deno.land/std@0.159.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.159.0/http/file_server.ts";
import { parse } from "https://deno.land/std@0.159.0/flags/mod.ts";
import { gfm } from "https://esm.sh/micromark-extension-gfm@2.0.1";
import {
  gfmFromMarkdown,
  gfmToMarkdown,
} from "https://esm.sh/mdast-util-gfm@2.0.1";
import { toMarkdown } from "https://esm.sh/mdast-util-to-markdown@1.5.0";
import { fromMarkdown } from "https://esm.sh/mdast-util-from-markdown@1.3.0";
import { visit } from "https://esm.sh/unist-util-visit@4.1.2";
import showdown from "https://esm.sh/showdown@2.1.0";

interface FrontMatter {
  title: string;
  date: string;
  updated?: string;
  draft?: boolean;
  taxonomies: {
    tags?: string[];
    categories?: string[];
  };
  extra: Record<string, string>;
}
interface Chapter {
  relativePath: string;
  path: string;
  title: string;
  date: Date;
  updated: Date;
  content: string;
  day: string;
  frontMatter: FrontMatter;
}
interface OutputOptions {
  html: Record<string, unknown>;
}
interface BookConfig {
  base_url: string;
  book: Record<string, unknown>;
  preprocessor: Record<string, Record<string, string>>;
  output: OutputOptions;
}
interface SubSection {
  title: string;
  path: string;
  relativePathToSection: string;
  source?: string;
  originalTitle?: string;
}
interface SummarySection {
  title: string;
  path: string;
  subSections?: SubSection[];
}
interface Book {
  config: BookConfig;
  introduction?: SummarySection;
  summary: SummarySection[];
}

const markdownSourcePath = "./content";
const markdownRootPath = "./";
const bookDist = "./book-dist";

async function main() {
  const flags = parse(Deno.args, {
    boolean: ["serve"],
  });

  const workDir = new URL(".", import.meta.url).pathname;
  const bookToml = await Deno.readTextFile(`${workDir}/book.toml`);
  const originalBookConfig = parseTOML(bookToml) as unknown as BookConfig;
  let baseUrl = originalBookConfig.base_url || "";

  const isServe = flags.serve;
  if (isServe) {
    baseUrl = "http://localhost:8000";
  }

  let blogRepoPath: string | undefined;
  if (Deno.env.get("JOURNAL_PATH")) {
    blogRepoPath = path.join(Deno.env.get("JOURNAL_PATH")!);
  }

  const allChapters: Chapter[] = [];
  const book: Book = {
    summary: [],
    introduction: { title: "简介", path: "README.md" },
    config: originalBookConfig,
  };

  try {
    await Deno.remove(bookDist, { recursive: true });
  } catch (_e) {
    // ignore
  }

  const bookSourceFileDist = path.join(bookDist, "archive");

  // walk content directory and collect chapters
  for await (
    const entry of fs.walk(markdownSourcePath, { includeDirs: false })
  ) {
    if (entry.isFile && !entry.name.startsWith(".")) {
      const filepath = entry.path;
      const filename = path.basename(filepath);
      const ext = path.extname(filepath);
      if (ext === ".md" && !filename.startsWith("_")) {
        const file = await Deno.readTextFile(entry.path);
        let parsed = {};
        try {
          parsed = extract(file);
        } catch (e) {
          console.error(`error parsing ${filepath}`);
          throw e;
        }
        // @ts-ignore: it's ok
        const { body } = parsed;
        // @ts-ignore: it's ok
        const attrs = parsed.attrs as FrontMatter;
        if (attrs.draft) continue;
        const relativePath = path.relative(markdownRootPath, filepath);
        if (attrs.date) {
          allChapters.push({
            path: filepath,
            relativePath,
            title: attrs.title,
            date: new Date(attrs.date),
            updated: attrs.updated
              ? new Date(attrs.updated)
              : new Date(attrs.date),
            content: body,
            day: formatBeijing(new Date(attrs.date), "yyyy-MM-dd"),
            frontMatter: attrs,
          });
        }
      }
    }
  }

  // sort newest first
  allChapters.sort((a, b) => b.date.getTime() - a.date.getTime());

  // write markdown files and copy assets
  const targetMarkdownFiles: Record<string, string> = {};
  for (const chapter of allChapters) {
    let markdownContent = `# ${chapter.title}\n\n`;
    if (chapter.frontMatter) {
      const { title, extra } = chapter.frontMatter;
      if (title && extra?.original_title && title !== extra.original_title) {
        markdownContent += `原文标题：**${extra.original_title}**\n\n`;
      }
    }
    markdownContent += chapter.content;
    if (chapter.frontMatter?.extra?.source) {
      markdownContent +=
        `\n\n原文链接：[${chapter.frontMatter.extra.source}](${chapter.frontMatter.extra.source})`;
    }
    targetMarkdownFiles[chapter.relativePath] = markdownContent;

    if (/index.(\w+\.)?md$/.test(chapter.path)) {
      const folder = path.dirname(chapter.path);
      for await (const asset of fs.walk(folder, { includeDirs: false })) {
        if (
          asset.isFile && !asset.path.endsWith(".md") &&
          !asset.name.startsWith(".")
        ) {
          const assetRelativePath = path.relative(markdownRootPath, asset.path);
          const assetDistPath = path.join(bookSourceFileDist, assetRelativePath);
          await fs.ensureDir(path.dirname(assetDistPath));
          await Deno.copyFile(asset.path, assetDistPath);
        }
      }
    }
  }

  for (const relativePath of Object.keys(targetMarkdownFiles)) {
    const distPath = path.join(bookSourceFileDist, relativePath);
    await fs.ensureDir(path.dirname(distPath));
    await Deno.writeTextFile(distPath, targetMarkdownFiles[relativePath]);
  }

  // group chapters by day for archive structure
  const groups = groupBy(allChapters, (chapter: Chapter) => {
    return formatBeijing(chapter.date, "yyyyMMdd");
  });
  const days = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));
  for (const day of days) {
    const yearStr = day.slice(0, 4);
    const monthStr = day.slice(4, 6);
    const dayStr = day.slice(6, 8);
    const daySummaryPath = `${yearStr}/${monthStr}/${dayStr}/index.md`;
    book.summary.push({
      title: `${yearStr}-${monthStr}-${dayStr}`,
      path: daySummaryPath,
      subSections: groups[day].map((chapter: Chapter) => {
        const relativePathToSummary = chapter.relativePath.replace(
          /^content\//,
          "",
        );
        return {
          title: chapter.title,
          path: relativePathToSummary,
          relativePathToSection: path.relative(
            path.dirname(daySummaryPath),
            relativePathToSummary,
          ),
          source: chapter.frontMatter?.extra?.source,
          originalTitle: chapter.frontMatter?.extra?.original_title,
        };
      }),
    });
  }

  // generate SUMMARY.md
  let summary = `# Summary\n\n`;
  if (book.introduction) {
    summary +=
      `[${book.introduction.title}](${formatMarkdownPath(book.introduction.path)})\n\n`;
  }
  for (const section of book.summary) {
    summary += `- [${section.title}](${formatMarkdownPath(section.path)})\n`;
    if (section.subSections) {
      for (const subSection of section.subSections) {
        summary +=
          `  - [${subSection.title}](${formatMarkdownPath(subSection.path)})\n`;
      }
    }
  }
  await Deno.writeTextFile(
    path.join(
      bookSourceFileDist,
      originalBookConfig.book.src as string,
      "SUMMARY.md",
    ),
    summary,
  );

  // copy book assets from templates/archive/
  const bookAssetsPath = path.join("templates", "archive");
  if (fs.existsSync(bookAssetsPath)) {
    for await (
      const asset of fs.walk(bookAssetsPath, { includeDirs: false })
    ) {
      if (asset.isFile && !asset.name.startsWith(".")) {
        const assetRelativePath = path.relative(bookAssetsPath, asset.path);
        const assetDistPath = path.join(
          bookSourceFileDist,
          originalBookConfig.book.src as string,
          assetRelativePath,
        );
        await fs.ensureDir(path.dirname(assetDistPath));
        await Deno.copyFile(asset.path, assetDistPath);
      }
    }
  } else {
    const coverDistPath = path.join(
      bookSourceFileDist,
      originalBookConfig.book.src as string,
      "cover.jpg",
    );
    await fs.ensureDir(path.dirname(coverDistPath));
    await Deno.copyFile(path.join("templates", "cover.jpg"), coverDistPath);
  }

  // copy README if not in templates
  const readmePath = path.join(bookAssetsPath, "README.md");
  if (!fs.existsSync(readmePath)) {
    const assetDistPath = path.join(
      bookSourceFileDist,
      originalBookConfig.book.src as string,
      "README.md",
    );
    await fs.ensureDir(path.dirname(assetDistPath));
    await Deno.copyFile(path.join(workDir, "README.md"), assetDistPath);
  }

  // write day index pages
  for (const section of book.summary) {
    if (!section.subSections || section.subSections.length === 0) continue;

    let dayNoteContent = "# Notes\n\n";
    let subSectionsMarkdown = "";
    for (const subSection of section.subSections) {
      subSectionsMarkdown +=
        `- [${subSection.title}](${subSection.relativePathToSection})\n`;
      dayNoteContent += `- [${subSection.title}](${subSection.source})`;
      if (subSection.title !== subSection.originalTitle) {
        dayNoteContent +=
          ` ([双语机翻译文](${baseUrl}/${subSection.path.slice(0, -8)}))`;
      }
      dayNoteContent += "\n";
    }

    const sectionPath = path.join(
      bookSourceFileDist,
      originalBookConfig.book.src as string,
      section.path,
    );
    await fs.ensureDir(path.dirname(sectionPath));
    await Deno.writeTextFile(
      path.join(path.dirname(sectionPath), "README.md"),
      dayNoteContent,
    );

    let sectionContent = `# ${section.title}\n\n`;
    try {
      sectionContent = await Deno.readTextFile(sectionPath);
    } catch (_e) {
      // ignore
    }
    let newSectionContent =
      `${sectionContent}\n\n## 包含以下文章\n\n${subSectionsMarkdown}`;

    if (blogRepoPath) {
      const JOURNAL_URL = Deno.env.get("JOURNAL_URL") || "";
      const dayIntroPath = path.join(blogRepoPath, section.title + ".md");
      if (fs.existsSync(dayIntroPath)) {
        const dayIntroContent = await Deno.readTextFile(dayIntroPath);
        const parsed = extract(dayIntroContent);
        const { body } = parsed;
        newSectionContent +=
          `\n\n## 当日笔记 ([博客原文](${JOURNAL_URL}${section.title}/))\n\n${body}`;
      }
    }

    await Deno.writeTextFile(sectionPath, newSectionContent);
  }

  // write book.toml
  await Deno.writeTextFile(
    path.join(bookSourceFileDist, "book.toml"),
    stringify(book.config as unknown as Record<string, unknown>),
  );
  console.log("build archive source files success");

  const p = Deno.run({
    cmd: ["../../bin/mdbook", "build"],
    cwd: bookSourceFileDist,
  });
  await p.status();

  const htmlPath = path.join(bookSourceFileDist, "book/html");
  const distDir = path.join(workDir, "dist", "archive");
  await fs.ensureDir(distDir);
  await Deno.remove(distDir, { recursive: true });

  // generate RSS feed
  const feedParams: FeedOptions = {
    title: originalBookConfig.book.title as string,
    description: originalBookConfig.book.description as string,
    id: originalBookConfig.base_url,
    link: originalBookConfig.base_url,
    language: originalBookConfig.book.language as string,
    generator: "clip",
    copyright: "",
  };
  const authors = originalBookConfig.book.authors as string[];
  if (authors?.length > 0) {
    feedParams.author = { name: authors[0], link: originalBookConfig.base_url };
  }
  if (fs.existsSync(path.join(htmlPath, "favicon.png"))) {
    feedParams.favicon = `${originalBookConfig.base_url}/favicon.png`;
  }
  const feed = new Feed(feedParams);
  allChapters.slice(0, 25).forEach((post) => {
    feed.addItem({
      title: post.title,
      id: relativePathToAbsoluteUrl(post.relativePath, baseUrl),
      link: relativePathToAbsoluteUrl(post.relativePath, baseUrl),
      content: renderMarkdown(post.relativePath, post.content, baseUrl),
      date: post.date,
    });
  });
  await Deno.writeTextFile(path.join(htmlPath, "feed.xml"), feed.atom1());

  await fs.copy(htmlPath, distDir, { overwrite: true });
  console.log("build book success");

  if (isServe) {
    serve((req) => {
      return serveDir(req, { fsRoot: distDir });
    });
  }
}

if (import.meta.main) {
  await main();
}

function formatBeijing(date: Date, formatString: string) {
  date = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const formatter = new DateTimeFormatter(formatString);
  return formatter.format(date, { timeZone: "UTC" });
}

function formatMarkdownPath(p: string): string {
  return p.includes(" ") ? `<${p}>` : p;
}

function relativePathToAbsoluteUrl(relativePath: string, host: string): string {
  if (relativePath.startsWith("content/")) {
    relativePath = relativePath.slice("content/".length);
  }
  if (relativePath.endsWith(".md")) {
    relativePath = relativePath.slice(0, -3) + ".html";
  }
  return new URL(relativePath, host).toString();
}

function renderMarkdown(filepath: string, content: string, host: string): string {
  const formatted = formatMarkdown(filepath, content, host);
  return new showdown.Converter().makeHtml(formatted);
}

function formatMarkdown(filepath: string, content: string, host: string) {
  const tree = fromMarkdown(content, "utf8", {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  visit(tree, "link", (node) => {
    if (!node.url.includes("://")) {
      node.url = internalMarkdownLinkToAbsoluteUrl(filepath, node.url, host);
    }
  });
  visit(tree, "image", (node) => {
    if (!node.url.includes("://")) {
      node.url = internalMarkdownLinkToAbsoluteUrl(filepath, node.url, host);
    }
  });
  return toMarkdown(tree, { extensions: [gfmToMarkdown()] });
}

function internalMarkdownLinkToAbsoluteUrl(
  currentlink: string,
  targetlink: string,
  host: string,
): string {
  let parentPath = path.dirname(currentlink);
  if (parentPath.startsWith("content/")) {
    parentPath = parentPath.slice("content/".length);
  }
  let finalPath = path.join(parentPath, targetlink);
  if (finalPath.endsWith(".md")) {
    finalPath = finalPath.slice(0, -3) + ".html";
  }
  return new URL(finalPath, host).toString();
}
