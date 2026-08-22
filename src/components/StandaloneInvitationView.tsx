import React, { useEffect, useRef, useState } from 'react';
import { WeddingProjectState, PhotoFilterType, ThemeId } from '../types/wedding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveInvitationState } from '../utils/invitationStorage';
import { RoyalCrestIcon } from './ShahiIcons';
import { themes } from './ThemeSelector';

interface StandaloneInvitationViewProps {
  initialState?: WeddingProjectState;
  slug?: string;
}

const getFilterStyle = (filter?: PhotoFilterType): string => {
  if (!filter || filter === 'none') return 'none';
  if (filter === 'gold-glow') return 'sepia(35%) saturate(140%) brightness(105%) contrast(105%)';
  if (filter === 'vintage') return 'sepia(60%) contrast(110%) brightness(95%) saturate(90%)';
  if (filter === 'rose-blush') return 'saturate(120%) brightness(105%) hue-rotate(-10deg) contrast(102%)';
  if (filter === 'monochrome') return 'grayscale(100%) contrast(120%) brightness(100%)';
  return 'none';
};

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

// 🧹 Recursive Universal DOM Text Node Sweeper
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

export const extractPublicSlugFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;

  // 1. Path format: /i/:slug, /invite/:slug, /wedding/:slug
  const iMatch = pathname.match(/^\/(?:i|invite|wedding)\/([^/?#]+)/i);
  if (iMatch && iMatch[1]) {
    return decodeURIComponent(iMatch[1]).trim().toLowerCase();
  }

  // 2. Query param: ?invite=... or ?slug=...
  const params = new URLSearchParams(window.location.search);
  const qSlug = params.get('invite') || params.get('slug') || params.get('i');
  if (qSlug) {
    return decodeURIComponent(qSlug).trim().toLowerCase();
  }

  // 3. Hash format: #/i/:slug or #invite-:slug
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash.startsWith('i/') || hash.startsWith('invite/')) {
    const parts = hash.split('/');
    if (parts[1]) return parts[1].trim();
  }
  if (hash.startsWith('invite-')) {
    return hash.replace('invite-', '').trim();
  }

  return null;
};

export const StandaloneInvitationView: React.FC<StandaloneInvitationViewProps> = ({ 
  initialState,
  slug: propSlug 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadedState, setLoadedState] = useState<WeddingProjectState | null>(initialState || null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<string>('dhruv-shreya');
  const [themeId, setThemeId] = useState<ThemeId>('rajmahal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const countdownIntervalRef = useRef<any>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // 📥 1. Resolve & Fetch Published Wedding Site from Supabase / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const targetSlug = propSlug || extractPublicSlugFromUrl() || 'dhruv-shreya';
    setResolvedSlug(targetSlug);

    const loadSite = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      // Attempt 1: Fetch from Supabase (Source of Truth for Published Snapshots)
      if (isSupabaseConfigured) {
        try {
          const { data: site, error } = await supabase
            .from('wedding_sites')
            .select('*, templates(slug)')
            .or(`slug.eq.${targetSlug},id.eq.${targetSlug},published_url.ilike.%${targetSlug}%`)
            .eq('status', 'published')
            .maybeSingle();

          if (!error && site && site.content && isMounted) {
            const fetchedTheme = (site.templates?.slug || site.content?.theme || 'rajmahal') as ThemeId;
            setThemeId(fetchedTheme);
            setLoadedState(site.content as WeddingProjectState);
            setSiteId(site.id);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase site fetch note:', e);
        }
      }

      // Attempt 2: Local storage resolution (offline / instant preview cache)
      const localResolved = resolveInvitationState(targetSlug, initialState);
      if (localResolved && isMounted) {
        setThemeId(localResolved.theme || 'rajmahal');
        setLoadedState(localResolved);
        setIsLoading(false);
        return;
      }

      // If propSlug was explicit and not found, mark as not found
      if (propSlug && !localResolved && isMounted) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      // Fallback default for demo/preview
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadSite();

    return () => {
      isMounted = false;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [propSlug, initialState]);

  const state: WeddingProjectState = loadedState || initialState || {
    theme: themeId,
    viewMode: 'desktop',
    previewZoom: 1,
    language: 'en',
    couple: {
      groomEn: 'Dhruv',
      groomHi: 'ध्रुव',
      groomGu: 'ધ્રુવ',
      brideEn: 'Shreya',
      brideHi: 'श्रेया',
      brideGu: 'શ્રેયા',
      mark: 'D · S',
      hashtag: '#DhruvKiShreya',
      weddingDate: '3 December 2026 · 06:30 PM',
      muhuratTime: '06:30 PM',
      venueName: 'The Milestone, Himmatnagar, Gujarat',
      venueAddress: 'The Milestone Highway, Himmatnagar',
      mapUrl: 'https://maps.google.com',
    },
    events: [
      { id: '1', name: '💛 Haldi Ceremony', nameHi: 'हल्दी', nameGu: 'પીઠી / હળદર', date: '1 December 2026', time: '10:00 AM', venue: 'The Milestone Garden', color: 'yellow', icon: '💛', dressCode: 'Traditional Yellow Kurta / Saree', mapUrl: 'https://maps.google.com' },
      { id: '2', name: '💚 Mehendi Rasam', nameHi: 'मेहंदी', nameGu: 'મહેંદી રસમ', date: '2 December 2026', time: '03:00 PM', venue: 'The Milestone Courtyard', color: 'green', icon: '💚', dressCode: 'Pastel Floral / Ethnic', mapUrl: 'https://maps.google.com' },
      { id: '3', name: '🎶 Sangeet Night', nameHi: 'संगीत', nameGu: 'સંગીત સંધ્યા', date: '2 December 2026', time: '07:30 PM', venue: 'Royal Darbar Banquet', color: 'purple', icon: '🎶', dressCode: 'Indo-Western Bollywood Glam', mapUrl: 'https://maps.google.com' },
      { id: '4', name: '💍 Shubh Vivah / Pheras', nameHi: 'शुभ विवाह', nameGu: 'શુભ લગ્ન / ફેરા', date: '3 December 2026', time: '06:30 PM Muhurat', venue: 'The Milestone Palace Ground', color: 'gold', icon: '💍', dressCode: 'Royal Shahi Traditional', mapUrl: 'https://maps.google.com' },
      { id: '5', name: '🥂 Grand Reception', nameHi: 'रिसेप्शन', nameGu: 'સ્નેહમિલન / રિસેપ્શન', date: '4 December 2026', time: '08:00 PM', venue: 'The Milestone Grand Ballroom', color: 'red', icon: '🥂', dressCode: 'Black-Tie / Velvet Elegance', mapUrl: 'https://maps.google.com' },
    ],
    family: {
      groomParentsEn: 'Mr. Nalinkumar & Mrs. Kalpuben',
      groomParentsHi: 'श्री नलिनकुमार एवं श्रीमती कल्पूबेन',
      groomParentsGu: 'શ્રી નલિનકુમાર અને શ્રીમતી કલ્પૂબેન',
      brideParentsEn: 'Mr. & Mrs. Sharma',
      brideParentsHi: 'श्री एवं श्रीमती शर्मा',
      brideParentsGu: 'શ્રી અને શ્રીમતી શર્મા',
      rsvp1Name: 'Nalinkumar',
      rsvp1Phone: '+91 9409360336',
      rsvp2Name: 'Family Helpdesk',
      rsvp2Phone: '+91 9409360336',
    },
    media: {
      audioName: 'FinalSong.mp3 (Default)',
      audioBlob: null,
      photoSlots: {},
    },
  };

  const activeTheme = state.theme || themeId || 'rajmahal';
  const templateUrl = `/templates/${activeTheme}-template/index.html`;

  // ⏰ Universal Live Countdown Timer
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

        const allCountNums = doc.querySelectorAll('.rjm-count-num, .jdi-count-num, .jdi-countnum, .jhr-count-num, .myr-count-num, .dak-count-num, .dak-countnum, .count-num, .time-num, .countdown-num, .tabular-nums');
        if (allCountNums.length >= 4) {
          allCountNums[0].textContent = dStr;
          allCountNums[1].textContent = hStr;
          allCountNums[2].textContent = mStr;
          allCountNums[3].textContent = sStr;
        }
      } catch (e) {}
    };

    updateCountdownDOM();
    const intervalId = win.setInterval(updateCountdownDOM, 1000);
    win.__shahiCountdownRunning = intervalId;
    countdownIntervalRef.current = intervalId;
  };

  // ⚡ Master Sync for Standalone Guest Mode
  const performMasterSync = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as any;

      win.LIVE_WEDDING_SLUG = resolvedSlug;
      win.LIVE_WEDDING_SITE_ID = siteId;
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
      const rsvp1Phone = state.family.rsvp1Phone || '+91 9409360336';
      const rsvp2Name = state.family.rsvp2Name || 'Family Helpdesk';
      const rsvp2Phone = state.family.rsvp2Phone || '+91 9409360336';
      const slots = state.media.photoSlots || {};

      // 1. Update Window Config
      const targetMs = parseTargetWeddingMs(date);
      win.LIVE_TARGET_DATE_MS = targetMs;
      if (win.WEDDING_CONFIG) {
        win.WEDDING_CONFIG.groomName = displayGroom;
        win.WEDDING_CONFIG.brideName = displayBride;
        win.WEDDING_CONFIG.weddingDate = date;
        win.WEDDING_CONFIG.venue = venue;
      }

      // 2. Text node replacements
      const replacements: [RegExp, string][] = [
        [/Aryan/gi, displayGroom],
        [/Aanya/gi, displayBride],
        [/Dhruv/gi, displayGroom],
        [/Shreya/gi, displayBride],
        [/ध्रुव/gi, displayGroom],
        [/श्रेया/gi, displayBride],
        [/ધ્રુવ/gi, displayGroom],
        [/શ્રેયા/gi, displayBride],
        [/The Grand Haveli/gi, venue],
        [/The Milestone/gi, venue],
        [/December 12, 2025/gi, date],
        [/3 December 2026/gi, date],
      ];
      sweepDemoTextNodes(doc.body, replacements);

      // 3. Couple Elements & Monograms
      doc.querySelectorAll('.groom-name, #groom-name, [data-bind="groom"]').forEach((el) => { el.textContent = displayGroom; });
      doc.querySelectorAll('.bride-name, #bride-name, [data-bind="bride"]').forEach((el) => { el.textContent = displayBride; });
      doc.querySelectorAll('.couple-names, #couple-names, [data-bind="couple"]').forEach((el) => { el.textContent = `${displayGroom} ${amp} ${displayBride}`; });
      doc.querySelectorAll('.data-couple-groom').forEach((el) => { el.textContent = displayGroom; });
      doc.querySelectorAll('.data-couple-bride').forEach((el) => { el.textContent = displayBride; });

      // Monogram & Hashtags
      doc.querySelectorAll('.rjm-nav-mark, .nav-mark, .monogram, [data-bind="mark"]').forEach((el) => { el.textContent = mark; });
      doc.querySelectorAll('.rjm-foot-tag, .wedding-tag, .hashtag, [data-bind="hashtag"]').forEach((el) => { el.textContent = hashtag; });

      // 4. Dates & Venue
      doc.querySelectorAll('.wedding-date, #wedding-date, [data-bind="date"]').forEach((el) => { el.textContent = date; });
      doc.querySelectorAll('.venue-name, #venue-name, [data-bind="venue"]').forEach((el) => { el.textContent = venue; });

      // 5. RSVP Helpline Contacts
      doc.querySelectorAll('.data-rsvp1-name').forEach((el) => { el.textContent = rsvp1Name; });
      doc.querySelectorAll('.data-rsvp1-phone').forEach((el) => { el.textContent = rsvp1Phone; });
      doc.querySelectorAll('.data-rsvp1-link').forEach((el) => { el.setAttribute('href', `tel:${rsvp1Phone.replace(/\s+/g, '')}`); });
      doc.querySelectorAll('.data-rsvp2-name').forEach((el) => { el.textContent = rsvp2Name; });
      doc.querySelectorAll('.data-rsvp2-phone').forEach((el) => { el.textContent = rsvp2Phone; });
      doc.querySelectorAll('.data-rsvp2-link').forEach((el) => { el.setAttribute('href', `tel:${rsvp2Phone.replace(/\s+/g, '')}`); });

      const wishesTextarea = doc.querySelector('textarea[name="wishes"]') as HTMLTextAreaElement;
      if (wishesTextarea) {
        wishesTextarea.placeholder = `Write a heartfelt blessing for ${displayGroom} & ${displayBride}…`;
      }

      // 5.5 Dynamic RSVP Config Synchronizer (Enabled, Phone, Headcount, Wishes)
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

      // 6. Photos Injection
      if (slots.hero?.url) {
        doc.querySelectorAll('img.hero-photo, #hero-photo, .main-couple-img, .hero-img, .rjm-couple-img').forEach((img: any) => {
          img.src = slots.hero.url;
          img.style.filter = getFilterStyle(slots.hero.filter);
        });
      }

      // 7. Custom Audio Setup
      const audioUrl = state.media.audioUrl || (state.media.audioBlob ? URL.createObjectURL(state.media.audioBlob) : '/templates/rajmahal-template/FinalSong.mp3');
      if (audioUrl) {
        const bgAudio = doc.querySelector('audio#bg-music, audio#wedding-audio, audio.bg-music, audio') as HTMLAudioElement;
        if (bgAudio) {
          bgAudio.src = audioUrl;
        }
      }

      // 8. Dynamic Template Name & Real-time Studio Data Applier
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
      }
      if (typeof win.applyWeddingData === 'function') {
        win.applyWeddingData(enrichedState);
      }

      startUniversalCountdown();

    } catch (e) {
      console.warn('Master sync warning:', e);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TEMPLATE_READY' || event.data?.type === 'REQUEST_INITIAL_STATE') {
        performMasterSync();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state, resolvedSlug, siteId]);

  // Luxury Error Screen for Invalid/Unpublished Invitation
  if (isNotFound) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#140306] text-[#F7F0DD] flex flex-col items-center justify-center p-6 text-center z-50">
        <div className="w-16 h-16 rounded-2xl bg-[#6E1020] border-2 border-[#C49A35] flex items-center justify-center text-[#C49A35] shadow-2xl mb-4">
          <RoyalCrestIcon className="w-9 h-9" />
        </div>
        <span className="text-xs font-serif text-[#C49A35] font-semibold tracking-widest uppercase mb-1">
          ॥ श्री गणेशाय नमः ॥
        </span>
        <h2 className="font-cormorant font-bold text-3xl sm:text-4xl text-[#FFFDF8] mb-3">
          Royal Invitation Not Found
        </h2>
        <p className="text-sm text-[#E8D5AD]/80 max-w-md mx-auto mb-6 font-manrope leading-relaxed">
          This auspicious digital wedding invitation link could not be located or has not yet been published by the couple.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs uppercase tracking-wider border border-[#C49A35] shadow-lg transition-all"
        >
          Return to Shahi Studio Homepage
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#120306] flex items-center justify-center z-50">
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#140306] text-[#F7F0DF] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6E1020] border-2 border-[#C49A35] flex items-center justify-center text-[#C49A35] animate-pulse shadow-2xl">
            <RoyalCrestIcon className="w-8 h-8" />
          </div>
          <div className="text-xs font-serif text-[#C49A35] font-semibold tracking-widest uppercase">
            ॥ श्री गणेशाय नमः ॥
          </div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#FFFDF8] uppercase">
            ✦ PREPARING YOUR ROYAL KANKOTRI ✦
          </div>
          <p className="text-xs text-[#E8D5AD]/70 font-serif italic">
            Opening palace gates and tuning Shehnai blessings...
          </p>
        </div>
      ) : (
        <div className="w-full h-full max-w-[100vw] sm:max-w-[768px] md:max-w-[900px] lg:max-w-[1080px] xl:max-w-[1200px] h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            src={templateUrl}
            title={`${state.couple.groomEn} & ${state.couple.brideEn} Royal Wedding Kankotri`}
            className="w-full h-full border-0 block"
            allow="autoplay; clipboard-write"
            onLoad={() => {
              performMasterSync();
              setTimeout(performMasterSync, 300);
              setTimeout(performMasterSync, 1000);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StandaloneInvitationView;
