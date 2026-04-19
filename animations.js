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
  animateHero();
  revealSections();
  
  // Card reveals
  revealCards('.service-card', 0.15);
  revealCards('.research-card', 0.12);
  revealCards('.eco-card', 0.1);
  
  animatePatent();
  animateContact();
});
