---
title: "纯文本生产力方案探讨 · 雅余 · 茶余饭后，闲情雅致"
date: 2024-05-24T15:29:49+08:00
updated: 2024-05-24T15:29:49+08:00
taxonomies:
  tags: []
extra:
  source: https://yayu.net/4140.html
  hostname: yayu.net
  author: 
  original_title: "纯文本生产力方案探讨 - 雅余"
  original_lang: zh-CN
---

很多人会尝试利用手头有限的工具去解决日常生活、工作记录的需求，例如每日晨间日记、每日晚间小结、待办清单、完成清单、灵感速记、项目行动计划等等，或安装一些时髦的App，或直接使用记事本或者excel表格等常见软件。不少程序员利用其轻量开发工具（Sublime Text、Notepad、EditPlus等）同时完成了编码、日常记录和会议记录的诉求。借助 Markdown 语法，甚至可以作为你的超链接收藏夹管理。在纯文本生产力（Plaintext Productivity）的探索上，我分享下我的了解和方案。

探索这个方案的起因，是经历了当年印象笔记 5000+ 条笔记的迁移后，我已尽量远离云笔记，迁移成本太高了。所以现在无论笔记、日志、会议纪要和日记，都使用数据本地化的管理方式，并且文档格式永远不会过时的。

2008年 Daniel Lucraft 在其[博客中分享](https://yayu.net/go/aHR0cHM6Ly9kYW5sdWNyYWZ0LmNvbS9ibG9nLzIwMDgvMDQvcGxhaW4tdGV4dC1vcmdhbml6ZXIv)了使用单个大文本文件（One Big Text File (OBTF)）的利弊：

> **优点：**1) 一切都在一个地方，2) 它很容易在计算机之间同步，3) 它可以在任何文本编辑器中使用，4) 格式永远不会过时。
> 
> **缺点：**1）必须严格地同步，2) 文件可能会变得非常大，3) 在一个大文件中较难找到东西，即使使用搜索，4) 想法可能会在所有其他项目中丢失。

他提出使用git进行版本管理，使用文件夹归类的方式把一个大文件进行拆分，单个文件中对于不同类型的记录内容进行堆栈式（模块化）等方法解决单个大文件的缺点。

但我不建议把纯文本文件拆分的太细，或分类到多个层级的文件夹中。尽量还是坚持一元笔记法的原则。

《[如何有效整理信息](https://yayu.net/go/aHR0cHM6Ly9ib29rLmRvdWJhbi5jb20vc3ViamVjdC8yNzEzMTc2My8=)》中有关一元笔记法的三条原则：

> 1、一元化：所有信息都只记录在一个笔记本里/所有信息都只记录在一个文本文件里面；  
> 
> 2、时序化：所有信息按照时间顺序记录，把所有笔记按照日期编号，类似 YYMMDD 这样的 6 位编号/OBTF 里可以把日期标记为小标题；  
> 
> 3、索引化：让笔记能够通过某种规则被找到，提供寻找笔记的线索。

堆栈式（模块化）的区分方法其实很简单，每个部分使用明显的区分字符作为间隔。如：

```
______Inbox 收集箱
______ToDo List 待办清单
______Open Projects 进行中项目
______Done List 完成清单 + Daily 日记
______Close Projects 已完结项目
```

当任务或项目完成，则按时间倒序移动到对应的模块中。使用明显的区分字符式方便我们在搜索的时候可以快速的定位对应的位置。

Daniel Lucraft 在[文中](https://yayu.net/go/aHR0cHM6Ly9kYW5sdWNyYWZ0LmNvbS9ibG9nLzIwMDgvMDQvcGxhaW4tdGV4dC1vcmdhbml6ZXIv)还分享了两个有趣的纯文本日历和日志的记录方式。

**纯文本日历日记录方式：**

以月为一组，每天一行文本记录当天的重要事情。保证每日的记录在一行内，控制字数。

```
五月
2024-05-01 周三 | 启程去阿勒泰
2024-05-02 周四 |
2024-05-04 周六 | 约李娟一块吃饭庆祝
...
2024-05-31 周五 | 每日一记

六月
2024-06-01 周六 | 庆祝儿童节
...
```

另外对于纯文本笔记，使用日期时间，务必严格保持统一的格式，建议使用 YYYY-MM-DD HH:mm 作为固定格式，时间可选。

**纯文本80字符日志：**

每行开头是当日时间戳，控制每日日志字数在80字符内，中文可能40个汉字内，一年就365行，一年的点点滴滴就真的历历在目了。

可见在单个纯文本中的结构化处理，方式还是非常多样的。

Matthew Cornell 在2005年的[博客中分享](https://yayu.net/go/aHR0cDovL3d3dy5tYXR0aGV3Y29ybmVsbC5vcmcvYmxvZy8yMDA1LzgvMjEvbXktYmlnLWFyc2UtdGV4dC1maWxlLWEtcG9vci1tYW5zLXdpa2libG9ncGltLmh0bWw=)其纯文本的日志方式，和我目前稳定下来的记录方式差不多。每日以“---”作为间隔，正文后面带上时间戳。例子：

```
---
约李娟一块吃饭庆祝。
2024-05-03 12:30
---
启程去阿勒泰,第一站是喀纳斯。
DAY1：贾登峪——观鱼台——喀纳斯湖——夜宿禾木村
DAY2：禾木村——神仙湾——月亮湾——卧龙湾
2024-05-01 18:30
---
```

Jeff Huang 2022年曾[分享其生产力工具就是一个永无止境的.txt文件](https://yayu.net/go/aHR0cHM6Ly9qZWZmaHVhbmcuY29tL3Byb2R1Y3Rpdml0eV90ZXh0X2ZpbGUv)，引起过一阵骚动。他对单个纯文本文件反复编辑更新长达14年，5万多行文字，记录他作为教授的所做的一切，每天的工作，和谁见面，遇到什么问题等等。通过搜索"meet with"，会显示他有超过3000个预定的会议。他会在内容中插入 #关键词，以帮助其快速定位内容和查找上下文。每一天的日志以日期作为开始标记，使用类似"meet with"和#关键词的时候，需要保证格式统一，文本一致。在每一天结束的时候，他就会回顾一天记录的内容，并整理出第二天的待办事项，周而复始。

另外有个经典的案例就是 Soren Bjornstad 在其网站分享的 [Random Thoughts](https://yayu.net/go/aHR0cHM6Ly9yYW5kb210aG91Z2h0cy5zb3JlbmJqb3Juc3RhZC5jb20v)，坚持从 2009年到2024年在单页网页上记录其所阅所思。以日期作为间隔，每天的多个事项以 @编号 作为锚点标记，关联的内容以 #编号 实现相互关联，目前已编号至13000+。耐心去看，当中有不少干货信息，是一笔宝贵的财富。

Matthew Cornell 曾对其[单个大文本文件进行统计分析](https://yayu.net/go/aHR0cDovL3d3dy5tYXR0aGV3Y29ybmVsbC5vcmcvYmxvZy8yMDA1LzgvMjEvbXktYmlnLWFyc2UtdGV4dC1maWxlLWEtcG9vci1tYW5zLXdpa2libG9ncGltLmh0bWw=)， 一个14000行的文本文件大约0.5MB，一个55000行的文本文件大约1.5MB。在2024年，这个大小的文本文件使用文本编辑器都可以秒开和保存，文件同步效率自然也没什么障碍。

把以上内容捋一捋，综合各大神的纯文本笔记特点，我的**纯文本生产力模板文件结构**是这样的：

```
______Motto座右铭 + Annual Plan 年度计划
/* 每次打开都警示自己和明确核心目标 */

座右铭：
年度计划：
-
-

______Inbox 收集箱
/* 你有什么想法，当天发生什么事情，什么都往这里填，可以加 #关键词 作为索引。当晚或次日早上清空，从而完成整理和回顾。 */

2024-05-01
- 灵感想法 #写作
- 今天发生的事
- 笔记
...

______ToDo List 待办清单
/* 参考 Todo.txt 待办记录规则，见以下规则于示例，+项目标记 作为索引，开始结束时间可省略 */

2024-05-01
- [x] (A) 收拾出游行李 +阿勒泰之旅 @home due:2024-05-01 2024-05-01 2024-05-01
- [完成标记] (优先级) 具体事项描述 +项目标记 @处理环境 due:期限YYYY-MM-DD 创建任务时间YYYY-MM-DD 实际结束时间YYYY-MM-DD
- [ ] (B)
...
- [ ]

______Open Projects 进行中项目
/* +项目标记 作为索引，在整个文档保持一致，标题可补充开始和截至时间 */

+项目名称 start:2024-05-01 due:2024-04-30
- 事项内容 #预定会议
- 事项计划
按需罗列计划细节
记录项目发生事项
...

______Done List 完成清单 + Daily 日记
/* 一天结束，整理、回顾，制定第二天计划，把当日收集箱和已完成任务转移到这里，可补充一段日记或每日复盘感想，每日以“---”作为间隔 */

2024-05-02
- [x] (A)
- [x] (B)
- [x]
...
当日所有速记
每日复盘
---
2024-05-01
- [x]
- [x]
...
当日所有速记
每日复盘
---

______Close Projects 已完结项目
/* 项目结束，把项目转移到这里，标记结束时间，可补充项目小结，项目间以“---”作为间隔 */

+项目名称 close:2024-05-01
- 事项
- 事项
...
项目小结：
---
+项目名称 start:2024-04-01 due:2024-04-30
- 事项
- 事项
...
项目小结：
---
```

以上每个“\_\_\_\_\_\_栈”（模块）可根据自己需求调整，栈名称英文中文按喜好调整；“\- 事项”按需无限增加；统一以“\---”作为分隔；文件以年为周期保存为 .md 格式文件。/\* \*/ 内为模板使用说明。

以上的纯文本生产力模板我自己也还在不断的实验和完善中。目前使用 VS Code 作为 .md 的编辑软件，工作上配合使用 WPS 进行文档处理，.md 文档文件夹使用 WPS云盘进行同步，同步文件夹放在 iCloud 盘中。这样就解决 Win + Mac 的同步处理问题，同时 iOS 可以安装应用打开 iCloud 盘中的 .md 文件进行移动编辑。部分收集箱的内容在一天结束的时候，我会转移到 Obsidian 的仓库中。这个纯文本文件作为 Obsidian 的仓库的其中一个文件也未尝不可，配合双链。

自从简化了我的笔记工具为 Obsidian + VS Code 之后，我已经很少有折腾新的笔记软件的念头。任务提醒应用我只有 iOS 原生的“提醒事项”应用。对于新生的软件工具，我只会大致的试用，了解技术的发展就适可而止了。利用倒腾软件工具的时间，把数据在各个软件间搬来搬去的时间，可以去多读几本书，多出去散步拍照。通过纯文本生产力的持续探索，我在 Obsidian 和 VS Code 所使用的插件也减少到寥寥无几。关于插件的极简，需另外开篇。

关于纯文本生产力，你还可以了解我上一篇内容介绍：[值得拥有的纯文本生产力](https://yayu.net/3994.html)

扩展阅读：

\- [My Big-Arse Text File - a Poor Man's Wiki+Blog+PIM](https://yayu.net/go/aHR0cDovL3d3dy5tYXR0aGV3Y29ybmVsbC5vcmcvYmxvZy8yMDA1LzgvMjEvbXktYmlnLWFyc2UtdGV4dC1maWxlLWEtcG9vci1tYW5zLXdpa2libG9ncGltLmh0bWw=)

\- [My productivity app is a never-ending .txt file](https://yayu.net/go/aHR0cHM6Ly9qZWZmaHVhbmcuY29tL3Byb2R1Y3Rpdml0eV90ZXh0X2ZpbGUv)

\- [A Plain Text Personal Organizer](https://yayu.net/go/aHR0cHM6Ly9kYW5sdWNyYWZ0LmNvbS9ibG9nLzIwMDgvMDQvcGxhaW4tdGV4dC1vcmdhbml6ZXIv)
