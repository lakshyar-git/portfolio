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

  // Scroll velocity & cursor tracking
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let scrollTimeout;

  let mouseNormX = 0; // -1 to 1
  let mouseNormY = 0; // -1 to 1
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Elegant, serene cosmic starlight palette
  const starColors = [
    'rgba(241, 245, 249, ',  // Crisp Starlight
    'rgba(226, 232, 240, ',  // Soft Slate Silver
    'rgba(199, 210, 254, ',  // Gentle Lavender Ice
    'rgba(186, 230, 253, '   // Soft Pale Sky
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
    const count = Math.floor((width * height) / 11000);
    const starCount = Math.min(Math.max(count, 70), 120);

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 (far) to 1.0 (near)
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        radius: (Math.random() * 0.95 + 0.35) * depth,
        baseAlpha: (Math.random() * 0.35 + 0.30) * depth,
        twinkleSpeed: (Math.random() * 0.012 + 0.005),
        twinkleOffset: Math.random() * Math.PI * 2,
        colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
        baseSpeedY: -(Math.random() * 0.12 + 0.04) * depth,
        speedX: (Math.random() - 0.5) * 0.04 * depth
      });
    }
  }

  // Scroll listener tracking velocity and direction
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    scrollVelocity += delta * 0.03;
    scrollVelocity = Math.max(Math.min(scrollVelocity, 4), -4);

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

    // Smooth cursor interpolation
    mouseNormX += (targetMouseX - mouseNormX) * 0.04;
    mouseNormY += (targetMouseY - mouseNormY) * 0.04;

    // Decay scroll velocity towards zero
    scrollVelocity *= 0.94;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Dynamic Y movement: serene drift + gentle scroll response
      const currentSpeedY = s.baseSpeedY - (scrollVelocity * s.depth * 0.6);
      s.y += currentSpeedY * dt;

      // Parallax shift from cursor
      s.x += (s.speedX - (mouseNormX * 0.12 * s.depth)) * dt;

      // Wrap-around screen bounds
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;
      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;

      // Gentle, soothing starlight twinkle (calm breathing)
      s.twinkleOffset += s.twinkleSpeed * dt;
      const alpha = s.baseAlpha + Math.sin(s.twinkleOffset) * 0.14;
      const clampedAlpha = Math.max(0.15, Math.min(0.85, alpha));

      // Draw star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.colorPrefix + clampedAlpha + ')';
      ctx.fill();

      // Soft ambient aura for prominent stars
      if (s.radius > 0.8) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = s.colorPrefix + (clampedAlpha * 0.22) + ')';
        ctx.fill();
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
  }, { passive: true });

  resizeCanvas();
  animationFrameId = requestAnimationFrame(animate);
})();
