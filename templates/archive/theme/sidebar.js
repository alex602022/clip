(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var scrollbox = document.querySelector('.sidebar-scrollbox');
    if (!scrollbox) return;
    var chapterList = scrollbox.querySelector('ol.chapter');
    if (!chapterList) return;

    var pairs = buildPairs(chapterList);
    if (!pairs.length) return;

    addToggleButtons(pairs);
    tagItems(pairs);
    insertYearGroups(chapterList, pairs);
    applyDefaultCollapse(chapterList, pairs);
    insertSearch(scrollbox, chapterList, pairs);
  }

  /* ── Helpers ── */

  // Get link text stripped of <strong> numbering (e.g. "1. 2024-06-11" → "2024-06-11")
  function getLinkText(li) {
    var a = li.querySelector(':scope > a');
    if (!a) return '';
    var clone = a.cloneNode(true);
    Array.from(clone.querySelectorAll('strong')).forEach(function (s) { s.remove(); });
    return clone.textContent.trim();
  }

  function isDateText(text) {
    return /^\d{4}-\d{2}-\d{2}$/.test(text);
  }

  function show(el) { el.style.display = ''; }
  function hide(el) { el.style.display = 'none'; }

  /* ── Build (dayLi, sectionLi) pairs ──
     Real HTML structure:
       <li class="chapter-item"><a><strong>N.</strong> YYYY-MM-DD</a></li>
       <li><ol class="section"><li class="chapter-item">...</li></ol></li>
  */
  function buildPairs(chapterList) {
    var pairs = [];
    var children = Array.from(chapterList.children);
    for (var i = 0; i < children.length; i++) {
      var li = children[i];
      if (!li.classList.contains('chapter-item')) continue;
      var text = getLinkText(li);
      if (!isDateText(text)) continue;

      var sectionLi = null;
      var next = li.nextElementSibling;
      if (next && !next.classList.contains('chapter-item') && next.querySelector(':scope > ol.section')) {
        sectionLi = next;
      }

      pairs.push({ dayLi: li, sectionLi: sectionLi, date: text, year: text.slice(0, 4) });
    }
    return pairs;
  }

  /* ── Add toggle buttons to day items ── */

  function addToggleButtons(pairs) {
    pairs.forEach(function (pair) {
      var btn = document.createElement('span');
      btn.className = 'clip-toggle';
      btn.textContent = pair.sectionLi ? '▶' : ' ';
      // Insert BEFORE the <a> link, Windows Explorer style
      pair.dayLi.insertBefore(btn, pair.dayLi.firstChild);

      if (!pair.sectionLi) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nowOpen = pair.sectionLi.style.display !== 'none';
        setDayOpen(pair, !nowOpen);
        try { localStorage.setItem('clip-d-' + pair.date, nowOpen ? '0' : '1'); } catch (_) {}
      });
    });
  }

  function setDayOpen(pair, open) {
    if (pair.sectionLi) { open ? show(pair.sectionLi) : hide(pair.sectionLi); }
    var btn = pair.dayLi.querySelector('.clip-toggle');
    if (btn && pair.sectionLi) btn.textContent = open ? '▼' : '▶';
    pair.dayLi.classList.toggle('clip-day-open', open);
  }

  /* ── Tag items with year for year-group toggling ── */

  function tagItems(pairs) {
    pairs.forEach(function (pair) {
      pair.dayLi.dataset.clipYear = pair.year;
      if (pair.sectionLi) pair.sectionLi.dataset.clipYear = pair.year;
    });
  }

  /* ── Year group separators ── */

  function insertYearGroups(chapterList, pairs) {
    var seen = {};
    pairs.forEach(function (pair) {
      if (seen[pair.year]) return;
      seen[pair.year] = true;

      var sep = document.createElement('li');
      sep.className = 'clip-year-group';
      sep.dataset.clipYear = pair.year;
      sep.innerHTML = '<span class="clip-year-arrow">▼</span><span class="clip-year-label"> ' + pair.year + '</span>';
      chapterList.insertBefore(sep, pair.dayLi);

      sep.addEventListener('click', function () {
        var nowOpen = !sep.classList.contains('collapsed');
        setYearOpen(chapterList, pair.year, pairs, !nowOpen);
        try { localStorage.setItem('clip-y-' + pair.year, nowOpen ? '0' : '1'); } catch (_) {}
      });
    });
  }

  function setYearOpen(chapterList, year, pairs, open) {
    var sep = chapterList.querySelector('li.clip-year-group[data-clip-year="' + year + '"]');
    if (sep) {
      sep.classList.toggle('collapsed', !open);
      var arrow = sep.querySelector('.clip-year-arrow');
      if (arrow) arrow.textContent = open ? '▼' : '▶';
    }
    pairs.forEach(function (pair) {
      if (pair.year !== year) return;
      open ? show(pair.dayLi) : hide(pair.dayLi);
      if (pair.sectionLi) open ? show(pair.sectionLi) : hide(pair.sectionLi);
    });
  }

  /* ── Default collapse state ── */

  function applyDefaultCollapse(chapterList, pairs) {
    var currentYear = String(new Date().getFullYear());

    // Find active article's parent day
    var activeDayLi = findActiveDayLi(chapterList);

    // Collect unique years
    var years = uniqueValues(pairs.map(function (p) { return p.year; }));

    // Year collapse
    years.forEach(function (year) {
      var saved = null;
      try { saved = localStorage.getItem('clip-y-' + year); } catch (_) {}
      var open = saved !== null ? saved === '1' : year === currentYear;
      setYearOpen(chapterList, year, pairs, open);
    });

    // Day collapse — only expand active day by default
    pairs.forEach(function (pair) {
      if (!pair.sectionLi) return;
      var saved = null;
      try { saved = localStorage.getItem('clip-d-' + pair.date); } catch (_) {}
      var open = saved !== null ? saved === '1' : pair.dayLi === activeDayLi;
      setDayOpen(pair, open);
    });
  }

  function findActiveDayLi(chapterList) {
    var activeLink = chapterList.querySelector('a.active');
    if (!activeLink) return null;
    var li = activeLink.closest('li.chapter-item');
    if (!li) return null;
    // If inside ol.section, go up to find the sibling day li
    var section = li.closest('ol.section');
    if (section) {
      var wrapper = section.parentElement; // plain <li> wrapping ol.section
      if (wrapper) return wrapper.previousElementSibling; // day <li>
    }
    return isDateText(getLinkText(li)) ? li : null;
  }

  function uniqueValues(arr) {
    var seen = {}, result = [];
    arr.forEach(function (v) { if (!seen[v]) { seen[v] = true; result.push(v); } });
    return result;
  }

  /* ── Search ── */

  function insertSearch(scrollbox, chapterList, pairs) {
    var wrapper = document.createElement('div');
    wrapper.className = 'clip-search-wrapper';

    var input = document.createElement('input');
    input.type = 'search';
    input.placeholder = '搜索文章…';
    input.className = 'clip-search-input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    wrapper.appendChild(input);

    var actions = document.createElement('div');
    actions.className = 'clip-actions';

    var btnExpand = document.createElement('span');
    btnExpand.className = 'clip-action-btn';
    btnExpand.textContent = '全部展开';
    btnExpand.addEventListener('click', function () { expandAll(chapterList, pairs); });

    var sep = document.createTextNode(' · ');

    var btnCollapse = document.createElement('span');
    btnCollapse.className = 'clip-action-btn';
    btnCollapse.textContent = '全部折叠';
    btnCollapse.addEventListener('click', function () { collapseAll(chapterList, pairs); });

    actions.appendChild(btnExpand);
    actions.appendChild(sep);
    actions.appendChild(btnCollapse);
    wrapper.appendChild(actions);

    scrollbox.insertBefore(wrapper, chapterList);

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      q ? applyFilter(chapterList, pairs, q) : clearFilter(chapterList, pairs);
    });
  }

  function expandAll(chapterList, pairs) {
    var years = uniqueValues(pairs.map(function (p) { return p.year; }));
    years.forEach(function (year) {
      setYearOpen(chapterList, year, pairs, true);
      try { localStorage.setItem('clip-y-' + year, '1'); } catch (_) {}
    });
    pairs.forEach(function (pair) {
      if (!pair.sectionLi) return;
      setDayOpen(pair, true);
      try { localStorage.setItem('clip-d-' + pair.date, '1'); } catch (_) {}
    });
  }

  function collapseAll(chapterList, pairs) {
    var years = uniqueValues(pairs.map(function (p) { return p.year; }));
    years.forEach(function (year) {
      setYearOpen(chapterList, year, pairs, false);
      try { localStorage.setItem('clip-y-' + year, '0'); } catch (_) {}
    });
    pairs.forEach(function (pair) {
      try { localStorage.setItem('clip-d-' + pair.date, '0'); } catch (_) {}
    });
  }

  function getArticleText(artLi) {
    var a = artLi.querySelector('a');
    if (!a) return '';
    var clone = a.cloneNode(true);
    Array.from(clone.querySelectorAll('strong')).forEach(function (s) { s.remove(); });
    return clone.textContent.trim().toLowerCase();
  }

  function applyFilter(chapterList, pairs, q) {
    var yearVisible = {};

    pairs.forEach(function (pair) {
      if (!pair.sectionLi) {
        var dayText = getLinkText(pair.dayLi).toLowerCase();
        var matches = dayText.includes(q);
        matches ? show(pair.dayLi) : hide(pair.dayLi);
        if (matches) yearVisible[pair.year] = true;
        return;
      }

      var articles = Array.from(pair.sectionLi.querySelectorAll('li.chapter-item'));
      var anyMatch = false;
      articles.forEach(function (artLi) {
        var matches = getArticleText(artLi).includes(q);
        matches ? show(artLi) : hide(artLi);
        if (matches) anyMatch = true;
      });

      if (anyMatch) {
        show(pair.dayLi);
        show(pair.sectionLi);
        yearVisible[pair.year] = true;
        var btn = pair.dayLi.querySelector('.clip-toggle');
        if (btn) btn.textContent = '▼';
      } else {
        hide(pair.dayLi);
        hide(pair.sectionLi);
      }
    });

    chapterList.querySelectorAll('li.clip-year-group').forEach(function (sep) {
      yearVisible[sep.dataset.clipYear] ? show(sep) : hide(sep);
    });
  }

  function clearFilter(chapterList, pairs) {
    // Restore article visibility
    chapterList.querySelectorAll('ol.section li.chapter-item').forEach(show);

    // Re-apply saved collapse state
    var currentYear = String(new Date().getFullYear());
    var years = uniqueValues(pairs.map(function (p) { return p.year; }));

    years.forEach(function (year) {
      var saved = null;
      try { saved = localStorage.getItem('clip-y-' + year); } catch (_) {}
      var open = saved !== null ? saved === '1' : year === currentYear;
      setYearOpen(chapterList, year, pairs, open);
    });

    pairs.forEach(function (pair) {
      if (!pair.sectionLi) return;
      var saved = null;
      try { saved = localStorage.getItem('clip-d-' + pair.date); } catch (_) {}
      setDayOpen(pair, saved === '1');
    });
  }
})();
