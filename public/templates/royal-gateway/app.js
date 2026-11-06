// 👑 THE ROYAL GATEWAY · IMPERIAL PEACOCK PALACE TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var gateOverlay = document.getElementById('gateOverlay');
  var gateTrigger = document.getElementById('gateOpenTrigger');
  var tapButtonWrap = document.getElementById('tapButtonWrap');
  var lightBeam = document.getElementById('lightBeam');
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

  // 1. 🚪 3D Palace Gate Opening
  function initGateOpening() {
    if (!gateOverlay || (!gateTrigger && !tapButtonWrap)) return;

    var opened = false;
    function openGate() {
      if (opened) return;
      opened = true;

      // Expand light beam
      if (lightBeam) {
        lightBeam.style.opacity = '1';
        lightBeam.style.transform = 'translateX(-50%) scaleY(1)';
      }

      // Add opened class to swing doors & zoom
      gateOverlay.classList.add('gate-opened');

      playAudio();

      setTimeout(function() {
        gateOverlay.style.display = 'none';
      }, 1250);
    }

    if (gateTrigger) gateTrigger.addEventListener('click', openGate);
    if (tapButtonWrap) tapButtonWrap.addEventListener('click', openGate);
  }

  // 2. 🎶 Audio Player
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

      var dEl = document.getElementById('days') || document.querySelector('.countdown-days');
      var hEl = document.getElementById('hours') || document.querySelector('.countdown-hours');
      var mEl = document.getElementById('mins') || document.querySelector('.countdown-mins');
      var sEl = document.getElementById('secs') || document.querySelector('.countdown-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // 4. 🪙 Interactive Gold Scratch Card
  function initScratchCard() {
    var canvas = document.getElementById('scratchCanvas');
    if (!canvas) {
      // Find scratch container in Section 3
      var scratchArea = document.querySelector('section.text-center .relative.aspect-\\[4\\/3\\], section .aspect-\\[4\\/3\\]');
      if (scratchArea) {
        canvas = document.createElement('canvas');
        canvas.id = 'scratchCanvas';
        canvas.className = 'absolute inset-0 w-full h-full cursor-pointer z-20 rounded-2xl touch-none';
        scratchArea.appendChild(canvas);
      } else {
        return;
      }
    }

    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    var ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Draw Gold Foil
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

    // Gold Shimmer Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (var i = 0; i < w; i += 20) {
      ctx.fillRect(i, 0, 10, h);
    }

    // Text on card
    ctx.font = 'bold 14px "Cinzel Decorative", serif';
    ctx.fillStyle = '#39150F';
    ctx.textAlign = 'center';
    ctx.fillText('✨ RUB OR SCRATCH HERE ✨', w / 2, h / 2 - 10);
    ctx.font = '11px sans-serif';
    ctx.fillText('To Reveal Sacred Vivah Muhurat', w / 2, h / 2 + 15);

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
      ctx.arc(x, y, 22, 0, Math.PI * 2, false);
      ctx.fill();
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', function() { isDrawing = false; });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener('touchmove', function(e) { e.preventDefault(); scratch(e); }, { passive: false });
    window.addEventListener('touchend', function() { isDrawing = false; });
  }

  // 5. 🔄 Dynamic Data Bridge
  function applyWeddingData(data) {
    if (!data) return;

    var groom = (data.couple && (data.couple.groomEn || data.couple.groomHi)) || 'Rahul';
    var bride = (data.couple && (data.couple.brideEn || data.couple.brideHi)) || 'Priya';
    var dateStr = (data.couple && data.couple.weddingDate) || '21 December 2026';
    var venue = (data.couple && data.couple.venueName) || 'Shubh Vivah Banquet Hall';

    // Update names
    document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = groom; });
    document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = bride; });

    // Update date
    document.querySelectorAll('.wedding-date').forEach(function(el) { el.textContent = dateStr; });

    // Update venue
    document.querySelectorAll('.venue-name').forEach(function(el) { el.textContent = venue; });

    // Parse date for countdown
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
