// === Ambient floating particles — light frequencies and energy ===
// Contrast rule: silver dots on amber lines, amber dots on silver lines, all brighter

(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let width, height;
  const PARTICLE_COUNT = 70;

  // Brighter, more vivid colours
  const AMBER = '#F5C870';    // bright amber-gold
  const SILVER = '#C8D0D8';   // bright silver
  const CREAM = '#E8E5DD';

  // Particle types: amber particles and silver particles
  function randomColor() {
    const r = Math.random();
    if (r < 0.35) return SILVER;      // silver particles
    if (r < 0.70) return AMBER;       // amber particles
    return CREAM;                      // cream particles
  }

  let width_, height_;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const color = randomColor();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,      // larger: 1–4px radius
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2 - 0.1,
      color: color,
      isAmber: color === AMBER,
      isSilver: color === SILVER,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.01,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // Gentle sinusoidal drift
      p.x += p.vx + Math.sin(p.phase) * 0.15;
      p.y += p.vy;
      p.phase += p.pulseSpeed;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Pulsing opacity via sine — brighter baseline
      const pulse = 0.5 + 0.5 * Math.sin(p.phase * 3);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.6 + pulse * 0.4; // brighter: 0.6 to 1.0
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw contrast connection lines between nearby particles
    // Rule: amber line gets silver dots at endpoints, silver line gets amber dots
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - (dist / 150)) * 0.15; // brighter lines

          // Determine line colour based on first particle
          const isAmberLine = particles[i].isAmber;
          const lineColor = isAmberLine
            ? `rgba(242, 181, 77, ${alpha})`
            : `rgba(164, 174, 183, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  init();
  draw();
})();
