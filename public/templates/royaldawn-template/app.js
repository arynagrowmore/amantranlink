// 👑 Royal Dawn Experience — 100% Complete Exhaustive Live Sync Engine
(function() {
  'use strict';

  let isAudioPlaying = false;
  let audioEl = null;
  let targetMs = new Date("2026-12-08T18:30:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', () => {
    initGates();
    initPetals();
    initAudio();
    initCountdown();
    initScratchCard();
    initStudioSync();

    // If initial config exists
    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🏰 3D Gate Open on Wax Seal Touch
  function initGates() {
    const gateOverlay = document.getElementById('gateOverlay');
    const sealBtn = document.getElementById('gateSealBtn');
    const mainApp = document.getElementById('mainApp');

    if (!gateOverlay || !sealBtn) return;

    function openGate() {
      if (gateOverlay.classList.contains('gates-open')) return;
      gateOverlay.classList.add('gates-open');

      // Play audio automatically upon opening
      playAudio();

      setTimeout(() => {
        if (mainApp) {
          mainApp.style.opacity = '1';
        }
      }, 800);

      setTimeout(() => {
        gateOverlay.style.opacity = '0';
        gateOverlay.style.pointerEvents = 'none';
      }, 2100);
    }

    sealBtn.addEventListener('click', openGate);
    gateOverlay.addEventListener('click', (e) => {
      if (e.target.closest('#gateSealBtn')) return;
      openGate();
    });
  }

  // 2. 🌸 Continuous Floating Rose Petals
  function initPetals() {
    const container = document.getElementById('petalsContainer');
    if (!container) return;

    const petals = ['🌸', '🪷', '✨', '🌸', '🪷'];
    const count = 15;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'floating-petal';
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.fontSize = `${Math.random() * 14 + 14}px`;
      petal.style.animationDuration = `${Math.random() * 8 + 8}s`;
      petal.style.animationDelay = `${Math.random() * 6}s`;
      container.appendChild(petal);
    }
  }

  // 3. 🎶 Audio Engine
  function initAudio() {
    audioEl = document.getElementById('bgAudio');
    const audioBtn = document.getElementById('audioToggleBtn');

    if (!audioEl || !audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (isAudioPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  function playAudio() {
    if (!audioEl) return;
    audioEl.play().then(() => {
      isAudioPlaying = true;
      const bars = document.getElementById('audioBars');
      if (bars) bars.style.opacity = '1';
    }).catch(() => {});
  }

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    isAudioPlaying = false;
    const bars = document.getElementById('audioBars');
    if (bars) bars.style.opacity = '0.3';
  }

  // 4. ⏰ Live Countdown Timer
  function initCountdown() {
    function tick() {
      const diff = Math.max(0, targetMs - Date.now());

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cDays');
      const hEl = document.getElementById('cHours');
      const mEl = document.getElementById('cMins');
      const sEl = document.getElementById('cSecs');

      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
  }

  // 5. 🪔 Royal Scratch Date Reveal Engine (60fps Touch/Pointer + Auto-Threshold Reveal)
  let isScratchRevealed = false;

  function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    const container = document.getElementById('scratchCardContainer');
    const statusText = document.getElementById('scratchStatusText');
    const ctaWrap = document.getElementById('scratchCtaWrap');
    const fallbackBtn = document.getElementById('scratchFallbackBtn');
    const fallbackWrap = document.getElementById('scratchFallbackWrap');

    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // High-DPI Canvas Resolution Sizing
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 420;
    const height = rect.height || 280;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    function drawFoilSurface() {
      // Rich 24K Antique Gold Foil Texture
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#F5E6CC');
      grad.addColorStop(0.2, '#D4AF37');
      grad.addColorStop(0.45, '#AA7C11');
      grad.addColorStop(0.7, '#D4AF37');
      grad.addColorStop(1, '#996515');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gold Sparkle Dust Pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 37 + 13) % width;
        const sy = (i * 29 + 19) % height;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ornamental Double Hairline Border
      ctx.strokeStyle = '#4A0E17';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      // Center Crest Icon
      ctx.fillStyle = '#4A0E17';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑', width / 2, height / 2 - 28);

      // Foil Typography
      ctx.font = 'bold 13px "Jost", sans-serif';
      ctx.fillText('✦ SCRATCH TO REVEAL ✦', width / 2, height / 2 + 6);

      ctx.font = '600 10px "Jost", sans-serif';
      ctx.fillStyle = '#5A121D';
      ctx.fillText('THE AUSPICIOUS WEDDING DATE', width / 2, height / 2 + 24);

      ctx.font = 'italic 9px "Jost", sans-serif';
      ctx.fillStyle = '#3A0810';
      ctx.fillText('(Rub with finger or mouse)', width / 2, height / 2 + 42);
    }

    if (!isScratchRevealed) {
      drawFoilSurface();
    } else {
      revealFullDate(false);
    }

    // Complete Reveal Ceremony
    function revealFullDate(animate = true) {
      if (isScratchRevealed && !animate) return;
      isScratchRevealed = true;

      if (container) {
        container.classList.add('revealed-glow');
      }
      if (statusText) {
        statusText.textContent = 'DATE REVEALED ✨';
      }
      if (ctaWrap) {
        ctaWrap.style.opacity = '1';
        ctaWrap.style.pointerEvents = 'auto';
      }
      if (fallbackWrap) {
        fallbackWrap.style.display = 'none';
      }

      if (animate) {
        canvas.style.opacity = '0';
        canvas.style.transform = 'scale(1.03)';
        setTimeout(() => {
          canvas.style.pointerEvents = 'none';
        }, 700);

        // Trigger celebratory petal burst if available
        triggerCelebratorySparkles();
      } else {
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
      }
    }

    function triggerCelebratorySparkles() {
      const parent = container?.parentElement;
      if (!parent) return;
      for (let i = 0; i < 16; i++) {
        const s = document.createElement('div');
        s.textContent = ['✨', '🌸', '🪔', '💛', '👑'][i % 5];
        s.style.position = 'absolute';
        s.style.left = `${50 + (Math.random() * 40 - 20)}%`;
        s.style.top = `${50 + (Math.random() * 30 - 15)}%`;
        s.style.fontSize = '18px';
        s.style.pointerEvents = 'none';
        s.style.transition = 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
        s.style.zIndex = '30';
        parent.appendChild(s);

        setTimeout(() => {
          s.style.transform = `translate(${(Math.random() - 0.5) * 160}px, ${(Math.random() - 0.5) * 140 - 30}px) scale(0)`;
          s.style.opacity = '0';
        }, 30);

        setTimeout(() => s.remove(), 950);
      }
    }

    // Accessible Fallback Tap Button
    if (fallbackBtn) {
      fallbackBtn.addEventListener('click', () => {
        revealFullDate(true);
      });
    }

    // Scratch Touch / Pointer Event Logic
    let isScratching = false;
    let strokesCount = 0;

    function scratch(e) {
      if (!isScratching || isScratchRevealed) return;
      const b = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      const x = cx - b.left;
      const y = cy - b.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2, false);
      ctx.fill();

      strokesCount++;
      // Sample percentage every 8 strokes
      if (strokesCount % 8 === 0) {
        checkRevealThreshold();
      }
    }

    function checkRevealThreshold() {
      if (isScratchRevealed) return;
      try {
        // Downscale sample stride for high performance 60fps check
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        const totalSampled = pixels.length / 16; // sample every 4th pixel
        let transparentCount = 0;

        for (let i = 3; i < pixels.length; i += 16) {
          if (pixels[i] < 128) {
            transparentCount++;
          }
        }

        const percentage = transparentCount / totalSampled;
        // Trigger at 25% - 30% coverage threshold
        if (percentage >= 0.26) {
          revealFullDate(true);
        }
      } catch (e) {
        // In case of any canvas security context fallback
      }
    }

    canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(e); });
    window.addEventListener('mouseup', () => { 
      if (isScratching) {
        isScratching = false; 
        checkRevealThreshold();
      }
    });
    canvas.addEventListener('mousemove', scratch);

    canvas.addEventListener('touchstart', (e) => { isScratching = true; scratch(e); }, { passive: true });
    window.addEventListener('touchend', () => { 
      if (isScratching) {
        isScratching = false; 
        checkRevealThreshold();
      }
    });
    canvas.addEventListener('touchmove', scratch, { passive: true });
  }

  // Helper for Photo Filter CSS
  function getFilterCss(filter) {
    if (!filter || filter === 'none') return 'none';
    if (filter === 'gold-glow') return 'sepia(35%) saturate(140%) brightness(105%) contrast(105%)';
    if (filter === 'vintage') return 'sepia(60%) contrast(110%) brightness(95%) saturate(90%)';
    if (filter === 'rose-blush') return 'saturate(120%) brightness(105%) hue-rotate(-10deg) contrast(102%)';
    if (filter === 'monochrome') return 'grayscale(100%) contrast(120%) brightness(100%)';
    return 'none';
  }

  // 6. 🔄 100% EXHAUSTIVE REAL-TIME STUDIO APPLIER
  function applyWeddingData(data) {
    if (!data) return;

    const lang = data.language || 'en';

    // 0. Dynamic Template / Theme Name
    const templateName = data.templateName || data.themeTitle || 'Royal Vivah Celebration';
    document.querySelectorAll('.data-template-name').forEach(el => el.textContent = templateName);

    // 1. Groom & Bride Names across languages
    let groom = data.couple?.groomEn || data.groomName || 'Dhruv';
    let bride = data.couple?.brideEn || data.brideName || 'Shreya';

    if (lang === 'hi') {
      groom = data.couple?.groomHi || groom;
      bride = data.couple?.brideHi || bride;
    } else if (lang === 'gu') {
      groom = data.couple?.groomGu || groom;
      bride = data.couple?.brideGu || bride;
    }

    document.querySelectorAll('.data-groom-name, .groom-name, #groom-name').forEach(el => el.textContent = groom);
    document.querySelectorAll('.data-bride-name, .bride-name, #bride-name').forEach(el => el.textContent = bride);
    document.querySelectorAll('.data-couple-names').forEach(el => el.textContent = `${groom} & ${bride}`);

    // 2. Monogram / Mark
    const mark = data.couple?.mark || data.mark || `${groom.charAt(0)} · ${bride.charAt(0)}`;
    document.querySelectorAll('.data-monogram, .monogram, .couple-mark').forEach(el => el.textContent = mark);

    // 3. Wedding Hashtag
    const hashtag = data.couple?.hashtag || data.hashtag || `#${groom}Ki${bride}`;
    document.querySelectorAll('.data-hashtag, .hashtag').forEach(el => el.textContent = hashtag);

    // 4. Wedding Date & Live Countdown Parser
    const rawDate = data.couple?.weddingDate || data.weddingDate || '3 December 2026';
    document.querySelectorAll('.data-wedding-date, .wedding-date').forEach(el => el.textContent = rawDate);

    // Extract Day and Month/Year for Reveal Card
    const dateMatch = rawDate.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    let revealDay = '03';
    let revealMonthYear = 'DECEMBER 2026';
    if (dateMatch) {
      revealDay = String(dateMatch[1]).padStart(2, '0');
      revealMonthYear = `${dateMatch[2].toUpperCase()} ${dateMatch[3]}`;
    }

    document.querySelectorAll('.data-reveal-day, #revealDay').forEach(el => el.textContent = revealDay);
    document.querySelectorAll('.data-reveal-month-year, #revealMonthYear').forEach(el => el.textContent = revealMonthYear);

    // Muhurat Time
    const rawMuhurat = data.couple?.muhuratTime || '06:30 PM';
    document.querySelectorAll('.data-reveal-time, #revealTime').forEach(el => {
      el.textContent = `⏰ ${rawMuhurat} MUHURAT`;
    });

    const cleanDate = rawDate.split('·')[0].split('(')[0].trim();
    const parsed = Date.parse(cleanDate);
    if (!isNaN(parsed)) {
      targetMs = parsed;
    }

    // 5. Venue Name & Address
    const venue = data.couple?.venueName || data.venue || 'The Milestone';
    const city = data.couple?.venueAddress || data.city || 'Himmatnagar, Gujarat';
    const fullVenue = `${venue}, ${city}`;
    document.querySelectorAll('.data-venue, .venue-text').forEach(el => el.textContent = fullVenue);
    document.querySelectorAll('.data-reveal-venue, #revealVenue').forEach(el => el.textContent = `📍 ${fullVenue}`);
    document.querySelectorAll('.data-city').forEach(el => el.textContent = city);

    // 6. Map Link
    const mapUrl = data.couple?.mapUrl || 'https://maps.google.com';
    document.querySelectorAll('.data-map-btn, a[href*="maps"]').forEach(el => el.setAttribute('href', mapUrl));

    // 7. Parents & Relatives Lineage
    let groomParents = data.family?.groomParentsEn || 'Mr. Nalinkumar & Mrs. Kalpuben';
    let brideParents = data.family?.brideParentsEn || 'Mr. & Mrs. Sharma';
    if (lang === 'hi') {
      groomParents = data.family?.groomParentsHi || groomParents;
      brideParents = data.family?.brideParentsHi || brideParents;
    } else if (lang === 'gu') {
      groomParents = data.family?.groomParentsGu || groomParents;
      brideParents = data.family?.brideParentsGu || brideParents;
    }
    document.querySelectorAll('.data-groom-parents').forEach(el => el.textContent = `With Warm Blessings from ${groomParents}`);
    document.querySelectorAll('.data-bride-parents').forEach(el => el.textContent = `With Warm Blessings from ${brideParents}`);

    // 8. RSVP Contacts
    const rsvp1Name = data.family?.rsvp1Name || 'Nalinkumar';
    const rsvp1Phone = data.family?.rsvp1Phone || '+91 9409360336';
    const rsvp2Name = data.family?.rsvp2Name || 'Helpdesk';
    const rsvp2Phone = data.family?.rsvp2Phone || '+91 9409360336';

    const rsvp1El = document.getElementById('rsvpPhone1');
    if (rsvp1El) {
      rsvp1El.textContent = `📞 ${rsvp1Name}: ${rsvp1Phone}`;
      rsvp1El.setAttribute('href', `tel:${rsvp1Phone.replace(/\s+/g, '')}`);
    }
    const rsvp2El = document.getElementById('rsvpPhone2');
    if (rsvp2El) {
      rsvp2El.textContent = `💬 ${rsvp2Name}`;
      rsvp2El.setAttribute('href', `https://wa.me/${rsvp2Phone.replace(/[^0-9]/g, '')}`);
    }

    // 9. Photos & Filter Uploads
    if (data.media?.photoSlots) {
      const heroSlot = data.media.photoSlots.hero;
      if (heroSlot?.url) {
        document.querySelectorAll('.data-hero-img').forEach(el => {
          el.src = heroSlot.url;
          el.style.filter = getFilterCss(heroSlot.filter);
        });
      }

      const groomSlot = data.media.photoSlots.groom;
      if (groomSlot?.url) {
        document.querySelectorAll('.data-groom-img').forEach(el => {
          el.src = groomSlot.url;
          el.style.filter = getFilterCss(groomSlot.filter);
        });
      }

      const brideSlot = data.media.photoSlots.bride;
      if (brideSlot?.url) {
        document.querySelectorAll('.data-bride-img').forEach(el => {
          el.src = brideSlot.url;
          el.style.filter = getFilterCss(brideSlot.filter);
        });
      }

      // Story / Gallery Slots
      const g1 = data.media.photoSlots.gallery1;
      if (g1?.url) {
        const el = document.getElementById('storyImg1');
        if (el) { el.src = g1.url; el.style.filter = getFilterCss(g1.filter); }
      }
      const g2 = data.media.photoSlots.gallery2;
      if (g2?.url) {
        const el = document.getElementById('storyImg2');
        if (el) { el.src = g2.url; el.style.filter = getFilterCss(g2.filter); }
      }
      const g3 = data.media.photoSlots.gallery3;
      if (g3?.url) {
        const el = document.getElementById('storyImg3');
        if (el) { el.src = g3.url; el.style.filter = getFilterCss(g3.filter); }
      }
    }

    // 10. Love Story Milestones (Chapters)
    if (Array.isArray(data.story) && data.story.length > 0) {
      data.story.forEach((milestone, idx) => {
        const chTitle = document.getElementById(`storyTitle${idx + 1}`);
        const chYear = document.getElementById(`storyYear${idx + 1}`);
        const chDesc = document.getElementById(`storyDesc${idx + 1}`);
        if (chTitle && milestone.title) chTitle.textContent = milestone.title;
        if (chYear && milestone.year) chYear.textContent = `Chapter ${idx + 1} · ${milestone.year}`;
        if (chDesc && milestone.description) chDesc.textContent = milestone.description;
      });
    }

    // 11. Ceremonies & Events List
    if (Array.isArray(data.events) && data.events.length > 0) {
      const container = document.getElementById('eventsContainer');
      if (container) {
        container.innerHTML = '';
        data.events.forEach((evt, idx) => {
          let evtName = evt.name;
          if (lang === 'hi' && evt.nameHi) evtName = evt.nameHi;
          if (lang === 'gu' && evt.nameGu) evtName = evt.nameGu;

          const isLast = idx === data.events.length - 1;
          const card = document.createElement('div');
          card.className = `p-8 rounded-3xl bg-white/80 border ${isLast ? 'border-2 border-gold shadow-lift md:col-span-2' : 'border-gold/40 shadow-sm'} space-y-3`;
          card.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="text-xs font-sans font-semibold text-maroon tracking-wider uppercase">${evtName}</span>
              <span class="text-xs font-sans px-3 py-1 rounded-full ${isLast ? 'bg-gold/20 text-maroon font-bold' : 'bg-champagne text-maroon font-semibold'}">${evt.time || '06:30 PM'}</span>
            </div>
            <h3 class="font-display ${isLast ? 'text-3xl' : 'text-2xl'} text-maroon">${evt.date || '3 December 2026'}</h3>
            <p class="text-xs font-sans text-textmuted">📍 ${evt.venue || venue}</p>
            ${evt.dressCode ? `<div class="text-[11px] font-sans text-textmuted bg-cream p-2 rounded-xl">✨ Dress Code: ${evt.dressCode}</div>` : ''}
          `;
          container.appendChild(card);
        });
      }
    }
  }

  // Expose globally for Direct DOM sync
  window.applyWeddingData = applyWeddingData;

  function initStudioSync() {
    window.addEventListener('message', (e) => {
      try {
        const msg = e.data;
        if (!msg) return;
        if (msg.type === 'UPDATE_STATE' || msg.type === 'WEDDING_DATA') {
          applyWeddingData(msg.state || msg.data);
        } else if (msg.type === 'SET_LANGUAGE') {
          applyWeddingData({ ...(window.WEDDING_CONFIG || {}), language: msg.language });
        }
      } catch (err) {}
    });

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'TEMPLATE_READY', theme: 'royaldawn' }, '*');
    }
  }

})();
