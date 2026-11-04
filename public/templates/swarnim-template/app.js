// 🪙 SWARNIM FARMAN & SCRATCH — INTERACTIVE TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('swarnimAudio');
  var musicToggle = document.getElementById('swarnimMusicToggle');
  var videoGateOverlay = document.getElementById('videoGateOverlay');
  var videoGateOpenBtn = document.getElementById('videoGateOpenBtn');
  var swarnimApp = document.getElementById('swarnimApp');
  var targetTimestamp = new Date("2026-12-14T10:30:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initVideoGate();
    initAudio();
    initCountdown();
    initGoldScratch();
    initRSVPToggle();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🎬 Video Gate Opening
  function initVideoGate() {
    if (!videoGateOverlay || !videoGateOpenBtn) return;

    function openGate() {
      if (videoGateOverlay.classList.contains('video-gate-open')) return;
      videoGateOverlay.classList.add('video-gate-open');

      playAudio();

      if (swarnimApp) {
        swarnimApp.style.opacity = '1';
      }

      setTimeout(function() {
        videoGateOverlay.style.display = 'none';
      }, 1000);
    }

    videoGateOpenBtn.addEventListener('click', openGate);
    videoGateOverlay.addEventListener('click', function(e) {
      if (e.target.closest('#videoGateOpenBtn')) return;
      openGate();
    });
  }

  // 2. 🎶 Audio Handling
  function playAudio() {
    if (!audioEl) return;
    audioEl.play().then(function() {
      if (musicToggle) {
        musicToggle.classList.remove('paused');
      }
    }).catch(function() {});
  }

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    if (musicToggle) {
      musicToggle.classList.add('paused');
    }
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

  // 3. ⏳ Countdown Timer
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

  // 4. 🪙 Gold Scratch Canvas
  function initGoldScratch() {
    var canvas = document.getElementById('goldScratchCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var isDrawing = false;

    function drawFoil() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.globalCompositeOperation = 'source-over';

      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#C99738');
      grad.addColorStop(0.3, '#ECC876');
      grad.addColorStop(0.6, '#B28224');
      grad.addColorStop(1, '#9F7220');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Radial Gold Shimmer
      var rad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w/2);
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#2A0812';
      ctx.font = 'bold 18px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ SWARNIM SECRET FARMAN ✦', w / 2, h / 2 - 12);
      ctx.font = '13px "Montserrat", sans-serif';
      ctx.fillText('Scratch here with your finger to reveal', w / 2, h / 2 + 16);
    }

    drawFoil();

    function scratch(e) {
      if (!isDrawing) return;
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0].clientX);
      var clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      var x = (clientX - rect.left) * (canvas.width / rect.width);
      var y = (clientY - rect.top) * (canvas.height / rect.height);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', function() { isDrawing = false; });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; scratch(e); }, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    window.addEventListener('touchend', function() { isDrawing = false; });

    var resetBtn = document.getElementById('resetGoldScratchBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        drawFoil();
      });
    }
  }

  // 5. 💌 RSVP Attendance Toggle
  function initRSVPToggle() {
    var choiceBtns = document.querySelectorAll('.rsvp-choice-btn');
    var attendanceInput = document.querySelector('input[name="attendance"]');

    choiceBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        choiceBtns.forEach(function(b) {
          b.classList.remove('active-choice', 'border-swarnimGold', 'bg-swarnimGold/20', 'text-swarnimGold');
          b.classList.add('border-swarnimGold/30', 'bg-swarnimDark/60', 'text-swarnimSand/60');
        });
        btn.classList.add('active-choice', 'border-swarnimGold', 'bg-swarnimGold/20', 'text-swarnimGold');
        btn.classList.remove('border-swarnimGold/30', 'bg-swarnimDark/60', 'text-swarnimSand/60');

        if (attendanceInput) {
          attendanceInput.value = btn.dataset.value || 'attending';
        }
      });
    });
  }

  // 6. 🔄 Live Studio Data Sync
  function applyWeddingData(cfg) {
    if (!cfg) return;

    if (cfg.targetTimestampMs || cfg.LIVE_TARGET_DATE_MS) {
      targetTimestamp = cfg.targetTimestampMs || cfg.LIVE_TARGET_DATE_MS;
    }

    if (cfg.groomName) {
      document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = cfg.groomName; });
    }
    if (cfg.brideName) {
      document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = cfg.brideName; });
    }
    if (cfg.weddingDate) {
      document.querySelectorAll('.wedding-date, .data-wedding-date').forEach(function(el) { el.textContent = cfg.weddingDate; });
    }
    if (cfg.venue || cfg.city) {
      document.querySelectorAll('.venue-name, .data-venue-name').forEach(function(el) { el.textContent = cfg.venue || cfg.city; });
    }
    if (cfg.mark) {
      document.querySelectorAll('.monogram, .couple-mark, .nav-mark').forEach(function(el) { el.textContent = cfg.mark; });
    }
  }

  function initMessageListener() {
    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'UPDATE_WEDDING_STATE' || event.data.type === 'UPDATE_INVITATION_STATE') {
        var state = event.data.state || event.data.invitation;
        if (state) {
          applyWeddingData(state);
        }
      }
    });
  }

  window.applyWeddingData = applyWeddingData;
})();
