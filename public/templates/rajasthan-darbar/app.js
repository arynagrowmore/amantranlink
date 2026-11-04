// 👑 THE RAJASTHANI DARBAR — INTERACTIVE TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('darbarAudio');
  var musicToggle = document.getElementById('darbarMusicToggle');
  var curtainOverlay = document.getElementById('curtainOverlay');
  var curtainOpenBtn = document.getElementById('curtainOpenBtn');
  var darbarApp = document.getElementById('darbarApp');
  var targetTimestamp = new Date("2027-01-26T12:50:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initCurtains();
    initAudio();
    initCountdown();
    initScratchCard();
    initRSVPToggle();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🎭 Silk Curtains Open Transition
  function initCurtains() {
    if (!curtainOverlay || !curtainOpenBtn) return;

    function openCurtains() {
      if (curtainOverlay.classList.contains('curtains-open')) return;
      curtainOverlay.classList.add('curtains-open');

      // Play audio on user gesture
      playAudio();

      if (darbarApp) {
        darbarApp.style.opacity = '1';
      }

      setTimeout(function() {
        curtainOverlay.style.opacity = '0';
        curtainOverlay.style.pointerEvents = 'none';
        setTimeout(function() {
          curtainOverlay.style.display = 'none';
        }, 1000);
      }, 1000);
    }

    curtainOpenBtn.addEventListener('click', openCurtains);
    curtainOverlay.addEventListener('click', function(e) {
      if (e.target.closest('#curtainOpenBtn')) return;
      openCurtains();
    });
  }

  // 2. 🎶 Royal Shehnai Audio Player
  function playAudio() {
    if (!audioEl) return;
    audioEl.play().then(function() {
      if (musicToggle) {
        musicToggle.classList.remove('paused');
      }
    }).catch(function() {
      // Audio autoplay policy handled gracefully
    });
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

  // 3. ⏳ Live Countdown Timer
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

  // 4. 🪙 Interactive Gold Scratch Card
  function initScratchCard() {
    var canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var scratchedPercent = 0;

    function drawGoldFoil() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.globalCompositeOperation = 'source-over';

      // Rich royal gold foil texture gradient
      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#C99738');
      grad.addColorStop(0.25, '#ECC876');
      grad.addColorStop(0.5, '#A87920');
      grad.addColorStop(0.75, '#ECC876');
      grad.addColorStop(1, '#9F7220');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold pattern overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (var x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }

      // Ornamental label on top
      ctx.fillStyle = '#2D080E';
      ctx.font = 'bold 16px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ ROYAL FARMAN SHAGUN ✦', w / 2, h / 2 - 10);
      ctx.font = '12px "Montserrat", sans-serif';
      ctx.fillText('Scratch here with your finger to reveal', w / 2, h / 2 + 15);
    }

    drawGoldFoil();

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
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', function() { isDrawing = false; });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; scratch(e); }, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    window.addEventListener('touchend', function() { isDrawing = false; });

    var resetBtn = document.getElementById('resetScratchBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        drawGoldFoil();
      });
    }
  }

  // 5. 💌 RSVP Attendance Selection
  function initRSVPToggle() {
    var choiceBtns = document.querySelectorAll('.rsvp-choice-btn');
    var attendanceInput = document.querySelector('input[name="attendance"]');

    choiceBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        choiceBtns.forEach(function(b) {
          b.classList.remove('active-choice', 'border-darbarGold', 'bg-darbarGold/20', 'text-darbarGold');
          b.classList.add('border-darbarGold/30', 'bg-darbarDark/60', 'text-darbarSand/60');
        });
        btn.classList.add('active-choice', 'border-darbarGold', 'bg-darbarGold/20', 'text-darbarGold');
        btn.classList.remove('border-darbarGold/30', 'bg-darbarDark/60', 'text-darbarSand/60');

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
