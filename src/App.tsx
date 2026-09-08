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
import { CoupleDashboard } from './components/CoupleDashboard';
import { ProfilePage } from './components/ProfilePage';
import { PackagesPage } from './components/PackagesPage';
import { WeddingCommandCenter } from './components/CommandCenter/WeddingCommandCenter';
import { RoyalPaymentModal } from './components/RoyalPaymentModal';
import { LockedEditorBanner } from './components/LockedEditorBanner';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { PartnerAttributionBanner } from './components/PartnerAttributionBanner';
import { RoleIndicatorBanner } from './components/RoleIndicatorBanner';
import { PartnerOnboardingModal } from './components/PartnerOnboardingModal';
import { PartnerDashboard, StudioWorkspaceTab } from './components/PartnerDashboard/PartnerDashboard';
import { ClientReviewView } from './components/ClientReviewView';
import { AdminControlCenter } from './components/Admin/AdminControlCenter';
import { AdminSuperControlCenter } from './components/Admin/SuperControlCenter/AdminSuperControlCenter';
import { RoyalDownloadHubModal } from './components/DownloadHub/RoyalDownloadHubModal';
import { FirstTimeCoupleOnboardingModal } from './components/Onboarding/FirstTimeCoupleOnboardingModal';
import { DigitalEntryPassView } from './components/Guest/DigitalEntryPassView';
import { VenueCheckInView } from './components/CheckIn/VenueCheckInView';
import { PublicMemoryDropView } from './components/Memories/PublicMemoryDropView';
import { ClientApprovalPortalView } from './components/ClientReview/ClientApprovalPortalView';
import { ClientQuotationPortalView } from './components/ClientFinance/ClientQuotationPortalView';
import { ClientInvoicePaymentPortalView } from './components/ClientFinance/ClientInvoicePaymentPortalView';
import { AuthCallbackView } from './components/AuthCallbackView';
import { ResetPasswordView } from './components/ResetPasswordView';
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
import { unlockInvitationForEditing, lockInvitationOnPublish } from './services/accessControlService';
import { THEME_PACKAGE_MAP } from './config/pricing';
import { stopAllIframesAudio, initGlobalAudioCoordinator } from './services/audioCoordinator';
import { resolveInvitationState } from './utils/invitationStorage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { resolveApplicationRoute, navigateToRoute } from './utils/navigation';

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
  const { user, requireAuth, setShowAuthModal } = useAuth();

  // 🧭 App Routing State synchronized with window.location, popstate, and browser Back/Forward
  const initialRoute = resolveApplicationRoute();
  const [profileTab, setProfileTab] = useState<'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps'>(initialRoute.profileTab || 'profile');
  const [partnerActiveTab, setPartnerActiveTab] = useState<StudioWorkspaceTab>(initialRoute.partnerTab || 'dashboard');
  const [selectedCommandCenterSite, setSelectedCommandCenterSite] = useState<any>(null);
  const [currentAppView, setCurrentAppView] = useState<'landing' | 'studio' | 'login' | 'dashboard' | 'profile' | 'packages' | 'command-center' | 'partner' | 'review' | 'admin' | 'auth-callback' | 'reset-password' | 'pass' | 'checkin' | 'memories' | 'quote' | 'pay'>(initialRoute.view as any);
  const [isStandaloneView, setIsStandaloneView] = useState<boolean>(initialRoute.isStandalone);

  const [activeTab, setActiveTab] = useState<string>('theme');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set(['theme']));
  const [toastMessage, setToastMessage] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isRoyalPaymentModalOpen, setIsRoyalPaymentModalOpen] = useState<boolean>(false);
  const [previewModalTheme, setPreviewModalTheme] = useState<ThemeId | null>(null);
  const [royalPaymentPackage, setRoyalPaymentPackage] = useState<PackageType>('silver');
  const [mobileStudioPane, setMobileStudioPane] = useState<'form' | 'preview'>('form');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState<boolean>(Boolean(initialRoute.openPartnerModal));
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDownloadHubOpen, setIsDownloadHubOpen] = useState<boolean>(false);
  const [downloadHubSite, setDownloadHubSite] = useState<any>(null);

  // 🧭 Synchronous Route Listener for Instant Browser Back / Forward & Navigation Updates
  useEffect(() => {
    const handleRouteNav = () => {
      const resolved = resolveApplicationRoute();
      setCurrentAppView(resolved.view);
      setIsStandaloneView(resolved.isStandalone);
      if (resolved.partnerTab) {
        setPartnerActiveTab(resolved.partnerTab);
      }
      if (resolved.profileTab) {
        setProfileTab(resolved.profileTab);
      }
      if (resolved.openPartnerModal) {
        setIsPartnerModalOpen(true);
      }
    };

    const handleOpenPartnerEvent = () => {
      setIsPartnerModalOpen(true);
    };

    const handleOpenOnboardingEvent = () => {
      setIsOnboardingOpen(true);
    };

    window.addEventListener('hashchange', handleRouteNav);
    window.addEventListener('popstate', handleRouteNav);
    window.addEventListener('open-partner-modal', handleOpenPartnerEvent);
    window.addEventListener('open-onboarding-modal', handleOpenOnboardingEvent);

    return () => {
      window.removeEventListener('hashchange', handleRouteNav);
      window.removeEventListener('popstate', handleRouteNav);
      window.removeEventListener('open-partner-modal', handleOpenPartnerEvent);
      window.removeEventListener('open-onboarding-modal', handleOpenOnboardingEvent);
    };
  }, []);

  const defaultStudioState: WeddingProjectState = {
    theme: 'rajmahal',
    viewMode: 'desktop',
    previewZoom: 0.9, // 90% Default Zoom for Desktop
    language: 'en',
    couple: {
      groomEn: 'Rudra',
      groomHi: 'रुद्र',
      groomGu: 'રુદ્ર',
      brideEn: 'Ishani',
      brideHi: 'ईशानी',
      brideGu: 'ઈશાની',
      mark: 'R · I',
      hashtag: '#RudraWedsIshani',
      weddingDate: '3 December 2026 · 06:30 PM',
      muhuratTime: '06:30 PM',
      venueName: 'The Milestone, Modasa, Gujarat',
      venueAddress: 'The Milestone Highway, Modasa',
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
      const currentSlug = `${(state.couple?.groomEn || '').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple?.brideEn || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (currentSlug && currentSlug !== '-') {
        localStorage.setItem(`SHAHI_INVITE_${currentSlug}`, JSON.stringify(state));
      }
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
    return <StandaloneInvitationView />;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleEnterStudio = (preferredTheme?: ThemeId) => {
    if (preferredTheme) {
      setState((prev) => ({ ...prev, theme: preferredTheme }));
    }
    navigateToRoute('/studio');
  };

  // 🎵 Global Audio Coordinator: ensures only one template iframe audio plays at any time
  useEffect(() => {
    const cleanup = initGlobalAudioCoordinator();
    return cleanup;
  }, []);

  const handlePreviewThemeFromLanding = (themeId: ThemeId) => {
    stopAllIframesAudio();
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

  // 🔍 If on Dedicated Client Review / Approval Portal View, render the Client Review Experience!
  const isReviewRoute = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/preview/') || 
    window.location.pathname.startsWith('/review/')
  );
  if (currentAppView === 'review' || isReviewRoute) {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const token = urlParams.get('token') || 
                  urlParams.get('review_token') || 
                  urlParams.get('review') ||
                  (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/(?:review|preview)\/?/i, '').replace(/^#\/?/, '') : '') || '';
    const slug = urlParams.get('slug') || activeSite?.slug || state.couple.hashtag?.replace('#', '') || 'dhruv-shreya';

    return (
      <ErrorBoundary>
        {token.startsWith('rev_') ? (
          <ClientApprovalPortalView
            reviewToken={token}
            weddingSlug={slug}
            onBackToApp={() => navigateToRoute('/')}
          />
        ) : (
          <ClientReviewView
            token={token}
            onBackToHome={() => {
              navigateToRoute('/');
            }}
          />
        )}
      </ErrorBoundary>
    );
  }

  const renderPartnerModal = () => (
    <PartnerOnboardingModal
      isOpen={isPartnerModalOpen}
      onClose={() => setIsPartnerModalOpen(false)}
      onNavigateLogin={() => setShowAuthModal(true)}
      onSuccess={() => {
        setIsPartnerModalOpen(false);
        navigateToRoute('/partner');
        showToast('📸 Studio Partner Account Activated! Welcome to AmantranLink Partner Hub.');
      }}
    />
  );

  // 🔐 Dedicated Auth Callback Experience (No blank screens or Supabase raw URLs)
  if (currentAppView === 'auth-callback') {
    return <AuthCallbackView />;
  }

  // 🔑 Dedicated Password Reset Experience
  if (currentAppView === 'reset-password') {
    return <ResetPasswordView />;
  }

  // 🚪 If user visits login route, open modal and go to studio/landing
  if (currentAppView === 'login') {
    setShowAuthModal(true);
    navigateToRoute('/studio', true);
    return null;
  }

  const handleNavigateProfile = (tab: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps' = 'profile') => {
    setProfileTab(tab);
    navigateToRoute(`/profile#${tab}`);
  };

  // 👤 If on Profile / My Account View, render the luxury Account Center!
  if (currentAppView === 'profile') {
    return (
      <>
        <ProfilePage
          initialTab={profileTab}
          onBackToHome={() => {
            navigateToRoute('/');
          }}
          onBackToStudio={() => {
            navigateToRoute('/studio');
          }}
          onSelectTheme={(themeId) => {
            setState((prev) => ({ ...prev, theme: themeId }));
            navigateToRoute('/studio');
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
            navigateToRoute('/studio');
          }}
          onOpenCommandCenter={(site) => {
            setSelectedCommandCenterSite(site);
            navigateToRoute('/command-center');
          }}
        />

        {renderPartnerModal()}
      </>
    );
  }

  // 🏰 If on Shahi Wedding Command Center View, render the private royal command room!
  if (currentAppView === 'command-center') {
    const targetSite = selectedCommandCenterSite || activeSite || {
      id: 'default-site',
      content: state,
      slug: `${(state.couple?.groomEn || 'dhruv').toLowerCase()}-${(state.couple?.brideEn || 'shreya').toLowerCase()}`
    };

    return (
      <>
        <WeddingCommandCenter
          site={targetSite}
          allUserSites={[]}
          onSelectSite={(site) => setSelectedCommandCenterSite(site)}
          onBackToProfile={() => navigateToRoute('/profile')}
          onBackToStudio={() => navigateToRoute('/studio')}
          onOpenLiveInvitation={(slug) => {
            const url = `/i/${slug}`;
            window.open(url, '_blank');
          }}
        />

        {renderPartnerModal()}
      </>
    );
  }

  // 👑 If on Admin Control Center View, render the Super Control Center Platform Intelligence!
  if (currentAppView === 'admin') {
    return (
      <AdminSuperControlCenter
        onBackToHome={() => {
          navigateToRoute('/');
        }}
        onBackToStudio={() => {
          navigateToRoute('/studio');
        }}
      />
    );
  }

  // 📸 If on Photographer Partner Hub View, render the Multi-Client Studio Workspace!
  if (currentAppView === 'partner') {
    return (
      <>
        <PartnerDashboard
          initialTab={partnerActiveTab}
          onBackToStudio={() => {
            navigateToRoute('/studio');
          }}
          onBackToHome={() => {
            navigateToRoute('/');
          }}
          onOpenClientStudio={(siteId, themeId, content) => {
            if (content) {
              setState(content);
            } else {
              setState((prev) => ({ ...prev, theme: themeId }));
            }
            navigateToRoute('/studio');
            showToast('👑 Client Wedding Opened in Studio Editor!');
          }}
          onOpenAssetKit={(site) => {
            setDownloadHubSite(site);
            setIsDownloadHubOpen(true);
          }}
          onOpenJoinPartnerModal={() => setIsPartnerModalOpen(true)}
        />

        {renderPartnerModal()}
      </>
    );
  }

  // 🎫 If on Digital QR Entry Pass View, render the Guest Entry Pass!
  if (currentAppView === 'pass') {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const passToken = urlParams.get('pass') || (pathParts.includes('pass') ? pathParts[pathParts.indexOf('pass') + 1] : '') || '';
    const slug = urlParams.get('slug') || activeSite?.slug || state.couple.hashtag?.replace('#', '') || 'dhruv-shreya';

    return (
      <DigitalEntryPassView
        token={passToken}
        weddingSlug={slug}
      />
    );
  }

  // 🎟️ If on Venue Check-in View, render the Live Scanner Workspace!
  if (currentAppView === 'checkin') {
    const slug = activeSite?.slug || state.couple.hashtag?.replace('#', '') || 'dhruv-shreya';
    return (
      <VenueCheckInView
        state={state}
        weddingSlug={slug}
        weddingSiteId={activeSite?.siteId || activeSite?.id}
        userId={user?.uid}
        onBack={() => navigateToRoute('/dashboard')}
      />
    );
  }

  // 📸 If on Public Wedding Memories & Photo Drop View, render the Guest Memories Wall!
  if (currentAppView === 'memories') {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const slug = urlParams.get('slug') || activeSite?.slug || state.couple.hashtag?.replace('#', '') || 'dhruv-shreya';
    const coupleName = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;

    return (
      <PublicMemoryDropView
        weddingSlug={slug}
        weddingSiteId={activeSite?.siteId || activeSite?.id}
        coupleNames={coupleName}
        onBackToInvite={() => navigateToRoute(`/i/${slug}`)}
      />
    );
  }

  // 📜 If on Client Quotation Portal View, render the Quotation Acceptance Portal!
  if (currentAppView === 'quote') {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const quoteToken = urlParams.get('quote') || (pathParts.includes('quote') ? pathParts[pathParts.indexOf('quote') + 1] : '') || 'quo_demo';

    return (
      <ClientQuotationPortalView
        quoteToken={quoteToken}
        onBackToApp={() => navigateToRoute('/')}
      />
    );
  }

  // 💳 If on Client Invoice Payment View, render the Invoice Payment Portal!
  if (currentAppView === 'pay') {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const invToken = urlParams.get('pay') || urlParams.get('invoice') || (pathParts.includes('pay') ? pathParts[pathParts.indexOf('pay') + 1] : (pathParts.includes('invoice') ? pathParts[pathParts.indexOf('invoice') + 1] : '')) || 'inv_demo';

    return (
      <ClientInvoicePaymentPortalView
        invoiceToken={invToken}
        onBackToApp={() => navigateToRoute('/')}
      />
    );
  }

  // 💌 If on Couple RSVP Dashboard View, render the Live Analytics & Guest List!
  if (currentAppView === 'dashboard') {
    return (
      <>
        <CoupleDashboard
          state={state}
          siteId={activeSite?.siteId || activeSite?.id}
          onBackToStudio={() => navigateToRoute('/studio')}
          onBackToHome={() => navigateToRoute('/')}
        />

        {renderPartnerModal()}
      </>
    );
  }

  // 💎 If on Packages View, render the Dedicated Packages & Pricing Page!
  if (currentAppView === 'packages') {
    return (
      <>
        <PackagesPage
          onBackToHome={() => {
            navigateToRoute('/');
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
            navigateToRoute('/studio');
          }}
        />

        {renderPartnerModal()}
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
          onNavigateLogin={() => setShowAuthModal(true)}
          onNavigateProfile={handleNavigateProfile}
          onNavigatePackages={() => {
            navigateToRoute('/packages');
          }}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          onNavigatePartnerHub={() => {
            navigateToRoute('/partner');
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
            navigateToRoute('/studio');
          }}
        />

        {renderPartnerModal()}
      </>
    );
  }

  // 🎨 Otherwise, render the AmantranLink Customizer 2.0
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col antialiased bg-[#FFFDF8] text-[#241A17] relative font-manrope">
      {/* 📸 Partner Attribution Banner */}
      <PartnerAttributionBanner />

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
        onNavigateHome={() => navigateToRoute('/')}
        onNavigateLogin={() => setShowAuthModal(true)}
        onNavigateDashboard={() => {
          navigateToRoute('/dashboard');
        }}
        onNavigateProfile={handleNavigateProfile}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onNavigatePartnerHub={(tab) => {
          if (tab) setPartnerActiveTab(tab);
          navigateToRoute(tab ? `/partner#studio/${tab}` : '/partner');
        }}
        onNavigateAdmin={() => {
          navigateToRoute('/admin');
        }}
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

      {/* Main 3-Zone Studio Workspace: Left Rail (~175px) + Center Editorial Form + Right Hero Preview */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#FAF8F5]">
        {/* Zone 1: Left Vertical Navigation Rail (~175px on desktop, horizontal bar on mobile) */}
        <Sidebar
          activeTab={activeTab}
          completedTabs={completedTabs}
          onTabChange={handleTabSelect}
          onOpenDownloadHub={() => {
            setDownloadHubSite(null);
            setIsDownloadHubOpen(true);
          }}
          state={state}
        />

        {/* Zone 2: Center Editorial Form Workspace (~680-730px max on desktop) */}
        <aside className={`w-full lg:w-[480px] xl:w-[560px] 2xl:w-[620px] bg-[#FFFDF8] border-r border-[#E8D5AD]/70 flex flex-col shrink-0 overflow-hidden shadow-xs z-10 ${mobileStudioPane === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
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
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
                onChange={updateCouple}
                onSaveAndNext={() => handleTabSaveAndNext('couple', 'events')}
              />
            )}

            {/* Step 03: Mangal Rasam Events */}
            {activeTab === 'events' && (
              <EventsManager
                events={state.events}
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
                onChange={updateEvents}
                onSaveAndNext={() => handleTabSaveAndNext('events', 'venue')}
              />
            )}

            {/* Step 04: Venue & Google Maps Navigation */}
            {activeTab === 'venue' && (
              <VenueManager
                couple={state.couple}
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
                onChange={updateCouple}
                onSaveAndNext={() => handleTabSaveAndNext('venue', 'media')}
              />
            )}

            {/* Step 05: Photos & Moments Gallery */}
            {activeTab === 'media' && (
              <MediaUploader
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
                media={state.media}
                onChange={updateMedia}
                onSaveAndExport={() => handleTabSaveAndNext('media', 'music')}
              />
            )}

            {/* Step 06: Background Music & Audio */}
            {activeTab === 'music' && (
              <MusicManager
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
                media={state.media}
                onChange={updateMedia}
                onSaveAndNext={() => handleTabSaveAndNext('music', 'rsvp')}
              />
            )}

            {/* Step 07: Live RSVP Configuration */}
            {activeTab === 'rsvp' && (
              <RsvpSettingsManager
                theme={state.theme}
                invitationType={state.invitation_type || 'wedding'}
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

        {/* Zone 3: Right Live Visualizer Canvas (Large Hero Preview) */}
        <section className={`flex-1 bg-[#FAF8F5] flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden relative ${mobileStudioPane === 'form' ? 'hidden lg:flex' : 'flex'}`}>
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
          onOpenDownloadHub={() => {
            setDownloadHubSite(null);
            setIsDownloadHubOpen(true);
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

      {/* 📸 Photographer Partner Onboarding Modal */}
      <PartnerOnboardingModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={() => {
          setIsPartnerModalOpen(false);
          setCurrentAppView('partner');
          if (typeof window !== 'undefined') {
            try {
              window.location.hash = '#partner';
            } catch (e) {}
          }
          showToast('📸 Studio Partner Account Activated! Welcome to AmantranLink Partner Hub.');
        }}
      />

      {/* 👑 First-Time Couple Guided Onboarding Modal */}
      <FirstTimeCoupleOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        state={state}
        onUpdateState={setState}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setCurrentAppView('studio');
          showToast('👑 Welcome to your Royal Wedding Workspace!');
        }}
      />

      {/* 📥 4K Royal Asset & Download Center Modal */}
      <RoyalDownloadHubModal
        isOpen={isDownloadHubOpen}
        onClose={() => {
          setIsDownloadHubOpen(false);
          setDownloadHubSite(null);
        }}
        state={downloadHubSite?.content || state}
        siteId={downloadHubSite?.id || activeSite?.siteId || activeSite?.id}
        slug={downloadHubSite?.published_url || activeSite?.slug}
      />

      {/* 👑 Role Indicator Bottom Status Bar (Couple vs Photographer) */}
      <RoleIndicatorBanner
        onNavigatePartnerHub={() => {
          if (typeof window !== 'undefined') {
            try { window.location.hash = '#partner'; } catch (e) {}
          }
          setCurrentAppView('partner');
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
        <AuthModal />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
