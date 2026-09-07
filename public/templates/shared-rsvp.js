/**
 * 🏰 AMANTRANLINK UNIVERSAL RSVP CLIENT ENGINE (ALL 7 ROYAL TEMPLATES)
 * Dynamically binds to theme RSVP forms, supports 3-tier attendance choices (Attending, Maybe, Decline),
 * connects to Supabase backend API, and communicates seamlessly with the Couple Dashboard & Live Canvas.
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

      // Headcount Stepper Controls (− / +) with 01 Guest / 02 Guests formatting
      var headcountDec = form.querySelector('.rsvp-count-dec');
      var headcountInc = form.querySelector('.rsvp-count-inc');
      var countDisplay = form.querySelector('.rsvp-count-val');
      var countLabel = form.querySelector('.rsvp-count-label');
      var countSelect = form.querySelector('select[name="attendees_count"]');
      var countHidden = form.querySelector('input[name="attendees_count"]');

      function formatGuestCount(num) {
        var n = parseInt(num, 10) || 1;
        var formatted = n < 10 ? '0' + n : String(n);
        var label = n === 1 ? 'Guest' : 'Guests';
        return { formatted: formatted, label: label, raw: n };
      }

      function updateHeadcount(newCount) {
        var clamped = Math.max(1, Math.min(30, newCount));
        var res = formatGuestCount(clamped);
        if (countDisplay) countDisplay.textContent = res.formatted;
        if (countLabel) countLabel.textContent = res.label;
        if (countSelect) countSelect.value = String(clamped);
        if (countHidden) countHidden.value = String(clamped);
      }

      if (headcountDec) {
        headcountDec.addEventListener('click', function (e) {
          e.preventDefault();
          var current = countHidden ? parseInt(countHidden.value, 10) || 2 : (countDisplay ? parseInt(countDisplay.textContent, 10) || 2 : 2);
          updateHeadcount(current - 1);
        });
      }
      if (headcountInc) {
        headcountInc.addEventListener('click', function (e) {
          e.preventDefault();
          var current = countHidden ? parseInt(countHidden.value, 10) || 2 : (countDisplay ? parseInt(countDisplay.textContent, 10) || 2 : 2);
          updateHeadcount(current + 1);
        });
      }
      if (countSelect) {
        countSelect.addEventListener('change', function () {
          var res = formatGuestCount(countSelect.value);
          if (countDisplay) countDisplay.textContent = res.formatted;
          if (countLabel) countLabel.textContent = res.label;
          if (countHidden) countHidden.value = countSelect.value;
        });
      }

      // Attending Option Toggle (Attending vs Declined)
      var attendanceToggles = form.querySelectorAll('input[name="attending"]');
      var submitBtn = form.querySelector('button[type="submit"]');

      function syncChoiceCardVisuals() {
        attendanceToggles.forEach(function (radio) {
          var card = radio.closest('.rjm-choice-card, .rsvp-choice-card, label');
          var checkIcon = card ? card.querySelector('.choice-check-icon') : null;
          if (card) {
            if (radio.checked) {
              card.classList.add('selected-choice', 'border-[#C49A35]', 'bg-[#FFFDF8]', 'shadow-sm');
              card.classList.remove('border-[#E8DFD1]', 'border-[#E8D5AD]', 'bg-[#FAF6EE]');
              if (checkIcon) {
                checkIcon.style.opacity = '1';
                checkIcon.style.color = '#C49A35';
              }
            } else {
              card.classList.remove('selected-choice', 'border-[#C49A35]', 'shadow-sm');
              card.classList.add('border-[#E8DFD1]', 'bg-[#FAF6EE]');
              if (checkIcon) {
                checkIcon.style.opacity = '0.35';
                checkIcon.style.color = '#9C8C8E';
              }
            }
          }
        });

        // Sync Dynamic CTA Button Text
        var checkedRadio = form.querySelector('input[name="attending"]:checked');
        var val = checkedRadio ? checkedRadio.value : 'true';
        var isDeclined = val === 'false' || val === '0' || val === 'not_attending' || val === 'no';
        var ctaTextSpan = form.querySelector('.rsvp-cta-text');

        if (ctaTextSpan) {
          if (isDeclined) {
            ctaTextSpan.textContent = 'SEND OUR LOVE & WISHES →';
          } else {
            ctaTextSpan.textContent = 'CONFIRM MY RSVP →';
          }
        }

        // Toggle visibility of headcount & dining preference groups
        var attendeeCountContainer = form.querySelector('.rsvp-attendees-group');
        var mealPrefContainer = form.querySelector('.rsvp-meal-group');

        if (attendeeCountContainer) {
          if (isDeclined) {
            attendeeCountContainer.style.display = 'none';
          } else {
            attendeeCountContainer.style.display = 'block';
          }
        }
        if (mealPrefContainer) {
          if (isDeclined) {
            mealPrefContainer.style.display = 'none';
          } else {
            mealPrefContainer.style.display = 'block';
          }
        }
      }

      // Meal / Dining Preference Custom Request Reveal
      var mealRadios = form.querySelectorAll('input[name="meal_preference"]');
      var customMealContainer = form.querySelector('.rsvp-custom-meal-wrap');

      function syncMealPreferenceVisuals() {
        var checkedMeal = form.querySelector('input[name="meal_preference"]:checked');
        var val = checkedMeal ? checkedMeal.value : '';
        if (customMealContainer) {
          if (val === 'Other / Special Request' || val === 'Special Request' || val === 'Other') {
            customMealContainer.style.display = 'block';
          } else {
            customMealContainer.style.display = 'none';
          }
        }
      }

      mealRadios.forEach(function (radio) {
        radio.addEventListener('change', syncMealPreferenceVisuals);
      });
      syncMealPreferenceVisuals();

      attendanceToggles.forEach(function (radio) {
        radio.addEventListener('change', syncChoiceCardVisuals);
      });

      // Initial visual sync
      syncChoiceCardVisuals();

      // Submit Handler
      form.addEventListener('submit', async function (e) {
        e.preventDefault();

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
        var mealInput = form.querySelector('input[name="meal_preference"]:checked') || form.querySelector('[name="meal_preference"]');
        var wishesInput = form.querySelector('[name="wishes"]');

        var guestName = nameInput ? nameInput.value.trim() : '';
        var guestPhone = phoneInput ? phoneInput.value.trim() : '';
        var attendanceRaw = attendingInput ? attendingInput.value : 'true';
        var isAttending = attendanceRaw === 'true' || attendanceRaw === '1' || attendanceRaw === true || attendanceRaw === 'attending';
        var isMaybe = attendanceRaw === 'maybe';
        var attendeesCount = (isAttending || isMaybe) ? (attendeesInput ? Math.max(1, parseInt(attendeesInput.value, 10) || 1) : 1) : 0;
        var mealPreference = mealInput ? mealInput.value : null;
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
            'SAVING YOUR RESPONSE…</span>';
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

        var storageKey = 'shahi_rsvp_' + (meta.slug || 'wedding');
        var attendanceStatus = isAttending ? 'Attending' : 'Not Attending';

        var customMealNote = form.querySelector('[name="custom_meal_note"]');
        var fullMealPref = mealPreference;
        if (mealPreference === 'Other / Special Request' && customMealNote && customMealNote.value.trim()) {
          fullMealPref = 'Special: ' + customMealNote.value.trim();
        }

        var payload = {
          wedding_slug: meta.slug || window.LIVE_WEDDING_SLUG || 'royal-wedding',
          guest_name: guestName,
          guest_phone: guestPhone,
          attendees_count: attendeesCount,
          attending: isAttending,
          attendance_status: attendanceStatus,
          meal_preference: fullMealPref,
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
              throw new Error(gwJson.error || errorDetail || 'Unable to submit RSVP.');
            }
          }

          // Persist response locally for "Already Responded" return view
          try {
            localStorage.setItem(storageKey, JSON.stringify(payload));
          } catch (e) {}

          // Populate Confirmation Screen with Contextual Message
          if (successContainer) {
            var confirmedNameEls = successContainer.querySelectorAll('.rsvp-confirmed-name, .guest-name-confirmed');
            confirmedNameEls.forEach(function (el) {
              el.textContent = guestName;
            });

            var countEls = successContainer.querySelectorAll('.rsvp-confirmed-count');
            countEls.forEach(function (el) {
              el.textContent = attendeesCount < 10 ? '0' + attendeesCount : String(attendeesCount);
            });

            var countLabelEls = successContainer.querySelectorAll('.rsvp-confirmed-count-label');
            countLabelEls.forEach(function (el) {
              el.textContent = attendeesCount === 1 ? 'Guest' : 'Guests';
            });

            var mealPrefEl = successContainer.querySelector('.rsvp-confirmed-meal');
            if (mealPrefEl) {
              mealPrefEl.textContent = fullMealPref || 'Traditional Feast';
            }

            // Contextual thank you note
            var noteEl = successContainer.querySelector('.rsvp-success-note');
            if (noteEl) {
              if (isAttending) {
                noteEl.textContent = "We’re so happy to celebrate this moment with you. We'll keep your place ready.";
              } else {
                noteEl.textContent = 'Thank you for letting us know. Sending our love and warmest blessings.';
              }
            }

            var badgeEl = successContainer.querySelector('.rsvp-success-badge');
            if (badgeEl) {
              if (isAttending) {
                badgeEl.innerHTML = '<span style="color:#167A5A;font-weight:bold;">✓ Attendance Confirmed</span> · ' + (attendeesCount < 10 ? '0' + attendeesCount : attendeesCount) + ' ' + (attendeesCount === 1 ? 'Guest' : 'Guests');
                badgeEl.style.borderColor = '#BCE3D1';
                badgeEl.style.backgroundColor = '#FAF6EE';
              } else {
                badgeEl.innerHTML = '<span style="color:#6E1020;font-weight:bold;">🕊️ Sending Love from Afar</span> · Regretfully Declined';
                badgeEl.style.borderColor = '#E8DFD1';
                badgeEl.style.backgroundColor = '#FAF6EE';
              }
            }

            // Update RSVP Button Action
            var updateBtn = successContainer.querySelector('.rsvp-update-btn');
            if (updateBtn && !updateBtn.dataset.bound) {
              updateBtn.dataset.bound = 'true';
              updateBtn.addEventListener('click', function (ev) {
                ev.preventDefault();
                successContainer.style.display = 'none';
                if (formFieldsContainer && formFieldsContainer !== form) {
                  formFieldsContainer.style.display = 'block';
                }
                form.style.display = 'block';
                if (submitBtn) {
                  submitBtn.disabled = false;
                  submitBtn.innerHTML = '<span class="text-[#F4D06F]">✦</span><span class="rsvp-cta-text">UPDATE MY RSVP →</span><span class="text-[#F4D06F]">✦</span>';
                }
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
              });
            }
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

          // Notify Parent Frame / Couple Dashboard
          try {
            window.parent.postMessage({
              type: 'SHAHI_RSVP_SUBMITTED',
              data: payload
            }, '*');
          } catch (e) {}

        } catch (err) {
          console.error('RSVP Submission Error:', err);
          showError(form, "We couldn’t save your response just yet. Kindly check your connection and try again.");
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
      errorBanner.style.cssText = 'color:#6E1020;background:#FDF2F4;border:1px solid #C49A35;border-radius:16px;padding:12px 18px;font-size:12px;margin-bottom:16px;text-align:center;font-weight:600;font-family:inherit;box-shadow:0 2px 8px rgba(110,16,32,0.08);';
      form.insertBefore(errorBanner, form.firstChild);
    }
    errorBanner.innerHTML = '✦ ' + msg + ' <button type="button" onclick="this.parentElement.style.display=\'none\'" style="margin-left:8px;text-decoration:underline;cursor:pointer;background:none;border:none;color:#6E1020;font-weight:bold;">Try Again</button>';
    errorBanner.style.display = 'block';
  }

  // Auto-init on DOMContentLoaded or immediate if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShahiRsvp);
  } else {
    initShahiRsvp();
  }
})();
