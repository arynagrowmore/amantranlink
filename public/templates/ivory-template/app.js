document.addEventListener('DOMContentLoaded', () => {
  // 🌟 Universal Auto-Monogram & Dynamic Names Initializer
  function applyDynamicMonogramAndNames(groom, bride) {
    if (!groom || !bride) return;
    const gInit = groom.trim().charAt(0).toUpperCase();
    const bInit = bride.trim().charAt(0).toUpperCase();
    const monogramDot = `${gInit} · ${bInit}`;
    const monogramAmp = `${gInit} & ${bInit}`;

    document.querySelectorAll('.monogram, .nav-mark, .couple-mark, #couple-mark, .mark-tag, .logo-monogram, [data-bind="mark"]').forEach(el => {
      el.textContent = monogramDot;
    });
    document.querySelectorAll('a.g-serif, header a.g-serif').forEach(el => {
      el.textContent = monogramDot;
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
  const langBtns = document.querySelectorAll('.g-lang, .g-lang-en, .g-lang-hi, .rjm-lang, [data-lang-toggle]');
  
  const setLanguage = (lang) => {
    htmlEl.setAttribute('data-lang', lang);
    const gulDiv = document.querySelector('.gul, .wsite');
    if (gulDiv) {
      gulDiv.setAttribute('data-lang', lang);
    }
    document.querySelectorAll('.g-lang-en').forEach(btn => {
      if (lang === 'en') {
        btn.classList.add('bg-[color:var(--g-pink)]', 'text-white');
        btn.classList.remove('text-[color:var(--g-ink)]/50', 'bg-black/5');
      } else {
        btn.classList.remove('bg-[color:var(--g-pink)]', 'text-white');
        btn.classList.add('text-[color:var(--g-ink)]/50', 'bg-black/5');
      }
    });
    document.querySelectorAll('.g-lang-hi').forEach(btn => {
      if (lang === 'hi') {
        btn.classList.add('bg-[color:var(--g-pink)]', 'text-white');
        btn.classList.remove('text-[color:var(--g-ink)]/50', 'bg-black/5');
      } else {
        btn.classList.remove('bg-[color:var(--g-pink)]', 'text-white');
        btn.classList.add('text-[color:var(--g-ink)]/50', 'bg-black/5');
      }
    });
  };

  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let nextLang = 'en';
      if (langBtn.classList.contains('g-lang-hi')) {
        nextLang = 'hi';
      } else if (langBtn.classList.contains('g-lang-en')) {
        nextLang = 'en';
      } else {
        const currentLang = htmlEl.getAttribute('data-lang') || 'en';
        nextLang = currentLang === 'en' ? 'hi' : 'en';
      }
      setLanguage(nextLang);
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('g-nav-toggle') || document.querySelector('.g-nav-toggle, button[aria-controls="g-menu"]');
  const navLinks = document.getElementById('g-menu') || document.querySelector('.g-nav-links, #g-menu');

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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.add('hidden');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = 'Menu';
      }
    });
  }

  
  // 3. COMPLETE SECTION-BY-SECTION GSAP SCROLL ANIMATIONS
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Hero Elements Entrance
    gsap.from('h1', {
      scale: 0.88,
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });

    // B. Section Headers Stagger
    gsap.utils.toArray('h2, h3, .g-serif').forEach(heading => {
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // C. Cards Staggered Pop (Schedule, Venue, Story, FAQ)
    const cards = gsap.utils.toArray('.rounded-2xl, .border, .shadow-sm');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // D. Countdown Boxes Stagger
    const countBoxes = document.querySelectorAll('[class*="count"] > div');
    if (countBoxes.length > 0) {
      gsap.fromTo(countBoxes,
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: countBoxes[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
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
  const countNums = document.querySelectorAll('.g-countnum, .rjm-count-num, .count-num, .countdown-digit');

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
  const rsvpForm = document.querySelector('form');
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn && rsvpForm) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = rsvpForm.querySelector('input[type="text"]');
      const guestName = nameInput ? nameInput.value.trim() : 'Guest';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="l-en">Sending…</span><span class="l-hi">भेजा जा रहा है…</span>';

      setTimeout(() => {
        rsvpForm.innerHTML = `
          <div class="g-rsvp-done" style="text-align:center; padding: 2rem 1rem;">
            <h3 style="font-family:var(--w-serif); color:var(--g-pink, #E31364); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Thank you, ${guestName}!</span>
              <span class="l-hi">धन्यवाद, ${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--g-plum, #5B1B3A); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">We look forward to celebrating with you.</span>
              <span class="l-hi">हम आपके साथ जश्न मनाने के लिए उत्सुक हैं।</span>
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
});
