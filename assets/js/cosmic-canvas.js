/**
 * Cosmic Starfield & Interactive Ripple/Droplet Canvas System
 * Lakshya R - Portfolio
 * 
 * Features:
 * 1. Background Starfield (#cosmic-canvas):
 *    - Ambient starfield with depth parallax, twinkling, and hyperspace scroll drift
 * 2. High-Visibility Fluid Ripple & Stardust Trail (#ripple-canvas):
 *    - Dynamic water-ripple / dripple wave front following cursor movement
 *    - Dual concentric harmonic rings in electric cyan and cosmic nebula violet
 *    - Trailing stardust droplets with physical inertia and glow
 *    - Click / tap burst ripple wave
 *    - Hardware-accelerated 60 FPS with auto-pause on inactive tab
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const starCanvas = document.getElementById('cosmic-canvas');
  const rippleCanvas = document.getElementById('ripple-canvas');
  if (!starCanvas) return;

  const starCtx = starCanvas.getContext('2d');
  const rippleCtx = rippleCanvas ? rippleCanvas.getContext('2d') : null;

  let animationFrameId;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ---------------------------------------------------------------------------
  // 1. Starfield State
  // ---------------------------------------------------------------------------
  let stars = [];
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let scrollTimeout;

  let mouseNormX = 0; // -1 to 1
  let mouseNormY = 0; // -1 to 1
  let targetMouseX = 0;
  let targetMouseY = 0;

  const starColors = [
    'rgba(241, 245, 249, ', // Crisp Starlight White
    'rgba(139, 92, 246, ',  // Soft Nebula Violet
    'rgba(56, 189, 248, ',  // Electric Cyan
    'rgba(219, 234, 254, '   // Soft Ice
  ];

  function initStars() {
    stars = [];
    const count = Math.floor((width * height) / 11000);
    const starCount = Math.min(Math.max(count, 55), 115);

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() * 0.8 + 0.2;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        radius: (Math.random() * 1.3 + 0.3) * depth,
        baseAlpha: (Math.random() * 0.5 + 0.2) * depth,
        twinkleSpeed: (Math.random() * 0.02 + 0.008),
        twinkleOffset: Math.random() * Math.PI * 2,
        colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
        baseSpeedY: -(Math.random() * 0.18 + 0.05) * depth,
        speedX: (Math.random() - 0.5) * 0.06 * depth
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. High-Visibility Fluid Ripple & Stardust Droplet System
  // ---------------------------------------------------------------------------
  const ripples = [];
  const droplets = [];

  let lastCursorX = -1000;
  let lastCursorY = -1000;
  let lastMoveTime = performance.now();
  let colorCycle = 0;

  const RIPPLE_COLORS = [
    { rgb: '56, 189, 248', glow: 'rgba(56, 189, 248, 0.9)' },  // Electric Cyan
    { rgb: '139, 92, 246', glow: 'rgba(139, 92, 246, 0.9)' },  // Cosmic Violet
    { rgb: '99, 102, 241', glow: 'rgba(99, 102, 241, 0.9)' },  // Indigo Blue
    { rgb: '168, 85, 247', glow: 'rgba(168, 85, 247, 0.9)' }   // Orchid
  ];

  function spawnRipple(x, y, speed, isBurst = false) {
    if (ripples.length > 32) ripples.shift();

    colorCycle = (colorCycle + 1) % RIPPLE_COLORS.length;
    const colorObj = RIPPLE_COLORS[colorCycle];

    const baseRadius = isBurst ? 8 : 4;
    const maxRadius = isBurst ? 90 : Math.min(30 + speed * 20, 68);
    const growth = isBurst ? 3.2 : (1.4 + Math.min(speed * 1.1, 2.8));

    ripples.push({
      x: x,
      y: y,
      radius: baseRadius,
      maxRadius: maxRadius,
      growth: growth,
      opacity: isBurst ? 0.95 : 0.85,
      fadeRate: isBurst ? 0.018 : 0.024,
      lineWidth: isBurst ? 3.0 : Math.min(2.4 + speed * 0.5, 3.2),
      color: colorObj.rgb,
      glow: colorObj.glow
    });
  }

  function spawnDroplets(x, y, dx, dy, speed, isBurst = false) {
    const count = isBurst ? 10 : Math.min(Math.floor(speed * 1.6) + 1, 3);

    for (let i = 0; i < count; i++) {
      if (droplets.length > 50) droplets.shift();

      // Inertia: particles trail behind the cursor movement
      const spreadAngle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.3;
      const particleSpeed = isBurst ? (Math.random() * 3.5 + 1.2) : (Math.random() * 1.6 + 0.4);
      const colorObj = RIPPLE_COLORS[Math.floor(Math.random() * RIPPLE_COLORS.length)];

      droplets.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(spreadAngle) * particleSpeed,
        vy: Math.sin(spreadAngle) * particleSpeed,
        radius: Math.random() * 2.2 + 1.2,
        alpha: 0.9,
        decay: Math.random() * 0.028 + 0.02,
        color: colorObj.rgb,
        glow: colorObj.glow
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Pointer & Interaction Tracking
  // ---------------------------------------------------------------------------
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  window.addEventListener('pointermove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    targetMouseX = (x / width - 0.5) * 2;
    targetMouseY = (y / height - 0.5) * 2;

    if (!isFinePointer) return;

    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    const dx = x - lastCursorX;
    const dy = y - lastCursorY;
    const dist = Math.hypot(dx, dy);

    // Spawn water-ripple whenever the cursor travels a short distance
    if (dist > 14) {
      const speed = dist / dt;
      spawnRipple(x, y, speed, false);
      spawnDroplets(x, y, dx, dy, speed, false);

      lastCursorX = x;
      lastCursorY = y;
      lastMoveTime = now;
    }
  }, { passive: true });

  // Burst ripple on pointer tap/click for satisfying feedback
  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input, textarea')) return;
    spawnRipple(e.clientX, e.clientY, 2, true);
    spawnDroplets(e.clientX, e.clientY, 0, 0, 2, true);
  }, { passive: true });

  // Scroll listener tracking velocity and hyperspace drift
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    scrollVelocity += delta * 0.04;
    scrollVelocity = Math.max(Math.min(scrollVelocity, 6), -6);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrollVelocity = 0;
    }, 150);
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 4. Resize Canvas
  // ---------------------------------------------------------------------------
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    starCanvas.width = width * dpr;
    starCanvas.height = height * dpr;
    starCanvas.style.width = width + 'px';
    starCanvas.style.height = height + 'px';
    starCtx.scale(dpr, dpr);

    if (rippleCanvas && rippleCtx) {
      rippleCanvas.width = width * dpr;
      rippleCanvas.height = height * dpr;
      rippleCanvas.style.width = width + 'px';
      rippleCanvas.style.height = height + 'px';
      rippleCtx.scale(dpr, dpr);
    }

    initStars();
  }

  // ---------------------------------------------------------------------------
  // 5. Main Animation Loop
  // ---------------------------------------------------------------------------
  let lastTime = 0;

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 16, 2);
    lastTime = timestamp;

    // Smooth cursor interpolation for parallax
    mouseNormX += (targetMouseX - mouseNormX) * 0.05;
    mouseNormY += (targetMouseY - mouseNormY) * 0.05;

    // Decay scroll velocity towards zero
    scrollVelocity *= 0.94;

    // A. Clear and Render Starfield (#cosmic-canvas)
    starCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      const currentSpeedY = s.baseSpeedY - (scrollVelocity * s.depth * 0.8);
      s.y += currentSpeedY * dt;
      s.x += (s.speedX - (mouseNormX * 0.15 * s.depth)) * dt;

      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;
      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;

      s.twinkleOffset += s.twinkleSpeed * dt;
      const alpha = s.baseAlpha + Math.sin(s.twinkleOffset) * 0.25;
      const clampedAlpha = Math.max(0.08, Math.min(0.9, alpha));

      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      starCtx.fillStyle = s.colorPrefix + clampedAlpha + ')';
      starCtx.fill();

      if (s.radius > 1.0) {
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.radius * 2.4, 0, Math.PI * 2);
        starCtx.fillStyle = s.colorPrefix + (clampedAlpha * 0.25) + ')';
        starCtx.fill();
      }
    }

    // B. Clear and Render Fluid Water-Ripples & Droplets (#ripple-canvas)
    if (rippleCtx) {
      rippleCtx.clearRect(0, 0, width, height);

      // Render Expanding Ripple Rings (Water Dripple Wave)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.growth * dt;
        r.opacity -= r.fadeRate * dt;
        r.lineWidth = Math.max(0.6, r.lineWidth * 0.97);

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // 1. Primary Outer Ripple Ring with Glow
        rippleCtx.save();
        rippleCtx.beginPath();
        rippleCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        rippleCtx.strokeStyle = `rgba(${r.color}, ${r.opacity})`;
        rippleCtx.lineWidth = r.lineWidth;
        rippleCtx.shadowColor = r.glow;
        rippleCtx.shadowBlur = 10;
        rippleCtx.stroke();

        // 2. Secondary Harmonic Wave (Realistic Water Droplet Echo)
        if (r.radius > 8) {
          rippleCtx.beginPath();
          rippleCtx.arc(r.x, r.y, r.radius * 0.58, 0, Math.PI * 2);
          rippleCtx.strokeStyle = `rgba(${r.color}, ${r.opacity * 0.45})`;
          rippleCtx.lineWidth = Math.max(0.5, r.lineWidth * 0.65);
          rippleCtx.shadowBlur = 5;
          rippleCtx.stroke();
        }
        rippleCtx.restore();
      }

      // Render Trailing Stardust Droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= 0.96;
        d.vy *= 0.96;
        d.alpha -= d.decay * dt;

        if (d.alpha <= 0) {
          droplets.splice(i, 1);
          continue;
        }

        rippleCtx.save();
        rippleCtx.beginPath();
        rippleCtx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        rippleCtx.fillStyle = `rgba(${d.color}, ${d.alpha})`;
        rippleCtx.shadowColor = d.glow;
        rippleCtx.shadowBlur = 8;
        rippleCtx.fill();
        rippleCtx.restore();
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Handle tab visibility to pause rendering
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      lastTime = 0;
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  // Debounced resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  });

  resizeCanvas();
  animationFrameId = requestAnimationFrame(animate);
})();
