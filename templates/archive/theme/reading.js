(function () {
  'use strict';
  var KEY = 'clip-font-size';
  var MIN = 14, MAX = 32, STEP = 2, DEFAULT = 20;

  function read() {
    try {
      var v = parseInt(localStorage.getItem(KEY), 10);
      if (v >= MIN && v <= MAX) return v;
    } catch (e) {}
    return DEFAULT;
  }

  function apply(size) {
    document.documentElement.style.setProperty('--clip-font-size', size + 'px');
    try { localStorage.setItem(KEY, String(size)); } catch (e) {}
  }

  var size = read();
  apply(size);

  function init() {
    var box = document.createElement('div');
    box.className = 'clip-fontsize';
    box.innerHTML =
      '<button type="button" title="减小字号" aria-label="减小字号">A<sup>−</sup></button>' +
      '<button type="button" title="增大字号" aria-label="增大字号">A<sup>+</sup></button>';
    var btns = box.querySelectorAll('button');
    btns[0].addEventListener('click', function () {
      size = Math.max(MIN, size - STEP); apply(size);
    });
    btns[1].addEventListener('click', function () {
      size = Math.min(MAX, size + STEP); apply(size);
    });
    document.body.appendChild(box);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
