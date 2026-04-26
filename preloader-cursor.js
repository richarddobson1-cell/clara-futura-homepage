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
  // Always run — when embedded as an iframe the parent's WP cursor is hidden
  // over the iframe and this one takes over.
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  var cursor = document.getElementById('cfCursor');
  var cursorOuter = document.getElementById('cfCursorOuter');
  if (!cursor || !cursorOuter) return;

  var mx = -100, my = -100, ox = -100, oy = -100;
  var ready = false;
  var hovered = false;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!ready) {
      ready = true;
      document.body.classList.add('cf-cursor-ready');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
    cursorOuter.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    cursor.style.opacity = '';
    cursorOuter.style.opacity = '';
  });

  function tick() {
    // dot follows pointer; ring eases for a soft trail
    var ringHalf = hovered ? 26 : 20;
    var dotHalf = hovered ? 3 : 4;
    ox += (mx - ox) * 0.22;
    oy += (my - oy) * 0.22;
    cursorOuter.style.transform = 'translate3d(' + (ox - ringHalf) + 'px,' + (oy - ringHalf) + 'px,0)';
    cursor.style.transform = 'translate3d(' + (mx - dotHalf) + 'px,' + (my - dotHalf) + 'px,0)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Hover expansion on interactive elements (cached, no per-frame DOM walk)
  var hoverSelector = 'a, button, [role="button"], input, textarea, select, .cta-gold, .cta-primary, .ambient-btn, .cf-clickable';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      hovered = true;
      document.body.classList.add('cf-cursor-hover');
    }
  }, { passive: true });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      hovered = false;
      document.body.classList.remove('cf-cursor-hover');
    }
  }, { passive: true });
})();
