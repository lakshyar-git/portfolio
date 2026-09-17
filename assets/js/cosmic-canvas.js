/**
 * Cosmic Starfield Canvas (Dynamic & Interactive)
 * - Responds to scroll speed & direction (hyperspace drift)
 * - Responds to cursor movement across the viewport (depth parallax)
 * - Ultra-low CPU/GPU consumption with auto-pause on inactive tab
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;
  let stars = [];
  let shootingStars = [];
  let lastShootingStarTime = 0;

  // Scroll velocity & cursor tracking
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let scrollTimeout;

  let mouseNormX = 0; // -1 to 1
  let mouseNormY = 0; // -1 to 1
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Vivid cosmic palette for celestial objects
  const starColors = [
    'rgba(255, 255, 255, ',  // Pure Diamond Starlight
    'rgba(240, 245, 255, ',  // Bright White-Ice
    'rgba(196, 181, 253, ',  // Radiant Violet / Lavender
    'rgba(147, 197, 253, ',  // Sky Blue
    'rgba(124, 92, 252, ',   // Deep Nebula Purple
    'rgba(56, 189, 248, '    // Electric Cyan
  ];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.floor((width * height) / 6000);
    const starCount = Math.min(Math.max(count, 130), 260);

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 (far) to 1.0 (near)
      const hasSparkle = Math.random() < 0.18; // 18% of stars have radiant 4-point sparkle flare
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        radius: (Math.random() * 1.5 + 0.5) * depth,
        baseAlpha: (Math.random() * 0.4 + 0.45) * depth,
        twinkleSpeed: (Math.random() * 0.025 + 0.012),
        twinkleOffset: Math.random() * Math.PI * 2,
        colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
        baseSpeedY: -(Math.random() * 0.22 + 0.06) * depth,
        speedX: (Math.random() - 0.5) * 0.08 * depth,
        hasSparkle: hasSparkle,
        sparkleSize: (Math.random() * 4 + 3) * depth
      });
    }
  }

  function spawnShootingStar() {
    if (shootingStars.length >= 2) return;
    const startX = Math.random() * (width * 0.75) + (width * 0.1);
    const startY = Math.random() * (height * 0.35);
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25; // ~45 deg downward trajectory
    const speed = Math.random() * 10 + 13;
    shootingStars.push({
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: Math.random() * 75 + 65,
      life: 1.0,
      decay: Math.random() * 0.016 + 0.012,
      color: Math.random() > 0.4 ? 'rgba(196, 181, 253, ' : 'rgba(56, 189, 248, '
    });
  }

  // Scroll listener tracking velocity and direction
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Apply impulse to scroll velocity (hyperspace acceleration)
    scrollVelocity += delta * 0.045;
    scrollVelocity = Math.max(Math.min(scrollVelocity, 7), -7);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrollVelocity = 0;
    }, 150);
  }, { passive: true });

  // Mouse move parallax listener
  window.addEventListener('pointermove', (e) => {
    targetMouseX = (e.clientX / width - 0.5) * 2;
    targetMouseY = (e.clientY / height - 0.5) * 2;
  }, { passive: true });

  let lastTime = 0;
  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 16, 2);
    lastTime = timestamp;

    // Periodic shooting stars (every 4-7 seconds)
    if (timestamp - lastShootingStarTime > 4200 + Math.random() * 3000) {
      spawnShootingStar();
      lastShootingStarTime = timestamp;
    }

    // Smooth cursor interpolation
    mouseNormX += (targetMouseX - mouseNormX) * 0.06;
    mouseNormY += (targetMouseY - mouseNormY) * 0.06;

    // Decay scroll velocity towards zero
    scrollVelocity *= 0.93;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw and update stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Dynamic Y movement: base drift + scroll reaction (accelerates in scroll direction)
      const currentSpeedY = s.baseSpeedY - (scrollVelocity * s.depth * 0.85);
      s.y += currentSpeedY * dt;

      // Parallax shift from cursor
      s.x += (s.speedX - (mouseNormX * 0.2 * s.depth)) * dt;

      // Wrap-around screen bounds
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;
      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;

      // Pulsing starlight twinkle (Brightened)
      s.twinkleOffset += s.twinkleSpeed * dt;
      const alpha = s.baseAlpha + Math.sin(s.twinkleOffset) * 0.32;
      const clampedAlpha = Math.max(0.25, Math.min(1.0, alpha));

      // Draw star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.colorPrefix + clampedAlpha + ')';
      ctx.fill();

      // Soft radiant aura for brighter/nearer stars
      if (s.radius > 0.75) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 3.0, 0, Math.PI * 2);
        ctx.fillStyle = s.colorPrefix + (clampedAlpha * 0.38) + ')';
        ctx.fill();
      }

      // Radiant 4-point cross sparkle flare on prominent stars
      if (s.hasSparkle && clampedAlpha > 0.55) {
        const flareSize = s.sparkleSize * (clampedAlpha * 0.9);
        ctx.strokeStyle = s.colorPrefix + (clampedAlpha * 0.45) + ')';
        ctx.lineWidth = 1;

        // Horizontal beam
        ctx.beginPath();
        ctx.moveTo(s.x - flareSize, s.y);
        ctx.lineTo(s.x + flareSize, s.y);
        ctx.stroke();

        // Vertical beam
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - flareSize);
        ctx.lineTo(s.x, s.y + flareSize);
        ctx.stroke();
      }
    }

    // 2. Draw and update shooting stars (meteors)
    for (let j = shootingStars.length - 1; j >= 0; j--) {
      const m = shootingStars[j];
      m.x += m.dx * dt;
      m.y += m.dy * dt;
      m.life -= m.decay * dt;

      if (m.life <= 0 || m.x > width || m.y > height) {
        shootingStars.splice(j, 1);
        continue;
      }

      const tailX = m.x - (m.dx / Math.hypot(m.dx, m.dy)) * m.length;
      const tailY = m.y - (m.dy / Math.hypot(m.dx, m.dy)) * m.length;

      const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      gradient.addColorStop(0, m.color + '0)');
      gradient.addColorStop(0.7, m.color + (m.life * 0.4) + ')');
      gradient.addColorStop(1, 'rgba(255, 255, 255, ' + (m.life * 0.95) + ')');

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Glowing head spark
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + m.life + ')';
      ctx.fill();
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
  }, { passive: true });

  resizeCanvas();
  animationFrameId = requestAnimationFrame(animate);
})();
