// === Portrait FX — dynamic energy field behind Clara portrait ===
// Pulsating energy arcs, orbiting light particles, and periodic light bursts

(function() {
  const canvas = document.getElementById('portraitFxCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const AMBER = '#F2B54D';
  const AMBER_BRIGHT = '#FFD074';
  const SILVER = '#C8D0D8';
  const SILVER_BRIGHT = '#DDE2E7';
  const WHITE = '#FFFFFF';

  let W, H, cx, cy;
  let time = 0;
  let orbiters = [];
  let bursts = [];
  let animId = null;
  const DPR = Math.min(window.devicePixelRatio || 1, 3); // cap at 3x for perf

  function resize() {
    const wrap = canvas.parentElement;
    W = wrap.offsetWidth;
    H = wrap.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    // Reset transform before scaling — WebKit accumulates ctx.scale on resize
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
  }

  // Orbiting energy particles
  function createOrbiter() {
    const isAmber = Math.random() > 0.4;
    return {
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 100,
      speed: (0.004 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1),
      size: 1.5 + Math.random() * 2.5,
      color: isAmber ? (Math.random() > 0.5 ? AMBER : AMBER_BRIGHT) : (Math.random() > 0.5 ? SILVER : SILVER_BRIGHT),
      pulse: Math.random() * Math.PI * 2,
      trail: [],
    };
  }

  // Light burst (explosion at portrait edge)
  function createBurst(bx, by) {
    const particles = [];
    const count = 15 + Math.floor(Math.random() * 15);
    const isAmber = Math.random() > 0.4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 3;
      particles.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.7,
        maxLife: 0.5 + Math.random() * 0.7,
        size: 1 + Math.random() * 3,
        color: isAmber
          ? (Math.random() > 0.3 ? AMBER_BRIGHT : WHITE)
          : (Math.random() > 0.3 ? SILVER_BRIGHT : WHITE),
      });
    }
    return { particles };
  }

  function init() {
    resize();
    orbiters = [];
    for (let i = 0; i < 28; i++) {
      orbiters.push(createOrbiter());
    }
  }

  // Trigger bursts periodically
  let burstTimer = 0;
  const BURST_INTERVAL = 90; // frames (~1.5s)

  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += 0.016;
    burstTimer++;

    // --- Pulsating energy glow behind portrait ---
    const glowPulse = 0.5 + 0.5 * Math.sin(time * 1.8);
    const glowPulse2 = 0.5 + 0.5 * Math.sin(time * 2.5 + 1.2);

    // Outer amber glow
    const grad1 = ctx.createRadialGradient(cx, cy, 40, cx, cy, 180 + glowPulse * 20);
    grad1.addColorStop(0, `rgba(242, 181, 77, ${0.06 + glowPulse * 0.06})`);
    grad1.addColorStop(0.5, `rgba(242, 181, 77, ${0.03 + glowPulse * 0.03})`);
    grad1.addColorStop(1, 'rgba(242, 181, 77, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, H);

    // Inner silver glow (offset)
    const grad2 = ctx.createRadialGradient(cx, cy - 10, 20, cx, cy - 10, 140 + glowPulse2 * 15);
    grad2.addColorStop(0, `rgba(200, 208, 216, ${0.04 + glowPulse2 * 0.04})`);
    grad2.addColorStop(0.6, `rgba(200, 208, 216, ${0.02 + glowPulse2 * 0.02})`);
    grad2.addColorStop(1, 'rgba(200, 208, 216, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);

    // --- Rotating energy arcs ---
    for (let a = 0; a < 3; a++) {
      const arcAngle = time * (0.3 + a * 0.15) + a * 2.1;
      const arcR = 100 + a * 30 + Math.sin(time * 0.8 + a) * 10;
      const sweep = 0.8 + Math.sin(time * 0.5 + a) * 0.3;
      const arcPulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2 + a * 1.5));
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, arcAngle, arcAngle + sweep);
      ctx.strokeStyle = a % 2 === 0
        ? `rgba(242, 181, 77, ${0.12 * arcPulse})`
        : `rgba(200, 208, 216, ${0.10 * arcPulse})`;
      ctx.lineWidth = 1.5 + Math.sin(time + a) * 0.5;
      ctx.stroke();
    }

    // --- Orbiting particles with trails ---
    orbiters.forEach(o => {
      o.angle += o.speed;
      o.pulse += 0.03;
      const wobble = Math.sin(time * 1.5 + o.pulse) * 8;
      const px = cx + Math.cos(o.angle) * (o.radius + wobble);
      const py = cy + Math.sin(o.angle) * (o.radius + wobble) * 0.85; // elliptical

      // Trail
      o.trail.push({ x: px, y: py });
      if (o.trail.length > 8) o.trail.shift();

      // Draw trail
      for (let t = 0; t < o.trail.length - 1; t++) {
        const alpha = (t / o.trail.length) * 0.3;
        ctx.beginPath();
        ctx.arc(o.trail[t].x, o.trail[t].y, o.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // Main particle
      const pulse = 0.6 + 0.4 * Math.sin(o.pulse * 3);
      ctx.beginPath();
      ctx.arc(px, py, o.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = o.color;
      ctx.globalAlpha = 0.7 + pulse * 0.3;
      ctx.fill();

      // Glow
      if (o.size > 2.5) {
        ctx.beginPath();
        ctx.arc(px, py, o.size * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.globalAlpha = 0.08 + pulse * 0.06;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    // --- Trigger burst explosions ---
    if (burstTimer >= BURST_INTERVAL) {
      burstTimer = 0;
      // Burst from random edge of portrait area
      const bAngle = Math.random() * Math.PI * 2;
      const bR = 80 + Math.random() * 40;
      const bx = cx + Math.cos(bAngle) * bR;
      const by = cy + Math.sin(bAngle) * bR * 0.85;
      bursts.push(createBurst(bx, by));
    }

    // --- Draw burst particles ---
    for (let b = bursts.length - 1; b >= 0; b--) {
      const burst = bursts[b];
      let alive = false;
      for (let i = burst.particles.length - 1; i >= 0; i--) {
        const p = burst.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.014;

        if (p.life <= 0) {
          burst.particles.splice(i, 1);
          continue;
        }
        alive = true;
        const ratio = p.life / p.maxLife;

        // Bright glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3 * ratio, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.12 * ratio;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * ratio, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9 * ratio;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (!alive) bursts.splice(b, 1);
    }

    animId = requestAnimationFrame(draw);
  }

  // Pause/resume on visibility change — iOS Safari throttles rAF when backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      if (!animId) { animId = requestAnimationFrame(draw); }
    }
  });

  window.addEventListener('resize', resize);
  init();
  draw();
})();
