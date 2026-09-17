/**
 * Cosmic Portfolio - Dynamic & Interactive Controller (Lakshya R)
 * Features:
 * - 3D Perspective Card Tilt with Dynamic Cursor Spotlight Sheen
 * - Directional Scroll Reveal Observer (Slide in from Left, Right, Up, Down)
 * - Top Scroll Progress Bar (Responsive to scroll position)
 * - Micro-interaction "Pop" on hover for icons, buttons, and skill chips
 * - Smooth Lerp Cursor Glow Tracker
 * - Project category filtering with smooth enter/exit animations
 * - Project Case Study modal drawer
 * - One-click email copy to clipboard
 * - Interactive contact form with toast notification
 * - Mobile menu toggle and active scrollspy
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Scroll Progress Bar & Directional Tracking
  // -------------------------------------------------------------------------
  const scrollProgressBar = document.getElementById('scroll-progress');
  let lastScrollPos = window.scrollY;

  const updateScrollProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // -------------------------------------------------------------------------
  // 2. Cursor Glow Tracker (Desktop Pointer Only)
  // -------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = -500, mouseY = -500;
    let currentX = -500, currentY = -500;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const renderGlow = () => {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      cursorGlow.style.setProperty('--mouse-x', `${currentX}px`);
      cursorGlow.style.setProperty('--mouse-y', `${currentY}px`);

      requestAnimationFrame(renderGlow);
    };
    renderGlow();
  }

  // -------------------------------------------------------------------------
  // 3. 3D Perspective Tilt & Dynamic Spotlight on Cards
  // -------------------------------------------------------------------------
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const tiltCards = document.querySelectorAll('.tilt-card');

  if (isFinePointer) {
    tiltCards.forEach(card => {
      // Ensure spotlight overlay exists
      if (!card.querySelector('.spotlight-overlay')) {
        const spotlight = document.createElement('div');
        spotlight.className = 'spotlight-overlay';
        spotlight.setAttribute('aria-hidden', 'true');
        card.prepend(spotlight);
      }

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Position for spotlight radial gradient
        card.style.setProperty('--card-mouse-x', `${x}px`);
        card.style.setProperty('--card-mouse-y', `${y}px`);

        // Calculate 3D tilt angles (-8deg to +8deg)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });

      card.addEventListener('pointerenter', () => {
        card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease';
      });
    });
  }

  // -------------------------------------------------------------------------
  // 4. Directional Scroll Reveal Observer (Slide in Left/Right/Up/Down)
  // -------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-init');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // -------------------------------------------------------------------------
  // 5. Mobile Navigation Toggle
  // -------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------------------------------------------------------------------------
  // 6. Project Filtering Logic with Micro-Pop
  // -------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterButtons.forEach(b => {
        b.classList.remove('active', 'bg-nebula/20', 'border-nebula/60', 'text-starlight');
        b.classList.add('border-white/10', 'text-cosmic-grey', 'hover:border-white/20');
      });

      btn.classList.add('active', 'bg-nebula/20', 'border-nebula/60', 'text-starlight');
      btn.classList.remove('border-white/10', 'text-cosmic-grey');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        const match = filter === 'all' || categories.split(' ').includes(filter);

        if (match) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px) scale(0.96)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 7. Case Study Modal Data & Handlers (Lakshya's Projects)
  // -------------------------------------------------------------------------
  const caseStudyModal = document.getElementById('case-study-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const openCaseStudyBtns = document.querySelectorAll('.open-case-study');

  const caseStudies = {
    'predictive-maintenance': {
      title: 'Predictive Maintenance of Industrial Machinery',
      category: 'Machine Learning & Cloud · Python, Random Forest, IBM Cloud',
      overview: 'Engineered an intelligent predictive maintenance framework utilizing real-time multi-sensor telemetry to forecast component breakdown prior to physical failure.',
      problem: 'Unscheduled industrial machinery downtime causes substantial operational losses and safety hazards when wear-and-tear is detected reactively.',
      solution: 'Trained and tuned a Random Forest ensemble model to identify non-linear vibration, temperature, and pressure anomalies from live sensor telemetry. Packaged and deployed inference endpoints seamlessly onto IBM Cloud.',
      metrics: [
        { label: 'Model Architecture', val: 'Random Forest' },
        { label: 'Cloud Host', val: 'IBM Cloud' },
        { label: 'Target', val: 'Zero Downtime' }
      ],
      githubUrl: 'https://github.com/lakshyar-git',
      demoUrl: 'https://example.com'
    },
    'smart-plant-iot': {
      title: 'IoT-Based Smart Plant Maintenance & Watering System',
      category: 'Embedded Systems & IoT · Arduino IDE, Blynk IoT, Sensors',
      overview: 'Comprehensive autonomous agricultural ecosystem monitoring soil moisture, ambient temperature, humidity, and animal movement with automated irrigation scheduling.',
      problem: 'Inconsistent manual watering and undetected animal intrusion in greenhouse and home garden environments lead to plant degradation and excessive water wastage.',
      solution: 'Integrated multi-sensor hardware arrays with Arduino microcontrollers and configured automated relay water pumps triggered by dynamic soil-moisture thresholds. Deployed live telemetry streaming to an interactive Blynk IoT mobile dashboard.',
      metrics: [
        { label: 'Telemetry', val: '4 Sensor Types' },
        { label: 'Platform', val: 'Blynk IoT' },
        { label: 'Automation', val: '100% Closed-Loop' }
      ],
      githubUrl: 'https://github.com/lakshyar-git',
      demoUrl: 'https://example.com'
    },
    'first-aid-voice': {
      title: 'AI-Driven Voice-Based First Aid Assistant',
      category: 'Artificial Intelligence · Python, Speech Recognition, TTS',
      overview: 'A hands-free emergency audio copilot providing rapid, voice-guided first-aid instructions during critical medical emergencies.',
      problem: 'During trauma or medical emergencies, individuals cannot safely hold phones or browse text-heavy websites while administering first aid or CPR.',
      solution: 'Developed an acoustic speech-to-text processing loop in Python integrated with natural language decision trees and low-latency text-to-speech synthesis for clear, step-by-step vocal instructions.',
      metrics: [
        { label: 'Interaction', val: '100% Hands-Free' },
        { label: 'Audio Engine', val: 'Speech-to-Text' },
        { label: 'Response Time', val: 'Sub-second' }
      ],
      githubUrl: 'https://github.com/lakshyar-git',
      demoUrl: 'https://example.com'
    }
  };

  const openModal = (projectId) => {
    const data = caseStudies[projectId];
    if (!data || !caseStudyModal) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-overview').textContent = data.overview;
    document.getElementById('modal-problem').textContent = data.problem;
    document.getElementById('modal-solution').textContent = data.solution;

    const metricsContainer = document.getElementById('modal-metrics');
    metricsContainer.innerHTML = data.metrics.map(m => `
      <div class="glass-panel-subtle rounded-xl p-3 text-center pop-hover">
        <div class="text-xl font-bold font-heading text-starlight">${m.val}</div>
        <div class="text-xs text-cosmic-grey mt-0.5">${m.label}</div>
      </div>
    `).join('');



    const modalGithub = document.getElementById('modal-github');
    if (modalGithub) modalGithub.href = data.githubUrl || 'https://github.com/lakshyar-git';

    caseStudyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!caseStudyModal) return;
    caseStudyModal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  openCaseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-project');
      openModal(id);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal && !caseStudyModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // -------------------------------------------------------------------------
  // 8. One-Click Email Copy with Toast Alert
  // -------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');

  const showToast = (message, isSuccess = true) => {
    if (!toast) return;
    const toastMsg = document.getElementById('toast-message');
    if (toastMsg) toastMsg.textContent = message;

    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 350);
    }, 3500);
  };

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'lakshyar13@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = copyEmailBtn.innerHTML;
        copyEmailBtn.innerHTML = `
          <svg class="w-4 h-4 text-green-400 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Copied!
        `;
        showToast('Email address copied to your clipboard: ' + email);
        setTimeout(() => {
          copyEmailBtn.innerHTML = originalText;
        }, 2500);
      } catch (err) {
        showToast('Please copy: ' + email);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 9. Interactive Contact Form Handler
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  if (contactForm && formSubmitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', false);
        return;
      }

      const originalContent = formSubmitBtn.innerHTML;
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Transmitting Signal...
      `;

      setTimeout(() => {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = originalContent;
        contactForm.reset();
        showToast(`Thank you, ${name}! Your transmission has been sent to Lakshya.`);
      }, 1200);
    });
  }

  // -------------------------------------------------------------------------
  // 10. Active Scrollspy for Navigation Links
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('text-nebula', 'font-medium');
            link.classList.remove('text-cosmic-grey');
          } else {
            link.classList.remove('text-nebula', 'font-medium');
            link.classList.add('text-cosmic-grey');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
});
