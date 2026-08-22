document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Toggle (English <-> Hindi)
  const htmlEl = document.documentElement;
  const langBtns = document.querySelectorAll('.jdi-lang, .rjm-lang, [data-lang-toggle]');
  
  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtns.forEach(btn => btn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English');
      
      const jdiDiv = document.querySelector('.jdi, .wsite');
      if (jdiDiv) {
        jdiDiv.setAttribute('data-lang', nextLang);
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.jdi-nav-toggle, .rjm-nav-toggle');
  const navLinks = document.querySelector('.jdi-nav-links, #jdi-menu, #rjm-menu');

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

  
  
  // 3. COMPREHENSIVE SECTION-BY-SECTION & ELEMENT SCROLL REVEAL (GSAP)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Section-by-Section Header Reveals
    gsap.utils.toArray('.jdi-head, [id] .text-center, .myr-head, .rjm-head').forEach(head => {
      gsap.fromTo(head,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: head,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // B. Story Timeline Reveal (Left cards from left, Right cards from right)
    const timelineCards = gsap.utils.toArray('.jdi-timeline .relative, [id="story"] .relative, .myr-story-card');
    timelineCards.forEach((card, idx) => {
      const isLeft = idx % 2 === 0;
      gsap.fromTo(card,
        { x: isLeft ? (isMobile ? -25 : -55) : (isMobile ? 25 : 55), opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Timeline Central Line Reveal
    const timelineEl = document.querySelector('.jdi-timeline, .rjm-timeline, .myr-timeline');
    const timelineFill = document.querySelector('.jdi-timeline-fill, .rjm-timeline-fill, .myr-timeline-fill');
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

    // C. Countdown Boxes Reveal
    const countSection = document.querySelector('.jdi-count, [id="countdown"], .rjm-count');
    if (countSection) {
      gsap.fromTo(countSection.children,
        { y: 30, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: countSection,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // D. Celebration Event Cards Staggered Reveal
    const eventCards = gsap.utils.toArray('.jdi-event, .jdi-card, [id="schedule"] .jdi-card, .rjm-card');
    if (eventCards.length > 0) {
      gsap.fromTo(eventCards,
        { y: 45, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: eventCards[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // E. Moments Gallery Photo Frames Staggered Reveal
    const galleryItems = gsap.utils.toArray('.jdi-frame, [id="gallery"] img');
    if (galleryItems.length > 0) {
      gsap.fromTo(galleryItems,
        { y: 35, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryItems[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // F. Venue, Family & FAQ Section Reveals
    gsap.utils.toArray('[id="venue"] .jdi-card, [id="family"] .jdi-card, [id="faq"] details, [id="rsvp"] form, .jdi-rsvp-body').forEach(el => {
      gsap.fromTo(el,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
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
  const countNums = document.querySelectorAll('.jdi-countnum, .rjm-count-num');

  function updateCountdown() {
    const targetDate = getTargetDate();
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
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
  const rsvpForm = document.querySelector('.jdi-rsvp-form, .rjm-rsvp-form, form');
  const rsvpBody = document.querySelector('.jdi-rsvp-body, .rjm-rsvp-body');
  
  const rsvpRows = document.querySelectorAll('.jdi-rsvp-row, .rjm-rsvp-row');
  rsvpRows.forEach(row => {
    const choices = row.querySelectorAll('.jdi-choice, .rjm-choice, button[data-choice]');
    choices.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        choices.forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
      });
    });
  });

  const submitBtn = document.querySelector('.jdi-submit, .rjm-submit, button[type="submit"]');
  if (submitBtn && rsvpBody) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = rsvpForm ? rsvpForm.querySelector('input[type="text"]') : null;
      const guestName = nameInput ? nameInput.value.trim() : 'Guest';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="l-en">Sending…</span><span class="l-hi">भेजा जा रहा है…</span>';

      setTimeout(() => {
        rsvpBody.innerHTML = `
          <div class="jdi-rsvp-done" style="text-align:center; animation: jdi-fade 0.8s ease forwards; padding: 2rem 1rem;">
            <h3 style="font-family:var(--w-serif); color:var(--jdi-maroon, #7A1B22); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Thank you, ${guestName}!</span>
              <span class="l-hi">धन्यवाद, ${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--jdi-gold-deep, #9A7526); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">We look forward to celebrating with you.</span>
              <span class="l-hi">हम आपके साथ जश्न मनाने के लिए उत्सुक हैं।</span>
            </p>
            <p style="letter-spacing:0.18em; text-transform:uppercase; color:var(--jdi-ink-soft, #6E554F); margin-top:0.8rem; font-size:0.75rem;">
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

  const ctaBtn = document.querySelector('.jdi-hero-cta, .rjm-hero-cta, a[href*="#"]');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.rjmForcePlayAudio();
    });
  }
});
