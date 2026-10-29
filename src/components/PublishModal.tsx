import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, Copy, Check, QrCode, Download, ExternalLink, Globe, 
  MessageCircle, Send, X, ShieldCheck, Sparkles, Loader2, 
  CreditCard, Smartphone, ArrowRight, CheckCircle2,
  Lock, RefreshCw, AlertCircle, Eye, Users, Calendar, MapPin, Palette, HeartHandshake, QrCode as QrIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeddingProjectState, Language } from '../types/wedding';
import { savePublishedInvitation } from '../utils/invitationStorage';
import { isTemplateUnlockedForUser, initiateRazorpayCheckout } from '../services/razorpayClient';
import { publishWeddingSite } from '../services/weddingSiteService';
import { useAuth } from '../context/AuthContext';
import { themes } from './ThemeSelector';
import { THEME_PACKAGE_MAP, calculatePaymentDetails, OFFICIAL_PACKAGES } from '../config/pricing';
import { formatWhatsAppWeddingMessage, openWhatsAppShare, executeNativeOrWhatsAppShare } from '../utils/whatsappShare';
import { BulkWhatsAppGeneratorModal } from './Guest/BulkWhatsAppGeneratorModal';

const getLocalizedCardTitle = (state: WeddingProjectState, lang: Language): string => {
  const groom = (lang === 'hi' ? state.couple.groomHi : lang === 'gu' ? state.couple.groomGu : state.couple.groomEn) || state.couple.groomEn;
  const bride = (lang === 'hi' ? state.couple.brideHi : lang === 'gu' ? state.couple.brideGu : state.couple.brideEn) || state.couple.brideEn;
  return `${groom} & ${bride} - Royal Vivah Invitation`;
};

const getLocalizedCardSubtitle = (state: WeddingProjectState, lang: Language): string => {
  return state.couple.weddingDate || 'Auspicious Wedding Ceremony';
};

const generateWhatsAppMessage = ({
  state,
  language,
  invitationUrl,
}: {
  state: WeddingProjectState;
  language: Language;
  invitationUrl: string;
}): string => {
  return formatWhatsAppWeddingMessage({
    state,
    language,
    invitationUrl,
  });
};

interface PublishModalProps {
  state: WeddingProjectState;
  onClose: () => void;
  onOpenDownloadHub?: () => void;
}

type ModalStage = 'overview' | 'animating' | 'completed';

export const PublishModal: React.FC<PublishModalProps> = ({ state, onClose, onOpenDownloadHub }) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<ModalStage>('overview');
  const [isConfirmingPublish, setIsConfirmingPublish] = useState<boolean>(false);
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

  // Slug
  const groomSlug = (state.couple.groomEn || 'groom').toLowerCase().replace(/[^a-z0-9]/g, '');
  const brideSlug = (state.couple.brideEn || 'bride').toLowerCase().replace(/[^a-z0-9]/g, '');
  const coupleSlug = `${groomSlug}-${brideSlug}`;
  const [slug, setSlug] = useState<string>(coupleSlug);

  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://amantranlink.com';
  const cleanDomain = origin.replace(/^https?:\/\//, '');
  const fullUrl = `${origin}/i/${slug}?theme=${state.theme}`;

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

  const whatsappMessage = generateWhatsAppMessage({
    language: selectedLanguage,
    state,
    invitationUrl: fullUrl,
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [sharedNotice, setSharedNotice] = useState<boolean>(false);

  // Checks before publish
  const isCoupleComplete = !!(state.couple.groomEn && state.couple.brideEn);
  const isDateComplete = !!state.couple.weddingDate;
  const isVenueComplete = !!state.couple.venueName;
  const isEventsComplete = state.events && state.events.length > 0;
  const isDesignComplete = !!state.theme;
  const isAllValid = isCoupleComplete && isDateComplete && isVenueComplete && isEventsComplete;

  const triggerPublishSequence = async () => {
    setIsConfirmingPublish(false);

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
          setPaymentError(err || 'Your invitation couldn’t be published right now. Please try again.');
        },
        onCancel: () => {
          setIsVerifyingPayment(false);
        },
      });
      return;
    }

    setIsVerifyingPayment(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsVerifyingPayment(false);
      setStage('animating');
      runPublishingAnimation();
    }, 600);
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
    savePublishedInvitation(slug, { ...state, theme: state.theme });
    try {
      await publishWeddingSite({
        userId: user?.uid || '4fe4383d-9cd0-49df-b8ff-2b833db40f17',
        themeId: state.theme,
        state: { ...state, theme: state.theme },
        customSlug: slug,
      });
    } catch (e) {
      console.warn('Publish sync note:', e);
    }

    setStage('completed');
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#C49A35', '#6E1020', '#F4D06F', '#167A5A', '#FFFDF8'],
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
    setSharedNotice(true);
    setTimeout(() => setSharedNotice(false), 3000);
  };

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(fullUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;

  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeApiUrl;
    link.download = `${groomName}_${brideName}_Invitation_QR.png`;
    link.target = '_blank';
    link.click();
  };

  const isUnlockedOrCompleted = stage === 'completed' || isAlreadyUnlocked || finalPayableAmount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* 👑 HERO & ATELIER HEADER (Luminous Royal Light Theme)     */}
        {/* ========================================================= */}
        <header className="bg-white border-b border-[#E8DCC8] px-6 sm:px-8 py-5 text-[#1A1715] shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-radial from-[#C49A35]/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C49A35] font-mono">
                  AMANTRANLINK · ROYAL INVITATION ATELIER
                </span>
                <span className="text-[#E8DCC8] text-xs">·</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6E1020] bg-[#FAF6EE] px-2.5 py-0.5 rounded-full border border-[#E8DCC8]">
                  <Palette className="w-3 h-3 text-[#C49A35]" />
                  {currentThemeObj.name} · Selected Theme
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#6E1020]">
                {stage === 'completed' 
                  ? 'Your Royal Invitation is Officially Live!' 
                  : finalPayableAmount > 0 
                  ? 'Unlock & Publish Your Royal Invitation'
                  : 'Your Royal Invitation is Ready to Publish'}
              </h2>
              <p className="text-xs text-[#75675C] mt-0.5 font-normal">
                {stage === 'completed'
                  ? 'One elegant link for your family, relatives, and every guest joining your sacred celebration.'
                  : finalPayableAmount > 0
                  ? 'Complete your one-time payment to publish your invitation, activate cloud hosting, and unlock WhatsApp sharing.'
                  : 'Review your invitation details, then publish to update all guest links in real time.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8DCC8] hover:border-[#C49A35] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close Studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 🎬 ANIMATING PROGRESS VIEW */}
        {stage === 'animating' && (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 flex-1 animate-fadeIn bg-[#FFFDF8]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#6E1020] border-2 border-[#C49A35] flex items-center justify-center text-3xl shadow-xl">
                <span className="animate-pulse">👑</span>
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#C49A35]/60 animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            <div className="space-y-1.5 max-w-md">
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold tracking-widest block">
                STAGE {currentTaskIndex + 1} OF 6 · {publishingTasks[currentTaskIndex]?.title}
              </span>
              <h3 className="font-cormorant font-bold text-2xl text-[#6E1020]">
                {publishingTasks[currentTaskIndex]?.text}
              </h3>
              <p className="text-xs text-[#75675C] font-serif">
                {publishingTasks[currentTaskIndex]?.hindi}
              </p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="w-full bg-[#FAF8F5] border border-[#E8D5AD] h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-[#C49A35] to-[#701222] h-full rounded-full transition-all duration-300"
                  style={{ width: `${publishProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#75675C]">
                <span>Publishing to Palace Cloud</span>
                <span className="font-bold text-[#6E1020]">{publishProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 🏛️ MAIN PUBLISH & SHARE STUDIO BODY */}
        {(stage === 'overview' || stage === 'completed') && (
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-[#FFFDF8]">
            
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

            {/* ========================================================= */}
            {/* 3 & 4. INVITATION PREVIEW HERO & LIVE/DRAFT STATUS */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT (Desktop Col 5): Large Invitation Preview Card */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[320px] bg-white rounded-3xl p-4 border-2 border-[#C49A35]/60 shadow-[0_12px_40px_rgba(110,16,32,0.12)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2">
                    <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#6E1020] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C49A35]" />
                      <span>{isUnlockedOrCompleted ? 'LIVE INVITATION' : 'CEREMONIAL PROOF'}</span>
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
                        {isUnlockedOrCompleted ? fullUrl.replace(/^https?:\/\//, '') : 'amantranlink.com/i/••••••••'}
                      </span>
                    </div>
                  </div>

                  {/* Discreet Guest View Action */}
                  {isUnlockedOrCompleted ? (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Live Guest View</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#C49A35]" />
                    </a>
                  ) : (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-[#FAF5EC] text-[#75675C] border border-[#E8D5AD] text-xs font-medium flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#C49A35]" />
                      <span>Live link unlocks after payment</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT (Desktop Col 7): Status, Publish CTA & Link Presenter */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 4. Editorial Production Status Note */}
                <div className="p-4 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#75675C] block font-semibold">
                      YOUR INVITATION STATUS
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#241A17] mt-0.5">
                      {isUnlockedOrCompleted 
                        ? 'Live & Published on Cloud' 
                        : 'Customization Saved · Awaiting Unlock'}
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isUnlockedOrCompleted
                      ? 'bg-[#167A5A]/10 text-[#167A5A] border-[#167A5A]/30'
                      : 'bg-[#C49A35]/10 text-[#6E1020] border-[#C49A35]/30'
                  }`}>
                    {isUnlockedOrCompleted ? 'Active on Cloud' : 'Draft Proof'}
                  </span>
                </div>

                {/* GATING: If not unlocked, show Payment Checkout Card */}
                {!isUnlockedOrCompleted ? (
                  <div className="p-6 rounded-3xl bg-white border-2 border-[#C49A35]/40 shadow-md space-y-5">
                    <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD] pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#C49A35]">
                            ROYAL INVITATION PACKAGE
                          </span>
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[#6E1020]">
                          Unlock &amp; Publish Invitation
                        </h4>
                        <p className="text-xs text-[#75675C] mt-1 leading-relaxed">
                          Publish your wedding website to Palace Cloud and get your official shareable link, WhatsApp dispatches, and QR codes.
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
                        <span>Official Live URL ({slug})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                        <span>Royal Shehnai &amp; Music Player</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                        <span>1-Tap Google Maps GPS Directions</span>
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

                    {/* Locked notice */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5EC] border border-[#E8D5AD] flex items-center gap-3 text-xs text-[#75675C]">
                      <Lock className="w-4 h-4 text-[#C49A35] shrink-0" />
                      <span>
                        The live link, WhatsApp 1-click shares, QR codes, and Bulk Guest Generator will unlock immediately after payment.
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 6. INVITATION LINK PRESENTATION (Unlocked) */}
                    <div className="p-5 rounded-3xl bg-white border border-[#E8D5AD] shadow-xs space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6E1020] block">
                        YOUR INVITATION LINK (OFFICIALLY LIVE)
                      </span>
                      
                      <div className="bg-[#FAF5EC] border border-[#E8D5AD] p-3 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="truncate text-xs font-mono font-bold text-[#6E1020] flex items-center gap-2" title={fullUrl}>
                          <Globe className="w-4 h-4 text-[#C49A35] shrink-0" />
                          <span className="truncate">{fullUrl}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 shadow-xs ${
                            copied 
                              ? 'bg-[#167A5A] text-white' 
                              : 'bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] border border-[#C49A35]'
                          }`}
                        >
                          {copied ? 'Copied ✓' : 'Copy Link'}
                        </button>
                      </div>

                      {copied && (
                        <p className="text-[11px] text-[#167A5A] font-medium animate-fadeIn">
                          ✓ Invitation link copied to clipboard.
                        </p>
                      )}
                      {sharedNotice && (
                        <p className="text-[11px] text-[#167A5A] font-medium animate-fadeIn">
                          ✓ Ready to share with your family.
                        </p>
                      )}
                    </div>

                    {/* 5. MAIN SHARE PANEL (Unlocked) */}
                    <div className="p-5 rounded-3xl bg-white border border-[#E8D5AD] shadow-xs space-y-4">
                      <div>
                        <h4 className="font-serif text-2xl font-bold text-[#241A17]">
                          Share with your family
                        </h4>
                        <p className="text-xs text-[#75675C] mt-0.5">
                          Send the royal invitation directly to your guests on WhatsApp.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleWhatsAppShare}
                          className="py-3 px-4 rounded-xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Share on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowQrModal(true)}
                          className="py-3 px-4 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <QrIcon className="w-4 h-4 text-[#C49A35]" />
                          <span>Show QR Code</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>

            {/* ========================================================= */}
            {/* GATING: SECTIONS 7, 8, 9 (LOCKED UNTIL PAYMENT / UNLOCKED) */}
            {/* ========================================================= */}
            {!isUnlockedOrCompleted ? (
              <section className="bg-white rounded-3xl border border-[#E8DCC8] p-8 sm:p-10 text-center space-y-5 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF6EE] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-7 h-7 text-[#C49A35]" />
                </div>
                <div className="max-w-lg mx-auto space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#C49A35]">
                    LOCKED UNTIL PUBLISHED
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1715]">
                    Unlock 1-Click WhatsApp Shares &amp; Bulk Guest Links
                  </h3>
                  <p className="text-xs text-[#75675C] leading-relaxed">
                    Once published, you get instant access to the personalized Bulk Guest WhatsApp Generator, high-resolution Golden QR Code download, and real-time RSVP dashboard.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={triggerPublishSequence}
                    disabled={isVerifyingPayment}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6E1020] to-[#851829] hover:from-[#5A0B18] hover:to-[#5A0B18] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider border border-[#C49A35] cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                  >
                    {isVerifyingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C49A35]" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-[#C49A35]" />
                        <span>Pay ₹{finalPayableAmount} &amp; Unlock All Features</span>
                        <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                      </>
                    )}
                  </button>
                </div>
              </section>
            ) : (
              <>
                {/* ========================================================= */}
                {/* 7. PERSONALIZED GUEST LINKS */}
                {/* ========================================================= */}
                <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[#C49A35]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#241A17]">
                          Personal invitations
                        </h3>
                        <p className="text-xs text-[#75675C] mt-0.5">
                          Give every guest a more personal welcome.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-[#75675C] leading-relaxed max-w-2xl">
                      Guests can receive a link prepared especially for them, while their RSVP remains connected to your wedding. Each personalized link pre-fills the guest's name and preserves their individual response.
                    </p>

                    <div className="p-4 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] text-xs text-[#241A17] flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-[#6E1020]" />
                        <span className="font-semibold">Manage and dispatch personalized guest links</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (typeof window !== 'undefined') {
                            window.location.hash = '#guest-book';
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold transition-all cursor-pointer"
                      >
                        Open Family Guest Book →
                      </button>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* 8. QR SHARE SECTION */}
                {/* ========================================================= */}
                <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
                  <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                        <QrIcon className="w-5 h-5 text-[#C49A35]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#241A17]">
                          Share by QR
                        </h3>
                        <p className="text-xs text-[#75675C] mt-0.5">
                          Perfect for family groups, printed cards, and reception desks.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 flex justify-center bg-[#FAF5EC] p-4 rounded-2xl border border-[#E8D5AD]">
                      <img
                        src={qrCodeApiUrl}
                        alt="Invitation QR Code"
                        className="w-44 h-44 rounded-xl shadow-xs border border-[#C49A35]/40"
                      />
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <p className="text-xs text-[#75675C] leading-relaxed">
                        Scannable with any smartphone camera. Guests will be taken directly to your digital invitation with royal background music, rasams, GPS directions, and RSVP portal.
                      </p>

                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={downloadQrCode}
                          className="py-3 px-5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-[#C49A35]" />
                          <span>Download QR</span>
                        </button>

                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-5 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8D5AD] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#C49A35]" />
                          <span>Open Invitation</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* 9. WHATSAPP EXPERIENCE (Send it to the family) */}
                {/* ========================================================= */}
                <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
                  <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#167A5A] flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-[#167A5A]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#241A17]">
                          Send it to the family
                        </h3>
                        <p className="text-xs text-[#75675C] mt-0.5">
                          Send it personally to the people who matter.
                        </p>
                      </div>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-[#FAF5EC] p-1 rounded-xl border border-[#E8D5AD]">
                      {(['en', 'hi', 'gu'] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                            selectedLanguage === lang
                              ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                              : 'text-[#75675C] hover:text-[#241A17]'
                          }`}
                        >
                          {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Sequence: YOUR INVITATION -> COPY / SHARE -> FAMILY & FRIENDS */}
                  <div className="p-4 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] flex items-center justify-around text-center text-xs text-[#75675C]">
                    <div>
                      <span className="font-bold text-[#6E1020] block">YOUR INVITATION</span>
                      <span className="text-[10px]">Ceremonial Design</span>
                    </div>
                    <span className="text-[#C49A35] font-bold text-lg">→</span>
                    <div>
                      <span className="font-bold text-[#6E1020] block">COPY / SHARE</span>
                      <span className="text-[10px]">Pre-composed Text</span>
                    </div>
                    <span className="text-[#C49A35] font-bold text-lg">→</span>
                    <div>
                      <span className="font-bold text-[#167A5A] block">FAMILY &amp; FRIENDS</span>
                      <span className="text-[10px]">Warm Welcome</span>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="bg-[#FAF5EC] p-4 rounded-2xl border border-[#E8D5AD] space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020] block">
                      MESSAGE PREVIEW ({selectedLanguage.toUpperCase()})
                    </span>
                    <p className="text-xs text-[#241A17] whitespace-pre-wrap leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-[#E8D5AD]">
                      {whatsappMessage}
                    </p>
                  </div>

                  {/* WhatsApp Actions */}
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex-1 py-3 px-5 rounded-xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="py-3 px-5 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8D5AD] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedMsg ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#C49A35]" />}
                      <span>{copiedMsg ? 'Message Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>

                  {/* 📲 BULK GUEST WHATSAPP GENERATOR CALLOUT */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#167A5A]/10 via-[#C49A35]/15 to-[#6E1020]/10 border border-[#167A5A]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#167A5A] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Users className="w-5 h-5 text-[#F4D06F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#241A17]">Bulk Guest WhatsApp Link Generator</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#167A5A] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                            Feature #1
                          </span>
                        </div>
                        <p className="text-[11px] text-[#75675C] mt-0.5">
                          Generate personalized (?to=GuestName) links with 1-click WhatsApp send &amp; CSV export for all 50+ guests.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBulkWhatsAppModal(true)}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 text-[#F4D06F]" />
                      <span>Open Bulk Generator</span>
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* ========================================================= */}
            {/* 11. BEFORE YOU SEND IT (Editorial Checklist) */}
            {/* ========================================================= */}
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-4">
              <div>
                <h4 className="font-cormorant text-2xl font-bold text-[#241A17]">
                  Before you send it
                </h4>
                <p className="text-xs text-[#75675C] mt-0.5">
                  A quick check to ensure everything is prepared for your celebration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
                
                {/* Check 1: Couple Details */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A17]">Couple Details</span>
                    {isCoupleComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold">Needs attention</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#75675C] truncate">
                    {isCoupleComplete ? `${groomName} & ${brideName}` : 'Add names'}
                  </p>
                </div>

                {/* Check 2: Wedding Date */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A17]">Wedding Date</span>
                    {isDateComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold">Needs attention</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#75675C] truncate">
                    {isDateComplete ? weddingDate : 'Set date'}
                  </p>
                </div>

                {/* Check 3: Venue */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A17]">Venue</span>
                    {isVenueComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold">Needs attention</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#75675C] truncate">
                    {isVenueComplete ? venueName : 'Add venue'}
                  </p>
                </div>

                {/* Check 4: Events */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A17]">Events</span>
                    {isEventsComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold">Needs attention</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#75675C]">
                    {state.events.length} Rasams Added
                  </p>
                </div>

                {/* Check 5: Invitation Design */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E8D5AD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A17]">Design Theme</span>
                    <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                  </div>
                  <p className="text-[11px] text-[#75675C] truncate">
                    {currentThemeObj.name}
                  </p>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* ========================================================= */}
        {/* 🌟 ATELIER FOOTER (Luminous Light Theme)                  */}
        {/* ========================================================= */}
        <footer className="bg-white border-t border-[#E8DCC8] px-6 sm:px-8 py-3.5 flex items-center justify-between text-xs text-[#75675C] shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            <span className="font-medium text-[#241A17]">AmantranLink Royal Vivah Atelier</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenDownloadHub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDownloadHub();
                }}
                className="text-xs text-[#6E1020] hover:text-[#430914] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Open Download Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8DCC8] font-semibold text-xs transition-colors cursor-pointer"
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
              <p className="text-[11px] font-mono text-[#6E1020] truncate">{fullUrl}</p>
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
        weddingSlug={slug}
      />

    </div>
  );
};

export default PublishModal;
