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
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (inIframe || isTouch) return;

  var cursor = document.getElementById('cfCursor');
  var cursorOuter = document.getElementById('cfCursorOuter');
  if (!cursor || !cursorOuter) return;

  var mouseX = -100, mouseY = -100;
  var outerX = -100, outerY = -100;
  var ready = false;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
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

  // Smooth follow loop
  function tick() {
    // Outer ring — smooth lag
    outerX += (mouseX - outerX) * 0.18;
    outerY += (mouseY - outerY) * 0.18;
    // Outer ring size changes via CSS; JS keeps centering the translation
    var hovered = document.body.classList.contains('cf-cursor-hover');
    var ringHalf = hovered ? 26 : 20;
    cursorOuter.style.transform = 'translate3d(' + (outerX - ringHalf) + 'px, ' + (outerY - ringHalf) + 'px, 0)';

    var dotHalf = hovered ? 3 : 4;
    cursor.style.transform = 'translate3d(' + (mouseX - dotHalf) + 'px, ' + (mouseY - dotHalf) + 'px, 0)';

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

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
