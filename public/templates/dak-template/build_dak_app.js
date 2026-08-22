const fs = require('fs');

const configJs = `// Dâk Vintage Royal Postal Wedding Configuration File
window.WEDDING_CONFIG = {
  groomName: "Dhruv",
  brideName: "Shreya",
  weddingDate: "2024-12-03T18:30:00+05:30",
  dateFormatted: "3 December 2024",
  city: "The Milestone, Himmatnagar, Gujarat",
  mark: "D · S",
  hashtag: "#DhruvKiShreya",
  groomParents: {
    father: "Mr. Nalinkumar",
    mother: "Mrs. Kalpuben"
  },
  contacts: [
    { name: "Nalinkumar", phone: "+91 98251 45678" },
    { name: "Family Helpdesk", phone: "+91 98982 34567" }
  ]
};
`;
fs.writeFileSync('wedding-config.js', configJs);

const appJs = `document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Toggle (English <-> Hindi)
  const htmlEl = document.documentElement;
  const langBtns = document.querySelectorAll('.dak-lang, .rjm-lang, [data-lang-toggle]');
  
  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtns.forEach(btn => btn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English');
      
      const dakDiv = document.querySelector('.dak, .wsite');
      if (dakDiv) {
        dakDiv.setAttribute('data-lang', nextLang);
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.dak-nav-toggle, .rjm-nav-toggle');
  const navLinks = document.querySelector('.dak-nav-links, #dak-menu, #rjm-menu');

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

    // A. Postcard & Postal Stamp Parallax
    const heroCard = document.querySelector('.dak-card, .dak-desk');
    if (heroCard) {
      gsap.from(heroCard, {
        y: 60,
        opacity: 0,
        scale: 0.94,
        duration: 1.2,
        ease: 'power3.out'
      });
    }

    // B. Route Timeline Progress
    const routeItems = gsap.utils.toArray('.dak-route-item, .dak-route-body');
    routeItems.forEach(item => {
      gsap.fromTo(item,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // C. Stamp Postmark Stamp Strike on Scroll
    gsap.utils.toArray('.dak-strike').forEach(stamp => {
      gsap.fromTo(stamp,
        { scale: 1.6, opacity: 0, rotation: -20 },
        {
          scale: 1,
          opacity: 1,
          rotation: -10,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: stamp,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // D. Section Reveals
    gsap.utils.toArray('[data-tw-reveal="true"], .dak-card, .dak-perf-panel').forEach(card => {
      gsap.fromTo(card,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
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
  const targetDateStr = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.weddingDate) || '2024-12-03T18:30:00+05:30';
  const targetDate = new Date(targetDateStr).getTime();
  const countNums = document.querySelectorAll('.dak-countnum, .rjm-count-num');

  function updateCountdown() {
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
  const rsvpForm = document.querySelector('.dak-reply, form');
  const rsvpBody = document.querySelector('.dak-reply-head, .dak-reply');
  
  const tickButtons = document.querySelectorAll('.dak-tick, .dak-tick-on');
  tickButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      tickButtons.forEach(b => b.classList.remove('dak-tick-on'));
      btn.classList.add('dak-tick-on');
    });
  });

  const submitBtn = document.querySelector('.dak-btn, button[type="submit"]');
  if (submitBtn && rsvpBody) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = rsvpForm ? rsvpForm.querySelector('input[type="text"]') : null;
      const guestName = nameInput ? nameInput.value.trim() : 'Guest';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="l-en">Dispatching…</span><span class="l-hi">भेजा जा रहा है…</span>';

      setTimeout(() => {
        rsvpBody.innerHTML = \`
          <div class="dak-rsvp-done" style="text-align:center; animation: dak-arrive 0.8s ease forwards; padding: 2rem 1rem;">
            <div style="width:60px; height:60px; margin: 0 auto 1rem; border-radius:50%; background:var(--dak-red, #A8332B); color:#FFF; display:flex; align-items:center; justify-content:center; font-size:1.8rem; box-shadow: 0 4px 16px rgba(168,51,43,0.4);">
              ✉️
            </div>
            <h3 style="font-family:var(--w-serif); color:var(--dak-ink, #182233); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Telegram Delivered, \${guestName}!</span>
              <span class="l-hi">संदेश प्राप्त हुआ, \${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--dak-red, #A8332B); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">Your royal postal response is confirmed.</span>
              <span class="l-hi">आपकी उपस्थिति की पुष्टि हो गई है।</span>
            </p>
            <p style="letter-spacing:0.18em; text-transform:uppercase; color:var(--dak-text-soft, #6C7385); margin-top:0.8rem; font-size:0.75rem;">
              <span class="l-en">Dispatched via Royal Dâk Post</span>
              <span class="l-hi">शाही डाक द्वारा प्रेषित</span>
            </p>
          </div>
        \`;
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

  const ctaBtn = document.querySelector('.dak-btn, .rjm-hero-cta, a[href*="#"]');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.rjmForcePlayAudio();
    });
  }
});
`;

fs.writeFileSync('app.js', appJs);

const pkgJson = `{
  "name": "dak-wedding-template",
  "version": "1.0.0",
  "description": "The Dâk - Vintage Royal Indian Postal Stamp Wedding Invitation Template",
  "main": "index.html",
  "scripts": {
    "start": "npx serve -l 3004",
    "dev": "npx serve -l 3004"
  },
  "keywords": [
    "wedding-invitation",
    "the-dak",
    "vintage-postcard",
    "postal-stamp",
    "gsap-animation",
    "bilingual"
  ],
  "author": "",
  "license": "ISC"
}
`;
fs.writeFileSync('package.json', pkgJson);

const readmeMd = `# The Dâk — Vintage Royal Indian Postal Wedding Invitation Template ✉️👑

A pixel-perfect clone of **The Dâk** vintage postal luxury wedding template (\`https://www.jointhejashn.com/demo/dak\`).

---

## ✨ Features

- ✉️ **Vintage Royal Postal Letter & Postcard Aesthetic**: Airmail red & navy striped borders, perforated postage stamp cards, postmark cancellation stamp animations, and telegram parchment paper.
- 📬 **Interactive Postmark Cancellation Stamp**: Animated ink strike stamping effect on scroll.
- 👑 **Dhruv & Shreya (\`D · S\`)**: Personalized couple initials, 3 December 2024 date, The Milestone Himmatnagar location, and family details.
- 🌐 **Instant Bilingual Toggle**: 1-click English ⇋ Hindi switch.
- ⏳ **Live Muhurat Countdown**: Real-time days, hours, minutes, and seconds countdown counter.
- 🎶 **Silent Auto Background Music**: \`FinalSong.mp3\` starts softly on scroll/tap and plays on infinite loop.
- 📅 **5 Celebration Events**: Haldi, Mehendi, Sangeet, Wedding, Reception with 1-click Google Calendar integration.
- 💌 **Full Interactive RSVP Telegram Form**: Attendance selection and animated telegram delivery confirmation.

---

## 🚀 How to Run

1. **Direct Double Click**: Open [\`index.html\`](file:///C:/Users/Avira/Web%20Devlopment%20Project/Wedding%20Invitation%20Design/dak-template/index.html) in any browser.
2. **Local Development Server**:
   \`\`\`bash
   npx serve -l 3004 "C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\dak-template"
   \`\`\`
`;
fs.writeFileSync('README.md', readmeMd);

console.log('Successfully written app.js, wedding-config.js, package.json and README.md for Dâk!');
