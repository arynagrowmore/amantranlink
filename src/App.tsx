import React, { useState, useEffect } from 'react';
import { WeddingProjectState, PhotoSlot, ViewMode, Language, ThemeId, WeddingSite, PackageType } from './types/wedding';
import { Navbar, SaveStatus } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ThemeSelector } from './components/ThemeSelector';
import { CoupleForm } from './components/CoupleForm';
import { EventsManager } from './components/EventsManager';
import { VenueManager } from './components/VenueManager';
import { FamilyForm } from './components/FamilyForm';
import { MediaUploader } from './components/MediaUploader';
import { MusicManager } from './components/MusicManager';
import { RsvpSettingsManager } from './components/RsvpSettingsManager';
import { ReviewSummaryStep } from './components/ReviewSummaryStep';
import { LivePreviewCanvas } from './components/LivePreviewCanvas';
import { PublishModal } from './components/PublishModal';
import { StandaloneInvitationView } from './components/StandaloneInvitationView';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { CoupleDashboard } from './components/CoupleDashboard';
import { ProfilePage } from './components/ProfilePage';
import { PackagesPage } from './components/PackagesPage';
import { RoyalPaymentModal } from './components/RoyalPaymentModal';
import { LockedEditorBanner } from './components/LockedEditorBanner';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { 
  isSiteCurrentlyLocked, 
  isTemplateUnlockedForUser,
  getUserActiveSite, 
  saveWeddingSite,
  initiateRazorpayCheckout,
  syncUserPurchasesFromSupabase
} from './services/razorpayClient';
import { 
  saveWeddingSiteDraft, 
  fetchUserWeddingSite,
  publishWeddingSite 
} from './services/weddingSiteService';
import { 
  unlockInvitationForEditing, 
  lockInvitationOnPublish 
} from './services/accessControlService';
import { THEME_PACKAGE_MAP } from './config/pricing';
import { resolveInvitationState } from './utils/invitationStorage';
import { ErrorBoundary } from './components/ErrorBoundary';

const initialPhotoSlots: Record<string, PhotoSlot> = {
  hero: {
    id: 'hero',
    title: '1. Main Couple Cover Photo',
    description: 'Centerpiece / Hero photo for all templates',
    icon: '👑',
    url: '',
    file: null,
    filter: 'none',
  },
  groom: {
    id: 'groom',
    title: '2. Groom Photo (दूल्हा / વરરાજા)',
    description: 'Groom solo portrait photo',
    icon: '🤵',
    url: '',
    file: null,
    filter: 'none',
  },
  bride: {
    id: 'bride',
    title: '3. Bride Photo (दुल्हन / કન્યા)',
    description: 'Bride solo portrait photo',
    icon: '👰',
    url: '',
    file: null,
    filter: 'none',
  },
  gallery1: {
    id: 'gallery1',
    title: '4. Moments Gallery Photo #1',
    description: 'Pre-wedding photoshoot highlight 1',
    icon: '📸',
    url: '',
    file: null,
    filter: 'none',
  },
  gallery2: {
    id: 'gallery2',
    title: '5. Moments Gallery Photo #2',
    description: 'Pre-wedding photoshoot highlight 2',
    icon: '📸',
    url: '',
    file: null,
    filter: 'none',
  },
  gallery3: {
    id: 'gallery3',
    title: '6. Moments Gallery Photo #3',
    description: 'Pre-wedding photoshoot highlight 3',
    icon: '📸',
    url: '',
    file: null,
    filter: 'none',
  },
  gallery4: {
    id: 'gallery4',
    title: '7. Moments Gallery Photo #4',
    description: 'Pre-wedding photoshoot highlight 4',
    icon: '📸',
    url: '',
    file: null,
    filter: 'none',
  },
};

const initialEvents = [
  { id: '1', name: '💛 Haldi Ceremony', nameHi: 'हल्दी', nameGu: 'પીઠી / હળદર', date: '1 December 2024', time: '10:00 AM', venue: 'The Milestone Garden', color: 'yellow', icon: '💛', dressCode: 'Traditional Yellow Kurta / Saree', mapUrl: 'https://maps.google.com' },
  { id: '2', name: '💚 Mehendi Rasam', nameHi: 'मेहंदी', nameGu: 'મહેંદી રસમ', date: '2 December 2024', time: '03:00 PM', venue: 'The Milestone Courtyard', color: 'green', icon: '💚', dressCode: 'Pastel Floral / Ethnic', mapUrl: 'https://maps.google.com' },
  { id: '3', name: '🎶 Sangeet Night', nameHi: 'संगीत', nameGu: 'સંગીત સંધ્યા', date: '2 December 2024', time: '07:30 PM', venue: 'Royal Darbar Banquet', color: 'purple', icon: '🎶', dressCode: 'Indo-Western Bollywood Glam', mapUrl: 'https://maps.google.com' },
  { id: '4', name: '💍 Shubh Vivah / Pheras', nameHi: 'शुभ विवाह', nameGu: 'શુભ લગ્ન / ફેરા', date: '3 December 2024', time: '06:30 PM Muhurat', venue: 'The Milestone Palace Ground', color: 'gold', icon: '💍', dressCode: 'Royal Shahi Traditional', mapUrl: 'https://maps.google.com' },
  { id: '5', name: '🥂 Grand Reception', nameHi: 'रिसेप्शन', nameGu: 'સ્નેહમિલન / રિસેપ્શન', date: '4 December 2024', time: '08:00 PM', venue: 'The Milestone Grand Ballroom', color: 'red', icon: '🥂', dressCode: 'Black-Tie / Velvet Elegance', mapUrl: 'https://maps.google.com' },
];

function MainApp() {
  const { user, requireAuth } = useAuth();

  // 🧭 App Mode: 'landing' vs 'studio' vs 'login' vs 'dashboard' vs 'profile' vs 'packages'
  const [profileTab, setProfileTab] = useState<'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps'>('profile');
  const [currentAppView, setCurrentAppView] = useState<'landing' | 'studio' | 'login' | 'dashboard' | 'profile' | 'packages'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view')?.toLowerCase();
      if (viewParam === 'studio' || viewParam === 'editor' || viewParam === 'customizer') return 'studio';
      if (viewParam === 'packages' || viewParam === 'pricing' || viewParam === 'plans') return 'packages';

      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      if (hash === 'studio' || hash === 'customizer' || hash === 'editor') return 'studio';
      if (hash === 'login') return 'login';
      if (hash === 'dashboard') return 'dashboard';
      if (hash === 'packages' || hash === 'pricing' || hash === 'plans') return 'packages';
      if (hash === 'rsvps' || hash === 'my-rsvps') { setProfileTab('rsvps'); return 'profile'; }
      if (hash === 'profile' || hash === 'account') return 'profile';
      if (hash === 'purchases') { setProfileTab('purchases'); return 'profile'; }
      if (hash === 'transactions') { setProfileTab('transactions'); return 'profile'; }
      if (hash === 'my-weddings' || hash === 'weddings') { setProfileTab('weddings'); return 'profile'; }
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<string>('theme');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set(['theme']));
  const [toastMessage, setToastMessage] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isRoyalPaymentModalOpen, setIsRoyalPaymentModalOpen] = useState<boolean>(false);
  const [previewModalTheme, setPreviewModalTheme] = useState<ThemeId | null>(null);
  const [royalPaymentPackage, setRoyalPaymentPackage] = useState<PackageType>('silver');
  const [mobileStudioPane, setMobileStudioPane] = useState<'form' | 'preview'>('form');

  // 🎯 Auto-check if current URL is a standalone couple invitation link
  const [isStandaloneView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

    // Canonical /i/:slug or /invite/:slug or /wedding/:slug
    if (/^\/(?:i|invite|wedding)\/[^/?#]+/i.test(pathname)) {
      return true;
    }

    if (search.includes('invite=') || search.includes('d=') || search.includes('data=') || search.includes('slug=')) {
      return true;
    }

    if (hash.startsWith('i/') || hash.startsWith('invite/') || hash.startsWith('invite-')) {
      return true;
    }

    return false;
  });

  // 🧭 Hash change listener for seamless URL-based view navigation
  useEffect(() => {
    const handleHashNav = () => {
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      if (hash === 'studio') {
        setCurrentAppView('studio');
      } else if (hash === 'login') {
        setCurrentAppView('login');
      } else if (hash === 'dashboard') {
        setCurrentAppView('dashboard');
      } else if (hash === 'packages' || hash === 'pricing' || hash === 'plans') {
        setCurrentAppView('packages');
      } else if (hash === 'rsvps' || hash === 'my-rsvps') {
        setProfileTab('rsvps');
        setCurrentAppView('profile');
      } else if (hash === 'profile' || hash === 'account') {
        setProfileTab('profile');
        setCurrentAppView('profile');
      } else if (hash === 'purchases') {
        setProfileTab('purchases');
        setCurrentAppView('profile');
      } else if (hash === 'transactions') {
        setProfileTab('transactions');
        setCurrentAppView('profile');
      } else if (hash === 'my-weddings' || hash === 'weddings') {
        setProfileTab('weddings');
        setCurrentAppView('profile');
      }
    };

    window.addEventListener('hashchange', handleHashNav);
    return () => window.removeEventListener('hashchange', handleHashNav);
  }, []);

  const defaultStudioState: WeddingProjectState = {
    theme: 'rajmahal',
    viewMode: 'desktop',
    previewZoom: 0.9, // 90% Default Zoom for Desktop
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
    events: initialEvents,
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
      photoSlots: initialPhotoSlots,
    },
  };

  const [state, setState] = useState<WeddingProjectState>(() => {
    try {
      const resolved = resolveInvitationState();
      if (resolved) {
        return {
          ...defaultStudioState,
          ...resolved,
          couple: { ...defaultStudioState.couple, ...(resolved.couple || {}) },
          family: { ...defaultStudioState.family, ...(resolved.family || {}) },
          media: {
            ...defaultStudioState.media,
            ...(resolved.media || {}),
            photoSlots: {
              ...defaultStudioState.media.photoSlots,
              ...(resolved.media?.photoSlots || {}),
            },
          },
          events: resolved.events && resolved.events.length > 0 ? resolved.events : defaultStudioState.events,
        };
      }
    } catch (e) {
      console.warn('Fallback to default state:', e);
    }

    return defaultStudioState;
  });

  // Track user active site document
  const [activeSite, setActiveSite] = useState<WeddingSite | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // ☁️ Sync Active Site & Saved Content from Supabase on Login / Theme Change
  useEffect(() => {
    let isCancelled = false;

    if (user?.uid) {
      const site = getUserActiveSite(user.uid, state.theme);
      setActiveSite(site);

      // Fetch from Supabase wedding_sites table
      fetchUserWeddingSite(user.uid, state.theme).then((res) => {
        if (!isCancelled && res.success && res.content) {
          setState((prev) => ({
            ...prev,
            ...(res.content || {}),
            couple: { ...prev.couple, ...(res.content?.couple || {}) },
            family: { ...prev.family, ...(res.content?.family || {}) },
            media: {
              ...prev.media,
              ...(res.content?.media || {}),
              photoSlots: {
                ...prev.media.photoSlots,
                ...(res.content?.media?.photoSlots || {}),
              },
            },
            events: res.content?.events && res.content.events.length > 0 ? res.content.events : prev.events,
            theme: state.theme, // keep current selected theme
          }));
        }
      });

      // Sync purchases from Supabase database
      syncUserPurchasesFromSupabase(user.uid);
    }

    return () => { isCancelled = true; };
  }, [user?.uid, state.theme]);

  // Lock status calculation
  const lockInfo = isSiteCurrentlyLocked(user?.uid, state.theme, activeSite);

  // 💾 Real-time Safe Autosave: localStorage + Debounced Supabase Sync
  useEffect(() => {
    try {
      localStorage.setItem('WEDDING_STUDIO_STATE', JSON.stringify(state));
    } catch (e) {}

    // Debounced sync to Supabase wedding_sites.content
    if (user?.uid) {
      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        try {
          const res = await saveWeddingSiteDraft(user.uid, state.theme, state);
          if (res.success) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('idle');
          }
        } catch (e) {
          setSaveStatus('idle');
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setSaveStatus('saved');
    }
  }, [state, user?.uid]);

  // If opening pure couple link, render ONLY the full-screen Kankotri!
  if (isStandaloneView) {
    return <StandaloneInvitationView initialState={state} />;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleEnterStudio = (preferredTheme?: ThemeId) => {
    if (preferredTheme) {
      setState((prev) => ({ ...prev, theme: preferredTheme }));
    }
    if (typeof window !== 'undefined') {
      try {
        window.location.hash = '#studio';
      } catch (e) {}
    }
    setCurrentAppView('studio');
  };

  const handlePreviewThemeFromLanding = (themeId: ThemeId) => {
    setPreviewModalTheme(themeId);
  };

  const handleTabSaveAndNext = (currentTab: string, nextTab: string) => {
    // 💳 If currently locked, require Unlock/Payment before editing
    const currentLock = isSiteCurrentlyLocked(user?.uid, state.theme, activeSite);
    if (currentLock.isLocked) {
      const pkg = THEME_PACKAGE_MAP[state.theme] || 'gold';
      setRoyalPaymentPackage(pkg);
      setIsRoyalPaymentModalOpen(true);
      showToast('🔒 Please unlock editing to customize your royal invitation.');
      return;
    }

    setCompletedTabs((prev) => new Set([...prev, currentTab]));

    if (nextTab === 'publish') {
      setIsPublishModalOpen(true);
    } else {
      setActiveTab(nextTab);
    }
    showToast(`✓ Saved ${currentTab.toUpperCase()}! Moving to next step.`);
  };

  const handleTabSelect = (tabId: string) => {
    const currentLock = isSiteCurrentlyLocked(user?.uid, state.theme, activeSite);
    if (currentLock.isLocked && tabId !== 'theme') {
      const pkg = THEME_PACKAGE_MAP[state.theme] || 'gold';
      setRoyalPaymentPackage(pkg);
      setIsRoyalPaymentModalOpen(true);
      showToast('🔒 Please unlock editing to customize this section.');
      return;
    }
    if (tabId === 'publish') {
      setIsPublishModalOpen(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    let autoZoom = 0.9; // 90% for desktop
    if (mode === 'mobile') autoZoom = 0.6; // 60% for mobile
    else if (mode === 'tablet') autoZoom = 0.95; // 95% for tablet

    setState((prev) => ({
      ...prev,
      viewMode: mode,
      previewZoom: autoZoom,
    }));
  };

  const updateCouple = (updated: Partial<WeddingProjectState['couple']>) => {
    setState((prev) => ({ ...prev, couple: { ...prev.couple, ...updated } }));
  };

  const updateEvents = (events: WeddingProjectState['events']) => {
    setState((prev) => ({ ...prev, events }));
  };

  const updateFamily = (updated: Partial<WeddingProjectState['family']>) => {
    setState((prev) => ({ ...prev, family: { ...prev.family, ...updated } }));
  };

  const updateMedia = (updated: Partial<WeddingProjectState['media']>) => {
    setState((prev) => ({ ...prev, media: { ...prev.media, ...updated } }));
  };

  const updateRsvpConfig = (updated: Partial<NonNullable<WeddingProjectState['rsvpConfig']>>) => {
    setState((prev) => ({
      ...prev,
      rsvpConfig: {
        ...(prev.rsvpConfig || {
          enabled: true,
          collectPhone: true,
          collectGuestsCount: true,
          collectMealPreference: false,
          collectWishes: true,
        }),
        ...updated,
      },
    }));
  };

  // When publishing completes, update site lock state (MANDATORY AUTOMATIC RE-LOCK) & persist
  const handlePublishCompleted = async () => {
    if (user?.uid) {
      const coupleSlug = `${(state.couple.groomEn || 'dhruv').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'shreya').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      
      // 🔒 Lock invitation on publish
      const { site: publishedSite } = lockInvitationOnPublish(user.uid, state.theme, state, coupleSlug);
      setActiveSite(publishedSite);

      try {
        await publishWeddingSite({
          userId: user.uid,
          themeId: state.theme,
          state,
          customSlug: coupleSlug
        });
      } catch (e) {}

      showToast('🔒 Shahi Kankotri Published & Locked! Public Invitation is Live.');
    }
  };

  // 🔐 If on Dedicated Login Page View, render the ultra-premium Login Page!
  if (currentAppView === 'login') {
    return (
      <>
        <LoginPage
          onBackToHome={() => {
            if (typeof window !== 'undefined') window.location.hash = '';
            setCurrentAppView('landing');
          }}
          onSuccessRedirect={() => {
            if (typeof window !== 'undefined') window.location.hash = '';
            setCurrentAppView('landing');
          }}
        />
        <AuthModal />
      </>
    );
  }

  const handleNavigateProfile = (tab: 'profile' | 'purchases' | 'transactions' | 'weddings' = 'profile') => {
    setProfileTab(tab);
    setCurrentAppView('profile');
  };

  // 👤 If on Profile / My Account View, render the luxury Account Center!
  if (currentAppView === 'profile') {
    return (
      <>
        <ProfilePage
          initialTab={profileTab}
          onBackToHome={() => {
            if (typeof window !== 'undefined') window.location.hash = '';
            setCurrentAppView('landing');
          }}
          onBackToStudio={() => {
            if (typeof window !== 'undefined') window.location.hash = '';
            setCurrentAppView('studio');
          }}
          onSelectTheme={(themeId) => {
            setState((prev) => ({ ...prev, theme: themeId }));
            setCurrentAppView('studio');
          }}
          onEditWeddingSite={(site) => {
            if (site.content) {
              setState((prev) => ({
                ...prev,
                ...site.content,
                theme: site.templates?.slug || state.theme,
              }));
            } else if (site.templates?.slug) {
              setState((prev) => ({ ...prev, theme: site.templates.slug }));
            }
            setCurrentAppView('studio');
          }}
        />
        <AuthModal />
      </>
    );
  }

  // 💌 If on Couple RSVP Dashboard View, render the Live Analytics & Guest List!
  if (currentAppView === 'dashboard') {
    return (
      <>
        <CoupleDashboard
          state={state}
          siteId={activeSite?.siteId || activeSite?.id}
          onBackToStudio={() => setCurrentAppView('studio')}
          onBackToHome={() => setCurrentAppView('landing')}
        />
        <AuthModal />
      </>
    );
  }

  // 💎 If on Packages View, render the Dedicated Packages & Pricing Page!
  if (currentAppView === 'packages') {
    return (
      <>
        <PackagesPage
          onBackToHome={() => {
            if (typeof window !== 'undefined') window.location.hash = '';
            setCurrentAppView('landing');
          }}
          onEnterStudio={handleEnterStudio}
          onSelectPackage={(pkg, themeId) => {
            if (themeId) {
              setState((prev) => ({ ...prev, theme: themeId }));
            }
            setRoyalPaymentPackage(pkg);
            setIsRoyalPaymentModalOpen(true);
          }}
        />
        <RoyalPaymentModal
          isOpen={isRoyalPaymentModalOpen}
          onClose={() => setIsRoyalPaymentModalOpen(false)}
          state={state}
          packageType={royalPaymentPackage}
          onPaymentSuccess={(themeId) => {
            setCompletedTabs((prev) => new Set([...prev, 'theme']));
            setActiveTab('couple');
            showToast(`👑 ${themeId.toUpperCase()} Unlocked Successfully!`);
            setCurrentAppView('studio');
          }}
        />
        <AuthModal />
      </>
    );
  }

  // 🏰 If on Landing Page View, render the grand Home Page!
  if (currentAppView === 'landing') {
    return (
      <>
        <LandingPage
          state={state}
          onEnterStudio={handleEnterStudio}
          onPreviewTheme={handlePreviewThemeFromLanding}
          onNavigateLogin={() => setCurrentAppView('login')}
          onNavigateProfile={handleNavigateProfile}
          onNavigatePackages={() => {
            if (typeof window !== 'undefined') window.location.hash = '#packages';
            setCurrentAppView('packages');
          }}
        />
        <RoyalPaymentModal
          isOpen={isRoyalPaymentModalOpen}
          onClose={() => setIsRoyalPaymentModalOpen(false)}
          state={state}
          packageType={royalPaymentPackage}
          onPaymentSuccess={(themeId) => {
            setCompletedTabs((prev) => new Set([...prev, 'theme']));
            setActiveTab('couple');
            showToast(`👑 ${themeId.toUpperCase()} Unlocked Successfully!`);
            setCurrentAppView('studio');
          }}
        />
        <AuthModal />
      </>
    );
  }

  // 🛠️ Otherwise, render the Shahi Studio Customizer 2.0
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col antialiased bg-[#FFFDF8] text-[#241A17] relative font-manrope">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#6E1020] text-[#FFFDF8] text-xs font-semibold border border-[#C49A35] shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="text-[#C49A35]">👑</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar Toolbar */}
      <Navbar
        state={state}
        saveStatus={saveStatus}
        onViewChange={handleViewModeChange}
        onLanguageChange={(lang: Language) => setState((prev) => ({ ...prev, language: lang }))}
        onZoomChange={(zoom: number) => setState((prev) => ({ ...prev, previewZoom: zoom }))}
        onRefreshPreview={() => setRefreshKey((prev) => prev + 1)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onNavigateHome={() => setCurrentAppView('landing')}
        onNavigateLogin={() => setCurrentAppView('login')}
        onNavigateDashboard={() => {
          setProfileTab('rsvps');
          setCurrentAppView('profile');
        }}
        onNavigateProfile={handleNavigateProfile}
      />

      {/* 📱 Mobile Form vs Live Preview Switcher (< 1024px) */}
      <div className="lg:hidden flex items-center bg-[#F8F3E8] border-b border-[#E8D5AD] p-1.5 text-xs font-semibold shrink-0">
        <button
          type="button"
          onClick={() => setMobileStudioPane('form')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileStudioPane === 'form'
              ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
              : 'text-[#75675C]'
          }`}
        >
          <span>📝 Studio Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStudioPane('preview')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileStudioPane === 'preview'
              ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
              : 'text-[#75675C]'
          }`}
        >
          <span>👁️ Live Preview</span>
        </button>
      </div>

      {/* 🔒 Top Locked / Published Re-Lock Banner */}
      {lockInfo.isLocked && (
        <LockedEditorBanner
          templateId={state.theme}
          reason={lockInfo.reason}
          state={state}
          slug={activeSite?.slug}
          onOpenPaymentModal={() => {
            const pkg = THEME_PACKAGE_MAP[state.theme] || 'gold';
            setRoyalPaymentPackage(pkg);
            setIsRoyalPaymentModalOpen(true);
          }}
        />
      )}

      {/* Main Dual-Pane Studio: Left Editor (~38-40%) + Right Hero Preview (~60-62%) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Form Workspace */}
        <aside className={`w-full lg:w-[40%] xl:w-[38%] max-w-[500px] bg-[#FFFDF8] border-r border-[#E8D5AD] flex flex-col shrink-0 overflow-hidden shadow-sm z-10 ${mobileStudioPane === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          <Sidebar
            activeTab={activeTab}
            completedTabs={completedTabs}
            onTabChange={handleTabSelect}
          />

          {/* Scrollable Form Body with Steps */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Step 01: Theme Selection */}
            {activeTab === 'theme' && (
              <ThemeSelector
                selectedTheme={state.theme}
                onThemeChange={(themeId) => setState((prev) => ({ ...prev, theme: themeId }))}
                onSaveAndNext={() => handleTabSaveAndNext('theme', 'couple')}
                onPreviewTheme={handlePreviewThemeFromLanding}
              />
            )}

            {/* Step 02: Couple Details */}
            {activeTab === 'couple' && (
              <CoupleForm
                couple={state.couple}
                onChange={updateCouple}
                onSaveAndNext={() => handleTabSaveAndNext('couple', 'events')}
              />
            )}

            {/* Step 03: Mangal Rasam Events */}
            {activeTab === 'events' && (
              <EventsManager
                events={state.events}
                onChange={updateEvents}
                onSaveAndNext={() => handleTabSaveAndNext('events', 'venue')}
              />
            )}

            {/* Step 04: Wedding Venue & Google Maps Navigation */}
            {activeTab === 'venue' && (
              <VenueManager
                couple={state.couple}
                onChange={updateCouple}
                onSaveAndNext={() => handleTabSaveAndNext('venue', 'media')}
              />
            )}

            {/* Step 05: Photos & Moments Gallery */}
            {activeTab === 'media' && (
              <MediaUploader
                theme={state.theme}
                media={state.media}
                onChange={updateMedia}
                onSaveAndExport={() => handleTabSaveAndNext('media', 'music')}
              />
            )}

            {/* Step 06: Background Music & Shehnai */}
            {activeTab === 'music' && (
              <MusicManager
                media={state.media}
                onChange={updateMedia}
                onSaveAndNext={() => handleTabSaveAndNext('music', 'rsvp')}
              />
            )}

            {/* Step 07: Live RSVP & Guest Headcount Configuration */}
            {activeTab === 'rsvp' && (
              <RsvpSettingsManager
                family={state.family}
                rsvpConfig={state.rsvpConfig}
                onChangeFamily={updateFamily}
                onChangeConfig={updateRsvpConfig}
                onSaveAndNext={() => handleTabSaveAndNext('rsvp', 'review')}
                onOpenRsvpDashboard={() => {
                  setProfileTab('rsvps');
                  setCurrentAppView('profile');
                }}
              />
            )}

            {/* Step 08: Final Inspection Review */}
            {activeTab === 'review' && (
              <ReviewSummaryStep
                state={state}
                onOpenFullscreenPreview={() => setState((prev) => ({ ...prev, viewMode: 'desktop' }))}
                onProceedToPublish={() => setIsPublishModalOpen(true)}
                onJumpToStep={(step) => setActiveTab(step)}
              />
            )}
          </div>
        </aside>

        {/* Right Live Visualizer Canvas: The Hero Invitation Preview (~60-62%) */}
        <section className={`flex-1 bg-[#F8F3E8] flex items-center justify-center p-2 sm:p-6 overflow-hidden relative ${mobileStudioPane === 'form' ? 'hidden lg:flex' : 'flex'}`}>
          <LivePreviewCanvas state={state} refreshKey={refreshKey} siteId={activeSite?.siteId || activeSite?.id} />
        </section>
      </main>

      {/* 🚀 Publish & Share Hub Modal */}
      {isPublishModalOpen && (
        <PublishModal
          state={state}
          onClose={() => {
            setIsPublishModalOpen(false);
            handlePublishCompleted();
          }}
        />
      )}

      {/* 👑 Royal Payment Confirmation Modal */}
      <RoyalPaymentModal
        isOpen={isRoyalPaymentModalOpen}
        onClose={() => setIsRoyalPaymentModalOpen(false)}
        state={state}
        packageType={royalPaymentPackage}
        onPaymentSuccess={(themeId) => {
          if (user?.uid) {
            unlockInvitationForEditing(user.uid, themeId);
            const updated = getUserActiveSite(user.uid, themeId);
            if (updated) setActiveSite(updated);
          }
          setCompletedTabs((prev) => new Set([...prev, 'theme']));
          setActiveTab('couple');
          showToast(`👑 ${themeId.toUpperCase()} Unlocked Successfully! Now customize your details.`);
        }}
      />

      {/* 👤 Royal Authentication Modal */}
      <AuthModal />

      {/* 👁️ Luxury Immersive Full-Screen Template Preview Modal */}
      <TemplatePreviewModal
        themeId={previewModalTheme}
        isOpen={Boolean(previewModalTheme)}
        onClose={() => setPreviewModalTheme(null)}
        onSelectAndCustomize={(t) => {
          setState((prev) => ({ ...prev, theme: t }));
          setCurrentAppView('studio');
          showToast(`👑 Loaded ${t.toUpperCase()} Theme in Studio!`);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
