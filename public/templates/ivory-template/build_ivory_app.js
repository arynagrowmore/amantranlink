const fs = require('fs');

const configJs = `// Ivory Royal Wedding Configuration File
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
  const langBtns = document.querySelectorAll('.g-lang, .rjm-lang, [data-lang-toggle]');
  
  langBtns.forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('data-lang') || 'en';
      const nextLang = currentLang === 'en' ? 'hi' : 'en';
      htmlEl.setAttribute('data-lang', nextLang);
      langBtns.forEach(btn => btn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English');
      
      const gulDiv = document.querySelector('.gul, .wsite');
      if (gulDiv) {
        gulDiv.setAttribute('data-lang', nextLang);
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.g-nav-toggle, .rjm-nav-toggle, button[aria-expanded]');
  const navLinks = document.querySelector('.g-nav-links, #g-menu, #rjm-menu');

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

    // Section-by-Section Reveals
    gsap.utils.toArray('[data-tw-reveal="true"], section > div').forEach(card => {
      gsap.fromTo(card,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
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
  const countNums = document.querySelectorAll('.g-countnum, .rjm-count-num');

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
        rsvpForm.innerHTML = \`
          <div class="g-rsvp-done" style="text-align:center; padding: 2rem 1rem;">
            <h3 style="font-family:var(--w-serif); color:var(--g-pink, #E31364); font-size:clamp(1.8rem, 6vw, 2.5rem); font-style:italic;">
              <span class="l-en">Thank you, \${guestName}!</span>
              <span class="l-hi">धन्यवाद, \${guestName}!</span>
            </h3>
            <p style="font-family:var(--w-display); color:var(--g-plum, #5B1B3A); margin-top:0.6rem; font-size:1.2rem;">
              <span class="l-en">We look forward to celebrating with you.</span>
              <span class="l-hi">हम आपके साथ जश्न मनाने के लिए उत्सुक हैं।</span>
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
});
`;

fs.writeFileSync('app.js', appJs);

const pkgJson = `{
  "name": "ivory-wedding-template",
  "version": "1.0.0",
  "description": "The Ivory - Royal Minimalist Editorial Wedding Invitation Template",
  "main": "index.html",
  "scripts": {
    "start": "npx serve -l 3005",
    "dev": "npx serve -l 3005"
  },
  "keywords": [
    "wedding-invitation",
    "the-ivory",
    "editorial-wedding",
    "minimalist-luxury",
    "bilingual"
  ],
  "author": "",
  "license": "ISC"
}
`;
fs.writeFileSync('package.json', pkgJson);

const readmeMd = `# The Ivory — Royal Minimalist Editorial Wedding Invitation Template 🤍👑

A pixel-perfect clone of **The Ivory** luxury wedding template (\`https://www.jointhejashn.com/demo/ivory\`).

---

## ✨ Features

- 🤍 **Minimalist Editorial & Royal Ivory Aesthetic**: Soft creamy ivory parchment, vivid gulal rose pink, festive marigold, and plum luxury accents.
- 👑 **Dhruv & Shreya (\`D · S\`)**: Personalized couple initials, 3 December 2024 date, The Milestone Himmatnagar location, and family details.
- 🌐 **Instant Bilingual Toggle**: 1-click English ⇋ Hindi switch.
- ⏳ **Live Muhurat Countdown**: Real-time days, hours, minutes, and seconds countdown counter.
- 🎶 **Silent Auto Background Music**: \`FinalSong.mp3\` starts softly on scroll/tap and plays on infinite loop.
- 📅 **5 Celebration Events**: Haldi, Mehendi, Sangeet, Wedding, Reception with 1-click Google Calendar integration.
- 💌 **Full Interactive RSVP Form**: Attendance selection and animated confirmation card.

---

## 🚀 How to Run

1. **Direct Double Click**: Open [\`index.html\`](file:///C:/Users/Avira/Web%20Devlopment%20Project/Wedding%20Invitation%20Design/ivory-template/index.html) in any browser.
2. **Local Development Server**:
   \`\`\`bash
   npx serve -l 3005 "C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\ivory-template"
   \`\`\`
`;
fs.writeFileSync('README.md', readmeMd);

console.log('Successfully written app.js, wedding-config.js, package.json and README.md for Ivory!');
