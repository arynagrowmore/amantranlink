/**
 * 🏰 AMANTRANLINK UNIVERSAL RSVP CLIENT ENGINE (ALL 7 TEMPLATES)
 * Dynamically binds to theme RSVP forms, validates input, connects to Supabase backend API,
 * and communicates seamlessly with the Couple Dashboard & Live Canvas.
 */

(function () {
  'use strict';

  // 1. Dynamic Wedding Identification
  function getActiveWeddingMetadata() {
    var urlParams = new URLSearchParams(window.location.search);
    var parentParams = null;
    try {
      if (window.parent && window.parent.location) {
        parentParams = new URLSearchParams(window.parent.location.search);
      }
    } catch (e) {}

    var siteId = 
      (window.LIVE_WEDDING_SITE_ID) || 
      (window.parent && window.parent.LIVE_WEDDING_SITE_ID) ||
      (urlParams.get('siteId')) || 
      (parentParams && parentParams.get('siteId')) || 
      '';

    var slug = 
      (window.LIVE_WEDDING_SLUG) || 
      (window.parent && window.parent.LIVE_WEDDING_SLUG) ||
      (urlParams.get('invite')) || 
      (parentParams && parentParams.get('invite')) || 
      (urlParams.get('slug')) || 
      (parentParams && parentParams.get('slug')) || 
      window.LIVE_WEDDING_SLUG ||
      '';

    if (!slug) {
      var pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && (pathParts[0] === 'wedding' || pathParts[0] === 'i' || pathParts[0] === 'invite') && pathParts[1]) {
        slug = pathParts[1];
      } else {
        slug = window.LIVE_WEDDING_SLUG || 'royal-wedding';
      }
    }

    return {
      siteId: siteId,
      slug: slug
    };
  }

  // 2. Initialize RSVP Forms across all templates
  function initShahiRsvp() {
    var forms = document.querySelectorAll('.shahi-rsvp-form, form[data-shahi-rsvp="true"]');
    if (!forms || forms.length === 0) return;

    forms.forEach(function (form) {
      if (form.dataset.rsvpInitialized === 'true') return;
      form.dataset.rsvpInitialized = 'true';

      // Attendee selection toggle highlight (if segmented buttons exist)
      var attendeePills = form.querySelectorAll('.rsvp-attendee-pill');
      attendeePills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          attendeePills.forEach(function (p) {
            p.classList.remove('active', 'selected', 'ring-2', 'border-gold');
          });
          pill.classList.add('active', 'selected');
          var hiddenCountInput = form.querySelector('input[name="attendees_count"]');
          if (hiddenCountInput && pill.dataset.count) {
            hiddenCountInput.value = pill.dataset.count;
          }
        });
      });

      // Attending Yes/No Choice Cards toggle
      var choiceCards = form.querySelectorAll('.rjm-choice-card, .rsvp-choice-card');
      var attendanceToggles = form.querySelectorAll('input[name="attending"]');

      function syncChoiceCardVisuals() {
        attendanceToggles.forEach(function (radio) {
          var card = radio.closest('.rjm-choice-card, .rsvp-choice-card, label');
          if (card) {
            if (radio.checked) {
              card.classList.add('selected-choice', 'border-[#6E1020]', 'bg-[#FFFDF8]', 'shadow-sm');
              card.classList.remove('border-[#E8D5AD]', 'border-[#D8C7AA]', 'opacity-70');
            } else {
              card.classList.remove('selected-choice', 'border-[#6E1020]', 'shadow-sm');
              card.classList.add('border-[#E8D5AD]', 'opacity-80');
            }
          }
        });
      }

      attendanceToggles.forEach(function (radio) {
        radio.addEventListener('change', function () {
          syncChoiceCardVisuals();
          var attendeeCountContainer = form.querySelector('.rsvp-attendees-group');
          if (attendeeCountContainer) {
            if (radio.value === 'false' || radio.value === false) {
              attendeeCountContainer.style.opacity = '0.4';
              attendeeCountContainer.style.pointerEvents = 'none';
            } else {
              attendeeCountContainer.style.opacity = '1';
              attendeeCountContainer.style.pointerEvents = 'auto';
            }
          }
        });
      });

      // Initial visual sync
      syncChoiceCardVisuals();

      // Submit Handler
      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        var errorBanner = form.querySelector('.rsvp-error-msg');
        var successContainer = form.parentElement.querySelector('.rsvp-success-card') || form.querySelector('.rsvp-success-card');
        var formFieldsContainer = form.querySelector('.rsvp-fields-container') || form;

        if (errorBanner) {
          errorBanner.style.display = 'none';
          errorBanner.textContent = '';
        }

        // Form values extraction
        var nameInput = form.querySelector('[name="guest_name"]');
        var phoneInput = form.querySelector('[name="guest_phone"]');
        var attendingInput = form.querySelector('input[name="attending"]:checked');
        var attendeesInput = form.querySelector('[name="attendees_count"]');
        var wishesInput = form.querySelector('[name="wishes"]');

        var guestName = nameInput ? nameInput.value.trim() : '';
        var guestPhone = phoneInput ? phoneInput.value.trim() : '';
        var isAttending = attendingInput ? (attendingInput.value === 'true' || attendingInput.value === '1' || attendingInput.value === true) : true;
        var attendeesCount = attendeesInput ? Math.max(1, parseInt(attendeesInput.value, 10) || 1) : 1;
        var wishes = wishesInput ? wishesInput.value.trim() : '';

        // Validation
        if (!guestName || guestName.length < 2) {
          showError(form, 'Please enter your full name (कृपया अपना नाम दर्ज करें).');
          if (nameInput) nameInput.focus();
          return;
        }

        var isPhoneRequired = phoneInput ? phoneInput.hasAttribute('required') : false;
        var digitsOnly = guestPhone.replace(/[^0-9]/g, '');
        if (isPhoneRequired && (!guestPhone || digitsOnly.length < 7)) {
          showError(form, 'Please enter a valid mobile number (कृपया वैध मोबाइल नंबर दर्ज करें).');
          if (phoneInput) phoneInput.focus();
          return;
        } else if (guestPhone && digitsOnly.length < 7) {
          showError(form, 'Please enter a valid mobile number (कृपया वैध मोबाइल नंबर दर्ज करें).');
          if (phoneInput) phoneInput.focus();
          return;
        }

        // Loading State
        var origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;">' +
            '<svg style="animation:spin 1s linear infinite;width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-linecap="round"/></svg>' +
            '✦ RECORDING RSVP…</span>';
        }

        var meta = getActiveWeddingMetadata();
        var isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        var validSiteId = (meta.siteId && isValidUUID.test(meta.siteId)) ? meta.siteId : null;

        // Auto-resolve site ID from slug if not present in metadata
        if (!validSiteId && meta.slug && meta.slug !== 'general') {
          try {
            var apiBase = (window.VITE_API_BASE_URL || window.API_BASE_URL || '');
            var rRes = await fetch(apiBase + '/api/rsvp/resolve-site?slug=' + encodeURIComponent(meta.slug));
            if (rRes.ok) {
              var rJson = await rRes.json();
              if (rJson.success && rJson.siteId && isValidUUID.test(rJson.siteId)) {
                validSiteId = rJson.siteId;
              }
            }
          } catch (resErr) {}
        }

        var payload = {
          wedding_slug: meta.slug || window.LIVE_WEDDING_SLUG || 'royal-wedding',
          guest_name: guestName,
          guest_phone: guestPhone,
          attendees_count: isAttending ? attendeesCount : 0,
          attending: isAttending,
          wishes: wishes
        };
        if (validSiteId) {
          payload.wedding_site_id = validSiteId;
        }

        try {
          var submitted = false;
          var errorDetail = '';

          // 1. Direct Supabase REST API (Instant cloud delivery)
          try {
            var sbUrl = 'https://owziiqdxbvynrprugvwk.supabase.co';
            var sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emlpcWR4YnZ5bnJwcnVndndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzAyMDMsImV4cCI6MjEwMjgwNjIwM30._rrJrh-NLf3t0sQzvmcQL9X3CzZH_nvHGvqOv1ijqeI';
            
            var sbRes = await fetch(sbUrl + '/rest/v1/rsvps', {
              method: 'POST',
              headers: {
                'apikey': sbKey,
                'Authorization': 'Bearer ' + sbKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(payload)
            });

            if (sbRes.ok) {
              submitted = true;
            } else {
              var sbJson = await sbRes.json();
              errorDetail = sbJson.message || sbJson.error || '';
            }
          } catch (sbErr) {
            errorDetail = sbErr.message || '';
          }

          // 2. Gateway Server Fallback (/api/rsvp/submit)
          if (!submitted) {
            var apiBase = (window.VITE_API_BASE_URL || window.API_BASE_URL || '');
            var gwRes = await fetch(apiBase + '/api/rsvp/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            var gwJson = await gwRes.json();
            if (gwRes.ok && gwJson.success) {
              submitted = true;
            } else {
              throw new Error(gwJson.error || errorDetail || 'Unable to submit RSVP. Please try again.');
            }
          }

          // Populate Guest Name in Success Card
          if (successContainer) {
            var confirmedNameEls = successContainer.querySelectorAll('.rsvp-confirmed-name, .guest-name-confirmed');
            confirmedNameEls.forEach(function (el) {
              el.textContent = guestName;
            });
          }

          // Success Presentation (Soft transition)
          if (formFieldsContainer && formFieldsContainer !== form) {
            formFieldsContainer.style.display = 'none';
          } else {
            form.style.display = 'none';
          }

          if (successContainer) {
            successContainer.style.display = 'block';
            successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          // Notify Parent Frame / Couple Dashboard / Profile
          try {
            window.parent.postMessage({
              type: 'SHAHI_RSVP_SUBMITTED',
              data: payload
            }, '*');
          } catch (e) {}

        } catch (err) {
          console.error('RSVP Submission Error:', err);
          showError(form, "We couldn't record your RSVP right now. Please check your details and try again.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;
          }
        }
      });
    });
  }

  function showError(form, msg) {
    var errorBanner = form.querySelector('.rsvp-error-msg');
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.className = 'rsvp-error-msg';
      errorBanner.style.cssText = 'color:#6E1020;background:#FDF2F4;border:1px solid #E8D5AD;border-radius:14px;padding:10px 14px;font-size:12px;margin-bottom:14px;text-align:center;font-weight:600;font-family:inherit;';
      form.insertBefore(errorBanner, form.firstChild);
    }
    errorBanner.innerHTML = '✦ ' + msg;
    errorBanner.style.display = 'block';
  }

  // Auto-init on DOMContentLoaded or immediate if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShahiRsvp);
  } else {
    initShahiRsvp();
  }

  // Expose global init hook for SPA re-renders
  window.initShahiRsvp = initShahiRsvp;

  // 🎵 Universal Single Audio Enforcement across All Templates
  window.addEventListener('message', function(event) {
    if (!event.data) return;
    if (event.data.type === 'PAUSE_AUDIO' || event.data.type === 'STOP_AUDIO' || event.data.type === 'MUTE_AUDIO') {
      document.querySelectorAll('audio').forEach(function(a) {
        try { 
          a.pause(); 
        } catch(e) {}
      });
      document.querySelectorAll('.rjm-music-btn, #rjm-music-toggle, .music-btn, .audio-toggle, .rjm-audio-widget').forEach(function(btn) {
        btn.classList.remove('is-playing', 'playing');
      });
    }
  });

  // Broadcast to parent when this template plays audio so parent can pause conflicting iframes
  document.addEventListener('play', function(e) {
    if (e.target && e.target.tagName === 'AUDIO') {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'AUDIO_STARTED_IN_IFRAME' }, '*');
        }
      } catch(err) {}
    }
  }, true);
})();


