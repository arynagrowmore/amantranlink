import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, ArrowLeft, Sparkles, Plus, ExternalLink, Copy, Check, 
  Share2, Wallet, ArrowRight, ShieldCheck, RefreshCw, Eye, Edit3, 
  Download, Search, Filter, Building2, Link2, CheckCircle2, MessageCircle,
  Phone, Mail, Users, Lock, Unlock, Calendar, Clock, MessageSquare, AlertCircle, 
  FileText, CheckCircle, BarChart3, X, ChevronRight, Globe, Instagram, MapPin, 
  DollarSign, ArrowUpRight, Heart, Bell, Send, CopyCheck, RefreshCcw, Tag,
  MoreVertical, Menu, LayoutDashboard, ChevronDown, Palette, UsersRound,
  SlidersHorizontal, HelpCircle, Settings, LogOut, Upload, CheckSquare,
  TrendingUp, Award, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeId, WeddingProjectState, PartnerDashboardStats, CommissionRecord } from '../../types/wedding';
import { 
  fetchPartnerDashboardStats, 
  updatePartnerProfile, 
  generateClientReviewToken, 
  revokeClientReviewToken,
  duplicatePartnerInvitation,
  updateClientPaymentTracking,
  fetchUserNotifications,
  markNotificationRead,
  createPartnerClientInvitation,
  InAppNotification
} from '../../services/partnerService';
import { themes } from '../ThemeSelector';
import { supabase } from '../../lib/supabase';
import { calculatePaymentDetails, PARTNER_PACKAGES, OFFICIAL_PACKAGES } from '../../config/pricing';
import { PartnerAnalyticsTab } from './PartnerAnalyticsTab';
import { PartnerSettlementTab } from './PartnerSettlementTab';
import { PartnerMarketingTab } from './PartnerMarketingTab';
import { StudioBrandingTab } from './StudioBrandingTab';
import { StudioBrandingView } from './StudioBrandingView';
import { CustomDomainsView } from './CustomDomainsView';
import { PartnerReviewDrawer } from './PartnerReviewDrawer';
import { StudioFinanceWorkspace } from './Finance/StudioFinanceWorkspace';
import { AutomationCenterWorkspace } from '../Automation/AutomationCenterWorkspace';
import { StudioMainHeader } from './StudioMainHeader';
import { StudioWorkspaceNav } from './StudioWorkspaceNav';
import { getCurrentAppOrigin } from '../../utils/origin';
import { RoyalCrestIcon } from '../ShahiIcons';
import { GuestManagementView } from '../Guest/GuestManagementView';

export type StudioWorkspaceTab = 
  | 'dashboard' 
  | 'invitations' 
  | 'finance' 
  | 'automation' 
  | 'clients' 
  | 'commissions' 
  | 'analytics' 
  | 'marketing' 
  | 'profile' 
  | 'branding' 
  | 'domains' 
  | 'team' 
  | 'settings';

interface PartnerDashboardProps {
  initialTab?: StudioWorkspaceTab;
  onBackToStudio: () => void;
  onBackToHome: () => void;
  onOpenClientStudio: (siteId: string, themeId: ThemeId, content?: WeddingProjectState) => void;
  onOpenAssetKit?: (site: any) => void;
  onOpenJoinPartnerModal?: () => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ══════════════════════════════════════════════════════════════════════════
// 🔘 THREE-DOT OVERFLOW ACTION MENU COMPONENT
// ══════════════════════════════════════════════════════════════════════════
interface ActionMenuProps {
  site: any;
  onOpenStudio: () => void;
  onSendReview: () => void;
  onViewFeedback: () => void;
  onDuplicate: () => void;
  onTrackPayment: () => void;
  onCopyLink: () => void;
  onOpenLive?: () => void;
}

const InvitationActionMenu: React.FC<ActionMenuProps> = ({
  site,
  onOpenStudio,
  onSendReview,
  onViewFeedback,
  onDuplicate,
  onTrackPayment,
  onCopyLink,
  onOpenLive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLive = site.status === 'published';
  const hasFeedback = site.workflow_status === 'CHANGES_REQUESTED' || Boolean(site.client_feedback);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-stone-200"
        title="More actions"
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenStudio();
            }}
            className="w-full px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-400" />
            <span>Open in Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSendReview();
            }}
            className="w-full px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-stone-400" />
            <span>Send Review to Couple</span>
          </button>

          {hasFeedback && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewFeedback();
              }}
              className="w-full px-3.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Review Feedback ({site.client_feedback ? '1' : '0'})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDuplicate();
            }}
            className="w-full px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
          >
            <CopyCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Duplicate Invitation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onTrackPayment();
            }}
            className="w-full px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            <span>Track Client Payment</span>
          </button>

          <div className="my-1 border-t border-stone-100" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCopyLink();
            }}
            className="w-full px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Copy Preview Link</span>
          </button>

          {isLive && onOpenLive && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenLive();
              }}
              className="w-full px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Live Kankotri</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// 🏰 MASTER PHOTOGRAPHER / STUDIO PARTNER WORKSPACE SHELL
// ══════════════════════════════════════════════════════════════════════════
export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  initialTab = 'dashboard',
  onBackToStudio,
  onBackToHome,
  onOpenClientStudio,
  onOpenAssetKit,
  onOpenJoinPartnerModal,
}) => {
  const { user, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<StudioWorkspaceTab>(initialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState<boolean>(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [stats, setStats] = useState<PartnerDashboardStats>({
    totalWeddings: 0,
    draftWeddings: 0,
    liveWeddings: 0,
    totalGmv: 0,
    totalCommission: 0,
    pendingCommission: 0,
    availableCredit: 0,
    recentCommissions: [],
  });
  const [clientSites, setClientSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | 'DRAFT' | 'SENT_FOR_REVIEW' | 'CHANGES_REQUESTED' | 'CLIENT_APPROVED' | 'LIVE'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'weddingDate' | 'name'>('newest');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // 🔔 In-App Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // 📝 Multi-Step Create New Invitation Wizard State
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [newGroomName, setNewGroomName] = useState<string>('');
  const [newBrideName, setNewBrideName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newWeddingDate, setNewWeddingDate] = useState<string>('2026-12-10');
  const [newPartnerNotes, setNewPartnerNotes] = useState<string>('');
  const [newSelectedTheme, setNewSelectedTheme] = useState<ThemeId>('rajmahal');
  const [isCreatingClient, setIsCreatingClient] = useState<boolean>(false);
  const [createErrorMsg, setCreateErrorMsg] = useState<string>('');

  // 🤝 Client Review Token Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewModalSite, setReviewModalSite] = useState<any | null>(null);
  const [generatedReviewUrl, setGeneratedReviewUrl] = useState<string>('');
  const [isGeneratingReview, setIsGeneratingReview] = useState<boolean>(false);
  const [copiedReviewLink, setCopiedReviewLink] = useState<boolean>(false);

  // 📝 Client Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackModalSite, setFeedbackModalSite] = useState<any | null>(null);
  const [isResolvingFeedback, setIsResolvingFeedback] = useState<boolean>(false);

  // 🔄 Duplicate Invitation Modal State
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState<boolean>(false);
  const [duplicateSourceSite, setDuplicateSourceSite] = useState<any | null>(null);
  const [duplicateGroom, setDuplicateGroom] = useState<string>('');
  const [duplicateBride, setDuplicateBride] = useState<string>('');
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);

  // 💳 Client Payment Tracking Modal State
  const [isPaymentTrackModalOpen, setIsPaymentTrackModalOpen] = useState<boolean>(false);
  const [paymentTrackSite, setPaymentTrackSite] = useState<any | null>(null);
  const [trackPaymentStatus, setTrackPaymentStatus] = useState<'NOT_TRACKED' | 'PENDING' | 'PARTIAL' | 'PAID'>('NOT_TRACKED');
  const [trackQuotedAmount, setTrackQuotedAmount] = useState<string>('');
  const [isSavingPaymentTrack, setIsSavingPaymentTrack] = useState<boolean>(false);

  // 👥 Client Profile Dedicated Modal State
  const [selectedClientProfileSite, setSelectedClientProfileSite] = useState<any | null>(null);
  const [clientProfileTab, setClientProfileTab] = useState<'overview' | 'invitations' | 'activity' | 'payments'>('overview');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  // 👑 Project Workspace Dedicated Modal State
  const [selectedProjectDetailSite, setSelectedProjectDetailSite] = useState<any | null>(null);
  const [projectDetailTab, setProjectDetailTab] = useState<'overview' | 'invitation' | 'review' | 'guests' | 'payment' | 'activity'>('overview');

  // Studio Profile Form State
  const [settingsStudioName, setSettingsStudioName] = useState<string>(user?.studioName || '');
  const [settingsPhotographerName, setSettingsPhotographerName] = useState<string>(user?.name || '');
  const [settingsSlug, setSettingsSlug] = useState<string>(user?.partnerSlug || '');
  const [settingsPhone, setSettingsPhone] = useState<string>(user?.phone || '+91 9409360336');
  const [settingsEmail, setSettingsEmail] = useState<string>(user?.email || '');
  const [settingsCity, setSettingsCity] = useState<string>('Ahmedabad, Gujarat');
  const [settingsInstagram, setSettingsInstagram] = useState<string>('');
  const [settingsWebsite, setSettingsWebsite] = useState<string>('');
  const [settingsDescription, setSettingsDescription] = useState<string>('Specializing in luxury royal wedding photography, cinematic films, and digital guest portals.');
  const [settingsUpi, setSettingsUpi] = useState<string>(user?.payoutUpi || '');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string>('');

  // Studio Branding State
  const [brandAccentColor, setBrandAccentColor] = useState<string>('#0F766E');
  const [brandWelcomeNote, setBrandWelcomeNote] = useState<string>('Exclusive royal wedding invitation suites curated by our studio team.');
  const [brandSavedMsg, setBrandSavedMsg] = useState<string>('');

  const appOrigin = getCurrentAppOrigin();
  const partnerSlug = user?.partnerSlug || user?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'studio';
  const referralUrl = `${appOrigin}/?partner=${partnerSlug}`;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Authoritative Partner Data
  const loadDashboardData = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      if (UUID_REGEX.test(user.uid)) {
        const statsData = await fetchPartnerDashboardStats(user.uid);
        setStats(statsData);

        const { data: sitesData } = await supabase
          .from('wedding_sites')
          .select('*')
          .eq('partner_id', user.uid)
          .order('created_at', { ascending: false });

        if (sitesData) {
          setClientSites(sitesData);
        }

        const notifs = await fetchUserNotifications(user.uid);
        setNotifications(notifs);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.uid]);

  // Copy referral link
  const handleCopyReferral = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Copy specific invite link
  const handleCopyInviteLink = (slug: string, id: string) => {
    const link = `${appOrigin}/i/${slug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedInviteId(id);
      setTimeout(() => setCopiedInviteId(null), 2500);
    }
  };

  // Open Client Review Modal
  const handleOpenReviewModal = async (site: any) => {
    setReviewModalSite(site);
    setIsReviewModalOpen(true);
    setCopiedReviewLink(false);

    if (site.review_token) {
      setGeneratedReviewUrl(`${appOrigin}/review/${site.review_token}`);
    } else {
      setIsGeneratingReview(true);
      try {
        const res = await generateClientReviewToken(site.id, user.uid);
        setGeneratedReviewUrl(res.reviewUrl);
        await loadDashboardData();
      } catch (e) {
        console.error('Review token error:', e);
      } finally {
        setIsGeneratingReview(false);
      }
    }
  };

  // Open Duplication Modal
  const handleOpenDuplicateModal = (site: any) => {
    setDuplicateSourceSite(site);
    const groom = site.content?.couple?.groomEn || '';
    const bride = site.content?.couple?.brideEn || '';
    setDuplicateGroom(groom ? `${groom} (Copy)` : '');
    setDuplicateBride(bride ? `${bride}` : '');
    setIsDuplicateModalOpen(true);
  };

  // Execute Duplication
  const handleExecuteDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateSourceSite || !user?.uid) return;

    setIsDuplicating(true);
    const res = await duplicatePartnerInvitation(
      duplicateSourceSite.id,
      user.uid,
      duplicateGroom.trim(),
      duplicateBride.trim()
    );
    setIsDuplicating(false);

    if (res.success && res.newSite) {
      setIsDuplicateModalOpen(false);
      await loadDashboardData();
      onOpenClientStudio(res.newSite.id, res.newSite.content?.theme || 'rajmahal', res.newSite.content);
    } else {
      alert(res.error || 'Failed to duplicate invitation.');
    }
  };

  // Open Client Payment Tracking Modal
  const handleOpenPaymentTrackModal = (site: any) => {
    setPaymentTrackSite(site);
    setTrackPaymentStatus(site.client_payment_status || 'NOT_TRACKED');
    setTrackQuotedAmount(site.quoted_amount ? String(site.quoted_amount) : '');
    setIsPaymentTrackModalOpen(true);
  };

  // Save Client Payment Tracking
  const handleSavePaymentTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTrackSite || !user?.uid) return;

    setIsSavingPaymentTrack(true);
    const amt = trackQuotedAmount ? parseInt(trackQuotedAmount, 10) : undefined;
    const ok = await updateClientPaymentTracking(paymentTrackSite.id, user.uid, trackPaymentStatus, amt);
    setIsSavingPaymentTrack(false);

    if (ok) {
      setIsPaymentTrackModalOpen(false);
      await loadDashboardData();
    } else {
      alert('Failed to update client payment tracking.');
    }
  };

  // Resolve Client Change Requests
  const handleResolveFeedback = async () => {
    if (!feedbackModalSite || !user?.uid) return;
    setIsResolvingFeedback(true);
    try {
      await supabase.from('wedding_sites').update({
        workflow_status: 'PREVIEW_READY',
        updated_at: new Date().toISOString(),
      }).eq('id', feedbackModalSite.id);

      await supabase.from('change_requests').update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
      }).eq('wedding_site_id', feedbackModalSite.id);

      setIsFeedbackModalOpen(false);
      await loadDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResolvingFeedback(false);
    }
  };

  // Create Client Invitation
  const handleCreateClientInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !UUID_REGEX.test(user.uid) || !newGroomName.trim() || !newBrideName.trim()) return;

    setIsCreatingClient(true);
    setCreateErrorMsg('');

    try {
      const slug = `${newGroomName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${newBrideName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).slice(-4)}`;
      
      const initialProjectState: WeddingProjectState = {
        theme: newSelectedTheme,
        viewMode: 'desktop',
        previewZoom: 0.9,
        language: 'en',
        couple: {
          groomEn: newGroomName.trim(),
          groomHi: newGroomName.trim(),
          groomGu: newGroomName.trim(),
          brideEn: newBrideName.trim(),
          brideHi: newBrideName.trim(),
          brideGu: newBrideName.trim(),
          mark: `${newGroomName.trim()[0] || 'R'} & ${newBrideName.trim()[0] || 'I'}`,
          hashtag: `#${newGroomName.trim()}Weds${newBrideName.trim()}`,
          weddingDate: newWeddingDate || '2026-12-10',
          muhuratTime: '18:30',
          venueName: 'The Palace Gardens',
          venueAddress: 'Udaipur, Rajasthan',
          mapUrl: 'https://maps.google.com',
          customNote: 'A Royal Celebratory Affair',
        },
        family: {
          groomParentsEn: 'Royal Family',
          groomParentsHi: 'शाही परिवार',
          groomParentsGu: 'શાહી પરિવાર',
          brideParentsEn: 'Royal Heritage',
          brideParentsHi: 'शाही विरासत',
          brideParentsGu: 'શાહી વારસો',
          rsvp1Name: newGroomName.trim(),
          rsvp1Phone: newClientPhone.trim() || '+91 9409360336',
          rsvp2Name: 'Event Coordinator',
          rsvp2Phone: '+91 9409360336',
        },
        events: [
          {
            id: 'evt_1',
            name: 'Grand Royal Sangeet',
            nameHi: 'भव्य संगीत संध्या',
            nameGu: 'ભવ્ય સંગીત સંધ્યા',
            date: '2026-12-09',
            time: '19:00',
            venue: 'The Palace Gardens',
            color: '#C49A35',
            icon: 'music',
          },
          {
            id: 'evt_2',
            name: 'Shubh Vivah & Pheras',
            nameHi: 'शुभ विवाह एवं फेरे',
            nameGu: 'શુભ વિવાહ અને ફેરા',
            date: newWeddingDate || '2026-12-10',
            time: '18:30',
            venue: 'Jagmandir Island Palace',
            color: '#6E1020',
            icon: 'rings',
          },
        ],
        media: {
          audioName: 'FinalSong.mp3',
          audioBlob: null,
          bgMusicPreset: 'royal_shehnai',
          isMusicEnabled: true,
          photoSlots: {},
        },
        rsvpConfig: {
          enabled: true,
          collectPhone: true,
          collectGuestsCount: true,
          collectMealPreference: false,
          collectWishes: true,
        },
      };

      const res = await createPartnerClientInvitation({
        partnerId: user.uid,
        studioBadge: user.studioName || user.name || 'Studio Partner',
        groomName: newGroomName.trim(),
        brideName: newBrideName.trim(),
        clientPhone: newClientPhone.trim() || undefined,
        clientEmail: newClientEmail.trim() || undefined,
        partnerNotes: newPartnerNotes.trim() || undefined,
        selectedTheme: newSelectedTheme,
        weddingDate: newWeddingDate || undefined,
        initialProjectState,
        publishedSlug: slug,
      });

      if (!res.success || !res.site) {
        throw new Error(res.error || 'Unable to create the client invitation right now. Please try again.');
      }

      setIsNewClientModalOpen(false);
      setNewGroomName('');
      setNewBrideName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewPartnerNotes('');
      setWizardStep(1);

      await loadDashboardData();

      if (res.site) {
        onOpenClientStudio(res.site.id, newSelectedTheme, initialProjectState);
      }
    } catch (err: any) {
      console.error('Error creating client invitation:', err);
      setCreateErrorMsg(err.message || 'Unable to create the client invitation right now. Please try again.');
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Save Studio Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSavingSettings(true);
    setSettingsSuccessMsg('');
    try {
      const ok = await updatePartnerProfile(user.uid, {
        studioName: settingsStudioName.trim(),
        partnerSlug: settingsSlug.trim(),
        payoutUpi: settingsUpi.trim(),
      });
      if (ok) {
        setSettingsSuccessMsg('Studio profile and payout configuration saved successfully!');
        if (refreshUser) await refreshUser();
        setTimeout(() => setSettingsSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving studio profile:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandSavedMsg('Studio branding and welcome preferences updated!');
    setTimeout(() => setBrandSavedMsg(''), 4000);
  };

  // Filter & Search Logic for Invitations
  const filteredSites = clientSites.filter((site) => {
    const groom = site.content?.couple?.groomEn || '';
    const bride = site.content?.couple?.brideEn || '';
    const nameStr = `${groom} ${bride} ${site.published_url || ''} ${site.client_phone || ''}`.toLowerCase();
    const matchesSearch = nameStr.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (lifecycleFilter === 'all') return true;
    if (lifecycleFilter === 'LIVE') return site.status === 'published';
    return (site.workflow_status || 'DRAFT') === lifecycleFilter;
  });

  const sortedSites = [...filteredSites].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortBy === 'weddingDate') {
      const dateA = a.content?.couple?.weddingDate || '';
      const dateB = b.content?.couple?.weddingDate || '';
      return dateA.localeCompare(dateB);
    }
    const nameA = `${a.content?.couple?.groomEn || ''} ${a.content?.couple?.brideEn || ''}`;
    const nameB = `${b.content?.couple?.groomEn || ''} ${b.content?.couple?.brideEn || ''}`;
    return nameA.localeCompare(nameB);
  });

  const unreadNotifCount = notifications.filter((n) => !n.readAt).length;

  const studioInitials = (user?.studioName || user?.name)
    ? (user?.studioName || user?.name)
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AP';

  const tabLabels: Record<StudioWorkspaceTab, string> = {
    dashboard: 'Dashboard',
    invitations: 'My Invitations',
    finance: 'Finance & Billing',
    automation: 'Workflow Automations',
    clients: 'Clients CRM',
    commissions: 'Earnings & Payouts',
    analytics: 'Studio Analytics',
    marketing: 'Marketing Kit',
    profile: 'Studio Profile',
    branding: 'Studio Branding',
    domains: 'Custom Domains',
    team: 'Team Members',
    settings: 'Referral Settings',
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 flex font-manrope antialiased selection:bg-[#0F766E] selection:text-white">
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. PERSISTENT STUDIO NAVIGATION SIDEBAR (DESKTOP)                           */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-68 bg-[#11161B] text-stone-300 flex-col justify-between shrink-0 border-r border-stone-800 z-30 select-none">
        
        {/* Brand & Studio Card */}
        <div className="p-5 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5 mb-4">
            <img 
              src="/amantranlink.png" 
              alt="AmantranLink" 
              className="h-8 w-auto object-contain" 
            />
            <div>
              <span className="font-cormorant font-bold text-base text-white tracking-wide block leading-none">
                AMANTRAN<span className="text-[#C49A35]">LINK</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-wider uppercase block mt-0.5">
                ● STUDIO PARTNER
              </span>
            </div>
          </div>

          {/* Studio Identity Card */}
          <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800 flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.studioName || user.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#0F766E] shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs border border-emerald-500/40 shadow-2xs shrink-0">
                {studioInitials}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="font-semibold text-xs text-white truncate leading-tight">
                {user?.studioName || user?.name || 'Studio Partner'}
              </h4>
              <p className="text-[10px] font-mono text-stone-400 truncate mt-0.5">
                @{partnerSlug}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-400 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Partner Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          
          {/* Group 1: PRIMARY WORKSPACE */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold tracking-wider text-stone-500 uppercase block mb-1">
              WORKSPACE
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invitations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>My Invitations</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-stone-800 text-stone-400">
                {clientSites.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Clients CRM</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('commissions')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'commissions'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4" />
                <span>Earnings &amp; Payouts</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">
                ₹{stats.availableCredit || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('marketing')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4" />
                <span>Marketing Kit</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                4 ASSETS
              </span>
            </button>
          </div>

          {/* Group 2: STUDIO MANAGEMENT */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold tracking-wider text-stone-500 uppercase block mb-1">
              STUDIO MANAGEMENT
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Studio Profile</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4" />
                <span>Branding</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UsersRound className="w-4 h-4" />
                <span>Team Members</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-stone-400 bg-stone-800 px-1.5 py-0.2 rounded">
                SOON
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0F766E] text-white font-semibold shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Referral Settings</span>
              </div>
            </button>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-900/40 space-y-2 text-xs text-stone-400">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-stone-400" />
            <span>View Public AmantranLink</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (logout) await logout();
              onBackToHome();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN APPLICATION WORKSPACE (CLEAN SINGLE HEADER + ACTIVE CONTENT)         */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* CLEAN UTILITY HEADER (SINGLE SOURCE, NO DUPLICATE TABS) */}
        <StudioMainHeader
          partnerSlug={partnerSlug}
          onCopyReferral={handleCopyReferral}
          copiedReferral={copiedLink}
          notifications={notifications}
          onCreateInvitation={() => {
            setWizardStep(1);
            setIsNewClientModalOpen(true);
          }}
          onSelectTab={(tab) => setActiveTab(tab)}
          onViewPublicSite={onBackToHome}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activeTab={activeTab}
        />

        {/* WORKSPACE MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: 📊 DASHBOARD OVERVIEW                                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              
              {/* Personalized Hero Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                    Good day, {user?.studioName || user?.name || 'Studio Partner'}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Manage your wedding projects, clients, and studio activity.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStep(1);
                      setIsNewClientModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Client Invitation</span>
                  </button>
                </div>
              </div>

              {/* Summary KPIs with Visual Hierarchy (Hero Balance Card First) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hero Card: Available Balance */}
                <div className="p-5 bg-gradient-to-br from-emerald-900 to-[#0F766E] text-white rounded-3xl border border-emerald-700/60 shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider">Available Balance</span>
                    <Wallet className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-bold tracking-tight">₹{isLoading ? '...' : (stats.availableCredit || 0)}</div>
                    <span className="text-[11px] text-emerald-100">Ready for instant bank / UPI payout</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('commissions')}
                    className="self-start text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer mt-1"
                  >
                    <span>Withdraw Funds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metric 2: Active Projects */}
                <div className="p-5 bg-white rounded-3xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Active Projects</span>
                    <FileText className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-bold text-stone-900">{isLoading ? '...' : clientSites.length}</div>
                    <span className="text-[11px] text-stone-500">{stats.liveWeddings || 0} Live • {clientSites.length - (stats.liveWeddings || 0)} Drafts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invitations')}
                    className="self-start text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metric 3: Total Clients */}
                <div className="p-5 bg-white rounded-3xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Total Clients</span>
                    <Users className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-bold text-stone-900">{isLoading ? '...' : clientSites.length}</div>
                    <span className="text-[11px] text-stone-500">Managed Wedding Couples</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('clients')}
                    className="self-start text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage CRM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metric 4: This Month Earnings */}
                <div className="p-5 bg-white rounded-3xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">This Month</span>
                    <DollarSign className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-bold text-stone-900">₹{isLoading ? '...' : (stats.totalCommission || 0)}</div>
                    <span className="text-[11px] text-stone-500">Earned from Client Bookings</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700">Wholesale Tier: ₹899</span>
                </div>
              </div>

              {/* Second Section: Recent Client Projects & Studio Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Projects Table (Col 8) */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-stone-900">Recent Client Projects</h3>
                      <p className="text-xs text-stone-500 mt-0.5">Latest wedding portals created by your studio</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('invitations')}
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {clientSites.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F766E] flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-800">YOUR STUDIO IS READY</h4>
                        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                          Create your first wedding invitation and start managing client projects from one place.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWizardStep(1);
                          setIsNewClientModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Your First Invitation</span>
                      </button>
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200/60 max-w-lg mx-auto text-left">
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                          <span className="text-[10px] font-mono font-bold text-emerald-700">01</span>
                          <p className="text-xs font-semibold text-stone-800 mt-0.5">Create Client</p>
                          <span className="text-[10px] text-stone-400">Add couple info</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                          <span className="text-[10px] font-mono font-bold text-emerald-700">02</span>
                          <p className="text-xs font-semibold text-stone-800 mt-0.5">Choose Theme</p>
                          <span className="text-[10px] text-stone-400">Select 7 Royal styles</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                          <span className="text-[10px] font-mono font-bold text-emerald-700">03</span>
                          <p className="text-xs font-semibold text-stone-800 mt-0.5">Publish</p>
                          <span className="text-[10px] text-stone-400">Review &amp; go live</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-stone-100 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="pb-3 px-2">Couple</th>
                            <th className="pb-3 px-2">Theme</th>
                            <th className="pb-3 px-2">Status</th>
                            <th className="pb-3 px-2">Wedding Date</th>
                            <th className="pb-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {clientSites.slice(0, 5).map((site) => {
                            const groom = site.content?.couple?.groomEn || 'Groom';
                            const bride = site.content?.couple?.brideEn || 'Bride';
                            const couple = `${groom} & ${bride}`;
                            const isLive = site.status === 'published';
                            const workflowStatus = site.workflow_status || (isLive ? 'LIVE' : 'DRAFT');

                            return (
                              <tr key={site.id} className="hover:bg-stone-50/70 transition-colors">
                                <td className="py-3 px-2 font-semibold text-stone-900">{couple}</td>
                                <td className="py-3 px-2 text-stone-600 capitalize">{site.content?.theme || 'rajmahal'}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    isLive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
                                  }`}>
                                    {workflowStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-stone-500 font-mono text-[11px]">{site.content?.couple?.weddingDate || '2026-12-10'}</td>
                                <td className="py-3 px-2 text-right space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onOpenClientStudio(site.id, site.content?.theme || 'rajmahal', site.content)}
                                    className="px-2.5 py-1 rounded-lg bg-[#0F766E] text-white text-[11px] font-semibold inline-flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Open</span>
                                  </button>
                                  <InvitationActionMenu
                                    site={site}
                                    onOpenStudio={() => onOpenClientStudio(site.id, site.content?.theme || 'rajmahal', site.content)}
                                    onSendReview={() => handleOpenReviewModal(site)}
                                    onViewFeedback={() => {
                                      setFeedbackModalSite(site);
                                      setIsFeedbackModalOpen(true);
                                    }}
                                    onDuplicate={() => handleOpenDuplicateModal(site)}
                                    onTrackPayment={() => handleOpenPaymentTrackModal(site)}
                                    onCopyLink={() => handleCopyInviteLink(site.published_url || site.slug || '', site.id)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Studio Performance & Actionable Insights (Col 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Studio Performance Insights Card */}
                  <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                    <h3 className="font-bold text-base text-stone-900">Studio Insights</h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-stone-500 font-medium block">Wholesale Rate</span>
                          <span className="font-bold text-stone-900 text-sm">₹899 / Wedding</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Save ₹400
                        </span>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-stone-500 font-medium block">Pending Client Reviews</span>
                          <span className="font-bold text-stone-900 text-sm">
                            {clientSites.filter(s => s.workflow_status === 'REVIEW_PENDING' || s.workflow_status === 'SENT_FOR_REVIEW').length} Awaiting Feedback
                          </span>
                        </div>
                        <Send className="w-4 h-4 text-stone-400" />
                      </div>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-stone-500 font-medium block">Approved Projects</span>
                          <span className="font-bold text-stone-900 text-sm">
                            {clientSites.filter(s => s.workflow_status === 'CLIENT_APPROVED').length} Ready to Publish
                          </span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Tip: Share your studio referral link on client WhatsApp groups to earn 30% direct attribution on every guest booking.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: 📁 MY INVITATIONS (WEDDING PROJECTS WORKSPACE)              */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'invitations' && (() => {
            const draftsCount = clientSites.filter(s => (s.workflow_status || s.status) === 'DRAFT' || s.status === 'draft').length;
            const reviewCount = clientSites.filter(s => s.workflow_status === 'REVIEW_PENDING' || s.workflow_status === 'SENT_FOR_REVIEW').length;
            const changesCount = clientSites.filter(s => s.workflow_status === 'CHANGES_REQUESTED' || Boolean(s.client_feedback)).length;
            const approvedCount = clientSites.filter(s => s.workflow_status === 'CLIENT_APPROVED').length;
            const liveCount = clientSites.filter(s => s.status === 'published' || s.workflow_status === 'LIVE').length;

            const attentionItems = clientSites.filter(s => 
              s.workflow_status === 'CHANGES_REQUESTED' || 
              Boolean(s.client_feedback) || 
              s.workflow_status === 'CLIENT_APPROVED' || 
              s.client_payment_status === 'PENDING'
            );

            return (
              <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                      My Invitations
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      Manage and deliver wedding invitation projects for your clients.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWizardStep(1);
                        setIsNewClientModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Client Invitation</span>
                    </button>
                  </div>
                </div>

                {/* 2. Compact Project Overview (Filter Navigation Bar) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'all'
                        ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <span>All Projects</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'all' ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {clientSites.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('DRAFT')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'DRAFT'
                        ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <span>Drafts</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'DRAFT' ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {draftsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('SENT_FOR_REVIEW')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'SENT_FOR_REVIEW'
                        ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <span>Awaiting Review</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'SENT_FOR_REVIEW' ? 'bg-stone-800 text-stone-200' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {reviewCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('CHANGES_REQUESTED')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'CHANGES_REQUESTED'
                        ? 'bg-amber-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    <span>Changes Requested</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'CHANGES_REQUESTED' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {changesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('CLIENT_APPROVED')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'CLIENT_APPROVED'
                        ? 'bg-emerald-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-emerald-900 hover:bg-emerald-50'
                    }`}
                  >
                    <span>Ready to Publish</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'CLIENT_APPROVED' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {approvedCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLifecycleFilter('LIVE')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      lifecycleFilter === 'LIVE'
                        ? 'bg-emerald-900 text-white font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-emerald-900 hover:bg-emerald-50'
                    }`}
                  >
                    <span>Live</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      lifecycleFilter === 'LIVE' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {liveCount}
                    </span>
                  </button>
                </div>

                {/* 3. NEEDS YOUR ATTENTION SECTION (Only rendered when there are items requiring attention) */}
                {attentionItems.length > 0 && lifecycleFilter === 'all' && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>Needs Your Attention ({attentionItems.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {attentionItems.map((item) => {
                        const groom = item.content?.couple?.groomEn || 'Groom';
                        const bride = item.content?.couple?.brideEn || 'Bride';
                        const couple = `${groom} & ${bride}`;
                        const isChanges = item.workflow_status === 'CHANGES_REQUESTED' || Boolean(item.client_feedback);
                        const isApproved = item.workflow_status === 'CLIENT_APPROVED';

                        return (
                          <div key={item.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate">{couple}</h4>
                              <p className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                                {isChanges ? 'Client requested changes on invitation design' : isApproved ? 'Design approved by couple · Ready to publish' : 'Payment pending on client booking'}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {isChanges ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFeedbackModalSite(item);
                                    setIsFeedbackModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Review Changes</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenClientStudio(item.id, item.content?.theme || 'rajmahal', item.content)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Publish Invitation</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPaymentTrackModal(item)}
                                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View Payment</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search invitations, clients or wedding names..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E] bg-stone-50/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <select
                      value={lifecycleFilter}
                      onChange={(e) => setLifecycleFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SENT_FOR_REVIEW">Awaiting Review</option>
                      <option value="CHANGES_REQUESTED">Changes Requested</option>
                      <option value="CLIENT_APPROVED">Ready to Publish</option>
                      <option value="LIVE">Live Published</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Sort: Recently Updated</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="weddingDate">Sort: Wedding Date</option>
                      <option value="name">Sort: Couple Name</option>
                    </select>
                  </div>
                </div>

                {/* 5. Structured Project List Design */}
                {sortedSites.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-2xs space-y-4">
                    {clientSites.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0F766E] flex items-center justify-center mx-auto shadow-2xs">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-stone-900">YOUR FIRST CLIENT PROJECT STARTS HERE</h3>
                          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                            Create a wedding invitation, personalize it for your client and manage the entire journey from one workspace.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWizardStep(1);
                            setIsNewClientModalOpen(true);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Create First Invitation</span>
                        </button>
                        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-stone-100 text-left">
                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                            <span className="text-[10px] font-mono font-bold text-[#0F766E]">01</span>
                            <p className="text-xs font-semibold text-stone-800 mt-0.5">Add Client</p>
                            <span className="text-[10px] text-stone-400">Couple contacts</span>
                          </div>
                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                            <span className="text-[10px] font-mono font-bold text-[#0F766E]">02</span>
                            <p className="text-xs font-semibold text-stone-800 mt-0.5">Choose Theme</p>
                            <span className="text-[10px] text-stone-400">7 Royal styles</span>
                          </div>
                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                            <span className="text-[10px] font-mono font-bold text-[#0F766E]">03</span>
                            <p className="text-xs font-semibold text-stone-800 mt-0.5">Send Review</p>
                            <span className="text-[10px] text-stone-400">Client approval</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 text-stone-300 mx-auto" />
                        <h3 className="text-sm font-semibold text-stone-800">No wedding projects match this filter</h3>
                        <p className="text-xs text-stone-500">Try clearing your search query or selecting "All Statuses".</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setLifecycleFilter('all');
                          }}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#0F766E] hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSites.map((site) => {
                      const groom = site.content?.couple?.groomEn || 'Groom';
                      const bride = site.content?.couple?.brideEn || 'Bride';
                      const couple = `${groom} & ${bride}`;
                      const isLive = site.status === 'published';
                      const workflowStatus = site.workflow_status || (isLive ? 'LIVE' : 'DRAFT');
                      const themeId = site.content?.theme || 'rajmahal';
                      const themeObj = themes.find(t => t.id === themeId);
                      const themeName = themeObj?.name || 'The Rajmahal';
                      const weddingDate = site.content?.couple?.weddingDate || '2026-12-20';
                      const lastUpdatedText = site.updated_at 
                        ? new Date(site.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'Recently';

                      // Status semantic configuration
                      let statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                          <span>Draft</span>
                        </span>
                      );
                      let primaryAction = (
                        <button
                          type="button"
                          onClick={() => onOpenClientStudio(site.id, themeId, site.content)}
                          className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Continue Editing</span>
                        </button>
                      );

                      if (workflowStatus === 'CHANGES_REQUESTED' || Boolean(site.client_feedback)) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Changes Requested</span>
                          </span>
                        );
                        primaryAction = (
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackModalSite(site);
                              setIsFeedbackModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Review Changes</span>
                          </button>
                        );
                      } else if (workflowStatus === 'CLIENT_APPROVED') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ready to Publish</span>
                          </span>
                        );
                        primaryAction = (
                          <button
                            type="button"
                            onClick={() => onOpenClientStudio(site.id, themeId, site.content)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Publish Invitation</span>
                          </button>
                        );
                      } else if (workflowStatus === 'SENT_FOR_REVIEW' || workflowStatus === 'REVIEW_PENDING') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span>Awaiting Review</span>
                          </span>
                        );
                        primaryAction = (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(site)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>View Review Status</span>
                          </button>
                        );
                      } else if (isLive || workflowStatus === 'LIVE') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Live</span>
                          </span>
                        );
                        primaryAction = (
                          <button
                            type="button"
                            onClick={() => onOpenClientStudio(site.id, themeId, site.content)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Project</span>
                          </button>
                        );
                      }

                      return (
                        <div
                          key={site.id}
                          className="bg-white hover:bg-stone-50/80 rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          {/* Left: Thumbnail & Project Meta */}
                          <div 
                            className="flex items-center gap-4 cursor-pointer min-w-0 flex-1"
                            onClick={() => {
                              setSelectedProjectDetailSite(site);
                              setProjectDetailTab('overview');
                            }}
                          >
                            {/* Refined Small Theme Thumbnail */}
                            <div className="w-14 h-14 rounded-xl bg-stone-900 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform">
                              {themeObj?.previewImg ? (
                                <img
                                  src={themeObj.previewImg}
                                  alt={themeName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span>{themeObj?.icon || '🏰'}</span>
                              )}
                            </div>

                            {/* Project Identification */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#0F766E] transition-colors truncate">
                                  {couple}
                                </h3>
                                <div className="sm:hidden">{statusBadge}</div>
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2 truncate">
                                <span className="font-medium text-stone-700">{themeName}</span>
                                <span>•</span>
                                <span>Wedding: {weddingDate}</span>
                              </p>
                              <span className="text-[11px] text-stone-400 block mt-0.5">
                                Last updated: {lastUpdatedText}
                              </span>
                            </div>
                          </div>

                          {/* Center: Desktop Status Badge */}
                          <div 
                            className="hidden sm:flex items-center justify-center shrink-0 cursor-pointer"
                            onClick={() => {
                              setSelectedProjectDetailSite(site);
                              setProjectDetailTab('overview');
                            }}
                          >
                            {statusBadge}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                            {primaryAction}
                            <InvitationActionMenu
                              site={site}
                              onOpenStudio={() => onOpenClientStudio(site.id, themeId, site.content)}
                              onSendReview={() => handleOpenReviewModal(site)}
                              onViewFeedback={() => {
                                setFeedbackModalSite(site);
                                setIsFeedbackModalOpen(true);
                              }}
                              onDuplicate={() => handleOpenDuplicateModal(site)}
                              onTrackPayment={() => handleOpenPaymentTrackModal(site)}
                              onCopyLink={() => handleCopyInviteLink(site.published_url || site.slug || '', site.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })()}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: 👥 CLIENTS CRM                                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'clients' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-stone-900">Clients CRM</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Manage your wedding clients, contact details, and project lifecycles.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWizardStep(1);
                    setIsNewClientModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Client</span>
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Search clients by name, couple, phone, email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-stone-500 font-medium">
                    {clientSites.length} Total Client{clientSites.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                {clientSites.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <Users className="w-8 h-8 text-stone-300 mx-auto" />
                    <h3 className="text-sm font-semibold text-stone-700">No clients registered</h3>
                    <p className="text-xs text-stone-500">Create a new invitation to add your first wedding client.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-6">Client Couple</th>
                          <th className="py-3.5 px-4">Wedding Date</th>
                          <th className="py-3.5 px-4">Phone / WhatsApp</th>
                          <th className="py-3.5 px-4">Email</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {clientSites
                          .filter((site) => {
                            if (!clientSearchQuery.trim()) return true;
                            const q = clientSearchQuery.toLowerCase();
                            const couple = `${site.content?.couple?.groomEn || ''} ${site.content?.couple?.brideEn || ''}`.toLowerCase();
                            const phone = (site.client_phone || '').toLowerCase();
                            const email = (site.client_email || '').toLowerCase();
                            return couple.includes(q) || phone.includes(q) || email.includes(q);
                          })
                          .map((site) => {
                            const groom = site.content?.couple?.groomEn || 'Groom';
                            const bride = site.content?.couple?.brideEn || 'Bride';
                            const couple = `${groom} & ${bride}`;
                            const phone = site.client_phone || site.content?.client_phone || null;
                            const email = site.client_email || site.content?.client_email || null;

                            return (
                              <tr 
                                key={site.id} 
                                className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedClientProfileSite(site);
                                  setClientProfileTab('overview');
                                }}
                              >
                                <td className="py-4 px-6 font-semibold text-stone-900 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{couple}</span>
                                    <span className="text-[10px] text-stone-400 font-normal">View Profile →</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-stone-600">{site.content?.couple?.weddingDate || '2026-12-10'}</td>
                                <td className="py-4 px-4 text-stone-600 font-mono">{phone || '—'}</td>
                                <td className="py-4 px-4 text-stone-600">{email || '—'}</td>
                                <td className="py-4 px-4">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                                    {site.workflow_status || 'DRAFT'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                  {phone && (
                                    <a
                                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-emerald-300 text-emerald-700 text-xs font-medium transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReviewModal(site)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Review</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedClientProfileSite(site);
                                      setClientProfileTab('overview');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-medium transition-colors cursor-pointer"
                                  >
                                    <span>Profile</span>
                                  </button>
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: 💰 EARNINGS & PAYOUTS                                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'commissions' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <PartnerSettlementTab />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: 📈 STUDIO ANALYTICS                                        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <PartnerAnalyticsTab 
                clientSitesCount={clientSites.length}
                onCreateInvitation={() => {
                  setWizardStep(1);
                  setIsNewClientModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: 📢 MARKETING KIT                                            */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <PartnerMarketingTab 
                onCreateInvitation={() => {
                  setWizardStep(1);
                  setIsNewClientModalOpen(true);
                }}
                onNavigateAnalytics={() => setActiveTab('analytics')}
                onNavigateEarnings={() => setActiveTab('commissions')}
                onNavigateSettings={() => setActiveTab('settings')}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 7: 🏢 STUDIO PROFILE                                          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Studio Profile</h1>
                <p className="text-xs text-stone-500 mt-1">Manage your studio identity, contact details, and client display information</p>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Studio Business Name</label>
                    <input
                      type="text"
                      value={settingsStudioName}
                      onChange={(e) => setSettingsStudioName(e.target.value)}
                      required
                      placeholder="e.g. Aryan Patel Photography"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Photographer / Owner Name</label>
                    <input
                      type="text"
                      value={settingsPhotographerName}
                      onChange={(e) => setSettingsPhotographerName(e.target.value)}
                      placeholder="e.g. Aryan Patel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      placeholder="+91 9409360336"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      placeholder="studio@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City / Base Location</label>
                    <input
                      type="text"
                      value={settingsCity}
                      onChange={(e) => setSettingsCity(e.target.value)}
                      placeholder="e.g. Udaipur / Mumbai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={settingsInstagram}
                      onChange={(e) => setSettingsInstagram(e.target.value)}
                      placeholder="@aryanpatelphotography"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Studio Description</label>
                  <textarea
                    rows={3}
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                    placeholder="Short summary for client wedding portals..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                >
                  {isSavingSettings ? 'Saving Profile...' : 'Save Studio Profile'}
                </button>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: 💰 STUDIO BUSINESS FINANCE & BILLING (PHASE 9)               */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <StudioFinanceWorkspace studioId={user?.uid || 'default_studio'} />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: ⚡ WORKFLOW AUTOMATIONS & REMINDERS (PHASE 11)                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <AutomationCenterWorkspace 
                userId={user?.uid || 'default_studio'} 
                userRole="partner"
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 8: 🎨 STUDIO BRANDING                                         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <StudioBrandingView studioId={user?.uid || 'default_studio'} />
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="space-y-6">
              <CustomDomainsView studioId={user?.uid || 'default_studio'} />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 9: 👥 TEAM MEMBERS (COMING SOON ARCHITECTURE)                 */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'team' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Studio Team Members</h1>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Collaborate with associate photographers, designers, and project managers</p>
              </div>

              <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-stone-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      {studioInitials}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">{user?.name || 'Studio Owner'}</span>
                      <span className="text-[10px] text-stone-500">{user?.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    OWNER
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between text-xs text-stone-400">
                  <div>
                    <span className="font-semibold text-stone-500 block">Manager / Editor Roles</span>
                    <span className="text-[10px]">Granular invitation editing permissions will be enabled soon</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    PLANNED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 10: ⚙️ REFERRAL SETTINGS                                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Referral &amp; Payout Settings</h1>
                <p className="text-xs text-stone-500 mt-1">Configure your custom referral URL slug and UPI payout destination</p>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Custom Studio Partner Slug</label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-2.5 bg-stone-100 border border-r-0 border-stone-200 rounded-l-xl text-xs text-stone-500 font-mono">
                      {appOrigin}/?partner=
                    </span>
                    <input
                      type="text"
                      value={settingsSlug}
                      onChange={(e) => setSettingsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                      placeholder="aryan-photography"
                      className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-stone-200 text-xs text-stone-900 font-mono focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">UPI Payout Address (Instant Settlement)</label>
                  <input
                    type="text"
                    value={settingsUpi}
                    onChange={(e) => setSettingsUpi(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9409360336@upi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 font-mono focus:outline-none focus:border-[#0F766E]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">All verified commercial earnings will settle to this UPI VPA.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                >
                  {isSavingSettings ? 'Saving Settings...' : 'Update Referral Settings'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. MODALS (CREATE WIZARD, REVIEW, DUPLICATE, FEEDBACK, PAYMENT)             */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {/* CREATE INVITATION 2-STEP MODAL */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  {wizardStep === 1 ? 'Step 1: Client & Wedding Details' : 'Step 2: Select Royal Theme'}
                </h3>
                <span className="text-xs text-stone-500 font-mono">Wholesale ₹899 Partner Rate</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {createErrorMsg}
              </div>
            )}

            {wizardStep === 1 ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newGroomName.trim() || !newBrideName.trim()) return;
                  setWizardStep(2);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Groom Name *</label>
                    <input
                      type="text"
                      value={newGroomName}
                      onChange={(e) => setNewGroomName(e.target.value)}
                      required
                      placeholder="e.g. Aryan"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Bride Name *</label>
                    <input
                      type="text"
                      value={newBrideName}
                      onChange={(e) => setNewBrideName(e.target.value)}
                      required
                      placeholder="e.g. Riya"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Client Phone / WA</label>
                    <input
                      type="text"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+91 9409360336"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Wedding Date</label>
                    <input
                      type="date"
                      value={newWeddingDate}
                      onChange={(e) => setNewWeddingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider shadow-2xs"
                >
                  Continue to Theme Selection →
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateClientInvitation} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewSelectedTheme(t.id as ThemeId)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        newSelectedTheme === t.id
                          ? 'border-[#0F766E] bg-emerald-50/50 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-stone-900 block">{t.name}</span>
                      <span className="text-[10px] text-stone-500 block">{t.tagline || t.description || 'Royal Theme'}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isCreatingClient}
                    onClick={() => setWizardStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingClient}
                    className="flex-2 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isCreatingClient ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Invitation...</span>
                      </>
                    ) : (
                      <span>Create & Open Studio</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REVIEW LINK MODAL */}
      {isReviewModalOpen && reviewModalSite && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Client Review Token</h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Share this secure link with the couple. They can review the design, approve, or request text/photo changes directly.
            </p>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 break-all select-all">
              {isGeneratingReview ? 'Generating token...' : generatedReviewUrl}
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(generatedReviewUrl);
                  setCopiedReviewLink(true);
                  setTimeout(() => setCopiedReviewLink(false), 2500);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copiedReviewLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReviewLink ? 'Review Link Copied!' : 'Copy Review Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DUPLICATE INVITATION MODAL */}
      {isDuplicateModalOpen && duplicateSourceSite && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Duplicate Invitation</h3>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteDuplicate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">New Groom Name</label>
                <input
                  type="text"
                  value={duplicateGroom}
                  onChange={(e) => setDuplicateGroom(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">New Bride Name</label>
                <input
                  type="text"
                  value={duplicateBride}
                  onChange={(e) => setDuplicateBride(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <button
                type="submit"
                disabled={isDuplicating}
                className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold uppercase tracking-wider"
              >
                {isDuplicating ? 'Duplicating...' : 'Duplicate & Open in Studio'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT TRACKING MODAL */}
      {isPaymentTrackModalOpen && paymentTrackSite && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Track Client Payment</h3>
              <button
                type="button"
                onClick={() => setIsPaymentTrackModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePaymentTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Client Payment Status</label>
                <select
                  value={trackPaymentStatus}
                  onChange={(e) => setTrackPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                >
                  <option value="NOT_TRACKED">Not Tracked</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="PAID">Fully Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quoted Amount (₹)</label>
                <input
                  type="number"
                  value={trackQuotedAmount}
                  onChange={(e) => setTrackQuotedAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingPaymentTrack}
                className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold uppercase tracking-wider"
              >
                {isSavingPaymentTrack ? 'Saving...' : 'Save Payment Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT PROFILE MODAL */}
      {selectedClientProfileSite && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Client Profile
                </span>
                <h3 className="font-bold text-lg text-stone-900 mt-1">
                  {selectedClientProfileSite.content?.couple?.groomEn || 'Groom'} &amp; {selectedClientProfileSite.content?.couple?.brideEn || 'Bride'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Wedding Date: {selectedClientProfileSite.content?.couple?.weddingDate || '2026-12-10'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientProfileSite(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs Navigation */}
            <div className="flex border-b border-stone-100 space-x-1">
              {(['overview', 'invitations', 'activity', 'payments'] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setClientProfileTab(tabKey)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    clientProfileTab === tabKey
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tabKey === 'overview' && 'Overview'}
                  {tabKey === 'invitations' && 'Invitations'}
                  {tabKey === 'activity' && 'Activity'}
                  {tabKey === 'payments' && 'Payments'}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Overview */}
            {clientProfileTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Phone / WhatsApp</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block">{selectedClientProfileSite.client_phone || selectedClientProfileSite.content?.client_phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Email</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block">{selectedClientProfileSite.client_email || selectedClientProfileSite.content?.client_email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Venue</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block">{selectedClientProfileSite.content?.couple?.venueName || 'The Palace Gardens'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Selected Theme</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block capitalize">{selectedClientProfileSite.content?.theme || 'Rajmahal'}</span>
                  </div>
                </div>

                {selectedClientProfileSite.partner_notes && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold block text-[11px] mb-0.5">Studio Notes:</span>
                    <p>{selectedClientProfileSite.partner_notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const site = selectedClientProfileSite;
                      setSelectedClientProfileSite(null);
                      onOpenClientStudio(site.id, site.content?.theme || 'rajmahal', site.content);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F766E] text-white font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Open in Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const site = selectedClientProfileSite;
                      setSelectedClientProfileSite(null);
                      handleOpenReviewModal(site);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#0F766E]" />
                    <span>Send Review to Couple</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Invitations */}
            {clientProfileTab === 'invitations' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 block text-sm">
                      {selectedClientProfileSite.content?.couple?.groomEn} &amp; {selectedClientProfileSite.content?.couple?.brideEn}
                    </span>
                    <span className="text-stone-500 font-mono text-[11px] capitalize">
                      Theme: {selectedClientProfileSite.content?.theme || 'rajmahal'} • {selectedClientProfileSite.status === 'published' ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const site = selectedClientProfileSite;
                        setSelectedClientProfileSite(null);
                        onOpenClientStudio(site.id, site.content?.theme || 'rajmahal', site.content);
                      }}
                      className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const site = selectedClientProfileSite;
                        setSelectedClientProfileSite(null);
                        handleOpenDuplicateModal(site);
                      }}
                      className="px-3 py-1.5 border border-stone-200 rounded-lg font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Activity */}
            {clientProfileTab === 'activity' && (
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400">{new Date(selectedClientProfileSite.created_at || Date.now()).toLocaleDateString()}</span>
                  <p className="font-semibold text-stone-800">Client project created</p>
                  <p className="text-stone-500 text-[11px]">Invitation suite initialized by studio.</p>
                </div>
                {selectedClientProfileSite.review_token && (
                  <div className="border-l-2 border-teal-500 pl-3 py-1 space-y-1">
                    <span className="text-[10px] font-mono text-teal-600">Review Active</span>
                    <p className="font-semibold text-stone-800">Review token generated</p>
                    <p className="text-stone-500 text-[11px]">Secure client feedback URL is live.</p>
                  </div>
                )}
                {selectedClientProfileSite.workflow_status === 'CLIENT_APPROVED' && (
                  <div className="border-l-2 border-emerald-600 pl-3 py-1 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-600">Approved</span>
                    <p className="font-semibold text-emerald-900">Couple approved invitation design</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Payments */}
            {clientProfileTab === 'payments' && (
              <div className="space-y-4 text-xs">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Status:</span>
                    <span className="font-bold text-stone-800 uppercase">{selectedClientProfileSite.client_payment_status || 'NOT_TRACKED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Quoted Amount:</span>
                    <span className="font-bold text-stone-800 font-mono">₹{selectedClientProfileSite.quoted_amount || '—'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const site = selectedClientProfileSite;
                    setSelectedClientProfileSite(null);
                    handleOpenPaymentTrackModal(site);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white font-semibold cursor-pointer"
                >
                  Update Payment Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 👑 DEDICATED PROJECT WORKSPACE MODAL (5 TABS)                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {selectedProjectDetailSite && (() => {
        const site = selectedProjectDetailSite;
        const groom = site.content?.couple?.groomEn || 'Groom';
        const bride = site.content?.couple?.brideEn || 'Bride';
        const couple = `${groom} & ${bride}`;
        const themeId = site.content?.theme || 'rajmahal';
        const themeObj = themes.find(t => t.id === themeId);
        const themeName = themeObj?.name || 'The Rajmahal';
        const isLive = site.status === 'published';
        const workflowStatus = site.workflow_status || (isLive ? 'LIVE' : 'DRAFT');

        return (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="p-6 bg-stone-900 text-white flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold tracking-tight">{couple}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/15 text-white">
                      {workflowStatus}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
                    <span>Wedding: {site.content?.couple?.weddingDate || '2026-12-20'}</span>
                    <span>•</span>
                    <span>{themeName}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProjectDetailSite(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 5 Tab Navigation */}
              <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-6 text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('overview')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'overview'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('invitation')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'invitation'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('review')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'review'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Client Review
                </button>
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('guests')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'guests'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Guests &amp; RSVP
                </button>
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('payment')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'payment'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Payment
                </button>
                <button
                  type="button"
                  onClick={() => setProjectDetailTab('activity')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    projectDetailTab === 'activity'
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
                
                {/* 1. Overview */}
                {projectDetailTab === 'overview' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold">Couple</span>
                        <p className="font-semibold text-stone-900 text-sm mt-0.5">{couple}</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">Phone: {site.client_phone || '—'}</p>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold">Theme</span>
                        <p className="font-semibold text-stone-900 text-sm mt-0.5">{themeName}</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">Wholesale Rate: ₹899</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Wedding Details</span>
                      <p className="text-stone-800"><strong className="text-stone-900">Date:</strong> {site.content?.couple?.weddingDate || '2026-12-20'}</p>
                      <p className="text-stone-800"><strong className="text-stone-900">Venue:</strong> {site.content?.events?.[0]?.venueName || 'The Leela Palace, Udaipur'}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectDetailSite(null);
                          onOpenClientStudio(site.id, themeId, site.content);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Open in Studio Customizer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectDetailSite(null);
                          handleOpenReviewModal(site);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Review</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Invitation */}
                {projectDetailTab === 'invitation' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="w-16 h-16 rounded-xl bg-stone-900 flex items-center justify-center text-2xl overflow-hidden border border-stone-200 shrink-0">
                        {themeObj?.previewImg ? (
                          <img src={themeObj.previewImg} alt={themeName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{themeObj?.icon || '🏰'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{themeName}</h4>
                        <p className="text-stone-500 text-[11px] mt-0.5">{themeObj?.tagline || 'Royal Indian Wedding Invitation'}</p>
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Wholesale Price: ₹899 (Save ₹400)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Public URL</span>
                      <p className="font-mono text-stone-800 text-[11px] mt-1 break-all select-all">
                        {site.published_url || `${getCurrentAppOrigin()}/w/${site.slug || site.id}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectDetailSite(null);
                        onOpenClientStudio(site.id, themeId, site.content);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Invitation in Customizer</span>
                    </button>
                  </div>
                )}

                {/* 3. Client Review */}
                {projectDetailTab === 'review' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Review Status:</span>
                        <span className="font-bold text-stone-900 uppercase">{workflowStatus}</span>
                      </div>
                      {site.review_token && (
                        <div className="pt-2 border-t border-stone-200">
                          <span className="text-stone-500 block text-[10px] uppercase font-bold">Review Link</span>
                          <p className="font-mono text-[11px] text-teal-800 bg-teal-50 p-2 rounded-lg break-all mt-1">
                            {`${getCurrentAppOrigin()}/review/${site.review_token}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {site.client_feedback && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                        <span className="text-amber-900 font-bold text-[10px] uppercase">Client Feedback</span>
                        <p className="text-stone-800 text-xs italic">"{site.client_feedback}"</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectDetailSite(null);
                        handleOpenReviewModal(site);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{site.review_token ? 'Share / Copy Review Link' : 'Generate Review Token'}</span>
                    </button>
                  </div>
                )}

                {/* 3. Guests & RSVP Management */}
                {projectDetailTab === 'guests' && (
                  <div className="space-y-4 text-xs bg-[#120306] -m-6 p-6 rounded-b-3xl">
                    <GuestManagementView
                      state={site.content || { couple: { groomEn: groom, brideEn: bride } }}
                      weddingSiteId={site.id}
                      userId={user?.uid || 'partner_user'}
                      weddingSlug={site.slug || `${groom.toLowerCase()}-${bride.toLowerCase()}`}
                    />
                  </div>
                )}

                {/* 4. Payment */}
                {projectDetailTab === 'payment' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Payment Status:</span>
                        <span className="font-bold text-stone-900 uppercase">{site.client_payment_status || 'NOT_TRACKED'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Quoted Client Price:</span>
                        <span className="font-bold text-stone-900 font-mono">₹{site.quoted_amount || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Studio Wholesale Price:</span>
                        <span className="font-bold text-emerald-800 font-mono">₹899 (Save ₹400)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectDetailSite(null);
                        handleOpenPaymentTrackModal(site);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white font-semibold cursor-pointer"
                    >
                      Update Payment Status
                    </button>
                  </div>
                )}

                {/* 5. Activity */}
                {projectDetailTab === 'activity' && (
                  <div className="space-y-3 text-xs">
                    <div className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(site.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <p className="font-semibold text-stone-800">Wedding invitation project created</p>
                      <p className="text-stone-500 text-[11px]">Studio initialized invitation design suite.</p>
                    </div>
                    {site.review_token && (
                      <div className="border-l-2 border-teal-500 pl-3 py-1 space-y-1">
                        <span className="text-[10px] font-mono text-teal-600">Review Live</span>
                        <p className="font-semibold text-stone-800">Client review token generated</p>
                        <p className="text-stone-500 text-[11px]">Shared with couple for design review.</p>
                      </div>
                    )}
                    {site.workflow_status === 'CLIENT_APPROVED' && (
                      <div className="border-l-2 border-emerald-600 pl-3 py-1 space-y-1">
                        <span className="text-[10px] font-mono text-emerald-600">Client Approved</span>
                        <p className="font-semibold text-emerald-900">Couple approved invitation layout</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PartnerDashboard;
