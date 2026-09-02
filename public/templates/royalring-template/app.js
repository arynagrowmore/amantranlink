/* ========================================================================= */
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
    tiltBox.style.transform = `rotateX(${tilt}deg)`;

    const spinBox = document.createElement('div');
    spinBox.className = 'preserve-3d absolute inset-0';
    spinBox.style.animation = `ring-spin ${speed}s linear infinite`;

    // Slices
    for (let i = 0; i < slices; i++) {
      const z = (i - (slices - 1) / 2) * step;
      const edge = Math.abs(i - (slices - 1) / 2) / ((slices - 1) / 2);
      const inset = size * 0.005 * edge * 6;
      const lightness = 0.58 + (1 - edge) * 0.3;

      const slice = document.createElement('span');
      slice.className = 'absolute rounded-full';
      slice.style.inset = inset + 'px';
      slice.style.transform = `translateZ(${z}px)`;
      slice.style.border = `${size * 0.075}px solid transparent`;
      slice.style.borderRadius = '50%';
      slice.style.background = `conic-gradient(from 210deg,
        #9c772f 0deg,
        #fbf4e4 55deg,
        #c49a35 120deg,
        #7c5c20 195deg,
        #e8d5ad 265deg,
        #c49a35 330deg,
        #9c772f 360deg)`;
      slice.style.webkitMask = `radial-gradient(circle, transparent 0 ${size * 0.5 - size * 0.075}px, #000 ${size * 0.5 - size * 0.075 + 0.5}px)`;
      slice.style.mask = `radial-gradient(circle, transparent 0 ${size * 0.5 - size * 0.075}px, #000 ${size * 0.5 - size * 0.075 + 0.5}px)`;
      slice.style.opacity = String(0.7 + (1 - edge) * 0.3);
      spinBox.appendChild(slice);
    }

    // Sheen
    const sheen = document.createElement('span');
    sheen.className = 'absolute inset-0 rounded-full';
    sheen.style.transform = `translateZ(${thickness / 2 + 0.4}px)`;
    sheen.style.border = `${size * 0.075}px solid transparent`;
    sheen.style.background = 'conic-gradient(from 150deg, transparent 0deg, rgba(255,255,255,0.75) 40deg, transparent 90deg, transparent 240deg, rgba(255,255,255,0.45) 285deg, transparent 330deg)';
    sheen.style.webkitMask = `radial-gradient(circle, transparent 0 ${size * 0.5 - size * 0.075}px, #000 ${size * 0.5 - size * 0.075 + 0.5}px)`;
    sheen.style.mask = `radial-gradient(circle, transparent 0 ${size * 0.5 - size * 0.075}px, #000 ${size * 0.5 - size * 0.075 + 0.5}px)`;
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
      stoneHolder.style.transform = `translateZ(${thickness / 2}px)`;

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
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
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
      document.querySelectorAll('.couple-title').forEach(el => el.textContent = `${g} & ${b}`);
      document.querySelectorAll('.monogram-text').forEach(el => el.textContent = `${g.charAt(0)} & ${b.charAt(0)}`);

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
