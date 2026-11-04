// 🏰 THE CHANDRA MAHAL — PALATIAL WEDDING TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('chandraAudio');
  var musicToggle = document.getElementById('chandraMusicToggle');
  var gateOverlay = document.getElementById('palaceGateOverlay');
  var gateOpenBtn = document.getElementById('gateOpenBtn');
  var chandraApp = document.getElementById('chandraApp');
  var targetTimestamp = new Date("2027-01-26T11:30:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initGates();
    initAudio();
    initCountdown();
    initRSVPToggle();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🏰 3D Carved Fort Gate Open Transition
  function initGates() {
    if (!gateOverlay || !gateOpenBtn) return;

    function openGates() {
      if (gateOverlay.classList.contains('gates-open')) return;
      gateOverlay.classList.add('gates-open');

      playAudio();

      if (chandraApp) {
        chandraApp.style.opacity = '1';
      }

      setTimeout(function() {
        gateOverlay.style.opacity = '0';
        gateOverlay.style.pointerEvents = 'none';
        setTimeout(function() {
          gateOverlay.style.display = 'none';
        }, 1000);
      }, 1000);
    }

    gateOpenBtn.addEventListener('click', openGates);
    gateOverlay.addEventListener('click', function(e) {
      if (e.target.closest('#gateOpenBtn')) return;
      openGates();
    });
  }

  // 2. 🎶 Background Audio Toggle
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

  // 4. 💌 RSVP Attendance Toggle
  function initRSVPToggle() {
    var choiceBtns = document.querySelectorAll('.rsvp-choice-btn');
    var attendanceInput = document.querySelector('input[name="attendance"]');

    choiceBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        choiceBtns.forEach(function(b) {
          b.classList.remove('active-choice', 'border-gold', 'bg-gold/20', 'text-gold');
          b.classList.add('border-gold/30', 'bg-burgundy/60', 'text-sand/60');
        });
        btn.classList.add('active-choice', 'border-gold', 'bg-gold/20', 'text-gold');
        btn.classList.remove('border-gold/30', 'bg-burgundy/60', 'text-sand/60');

        if (attendanceInput) {
          attendanceInput.value = btn.dataset.value || 'attending';
        }
      });
    });
  }

  // 5. 🔄 Live Studio Data Sync
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
