// === Clara Futura World — Homepage Animations ===
// IntersectionObserver primary trigger with timeout safety net

gsap.registerPlugin(ScrollTrigger);

const firedSections = new Set();
function markFired(id) { firedSections.add(id); }
const SAFETY_TIMEOUT_MS = 4000;

// === IntersectionObserver trigger helper ===
function onVisible(element, callback, threshold = 0.1) {
  if (!element) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(element);
      }
    });
  }, { threshold });
  observer.observe(element);
}

// === Scroll-triggered card reveals ===
function revealCards(selector, stagger = 0.12) {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  const section = cards[0].closest('.section') || cards[0].parentElement;
  const sectionId = 'cards-' + selector;

  function doReveal() {
    if (firedSections.has(sectionId)) return;
    markFired(sectionId);
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * (stagger * 1000));
    });
  }

  if (section) onVisible(section, doReveal);
  setTimeout(() => { if (!firedSections.has(sectionId)) doReveal(); }, SAFETY_TIMEOUT_MS + 1000);
}

// === Section heading reveals ===
function revealSections() {
  document.querySelectorAll('.section').forEach((section, idx) => {
    // Skip sections that are collapsible — their labels/h2 are managed
    // by the click-to-reveal system and must stay visible at rest.
    if (section.classList.contains('is-collapsible')) return;

    const label = section.querySelector('.label');
    const h2 = section.querySelector('h2');
    const lead = section.querySelector('.section-lead');
    const sectionId = 'section-' + idx;

    function playReveal() {
      if (firedSections.has(sectionId)) return;
      markFired(sectionId);

      const tl = gsap.timeline();
      if (label) tl.from(label, { y: 15, opacity: 0, duration: 0.5, ease: 'power3.out' });
      if (h2) tl.from(h2, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
      if (lead) tl.from(lead, { y: 15, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3');
    }

    onVisible(section, playReveal);
    setTimeout(() => { if (!firedSections.has(sectionId)) playReveal(); }, SAFETY_TIMEOUT_MS + (idx * 200));
  });
}

// === Hero entrance ===
function animateHero() {
  const tl = gsap.timeline({ delay: 0.3 });
  
  // Portrait entrance
  tl.from('.hero-portrait-wrap', { scale: 0.9, opacity: 0, duration: 1, ease: 'power3.out' })
    .from('.hero h1', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .from('.hero-tagline', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .from('.hero-sub', { y: 15, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
    .from('.hero-cta-row', { y: 15, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
    .from('.scroll-indicator', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
}

// === Patent card entrance ===
function animatePatent() {
  const card = document.querySelector('.patent-card');
  if (!card) return;
  const section = card.closest('.section');
  const id = 'patent';

  function play() {
    if (firedSections.has(id)) return;
    markFired(id);
    gsap.from(card, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' });
  }

  if (section) onVisible(section, play);
  setTimeout(() => { if (!firedSections.has(id)) play(); }, SAFETY_TIMEOUT_MS + 2000);
}

// === Contact items stagger ===
function animateContact() {
  const items = document.querySelectorAll('.contact-item');
  if (!items.length) return;
  const section = document.getElementById('contact');
  const id = 'contact';

  function play() {
    if (firedSections.has(id)) return;
    markFired(id);
    items.forEach((item, i) => {
      gsap.from(item, { y: 15, opacity: 0, duration: 0.5, ease: 'power3.out', delay: i * 0.1 });
    });
  }

  if (section) onVisible(section, play);
  setTimeout(() => { if (!firedSections.has(id)) play(); }, SAFETY_TIMEOUT_MS + 2500);
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  // Build collapsible sections FIRST so revealSections can skip them
  if (typeof window.__cfBuildCollapsibles === 'function') {
    window.__cfBuildCollapsibles();
  }
  animateHero();
  revealSections();
  
  // Card reveals
  revealCards('.service-card', 0.15);
  revealCards('.research-card', 0.12);
  revealCards('.eco-card', 0.1);
  
  animatePatent();
  animateContact();
});

/* ============================================================
   === Collapsible Section Headers — click-to-reveal
   ============================================================ */
(function() {
  'use strict';

  // Which sections should be collapsible (in visual order)
  // First section stays open by default so the page doesn't feel empty
  var SECTIONS = [
    { id: 'what-we-do',  openByDefault: false },
    { id: 'research',    openByDefault: false },
    { id: 'ecosystem',   openByDefault: false },
    { id: 'patent',      openByDefault: false },
    { id: 'contact',     openByDefault: false }
  ];

  function makeToggleIcon() {
    var wrap = document.createElement('span');
    wrap.className = 'cf-toggle-icon';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none">' +
        '<line x1="8" y1="2" x2="8" y2="14" stroke="#F2B54D" stroke-width="1.25" stroke-linecap="round"/>' +
        '<line x1="2" y1="8" x2="14" y2="8" stroke="#F2B54D" stroke-width="1.25" stroke-linecap="round"/>' +
      '</svg>';
    return wrap;
  }

  function buildCollapsible(section, openByDefault) {
    var container = section.querySelector(':scope > .container');
    if (!container) return;
    if (container.querySelector('.cf-header-trigger')) return; // already built

    var label = container.querySelector(':scope > .label, :scope > p.label');
    var h2 = container.querySelector(':scope > h2');
    if (!h2) return;

    // Build the header trigger wrapper
    var trigger = document.createElement('div');
    trigger.className = 'cf-header-trigger';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', openByDefault ? 'true' : 'false');

    // Move label + h2 into trigger; add hint + icon
    if (label) {
      label.classList.add('cf-head-label');
      trigger.appendChild(label);
    }
    h2.classList.add('cf-head-h2');
    trigger.appendChild(h2);

    var hint = document.createElement('span');
    hint.className = 'cf-head-hint';
    hint.textContent = 'Click to expand';
    trigger.appendChild(hint);

    trigger.appendChild(makeToggleIcon());

    // Gather everything AFTER the h2 (and after the label) — put into body wrapper
    var body = document.createElement('div');
    body.className = 'cf-section-body';
    var bodyInner = document.createElement('div');
    bodyInner.className = 'cf-section-body-inner';
    body.appendChild(bodyInner);

    // Collect remaining direct children of container (excluding label & h2 which are now in trigger)
    var remaining = [];
    Array.prototype.forEach.call(container.children, function(child) {
      if (child === label || child === h2) return;
      remaining.push(child);
    });
    remaining.forEach(function(child) { bodyInner.appendChild(child); });

    // Insert trigger as first child, body as second
    container.insertBefore(trigger, container.firstChild);
    container.appendChild(body);

    section.classList.add('is-collapsible');
    section.classList.add(openByDefault ? 'is-open' : 'is-closed');

    // Ensure label, h2 and toggle icon are fully visible even if a GSAP
    // reveal animation set them to opacity:0 before we moved them.
    if (label) { label.style.opacity = '1'; label.style.transform = 'none'; }
    h2.style.opacity = '1';
    h2.style.transform = 'none';
    trigger.style.opacity = '1';
    trigger.style.transform = 'none';

    function toggle() {
      var isOpen = section.classList.contains('is-open');
      if (isOpen) {
        section.classList.remove('is-open');
        section.classList.add('is-closed');
        trigger.setAttribute('aria-expanded', 'false');
        hint.textContent = 'Click to expand';
      } else {
        section.classList.remove('is-closed');
        section.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        hint.textContent = 'Click to close';
        // Re-trigger any reveal animations inside the body
        bodyInner.querySelectorAll('.service-card, .research-card, .eco-card, .patent-card, .contact-item').forEach(function(el) {
          el.classList.add('cf-visible');
        });
        // Gentle scroll so the opened section header stays visible.
        // BUT: skip the scroll entirely when embedded in a parent frame —
        // an iframe-level window.scrollTo on mobile Safari propagates to the
        // parent window and sends it to a wrong position. The parent page
        // (WordPress) keeps the user where they clicked, which is correct.
        if (window.self === window.top) {
          setTimeout(function() {
            var rect = section.getBoundingClientRect();
            if (rect.top < 110 || rect.top > window.innerHeight * 0.4) {
              var y = window.scrollY + rect.top - 110;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 50);
        }
      }
    }

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function init() {
    SECTIONS.forEach(function(cfg) {
      var s = document.getElementById(cfg.id);
      if (s) buildCollapsible(s, cfg.openByDefault);
    });
  }

  // Expose so the main DOMContentLoaded handler can run us first
  window.__cfBuildCollapsibles = init;

  // Fallback: if the main init already fired (script loaded late), run now
  if (document.readyState !== 'loading') {
    // Only run if not already built
    if (!document.querySelector('.cf-header-trigger')) init();
  }
})();

// === RESTRAINT PASS (Apr 2026) ===================================
// (a) Mark body.cf-scrolled after first real scroll (music button opacity)
// (b) Mark body.cf-engaged once user scrolls past hero (tab pulsation)
// (c) Reveal manifesto opener when Section 2 enters viewport
// (d) Fallback: ensure cursor-ready within 2.5s even without mousemove
// ================================================================
(function () {
  'use strict';

  var body = document.body;

  // (a) cf-scrolled — fires on first scroll > 40px
  var scrolled = false;
  function onAnyScroll() {
    if (scrolled) return;
    var y = window.scrollY || window.pageYOffset || 0;
    if (y > 40) {
      scrolled = true;
      body.classList.add('cf-scrolled');
    }
  }
  window.addEventListener('scroll', onAnyScroll, { passive: true });

  // (b) cf-engaged — once user is past the hero (hero bottom out of view)
  var hero = document.querySelector('.hero');
  var engaged = false;
  function markEngaged() {
    if (engaged) return;
    engaged = true;
    body.classList.add('cf-engaged');
  }
  if (hero && 'IntersectionObserver' in window) {
    var heroObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // When hero bottom leaves viewport (not intersecting and user has scrolled past)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          markEngaged();
          heroObs.disconnect();
        }
      });
    }, { threshold: 0, rootMargin: '-30% 0px 0px 0px' });
    heroObs.observe(hero);
  } else {
    // Fallback — after 4s of presence, engage
    setTimeout(markEngaged, 4000);
  }

  // (c) Manifesto opener — fade in when visible (or as soon as user engages)
  var manifesto = document.querySelector('.manifesto-opener');
  function revealManifesto() {
    if (manifesto && !manifesto.classList.contains('is-visible')) {
      manifesto.classList.add('is-visible');
    }
  }
  if (manifesto && 'IntersectionObserver' in window) {
    var mObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Fire as soon as any part of it enters (threshold 0) — rootMargin negative top
        // so it fires a bit before the element fully scrolls in
        if (entry.isIntersecting) {
          revealManifesto();
          mObs.unobserve(manifesto);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    mObs.observe(manifesto);
  } else if (manifesto) {
    revealManifesto();
  }
  // Safety net — reveal once cf-engaged triggers, regardless
  if (manifesto) {
    var engagedCheck = setInterval(function () {
      if (body.classList.contains('cf-engaged')) {
        revealManifesto();
        clearInterval(engagedCheck);
      }
    }, 150);
    // Absolute fallback — after 8s always reveal
    setTimeout(revealManifesto, 8000);
  }

  // (d) Cursor fallback — if user hasn't moved mouse after 2.5s, fade cursor in anyway
  setTimeout(function () {
    if (!body.classList.contains('cf-cursor-ready')) {
      body.classList.add('cf-cursor-ready');
    }
  }, 2500);
})();
