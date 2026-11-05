// 👑 SHUBH LAGNA · MARIGOLD HERITAGE TEMPLATE ENGINE
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var curtainOverlay = document.getElementById('curtainOverlay');
  var curtainOpenBtn = document.getElementById('curtainOpenBtn');
  var targetTimestamp = new Date("2027-02-14T19:30:00+05:30").getTime();

  document.addEventListener('DOMContentLoaded', function() {
    initCurtains();
    initAudio();
    initCountdown();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // 1. 🎭 Curtains / Entrance
  function initCurtains() {
    if (!curtainOverlay || !curtainOpenBtn) return;

    function openCurtains() {
      if (curtainOverlay.classList.contains('curtains-open')) return;
      curtainOverlay.classList.add('curtains-open');
      playAudio();

      setTimeout(function() {
        curtainOverlay.style.opacity = '0';
        curtainOverlay.style.pointerEvents = 'none';
        setTimeout(function() {
          curtainOverlay.style.display = 'none';
        }, 800);
      }, 900);
    }

    curtainOpenBtn.addEventListener('click', openCurtains);
    curtainOverlay.addEventListener('click', function(e) {
      if (e.target.closest('#curtainOpenBtn')) return;
      openCurtains();
    });
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

  // 4. 🔄 Live Studio Data Sync
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