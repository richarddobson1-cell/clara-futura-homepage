// === Ambient floating particles — light frequencies and energy ===
// Contrast rule: silver dots on amber lines, amber dots on silver lines, all brighter

(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let width, height;
  const PARTICLE_COUNT = 160;

  // Bright, vivid colours
  const AMBER = '#F5C870';    // bright amber-gold
  const AMBER_HOT = '#F2B54D'; // hot amber
  const SILVER = '#C8D0D8';   // bright silver
  const SILVER_BRIGHT = '#DDE2E7'; // very bright silver
  const CREAM = '#E8E5DD';

  function randomColor() {
    const r = Math.random();
    if (r < 0.15) return SILVER_BRIGHT;
    if (r < 0.35) return SILVER;
    if (r < 0.55) return AMBER;
    if (r < 0.70) return AMBER_HOT;
    return CREAM;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const color = randomColor();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3.5 + 1.2,   // 1.2–4.7px radius — larger
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25 - 0.08,
      color: color,
      isAmber: color === AMBER || color === AMBER_HOT,
      isSilver: color === SILVER || color === SILVER_BRIGHT,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.006 + Math.random() * 0.012,
      glowSize: Math.random() * 2 + 1,
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
      p.x += p.vx + Math.sin(p.phase) * 0.18;
      p.y += p.vy;
      p.phase += p.pulseSpeed;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Pulsing opacity via sine — bright baseline
      const pulse = 0.5 + 0.5 * Math.sin(p.phase * 3);
      const radius = p.r * (0.85 + pulse * 0.35);

      // Glow effect for larger particles
      if (p.r > 2.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + p.glowSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.15 + pulse * 0.1;
        ctx.fill();
      }

      // Main particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7 + pulse * 0.3; // 0.7 to 1.0
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw contrast connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 170) {
          const alpha = (1 - (dist / 170)) * 0.2; // brighter lines

          const isAmberLine = particles[i].isAmber;
          const lineColor = isAmberLine
            ? `rgba(242, 181, 77, ${alpha})`
            : `rgba(200, 208, 216, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.7;
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
