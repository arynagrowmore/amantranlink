document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Toggle (English <-> Hindi)
  const htmlEl = document.documentElement;
  const langBtns = document.querySelectorAll('.myr-lang, .rjm-lang, [data-lang-toggle]');
  
  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtns.forEach(btn => btn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English');
      
      const myrDiv = document.querySelector('.myr, .wsite');
      if (myrDiv) {
        myrDiv.setAttribute('data-lang', nextLang);
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.myr-nav-toggle, .rjm-nav-toggle');
  const navLinks = document.querySelector('.myr-nav-links, #myr-menu, #rjm-menu');

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

  
  // 3. Ultra-Smooth GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Smooth Hero Parallax with Lerp / Scrub: 1
    const heroScene = document.querySelector('.myr-scene, .myr-hero');
    if (heroScene) {
      const palaceFar = heroScene.querySelector('.myr-palace-far');
      const palace = heroScene.querySelector('.myr-palace');
      const peacockPlume = heroScene.querySelector('.myr-plume');

      if (palaceFar) {
        gsap.to(palaceFar, {
          yPercent: isMobile ? 10 : 18,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      if (palace) {
        gsap.to(palace, {
          yPercent: isMobile ? 16 : 28,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }

      if (peacockPlume) {
        gsap.to(peacockPlume, {
          scale: 1.08,
          opacity: 0.7,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }
    }

    // B. Smooth Story Timeline Golden Line Draw
    const timelineEl = document.querySelector('.myr-timeline, .rjm-timeline');
    const timelineFill = document.querySelector('.myr-timeline-fill, .rjm-timeline-fill');
    if (timelineEl && timelineFill) {
      gsap.fromTo(timelineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineEl,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.6
          }
        }
      );
    }

    // C. Smooth Card Entrances
    gsap.utils.toArray('.myr-card, .myr-event').forEach(card => {
      gsap.from(card, {
        y: 35,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  
    // D. Cinematic "Our Love Story" Scroll Stagger & Glow Animation
    const storyLeftCards = gsap.utils.toArray('.myr-story-left');
    storyLeftCards.forEach(card => {
      gsap.fromTo(card,
        { x: isMobile ? -30 : -70, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    const storyRightCards = gsap.utils.toArray('.myr-story-right');
    storyRightCards.forEach(card => {
      gsap.fromTo(card,
        { x: isMobile ? 30 : 70, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });


  // 4. Scroll Reveal Intersection Observer
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

  // 5. Live Muhurat Countdown Timer
  function getTargetDate() {
    if (window.LIVE_TARGET_DATE_MS) return window.LIVE_TARGET_DATE_MS;
    if (window.WEDDING_CONFIG && window.WEDDING_CONFIG.weddingDate) {
      const parsed = Date.parse(window.WEDDING_CONFIG.weddingDate);
      if (!isNaN(parsed) && parsed > Date.now()) return parsed;
    }
    return new Date('2026-12-03T18:30:00+05:30').getTime();
  }
  const countNums = document.querySelectorAll('.myr-count-num, .rjm-count-num');

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

  // 6. Interactive RSVP System
  const rsvpForm = document.querySelector('.myr-rsvp-form, .rjm-rsvp-form, form');
  const rsvpBody = document.querySelector('.myr-rsvp-body, .rjm-rsvp-body');
  
  const rsvpRows = document.querySelectorAll('.myr-rsvp-row, .rjm-rsvp-row');
  rsvpRows.forEach(row => {
    const choices = row.querySelectorAll('.myr-choice, .rjm-choice, button[data-choice]');
    choices.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        choices.forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
      });
    });
  });

  const submitBtn = document.querySelector('.myr-submit, .rjm-submit, button[type="submit"]');
  if (submitBtn && rsvpBody) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = rsvpForm ? rsvpForm.querySelector('input[type="text"]') : null;
      const guestName = nameInput ? nameInput.value.trim() : 'Guest';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="l-en">Sending…</span><span class="l-hi">भेजा जा रहा है…</span>';

      setTimeout(() => {
        rsvpBody.innerHTML = `
          <div class="myr-rsvp-done" style="text-align:center; animation: myr-fade 0.8s ease forwards; padding: 2rem 1rem;">
            <h3 style="font-family:var(--w-serif); color:var(--myr-teal, #0e6e6e); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Thank you, ${guestName}!</span>
              <span class="l-hi">धन्यवाद, ${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--myr-pink-deep, #a01048); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">We look forward to celebrating with you.</span>
              <span class="l-hi">हम आपके साथ जश्न मनाने के लिए उत्सुक हैं।</span>
            </p>
            <p style="letter-spacing:0.18em; text-transform:uppercase; color:var(--myr-ink-soft, #5b736b); margin-top:0.8rem; font-size:0.75rem;">
              <span class="l-en">Your response has been recorded</span>
              <span class="l-hi">आपका उत्तर दर्ज कर लिया गया है</span>
            </p>
          </div>
        `;
      }, 800);
    });
  }

  // 7. SILENT BACKGROUND MUSIC PLAYER (FinalSong.mp3)
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
      }).catch(err => {});
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

  window.rjmForcePlayAudio();

  const ctaBtn = document.querySelector('.myr-hero-cta, .rjm-hero-cta, a[href*="#"]');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.rjmForcePlayAudio();
    });
  }
});
