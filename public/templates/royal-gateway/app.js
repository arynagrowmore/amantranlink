// 👑 THE ROYAL GATEWAY · 100% REVERSE-ENGINEERED INVITIMA MASTER ENGINE
// Chunk 3631, Module 81525 Full Mathematical Recreation
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var gateOverlay = document.getElementById('gateOverlay');
  var targetTimestamp = new Date("2026-12-27T19:00:00+05:30").getTime();

  var weddingData = {
    groom: 'Rahul',
    bride: 'Priya',
    date: '27 December 2026',
    time: '7:00 PM onwards',
    venue: 'The Grand Palace, Udaipur',
    phone: '919876543210'
  };

  // Exact Invitima Timing Constants:
  // O = { swingAt: 0.9, swing: 2.6, pushAt: 1.5, push: 3.0, floodAt: 3.3, done: 4.6 }
  var GATE_TIMINGS = {
    swingAt: 900,
    swing: 2600,
    pushAt: 1500,
    push: 3000,
    floodAt: 3300,
    done: 4600
  };

  document.addEventListener('DOMContentLoaded', function() {
    initGateOpening();
    initAudio();
    initCountdown();
    initScratchCard();
    initTimelineScroll();
    initGalleryCarousel();
    initRSVPForm();
    initPetals();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
  });

  // ========================================================
  // 1. 🚪 3D PALACE GATE OPENING CEREMONY
  // ========================================================
  function initGateOpening() {
    if (!gateOverlay) return;

    var opened = false;
    var doorLeft = document.getElementById('doorLeft');
    var doorRight = document.getElementById('doorRight');
    var gateCamera = document.getElementById('gateCameraFrame');
    var tapSeal = document.getElementById('tapSeal');
    var centerLight = document.getElementById('centerLightBeam');
    var gateTitles = document.getElementById('gateBottomTitles');
    var gateVignette = document.getElementById('gateVignette');
    var amberFlood = document.getElementById('amberFlood');
    var clickTarget = document.getElementById('gateClickTarget') || gateOverlay;

    function triggerOpen(e) {
      if (opened) return;
      opened = true;

      // Start royal music
      playAudio();

      // Step 0: Camera frame immediately starts gentle forward movement towards gate arch
      if (gateCamera) {
        gateCamera.style.transition = 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
        gateCamera.style.transform = 'translateX(-50%) translateY(-50%) scale(1.1)';
      }

      // Step 1: Tap seal scales up and fades out (0s - 0.5s)
      if (tapSeal) {
        tapSeal.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0, 1), opacity 0.5s ease-out';
        tapSeal.style.transform = 'translateX(-50%) translateY(-50%) scale(1.6)';
        tapSeal.style.opacity = '0';
      }

      // Step 2: Center light beam lights up (0s - 0.9s)
      if (centerLight) {
        centerLight.style.transition = 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.9s ease-out';
        centerLight.style.opacity = '1';
        centerLight.style.transform = 'translateX(-50%) scaleY(1)';
      }

      // Step 3: Bottom text slides down (0s - 0.6s)
      if (gateTitles) {
        gateTitles.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        gateTitles.style.transform = 'translateY(40px)';
        gateTitles.style.opacity = '0';
      }

      // Step 4: Vignette deepens
      if (gateVignette) {
        gateVignette.style.transition = 'opacity 0.9s ease';
        gateVignette.style.opacity = '1';
      }

      // Step 5: AT 0.9s (O.swingAt) -> Doors swing backward in 3D over 2.6s (O.swing)
      setTimeout(function() {
        if (doorLeft) {
          doorLeft.style.transition = 'transform 2.6s cubic-bezier(0.65, 0, 0.35, 1), filter 2.6s ease';
          doorLeft.style.transformOrigin = 'left center';
          doorLeft.style.transform = 'rotateY(86deg)';
          doorLeft.style.filter = 'brightness(0.5)';
        }
        if (doorRight) {
          doorRight.style.transition = 'transform 2.6s cubic-bezier(0.65, 0, 0.35, 1), filter 2.6s ease';
          doorRight.style.transformOrigin = 'right center';
          doorRight.style.transform = 'rotateY(-86deg)';
          doorRight.style.filter = 'brightness(0.5)';
        }
      }, GATE_TIMINGS.swingAt);

      // Step 6: AT 1.5s (O.pushAt) -> Camera frame pushes forward towards camera (scale 1.1 -> 7) over 3.0s
      setTimeout(function() {
        if (gateCamera) {
          gateCamera.style.transition = 'transform 3.0s cubic-bezier(0.7, 0, 0.3, 1)';
          gateCamera.style.transformOrigin = '50.12% 69.18%';
          gateCamera.style.transform = 'translateX(-50%) translateY(-50%) scale(7)';
        }
      }, GATE_TIMINGS.pushAt);

      // Step 7: AT 3.3s (O.floodAt) -> Amber morning sunlight flood overlay fades in
      setTimeout(function() {
        if (amberFlood) {
          amberFlood.style.opacity = '1';
        }
      }, GATE_TIMINGS.floodAt);

      // Step 8: AT 4.6s (O.done) -> Gate overlay fades out, showing main content!
      setTimeout(function() {
        gateOverlay.style.transition = 'opacity 1.1s ease-out';
        gateOverlay.style.opacity = '0';
        gateOverlay.style.pointerEvents = 'none';

        // Show floating music pill
        if (musicToggle) {
          musicToggle.classList.remove('hidden');
          musicToggle.classList.remove('paused');
        }

        // Trigger hero entrance
        triggerHeroEntrance();

        setTimeout(function() {
          gateOverlay.style.display = 'none';
        }, 1100);
      }, GATE_TIMINGS.done);
    }

    clickTarget.addEventListener('click', triggerOpen);
    clickTarget.addEventListener('touchstart', triggerOpen, { passive: true });
    gateOverlay.addEventListener('click', triggerOpen);
  }

  // ========================================================
  // 2. 🏰 HERO SECTION CINEMATIC ENTRANCE
  // ========================================================
  function triggerHeroEntrance() {
    var heroSky = document.querySelector('img[src*="hero-sky"]');
    var grandPalace = document.querySelector('img[src*="grand-palace"]');

    if (grandPalace) {
      grandPalace.style.transition = 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.4s ease-out';
      grandPalace.style.transform = 'translateY(0) scale(1)';
      grandPalace.style.opacity = '1';
    }

    if (heroSky) {
      heroSky.style.transition = 'transform 3.0s cubic-bezier(0.16, 1, 0.3, 1)';
      heroSky.style.transform = 'scale(1)';
    }
  }

  // ========================================================
  // 3. 🚗 SCROLL-DRIVEN TIMELINE CAR
  // ========================================================
  function initTimelineScroll() {
    var car = document.getElementById('timelineCarTracker');
    if (!car) return;

    var festivitiesSection = car.closest('.isolate') || car.parentElement;

    function updateCar() {
      if (!festivitiesSection) return;
      var rect = festivitiesSection.getBoundingClientRect();
      var windowH = window.innerHeight;

      if (rect.top <= windowH && rect.bottom >= 0) {
        var totalDist = rect.height - 200;
        var scrolled = Math.max(0, Math.min(totalDist, (windowH * 0.6) - rect.top));
        var progress = scrolled / totalDist;
        var yShift = progress * totalDist;

        car.style.transform = 'translateY(' + yShift + 'px)';
      }
    }

    window.addEventListener('scroll', updateCar, { passive: true });
    updateCar();
  }

  // ========================================================
  // 4. 🪙 SACRED MUHURAT GOLD SCRATCH CARD
  // ========================================================
  function initScratchCard() {
    var scratchWrapper = document.querySelector('[data-scratch-container]') || document.querySelector('.rgw-scratch-wrap');
    if (!scratchWrapper) {
      // Find the scratch card area by text
      var headings = document.querySelectorAll('*');
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].innerText && headings[i].innerText.trim() === 'Save the Date' && headings[i].parentElement) {
          scratchWrapper = headings[i].parentElement.querySelector('.relative.mx-auto') || headings[i].parentElement;
          break;
        }
      }
    }
    if (!scratchWrapper) return;

    // Check if canvas already exists
    var canvas = scratchWrapper.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'scratchCanvas';
      canvas.className = 'absolute inset-0 h-full w-full cursor-pointer z-10 touch-none rounded-2xl';
      scratchWrapper.style.position = 'relative';
      scratchWrapper.appendChild(canvas);
    }

    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var revealed = false;

    function resizeCanvas() {
      var rect = scratchWrapper.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw metallic gold foil with radial gradient and pattern
      var grad = ctx.createRadialGradient(
        rect.width * 0.4, rect.height * 0.35, 10,
        rect.width * 0.5, rect.height * 0.5, rect.width * 0.7
      );
      grad.addColorStop(0, '#fef0c7');
      grad.addColorStop(0.3, '#dea645');
      grad.addColorStop(0.7, '#c68d2f');
      grad.addColorStop(1, '#8f5c12');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Add elegant gold shimmer text
      ctx.fillStyle = '#39150f';
      ctx.font = 'bold 14px "Cinzel Decorative", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ SCRATCH HERE ✨', rect.width / 2, rect.height / 2 - 12);

      ctx.font = 'italic 12px "Cormorant Garamond", serif';
      ctx.fillText('to reveal the sacred date', rect.width / 2, rect.height / 2 + 14);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function scratch(x, y) {
      if (revealed) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    }

    function checkScratchPercentage() {
      if (revealed) return;
      try {
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imgData.data;
        var transparent = 0;
        var total = data.length / 4;

        for (var i = 3; i < data.length; i += 32) { // sample every 8th pixel
          if (data[i] === 0) transparent++;
        }

        if (transparent / (total / 8) > 0.35) {
          revealed = true;
          canvas.style.transition = 'opacity 0.8s ease-out';
          canvas.style.opacity = '0';
          setTimeout(function() {
            canvas.style.display = 'none';
          }, 800);
        }
      } catch (e) {}
    }

    function getCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    canvas.addEventListener('mousedown', function(e) { isDrawing = true; var c = getCoords(e); scratch(c.x, c.y); });
    window.addEventListener('mouseup', function() { isDrawing = false; });
    canvas.addEventListener('mousemove', function(e) { if (isDrawing) { var c = getCoords(e); scratch(c.x, c.y); } });

    canvas.addEventListener('touchstart', function(e) { isDrawing = true; var c = getCoords(e); scratch(c.x, c.y); }, { passive: true });
    window.addEventListener('touchend', function() { isDrawing = false; });
    canvas.addEventListener('touchmove', function(e) { if (isDrawing) { var c = getCoords(e); scratch(c.x, c.y); } }, { passive: true });
  }

  // ========================================================
  // 5. 🎶 SHEHNAI BACKGROUND AUDIO CONTROLLER
  // ========================================================
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

  function playAudio() {
    if (!audioEl) return;
    audioEl.play().then(function() {
      if (musicToggle) {
        musicToggle.classList.remove('paused');
      }
    }).catch(function(e) {
      console.warn('Audio autoplay blocked, will start on next tap:', e);
    });
  }

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    if (musicToggle) {
      musicToggle.classList.add('paused');
    }
  }

  // ========================================================
  // 6. ⏳ WEDDING COUNTDOWN TIMER
  // ========================================================
  function initCountdown() {
    function update() {
      var now = Date.now();
      var diff = Math.max(0, targetTimestamp - now);

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);

      var dEl = document.querySelector('[data-cd="days"]');
      var hEl = document.querySelector('[data-cd="hours"]');
      var mEl = document.querySelector('[data-cd="minutes"]');
      var sEl = document.querySelector('[data-cd="seconds"]');

      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // ========================================================
  // 7. 🖼️ ROYAL GALLERY CAROUSEL
  // ========================================================
  function initGalleryCarousel() {
    var thumbs = document.querySelectorAll('[data-gallery-thumb]');
    var mainImg = document.querySelector('[data-gallery-main]');
    if (!thumbs.length || !mainImg) return;

    thumbs.forEach(function(th) {
      th.addEventListener('click', function() {
        var src = this.getAttribute('data-gallery-thumb');
        if (src && mainImg) {
          mainImg.style.opacity = '0.4';
          mainImg.style.transform = 'scale(0.96)';
          setTimeout(function() {
            mainImg.src = src;
            mainImg.style.opacity = '1';
            mainImg.style.transform = 'scale(1)';
          }, 200);
        }
      });
    });
  }

  // ========================================================
  // 8. 💌 WHATSAPP RSVP DISPATCHER
  // ========================================================
  function initRSVPForm() {
    var form = document.querySelector('form') || document.querySelector('[data-rsvp-form]');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var nameInput = form.querySelector('input[type="text"]');
      var name = nameInput ? nameInput.value.trim() : 'Guest';
      var attending = form.querySelector('input[value="attending"]:checked') || true;

      var guestCount = 1;
      var countEl = form.querySelector('[data-guest-count]');
      if (countEl) guestCount = parseInt(countEl.textContent, 10) || 1;

      var message = '✨ *Namaste! Wedding RSVP*\n\n' +
        'Guest: ' + name + '\n' +
        'Status: ' + (attending ? 'Joyfully Attending ✅' : 'Regretfully Declining ❌') + '\n' +
        'Guests: ' + guestCount + '\n\n' +
        'Looking forward to celebrating Rahul & Priya\'s Shubh Vivah!';

      var waUrl = 'https://wa.me/' + weddingData.phone + '?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank');
    });
  }

  // ========================================================
  // 9. 🌸 FLOATING ROSE PETALS GENERATOR
  // ========================================================
  function initPetals() {
    var container = document.querySelector('.pointer-events-none.fixed.inset-0.z-40');
    if (!container) return;

    for (var i = 0; i < 12; i++) {
      var petal = document.createElement('span');
      petal.className = 'rgw-petal absolute top-0 pointer-events-none';
      petal.style.left = (Math.random() * 100) + '%';
      petal.style.setProperty('--rgw-time', (8 + Math.random() * 8) + 's');
      petal.style.setProperty('--rgw-delay', (Math.random() * 6) + 's');
      petal.style.width = (10 + Math.random() * 12) + 'px';
      petal.style.height = (14 + Math.random() * 16) + 'px';
      petal.style.background = 'radial-gradient(ellipse at 30% 30%, #ff8a93, #c92a3e)';
      petal.style.borderRadius = '50% 0 50% 50%';
      petal.style.opacity = '0.7';
      petal.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
      container.appendChild(petal);
    }
  }

  // ========================================================
  // 10. 🔄 STUDIO POSTMESSAGE CONFIGURATION LISTENER
  // ========================================================
  function initMessageListener() {
    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'UPDATE_WEDDING_DATA' || event.data.type === 'SET_PREVIEW_DATA') {
        applyWeddingData(event.data.payload);
      }
    });
  }

  function applyWeddingData(data) {
    if (!data) return;
    if (data.groom) {
      weddingData.groom = data.groom;
      document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = data.groom; });
    }
    if (data.bride) {
      weddingData.bride = data.bride;
      document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = data.bride; });
    }
    if (data.weddingDate) {
      weddingData.date = data.weddingDate;
      document.querySelectorAll('.wedding-date').forEach(function(el) { el.textContent = data.weddingDate; });
    }
    if (data.venue) {
      weddingData.venue = data.venue;
      document.querySelectorAll('.venue-name').forEach(function(el) { el.textContent = data.venue; });
    }
  }

})();
