document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Toggle (English <-> Hindi)
  const htmlEl = document.documentElement;
  const langBtn = document.querySelector('.rjm-lang');
  
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English';
      
      const rjmDiv = document.querySelector('.rjm');
      if (rjmDiv) {
        rjmDiv.setAttribute('data-lang', nextLang);
      }
    });
  }

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.rjm-nav-toggle');
  const navLinks = document.getElementById('rjm-menu');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });
  }

  // 3. GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // --- A. Hero Royal Gate 3D Door Opening & Zoom ---
    const heroSection = document.querySelector('.rjm-hero');
    const leafLeft = document.querySelector('.rjm-hero .rjm-leaf-l');
    const leafRight = document.querySelector('.rjm-hero .rjm-leaf-r');
    const gateScene = document.querySelector('.rjm-hero .rjm-gate-scene');
    const gateGlow = document.querySelector('.rjm-hero .rjm-gate-glow');
    const heroCopy = document.querySelector('.rjm-hero-copy');
    const cue = document.querySelector('.rjm-cue');

    if (heroSection && leafLeft && leafRight && gateScene) {
      const gateTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' }
      });

      gateTimeline
        .to(leafLeft, { rotationY: 78, duration: 0.55, ease: 'power2.inOut' }, 0)
        .to(leafRight, { rotationY: -78, duration: 0.55, ease: 'power2.inOut' }, 0)
        .to([leafLeft, leafRight], { autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, 0.35)
        .to(gateGlow, { autoAlpha: 1, duration: 0.45, ease: 'power1.out' }, 0.12)
        .fromTo(gateScene, 
          { scale: 1 }, 
          { scale: isMobile ? 1.75 : 2.45, transformOrigin: '53% 58%', duration: 1, ease: 'power1.in' }, 
          0
        )
        .to(heroCopy, { autoAlpha: 0, y: -36, duration: 0.3, ease: 'power1.in' }, 0.04)
        .to(cue, { autoAlpha: 0, duration: 0.12 }, 0);
    }

    // --- B. Palace & Peacock Parallax ---
    const palaceWrap = document.querySelector('.rjm-palace-wrap');
    if (palaceWrap) {
      const palaceImg = palaceWrap.querySelector('.rjm-palace .rjm-para-img');
      const peacockImg = palaceWrap.querySelector('.rjm-peacock-side .rjm-para-img');
      
      if (palaceImg) {
        gsap.fromTo(palaceImg, 
          { yPercent: 0 }, 
          { yPercent: isMobile ? -5 : -12, ease: 'none', scrollTrigger: { trigger: palaceWrap, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      }
      if (peacockImg) {
        gsap.fromTo(peacockImg, 
          { yPercent: 0 }, 
          { yPercent: isMobile ? -8 : -18, ease: 'none', scrollTrigger: { trigger: palaceWrap, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      }
    }

    // --- C. Couple Jharokha Parallax ---
    const coupleSection = document.querySelector('.rjm-couple');
    const jharokha = document.querySelector('.rjm-jharokha');
    if (coupleSection && jharokha) {
      const offset = isMobile ? 3 : 6;
      gsap.fromTo(jharokha, 
        { yPercent: offset }, 
        { yPercent: -offset, ease: 'none', scrollTrigger: { trigger: coupleSection, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    }

    // --- D. ELEPHANT PROCESSION MOTION (HATHI MOTION) ---
    const procession = document.querySelector('.rjm-procession');
    const elephLeft = document.querySelector('.rjm-eleph-l');
    const elephRight = document.querySelector('.rjm-eleph-r');

    if (procession && elephLeft && elephRight) {
      const travel = isMobile ? 18 : 36;
      const elephTrigger = {
        trigger: procession,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      };

      // Left elephant walks into view towards center/right
      gsap.fromTo(elephLeft, 
        { xPercent: -travel }, 
        { xPercent: travel, ease: 'none', scrollTrigger: elephTrigger }
      );

      // Right elephant walks into view towards center/left
      gsap.fromTo(elephRight, 
        { xPercent: travel }, 
        { xPercent: -travel, ease: 'none', scrollTrigger: elephTrigger }
      );
    }

    // --- E. Timeline Scroll Progress Line ---
    const timelineEl = document.querySelector('.rjm-timeline');
    const timelineFill = document.querySelector('.rjm-timeline-fill');
    if (timelineEl && timelineFill) {
      gsap.fromTo(timelineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineEl,
            start: 'top 70%',
            end: 'bottom 55%',
            scrub: 0.5
          }
        }
      );
    }

    // --- F. Event Cards Arch Glow Reveal ---
    const eventGrid = document.querySelector('.rjm-events-grid');
    const eventArches = document.querySelectorAll('.rjm-event-arch');
    if (eventGrid && eventArches.length) {
      gsap.fromTo(eventArches,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: eventGrid,
            start: 'top 76%',
            once: true
          }
        }
      );
    }

    // --- G. RSVP 2nd Gate 3D Door Opening on Scroll ---
    const rsvpGate = document.querySelector('.rjm-rsvp-gate');
    if (rsvpGate) {
      const rsvpLeaves = rsvpGate.querySelectorAll('.rjm-leaf');
      const rsvpLeafL = rsvpGate.querySelector('.rjm-leaf-l');
      const rsvpLeafR = rsvpGate.querySelector('.rjm-leaf-r');
      const rsvpGlow = rsvpGate.querySelector('.rjm-gate-glow');

      if (rsvpLeafL && rsvpLeafR) {
        gsap.timeline({
          scrollTrigger: {
            trigger: rsvpGate,
            start: 'top 78%',
            once: true
          }
        })
        .to(rsvpLeafL, { rotationY: 72, duration: 1.4, ease: 'power3.inOut' }, 0)
        .to(rsvpLeafR, { rotationY: -72, duration: 1.4, ease: 'power3.inOut' }, 0)
        .to(rsvpLeaves, { autoAlpha: 0, duration: 0.7, ease: 'power1.in' }, 0.85)
        .to(rsvpGlow, { autoAlpha: 1, duration: 1.1 }, 0.3);
      }
    }
  }

  // 4. Scroll Reveal Intersection Observer (for content cards & headers)
  const revealElements = document.querySelectorAll('[data-tw-reveal="true"]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // 5. Live Wedding Countdown
  function getTargetDate() {
    if (window.LIVE_TARGET_DATE_MS) return window.LIVE_TARGET_DATE_MS;
    if (window.WEDDING_CONFIG && window.WEDDING_CONFIG.weddingDate) {
      const parsed = Date.parse(window.WEDDING_CONFIG.weddingDate);
      if (!isNaN(parsed) && parsed > Date.now()) return parsed;
    }
    return new Date('2026-12-03T18:30:00+05:30').getTime();
  }
  const countNums = document.querySelectorAll('.rjm-count-cell .rjm-count-num');

  function updateCountdown() {
    const targetDate = getTargetDate();
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    if (countNums.length >= 4) {
      countNums[0].textContent = pad(days);
      countNums[1].textContent = pad(hours);
      countNums[2].textContent = pad(minutes);
      countNums[3].textContent = pad(seconds);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 6. Interactive RSVP System handled by shared-rsvp.js

  // 7. Toast Helper
  function showToast(message) {
    let toast = document.querySelector('.rjm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'rjm-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 8. Smooth Scroll for "Step inside" button
  const stepInsideBtn = document.querySelector('.rjm-hero-cta');
  if (stepInsideBtn) {
    stepInsideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#invitation');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // =================================================
  // ===================================================
  
  // ===================================================
  
  // ===================================================
  
  // ===================================================
  
  // ===================================================
  
  // ===================================================
  // 9. SILENT BACKGROUND MUSIC PLAYER (No notifications/text)
  // ===================================================
  const musicBtn = document.getElementById('rjm-music-toggle');
  const audioEl = document.getElementById('wedding-audio');
  let isAudioPlaying = false;

  window.rjmForcePlayAudio = function() {
    if (!audioEl) return;
    audioEl.volume = 0.85;
    audioEl.loop = true;
    
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioPlaying = true;
        if (musicBtn) musicBtn.classList.add('is-playing');
      }).catch(err => {
        // Silent catch
      });
    }
  };

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    isAudioPlaying = false;
    if (musicBtn) musicBtn.classList.remove('is-playing');
  }

  function toggleMusic() {
    if (!audioEl) return;
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      window.rjmForcePlayAudio();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  if (audioEl) {
    audioEl.addEventListener('play', () => {
      isAudioPlaying = true;
      if (musicBtn) musicBtn.classList.add('is-playing');
    });

    audioEl.addEventListener('pause', () => {
      isAudioPlaying = false;
      if (musicBtn) musicBtn.classList.remove('is-playing');
    });

    audioEl.addEventListener('ended', () => {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    });
  }

  // Global unlock on ANY user touch, click, scroll or tap silently
  const globalTriggers = ['pointerdown', 'touchstart', 'mousedown', 'click', 'scroll', 'wheel', 'keydown'];
  function globalUnlockHandler() {
    if (!isAudioPlaying) {
      window.rjmForcePlayAudio();
    }
  }

  globalTriggers.forEach(evt => {
    window.addEventListener(evt, globalUnlockHandler, { passive: true });
    document.addEventListener(evt, globalUnlockHandler, { passive: true });
  });

  // Attempt instant play immediately on page load
  window.rjmForcePlayAudio();

  // Also hook into the "Step inside" button
  const ctaBtn = document.querySelector('.rjm-hero-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.rjmForcePlayAudio();
    });
  }

});