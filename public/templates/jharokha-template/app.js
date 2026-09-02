document.addEventListener('DOMContentLoaded', () => {
  // 🌟 Universal Auto-Monogram & Dynamic Names Initializer
  function applyDynamicMonogramAndNames(groom, bride) {
    if (!groom || !bride) return;
    const gInit = groom.trim().charAt(0).toUpperCase();
    const bInit = bride.trim().charAt(0).toUpperCase();
    const monogramAmp = `${gInit} & ${bInit}`;

    document.querySelectorAll('.monogram, .jhr-nav-mark, .jhr-monogram, .nav-mark, .couple-mark, #couple-mark, .mark-tag, .logo-monogram, [data-bind="mark"], a.jhr-script, header a.jhr-script').forEach(el => {
      el.textContent = monogramAmp;
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const qGroom = urlParams.get('groom') || (window.WEDDING_CONFIG && window.WEDDING_CONFIG.groomName);
  const qBride = urlParams.get('bride') || (window.WEDDING_CONFIG && window.WEDDING_CONFIG.brideName);
  if (qGroom && qBride) {
    applyDynamicMonogramAndNames(qGroom, qBride);
  }

  window.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'SYNC_COUPLE_DATA' || event.data.type === 'UPDATE_COUPLE')) {
      const { groom, bride, groomEn, brideEn } = event.data;
      const g = groom || groomEn;
      const b = bride || brideEn;
      if (g && b) applyDynamicMonogramAndNames(g, b);
    }
  });

  // 1. Language Toggle (English <-> Hindi)
  const htmlEl = document.documentElement;
  const langBtns = document.querySelectorAll('.jhr-lang, .rjm-lang');
  
  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtns.forEach(btn => btn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English');
      
      const jhrDiv = document.querySelector('.jhr, .wsite');
      if (jhrDiv) {
        jhrDiv.setAttribute('data-lang', nextLang);
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.jhr-nav-toggle, #jhr-nav-toggle, .rjm-nav-toggle');
  const navLinks = document.querySelector('#jhr-menu, .jhr-nav-links, #rjm-menu');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = navLinks.classList.contains('hidden');
      if (isHidden) {
        navLinks.classList.remove('hidden');
        navLinks.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.textContent = '✕ Close';
      } else {
        navLinks.classList.add('hidden');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = 'Menu';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.add('hidden');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = 'Menu';
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.add('hidden');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = 'Menu';
      }
    });
  }

  // 3. GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // --- A. Jharokha Hero Parallax & Sky ---
    const heroScene = document.querySelector('.jhr-scene, .jhr-hero');
    if (heroScene) {
      const sky = heroScene.querySelector('.jhr-scene-sky');
      const palaceFar = heroScene.querySelector('.jhr-palace-far');
      const palace = heroScene.querySelector('.jhr-palace');
      const birds = heroScene.querySelector('.jhr-birds');

      if (palaceFar) {
        gsap.to(palaceFar, {
          yPercent: isMobile ? 8 : 15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      if (palace) {
        gsap.to(palace, {
          yPercent: isMobile ? 14 : 25,
          ease: 'none',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }

    // --- B. Floating / Swinging Lanterns & Bells ---
    gsap.utils.toArray('.jhr-lantern, .jhr-bell').forEach((el, i) => {
      gsap.to(el, {
        rotation: i % 2 === 0 ? 3.5 : -3.5,
        duration: 3 + (i % 3) * 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // --- C. Story Timeline Progress Line ---
    const timelineEl = document.querySelector('.jhr-timeline, .rjm-timeline');
    const timelineFill = document.querySelector('.jhr-timeline-fill, .rjm-timeline-fill');
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
  }

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
  const countNums = document.querySelectorAll('.jhr-count-num, .rjm-count-num');

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
  const rsvpForm = document.querySelector('.jhr-rsvp-form, .rjm-rsvp-form, form');
  const rsvpBody = document.querySelector('.jhr-rsvp-body, .rjm-rsvp-body');
  
  const rsvpRows = document.querySelectorAll('.jhr-rsvp-row, .rjm-rsvp-row');
  rsvpRows.forEach(row => {
    const choices = row.querySelectorAll('.jhr-choice, .rjm-choice, button[data-choice]');
    choices.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        choices.forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
      });
    });
  });

  const submitBtn = document.querySelector('.jhr-submit, .rjm-submit, button[type="submit"]');
  if (submitBtn && rsvpBody) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = rsvpForm ? rsvpForm.querySelector('input[type="text"]') : null;
      const guestName = nameInput ? nameInput.value.trim() : 'Guest';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="l-en">Sending…</span><span class="l-hi">भेजा जा रहा है…</span>';

      setTimeout(() => {
        rsvpBody.innerHTML = `
          <div class="jhr-rsvp-done" style="text-align:center; animation: jhr-fade 0.8s ease forwards; padding: 2rem 1rem;">
            <h3 style="font-family:var(--w-serif); color:var(--jhr-gold-deep, #8A6526); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Thank you, ${guestName}!</span>
              <span class="l-hi">धन्यवाद, ${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--jhr-maroon, #7C2230); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">We look forward to celebrating with you.</span>
              <span class="l-hi">हम आपके साथ जश्न मनाने के लिए उत्सुक हैं।</span>
            </p>
            <p style="letter-spacing:0.18em; text-transform:uppercase; color:var(--jhr-ink-soft, #8B7358); margin-top:0.8rem; font-size:0.75rem;">
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

  const ctaBtn = document.querySelector('.jhr-hero-cta, .rjm-hero-cta, a[href*="#"]');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.rjmForcePlayAudio();
    });
  }
});
