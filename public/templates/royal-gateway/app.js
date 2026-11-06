// 👑 THE ROYAL GATEWAY · 1:1 PERFECT CLONE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var gateOverlay = document.getElementById('gateOverlay');
  var targetTimestamp = new Date("2026-12-21T19:00:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initGateOpening();
    initAudio();
    initCountdown();
    initScratchCard();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🚪 3D Palace Gate Opening Animation
  function initGateOpening() {
    if (!gateOverlay) return;

    var opened = false;
    function triggerOpen(e) {
      if (opened) return;
      opened = true;

      // Find the doors
      var leftDoor = gateOverlay.querySelector('img[src*="peacock-left"]');
      var rightDoor = gateOverlay.querySelector('img[src*="peacock-right"]');
      var gateFrame = gateOverlay.querySelector('.will-change-transform') || gateOverlay.querySelector('div[style*="aspect-ratio"]');

      if (leftDoor) {
        leftDoor.style.transition = 'transform 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
        leftDoor.style.transform = 'rotateY(-85deg) scaleX(0.15)';
      }
      if (rightDoor) {
        rightDoor.style.transition = 'transform 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
        rightDoor.style.transform = 'rotateY(85deg) scaleX(0.15)';
      }
      if (gateFrame) {
        gateFrame.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease';
        gateFrame.style.transform = 'translateX(-50%) translateY(-50%) scale(4.5)';
      }

      gateOverlay.style.transition = 'opacity 1.1s ease';
      gateOverlay.style.opacity = '0';
      gateOverlay.style.pointerEvents = 'none';

      playAudio();

      setTimeout(function() {
        gateOverlay.style.display = 'none';
      }, 1150);
    }

    // Attach click to any button or anywhere on gateOverlay
    gateOverlay.addEventListener('click', triggerOpen);
    gateOverlay.addEventListener('touchstart', triggerOpen, { passive: true });
  }

  // 2. 🎶 Shehnai Audio Player
  function playAudio() {
    if (!audioEl || window.LIVE_AUDIO_DISABLED) return;
    audioEl.play().then(function() {
      if (musicToggle) musicToggle.classList.remove('paused');
    }).catch(function() {});
  }

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    if (musicToggle) musicToggle.classList.add('paused');
  }

  function initAudio() {
    if (!musicToggle || !audioEl) return;
    musicToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (audioEl.paused) {
        playAudio();
      } else {
        pauseAudio();
      }
    });
  }

  // 3. ⏳ Live Countdown Timer
  function initCountdown() {
    function update() {
      var now = Date.now();
      var diff = targetTimestamp - now;
      if (diff <= 0) diff = 0;

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);

      var dEls = document.querySelectorAll('#days, .countdown-days, [data-unit="days"]');
      var hEls = document.querySelectorAll('#hours, .countdown-hours, [data-unit="hours"]');
      var mEls = document.querySelectorAll('#mins, .countdown-mins, [data-unit="mins"]');
      var sEls = document.querySelectorAll('#secs, .countdown-secs, [data-unit="secs"]');

      dEls.forEach(function(el) { el.textContent = String(days).padStart(2, '0'); });
      hEls.forEach(function(el) { el.textContent = String(hours).padStart(2, '0'); });
      mEls.forEach(function(el) { el.textContent = String(mins).padStart(2, '0'); });
      sEls.forEach(function(el) { el.textContent = String(secs).padStart(2, '0'); });
    }

    update();
    setInterval(update, 1000);
  }

  // 4. 🪙 Gold Scratch Card
  function initScratchCard() {
    var canvas = document.getElementById('scratchCanvas');
    var targetArea = document.querySelector('.aspect-\\[4\\/3\\]') || document.querySelector('[class*="aspect-[4/3]"]');
    
    if (!canvas && targetArea) {
      canvas = document.createElement('canvas');
      canvas.id = 'scratchCanvas';
      canvas.className = 'absolute inset-0 w-full h-full cursor-pointer z-30 rounded-2xl touch-none';
      targetArea.appendChild(canvas);
    }
    if (!canvas) return;

    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      setTimeout(initScratchCard, 300);
      return;
    }

    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    var ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    var w = rect.width;
    var h = rect.height;

    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#DEA645');
    grad.addColorStop(0.3, '#FFF1B8');
    grad.addColorStop(0.5, '#E3B44C');
    grad.addColorStop(0.7, '#B16F23');
    grad.addColorStop(1, '#DEA645');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Text on card
    ctx.font = 'bold 15px "Cinzel Decorative", serif';
    ctx.fillStyle = '#39150F';
    ctx.textAlign = 'center';
    ctx.fillText('✨ RUB OR SCRATCH HERE ✨', w / 2, h / 2 - 10);
    ctx.font = '11px sans-serif';
    ctx.fillText('To Reveal Sacred Wedding Muhurat', w / 2, h / 2 + 15);

    var isDrawing = false;
    function scratch(e) {
      if (!isDrawing) return;
      var clientX = e.clientX || (e.touches && e.touches[0].clientX);
      var clientY = e.clientY || (e.touches && e.touches[0].clientY);
      var cRect = canvas.getBoundingClientRect();
      var x = clientX - cRect.left;
      var y = clientY - cRect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2, false);
      ctx.fill();
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', function() { isDrawing = false; });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener('touchmove', function(e) { e.preventDefault(); scratch(e); }, { passive: false });
    window.addEventListener('touchend', function() { isDrawing = false; });
  }

  // 5. 🔄 Live Data Updates
  function applyWeddingData(data) {
    if (!data) return;

    var groom = (data.couple && (data.couple.groomEn || data.couple.groomHi)) || 'Rahul';
    var bride = (data.couple && (data.couple.brideEn || data.couple.brideHi)) || 'Priya';
    var dateStr = (data.couple && data.couple.weddingDate) || '21 December 2026';
    var venue = (data.couple && data.couple.venueName) || 'Shubh Vivah Banquet Hall';

    document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = groom; });
    document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = bride; });
    document.querySelectorAll('.wedding-date').forEach(function(el) { el.textContent = dateStr; });
    document.querySelectorAll('.venue-name').forEach(function(el) { el.textContent = venue; });

    try {
      var parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        targetTimestamp = parsed;
      }
    } catch(e) {}
  }

  function initMessageListener() {
    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'UPDATE_WEDDING_DATA' && event.data.payload) {
        applyWeddingData(event.data.payload);
      }
    });
  }

  window.applyWeddingData = applyWeddingData;
})();
