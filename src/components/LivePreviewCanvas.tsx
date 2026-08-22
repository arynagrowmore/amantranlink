import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, ShieldCheck, Lock, Share2, RotateCw, Wifi, BatteryCharging } from 'lucide-react';
import { WeddingProjectState, PhotoFilterType } from '../types/wedding';
import { themes } from './ThemeSelector';

interface LivePreviewCanvasProps {
  state: WeddingProjectState;
  refreshKey?: number;
  siteId?: string;
}

const getFilterStyle = (filter?: PhotoFilterType): string => {
  if (!filter || filter === 'none') return 'none';
  if (filter === 'gold-glow') return 'sepia(35%) saturate(140%) brightness(105%) contrast(105%)';
  if (filter === 'vintage') return 'sepia(60%) contrast(110%) brightness(95%) saturate(90%)';
  if (filter === 'rose-blush') return 'saturate(120%) brightness(105%) hue-rotate(-10deg) contrast(102%)';
  if (filter === 'monochrome') return 'grayscale(100%) contrast(120%) brightness(100%)';
  return 'none';
};

// 🎯 Robust Universal Date Parser for any date format
const parseTargetWeddingMs = (rawDateStr: string): number => {
  if (!rawDateStr || !rawDateStr.trim()) {
    return new Date(new Date().getFullYear() + 1, 11, 3, 18, 30, 0).getTime();
  }

  const monthsMap: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11
  };

  // 1. Match Day Month Year (e.g. 3 December 2026 or 15 Feb 2027)
  const textMatch = rawDateStr.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1]);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3]);
    const month = monthsMap[monthKey] ?? 11;
    
    let hours = 18;
    let mins = 30;
    const timeMatch = rawDateStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2]);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hours = h;
      mins = m;
    }
    return new Date(year, month, day, hours, mins, 0).getTime();
  }

  // 2. Match ISO (e.g. 2026-12-03)
  const isoMatch = rawDateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]) - 1;
    const day = parseInt(isoMatch[3]);
    return new Date(year, month, day, 18, 30, 0).getTime();
  }

  const clean = rawDateStr.split('·')[0].split('(')[0].trim();
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) return parsed;

  const now = new Date();
  return new Date(now.getFullYear() + 1, 11, 3, 18, 30, 0).getTime();
};

export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = ({ state, refreshKey = 0, siteId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('09:41');
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const lastSecondRef = useRef<string>('');

  const templateUrls: Record<string, string> = {
    rajmahal: '/templates/rajmahal-template/index.html',
    jharokha: '/templates/jharokha-template/index.html',
    mayura: '/templates/mayura-template/index.html',
    jodi: '/templates/jodi-template/index.html',
    dak: '/templates/dak-template/index.html',
    ivory: '/templates/ivory-template/index.html',
    royaldawn: '/templates/royaldawn-template/index.html',
  };

  const targetUrl = templateUrls[state.theme] || '/templates/rajmahal-template/index.html';

  // Live Clock for iPhone Status Bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Audio File
  useEffect(() => {
    if (state.media.audioBlob) {
      const url = URL.createObjectURL(state.media.audioBlob);
      setAudioUrl(url);
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      };
    }
  }, [state.media.audioBlob]);

  const toggleAudio = () => {
    if (!internalAudioRef.current) return;
    if (isPlayingAudio) {
      internalAudioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      internalAudioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  // ⏰ 100% Universal All-Template Live Countdown Engine
  const startUniversalCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    const win = iframe.contentWindow as any;
    const doc = iframe.contentDocument;

    const targetMs = parseTargetWeddingMs(state.couple.weddingDate);
    win.LIVE_TARGET_DATE_MS = targetMs;

    const updateCountdownDOM = () => {
      try {
        const diff = Math.max(0, targetMs - Date.now());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const dStr = String(days).padStart(2, '0');
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(mins).padStart(2, '0');
        const sStr = String(secs).padStart(2, '0');

        const shouldAnimate = lastSecondRef.current !== sStr;
        lastSecondRef.current = sStr;

        const setNodeText = (el: Element | null, val: string, animate = false) => {
          if (!el) return;
          if (el.textContent !== val) {
            el.textContent = val;
            if (animate) {
              el.classList.remove('countdown-tick-anim');
              void (el as HTMLElement).offsetWidth;
              el.classList.add('countdown-tick-anim');
            }
          }
        };

        // 1. Rajmahal, Jodi, Jharokha, Mayura, Dâk countdown numerals
        const allCountNums = doc.querySelectorAll('.rjm-count-num, .jdi-count-num, .jdi-countnum, .jhr-count-num, .myr-count-num, .dak-count-num, .dak-countnum, .count-num, .time-num, .countdown-num');
        if (allCountNums.length >= 4) {
          setNodeText(allCountNums[0], dStr, false);
          setNodeText(allCountNums[1], hStr, false);
          setNodeText(allCountNums[2], mStr, false);
          setNodeText(allCountNums[3], sStr, shouldAnimate);
        }

        // 2. Ivory and Tailwind tabular-nums
        const tabNums = doc.querySelectorAll('section [class*="tabular-nums"], .tabular-nums, .g-serif.tabular-nums, .countdown-digit, .g-countnum');
        if (tabNums.length >= 4) {
          setNodeText(tabNums[0], dStr, false);
          setNodeText(tabNums[1], hStr, false);
          setNodeText(tabNums[2], mStr, false);
          setNodeText(tabNums[3], sStr, shouldAnimate);
        }

        // 3. ID / Data attribute selectors
        setNodeText(doc.querySelector('#days, #count-days, [data-unit="days"], .countdown-days'), dStr, false);
        setNodeText(doc.querySelector('#hours, #count-hours, [data-unit="hours"], .countdown-hours'), hStr, false);
        setNodeText(doc.querySelector('#mins, #count-mins, [data-unit="mins"], .countdown-mins'), mStr, false);
        setNodeText(doc.querySelector('#secs, #count-secs, [data-unit="secs"], .countdown-secs'), sStr, shouldAnimate);
      } catch (e) {}
    };

    updateCountdownDOM();
    const intervalId = win.setInterval(updateCountdownDOM, 1000);
    win.__shahiCountdownRunning = intervalId;
    countdownIntervalRef.current = intervalId;
  };

  // 🧹 Recursive Universal DOM Text Node Sweeper (Guarantees 0% Demo Residue)
  const sweepDemoTextNodes = (root: Node, replacements: [RegExp, string][]) => {
    try {
      const walker = root.ownerDocument?.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      if (!walker) return;

      const nodes: Node[] = [];
      let curr = walker.nextNode();
      while (curr) {
        nodes.push(curr);
        curr = walker.nextNode();
      }

      nodes.forEach((node) => {
        let text = node.nodeValue;
        if (!text || !text.trim()) return;

        let modified = false;
        replacements.forEach(([pattern, replacement]) => {
          if (pattern.test(text!)) {
            text = text!.replace(pattern, replacement);
            modified = true;
          }
        });

        if (modified) {
          node.nodeValue = text;
        }
      });
    } catch (e) {}
  };

  // ⚡ 100% EXHAUSTIVE MASTER DEEP SYNCHRONIZER
  const performMasterSync = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as any;

      const currentSlug = `${(state.couple.groomEn || 'dhruv').toLowerCase()}-${(state.couple.brideEn || 'shreya').toLowerCase()}`;
      win.LIVE_WEDDING_SLUG = currentSlug;
      win.LIVE_WEDDING_SITE_ID = siteId || null;
      if (typeof win.initShahiRsvp === 'function') {
        try { win.initShahiRsvp(); } catch (e) {}
      }

      const groomEn = state.couple.groomEn || 'Dhruv';
      const brideEn = state.couple.brideEn || 'Shreya';
      const groomHi = state.couple.groomHi || groomEn;
      const brideHi = state.couple.brideHi || brideEn;
      const groomGu = state.couple.groomGu || groomEn;
      const brideGu = state.couple.brideGu || brideEn;

      const isHindi = state.language === 'hi';
      const isGujarati = state.language === 'gu';

      let displayGroom = groomEn;
      let displayBride = brideEn;
      let displayGroomParents = state.family.groomParentsEn || 'Mr. Nalinkumar & Mrs. Kalpuben';
      let displayBrideParents = state.family.brideParentsEn || 'Mr. & Mrs. Sharma';
      let amp = '&';

      if (isHindi) {
        displayGroom = groomHi;
        displayBride = brideHi;
        displayGroomParents = state.family.groomParentsHi || displayGroomParents;
        displayBrideParents = state.family.brideParentsHi || displayBrideParents;
        amp = 'एवं';
      } else if (isGujarati) {
        displayGroom = groomGu;
        displayBride = brideGu;
        displayGroomParents = state.family.groomParentsGu || displayGroomParents;
        displayBrideParents = state.family.brideParentsGu || displayBrideParents;
        amp = 'અને';
      }

      const date = state.couple.weddingDate || '3 December 2026 · 06:30 PM';
      const venue = state.couple.venueName || 'The Milestone, Himmatnagar';
      const mark = state.couple.mark || `${groomEn.charAt(0)} · ${brideEn.charAt(0)}`;
      const hashtag = state.couple.hashtag || `#${groomEn}Ki${brideEn}`;
      const rsvp1Name = state.family.rsvp1Name || 'Family Contact';
      const rsvp1Phone = state.family.rsvp1Phone || '+91 98251 45678';
      const rsvp2Name = state.family.rsvp2Name || 'Helpdesk';
      const rsvp2Phone = state.family.rsvp2Phone || '+91 98982 34567';
      const slots = state.media.photoSlots || {};

      // 1. Update Window Config
      const targetMs = parseTargetWeddingMs(date);
      win.LIVE_TARGET_DATE_MS = targetMs;
      if (win.WEDDING_CONFIG) {
        win.WEDDING_CONFIG.groomName = displayGroom;
        win.WEDDING_CONFIG.brideName = displayBride;
        win.WEDDING_CONFIG.weddingDate = date;
        win.WEDDING_CONFIG.city = venue;
        win.WEDDING_CONFIG.mark = mark;
        win.WEDDING_CONFIG.hashtag = hashtag;
        win.WEDDING_CONFIG.contacts = [
          { name: rsvp1Name, phone: rsvp1Phone },
          { name: rsvp2Name, phone: rsvp2Phone },
        ];
        if (win.WEDDING_CONFIG.groomParents) {
          win.WEDDING_CONFIG.groomParents.father = displayGroomParents;
        }
      }

      // 2. Language switch
      doc.documentElement.setAttribute('data-lang', state.language || 'en');
      doc.documentElement.lang = state.language || 'en';
      if (typeof win.switchLanguage === 'function') {
        win.switchLanguage(state.language || 'en');
      }

      doc.title = `${displayGroom} ${amp} ${displayBride} — Shahi Vivah`;

      // 3. Couple Names in Headings Everywhere
      if (state.theme === 'ivory') {
        const h1s = doc.querySelectorAll('section#top h1.g-serif, h1');
        if (h1s.length >= 2) {
          h1s[0].textContent = displayGroom;
          h1s[1].textContent = displayBride;
        } else if (h1s.length === 1) {
          h1s[0].innerHTML = `${displayGroom} <span class="italic">&amp;</span> ${displayBride}`;
        }
      } else {
        const nameSelectors = [
          '.rjm-hero-names', '.rjm-couple-names', '.rjm-foot-names',
          '.jhr-hero-names', '.jhr-couple-names', '.jhr-foot-names',
          '.myr-hero-names', '.myr-couple-names', '.myr-foot-names',
          '.jdi-hero-names', '.jdi-couple-names', '.jdi-foot-names', '.jdi-couple-name',
          '.dak-hero-names', '.dak-couple-names', '.dak-foot-names',
          'h1.couple-names', 'h2.couple-names', '.hero-names', '.couple-title',
          '[data-field="couple-names"]', '.rjm-names', '.jhr-names', '.myr-names', '.jdi-names', '.dak-names'
        ];
        doc.querySelectorAll(nameSelectors.join(', ')).forEach((el) => {
          el.innerHTML = `<span>${displayGroom}</span> <span class="rjm-amp font-serif text-[#C59B4B]">${amp}</span> <span>${displayBride}</span>`;
        });
      }

      doc.querySelectorAll('.groom-name, #groom-name, [data-field="groom-name"], .rjm-groom-name').forEach((el) => {
        el.textContent = displayGroom;
      });
      doc.querySelectorAll('.bride-name, #bride-name, [data-field="bride-name"], .rjm-bride-name').forEach((el) => {
        el.textContent = displayBride;
      });

      // 4. Monogram & Hashtag
      doc.querySelectorAll('.rjm-nav-mark, .nav-mark, .monogram, .couple-mark, #couple-mark, .mark-tag, .logo-monogram, a.g-serif').forEach((el) => {
        el.textContent = mark;
      });
      doc.querySelectorAll('.rjm-foot-tag, .hashtag, #wedding-hashtag, .wedding-tag, .foot-hashtag').forEach((el) => {
        el.textContent = hashtag;
      });

      // 5. Wedding Dates
      const dateSelectors = [
        '.rjm-hero-date', '.rjm-couple-date', '.rjm-foot-date', '.rjm-date',
        '.jhr-hero-date', '.jhr-date', '.jhr-foot-date',
        '.myr-hero-date', '.myr-date', '.myr-foot-date',
        '.jdi-hero-date', '.jdi-date', '.jdi-foot-date',
        '.dak-postmark-date', '.dak-date', '.dak-foot-date',
        '.ivory-date', '.wedding-date', '#wedding-date', '.date-label',
        '[data-field="wedding-date"]', '[data-field="date"]', 'section#top p.g-serif.text-3xl.italic'
      ];
      doc.querySelectorAll(dateSelectors.join(', ')).forEach((el) => {
        el.textContent = date;
      });

      // 6. Venues
      const venueSelectors = [
        '.rjm-venue', '.jhr-venue', '.myr-venue', '.jdi-venue', '.dak-venue', '.ivory-venue',
        '.venue-text', '#venue-address', '[data-field="venue"]', 'section#top p.text-xs.font-bold.uppercase'
      ];
      doc.querySelectorAll(venueSelectors.join(', ')).forEach((el) => {
        el.textContent = venue;
      });

      // 7. Family Parents & Relatives Sync
      const familySides = doc.querySelectorAll('.rjm-family-side, .family-col, .family-side, .rjm-family-grid > div');
      if (familySides.length >= 2) {
        const groomParentEl = familySides[0].querySelector('.rjm-family-name, .parent-name, p:first-child');
        if (groomParentEl) groomParentEl.textContent = displayGroomParents;
        const brideParentEl = familySides[1].querySelector('.rjm-family-name, .parent-name, p:first-child');
        if (brideParentEl) brideParentEl.textContent = displayBrideParents;
      }
      doc.querySelectorAll('.rjm-parents, .parents-name, #groom-parents, [data-field="parents"]').forEach((el) => {
        el.textContent = displayGroomParents;
      });

      // 8. Event Cards (Celebrations / Schedule)
      const eventCards = doc.querySelectorAll('.rjm-event, .event-card, .timeline-item, .rasam-card, .jhr-event-card, .myr-event-card, .dak-event-card, article');
      state.events.forEach((evt, idx) => {
        if (eventCards[idx]) {
          const card = eventCards[idx];
          const nameEl = card.querySelector('.rjm-event-name, .event-title, h3, h4');
          const dateEl = card.querySelector('.rjm-event-date, .event-date, .date-badge');
          const timeEl = card.querySelector('.rjm-event-time, .event-time, .time-badge, dd');
          const venueEl = card.querySelector('.rjm-event-venue, .event-venue, .venue-badge');
          const addrEl = card.querySelector('.rjm-event-addr, .event-addr, .address');
          const mapLink = card.querySelector('a[href*="maps"], a.rjm-link, a[href*="google.com/maps"], a.btn-map');

          let eventTitle = evt.name;
          if (isHindi) eventTitle = evt.nameHi || evt.name;
          if (isGujarati) eventTitle = evt.nameGu || evt.name;

          if (nameEl) nameEl.textContent = eventTitle;
          if (dateEl) dateEl.textContent = evt.date;
          if (timeEl) timeEl.textContent = evt.time;
          if (venueEl && evt.venue) venueEl.textContent = evt.venue;
          if (addrEl && venue) addrEl.textContent = venue;

          if (mapLink && evt.mapUrl) {
            mapLink.setAttribute('href', evt.mapUrl);
          }
        }
      });

      // 9. Venue Cards Grid (Where to find us)
      const venueCards = doc.querySelectorAll('.rjm-venue-card, .venue-card, .location-card');
      state.events.forEach((evt, idx) => {
        if (venueCards[idx]) {
          const vcard = venueCards[idx];
          const titleEl = vcard.querySelector('h3, h4, .v-title');
          const nameEl = vcard.querySelector('.rjm-venue-name, .venue-name');
          const addrEl = vcard.querySelector('.rjm-venue-addr, .venue-addr');
          const mapLink = vcard.querySelector('a[href*="maps"], a.rjm-link, a');

          let eventTitle = evt.name;
          if (isHindi) eventTitle = evt.nameHi || evt.name;
          if (isGujarati) eventTitle = evt.nameGu || evt.name;

          if (titleEl) titleEl.textContent = eventTitle;
          if (nameEl && evt.venue) nameEl.textContent = evt.venue;
          if (addrEl && venue) addrEl.textContent = venue;
          if (mapLink && evt.mapUrl) mapLink.setAttribute('href', evt.mapUrl);
        }
      });

      // 10. RSVP Form Event Rows
      const rsvpRows = doc.querySelectorAll('.rjm-rsvp-row, .rsvp-row, .rsvp-event-row');
      state.events.forEach((evt, idx) => {
        if (rsvpRows[idx]) {
          const row = rsvpRows[idx];
          const pEl = row.querySelector('.rjm-rsvp-event, .rsvp-event-title, p');
          let eventTitle = evt.name;
          if (isHindi) eventTitle = evt.nameHi || evt.name;
          if (isGujarati) eventTitle = evt.nameGu || evt.name;
          if (pEl) pEl.textContent = eventTitle;
        }
      });

      // 11. Footer & RSVP Section Contacts & Phone Numbers
      const contactLinks = doc.querySelectorAll('.rjm-foot-contacts a, .foot-contacts a, .contact-links a');
      if (contactLinks.length >= 2) {
        contactLinks[0].textContent = `${rsvp1Name} · ${rsvp1Phone}`;
        contactLinks[0].setAttribute('href', `tel:${rsvp1Phone.replace(/\s+/g, '')}`);
        contactLinks[1].textContent = `${rsvp2Name} · ${rsvp2Phone}`;
        contactLinks[1].setAttribute('href', `tel:${rsvp2Phone.replace(/\s+/g, '')}`);
      }

      // Sync dedicated RSVP contact spans
      doc.querySelectorAll('.data-rsvp1-name').forEach((el) => { el.textContent = rsvp1Name; });
      doc.querySelectorAll('.data-rsvp1-phone').forEach((el) => { el.textContent = rsvp1Phone; });
      doc.querySelectorAll('.data-rsvp1-link').forEach((el) => { el.setAttribute('href', `tel:${rsvp1Phone.replace(/\s+/g, '')}`); });
      doc.querySelectorAll('.data-rsvp2-name').forEach((el) => { el.textContent = rsvp2Name; });
      doc.querySelectorAll('.data-rsvp2-phone').forEach((el) => { el.textContent = rsvp2Phone; });
      doc.querySelectorAll('.data-rsvp2-link').forEach((el) => { el.setAttribute('href', `tel:${rsvp2Phone.replace(/\s+/g, '')}`); });

      // Sync RSVP wishes textarea placeholder with dynamic couple names
      const wishesTextarea = doc.querySelector('textarea[name="wishes"]') as HTMLTextAreaElement;
      if (wishesTextarea) {
        wishesTextarea.placeholder = `Write a heartfelt blessing for ${displayGroom} & ${displayBride}...`;
      }
      doc.querySelectorAll('.data-couple-groom').forEach((el) => { el.textContent = displayGroom; });
      doc.querySelectorAll('.data-couple-bride').forEach((el) => { el.textContent = displayBride; });

      // 11.5 Dynamic RSVP Config Synchronizer (Enabled, Phone, Headcount, Wishes)
      const rsvpConfig = state.rsvpConfig || {
        enabled: true,
        collectPhone: true,
        collectGuestsCount: true,
        collectWishes: true,
      };

      const rsvpSection = doc.querySelector('#rsvp, .rjm-rsvp, .rsvp-section');
      if (rsvpSection) {
        (rsvpSection as HTMLElement).style.display = rsvpConfig.enabled !== false ? '' : 'none';
      }

      doc.querySelectorAll('a[href*="#rsvp"]').forEach((el) => {
        (el as HTMLElement).style.display = rsvpConfig.enabled !== false ? '' : 'none';
      });

      // Phone Field
      doc.querySelectorAll('input[name="guest_phone"]').forEach((input) => {
        const inputEl = input as HTMLInputElement;
        const parent = inputEl.closest('div');
        if (parent) {
          parent.style.display = rsvpConfig.collectPhone !== false ? '' : 'none';
        }
        if (rsvpConfig.collectPhone === false) {
          inputEl.removeAttribute('required');
        } else {
          inputEl.setAttribute('required', 'required');
        }
      });

      // Headcount Field
      doc.querySelectorAll('.rsvp-attendees-group, select[name="attendees_count"]').forEach((el) => {
        const target = (el.classList.contains('rsvp-attendees-group') ? el : el.closest('div')) as HTMLElement;
        if (target) {
          target.style.display = rsvpConfig.collectGuestsCount !== false ? '' : 'none';
        }
      });

      // Wishes Field
      doc.querySelectorAll('textarea[name="wishes"]').forEach((el) => {
        const parent = (el.closest('div') || el) as HTMLElement;
        if (parent) {
          parent.style.display = rsvpConfig.collectWishes !== false ? '' : 'none';
        }
      });

      // 12. Photos & Filters (Hero, Groom, Bride, Story, Moments, Gallery)
      // Cache original default images on all template imgs if not yet cached
      doc.querySelectorAll('img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        if (!imgEl.getAttribute('data-default-src')) {
          imgEl.setAttribute('data-default-src', imgEl.src);
        }
      });

      const getSlotData = (key: string, ...aliases: string[]): { url: string; filter?: PhotoFilterType } | null => {
        if (slots[key]?.url) return slots[key];
        for (const alias of aliases) {
          if (slots[alias]?.url) return slots[alias];
        }
        return null;
      };

      const heroSlot = getSlotData('hero', 'couple_main', 'couple', 'main');
      const groomSlot = getSlotData('groom', 'groom_portrait', 'dulha');
      const brideSlot = getSlotData('bride', 'bride_portrait', 'dulhan');
      const g1Slot = getSlotData('gallery1', 'gallery_1');
      const g2Slot = getSlotData('gallery2', 'gallery_2');
      const g3Slot = getSlotData('gallery3', 'gallery_3');
      const g4Slot = getSlotData('gallery4', 'gallery_4', 'family_photo', 'family');
      const g5Slot = getSlotData('gallery5', 'gallery_5');
      const g6Slot = getSlotData('gallery6', 'gallery_6');

      // Hero Couple Photo
      doc.querySelectorAll('.rjm-couple-img, .jdi-plate-slot img, .jhr-couple-img, .myr-couple-img, .dak-stamp-img, .ivory-hero img, #storyImg3, img[src*="couple.webp"], img[src*="couple.jpg"], img[src*="plate.webp"], .hero-cover img, .data-hero-img, .data-couple-img, img[alt*="Couple"], img[alt*="The Wedding"]').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (heroSlot && heroSlot.url) {
          imgEl.src = heroSlot.url;
          imgEl.style.filter = getFilterStyle(heroSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Groom Solo Photo
      doc.querySelectorAll('.groom-photo img, .groom-card img, .rjm-groom-img, .jhr-groom-img, .myr-groom-img, .dak-groom-img, .ivory-groom img, #storyImg1, img[alt*="Groom"], img[alt*="Dhruv"], img[alt*="Aarav"], img[src*="groom"], .data-groom-img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (groomSlot && groomSlot.url) {
          imgEl.src = groomSlot.url;
          imgEl.style.filter = getFilterStyle(groomSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Bride Solo Photo
      doc.querySelectorAll('.bride-photo img, .bride-card img, .rjm-bride-img, .jhr-bride-img, .myr-bride-img, .dak-bride-img, .ivory-bride img, #storyImg2, img[alt*="Bride"], img[alt*="Shreya"], img[alt*="Anaya"], img[src*="bride"], .data-bride-img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (brideSlot && brideSlot.url) {
          imgEl.src = brideSlot.url;
          imgEl.style.filter = getFilterStyle(brideSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Dynamic 6-Photo Royal Moments Gallery (1-to-1 Exact Slot Mapping)
      const gallerySlots = [g1Slot, g2Slot, g3Slot, g4Slot, g5Slot, g6Slot];
      const galleryImgs = doc.querySelectorAll('#gallery figure img, .rjm-gallery-grid figure img, .jhr-gallery-grid figure img, .myr-gallery-grid figure img, .jdi-gallery-grid figure img, #album figure img, .dak-gallery-grid figure img, #looks figure img, .ivory-gallery-grid figure img, #storyImg1, #storyImg2, #storyImg3, .rjm-photo-zoom img, .moments-grid img, .gallery-item img, #gallery img, .gallery-grid img, #galleryGrid img, .gallery-slot img');

      galleryImgs.forEach((img, idx) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        const assignedSlot = gallerySlots[idx];

        if (assignedSlot && assignedSlot.url) {
          imgEl.src = assignedSlot.url;
          imgEl.style.filter = getFilterStyle(assignedSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Audio Sync
      if (state.media.audioUrl) {
        doc.querySelectorAll('audio, #wedding-audio').forEach((aud) => {
          (aud as HTMLAudioElement).src = state.media.audioUrl!;
        });
      }

      // 🧹 13. RECURSIVE DOM DEEP-SWEEPER (Scans all paragraphs, spans, FAQs, quotes to wipe 100% demo residue)
      if (doc.body) {
        sweepDemoTextNodes(doc.body, [
          [/\+91\s*98251\s*45678/g, rsvp1Phone],
          [/\+91\s*98982\s*34567/g, rsvp2Phone],
          [/Nalinkumar/g, rsvp1Name],
          [/Family Helpdesk/g, rsvp2Name],
          [/Aarav/g, displayGroom],
          [/Anaya/g, displayBride],
          [/Taj Lake Palace/gi, venue],
          [/Udaipur, Rajasthan/gi, venue],
          [/Mr\.\s*Nalinkumar\s*&\s*Mrs\.\s*Kalpuben/gi, displayGroomParents],
          [/श्री\s*नलिनकुमार\s*एवं\s*श्रीमती\s*कल्पूबेन/g, displayGroomParents],
          [/Mr\.\s*&\s*Mrs\.\s*Sharma/gi, displayBrideParents],
          [/श्री\s*एवं\s*श्रीमती\s*शर्मा/g, displayBrideParents],
        ]);
      }

      // 14. 📡 Broadcast postMessage directly to template window
      const themeInfo = themes.find((t) => t.id === state.theme);
      const templateName = themeInfo?.name || 'Royal Vivah Celebration';
      const enrichedState = {
        ...state,
        templateName,
        themeTitle: templateName,
      };

      if (win && typeof win.postMessage === 'function') {
        win.postMessage({ type: 'UPDATE_STATE', state: enrichedState }, '*');
        win.postMessage({ type: 'WEDDING_DATA', data: enrichedState }, '*');
        if (typeof win.applyWeddingData === 'function') {
          win.applyWeddingData(enrichedState);
        }
      }

      // Start Countdown for Current Active Template
      startUniversalCountdown();

      // 🛡️ Inject Security Shield into Iframe (Blocks F12, Right-Click, Inspect inside preview)
      injectIframeSecurityLock();
    } catch (err) {}
  };

  const injectIframeSecurityLock = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
      const iframeDoc = iframe.contentDocument;
      const iframeWin = iframe.contentWindow;

      const blockContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      iframeDoc.addEventListener('contextmenu', blockContextMenu, true);
      iframeWin.addEventListener('contextmenu', blockContextMenu, true);

      const blockKeydown = (e: KeyboardEvent) => {
        // Block F12
        if (e.keyCode === 123 || e.key === 'F12') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+U, Ctrl+S, Ctrl+P
        if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+Shift+I, J, C (Inspect Element & Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          const k = e.key.toUpperCase();
          if (k === 'I' || k === 'J' || k === 'C') {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      };
      iframeDoc.addEventListener('keydown', blockKeydown, true);
      iframeWin.addEventListener('keydown', blockKeydown, true);

      const blockSelection = (e: Event) => {
        e.preventDefault();
        return false;
      };
      iframeDoc.addEventListener('selectstart', blockSelection, true);
      iframeDoc.addEventListener('dragstart', blockSelection, true);

      if (iframeDoc.head && !iframeDoc.getElementById('shahi-security-lock')) {
        const style = iframeDoc.createElement('style');
        style.id = 'shahi-security-lock';
        style.textContent = `
          * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
          }
          @media print {
            body { display: none !important; }
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (err) {}
  };

  useEffect(() => {
    setIsSyncing(true);
    performMasterSync();
    const timer = setTimeout(() => {
      performMasterSync();
      setIsSyncing(false);
    }, 150);
    return () => {
      clearTimeout(timer);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [state, refreshKey]);

  const handleIframeLoad = () => {
    setIsSyncing(true);
    performMasterSync();
    injectIframeSecurityLock();
    setTimeout(performMasterSync, 100);
    setTimeout(performMasterSync, 450);
    setTimeout(() => {
      performMasterSync();
      setIsSyncing(false);
    }, 1000);
  };

  const zoomScale = state.previewZoom || 1;
  const domainUrl = `https://${(state.couple.groomEn || 'dhruv').toLowerCase()}-${(state.couple.brideEn || 'shreya').toLowerCase()}.wedding.app`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-2 sm:p-6 select-none font-manrope">
      {/* 🟢 Live Synchronization Status Badge */}
      <div className="absolute top-4 left-6 z-40 bg-[#FFFDF8]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E8D5AD] shadow-md flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-[#167A5A]'}`} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#430914]">
          {isSyncing ? 'UPDATING PREVIEW…' : 'LIVE PREVIEW'}
        </span>
      </div>

      {/* Hidden Audio Player for Preview Audio Playback */}
      {audioUrl && (
        <audio
          ref={internalAudioRef}
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          className="hidden"
        />
      )}

      {/* Floating Quick Music Control Bar */}
      {audioUrl && (
        <div className="absolute top-4 right-6 z-40 bg-[#FFFDF8]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E8D5AD] shadow-md flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAudio}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E1020] hover:text-[#430914] transition-colors cursor-pointer"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#C49A35] fill-[#C49A35] animate-pulse" />
                <span>Pause Music</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#C49A35] fill-[#C49A35]" />
                <span>Play Audio</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 💻 Triple Device Hardware Mockup Frames */}

      {/* 1. DESKTOP VIEW: MacBook Pro 16" Space Black */}
      {state.viewMode === 'desktop' && (
        <div
          className="w-[1020px] max-w-full h-[640px] bg-[#141414] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.45)] border-[8px] border-[#2B2B2B] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
        >
          {/* macOS Titlebar */}
          <div className="h-9 bg-[#1E1E1E] border-b border-[#333] flex items-center px-4 justify-between select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-sm"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-sm"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-sm"></span>
            </div>
            {/* Safari Search/URL Pill */}
            <div className="bg-[#121212] px-4 py-1 rounded-md text-[11px] font-mono text-white/70 border border-white/10 flex items-center gap-2 max-w-sm truncate shadow-inner">
              <Lock className="w-3 h-3 text-[#27C93F]" />
              <span className="truncate">{domainUrl}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <RotateCw className="w-3.5 h-3.5" />
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="flex-1 bg-white overflow-hidden relative">
            <iframe
              ref={iframeRef}
              src={targetUrl}
              title="Desktop Wedding Invitation Preview"
              className="w-full h-full border-none block"
              onLoad={handleIframeLoad}
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        </div>
      )}

      {/* 2. TABLET VIEW: Apple iPad Air Frame */}
      {state.viewMode === 'tablet' && (
        <div
          className="w-[768px] max-w-full h-[620px] bg-[#1A1A1A] rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.45)] border-[12px] border-[#2E2E2E] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10 relative"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
        >
          {/* Tablet Front Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0A0A0A] border border-white/10 z-30"></div>

          {/* Iframe Viewport */}
          <div className="flex-1 bg-white overflow-hidden relative rounded-[24px]">
            <iframe
              ref={iframeRef}
              src={targetUrl}
              title="Tablet Wedding Invitation Preview"
              className="w-full h-full border-none block"
              onLoad={handleIframeLoad}
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        </div>
      )}

      {/* 3. MOBILE VIEW: Apple iPhone 17 Pro Natural Titanium Frame (Fits 100% in Viewport) */}
      {state.viewMode === 'mobile' && (
        <div
          className="relative h-[680px] w-[326px] max-h-[calc(100vh-100px)] p-[3px] bg-[#3E3D40] rounded-[48px] shadow-[0_20px_70px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col transition-all duration-300 shrink-0 my-auto"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
        >
          {/* 🔘 Slim Titanium Side Buttons (Flush, accurate edge placement) */}
          <div className="absolute -left-[4px] top-[90px] w-[2px] h-[14px] bg-[#5C5B5E] rounded-l-[1px]" title="Action Button"></div>
          <div className="absolute -left-[4px] top-[116px] w-[2px] h-[30px] bg-[#5C5B5E] rounded-l-[1px]" title="Volume Up"></div>
          <div className="absolute -left-[4px] top-[154px] w-[2px] h-[30px] bg-[#5C5B5E] rounded-l-[1px]" title="Volume Down"></div>
          <div className="absolute -right-[4px] top-[124px] w-[2px] h-[46px] bg-[#5C5B5E] rounded-r-[1px]" title="Power Button"></div>

          {/* Ultra-thin Uniform Screen Bezel (2.5px) */}
          <div className="w-full h-full p-[2px] bg-[#0E0E10] rounded-[45px] flex flex-col overflow-hidden">
            {/* Screen Inner (True Squircle Curve) */}
            <div className="w-full h-full bg-black rounded-[43px] flex flex-col overflow-hidden relative">
              
              {/* 🏝️ Top Status Bar & Single Clean Dynamic Island Pill */}
              <div className="h-9 bg-black text-white px-5 pt-0.5 flex items-center justify-between select-none shrink-0 z-30 text-xs font-semibold relative">
                {/* Live Clock (Left Safe Zone) */}
                <span className="text-[11px] font-sans font-semibold tracking-tight text-white/95 pl-1">
                  {currentTimeStr}
                </span>

                {/* iPhone 17 Pro Dynamic Island: ONE Solid Single Pill */}
                <div 
                  className="w-[84px] h-[20px] bg-black rounded-full border border-white/5 shadow-inner"
                  title="Dynamic Island"
                ></div>

                {/* Signal, 5G & Battery (Right Safe Zone) */}
                <div className="flex items-center gap-1 text-white/90 pr-1">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[9px] font-mono font-bold">5G</span>
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Invitation Iframe Viewport */}
              <div className="flex-1 bg-white overflow-hidden relative">
                <iframe
                  ref={iframeRef}
                  src={targetUrl}
                  title="iPhone 17 Pro Mobile Wedding Invitation Preview"
                  className="w-full h-full border-none block"
                  onLoad={handleIframeLoad}
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>

              {/* iOS Floating Home Indicator Gesture Bar */}
              <div className="h-4 bg-black flex items-center justify-center select-none shrink-0 z-30 pb-0.5">
                <div className="w-24 h-[3.5px] bg-white/70 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
