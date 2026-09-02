import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, '..', 'public', 'templates', 'royalring-template');

// 1. EXACT STYLESHEET (style.css)
const styleCss = `/* ========================================================================= */
/* 💍 THE ROYAL RING — EXACT CINEMATIC LUXURY ENGAGEMENT STYLES              */
/* ========================================================================= */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

:root {
  --radius: 0.25rem;

  --maroon: #4a0e17;
  --maroon-deep: #2d080e;
  --maroon-ink: #1a0407;
  --ivory: #faf5eb;
  --ivory-warm: #f3ecdf;
  --pearl: #fffdfa;
  --gold: #c49a35;
  --gold-light: #e8d5ad;
  --gold-deep: #9c772f;

  --background: var(--ivory);
  --foreground: #2d080e;
  --card: var(--pearl);

  --gradient-gold: linear-gradient(
    100deg,
    #9c772f 0%,
    #e8d5ad 28%,
    #c49a35 52%,
    #fbf4e4 74%,
    #9c772f 100%
  );
  --gradient-maroon: linear-gradient(
    165deg,
    #3f0910 0%,
    #24060a 60%,
    #140306 100%
  );
  --gradient-ivory: linear-gradient(180deg, var(--pearl) 0%, var(--ivory) 45%, var(--ivory-warm) 100%);
  --shadow-lift: 0 30px 70px -40px rgba(45, 8, 14, 0.45);
  --shadow-gold: 0 0 0 1px rgba(196, 154, 53, 0.5), 0 24px 60px -30px rgba(196, 154, 53, 0.6);
  --ease-lux: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Jost', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(196, 154, 53, 0.35);
  color: #1a0407;
}

/* 👑 Typography */
.font-display {
  font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
}
.font-body {
  font-family: 'Jost', sans-serif;
}
.font-deva {
  font-family: 'Tiro Devanagari Hindi', 'Cormorant Garamond', serif;
}

/* 🌟 Gold Foil Shimmer */
.text-gold-foil {
  background-image: var(--gradient-gold);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: foil-sweep 9s var(--ease-lux) infinite;
}

.bg-gold-foil {
  background-image: var(--gradient-gold);
  background-size: 220% 100%;
  animation: foil-sweep 9s var(--ease-lux) infinite;
}

.bg-royal {
  background-image: var(--gradient-maroon);
}

.bg-ivory-sheet {
  background-image: var(--gradient-ivory);
}

.tracking-royal {
  letter-spacing: 0.36em;
}

.glass-ivory {
  background: rgba(255, 253, 250, 0.72);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
  border: 1px solid rgba(196, 154, 53, 0.45);
  box-shadow: var(--shadow-lift);
}

.glass-dark {
  background: rgba(26, 4, 7, 0.65);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  border: 1px solid rgba(196, 154, 53, 0.28);
}

.gold-hairline {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(196, 154, 53, 0.15) 12%,
    rgba(232, 213, 173, 0.9) 50%,
    rgba(196, 154, 53, 0.15) 88%,
    transparent
  );
}

.card-lift {
  transition: transform 0.7s var(--ease-lux), box-shadow 0.7s var(--ease-lux), border-color 0.7s var(--ease-lux);
}
.card-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 35px 75px -30px rgba(45, 8, 14, 0.35);
}

.light-sweep {
  position: relative;
  overflow: hidden;
}
.light-sweep::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    60deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-120%) skewX(-18deg);
  animation: sweep-across 6s ease-in-out infinite;
}

.preserve-3d {
  transform-style: preserve-3d;
}

/* 💫 Keyframes */
@keyframes foil-sweep {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes ring-spin {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.06); }
}

@keyframes sweep-across {
  0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  30% { opacity: 0.75; }
  100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
}

@keyframes particle-rise {
  0% { transform: translate3d(0, 20px, 0) scale(0.6); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translate3d(var(--drift, 12px), -160px, 0) scale(1); opacity: 0; }
}

@keyframes wave-bar {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.animate-glow-pulse {
  animation: glow-pulse 4s ease-in-out infinite;
}

/* 📜 Language Switching */
[data-lang="en"] .l-hi, [data-lang="en"] .l-gu { display: none !important; }
[data-lang="hi"] .l-en, [data-lang="hi"] .l-gu { display: none !important; }
[data-lang="gu"] .l-en, [data-lang="gu"] .l-hi { display: none !important; }
`;

// 2. EXACT SCRIPT ENGINE (app.js)
const appJs = `/* ========================================================================= */
/* 💍 THE ROYAL RING — INTERACTIVE ENGINE, 3D RINGS, SYNTH AUDIO & RSVP     */
/* ========================================================================= */

(function() {
  'use strict';

  // 1. DYNAMIC 3D RING BUILDER
  function build3DRing(containerEl, size = 180, speed = 16, tilt = 16, stones = 1) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    const slices = 22;
    const thickness = size * 0.1;
    const step = thickness / slices;
    const stoneSize = size * 0.19;

    const wrapper = document.createElement('div');
    wrapper.className = 'preserve-3d relative';
    wrapper.style.width = size + 'px';
    wrapper.style.height = size + 'px';
    wrapper.style.perspective = '1000px';

    const tiltBox = document.createElement('div');
    tiltBox.className = 'preserve-3d absolute inset-0';
    tiltBox.style.transform = \`rotateX(\${tilt}deg)\`;

    const spinBox = document.createElement('div');
    spinBox.className = 'preserve-3d absolute inset-0';
    spinBox.style.animation = \`ring-spin \${speed}s linear infinite\`;

    // Slices
    for (let i = 0; i < slices; i++) {
      const z = (i - (slices - 1) / 2) * step;
      const edge = Math.abs(i - (slices - 1) / 2) / ((slices - 1) / 2);
      const inset = size * 0.005 * edge * 6;
      const lightness = 0.58 + (1 - edge) * 0.3;

      const slice = document.createElement('span');
      slice.className = 'absolute rounded-full';
      slice.style.inset = inset + 'px';
      slice.style.transform = \`translateZ(\${z}px)\`;
      slice.style.border = \`\${size * 0.075}px solid transparent\`;
      slice.style.borderRadius = '50%';
      slice.style.background = \`conic-gradient(from 210deg,
        #9c772f 0deg,
        #fbf4e4 55deg,
        #c49a35 120deg,
        #7c5c20 195deg,
        #e8d5ad 265deg,
        #c49a35 330deg,
        #9c772f 360deg)\`;
      slice.style.webkitMask = \`radial-gradient(circle, transparent 0 \${size * 0.5 - size * 0.075}px, #000 \${size * 0.5 - size * 0.075 + 0.5}px)\`;
      slice.style.mask = \`radial-gradient(circle, transparent 0 \${size * 0.5 - size * 0.075}px, #000 \${size * 0.5 - size * 0.075 + 0.5}px)\`;
      slice.style.opacity = String(0.7 + (1 - edge) * 0.3);
      spinBox.appendChild(slice);
    }

    // Sheen
    const sheen = document.createElement('span');
    sheen.className = 'absolute inset-0 rounded-full';
    sheen.style.transform = \`translateZ(\${thickness / 2 + 0.4}px)\`;
    sheen.style.border = \`\${size * 0.075}px solid transparent\`;
    sheen.style.background = 'conic-gradient(from 150deg, transparent 0deg, rgba(255,255,255,0.75) 40deg, transparent 90deg, transparent 240deg, rgba(255,255,255,0.45) 285deg, transparent 330deg)';
    sheen.style.webkitMask = \`radial-gradient(circle, transparent 0 \${size * 0.5 - size * 0.075}px, #000 \${size * 0.5 - size * 0.075 + 0.5}px)\`;
    sheen.style.mask = \`radial-gradient(circle, transparent 0 \${size * 0.5 - size * 0.075}px, #000 \${size * 0.5 - size * 0.075 + 0.5}px)\`;
    sheen.style.mixBlendMode = 'screen';
    spinBox.appendChild(sheen);

    // Sparkling Stone
    if (stones > 0) {
      const stoneHolder = document.createElement('span');
      stoneHolder.className = 'preserve-3d absolute';
      stoneHolder.style.left = '50%';
      stoneHolder.style.top = (-stoneSize * 0.42) + 'px';
      stoneHolder.style.width = stoneSize + 'px';
      stoneHolder.style.height = stoneSize + 'px';
      stoneHolder.style.marginLeft = (-stoneSize / 2) + 'px';
      stoneHolder.style.transform = \`translateZ(\${thickness / 2}px)\`;

      const diamond = document.createElement('span');
      diamond.className = 'absolute inset-0 rounded-full animate-pulse';
      diamond.style.background = 'radial-gradient(circle at 34% 28%, #ffffff 0%, #faf5eb 32%, #e8d5ad 62%, #c49a35 100%)';
      diamond.style.boxShadow = '0 0 24px rgba(255, 255, 255, 0.9), inset 0 -3px 8px rgba(196, 154, 53, 0.6)';
      stoneHolder.appendChild(diamond);
      spinBox.appendChild(stoneHolder);
    }

    tiltBox.appendChild(spinBox);
    wrapper.appendChild(tiltBox);
    containerEl.appendChild(wrapper);
  }

  // Build rings across placeholders
  build3DRing(document.getElementById('opening-ring-left'), 140, 13, 14, 0);
  build3DRing(document.getElementById('opening-ring-right'), 140, 17, -12, 1);
  build3DRing(document.getElementById('hero-floating-ring'), 96, 18, 16, 1);
  build3DRing(document.getElementById('ceremony-showcase-ring'), 220, 14, 18, 1);

  // 2. CINEMATIC OPENING CEREMONY
  const openingEl = document.getElementById('royal-opening');
  const enterBtn = document.getElementById('enter-invitation-btn');
  const skipBtn = document.getElementById('skip-opening-btn');

  function finishOpening() {
    if (!openingEl) return;
    openingEl.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    openingEl.style.opacity = '0';
    openingEl.style.pointerEvents = 'none';
    openingEl.style.transform = 'scale(1.03)';
    setTimeout(() => {
      openingEl.style.display = 'none';
    }, 1000);
  }

  if (enterBtn) enterBtn.addEventListener('click', finishOpening);
  if (skipBtn) skipBtn.addEventListener('click', finishOpening);
  setTimeout(finishOpening, 10000); // graceful timeout

  // 3. WEB AUDIO API SITAR / AMBIENT DRONE SYNTHESIZER
  let audioCtx = null;
  let masterGain = null;
  let activeNodes = [];
  let isMusicPlaying = false;

  function startAmbientMusic() {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioCtx) {
        audioCtx = new AudioCtor();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 900;
        filter.connect(masterGain);
        masterGain.connect(audioCtx.destination);

        // Warm sitar chord (D - A - D - A)
        [146.83, 220, 293.66, 440].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = freq;
          const g = audioCtx.createGain();
          g.gain.value = i === 3 ? 0.05 : 0.12;

          const lfo = audioCtx.createOscillator();
          lfo.frequency.value = 0.08 + i * 0.03;
          const lfoGain = audioCtx.createGain();
          lfoGain.gain.value = 0.05;
          lfo.connect(lfoGain).connect(g.gain);

          osc.connect(g).connect(filter);
          osc.start();
          lfo.start();
          activeNodes.push(osc, lfo);
        });
      }
      audioCtx.resume();
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 2.2);
      isMusicPlaying = true;
      updateMusicButtons(true);
    } catch (e) {
      console.warn('Audio note:', e);
    }
  }

  function stopAmbientMusic() {
    if (audioCtx && masterGain) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.4);
      isMusicPlaying = false;
      updateMusicButtons(false);
    }
  }

  function updateMusicButtons(playing) {
    document.querySelectorAll('.music-wave-bar').forEach(bar => {
      bar.style.animation = playing ? 'wave-bar 1s ease-in-out infinite' : 'none';
      bar.style.opacity = playing ? '1' : '0.35';
    });
    const label = document.getElementById('music-btn-label');
    if (label) label.textContent = playing ? 'Playing' : 'Music';
  }

  const musicBtn = document.getElementById('floating-music-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (isMusicPlaying) stopAmbientMusic();
      else startAmbientMusic();
    });
  }

  // 4. TOP SCROLL PROGRESS BAR
  const progressBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) : 0;
    if (progressBar) progressBar.style.transform = \`scaleX(\${progress})\`;
  }, { passive: true });

  // 5. COUNTDOWN ENGINE
  let targetDate = Date.parse('18 January 2027') || (Date.now() + 180 * 86400000);
  function tickCountdown() {
    const diff = Math.max(0, targetDate - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const d = document.getElementById('count-days');
    const h = document.getElementById('count-hours');
    const m = document.getElementById('count-mins');
    const s = document.getElementById('count-secs');

    if (d) d.textContent = String(days).padStart(2, '0');
    if (h) h.textContent = String(hours).padStart(2, '0');
    if (m) m.textContent = String(mins).padStart(2, '0');
    if (s) s.textContent = String(secs).padStart(2, '0');
  }
  setInterval(tickCountdown, 1000);
  tickCountdown();

  // 6. WHATSAPP SHARE MODAL
  const shareBtn = document.getElementById('floating-share-btn');
  const shareModal = document.getElementById('share-modal');
  const closeShareBtn = document.getElementById('close-share-btn');
  const copyShareBtn = document.getElementById('copy-share-btn');

  if (shareBtn && shareModal) {
    shareBtn.addEventListener('click', () => {
      shareModal.classList.remove('hidden');
      shareModal.classList.add('flex');
    });
  }
  if (closeShareBtn && shareModal) {
    closeShareBtn.addEventListener('click', () => {
      shareModal.classList.add('hidden');
      shareModal.classList.remove('flex');
    });
  }
  if (copyShareBtn) {
    copyShareBtn.addEventListener('click', () => {
      const txt = document.getElementById('share-text-area')?.value || window.location.href;
      navigator.clipboard.writeText(txt).then(() => {
        copyShareBtn.textContent = 'Copied to Clipboard! ✓';
        setTimeout(() => { copyShareBtn.textContent = 'Copy Invitation Link'; }, 2200);
      });
    });
  }

  // 7. LIGHTBOX GALLERY
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightbox = document.getElementById('close-lightbox-btn');

  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (lightbox && lightboxImg) {
        lightboxImg.src = thumb.getAttribute('src');
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
      }
    });
  });
  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => {
      lightbox.classList.add('hidden');
      lightbox.classList.remove('flex');
    });
  }

  // 8. LANGUAGE SWITCHER
  window.setLanguage = function(lang) {
    document.documentElement.setAttribute('data-lang', lang);
  };

  // 9. LIVE CUSTOMIZER DOM MUTATION BRIDGE
  window.UPDATE_WEDDING_DATA = function(data) {
    if (!data) return;
    if (data.couple) {
      const g = data.couple.groomEn || 'Aarav';
      const b = data.couple.brideEn || 'Riya';
      document.querySelectorAll('.groom-name').forEach(el => el.textContent = g);
      document.querySelectorAll('.bride-name').forEach(el => el.textContent = b);
      document.querySelectorAll('.couple-title').forEach(el => el.textContent = \`\${g} & \${b}\`);
      document.querySelectorAll('.monogram-text').forEach(el => el.textContent = \`\${g.charAt(0)} & \${b.charAt(0)}\`);

      if (data.couple.weddingDate) {
        document.querySelectorAll('.date-label').forEach(el => el.textContent = data.couple.weddingDate);
        const p = Date.parse(data.couple.weddingDate.split('·')[0].trim());
        if (!isNaN(p)) targetDate = p;
      }
      if (data.couple.venueName) {
        document.querySelectorAll('.venue-label').forEach(el => el.textContent = data.couple.venueName);
      }
      if (data.couple.venueAddress) {
        document.querySelectorAll('.address-label').forEach(el => el.textContent = data.couple.venueAddress);
      }
      if (data.couple.mapUrl) {
        document.querySelectorAll('.maps-btn').forEach(el => el.setAttribute('href', data.couple.mapUrl));
      }
    }

    if (data.family) {
      if (data.family.groomParentsEn) document.querySelectorAll('.groom-parents').forEach(el => el.textContent = data.family.groomParentsEn);
      if (data.family.brideParentsEn) document.querySelectorAll('.bride-parents').forEach(el => el.textContent = data.family.brideParentsEn);
    }

    if (data.media?.photoSlots) {
      const s = data.media.photoSlots;
      if (s.hero?.url) document.querySelectorAll('.hero-img').forEach(el => el.src = s.hero.url);
      if (s.gal1?.url) document.querySelectorAll('.gal-img-1').forEach(el => el.src = s.gal1.url);
      if (s.gal2?.url) document.querySelectorAll('.gal-img-2').forEach(el => el.src = s.gal2.url);
      if (s.gal3?.url) document.querySelectorAll('.gal-img-3').forEach(el => el.src = s.gal3.url);
      if (s.gal4?.url) document.querySelectorAll('.gal-img-4').forEach(el => el.src = s.gal4.url);
      if (s.gal5?.url) document.querySelectorAll('.gal-img-5').forEach(el => el.src = s.gal5.url);
      if (s.gal6?.url) document.querySelectorAll('.gal-img-6').forEach(el => el.src = s.gal6.url);
    }
  };

  window.addEventListener('message', (e) => {
    if (e.data && (e.data.type === 'UPDATE_WEDDING_DATA' || e.data.type === 'UPDATE_STATE')) {
      window.UPDATE_WEDDING_DATA(e.data.data || e.data.state || e.data);
    }
  });

})();
`;

// 3. EXACT HTML (index.html)
const htmlContent = `<!DOCTYPE html>
<html lang="en" data-lang="en" class="h-full scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>The Royal Ring — Aarav &amp; Riya · 18 January 2027</title>
  <meta name="description" content="A cinematic royal engagement invitation. Join Aarav &amp; Riya on 18 January 2027 at The Grand Palace, Udaipur." />
  
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            display: ['"Cormorant Garamond"', 'serif'],
            body: ['"Jost"', 'sans-serif'],
            deva: ['"Tiro Devanagari Hindi"', 'serif'],
          },
          colors: {
            maroon: {
              DEFAULT: '#4A0E17',
              deep: '#2D080E',
              ink: '#1A0407',
            },
            gold: {
              DEFAULT: '#C49A35',
              light: '#E8D5AD',
              deep: '#9C772F',
            },
            ivory: {
              DEFAULT: '#FAF5EB',
              warm: '#F3ECDF',
              sheet: '#FDFBF7',
            }
          }
        }
      }
    };
  </script>

  <link rel="stylesheet" href="./style.css" />
</head>
<body class="bg-ivory text-neutral-900 font-body relative min-h-screen overflow-x-hidden selection:bg-maroon selection:text-ivory">

  <!-- 🌟 Top Scroll Indicator -->
  <div id="scroll-progress-bar" class="bg-gold-foil fixed top-0 left-0 z-50 h-[2.5px] w-full origin-left transition-transform duration-100" style="transform: scaleX(0);" aria-hidden></div>

  <!-- ========================================================================= -->
  <!-- 🪔 1. CINEMATIC OPENING CEREMONY OVERLAY                                  -->
  <!-- ========================================================================= -->
  <div id="royal-opening" class="fixed inset-0 z-50 flex items-center justify-center bg-maroon-ink text-ivory overflow-hidden cursor-pointer select-none">
    <!-- Radial Ambient Backdrop -->
    <div class="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgba(74,14,23,0.6)_0%,rgba(26,4,7,0.98)_70%)] pointer-events-none"></div>

    <div class="relative z-10 max-w-lg w-full mx-4 p-8 sm:p-12 text-center space-y-6 rounded-3xl border border-gold/40 bg-maroon-deep/90 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
      
      <!-- Invocation -->
      <p class="font-deva text-gold-foil text-lg sm:text-2xl tracking-[0.14em]">
        ॥ श्री गणेशाय नमः ॥
      </p>

      <!-- Dual 3D Revolving Rings Meeting In Center -->
      <div class="relative flex items-center justify-center h-40 my-2">
        <div id="opening-ring-left" class="absolute transform -translate-x-7 sm:-translate-x-9"></div>
        <div id="opening-ring-right" class="absolute transform translate-x-7 sm:translate-x-9"></div>
      </div>

      <div class="space-y-2">
        <p class="font-body text-gold-deep/90 text-[0.62rem] uppercase tracking-royal">
          We are engaged
        </p>
        <h2 class="couple-title font-display text-3xl sm:text-5xl font-light text-ivory tracking-wide leading-tight">
          <span class="groom-name">Aarav</span>
          <span class="text-gold italic font-normal mx-1 font-display">&amp;</span>
          <span class="bride-name">Riya</span>
        </h2>
        <p class="text-xs sm:text-sm text-gold-light/80 font-light italic mt-1">
          Request the honour of your presence at their Engagement Ceremony
        </p>
      </div>

      <!-- Action Button -->
      <div class="pt-4 flex flex-col items-center gap-3">
        <button id="enter-invitation-btn" type="button" class="light-sweep bg-gold-foil text-maroon-ink font-body px-9 py-3.5 rounded-sm font-bold text-xs uppercase tracking-[0.3em] shadow-[var(--shadow-gold)] hover:scale-105 transition-transform duration-300">
          Enter Royal Invitation ➜
        </button>
        <button id="skip-opening-btn" type="button" class="text-[10px] text-gold-light/60 tracking-widest uppercase hover:text-white transition-colors">
          Skip opening ceremony
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🏰 2. HERO SECTION                                                        -->
  <!-- ========================================================================= -->
  <section id="hero" class="bg-ivory-sheet relative min-h-[100svh] overflow-hidden pt-16 pb-24 px-4 text-center">
    
    <!-- Ambient Radial Gold Background Glow -->
    <div class="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(80%_55%_at_50%_0%,rgba(232,213,173,0.55)_0%,transparent_70%)]"></div>

    <div class="relative mx-auto max-w-5xl px-4 space-y-6">
      
      <!-- Invocation -->
      <p class="font-deva text-gold-foil text-sm tracking-[0.1em] sm:text-lg">
        ॥ श्री गणेशाय नमः ॥
      </p>

      <!-- Monogram Medallion -->
      <div class="relative w-32 h-32 mx-auto flex items-center justify-center my-4">
        <div class="animate-glow-pulse absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(232,213,173,0.55)_0%,transparent_72%)]"></div>
        <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full animate-spin" style="animation-duration: 28s;">
          <circle cx="100" cy="100" r="92" fill="none" stroke="#C49A35" stroke-width="1" opacity="0.7"></circle>
          <circle cx="100" cy="100" r="80" fill="none" stroke="#C49A35" stroke-width="0.8" stroke-dasharray="4 8" opacity="0.5"></circle>
        </svg>
        <span class="monogram-text font-display text-2xl sm:text-3xl font-light text-gold-foil tracking-widest">
          A &amp; R
        </span>
      </div>

      <p class="font-body text-gold-deep/80 text-[0.62rem] tracking-royal uppercase">
        WE ARE GETTING ENGAGED
      </p>

      <!-- Main Heading -->
      <h1 class="font-display font-light text-4xl sm:text-8xl text-maroon-deep tracking-[0.02em] leading-none">
        <span class="groom-name block">Aarav</span>
        <span class="text-gold italic font-normal text-2xl sm:text-4xl my-1 block">&amp;</span>
        <span class="bride-name block">Riya</span>
      </h1>

      <!-- Gold Hairline Divider -->
      <div class="mx-auto flex w-full max-w-md items-center gap-3 px-4 my-6">
        <span class="gold-hairline h-px flex-1"></span>
        <span class="relative flex items-center justify-center">
          <span class="bg-gold-foil block w-2 h-2 rotate-45"></span>
          <span class="border border-gold/60 absolute w-5 h-5 rotate-45"></span>
        </span>
        <span class="font-body text-gold-deep/80 text-[0.6rem] tracking-royal uppercase">MONDAY</span>
        <span class="relative flex items-center justify-center">
          <span class="bg-gold-foil block w-2 h-2 rotate-45"></span>
          <span class="border border-gold/60 absolute w-5 h-5 rotate-45"></span>
        </span>
        <span class="gold-hairline h-px flex-1"></span>
      </div>

      <div class="space-y-1">
        <p class="date-label font-display text-maroon text-xl sm:text-3xl tracking-[0.22em]">
          18 January 2027
        </p>
        <p class="venue-label font-body text-neutral-600 text-xs sm:text-sm tracking-[0.26em] uppercase">
          The Grand Palace, Udaipur
        </p>
      </div>

      <!-- Framed Couple Portrait with Arched Top & Floating 3D Ring -->
      <div class="relative mx-auto mt-12 w-full max-w-md sm:max-w-lg">
        <div class="relative overflow-hidden rounded-t-[46%] border border-gold/45 p-2 sm:p-3 bg-pearl shadow-[var(--shadow-lift)]">
          <div class="relative overflow-hidden rounded-t-[46%] border border-gold/25 aspect-[4/5] bg-neutral-900">
            <img src="./assets/couple-hero.jpg" alt="Aarav and Riya" class="hero-img w-full h-full object-cover object-top" />
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-deep/70 via-transparent to-transparent"></div>
            <div class="light-sweep pointer-events-none absolute inset-0"></div>
          </div>
        </div>

        <!-- Levitating 3D Ring Ornament -->
        <div id="hero-floating-ring" class="absolute -right-3 -bottom-6 sm:-right-8 animate-bounce" style="animation-duration: 6s;"></div>
      </div>

      <!-- Explore CTA -->
      <div class="pt-8">
        <a href="#countdown" class="light-sweep bg-gold-foil text-maroon-ink font-body inline-flex h-13 items-center justify-center gap-3 rounded-sm px-9 text-[0.68rem] tracking-[0.3em] uppercase shadow-[var(--shadow-gold)] hover:scale-105 transition-transform duration-300">
          <span>Explore our celebration</span>
          <span>✨</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- ⏰ 3. COUNTDOWN SECTION                                                    -->
  <!-- ========================================================================= -->
  <section id="countdown" class="relative overflow-hidden bg-ivory py-20 sm:py-28 px-4 text-center">
    <div class="relative mx-auto max-w-4xl space-y-6">
      
      <p class="font-body text-gold-deep/80 text-[0.62rem] uppercase tracking-royal">
        COUNTING THE DAYS UNTIL WE EXCHANGE RINGS
      </p>
      
      <h2 class="font-display text-3xl sm:text-5xl text-maroon-deep font-light">
        The Auspicious Countdown
      </h2>

      <!-- 4 Tall Luxury Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto pt-6">
        <div class="card-lift p-6 rounded-sm bg-pearl border border-gold/35 shadow-[var(--shadow-lift)]">
          <span id="count-days" class="font-display text-4xl sm:text-6xl text-maroon font-light block tabular-nums">00</span>
          <span class="font-body text-[0.55rem] tracking-[0.3em] uppercase text-gold-deep block mt-2">DAYS</span>
        </div>
        <div class="card-lift p-6 rounded-sm bg-pearl border border-gold/35 shadow-[var(--shadow-lift)]">
          <span id="count-hours" class="font-display text-4xl sm:text-6xl text-maroon font-light block tabular-nums">00</span>
          <span class="font-body text-[0.55rem] tracking-[0.3em] uppercase text-gold-deep block mt-2">HOURS</span>
        </div>
        <div class="card-lift p-6 rounded-sm bg-pearl border border-gold/35 shadow-[var(--shadow-lift)]">
          <span id="count-mins" class="font-display text-4xl sm:text-6xl text-maroon font-light block tabular-nums">00</span>
          <span class="font-body text-[0.55rem] tracking-[0.3em] uppercase text-gold-deep block mt-2">MINUTES</span>
        </div>
        <div class="card-lift p-6 rounded-sm bg-pearl border border-gold/35 shadow-[var(--shadow-lift)]">
          <span id="count-secs" class="font-display text-4xl sm:text-6xl text-maroon font-light block tabular-nums">00</span>
          <span class="font-body text-[0.55rem] tracking-[0.3em] uppercase text-gold-deep block mt-2">SECONDS</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 💍 4. 3D RING CEREMONY SHOWCASE                                           -->
  <!-- ========================================================================= -->
  <section id="ceremony" class="bg-royal relative overflow-hidden py-24 sm:py-32 text-ivory text-center px-4">
    <div class="relative mx-auto max-w-5xl space-y-8">
      
      <p class="font-body text-gold-light/75 text-[0.62rem] uppercase tracking-royal">
        ॥ मुद्रिका संस्कार व सगाई ॥
      </p>

      <h2 class="font-display text-4xl sm:text-6xl text-ivory font-light">
        The Ring Ceremony
      </h2>

      <p class="text-sm sm:text-base text-ivory/80 font-light max-w-lg mx-auto leading-relaxed italic">
        Two rings, two vows, and a lifetime of happiness woven under the desert stars.
      </p>

      <!-- 3D Large Revolving Ring -->
      <div class="flex items-center justify-center my-10">
        <div id="ceremony-showcase-ring"></div>
      </div>

      <!-- 3 Glass Dark Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
        <div class="glass-dark p-6 rounded-sm space-y-2 card-lift border border-gold/30">
          <span class="text-2xl">💍</span>
          <h4 class="font-display text-xl text-gold-light">Ring Exchange</h4>
          <p class="text-xs text-ivory/70">8:00 PM · Sheesh Mahal Courtyard</p>
        </div>
        <div class="glass-dark p-6 rounded-sm space-y-2 card-lift border border-gold/30">
          <span class="text-2xl">✨</span>
          <h4 class="font-display text-xl text-gold-light">Auspicious Muhurat</h4>
          <p class="text-xs text-ivory/70">6:30 PM Onwards · Durbar Hall</p>
        </div>
        <div class="glass-dark p-6 rounded-sm space-y-2 card-lift border border-gold/30">
          <span class="text-2xl">🥂</span>
          <h4 class="font-display text-xl text-gold-light">Celebration Feast</h4>
          <p class="text-xs text-ivory/70">9:30 PM · Lakeside Lawn</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 📖 5. OUR STORY TIMELINE                                                   -->
  <!-- ========================================================================= -->
  <section id="story" class="relative overflow-hidden bg-ivory-warm/60 py-24 sm:py-32 px-4">
    <div class="relative mx-auto max-w-5xl space-y-12 text-center">
      
      <div class="space-y-2">
        <p class="font-body text-gold-deep/80 text-[0.62rem] uppercase tracking-royal">HOW OUR STORY BEGAN</p>
        <h2 class="font-display text-3xl sm:text-5xl text-maroon-deep font-light">Our Journey</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
        <!-- Milestone 1 -->
        <div class="card-lift p-5 rounded-sm bg-pearl border border-gold/30 shadow-[var(--shadow-lift)] space-y-4">
          <div class="overflow-hidden rounded-sm aspect-[16/10]">
            <img src="./assets/gal-2.jpg" alt="A Monsoon Meeting" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div>
            <span class="font-body text-xs font-bold text-maroon bg-gold-light/40 px-2.5 py-0.5 rounded-full">2019</span>
            <h4 class="font-display text-xl text-maroon-deep mt-2">A Monsoon Meeting</h4>
            <p class="text-xs text-neutral-600 leading-relaxed mt-1">A crowded Jaipur bookstore, one shared umbrella in the first monsoon rain, and a conversation that refused to end.</p>
          </div>
        </div>

        <!-- Milestone 2 -->
        <div class="card-lift p-5 rounded-sm bg-pearl border border-gold/30 shadow-[var(--shadow-lift)] space-y-4">
          <div class="overflow-hidden rounded-sm aspect-[16/10]">
            <img src="./assets/gal-5.jpg" alt="The First Journey" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div>
            <span class="font-body text-xs font-bold text-maroon bg-gold-light/40 px-2.5 py-0.5 rounded-full">2021</span>
            <h4 class="font-display text-xl text-maroon-deep mt-2">The First Journey</h4>
            <p class="text-xs text-neutral-600 leading-relaxed mt-1">Two train tickets to Udaipur, and a promise made quietly beside Lake Pichola.</p>
          </div>
        </div>

        <!-- Milestone 3 -->
        <div class="card-lift p-5 rounded-sm bg-pearl border border-gold/30 shadow-[var(--shadow-lift)] space-y-4">
          <div class="overflow-hidden rounded-sm aspect-[16/10]">
            <img src="./assets/gal-4.jpg" alt="Home, Together" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div>
            <span class="font-body text-xs font-bold text-maroon bg-gold-light/40 px-2.5 py-0.5 rounded-full">2024</span>
            <h4 class="font-display text-xl text-maroon-deep mt-2">Home, Together</h4>
            <p class="text-xs text-neutral-600 leading-relaxed mt-1">A little apartment, too many plants, and mornings that finally felt complete.</p>
          </div>
        </div>

        <!-- Milestone 4 -->
        <div class="card-lift p-5 rounded-sm bg-pearl border border-gold/30 shadow-[var(--shadow-lift)] space-y-4">
          <div class="overflow-hidden rounded-sm aspect-[16/10]">
            <img src="./assets/gal-1.jpg" alt="The Question" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div>
            <span class="font-body text-xs font-bold text-maroon bg-gold-light/40 px-2.5 py-0.5 rounded-full">2026</span>
            <h4 class="font-display text-xl text-maroon-deep mt-2">The Question</h4>
            <p class="text-xs text-neutral-600 leading-relaxed mt-1">A palace terrace at dusk, a velvet box, and the easiest yes ever spoken.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 👨‍👩‍👧‍👦 6. FAMILY BLESSINGS                                                   -->
  <!-- ========================================================================= -->
  <section id="family" class="relative overflow-hidden bg-ivory py-24 sm:py-32 px-4">
    <div class="relative mx-auto max-w-5xl space-y-12 text-center">
      <div class="space-y-2">
        <p class="font-body text-gold-deep/80 text-[0.62rem] uppercase tracking-royal">WITH THE BLESSINGS OF</p>
        <h2 class="font-display text-3xl sm:text-5xl text-maroon-deep font-light">Our Families</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
        <div class="card-lift relative overflow-hidden rounded-sm border border-gold/30 bg-pearl shadow-[var(--shadow-lift)]">
          <img src="./assets/gal-3.jpg" alt="Groom's Parents" class="aspect-[3/4] w-full object-cover" />
          <div class="p-3.5">
            <p class="font-body text-[0.5rem] tracking-[0.3em] uppercase text-gold-deep">GROOM'S PARENTS</p>
            <h3 class="groom-parents font-display text-sm sm:text-base font-light text-maroon-deep mt-1">Shri Rajendra &amp; Smt. Meera Singhania</h3>
          </div>
        </div>

        <div class="card-lift relative overflow-hidden rounded-sm border border-gold/30 bg-pearl shadow-[var(--shadow-lift)]">
          <img src="./assets/gal-2.jpg" alt="Bride's Parents" class="aspect-[3/4] w-full object-cover" />
          <div class="p-3.5">
            <p class="font-body text-[0.5rem] tracking-[0.3em] uppercase text-gold-deep">BRIDE'S PARENTS</p>
            <h3 class="bride-parents font-display text-sm sm:text-base font-light text-maroon-deep mt-1">Shri Vikram &amp; Smt. Anita Rathore</h3>
          </div>
        </div>

        <div class="card-lift relative overflow-hidden rounded-sm border border-gold/30 bg-pearl shadow-[var(--shadow-lift)]">
          <img src="./assets/gal-6.jpg" alt="Grandmother" class="aspect-[3/4] w-full object-cover" />
          <div class="p-3.5">
            <p class="font-body text-[0.5rem] tracking-[0.3em] uppercase text-gold-deep">GROOM'S GRANDMOTHER</p>
            <h3 class="font-display text-sm sm:text-base font-light text-maroon-deep mt-1">Smt. Kamla Devi Singhania</h3>
          </div>
        </div>

        <div class="card-lift relative overflow-hidden rounded-sm border border-gold/30 bg-pearl shadow-[var(--shadow-lift)]">
          <img src="./assets/gal-5.jpg" alt="Sister" class="aspect-[3/4] w-full object-cover" />
          <div class="p-3.5">
            <p class="font-body text-[0.5rem] tracking-[0.3em] uppercase text-gold-deep">BRIDE'S SISTER</p>
            <h3 class="font-display text-sm sm:text-base font-light text-maroon-deep mt-1">Ananya Rathore</h3>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 📅 7. CELEBRATION TIMELINE & MAPS                                         -->
  <!-- ========================================================================= -->
  <section id="events" class="bg-royal relative overflow-hidden py-24 sm:py-32 text-ivory px-4">
    <div class="relative mx-auto max-w-5xl space-y-12 text-center">
      <div class="space-y-2">
        <p class="font-body text-gold-light/75 text-[0.62rem] uppercase tracking-royal">THE ORDER OF CELEBRATION</p>
        <h2 class="font-display text-3xl sm:text-5xl text-ivory font-light">Celebration Timeline</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <article class="glass-dark card-lift p-7 rounded-sm border border-gold/30 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-2xl">🪔</span>
            <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gold-light/20 text-gold-light">06:30 PM</span>
          </div>
          <h3 class="font-display text-2xl font-light text-ivory">Engagement Ceremony</h3>
          <p class="text-xs text-ivory/70">Traditional Royal Welcome &amp; Tilak Rasam with shehnai blessings.</p>
          <div class="text-[11px] space-y-1 border-t border-gold/15 pt-3 text-gold-light/80">
            <p>📍 Durbar Hall, The Grand Palace</p>
            <p>👔 Dress Code: Royal Maroon &amp; Gold</p>
          </div>
          <a href="https://maps.google.com/?q=The+Grand+Palace+Udaipur" target="_blank" rel="noreferrer" class="maps-btn font-body inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-gold-foil text-[0.56rem] tracking-[0.28em] uppercase text-maroon-ink">
            Get Directions ➜
          </a>
        </article>

        <article class="glass-dark card-lift p-7 rounded-sm border-2 border-gold space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-2xl">💍</span>
            <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gold text-maroon-ink font-bold">08:00 PM</span>
          </div>
          <h3 class="font-display text-2xl font-light text-ivory">Ring Exchange</h3>
          <p class="text-xs text-ivory/70">The sacred exchange of rings under the illuminated courtyard canopy.</p>
          <div class="text-[11px] space-y-1 border-t border-gold/15 pt-3 text-gold-light/80">
            <p>📍 Sheesh Mahal Courtyard</p>
            <p>👔 Dress Code: Formal Ivory &amp; Champagne</p>
          </div>
          <a href="https://maps.google.com/?q=The+Grand+Palace+Udaipur" target="_blank" rel="noreferrer" class="maps-btn font-body inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-gold-foil text-[0.56rem] tracking-[0.28em] uppercase text-maroon-ink">
            Get Directions ➜
          </a>
        </article>

        <article class="glass-dark card-lift p-7 rounded-sm border border-gold/30 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-2xl">🥂</span>
            <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gold-light/20 text-gold-light">09:30 PM</span>
          </div>
          <h3 class="font-display text-2xl font-light text-ivory">Dinner &amp; Celebration</h3>
          <p class="text-xs text-ivory/70">Royal Rajasthani banquet feast, music, and toasts to the couple.</p>
          <div class="text-[11px] space-y-1 border-t border-gold/15 pt-3 text-gold-light/80">
            <p>📍 Lakeside Lawn, Pichola Wing</p>
            <p>👔 Dress Code: Elegant Festive</p>
          </div>
          <a href="https://maps.google.com/?q=The+Grand+Palace+Udaipur" target="_blank" rel="noreferrer" class="maps-btn font-body inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-gold-foil text-[0.56rem] tracking-[0.28em] uppercase text-maroon-ink">
            Get Directions ➜
          </a>
        </article>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 📸 8. COUPLE PHOTO GALLERY                                                -->
  <!-- ========================================================================= -->
  <section id="gallery" class="relative overflow-hidden bg-ivory-warm/60 py-24 sm:py-32 px-4">
    <div class="relative mx-auto max-w-5xl space-y-12 text-center">
      <div class="space-y-2">
        <p class="font-body text-gold-deep/80 text-[0.62rem] uppercase tracking-royal">MEMORIES &amp; MOMENTS</p>
        <h2 class="font-display text-3xl sm:text-5xl text-maroon-deep font-light">Couple Gallery</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-1.jpg" alt="Gallery 1" class="gallery-thumb gal-img-1 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-2.jpg" alt="Gallery 2" class="gallery-thumb gal-img-2 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-3.jpg" alt="Gallery 3" class="gallery-thumb gal-img-3 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-4.jpg" alt="Gallery 4" class="gallery-thumb gal-img-4 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-5.jpg" alt="Gallery 5" class="gallery-thumb gal-img-5 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="overflow-hidden rounded-sm aspect-[3/4] border border-gold/30 shadow-[var(--shadow-lift)] cursor-pointer group">
          <img src="./assets/gal-6.jpg" alt="Gallery 6" class="gallery-thumb gal-img-6 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>
    </div>
  </section>

  <!-- Lightbox Modal -->
  <div id="gallery-lightbox" class="fixed inset-0 z-50 bg-black/92 hidden items-center justify-center p-4">
    <button id="close-lightbox-btn" type="button" class="absolute top-6 right-6 text-white text-3xl font-bold cursor-pointer">×</button>
    <img id="lightbox-img" src="" alt="Enlarged photo" class="max-w-full max-h-[85vh] rounded-sm shadow-2xl object-contain border border-gold/40" />
  </div>

  <!-- ========================================================================= -->
  <!-- 📍 9. VENUE & MAP                                                         -->
  <!-- ========================================================================= -->
  <section id="venue" class="relative overflow-hidden bg-ivory py-24 sm:py-32 px-4 text-center">
    <div class="relative mx-auto max-w-4xl space-y-10">
      <div class="space-y-2">
        <p class="font-body text-gold-deep/80 text-[0.62rem] uppercase tracking-royal">CELEBRATION VENUE</p>
        <h2 class="font-display text-3xl sm:text-5xl text-maroon-deep font-light">The Grand Palace</h2>
      </div>

      <div class="relative rounded-sm overflow-hidden shadow-[var(--shadow-lift)] border border-gold/40 max-w-3xl mx-auto">
        <img src="./assets/venue.jpg" alt="The Grand Palace" class="w-full aspect-[16/9] object-cover" />
        <div class="p-8 bg-pearl text-left space-y-4">
          <div>
            <h4 class="venue-label font-display text-2xl sm:text-3xl text-maroon-deep font-light">The Grand Palace, Udaipur</h4>
            <p class="address-label text-xs text-neutral-600 mt-1">Lake Pichola Road, Udaipur, Rajasthan 313001</p>
          </div>
          <a href="https://maps.google.com/?q=The+Grand+Palace+Udaipur" target="_blank" rel="noreferrer" class="maps-btn light-sweep bg-gold-foil text-maroon-ink font-body inline-flex h-12 items-center justify-center gap-3 rounded-sm px-8 text-xs tracking-[0.28em] uppercase shadow-[var(--shadow-gold)]">
            <span>📍</span>
            <span>Get Driving Directions ➜</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 💌 10. RSVP FORM                                                          -->
  <!-- ========================================================================= -->
  <section id="rsvp" class="bg-royal relative overflow-hidden py-24 sm:py-32 text-ivory px-4">
    <div class="max-w-xl mx-auto text-center space-y-8">
      <div class="space-y-2">
        <p class="font-body text-gold-light/75 text-[0.62rem] uppercase tracking-royal">PLEASE RESPOND</p>
        <h2 class="font-display text-3xl sm:text-5xl text-gold-light font-light">RSVP &amp; Wishes</h2>
        <p class="text-xs sm:text-sm text-ivory/80 font-light italic">Kindly confirm your presence by 10 January 2027.</p>
      </div>

      <form id="shahi-rsvp-form" class="glass-dark p-8 rounded-sm border border-gold/40 text-left space-y-5 shadow-2xl">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Your Full Name *</label>
          <input type="text" name="guest_name" required placeholder="e.g. Ramesh Sharma" class="w-full px-4 py-3 rounded-sm bg-maroon-ink/80 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Mobile Number (WhatsApp) *</label>
          <input type="tel" name="guest_phone" required placeholder="e.g. +91 9876543210" class="w-full px-4 py-3 rounded-sm bg-maroon-ink/80 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-2">Will you be attending? *</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 p-3 rounded-sm bg-maroon-ink/60 border border-gold/30 cursor-pointer hover:border-gold">
              <input type="radio" name="attending" value="yes" checked class="text-gold" />
              <span class="text-xs font-bold">Joyfully Accept 🎉</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-sm bg-maroon-ink/60 border border-gold/30 cursor-pointer hover:border-gold">
              <input type="radio" name="attending" value="no" class="text-gold" />
              <span class="text-xs font-bold">Regretfully Decline</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Number of Guests</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-sm bg-maroon-ink/80 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Persons</option>
            <option value="3">3 Persons</option>
            <option value="4">4 Persons</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Warm Wishes &amp; Blessings</label>
          <textarea name="wishes" rows="3" placeholder="Write your heartfelt blessings for Aarav &amp; Riya..." class="w-full px-4 py-3 rounded-sm bg-maroon-ink/80 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold"></textarea>
        </div>

        <button type="submit" class="light-sweep w-full py-4 rounded-sm bg-gold-foil text-maroon-ink font-bold text-xs uppercase tracking-[0.25em] shadow-[var(--shadow-gold)] hover:scale-102 transition-transform cursor-pointer">
          Send RSVP &amp; Blessings ➜
        </button>

        <p id="rsvp-status-msg" class="text-center text-xs font-bold text-gold-light hidden"></p>
      </form>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 🌟 11. FINALE                                                             -->
  <!-- ========================================================================= -->
  <footer class="py-20 text-center space-y-4 px-4 bg-maroon-ink text-ivory border-t border-gold/20">
    <p class="font-deva text-gold-foil text-2xl tracking-widest">॥ शुभारंभ ॥</p>
    <p class="font-display text-2xl sm:text-3xl text-gold-light font-light">Two hearts. One beautiful beginning.</p>
    <p class="couple-title font-display text-lg text-ivory/80">Aarav &amp; Riya</p>
    <p class="text-[10px] text-neutral-500 tracking-widest uppercase pt-4">
      Shahi Studio™ Royal Engagement Invitation
    </p>
  </footer>

  <!-- ========================================================================= -->
  <!-- 🎛️ 12. FLOATING CONTROL DOCK (MUSIC SYNTHESIZER, SHARE & RSVP JUMP)       -->
  <!-- ========================================================================= -->
  <div class="fixed bottom-5 inset-x-0 z-40 px-4 pointer-events-none flex justify-center">
    <div class="glass-ivory pointer-events-auto flex items-center gap-2.5 p-1.5 rounded-full border border-gold/50 shadow-[var(--shadow-gold)]">
      
      <!-- Music Synth Toggle -->
      <button id="floating-music-btn" type="button" class="group flex h-11 items-center gap-2.5 rounded-full px-3.5 bg-pearl/90 border border-gold/40 hover:scale-105 transition-transform cursor-pointer" title="Toggle Ambient Sitar Synth">
        <span class="bg-gold-foil text-maroon-ink flex size-7 items-center justify-center rounded-full text-xs font-bold">
          🎵
        </span>
        <span class="flex h-4 items-end gap-[3px]" aria-hidden>
          <span class="music-wave-bar bg-gold-foil w-[2px] h-3 rounded-full opacity-35"></span>
          <span class="music-wave-bar bg-gold-foil w-[2px] h-4 rounded-full opacity-35"></span>
          <span class="music-wave-bar bg-gold-foil w-[2px] h-2 rounded-full opacity-35"></span>
          <span class="music-wave-bar bg-gold-foil w-[2px] h-4 rounded-full opacity-35"></span>
        </span>
        <span id="music-btn-label" class="font-body text-maroon-deep text-[0.55rem] tracking-[0.24em] uppercase font-bold hidden sm:block">
          Music
        </span>
      </button>

      <!-- Share Button -->
      <button id="floating-share-btn" type="button" class="flex size-11 items-center justify-center rounded-full bg-pearl/90 border border-gold/40 hover:scale-105 transition-transform cursor-pointer" title="Share Invitation">
        <span class="text-maroon text-sm">📤</span>
      </button>

      <!-- Jump to RSVP -->
      <a href="#rsvp" class="bg-gold-foil text-maroon-ink font-body h-11 px-5 flex items-center justify-center rounded-full text-[0.58rem] font-bold tracking-[0.22em] uppercase hover:scale-105 transition-transform">
        RSVP
      </a>
    </div>
  </div>

  <!-- WhatsApp Share Modal -->
  <div id="share-modal" class="fixed inset-0 z-50 bg-black/85 hidden items-center justify-center p-4">
    <div class="glass-ivory max-w-md w-full p-6 rounded-2xl space-y-4 text-center border border-gold/50 shadow-2xl relative">
      <button id="close-share-btn" type="button" class="absolute top-4 right-4 text-maroon text-xl font-bold cursor-pointer">×</button>
      <h3 class="font-display text-2xl text-maroon font-bold">Share Royal Invitation</h3>
      <p class="text-xs text-neutral-600">Send this auspicious engagement invitation to your family &amp; friends.</p>
      <textarea id="share-text-area" rows="4" class="w-full p-3 rounded-xl bg-ivory border border-gold/40 text-xs text-neutral-800" readonly>॥ श्री गणेशाय नमः ॥

We are engaged!
Aarav &amp; Riya
18 January 2027 · The Grand Palace, Udaipur

With your blessings, join our celebration:
https://shahistudio.com/i/aarav-riya</textarea>
      <button id="copy-share-btn" type="button" class="w-full py-3 rounded-xl bg-gold-foil text-maroon-ink font-bold text-xs uppercase tracking-wider shadow-md">
        Copy Invitation Link
      </button>
    </div>
  </div>

  <!-- Scripts -->
  <script src="./app.js"></script>
  <script src="/templates/shared-rsvp.js"></script>
</body>
</html>
`;

// Write all files
fs.writeFileSync(path.join(templateDir, 'style.css'), styleCss, 'utf8');
fs.writeFileSync(path.join(templateDir, 'app.js'), appJs, 'utf8');
fs.writeFileSync(path.join(templateDir, 'index.html'), htmlContent, 'utf8');

console.log('Successfully written exact Royal Ring template files to', templateDir);

