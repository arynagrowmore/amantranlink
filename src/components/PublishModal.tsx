import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, Copy, Check, QrCode, Download, ExternalLink, Globe, 
  MessageCircle, Send, X, ShieldCheck, Sparkles, Loader2, 
  CreditCard, Smartphone, ArrowRight, CheckCircle2,
  Lock, RefreshCw, AlertCircle, Eye, Users, Calendar, MapPin, 
  Palette, HeartHandshake, QrCode as QrIcon, Sliders, Key, 
  Link2, Award, Zap, Shield, Flame, CheckCircle, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeddingProjectState, Language } from '../types/wedding';
import { savePublishedInvitation } from '../utils/invitationStorage';
import { isTemplateUnlockedForUser, initiateRazorpayCheckout, saveWeddingSite } from '../services/razorpayClient';
import { publishWeddingSite } from '../services/weddingSiteService';
import { useAuth } from '../context/AuthContext';
import { themes } from './ThemeSelector';
import { THEME_PACKAGE_MAP, calculatePaymentDetails } from '../config/pricing';
import { BulkWhatsAppGeneratorModal } from './Guest/BulkWhatsAppGeneratorModal';
import { resolveApiUrl } from '../utils/apiConfig';

interface PublishModalProps {
  state: WeddingProjectState;
  onClose: () => void;
  onOpenDownloadHub?: () => void;
}

type ModalStage = 'overview' | 'animating' | 'completed';
type MessageTone = 'royal' | 'warm' | 'minimal';
type BadgeType = 'amantranlink' | 'custom' | 'none';
type ActiveSubTab = 'overview' | 'customize' | 'whatsapp' | 'pass';

export const PublishModal: React.FC<PublishModalProps> = ({ state, onClose, onOpenDownloadHub }) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<ModalStage>('overview');
  const [activeTab, setActiveTab] = useState<ActiveSubTab>('overview');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showBulkWhatsAppModal, setShowBulkWhatsAppModal] = useState<boolean>(false);

  // Razorpay Processing State
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Animation Progress States
  const [publishProgress, setPublishProgress] = useState<number>(12);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);

  const publishingTasks = [
    { title: 'Opening Royal Gateway', text: 'Preparing the 3D Palace Gateway & Auspicious Toran...', hindi: 'शाही राजमहल व 3D तोरण द्वार निर्माण' },
    { title: 'Carving Heritage Names', text: 'Engraving Dulha & Dulhan Royal Names in Trilingual Script...', hindi: 'वर-वधू के शुभ नामों का स्वर्ण अंकन' },
    { title: 'Inscribing Vivah Rasams', text: 'Binding Auspicious Muhurat, Haldi, Sangeet & GPS Maps...', hindi: 'शुभ लग्न मुहूर्त व संपूर्ण मांगलिक प्रसंग' },
    { title: 'Framing Family Blessings', text: 'Weaving Elders Blessing & Pariwar Aamantran Cards...', hindi: 'कुटुंब व आमंत्रक आशीर्वाद समर्पण' },
    { title: 'Polishing Lossless Sangeet', text: 'Tuning Shehnai Melody & High-Definition Photo Canvas...', hindi: 'शहनाई धुन व छायाचित्र सज्जा' },
    { title: 'Affixing 24K Gold Seal', text: 'Sealing Your Royal Kankotri With 24K Gold Sovereign Seal...', hindi: '24K स्वर्ण शाही मोहर समर्पण' },
  ];

  // Pricing
  const currentThemeObj = themes.find((t) => t.id === state.theme) || themes[0];
  const themePackageId = THEME_PACKAGE_MAP[state.theme] || 'gold';
  const isAlreadyUnlocked = isTemplateUnlockedForUser(user?.uid, state.theme);
  const paymentDetails = calculatePaymentDetails(themePackageId, state.theme, user?.role);
  const finalPayableAmount = isAlreadyUnlocked ? 0 : paymentDetails.finalAmountInr;

  // Slug & Clean Royal URL
  const groomSlug = (state.couple.groomEn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const brideSlug = (state.couple.brideEn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const defaultCoupleSlug = (groomSlug && brideSlug) ? `${groomSlug}-${brideSlug}` : (groomSlug || brideSlug || 'royal-wedding');
  const [slug, setSlug] = useState<string>(defaultCoupleSlug);

  useEffect(() => {
    if (defaultCoupleSlug && defaultCoupleSlug !== 'royal-wedding') {
      setSlug((prev) => (!prev || prev === 'groom-bride' || prev === 'royal-wedding' ? defaultCoupleSlug : prev));
    }
  }, [defaultCoupleSlug]);

  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://amantranlink-web.vercel.app';
  const cleanSlug = (slug || defaultCoupleSlug).replace(/^\/i\//, '').replace(/^i\//, '').trim().toLowerCase();
  
  // 👑 Clean, Short, Elegant Royal Invitation URL
  const fullUrl = `${origin}/i/${cleanSlug}?theme=${state.theme}`;

  // 🚀 Vercel Dedicated Hosting States
  const [liveVercelUrl, setLiveVercelUrl] = useState<string>(() => {
    return (state as any)?.vercel_url || `https://${cleanSlug}-wedding.vercel.app`;
  });
  const [isDeployingVercel, setIsDeployingVercel] = useState<boolean>(false);
  const [copiedVercel, setCopiedVercel] = useState<boolean>(false);
  const [useVercelLinkForShare, setUseVercelLinkForShare] = useState<boolean>(true);

  // 🎨 Customization States
  const [badgeType, setBadgeType] = useState<BadgeType>('amantranlink');
  const [customStudioName, setCustomStudioName] = useState<string>('Arya Wedding Planners');
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('2026');
  const [messageTone, setMessageTone] = useState<MessageTone>('royal');
  const [coordinatorPhone, setCoordinatorPhone] = useState<string>(state.family?.rsvp1Phone || '+91 9409360336');

  // WhatsApp Language
  const initialLang: Language = (state?.language === 'hi' || state?.language === 'gu') ? state.language : 'en';
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLang);

  useEffect(() => {
    if (state?.language) {
      const validLang: Language = (state.language === 'hi' || state.language === 'gu') ? state.language : 'en';
      setSelectedLanguage(validLang);
    }
  }, [state?.language]);

  const groomName = selectedLanguage === 'hi' ? (state.couple.groomHi || state.couple.groomEn) :
                    selectedLanguage === 'gu' ? (state.couple.groomGu || state.couple.groomEn) :
                    state.couple.groomEn;
  const brideName = selectedLanguage === 'hi' ? (state.couple.brideHi || state.couple.brideEn) :
                    selectedLanguage === 'gu' ? (state.couple.brideGu || state.couple.brideEn) :
                    state.couple.brideEn;

  const weddingDate = state.couple.weddingDate || '10 December 2026';
  const venueName = state.couple.venueName || 'The Palace Gardens';

  const effectiveShareUrl = liveVercelUrl || `https://${cleanSlug}-wedding.vercel.app`;

  // 🌸 Custom Dynamic WhatsApp Ceremony Messages
  const buildCustomWhatsAppMessage = (): string => {
    if (messageTone === 'royal') {
      if (selectedLanguage === 'hi') {
        return `॥ श्री गणेशाय नमः ॥ 👑\n\n*मांगलिक विवाह आमंत्रण*\n\nपरम स्नेही जन,\nप्रभु कृपा से हमारे प्रिय वर *${groomName}* एवं वधु *${brideName}* का पावन शुभ विवाह संस्कार संपन्न होना निश्चित हुआ है।\n\n📅 *तिथि:* ${weddingDate}\n🏛️ *स्थान:* ${venueName}\n\nशाही डिजिटल निमंत्रण पत्र, शहनाई धुन व सम्पूर्ण मांगलिक कार्यक्रम देखने हेतु कृपया नीचे दिए गए लिंक पर स्पर्श करें:\n👉 ${effectiveShareUrl}\n\nआपकी गरिमामयी उपस्थिति एवं मंगल आशीष हमारे लिए अमूल्य है।\n\n*दर्शनाभिलाषी:*\nसमस्त राज परिवार\nहेल्पलाइन: ${coordinatorPhone}`;
      } else if (selectedLanguage === 'gu') {
        return `॥ શ્રી ગણેશાય નમઃ ॥ 👑\n\n*માંગલિક વિવાહ આમંત્રણ*\n\nસ્નેહી શ્રી,\nપ્રભુકૃપાથી અમારા ચિરંજીવી *${groomName}* અને આયુષ્મતી *${brideName}* ના લગ્ન સંસ્કાર નિર્ધારિત થયા છે.\n\n📅 *તારીખ:* ${weddingDate}\n🏛️ *સ્થળ:* ${venueName}\n\nરોયલ ડિજિટલ કંકોત્રી અને સંપૂર્ણ કાર્યક્રમ જોવા માટે નીચે આપેલ લિંક પર ક્લિક કરો:\n👉 ${effectiveShareUrl}\n\nઆપની પધરામણી અને આશીર્વાદ અમારા માટે આશીર્વાદરૂપ રહેશે.\n\n*નિમંત્રક:*\nસમસ્ત પરિવાર`;
      } else {
        return `॥ ॐ Shri Ganeshay Namah ॥ 👑\n\n*ROYAL VIVAH INVITATION*\n\nTogether with their families,\n*${groomName}* & *${brideName}*\nrequest the honor of your presence and blessings at their wedding celebrations.\n\n📅 *Date:* ${weddingDate}\n🏛️ *Venue:* ${venueName}\n\nTap below to explore our interactive digital wedding invitation with music, ceremony schedules & GPS directions:\n👉 ${effectiveShareUrl}\n\nWe look forward to celebrating this sacred milestone with you!\nRSVP / Assistance: ${coordinatorPhone}`;
      }
    } else if (messageTone === 'warm') {
      return `Two hearts, one soul, and a lifetime of togetherness... 💍✨\n\nWe warmly invite you to celebrate the wedding of:\n✨ *${groomName}* & *${brideName}* ✨\n\n📅 *When:* ${weddingDate}\n📍 *Where:* ${venueName}\n\nPlease tap the link to open our interactive wedding invite & ceremony details:\n👉 ${effectiveShareUrl}\n\nYour love and blessings mean the world to us! 💛`;
    } else {
      return `Save the Date! 💍\n*${groomName}* & *${brideName}* are getting married!\n\n📅 ${weddingDate}\n📍 ${venueName}\n\nView our official digital wedding invitation & RSVP:\n👉 ${effectiveShareUrl}`;
    }
  };

  const [customMessage, setCustomMessage] = useState<string>('');
  
  useEffect(() => {
    setCustomMessage(buildCustomWhatsAppMessage());
  }, [messageTone, selectedLanguage, groomName, brideName, weddingDate, venueName, effectiveShareUrl, coordinatorPhone]);

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [sharedNotice, setSharedNotice] = useState<boolean>(false);

  // Quick Slug Suggestions
  const slugSuggestions = [
    `${groomSlug}-${brideSlug}`,
    `${groomSlug}-weds-${brideSlug}`,
    `${brideSlug}-${groomSlug}-2026`,
    `royal-${groomSlug}-${brideSlug}`,
  ].filter(Boolean);

  const triggerVercelDeploy = async (targetSlug?: string) => {
    setIsDeployingVercel(true);
    try {
      const deployEndpoint = resolveApiUrl('/api/invitations/deploy-vercel');
      const res = await fetch(deployEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: targetSlug || cleanSlug,
          groomName: state.couple.groomEn || 'Groom',
          brideName: state.couple.brideEn || 'Bride',
          weddingDate: state.couple.weddingDate || '10 December 2026',
          venue: state.couple.venueName || 'Royal Palace',
          theme: state.theme,
          heroImage: state.media?.photoSlots?.hero?.url || '',
          isEngagement: state.invitation_type === 'engagement',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.vercelUrl) {
          setLiveVercelUrl(json.vercelUrl);
        }
      }
    } catch (e) {
      console.warn('Vercel deploy trigger note:', e);
    } finally {
      setIsDeployingVercel(false);
    }
  };

  const triggerPublishSequence = async () => {
    if (finalPayableAmount > 0) {
      setIsVerifyingPayment(true);
      setPaymentError(null);

      await initiateRazorpayCheckout({
        templateId: state.theme,
        packageId: themePackageId,
        uid: user?.uid || `user_${Date.now()}`,
        userName: groomName ? `${groomName} & ${brideName}` : 'Royal Couple',
        userEmail: user?.email || `${(groomName || 'rudra').toLowerCase()}.${(brideName || 'ishani').toLowerCase()}@amantranlink.com`,
        userPhone: user?.phone || state.family.rsvp1Phone || '+91 9409360336',
        state,
        onSuccess: () => {
          setIsVerifyingPayment(false);
          setStage('animating');
          runPublishingAnimation();
        },
        onError: (err) => {
          setIsVerifyingPayment(false);
          setPaymentError(err || 'Payment verification failed. Please try again.');
        },
      });
      return;
    }

    setStage('animating');
    runPublishingAnimation();
  };

  const runPublishingAnimation = () => {
    setPublishProgress(18);
    setCurrentTaskIndex(0);

    setTimeout(() => { setPublishProgress(38); setCurrentTaskIndex(1); }, 500);
    setTimeout(() => { setPublishProgress(58); setCurrentTaskIndex(2); }, 1000);
    setTimeout(() => { setPublishProgress(78); setCurrentTaskIndex(3); }, 1500);
    setTimeout(() => { setPublishProgress(92); setCurrentTaskIndex(4); }, 2000);
    setTimeout(() => {
      setPublishProgress(100);
      setCurrentTaskIndex(5);
      finalizePublishing();
    }, 2500);
  };

  const finalizePublishing = async () => {
    const finalSlug = (cleanSlug || 'royal-wedding').toLowerCase();
    const effectiveStudioBadge = badgeType === 'none' 
      ? null 
      : badgeType === 'custom' 
      ? customStudioName 
      : '✦ Handcrafted by Amantranlink Studios ✦';

    const publishedPayload: WeddingProjectState = {
      ...state,
      theme: state.theme,
    };

    savePublishedInvitation(finalSlug, publishedPayload);
    const siteRecord: any = {
      id: `site_${finalSlug}`,
      siteId: `site_${finalSlug}`,
      uid: user?.uid || 'guest_user',
      templateId: state.theme,
      slug: finalSlug,
      status: 'published',
      publicationStatus: 'published',
      isLocked: true,
      editingStatus: 'locked',
      paymentStatus: 'paid',
      content: publishedPayload,
      draftContent: publishedPayload,
      publishedUrl: `/i/${finalSlug}`,
      studio_badge: effectiveStudioBadge,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveWeddingSite(siteRecord);

    try {
      const pubRes = await publishWeddingSite({
        userId: user?.uid || '4fe4383d-9cd0-49df-b8ff-2b833db40f17',
        themeId: state.theme,
        state: publishedPayload,
        customSlug: finalSlug,
      });
      if (pubRes?.vercelUrl) {
        setLiveVercelUrl(pubRes.vercelUrl);
      }
    } catch (e) {
      console.warn('Publish sync note:', e);
    }

    setStage('completed');
    setActiveTab('overview');
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#C49A35', '#6E1020', '#F4D06F', '#167A5A', '#FFFDF8'],
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyVercel = () => {
    navigator.clipboard.writeText(liveVercelUrl);
    setCopiedVercel(true);
    setTimeout(() => setCopiedVercel(false), 2500);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#167A5A', '#C49A35', '#FFFDF8'],
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(customMessage);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
    setSharedNotice(true);
    setTimeout(() => setSharedNotice(false), 3000);
  };

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(effectiveShareUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;

  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeApiUrl;
    link.download = `${groomName}_${brideName}_Royal_QR.png`;
    link.target = '_blank';
    link.click();
  };

  const isUnlockedOrCompleted = stage === 'completed' || isAlreadyUnlocked || finalPayableAmount === 0;

  // Monogram for Wax Seal
  const gInit = (state.couple.groomEn?.charAt(0) || 'G').toUpperCase();
  const bInit = (state.couple.brideEn?.charAt(0) || 'B').toUpperCase();
  const coupleMonogram = `${gInit} · ${bInit}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-[#FFFDF8] rounded-3xl border-2 border-[#C49A35]/50 shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* ========================================================= */}
        {/* 👑 ROYAL HERO & LAUNCHPAD HEADER                          */}
        {/* ========================================================= */}
        <header className="relative bg-gradient-to-r from-[#2B0810] via-[#430914] to-[#2B0810] text-white px-5 sm:px-8 py-4 sm:py-5 border-b-2 border-[#C49A35]/40 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#C49A35] via-[#E8CD7E] to-[#9A7526] p-[2px] shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#3D0A12] rounded-[14px] p-1.5 flex items-center justify-center">
                <img 
                  src="/Amantran.png" 
                  alt="Amantran" 
                  className="w-full h-full object-contain filter drop-shadow-sm" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/amantranlink.png'; }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-[#E8CD7E]">
                  ✦ AMANTRANLINK ROYAL LAUNCHPAD ✦
                </span>
                {isUnlockedOrCompleted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#167A5A]/30 border border-[#167A5A] text-[#4ECCA3] text-[9px] font-mono font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ECCA3] animate-ping" />
                    LIVE
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-[#FFFDF8] leading-tight">
                {isUnlockedOrCompleted ? 'Your Royal Wedding Invitation is Sealed & Live' : 'Customize & Publish Royal Wedding Invitation'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-[#C49A35]/30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ========================================================= */}
        {/* 🧭 NAVIGATION TABS (Interactive Customization & Delivery)  */}
        {/* ========================================================= */}
        {stage !== 'animating' && (
          <div className="bg-[#FAF6EE] px-5 sm:px-8 py-2.5 border-b border-[#E8DCC8] flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                    : 'bg-white hover:bg-[#F3EAD8] text-[#6E1020] border border-[#E8D5AD]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>{isUnlockedOrCompleted ? '👑 Sovereign Links & Pass' : 'Overview & Publish'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('customize')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'customize'
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                    : 'bg-white hover:bg-[#F3EAD8] text-[#75675C] hover:text-[#6E1020] border border-[#E8D5AD]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>⚙️ Link &amp; Branding Customization</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                    : 'bg-white hover:bg-[#F3EAD8] text-[#75675C] hover:text-[#6E1020] border border-[#E8D5AD]'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#167A5A]" />
                <span>💬 WhatsApp Share Suite</span>
              </button>
            </div>

            <span className="hidden sm:inline text-[11px] font-mono text-[#75675C]">
              Theme: <strong className="text-[#6E1020] uppercase">{state.theme}</strong>
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 🎬 ANIMATING STATE (Golden Carving & Royal Deployment)     */}
        {/* ========================================================= */}
        {stage === 'animating' && (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#C49A35]/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#C49A35] border-r-[#C49A35] border-b-transparent border-l-transparent animate-spin" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#6E1020] to-[#3D0A12] border-2 border-[#C49A35] flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-[#E8CD7E] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C49A35] font-bold block">
                ✦ ROYAL SEAL IN PROGRESS ✦
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#6E1020]">
                {publishingTasks[currentTaskIndex]?.title}
              </h3>
              <p className="text-sm text-[#75675C]">
                {publishingTasks[currentTaskIndex]?.text}
              </p>
              <p className="text-xs font-serif italic text-[#C49A35] mt-1">
                {publishingTasks[currentTaskIndex]?.hindi}
              </p>
            </div>

            {/* Gold Progress Bar */}
            <div className="w-full max-w-md bg-[#FAF5EC] rounded-full h-3 p-0.5 border border-[#E8D5AD] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C49A35] via-[#E8CD7E] to-[#C49A35] transition-all duration-500 shadow-sm"
                style={{ width: `${publishProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#6E1020]">{publishProgress}% Completed</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 📜 MODAL BODY CONTENT                                      */}
        {/* ========================================================= */}
        {stage !== 'animating' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* Error Message if payment/publish failed */}
            {paymentError && (
              <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F0D5D5] flex items-center gap-3 text-xs text-[#8C4A4A] animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-[#8C4A4A]" />
                <div className="flex-1">
                  <p className="font-bold">Your invitation couldn't be published right now.</p>
                  <p className="text-[11px] text-[#A25A5A] mt-0.5">{paymentError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentError(null)}
                  className="text-xs underline font-bold hover:text-black cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* TAB 1: OVERVIEW & SOVEREIGN FARMAN (The Core Experience) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 👑 IF COMPLETED: THE UNIQUE ROYAL SOVEREIGN FARMAN & VIP CLOUD PASS */}
                {isUnlockedOrCompleted ? (
                  <div className="space-y-6">
                    
                    {/* 🌟 LUXURY ROYAL DIGITAL FARMAN CARD */}
                    <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1C0409] via-[#2A060E] to-[#120205] text-[#FFFDF8] border-2 border-[#C49A35] shadow-[0_20px_50px_rgba(110,16,32,0.35)] overflow-hidden">
                      {/* Decorative Gold Filigree Corner Accents */}
                      <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#C49A35]/60 rounded-tl-xl pointer-events-none" />
                      <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#C49A35]/60 rounded-tr-xl pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#C49A35]/60 rounded-bl-xl pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#C49A35]/60 rounded-br-xl pointer-events-none" />
                      <div className="absolute inset-0 bg-radial from-[#C49A35]/15 via-transparent to-transparent pointer-events-none" />

                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Left: Royal Seal & Couple Monogram */}
                        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                          <div className="relative group shrink-0">
                            {/* 3D Embossed Wax Seal */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#8C1425] via-[#5A0A15] to-[#2B040A] p-1 border-2 border-[#E8CD7E] shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transform group-hover:scale-105 transition-transform">
                              <div className="w-full h-full rounded-full border border-dashed border-[#C49A35]/70 flex flex-col items-center justify-center">
                                <span className="text-[8px] font-mono tracking-widest text-[#E8CD7E] uppercase">VIVAH</span>
                                <span className="font-serif text-lg sm:text-xl font-bold text-[#FFFDF8] tracking-widest">
                                  {coupleMonogram}
                                </span>
                                <span className="text-[8px] text-[#E8CD7E]/80 font-mono">2026</span>
                              </div>
                            </div>
                            <span className="absolute -bottom-1 -right-1 p-1 bg-[#167A5A] rounded-full border-2 border-white text-white shadow-xs" title="Live Cloud Registry Active">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FAF5EC]/10 border border-[#C49A35]/40 text-[#E8CD7E] text-[10px] font-mono tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A] animate-ping" />
                              <span>OFFICIAL SOVEREIGN FARMAN</span>
                            </div>
                            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#FFFDF8] tracking-tight">
                              {groomName} &amp; {brideName}
                            </h3>
                            <p className="text-xs text-[#E8D5AD] font-mono">
                              {weddingDate} · {venueName}
                            </p>
                            <p className="text-[10px] text-[#E8CD7E]/70 font-mono">
                              Registry ID: #AL-{cleanSlug.toUpperCase()}-2026
                            </p>
                          </div>
                        </div>

                        {/* Right: Quick Action Launch Pad */}
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                          <a
                            href={effectiveShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#C49A35] via-[#E8CD7E] to-[#C49A35] hover:brightness-110 text-[#2B0810] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                          >
                            <span>Open Live Website</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="py-3 px-5 rounded-2xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-white" />
                            <span>Share on WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ⚡ VERCEL LIVE CLOUD LINK CARD (Client's Dedicated Domain) */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F5FBF8] via-[#FAFDFB] to-[#FFFFFF] border-2 border-[#167A5A]/50 shadow-md space-y-4 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#167A5A] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-2xs">
                              <Zap className="w-3.5 h-3.5 text-[#E8CD7E]" />
                              <span>LIVE CLOUD INVITATION LINK</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#167A5A] font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-ping" />
                              Active 24/7 Global Edge
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[#241A17] font-medium pt-1">
                            Your personalized wedding website is live on Vercel's global edge network. Share this link directly with your guests.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleCopyVercel}
                            className={`py-3 px-5 rounded-2xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                              copiedVercel
                                ? 'bg-[#167A5A] text-white'
                                : 'bg-[#167A5A]/10 hover:bg-[#167A5A]/20 text-[#167A5A] border border-[#167A5A]/30'
                            }`}
                          >
                            {copiedVercel ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Copied Link! 👑</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Live URL</span>
                              </>
                            )}
                          </button>

                          <a
                            href={liveVercelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-5 rounded-2xl text-xs font-bold font-mono bg-[#167A5A] hover:bg-[#126349] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <span>Open Invitation</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-[#167A5A]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="truncate text-xs sm:text-sm font-mono font-bold text-[#167A5A] flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-[#167A5A] shrink-0" />
                          <span className="truncate">{liveVercelUrl}</span>
                        </div>
                      </div>
                    </div>

                    {/* 📲 WHATSAPP DISPATCH & QR CODE CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      
                      {/* Left: WhatsApp 1-Click Action Hub */}
                      <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E8D5AD] shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E8D5AD] pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#167A5A]/10 text-[#167A5A] flex items-center justify-center">
                              <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-serif text-lg font-bold text-[#241A17]">
                                1-Click WhatsApp Dispatch
                              </h4>
                              <p className="text-[11px] text-[#75675C]">
                                Formatted with auspicious text, date &amp; active link
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveTab('whatsapp')}
                            className="text-xs font-bold text-[#6E1020] hover:underline cursor-pointer"
                          >
                            Edit Tone &rarr;
                          </button>
                        </div>

                        {/* WhatsApp Message Preview Bubble */}
                        <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-[#D5CEBF] font-sans text-xs text-[#111B21] space-y-2 relative shadow-inner">
                          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-black/5 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {customMessage}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="flex-1 py-3 px-4 rounded-2xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                          >
                            <Send className="w-4 h-4 text-white" />
                            <span>Share Directly on WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyMessage}
                            className="py-3 px-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#6E1020] border border-[#C49A35]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            {copiedMsg ? <Check className="w-4 h-4 text-[#167A5A]" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedMsg ? 'Copied!' : 'Copy Text'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowBulkWhatsAppModal(true)}
                            className="py-3 px-4 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            title="Generate personalized links for your entire guest list"
                          >
                            <Users className="w-4 h-4 text-[#E8CD7E]" />
                            <span>Bulk Guest Dispatcher</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Golden Royal QR Code */}
                      <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#FAF5EC] to-[#FFFDF8] border border-[#C49A35]/50 shadow-sm flex flex-col justify-between text-center space-y-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C49A35] font-bold block mb-1">
                            ✦ PRINT &amp; STAGE PASS ✦
                          </span>
                          <h4 className="font-serif text-lg font-bold text-[#6E1020]">
                            Golden Scannable QR Code
                          </h4>
                          <p className="text-[11px] text-[#75675C]">
                            Scan with camera to open live invitation
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <div className="p-3 bg-white rounded-2xl border-2 border-[#C49A35] shadow-md inline-block">
                            <img
                              src={qrCodeApiUrl}
                              alt="Royal Wedding QR"
                              className="w-36 h-36 rounded-lg"
                            />
                            <div className="mt-2 text-[10px] font-mono font-bold text-[#6E1020] tracking-widest uppercase">
                              {coupleMonogram} · VIVAH
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={downloadQrCode}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-[#E8CD7E]" />
                            <span>Download PNG QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="py-2.5 px-3 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#75675C] hover:text-[#6E1020] cursor-pointer"
                          >
                            Full View
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  /* ========================================================= */
                  /* 🔒 BEFORE PAYMENT / UNLOCK: OVERVIEW & CHECKOUT CARD      */
                  /* ========================================================= */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left (5 Cols): Live Preview of the Digital Invitation */}
                      <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-4 border-2 border-[#C49A35]/60 shadow-[0_12px_40px_rgba(110,16,32,0.12)] space-y-3">
                          <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2">
                            <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#6E1020] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#C49A35]" />
                              <span>CEREMONIAL PREVIEW</span>
                            </span>
                            <span className="text-[9px] text-[#75675C] font-mono">
                              {currentThemeObj.name}
                            </span>
                          </div>

                          {/* Visual Proof Card */}
                          <div className="bg-[#24060B] rounded-2xl p-6 text-white text-center border border-[#C49A35]/40 space-y-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-radial from-[#C49A35]/20 via-transparent to-transparent pointer-events-none" />
                            
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C49A35] block">
                              ✦ SHUBH VIVAH ✦
                            </span>
                            
                            <h3 className="font-serif text-2xl font-bold text-[#FFFDF8] leading-tight">
                              {groomName} &amp; {brideName}
                            </h3>
                            
                            <div className="w-10 h-[1px] bg-[#C49A35] mx-auto opacity-70" />
                            
                            <div className="text-xs space-y-1 text-[#E8D5AD]">
                              <p className="font-bold text-[#E8CD7E]">{weddingDate}</p>
                              <p className="text-[11px] opacity-90 truncate">{venueName}</p>
                            </div>

                            <div className="pt-2">
                              <span className="inline-block py-1 px-3 rounded-full bg-[#3A0811] text-[#E8D5AD] text-[10px] font-mono border border-[#C49A35]/30">
                                {cleanSlug}-wedding.vercel.app
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-[#FAF5EC] rounded-xl border border-[#E8D5AD] text-[11px] text-[#75675C] flex items-center justify-between">
                            <span>Vercel Dedicated Domain:</span>
                            <span className="font-mono font-bold text-[#167A5A] truncate ml-1">{cleanSlug}-wedding.vercel.app</span>
                          </div>
                        </div>
                      </div>

                      {/* Right (7 Cols): Payment & Activation Card */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="p-6 rounded-3xl bg-white border-2 border-[#C49A35]/40 shadow-md space-y-5">
                          <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD] pb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#C49A35]">
                                  ROYAL INVITATION PACKAGE
                                </span>
                              </div>
                              <h4 className="font-serif text-2xl font-bold text-[#6E1020]">
                                Unlock &amp; Publish Royal Invitation
                              </h4>
                              <p className="text-xs text-[#75675C] mt-1 leading-relaxed">
                                Get your official shareable link, dedicated Vercel deployment, WhatsApp dispatches, and QR codes instantly.
                              </p>
                            </div>

                            <div className="text-right shrink-0 bg-[#FAF6EE] px-4 py-2.5 rounded-2xl border border-[#E8DCC8]">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75675C] block">
                                One-Time Fee
                              </span>
                              <span className="font-serif text-2xl font-bold text-[#6E1020]">
                                ₹{finalPayableAmount}
                              </span>
                            </div>
                          </div>

                          {/* Features checklist */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#241A17]">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Dedicated Vercel Cloud Domain</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Official Clean Slug: {cleanSlug}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Royal Shehnai &amp; Music Player</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Interactive RSVP &amp; Meal Tracker</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Bulk Guest WhatsApp Link Generator</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                              <span>Print-Ready Golden QR Code</span>
                            </div>
                          </div>

                          {/* Checkout CTA Button */}
                          <div className="space-y-3 pt-2">
                            <button
                              type="button"
                              onClick={triggerPublishSequence}
                              disabled={isVerifyingPayment}
                              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6E1020] via-[#851829] to-[#6E1020] hover:from-[#5A0B18] hover:to-[#5A0B18] text-[#FFFDF8] font-bold text-sm tracking-wide flex items-center justify-center gap-3 shadow-lg border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
                            >
                              {isVerifyingPayment ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin text-[#C49A35]" />
                                  <span>Connecting to Secure Gateway...</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-5 h-5 text-[#C49A35]" />
                                  <span>PAY ₹{finalPayableAmount} &amp; PUBLISH ROYAL INVITATION</span>
                                  <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                                </>
                              )}
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[11px] text-[#75675C] text-center">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#167A5A]" />
                                256-bit Encrypted SSL
                              </span>
                              <span>·</span>
                              <span>Razorpay / UPI / Cards / NetBanking</span>
                              <span>·</span>
                              <span>Instant Activation</span>
                            </div>
                          </div>

                          {/* Option to customize settings before payment */}
                          <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-[#C49A35]" />
                              <span className="font-semibold text-[#241A17]">Want to customize your URL slug or watermark first?</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('customize')}
                              className="px-3 py-1 rounded-lg bg-white border border-[#C49A35]/40 text-[#6E1020] font-bold hover:bg-[#FAF6EE] cursor-pointer"
                            >
                              Customize &rarr;
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: ⚙️ LINK & BRANDING CUSTOMIZATION */}
            {activeTab === 'customize' && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* 1. Custom URL Slug Section */}
                <div className="p-6 rounded-3xl bg-white border border-[#E8D5AD] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E8D5AD] pb-3">
                    <Link2 className="w-5 h-5 text-[#C49A35]" />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#241A17]">
                        Custom Wedding Web Address (Slug)
                      </h4>
                      <p className="text-xs text-[#75675C]">
                        Choose the exact URL path your guests will see
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[#241A17] block">
                      Edit Invitation Slug:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#75675C] bg-[#FAF5EC] px-3 py-2.5 rounded-xl border border-[#E8D5AD]">
                        /i/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="romil-urja"
                        className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8D5AD] bg-white font-mono text-sm font-bold text-[#6E1020] focus:ring-2 focus:ring-[#C49A35] focus:outline-none"
                      />
                    </div>

                    {/* Suggestions Pills */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-[#75675C] block">Suggestions:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {slugSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setSlug(sug)}
                            className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                              slug === sug
                                ? 'bg-[#6E1020] text-[#FFFDF8] font-bold shadow-xs'
                                : 'bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#6E1020] border border-[#E8D5AD]'
                            }`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live URL Preview */}
                    <div className="p-3.5 rounded-2xl bg-[#F0FAF5] border border-[#167A5A]/30 text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#167A5A] truncate font-bold">
                        <Zap className="w-4 h-4 shrink-0 text-[#167A5A]" />
                        <span className="truncate">https://{cleanSlug}-wedding.vercel.app</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Studio Watermark & Branding Customizer */}
                <div className="p-6 rounded-3xl bg-white border border-[#E8D5AD] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E8D5AD] pb-3">
                    <Palette className="w-5 h-5 text-[#C49A35]" />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#241A17]">
                        Studio Signature &amp; Watermark
                      </h4>
                      <p className="text-xs text-[#75675C]">
                        Control the bottom credits badge on the invitation
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      onClick={() => setBadgeType('amantranlink')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        badgeType === 'amantranlink'
                          ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                          : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold block">👑 Amantranlink</span>
                        <span className="text-[11px] leading-tight block">Handcrafted by Amantranlink signature</span>
                      </div>
                      <span className="text-[10px] font-mono mt-2 font-bold uppercase">Standard</span>
                    </label>

                    <label
                      onClick={() => setBadgeType('custom')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        badgeType === 'custom'
                          ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                          : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold block">✨ Custom Agency</span>
                        <span className="text-[11px] leading-tight block">Put your own wedding agency name</span>
                      </div>
                      <span className="text-[10px] font-mono mt-2 font-bold uppercase">Whitelabel</span>
                    </label>

                    <label
                      onClick={() => setBadgeType('none')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        badgeType === 'none'
                          ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                          : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold block">🛡️ Clean VIP</span>
                        <span className="text-[11px] leading-tight block">Remove all watermarks completely</span>
                      </div>
                      <span className="text-[10px] font-mono mt-2 font-bold uppercase">Pure VIP</span>
                    </label>
                  </div>

                  {badgeType === 'custom' && (
                    <div className="space-y-1.5 pt-2 animate-fadeIn">
                      <label className="text-xs font-semibold text-[#241A17] block">
                        Your Custom Studio / Planner Name:
                      </label>
                      <input
                        type="text"
                        value={customStudioName}
                        onChange={(e) => setCustomStudioName(e.target.value)}
                        placeholder="Arya Wedding Planners"
                        className="w-full py-2.5 px-4 rounded-xl border border-[#E8D5AD] bg-white text-xs font-bold text-[#6E1020] focus:ring-2 focus:ring-[#C49A35] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Ceremony Coordinator WhatsApp Helpline */}
                <div className="p-6 rounded-3xl bg-white border border-[#E8D5AD] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E8D5AD] pb-3">
                    <Smartphone className="w-5 h-5 text-[#167A5A]" />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#241A17]">
                        RSVP &amp; Helpdesk Phone Number
                      </h4>
                      <p className="text-xs text-[#75675C]">
                        The primary contact number displayed in WhatsApp shares and guest queries
                      </p>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={coordinatorPhone}
                      onChange={(e) => setCoordinatorPhone(e.target.value)}
                      placeholder="+91 9409360336"
                      className="w-full py-2.5 px-4 rounded-xl border border-[#E8D5AD] bg-white font-mono text-xs font-bold text-[#241A17] focus:ring-2 focus:ring-[#C49A35] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Back to Overview */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="py-3 px-8 rounded-2xl bg-[#6E1020] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider hover:bg-[#430914] transition-all cursor-pointer shadow-md"
                  >
                    Save &amp; View Links &rarr;
                  </button>
                </div>

              </div>
            )}

            {/* TAB 3: 💬 WHATSAPP SHARE SUITE */}
            {activeTab === 'whatsapp' && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                <div className="p-6 rounded-3xl bg-white border border-[#E8D5AD] shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E8D5AD] pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-[#6E1020]">
                        WhatsApp Share Customizer
                      </h4>
                      <p className="text-xs text-[#75675C] mt-0.5">
                        Choose ceremony greeting tone, language, and customize invite copy
                      </p>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#E8DCC8]">
                      {(['en', 'hi', 'gu'] as Language[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setSelectedLanguage(l)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedLanguage === l
                              ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                              : 'text-[#75675C] hover:text-[#241A17]'
                          }`}
                        >
                          {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#241A17] block">
                      Ceremony Tone Preset:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMessageTone('royal')}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          messageTone === 'royal'
                            ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                            : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                        }`}
                      >
                        <span className="text-xs font-bold block">👑 Shahi Farman</span>
                        <span className="text-[10px] opacity-80 block mt-0.5">Formal with auspicious blessings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMessageTone('warm')}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          messageTone === 'warm'
                            ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                            : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                        }`}
                      >
                        <span className="text-xs font-bold block">💖 Warm &amp; Friendly</span>
                        <span className="text-[10px] opacity-80 block mt-0.5">Emotional &amp; personal family note</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMessageTone('minimal')}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          messageTone === 'minimal'
                            ? 'border-[#6E1020] bg-[#6E1020]/5 text-[#6E1020]'
                            : 'border-[#E8D5AD] bg-white text-[#75675C] hover:border-[#C49A35]'
                        }`}
                      >
                        <span className="text-xs font-bold block">✨ Minimalist Chic</span>
                        <span className="text-[10px] opacity-80 block mt-0.5">Crisp, modern, 1-tap invite</span>
                      </button>
                    </div>
                  </div>

                  {/* Editable Message Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#241A17] flex items-center justify-between">
                      <span>Live Message Text (Freely Editable):</span>
                      <span className="text-[10px] text-[#75675C] font-mono">{customMessage.length} characters</span>
                    </label>
                    <textarea
                      rows={8}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-[#E8D5AD] bg-[#FAF5EC] font-sans text-xs text-[#241A17] leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#C49A35] focus:outline-none"
                    />
                  </div>

                  {/* Direct Share Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex-1 py-3 px-5 rounded-2xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>Send via WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="py-3 px-5 rounded-2xl bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#6E1020] border border-[#C49A35]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedMsg ? <Check className="w-4 h-4 text-[#167A5A]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedMsg ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* 🔻 FOOTER ACTIONS                                          */}
        {/* ========================================================= */}
        <footer className="bg-[#FAF6EE] px-5 sm:px-8 py-3.5 border-t border-[#E8DCC8] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#167A5A]" />
            <span className="text-xs font-medium text-[#75675C]">
              Amantranlink v3.2 Enterprise Cloud
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenDownloadHub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDownloadHub();
                }}
                className="text-xs text-[#6E1020] hover:text-[#430914] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Download Assets Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white hover:bg-[#F0E6D2] text-[#430914] border border-[#E8DCC8] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </footer>

      </div>

      {/* QR Code Fullscreen Modal Popover */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-[#FFFDF8] rounded-3xl p-6 border-2 border-[#C49A35] max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8D5AD] pb-3">
              <h4 className="font-serif text-xl font-bold text-[#6E1020]">
                Invitation QR Code
              </h4>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-[#75675C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF5EC] p-4 rounded-2xl border border-[#E8D5AD] flex justify-center">
              <img src={qrCodeApiUrl} alt="Invitation QR" className="w-52 h-52 rounded-xl border border-[#C49A35]/30" />
            </div>

            <div className="space-y-1 text-xs text-[#75675C]">
              <p className="font-bold text-[#241A17]">{groomName} &amp; {brideName}</p>
              <p className="text-[11px] font-mono text-[#6E1020] truncate">{effectiveShareUrl}</p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={downloadQrCode}
                className="flex-1 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs border border-[#C49A35] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#C49A35]" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#75675C] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📲 Bulk Guest WhatsApp Link Generator Modal */}
      <BulkWhatsAppGeneratorModal
        isOpen={showBulkWhatsAppModal}
        onClose={() => setShowBulkWhatsAppModal(false)}
        state={state}
        weddingSlug={cleanSlug}
      />

    </div>
  );
};

// Crown icon helper
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

export default PublishModal;
