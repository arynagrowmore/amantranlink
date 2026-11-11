// 👑 THE ROYAL GATEWAY · 1:1 MASTER INTERACTIVE ENGINE (INVITIMA CLONE)
(function() {
  'use strict';

  var audioEl = document.getElementById('bgAudio');
  var musicToggle = document.getElementById('musicToggle');
  var gateOverlay = document.getElementById('gateOverlay');
  var targetTimestamp = new Date("2026-12-21T19:00:00+05:30").getTime();
  var weddingData = {
    groom: 'Rahul',
    bride: 'Priya',
    date: '21 December 2026',
    time: '7:00 PM onwards',
    venue: 'The Grand Palace, Udaipur',
    phone: '919876543210'
  };

  document.addEventListener('DOMContentLoaded', function() {
    initGateOpening();
    initAudio();
    initCountdown();
    initScratchCard();
    initGalleryCarousel();
    initRSVPForm();
    initPetals();
    initTimelineScroll();
    initMessageListener();

    if (window.WEDDING_CONFIG) {
      applyWeddingData(window.WEDDING_CONFIG);
    }
    if (window.LIVE_TARGET_DATE_MS) {
      targetTimestamp = window.LIVE_TARGET_DATE_MS;
    }
  });

  // ========================================================
  // 1. 🚪 3D PALACE GATE OPENING CEREMONY
  // ========================================================
  function initGateOpening() {
    if (!gateOverlay) return;

    var opened = false;
    function triggerOpen(e) {
      if (opened) return;
      opened = true;

      // Find gate elements
      var leftDoor = gateOverlay.querySelector('img[src*="peacock-left"]');
      var rightDoor = gateOverlay.querySelector('img[src*="peacock-right"]');
      var gateFrame = gateOverlay.querySelector('.will-change-transform') || gateOverlay.querySelector('div[style*="aspect-ratio"]');
      var centerBeam = gateOverlay.querySelector('div[style*="scaleY"]');
      var openBtn = gateOverlay.querySelector('.pointer-events-none.absolute.flex.flex-col') || gateOverlay.querySelector('.rgw-breathe');

      // 1. Center golden seam flash
      if (centerBeam) {
        centerBeam.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
        centerBeam.style.opacity = '1';
        centerBeam.style.transform = 'translateX(-50%) scaleY(1)';
      }

      // 2. Button fade
      if (openBtn) {
        openBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        openBtn.style.opacity = '0';
        openBtn.style.transform = 'translateX(-50%) translateY(-50%) scale(0.7)';
      }

      // 3. 3D Doors swing open on Y axis with perspective
      setTimeout(function() {
        if (leftDoor) {
          leftDoor.style.transition = 'transform 1.25s cubic-bezier(0.25, 1, 0.5, 1)';
          leftDoor.style.transformOrigin = 'left center';
          leftDoor.style.transform = 'rotateY(-85deg) scaleX(0.15)';
        }
        if (rightDoor) {
          rightDoor.style.transition = 'transform 1.25s cubic-bezier(0.25, 1, 0.5, 1)';
          rightDoor.style.transformOrigin = 'right center';
          rightDoor.style.transform = 'rotateY(85deg) scaleX(0.15)';
        }
      }, 50);

      // 4. Camera zooms forward into the grand palace sunrise
      setTimeout(function() {
        if (gateFrame) {
          gateFrame.style.transition = 'transform 1.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-in';
          gateFrame.style.transform = 'translateX(-50%) translateY(-50%) scale(4.5)';
          gateFrame.style.opacity = '0';
        }
        gateOverlay.style.transition = 'opacity 1.2s ease-in';
        gateOverlay.style.opacity = '0';
        gateOverlay.style.pointerEvents = 'none';
      }, 100);

      playAudio();

      setTimeout(function() {
        gateOverlay.style.display = 'none';
      }, 1250);
    }

    gateOverlay.addEventListener('click', triggerOpen);
    gateOverlay.addEventListener('touchstart', triggerOpen, { passive: true });
  }

  // ========================================================
  // 2. 🎶 LIVE SHEHNAI AUDIO PLAYER & EQUALIZER
  // ========================================================
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

  // ========================================================
  // 3. ⏳ LIVE COUNTDOWN TIMER
  // ========================================================
  function initCountdown() {
    function update() {
      var now = Date.now();
      if (window.LIVE_TARGET_DATE_MS) {
        targetTimestamp = window.LIVE_TARGET_DATE_MS;
      }
      var diff = Math.max(0, targetTimestamp - now);

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / 1000 / 60) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      var dStr = String(days).padStart(2, '0');
      var hStr = String(hours).padStart(2, '0');
      var mStr = String(mins).padStart(2, '0');
      var sStr = String(secs).padStart(2, '0');

      var dEls = document.querySelectorAll('#days, .countdown-days, [data-unit="days"]');
      var hEls = document.querySelectorAll('#hours, .countdown-hours, [data-unit="hours"]');
      var mEls = document.querySelectorAll('#mins, #minutes, .countdown-mins, [data-unit="mins"]');
      var sEls = document.querySelectorAll('#secs, #seconds, .countdown-secs, [data-unit="secs"]');

      dEls.forEach(function(el) { if (el.textContent !== dStr) el.textContent = dStr; });
      hEls.forEach(function(el) { if (el.textContent !== hStr) el.textContent = hStr; });
      mEls.forEach(function(el) { if (el.textContent !== mStr) el.textContent = mStr; });
      sEls.forEach(function(el) { if (el.textContent !== sStr) el.textContent = sStr; });
    }

    update();
    setInterval(update, 1000);
  }

  // ========================================================
  // 4. 🪙 SACRED MUHURAT GOLD FOIL SCRATCH CARD
  // ========================================================
  function initScratchCard() {
    var canvas = document.getElementById('scratchCanvas');
    if (!canvas) {
      var targetArea = document.querySelector('.aspect-\\[4\\/3\\]') || document.querySelector('[class*="aspect-[4/3]"]');
      if (targetArea) {
        canvas = document.createElement('canvas');
        canvas.id = 'scratchCanvas';
        canvas.role = 'img';
        canvas.className = 'absolute inset-0 h-full w-full rounded-2xl z-30 touch-none';
        targetArea.appendChild(canvas);
      }
    }
    if (!canvas) return;

    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      setTimeout(initScratchCard, 200);
      return;
    }

    var dpr = window.devicePixelRatio || 1;
    var w = rect.width;
    var h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    function drawGoldFoil() {
      ctx.globalCompositeOperation = 'source-over';

      // Metallic multi-stop gold gradient
      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#C99738');
      grad.addColorStop(0.25, '#FFF1B8');
      grad.addColorStop(0.5, '#DEA645');
      grad.addColorStop(0.75, '#B16F23');
      grad.addColorStop(1, '#8A5A12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Radial shimmer highlight
      var rad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);

      // Gilded filigree border
      ctx.strokeStyle = 'rgba(255, 241, 184, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      ctx.strokeStyle = 'rgba(138, 90, 18, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, w - 24, h - 24);

      // Card Title Text
      ctx.fillStyle = '#39150F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 15px "Cinzel Decorative", Georgia, serif';
      ctx.fillText('✨ SHUBH MUHURAT ✨', w / 2, h / 2 - 14);

      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#5A1E0D';
      ctx.fillText('Rub or scratch here to reveal', w / 2, h / 2 + 14);
    }

    drawGoldFoil();

    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;
    var checkTimeout = null;
    var isRevealed = false;

    function eraseAt(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2, false);
      ctx.fill();

      if (lastX && lastY) {
        ctx.beginPath();
        ctx.lineWidth = 52;
        ctx.lineCap = 'round';
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      lastX = x;
      lastY = y;

      if (!checkTimeout && !isRevealed) {
        checkTimeout = setTimeout(checkPercentage, 350);
      }
    }

    function checkPercentage() {
      checkTimeout = null;
      if (isRevealed) return;

      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imgData.data;
      var total = data.length / 4;
      var transparent = 0;

      for (var i = 3; i < data.length; i += 16) {
        if (data[i] === 0) transparent++;
      }
      var percent = (transparent / (total / 4)) * 100;
      if (percent >= 35) {
        revealFullMuhurat();
      }
    }

    function revealFullMuhurat() {
      if (isRevealed) return;
      isRevealed = true;
      canvas.style.transition = 'opacity 0.6s ease';
      canvas.style.opacity = '0';
      setTimeout(function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
      }, 600);
    }

    function getCoords(e) {
      var cRect = canvas.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0].clientX);
      var clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: clientX - cRect.left,
        y: clientY - cRect.top
      };
    }

    canvas.addEventListener('mousedown', function(e) {
      isDrawing = true;
      var pos = getCoords(e);
      lastX = pos.x;
      lastY = pos.y;
      eraseAt(pos.x, pos.y);
    });

    canvas.addEventListener('mousemove', function(e) {
      if (!isDrawing) return;
      var pos = getCoords(e);
      eraseAt(pos.x, pos.y);
    });

    window.addEventListener('mouseup', function() {
      isDrawing = false;
      lastX = 0;
      lastY = 0;
    });

    canvas.addEventListener('touchstart', function(e) {
      isDrawing = true;
      var pos = getCoords(e);
      lastX = pos.x;
      lastY = pos.y;
      eraseAt(pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
      if (!isDrawing) return;
      e.preventDefault();
      var pos = getCoords(e);
      eraseAt(pos.x, pos.y);
    }, { passive: false });

    window.addEventListener('touchend', function() {
      isDrawing = false;
      lastX = 0;
      lastY = 0;
    });

    // Instant reveal button
    var revealBtn = document.getElementById('revealMuhuratBtn');
    if (revealBtn) {
      revealBtn.addEventListener('click', revealFullMuhurat);
    }
  }

  // ========================================================
  // 5. 🖼️ 3D ROYAL PHOTO GALLERY CAROUSEL
  // ========================================================
  function initGalleryCarousel() {
    var cards = document.querySelectorAll('.absolute.left-1\\/2.top-10');
    if (!cards.length) return;

    var currentIndex = 0;
    var totalCards = cards.length;
    var prevBtn = document.querySelector('button[aria-label="Previous photo"]');
    var nextBtn = document.querySelector('button[aria-label="Next photo"]');
    var thumbBtns = document.querySelectorAll('button[aria-label^="Show photo"]');

    function updateCards() {
      cards.forEach(function(card, idx) {
        var offset = idx - currentIndex;
        var inner = card.querySelector('[class*="preserve-3d"]') || card.firstElementChild;
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), z-index 0.5s';

        if (offset === 0) {
          card.style.zIndex = '10';
          card.style.pointerEvents = 'auto';
          card.style.transform = 'translateX(-50%) translateZ(0px) scale(1)';
          if (inner) {
            inner.style.transition = 'opacity 0.5s, transform 0.5s';
            inner.style.opacity = '1';
            inner.style.transform = 'translateZ(0px) scale(1) rotateY(0deg)';
          }
        } else if (offset > 0) {
          card.style.zIndex = String(10 - offset);
          card.style.pointerEvents = 'none';
          card.style.transform = 'translateX(calc(-50% + ' + (offset * 40) + '%))';
          if (inner) {
            inner.style.transition = 'opacity 0.5s, transform 0.5s';
            inner.style.opacity = offset === 1 ? '0.85' : '0.4';
            inner.style.transform = 'translateZ(-140px) scale(0.88) rotateY(-32deg)';
          }
        } else {
          card.style.zIndex = String(10 + offset);
          card.style.pointerEvents = 'none';
          card.style.transform = 'translateX(calc(-50% - ' + (Math.abs(offset) * 40) + '%))';
          if (inner) {
            inner.style.transition = 'opacity 0.5s, transform 0.5s';
            inner.style.opacity = Math.abs(offset) === 1 ? '0.85' : '0.4';
            inner.style.transform = 'translateZ(-140px) scale(0.88) rotateY(32deg)';
          }
        }
      });

      // Update thumbnail borders
      thumbBtns.forEach(function(btn, bIdx) {
        if (bIdx === currentIndex) {
          btn.classList.add('border-[#d4a23a]', 'border-2', 'h-12', 'w-8');
          btn.classList.remove('opacity-60', 'h-9', 'w-6');
          btn.setAttribute('aria-current', 'true');
        } else {
          btn.classList.remove('border-[#d4a23a]', 'border-2', 'h-12', 'w-8');
          btn.classList.add('opacity-60', 'h-9', 'w-6');
          btn.setAttribute('aria-current', 'false');
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCards();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % totalCards;
        updateCards();
      });
    }

    thumbBtns.forEach(function(btn, idx) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        currentIndex = idx;
        updateCards();
      });
    });

    updateCards();
  }

  // ========================================================
  // 6. 💌 INTERACTIVE RSVP FORM & WHATSAPP SENDER
  // ========================================================
  function initRSVPForm() {
    var guestCount = 2;
    var isAttending = 'Yes';
    var selectedDiet = 'Vegetarian';

    // Counter buttons
    var decBtn = document.getElementById('rsvpDecGuests');
    var incBtn = document.getElementById('rsvpIncGuests');
    var countDisplay = document.getElementById('rsvpGuestCountDisplay');

    if (decBtn && countDisplay) {
      decBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (guestCount > 1) {
          guestCount--;
          countDisplay.textContent = String(guestCount);
        }
      });
    }

    if (incBtn && countDisplay) {
      incBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (guestCount < 20) {
          guestCount++;
          countDisplay.textContent = String(guestCount);
        }
      });
    }

    // Attendance buttons
    var acceptBtn = document.getElementById('rsvpAcceptBtn');
    var declineBtn = document.getElementById('rsvpDeclineBtn');
    if (acceptBtn && declineBtn) {
      acceptBtn.addEventListener('click', function() {
        isAttending = 'Yes';
        acceptBtn.classList.add('bg-[#dea645]', 'text-[#39150f]', 'font-bold');
        declineBtn.classList.remove('bg-[#dea645]', 'text-[#39150f]', 'font-bold');
      });
      declineBtn.addEventListener('click', function() {
        isAttending = 'No';
        declineBtn.classList.add('bg-[#dea645]', 'text-[#39150f]', 'font-bold');
        acceptBtn.classList.remove('bg-[#dea645]', 'text-[#39150f]', 'font-bold');
      });
    }

    // Submit button
    var sendBtn = document.getElementById('sendRsvpBtn') || document.querySelector('button[type="submit"]');
    if (sendBtn) {
      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var nameInput = document.getElementById('rsvpNameInput') || document.querySelector('input[name="name"]');
        var guestName = (nameInput && nameInput.value.trim()) || 'Guest';
        var notesInput = document.getElementById('rsvpNotesInput') || document.querySelector('textarea[name="message"]');
        var notes = notesInput ? notesInput.value.trim() : '';

        var phone = weddingData.phone || '919876543210';
        var text = 'Namaste! 🙏\n\n' +
          'We are delighted to RSVP for the Royal Wedding of ' + weddingData.groom + ' & ' + weddingData.bride + '!\n\n' +
          '👑 Guest Name: ' + guestName + '\n' +
          '✨ Attending: ' + isAttending + '\n' +
          '👥 Number of Guests: ' + guestCount + '\n' +
          '🍲 Diet: ' + selectedDiet + '\n' +
          (notes ? '💌 Blessings: ' + notes + '\n' : '') +
          '\nDhanyawad!';

        var waUrl = 'https://api.whatsapp.com/send?phone=' + encodeURIComponent(phone) + '&text=' + encodeURIComponent(text);
        window.open(waUrl, '_blank');

        var alertBox = document.getElementById('rsvpSuccessAlert');
        if (alertBox) {
          alertBox.classList.remove('hidden');
          setTimeout(function() { alertBox.classList.add('hidden'); }, 5000);
        } else {
          alert('Dhanyawad ' + guestName + '! Your RSVP has been forwarded via WhatsApp. ✨');
        }
      });
    }
  }

  // ========================================================
  // 7. 🌸 FALLING ROSE PETALS AMBIANCE
  // ========================================================
  function initPetals() {
    var container = document.querySelector('.petal-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'petal-container';
      document.body.appendChild(container);
    }

    var petalCount = 14;
    for (var i = 0; i < petalCount; i++) {
      createPetal(container, i);
    }
  }

  function createPetal(container, index) {
    var petal = document.createElement('div');
    petal.className = 'petal-item';

    var size = 12 + Math.random() * 14;
    var startLeft = Math.random() * 100;
    var duration = 9 + Math.random() * 10;
    var delay = Math.random() * 12;

    petal.style.width = size + 'px';
    petal.style.height = (size * 1.3) + 'px';
    petal.style.left = startLeft + 'vw';
    petal.style.animation = 'rgw-petal ' + duration + 's linear ' + delay + 's infinite';

    container.appendChild(petal);
  }

  // ========================================================
  // 8. 🔄 DYNAMIC DATA BINDING
  // ========================================================
  function applyWeddingData(data) {
    if (!data) return;

    var groom = (data.couple && (data.couple.groomEn || data.couple.groomHi)) || data.groomName || 'Rahul';
    var bride = (data.couple && (data.couple.brideEn || data.couple.brideHi)) || data.brideName || 'Priya';
    var dateStr = (data.couple && data.couple.weddingDate) || data.weddingDate || '21 December 2026';
    var timeStr = (data.couple && data.couple.weddingTime) || '7:00 PM onwards';
    var venue = (data.couple && data.couple.venueName) || data.city || 'The Grand Palace, Udaipur';
    var hashtag = (data.couple && data.couple.hashtag) || data.hashtag || ('#' + groom + 'Weds' + bride);

    weddingData.groom = groom;
    weddingData.bride = bride;
    weddingData.date = dateStr;
    weddingData.time = timeStr;
    weddingData.venue = venue;

    if (data.contacts && data.contacts[0] && data.contacts[0].phone) {
      weddingData.phone = data.contacts[0].phone.replace(/[^0-9]/g, '');
    }

    document.querySelectorAll('.groom-name').forEach(function(el) { el.textContent = groom; });
    document.querySelectorAll('.bride-name').forEach(function(el) { el.textContent = bride; });
    document.querySelectorAll('.wedding-date').forEach(function(el) { el.textContent = dateStr; });
    document.querySelectorAll('.wedding-time').forEach(function(el) { el.textContent = timeStr; });
    document.querySelectorAll('.venue-name').forEach(function(el) { el.textContent = venue; });
    document.querySelectorAll('.wedding-hashtag').forEach(function(el) { el.textContent = hashtag; });

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

  
  // ========================================================
  // 9. 🚗 TIMELINE CAR SCROLL-DRIVE ANIMATION
  // ========================================================
  function initTimelineScroll() {
    var car = document.getElementById('timelineCarTracker');
    var timelineContainer = document.querySelector('.relative.mx-auto.max-w-6xl');
    if (!car || !timelineContainer) return;

    var goldLine = timelineContainer.querySelector('.rgw-bg-gold-grad.h-full');

    function onScroll() {
      var rect = timelineContainer.getBoundingClientRect();
      var windowH = window.innerHeight;
      
      // When top of timeline hits middle of screen, start moving car
      var totalDistance = rect.height - 200;
      var scrolled = (windowH * 0.5) - rect.top;
      var progress = Math.max(0, Math.min(1, scrolled / totalDistance));

      var percent = progress * 100;
      car.style.transform = 'translateY(' + percent + '%)';
      if (goldLine) {
        goldLine.style.transform = 'translateX(-1px) scaleY(' + Math.max(0.02, progress) + ')';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  window.applyWeddingData = applyWeddingData;
})();
