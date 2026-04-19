// === Ambient floating particles — light frequencies and energy ===
// Pure canvas animation, no dependencies

(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let width, height;
  const PARTICLE_COUNT = 60;

  const COLORS = [
    'rgba(242, 181, 77, 0.35)',   // amber
    'rgba(242, 181, 77, 0.2)',    // amber faint
    'rgba(164, 174, 183, 0.25)',  // silver
    'rgba(232, 229, 221, 0.15)',  // cream
    'rgba(164, 174, 183, 0.12)', // silver faint
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2 - 0.1, // slight upward drift
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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

      // Pulsing opacity via sine
      const pulse = 0.5 + 0.5 * Math.sin(p.phase * 3);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.3 + pulse * 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw subtle connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(242, 181, 77, 0.04)';
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 1 - (dist / 150);
          ctx.stroke();
          ctx.globalAlpha = 1;
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
