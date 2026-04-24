/* Clara Futura — Preloader fade + Custom Amber Cursor */
(function () {
  'use strict';

  var inIframe = false;
  try { inIframe = window.self !== window.top; } catch (e) { inIframe = true; }

  // ---------- Preloader ----------
  var preloader = document.getElementById('cfPreloader');
  if (preloader) {
    if (inIframe) {
      // Hide immediately in iframe mode
      preloader.classList.add('is-hidden');
    } else {
      var hidePreloader = function () {
        setTimeout(function () {
          preloader.classList.add('is-hidden');
          setTimeout(function () {
            if (preloader && preloader.parentNode) {
              preloader.parentNode.removeChild(preloader);
            }
          }, 1200);
        }, 600);
      };
      if (document.readyState === 'complete') {
        hidePreloader();
      } else {
        window.addEventListener('load', hidePreloader);
        // Safety timeout — force hide after 4s even if load never fires
        setTimeout(hidePreloader, 4000);
      }
    }
  }

  // ---------- Custom Cursor ----------
  // Enable in iframe too so the circle+dot appears everywhere (no native arrow fallback).
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  var cursor = document.getElementById('cfCursor');
  var cursorOuter = document.getElementById('cfCursorOuter');
  if (!cursor || !cursorOuter) return;

  var ready = false;

  // Instant follow — no lag. Ring + dot snap directly to the mouse position.
  document.addEventListener('mousemove', function (e) {
    var x = e.clientX;
    var y = e.clientY;
    if (!ready) {
      ready = true;
      document.body.classList.add('cf-cursor-ready');
    }
    var hovered = document.body.classList.contains('cf-cursor-hover');
    var ringHalf = hovered ? 26 : 20;
    var dotHalf = hovered ? 3 : 4;
    cursorOuter.style.transform = 'translate3d(' + (x - ringHalf) + 'px, ' + (y - ringHalf) + 'px, 0)';
    cursor.style.transform = 'translate3d(' + (x - dotHalf) + 'px, ' + (y - dotHalf) + 'px, 0)';
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
    cursorOuter.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    cursor.style.opacity = '';
    cursorOuter.style.opacity = '';
  });

  // Hover expansion on interactive elements
  var hoverSelector = 'a, button, [role="button"], input, textarea, select, .cta-gold, .cta-primary, .ambient-btn, .cf-clickable';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      document.body.classList.add('cf-cursor-hover');
    }
  }, { passive: true });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      document.body.classList.remove('cf-cursor-hover');
    }
  }, { passive: true });
})();
