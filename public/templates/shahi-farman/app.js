// 👑 THE SHAHI DASTAVEJ · GOLDEN ENVELOPE & PALACE DOORS TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var gateWrapper = document.getElementById('gateWrapper');
  var openGateBtn = document.getElementById('openGateBtn');
  var targetTimestamp = new Date("2027-02-14T20:00:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initDualStageGate();
    initAudio();
    initPetals();
    initCountdown();
    initScratchCard();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🏰 Dual-Stage Gate: Envelope lifts -> Palace Doors slide open
  function initDualStageGate() {
    if (!gateWrapper || !openGateBtn) return;

    function openGate() {
      if (gateWrapper.classList.contains('doors-open')) return;
      gateWrapper.classList.add('doors-open');
      playAudio();

      setTimeout(function() {
        gateWrapper.style.opacity = '0';
        gateWrapper.style.pointerEvents = 'none';
        setTimeout(function() {
          gateWrapper.style.display = 'none';
        }, 800);
      }, 1600);
    }

    openGateBtn.addEventListener('click', openGate);
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

  // 3. 🌸 Drifting Golden Petals
  function initPetals() {
    var container = document.getElementById('petalsContainer');
    if (!container) return;

    var COUNT = 12;
    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement('span');
      p.className = 'petal';
      var s = Math.floor(Math.random() * 8) + 10;
      var left = Math.floor(Math.random() * 95) + '%';
      var dur = (Math.random() * 6 + 10) + 's';
      var delay = (Math.random() * 8) + 's';

      p.style.width = s + 'px';
      p.style.height = s + 'px';
      p.style.left = left;
      p.style.animationDuration = dur;
      p.style.animationDelay = delay;

      container.appendChild(p);
    }
  }

  // 4. 🪙 Gold Leaf Scratch Card Canvas
  function initScratchCard() {
    var canvas = document.getElementById('scratchCanvas');
    var wrap = document.getElementById('scratchWrap');
    if (!canvas || !wrap) return;

    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var isRevealed = false;

    function paintFoil() {
      if (isRevealed) return;
      var rect = wrap.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      ctx.save();
      ctx.scale(dpr, dpr);

      // Gold Foil Gradient
      var grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, '#D4AF37');
      grad.addColorStop(0.3, '#F5D061');
      grad.addColorStop(0.6, '#C99738');
      grad.addColorStop(1, '#8A6417');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Sparkle specks
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#FFF8E1';
      for (var i = 0; i < 110; i++) {
        var x = Math.random() * rect.width;
        var y = Math.random() * rect.height;
        var r = Math.random() * 2 + 0.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Rub & Reveal Hint Text
      ctx.fillStyle = 'rgba(45, 8, 14, 0.88)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var midY = rect.height / 2;
      ctx.font = 'bold 13px "Cinzel", serif';
      ctx.fillText('✦  SCRATCH GOLD LEAF  ✦', rect.width / 2, midY - 14);
      ctx.font = 'bold 22px "Cinzel Decorative", serif';
      ctx.fillText('Reveal Muhurat', rect.width / 2, midY + 18);

      ctx.restore();
    }

    paintFoil();
    window.addEventListener('resize', paintFoil);

    function scratch(e) {
      if (!isDrawing || isRevealed) return;
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX;
      var clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      var x = (clientX - rect.left) * (canvas.width / rect.width);
      var y = (clientY - rect.top) * (canvas.height / rect.height);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();

      checkProgress();
    }

    function checkProgress() {
      if (isRevealed) return;
      try {
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var total = imgData.data.length / 4;
        var transparent = 0;
        for (var i = 3; i < imgData.data.length; i += 32) {
          if (imgData.data[i] < 128) transparent++;
        }
        var sampledTotal = total / 8;
        if (transparent / sampledTotal > 0.4) {
          isRevealed = true;
          canvas.style.transition = 'opacity 0.6s ease';
          canvas.style.opacity = '0';
          setTimeout(function() {
            canvas.style.display = 'none';
          }, 600);
        }
      } catch (e) {}
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', function() { isDrawing = false; });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; scratch(e); }, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    window.addEventListener('touchend', function() { isDrawing = false; });
  }

  // 5. ⏳ Countdown Timer
  function initCountdown() {
    function update() {
      var now = Date.now();
      var diff = Math.max(0, targetTimestamp - now);

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);

      var pad = function(n) { return n < 10 ? '0' + n : String(n); };

      var daysEl = document.getElementById('days');
      var hoursEl = document.getElementById('hours');
      var minsEl = document.getElementById('minutes');
      var secsEl = document.getElementById('seconds');

      if (daysEl) daysEl.textContent = pad(d);
      if (hoursEl) hoursEl.textContent = pad(h);
      if (minsEl) minsEl.textContent = pad(m);
      if (secsEl) secsEl.textContent = pad(s);
    }

    update();
    setInterval(update, 1000);
  }

  // 6. 🔄 Live Studio Data Sync
  function applyWeddingData(cfg) {
    if (!cfg) return;

    if (cfg.targetTimestampMs || cfg.LIVE_TARGET_DATE_MS) {
      targetTimestamp = cfg.targetTimestampMs || cfg.LIVE_TARGET_DATE_MS;
    }

    if (cfg.groomName || (cfg.couple && (cfg.couple.groomEn || cfg.couple.groomHi))) {
      var gName = cfg.groomName || cfg.couple.groomEn || cfg.couple.groomHi;
      document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = gName; });
    }
    if (cfg.brideName || (cfg.couple && (cfg.couple.brideEn || cfg.couple.brideHi))) {
      var bName = cfg.brideName || cfg.couple.brideEn || cfg.couple.brideHi;
      document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = bName; });
    }
    if (cfg.weddingDate || (cfg.couple && cfg.couple.weddingDate)) {
      var wDate = cfg.weddingDate || cfg.couple.weddingDate;
      document.querySelectorAll('.wedding-date').forEach(function(el) { el.textContent = wDate; });
    }
    if (cfg.venue || (cfg.couple && (cfg.couple.venueName || cfg.couple.venueAddress))) {
      var vName = cfg.venue || cfg.couple.venueName;
      document.querySelectorAll('.venue-name').forEach(function(el) { el.textContent = vName; });
      if (cfg.couple && cfg.couple.venueAddress) {
        document.querySelectorAll('.venue-address').forEach(function(el) { el.textContent = cfg.couple.venueAddress; });
      }
    }
    if (cfg.couple && cfg.couple.mapUrl) {
      document.querySelectorAll('.map-link').forEach(function(el) { el.setAttribute('href', cfg.couple.mapUrl); });
    }
  }

  function initMessageListener() {
    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'UPDATE_WEDDING_STATE' || event.data.type === 'UPDATE_INVITATION_STATE' || event.data.type === 'UPDATE_STATE' || event.data.type === 'WEDDING_DATA') {
        var state = event.data.state || event.data.data || event.data.invitation;
        if (state) {
          applyWeddingData(state);
        }
      }
    });
  }

  window.applyWeddingData = applyWeddingData;
  window.pauseAudio = pauseAudio;
  window.playAudio = playAudio;
})();