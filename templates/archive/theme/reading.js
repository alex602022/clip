(function () {
  'use strict';
  var KEY = 'clip-font-size';
  var MIN = 14, MAX = 32, STEP = 2;
  var root = document.documentElement;

  // Defaults come from CSS (20px desktop, 18px phone); only a user's own
  // choice is stored and overrides them.
  try {
    var saved = parseInt(localStorage.getItem(KEY), 10);
    if (saved >= MIN && saved <= MAX) root.style.setProperty('--clip-font-size', saved + 'px');
  } catch (e) {}

  function current() {
    return Math.round(parseFloat(getComputedStyle(document.body).fontSize)) || 18;
  }

  function change(delta) {
    var size = Math.min(MAX, Math.max(MIN, current() + delta));
    root.style.setProperty('--clip-font-size', size + 'px');
    try { localStorage.setItem(KEY, String(size)); } catch (e) {}
  }

  // Hide top bar + buttons while scrolling down, bring back on scroll up
  function autoHide(box) {
    var bar = document.getElementById('menu-bar');
    var lastY = window.pageYOffset, ticking = false;
    var scroller = document.scrollingElement || document.documentElement;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = scroller.scrollTop, dy = y - lastY;
        var hide = y > 80 && dy > 6;
        var show = dy < -6 || y <= 80;
        if (hide || show) {
          var h = hide && !show;
          if (bar) bar.classList.toggle('clip-hidden', h);
          box.classList.toggle('clip-hidden', h);
          lastY = y;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  function init() {
    var box = document.createElement('div');
    box.className = 'clip-fontsize';
    box.innerHTML =
      '<button type="button" title="减小字号" aria-label="减小字号">A<sup>−</sup></button>' +
      '<button type="button" title="增大字号" aria-label="增大字号">A<sup>+</sup></button>';
    var btns = box.querySelectorAll('button');
    btns[0].addEventListener('click', function () { change(-STEP); });
    btns[1].addEventListener('click', function () { change(STEP); });
    document.body.appendChild(box);
    autoHide(box);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
