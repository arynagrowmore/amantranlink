import React, { useEffect, useRef, useState } from 'react';
import { WeddingProjectState, ThemeId } from '../types/wedding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveInvitationState } from '../utils/invitationStorage';
import { normalizeInvitationData, applyInvitationDataToTemplateDOM } from '../utils/invitationAdapter';
import { fetchGuestByToken } from '../services/guestService';
import { GuestRecord } from '../types/guest';
import { RoyalCrestIcon } from './ShahiIcons';
import { PersonalizedGuestBanner } from './Guest/PersonalizedGuestBanner';
import { AdvancedRsvpModal } from './Guest/AdvancedRsvpModal';

interface StandaloneInvitationViewProps {
  initialState?: WeddingProjectState;
  slug?: string;
}

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
  const [loadedState, setLoadedState] = useState<WeddingProjectState | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [studioBadge, setStudioBadge] = useState<string | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<string>('dhruv-shreya');
  const [themeId, setThemeId] = useState<ThemeId>('rajmahal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const countdownIntervalRef = useRef<any>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // 👑 Personalized Guest & Audio State
  const [guest, setGuest] = useState<GuestRecord | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);

  // 📥 1. Resolve & Fetch Published Wedding Site & Guest from Supabase / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const targetSlug = (propSlug || extractPublicSlugFromUrl() || '')
      .replace(/^\/i\//, '')
      .replace(/^i\//, '')
      .trim()
      .toLowerCase();

    setResolvedSlug(targetSlug);

    const loadSiteAndGuest = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      if (!targetSlug && !initialState) {
        if (isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
        }
        return;
      }

      // Look for Guest Token in URL: ?guest=token or ?g=token
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const guestToken = searchParams?.get('guest') || searchParams?.get('g');
      if (guestToken && targetSlug) {
        try {
          const guestRecord = await fetchGuestByToken(guestToken, targetSlug);
          if (guestRecord && isMounted) {
            setGuest(guestRecord);
          }
        } catch (e) {}
      }

      // Attempt 1: Fetch from Supabase (Source of Truth)
      if (isSupabaseConfigured && targetSlug) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSlug);
          let query = supabase
            .from('wedding_sites')
            .select('id, template_id, status, content, published_url, studio_badge, templates(slug)')
            .order('updated_at', { ascending: false });

          if (isUuid) {
            query = query.or(`id.eq.${targetSlug},published_url.ilike.%${targetSlug}%`);
          } else {
            query = query.ilike('published_url', `%${targetSlug}%`);
          }

          const { data: site, error } = await query.limit(1).maybeSingle();

          if (!error && site && site.content && isMounted) {
            const rawTpl: any = site.templates;
            const tplSlug = Array.isArray(rawTpl) ? rawTpl[0]?.slug : rawTpl?.slug;
            const fetchedTheme = (tplSlug || (site.content as any)?.theme || site.template_id || 'rajmahal') as ThemeId;
            setThemeId(fetchedTheme);
            setLoadedState(site.content as WeddingProjectState);
            setSiteId(site.id);
            if (site.studio_badge) {
              setStudioBadge(site.studio_badge);
            } else {
              const qStudio = searchParams?.get('studio') || searchParams?.get('partner');
              if (qStudio) setStudioBadge(decodeURIComponent(qStudio));
            }
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase site fetch note:', e);
        }
      }

      // Attempt 2: Local storage resolution (offline / instant preview cache)
      if (targetSlug) {
        const localResolved = resolveInvitationState(targetSlug);
        if (localResolved && isMounted) {
          setThemeId(localResolved.theme || 'rajmahal');
          setLoadedState(localResolved);
          setIsLoading(false);
          return;
        }
      }

      // Attempt 3: If initialState provided from editor live preview, use it
      if (initialState && isMounted) {
        setThemeId(initialState.theme || 'rajmahal');
        setLoadedState(initialState);
        setIsLoading(false);
        return;
      }

      // If no valid data found for the requested slug, render 404 Royal Not Found screen
      if (isMounted) {
        setIsNotFound(true);
        setIsLoading(false);
      }
    };

    loadSiteAndGuest();

    return () => {
      isMounted = false;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [propSlug, initialState]);

  const rawState: WeddingProjectState = loadedState || initialState || {
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
      weddingDate: '10 December 2026 · 06:30 PM',
      muhuratTime: '06:30 PM',
      venueName: 'The Milestone, Himmatnagar, Gujarat',
      venueAddress: 'The Milestone Highway, Himmatnagar',
      mapUrl: 'https://maps.google.com',
    },
    events: [
      { id: '1', name: '💛 Haldi Ceremony', nameHi: 'हल्दी', nameGu: 'પીઠી / હળદર', date: '9 December 2026', time: '10:00 AM', venue: 'The Milestone Garden', color: 'yellow', icon: '💛', dressCode: 'Traditional Yellow Kurta / Saree', mapUrl: 'https://maps.google.com' },
      { id: '2', name: '💚 Mehendi Rasam', nameHi: 'मेहंदी', nameGu: 'મહેંદી રસમ', date: '9 December 2026', time: '03:00 PM', venue: 'The Milestone Courtyard', color: 'green', icon: '💚', dressCode: 'Pastel Floral / Ethnic', mapUrl: 'https://maps.google.com' },
      { id: '3', name: '🎶 Sangeet Night', nameHi: 'संगीत', nameGu: 'સંગીત સંધ્યા', date: '9 December 2026', time: '07:30 PM', venue: 'Royal Darbar Banquet', color: 'purple', icon: '🎶', dressCode: 'Indo-Western Bollywood Glam', mapUrl: 'https://maps.google.com' },
      { id: '4', name: '💍 Shubh Vivah / Pheras', nameHi: 'शुभ विवाह', nameGu: 'શુભ લગ્ન / ફેરા', date: '10 December 2026', time: '06:30 PM Muhurat', venue: 'The Milestone Palace Ground', color: 'gold', icon: '💍', dressCode: 'Royal Shahi Traditional', mapUrl: 'https://maps.google.com' },
      { id: '5', name: '🥂 Grand Reception', nameHi: 'रिसेप्शन', nameGu: 'સ્નેહમિલન / રિસેપ્શન', date: '11 December 2026', time: '08:00 PM', venue: 'The Milestone Grand Ballroom', color: 'red', icon: '🥂', dressCode: 'Black-Tie / Velvet Elegance', mapUrl: 'https://maps.google.com' },
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

  // Convert raw state into Authoritative Normalized Invitation Model
  const normalizedData = normalizeInvitationData(rawState, resolvedSlug, siteId || undefined, studioBadge || undefined);
  const activeTheme = rawState.theme || themeId || 'rajmahal';
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

    const targetMs = normalizedData.wedding.targetTimestampMs;
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

  // ⚡ Master Universal Sync for Standalone Guest Mode
  const performMasterSync = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as any;

      applyInvitationDataToTemplateDOM(doc, win, normalizedData);

      // If personalized guest exists, inject greeting into template
      if (guest) {
        const greetingName = guest.family_name ? `${guest.full_name} & ${guest.family_name}` : guest.full_name;
        doc.querySelectorAll('.guest-personal-greeting, .guest-name-badge').forEach((el) => {
          el.textContent = `Auspicious Invitation for ${greetingName}`;
        });
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
      if (event.data?.type === 'OPEN_RSVP_MODAL') {
        setIsRsvpModalOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [normalizedData, resolvedSlug, siteId, guest]);

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
          This digital wedding invitation link could not be located. Please verify the URL or contact the couple.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs uppercase tracking-wider border border-[#C49A35] shadow-lg transition-all"
        >
          Return to AmantranLink Homepage
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1A0B0E] flex items-center justify-center z-50 select-none">
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A0B0E] text-[#FDF6EB] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6E1020] border-2 border-[#C08F3F] flex items-center justify-center text-[#C08F3F] animate-pulse shadow-2xl">
            <RoyalCrestIcon className="w-8 h-8" />
          </div>
          <div className="text-xs font-serif text-[#C08F3F] font-semibold tracking-widest uppercase">
            ॥ श्री गणेशाय नमः ॥
          </div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#FFFDF8] uppercase">
            ✦ PREPARING YOUR ROYAL INVITATION ✦
          </div>
          <p className="text-xs text-[#E8CFA8]/80 font-serif italic">
            Opening palace gates and tuning Shehnai blessings...
          </p>
        </div>
      ) : (
        <div className="w-full h-full relative flex flex-col overflow-hidden bg-[#FDF6EB]">
          {/* 👑 Floating Personalized Guest Banner (if opened via ?guest=token) */}
          {guest && (
            <PersonalizedGuestBanner
              guest={guest}
              onOpenRsvp={() => setIsRsvpModalOpen(true)}
            />
          )}

          <iframe
            ref={iframeRef}
            src={templateUrl}
            title={`${normalizedData.groom.name} & ${normalizedData.bride.name} Royal Wedding Invitation`}
            className="w-full h-full border-0 block bg-[#FDF6EB]"
            allow="autoplay; clipboard-write"
            onLoad={() => {
              performMasterSync();
              setTimeout(performMasterSync, 300);
              setTimeout(performMasterSync, 1000);
            }}
          />

          {/* 🎵 Floating Ceremonial Shehnai Audio Pill */}
          {rawState?.media?.audioUrl && (
            <div className="absolute bottom-4 left-4 z-30 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  if (internalAudioRef.current) {
                    if (isPlayingAudio) {
                      internalAudioRef.current.pause();
                      setIsPlayingAudio(false);
                    } else {
                      internalAudioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
                    }
                  }
                }}
                className="bg-[#25160A]/90 hover:bg-[#3E2612] backdrop-blur-md px-4 py-2 rounded-full border border-[#C08F3F]/60 text-[#FDF6EB] hover:text-[#FFFDF8] text-xs font-serif tracking-wide shadow-xl flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105"
                title="Toggle Ceremonial Shehnai Music"
              >
                {isPlayingAudio ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Shehnai Playing 🎵</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#C08F3F]" />
                    <span>Play Shehnai 🎶</span>
                  </>
                )}
              </button>
              <audio
                ref={internalAudioRef}
                src={rawState.media.audioUrl}
                loop
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          )}

          {/* 👑 Subtle Luxury Partner Studio Badge */}
          {studioBadge && (
            <div className="absolute bottom-4 right-4 z-30 bg-[#25160A]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C08F3F]/40 text-[11px] text-[#E8CFA8] font-serif shadow-lg flex items-center gap-1.5 pointer-events-none animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C08F3F] animate-pulse" />
              <span>Partner Studio: <strong className="text-[#FFFDF8] font-semibold">{studioBadge}</strong></span>
            </div>
          )}

          {/* 🌸 Advanced Royal RSVP Modal */}
          <AdvancedRsvpModal
            isOpen={isRsvpModalOpen}
            onClose={() => setIsRsvpModalOpen(false)}
            state={rawState}
            guest={guest}
            weddingSiteId={siteId || undefined}
            weddingSlug={resolvedSlug}
            onSuccess={() => {
              // Refresh guest state if submitted
              if (guest?.personal_invitation_token) {
                fetchGuestByToken(guest.personal_invitation_token).then(g => {
                  if (g) setGuest(g);
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StandaloneInvitationView;
