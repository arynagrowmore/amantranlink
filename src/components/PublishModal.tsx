import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, Copy, Check, QrCode, Download, ExternalLink, Globe, 
  MessageCircle, Send, X, ShieldCheck, Sparkles, Loader2, Award, 
  Heart, CreditCard, Smartphone, Tag, ArrowRight, CheckCircle2,
  Lock, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeddingProjectState, Language } from '../types/wedding';
import { RoyalCrestIcon, DiyaIcon, PalaceGateIcon } from './ShahiIcons';
import { savePublishedInvitation } from '../utils/invitationStorage';
import { isTemplateUnlockedForUser, initiateRazorpayCheckout } from '../services/razorpayClient';
import { publishWeddingSite } from '../services/weddingSiteService';
import { useAuth } from '../context/AuthContext';
import { themes } from './ThemeSelector';
import { THEME_PACKAGE_MAP, calculatePaymentDetails, OFFICIAL_PACKAGES } from '../config/pricing';

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
  const groom = state.couple.groomEn;
  const bride = state.couple.brideEn;
  const date = state.couple.weddingDate || 'Auspicious Date';
  const venue = state.couple.venueName || 'Grand Palace';

  if (language === 'hi') {
    return `🙏 *सादर निमंत्रण | शुभ विवाह*\n\nपरमपिता परमात्मा की असीम अनुकंपा से हमारे सुपुत्र/सुपुत्री के मांगलिक परिणय संस्कार में आपकी गरिमामयी उपस्थिति सादर प्रार्थनीय है।\n\n👑 *${groom} weds ${bride}*\n📅 *दिनांक:* ${date}\n📍 *स्थान:* ${venue}\n\n💌 *डिजिटल शाही निमंत्रण पत्रिका:* \n${invitationUrl}\n\n_कृपया पधारकर नवदंपति को अपना स्नेह व शुभाशीर्वाद प्रदान करें।_`;
  }
  if (language === 'gu') {
    return `🙏 *સ્નેહભર્યું નિમંત્રણ | શુભ લગ્નોત્સવ*\n\nશ્રી ગણેશજી ની અસીમ કૃપા થી અમારા આંગણે રૂડા લગ્ન પ્રસંગે આપનું સહકુટુંબ સ્નેહભર્યું સ્વાગત છે.\n\n👑 *${groom} weds ${bride}*\n📅 *તારીખ:* ${date}\n📍 *સ્થળ:* ${venue}\n\n💌 *ડિજિટલ શાહી કંકોત્રી:* \n${invitationUrl}\n\n_આપની પાવન ઉપસ્થિતિ પ્રાર્થનીય છે._`;
  }
  return `🙏 *Royal Wedding Invitation*\n\nWe cordially invite you and your family to celebrate the auspicious wedding ceremony of\n\n👑 *${groom} & ${bride}*\n📅 *Date:* ${date}\n📍 *Venue:* ${venue}\n\n💌 *View our Royal Digital Invitation:* \n${invitationUrl}\n\n_We look forward to celebrating with you!_`;
};

interface PublishModalProps {
  state: WeddingProjectState;
  onClose: () => void;
  onOpenDownloadHub?: () => void;
}

type ModalStage = 'checkout' | 'animating' | 'success_beat' | 'completed';

export const PublishModal: React.FC<PublishModalProps> = ({ state, onClose, onOpenDownloadHub }) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<ModalStage>('checkout');

  // Razorpay Processing State
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 🎬 Cinematic Royal Publishing Animation States
  const [publishProgress, setPublishProgress] = useState<number>(12);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);

  const publishingTasks = [
    { title: 'Opening Royal Gateway', text: 'Preparing the 3D Palace Gateway & Auspicious Toran...', hindi: 'शाही राजमहल व 3D तोरण द्वार निर्माण', percent: 18 },
    { title: 'Carving Heritage Names', text: 'Engraving Dulha & Dulhan Royal Names in Trilingual Script...', hindi: 'वर-वधू के शुभ नामों का स्वर्ण अंकन', percent: 38 },
    { title: 'Inscribing Vivah Rasams', text: 'Binding Auspicious Muhurat, Haldi, Sangeet & GPS Maps...', hindi: 'शुभ लग्न मुहूर्त व संपूर्ण मांगलिक प्रसंग', percent: 58 },
    { title: 'Framing Family Blessings', text: 'Weaving Elders Blessing & Pariwar Aamantran Cards...', hindi: 'कुटुंब व आमंत्रक आशीर्वाद समर्पण', percent: 78 },
    { title: 'Polishing Lossless Sangeet', text: 'Tuning Shehnai Melody & High-Definition Photo Canvas...', hindi: 'शहनाई धुन व छायाचित्र सज्जा', percent: 92 },
    { title: 'Affixing 24K Gold Seal', text: 'Sealing Your Royal Kankotri With 24K Gold Sovereign Seal...', hindi: '24K स्वर्ण शाही मोहर समर्पण', percent: 100 },
  ];

  // Pricing
  const currentThemeObj = themes.find((t) => t.id === state.theme) || themes[0];
  const themePackageId = THEME_PACKAGE_MAP[state.theme] || 'gold';
  const isAlreadyUnlocked = isTemplateUnlockedForUser(user?.uid, state.theme);
  const paymentDetails = calculatePaymentDetails(themePackageId, state.theme, user?.role);
  const finalPayableAmount = isAlreadyUnlocked ? 0 : paymentDetails.finalAmountInr;

  // Slug
  const coupleSlug = `${(state.couple.groomEn || 'rudra').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'ishani').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const [slug, setSlug] = useState<string>(coupleSlug);

  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://amantranlink.com';
  const cleanDomain = origin.replace(/^https?:\/\//, '');
  const fullUrl = `${origin}/i/${slug}`;

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

  const whatsappMessage = generateWhatsAppMessage({
    language: selectedLanguage,
    state,
    invitationUrl: fullUrl,
  });

  useEffect(() => {
    if (stage === 'completed') {
      savePublishedInvitation(slug, state);
    }
  }, [state, slug, stage]);

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
          setPaymentError(err || 'Payment was not completed. Please try again.');
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

    setTimeout(() => { setPublishProgress(38); setCurrentTaskIndex(1); }, 550);
    setTimeout(() => { setPublishProgress(58); setCurrentTaskIndex(2); }, 1100);
    setTimeout(() => { setPublishProgress(78); setCurrentTaskIndex(3); }, 1650);
    setTimeout(() => { setPublishProgress(92); setCurrentTaskIndex(4); }, 2200);
    setTimeout(() => {
      setPublishProgress(100);
      setCurrentTaskIndex(5);
      setPublishStageToSuccess();
    }, 2750);
  };

  const setPublishStageToSuccess = () => {
    savePublishedInvitation(slug, state);
    if (user?.uid) {
      publishWeddingSite({
        userId: user.uid,
        themeId: state.theme,
        state,
        customSlug: slug,
      });
    }

    setStage('success_beat');
    setTimeout(() => {
      setStage('completed');
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.45 },
        colors: ['#C49A35', '#701222', '#F4D06F', '#167A5A', '#FFFDF8'],
        ticks: 260,
        gravity: 0.75,
        scalar: 1.15,
      });
    }, 950);
  };

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-manrope">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_20px_70px_rgba(0,0,0,0.5)] flex flex-col text-[#241A17]">
        
        {/* Top Header Bar */}
        <div className="bg-[#6E1020] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#C49A35]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">👑</span>
            <div>
              <h2 className="font-cormorant font-bold text-xl sm:text-2xl text-[#FFFDF8] leading-tight">
                {stage === 'completed' ? 'Royal Invitation Published!' : 'Publish Royal Kankotri'}
              </h2>
              <span className="text-[10px] font-mono text-[#E8D5AD] uppercase tracking-wider block">
                ॥ श्री गणेशाय नमः ॥ · AmantranLink Official Cloud
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#E8D5AD] hover:text-[#FFFDF8] hover:bg-white/10 transition-colors border border-[#C49A35]/40 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 💳 STAGE 0: CHECKOUT & SLUG CONFIGURATION */}
        {stage === 'checkout' && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-left">
            <div className="space-y-1">
              <h3 className="font-cormorant font-bold text-xl text-[#6E1020]">
                Confirm &amp; Launch Your Digital Invitation
              </h3>
              <p className="text-xs text-[#75675C]">
                Your invitation will be deployed on high-speed cloud with real-time RSVPs and direct WhatsApp links.
              </p>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] flex items-center gap-2 text-xs text-[#8C4A4A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Order Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2.5">
                <span className="text-xs font-semibold text-[#6E1020] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <RoyalCrestIcon className="w-4 h-4 text-[#C49A35]" />
                  <span>Invitation Details</span>
                </span>
                {isAlreadyUnlocked ? (
                  <span className="text-[10px] font-mono bg-[#167A5A] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Theme Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#6E1020] bg-[#F8F3E8] px-2.5 py-0.5 rounded-full border border-[#E8D5AD] font-bold">
                    One-time Lifetime Access
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5AD]/60">
                  <span className="text-[10px] font-mono text-[#75675C] block uppercase font-semibold">Couple</span>
                  <span className="font-bold text-[#6E1020] text-sm truncate block mt-0.5">
                    👑 {groomName} &amp; {brideName}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5AD]/60">
                  <span className="text-[10px] font-mono text-[#75675C] block uppercase font-semibold">Theme</span>
                  <span className="font-bold text-[#6E1020] text-sm truncate block mt-0.5">
                    {currentThemeObj.name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8D5AD]/60">
                  <span className="text-[10px] font-mono text-[#75675C] block uppercase font-semibold">Edition</span>
                  <span className="font-bold text-[#6E1020] text-sm truncate block mt-0.5">
                    {OFFICIAL_PACKAGES[themePackageId].name}
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#E8D5AD]/60">
                <div>
                  <span className="text-xs font-bold text-[#241A17] block">Total Payable</span>
                  <span className="text-[10px] text-[#75675C]">Includes all royal features, music, GPS maps &amp; live guest RSVPs</span>
                </div>
                <div className="text-right">
                  {paymentDetails.isPartnerPricing && (
                    <span className="text-xs line-through text-[#75675C] mr-2">
                      ₹{paymentDetails.retailPriceInr.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="font-cormorant font-bold text-3xl text-[#6E1020]">
                    ₹{finalPayableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Dedicated URL Customizer */}
              <div className="pt-2 border-t border-[#E8D5AD]/60 space-y-1.5">
                <label className="text-xs font-semibold text-[#6E1020] flex items-center justify-between">
                  <span>Choose Your Invitation Link:</span>
                  <span className="text-[10px] font-mono text-[#C49A35]">Direct Short Link</span>
                </label>
                <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E8D5AD] rounded-xl px-3.5 py-2.5 text-xs font-mono">
                  <span className="text-[#C49A35] font-bold shrink-0">{cleanDomain}/i/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    className="flex-1 bg-transparent font-bold text-[#6E1020] focus:outline-none"
                    placeholder="dhruv-shreya"
                  />
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={triggerPublishSequence}
                disabled={isVerifyingPayment}
                className="w-full py-4 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
              >
                {isVerifyingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C49A35]" />
                    <span>Preparing Royal Cloud...</span>
                  </>
                ) : finalPayableAmount > 0 ? (
                  <>
                    <CreditCard className="w-4 h-4 text-[#C49A35]" />
                    <span>Pay ₹{finalPayableAmount} &amp; Publish Kankotri</span>
                    <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C49A35]" />
                    <span>Publish Royal Kankotri Now (Free / Unlocked)</span>
                    <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 🎬 STAGE 1: CINEMATIC CRAFTING PROGRESS */}
        {stage === 'animating' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 animate-fadeIn">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#6E1020] border-2 border-[#C49A35] flex items-center justify-center text-3xl shadow-xl">
                <span className="animate-pulse">👑</span>
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#C49A35]/60 animate-spin" style={{ animationDuration: '12s' }} />
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

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="w-full bg-[#FAF8F5] border border-[#E8D5AD] h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-[#C49A35] to-[#701222] h-full rounded-full transition-all duration-300"
                  style={{ width: `${publishProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#75675C]">
                <span>Deploying to Cloud CDN</span>
                <span className="font-bold text-[#6E1020]">{publishProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 STAGE 1.5: SUCCESS BEAT MOMENT */}
        {stage === 'success_beat' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 animate-fadeIn">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#167A5A] border-2 border-[#C49A35] flex items-center justify-center shadow-xl">
                <Check className="w-10 h-10 text-[#FFFDF8]" />
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#C49A35]/60 animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#167A5A] font-bold tracking-wider block">
                ✦ 24K GOLD SEAL AFFIXED ✦
              </span>
              <h3 className="font-cormorant font-bold text-3xl text-[#6E1020]">
                Your Royal Kankotri is Live!
              </h3>
              <p className="text-xs text-[#75675C]">
                ॥ बधाई हो · शाही निमंत्रण सफलता पूर्वक प्रकाशित हो चुका है ॥
              </p>
            </div>
          </div>
        )}

        {/* 🎊 STAGE 2: PUBLISHED SHARE CENTER */}
        {stage === 'completed' && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-left">
            
            {/* 1. Standalone Dedicated Link Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E1020] flex items-center gap-1.5 uppercase font-mono">
                  <Globe className="w-4 h-4 text-[#C49A35]" />
                  <span>1. Dedicated Live Invitation Link</span>
                </span>
                <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 px-2.5 py-0.5 rounded-full border border-[#167A5A]/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#167A5A]" /> Full-Screen Live
                </span>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8D5AD] p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                <div className="truncate text-xs font-mono font-bold text-[#6E1020] flex items-center gap-1.5" title={fullUrl}>
                  <Globe className="w-3.5 h-3.5 text-[#C49A35] shrink-0" />
                  <span className="truncate">{fullUrl}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C49A35]" />
                    <span>Open ↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-2xs ${
                      copied 
                        ? 'bg-[#167A5A] text-white border-[#167A5A]' 
                        : 'bg-white border-[#E8D5AD] text-[#6E1020] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied ✓' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Direct WhatsApp Instant Share */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6E1020] flex items-center gap-1.5 uppercase font-mono">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>2. 1-Click WhatsApp Invitation Dispatch</span>
                </span>
                <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 px-2.5 py-0.5 rounded-full border border-[#167A5A]/30 font-bold">
                  ✓ Rich Preview Ready
                </span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between bg-[#FAF8F5] p-2 rounded-xl border border-[#E8D5AD]">
                <span className="text-xs font-semibold text-[#241A17] pl-1">
                  Message Language:
                </span>
                <div className="flex items-center gap-1">
                  {(['en', 'hi', 'gu'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                          : 'bg-white text-[#75675C] hover:text-[#241A17] border border-[#E8D5AD]'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Chat Preview Bubble */}
              <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-[#E0D7CB] shadow-inner space-y-2">
                <div className="max-w-md bg-[#DCF8C6] text-[#111B21] p-3 rounded-2xl rounded-tl-sm shadow-xs space-y-2 text-xs border border-[#C5E1A5]">
                  <div className="bg-white rounded-xl overflow-hidden border border-black/10 shadow-2xs">
                    <div className="h-28 bg-[#1C060A] relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={state.media.photoSlots?.hero?.url || `/previews/theme-${state.theme}.webp`} 
                        alt="Royal Couple Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/previews/theme-rajmahal.webp'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>👑 {groomName} &amp; {brideName}</span>
                        <span className="text-[9px] font-mono text-[#D4B37F] bg-black/40 px-1.5 py-0.5 rounded">Shahi Vivah</span>
                      </div>
                    </div>
                    <div className="p-2.5 space-y-0.5 bg-[#FAF8F5]">
                      <h5 className="font-bold text-[#6E1020] text-xs line-clamp-1">
                        {getLocalizedCardTitle(state, selectedLanguage)}
                      </h5>
                      <p className="text-[10px] text-[#75675C] line-clamp-2">
                        {getLocalizedCardSubtitle(state, selectedLanguage)}
                      </p>
                      <span className="text-[9px] font-mono text-stone-500 block pt-0.5">
                        {cleanDomain}
                      </span>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                    {whatsappMessage}
                  </div>
                  <div className="text-[9px] text-[#667781] text-right font-mono">
                    11:42 AM · Sent ✓✓
                  </div>
                </div>
              </div>

              {/* WhatsApp Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send on WhatsApp ({selectedLanguage.toUpperCase()})</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`px-4 py-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                    copiedMsg
                      ? 'bg-[#167A5A] text-white border-[#167A5A]'
                      : 'bg-white border-[#E8D5AD] text-[#6E1020] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMsg ? 'Copied Text ✓' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* 3. 4K Assets Download Hub */}
            {onOpenDownloadHub && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#6E1020] border border-[#C49A35] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#430914] text-[#C49A35] flex items-center justify-center font-bold shrink-0 border border-[#C49A35]">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cormorant font-bold text-base text-[#FFFDF8]">
                        Download 4K Print QR &amp; Story Assets
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#C49A35] text-[#430914] px-2 py-0.5 rounded-full">
                        300 DPI
                      </span>
                    </div>
                    <p className="text-xs text-[#E8D5AD]">
                      Print QR Cards, 9:16 WhatsApp Story posters &amp; offline assets.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDownloadHub();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#C49A35] hover:bg-[#D8AF4B] text-[#430914] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-105 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#430914]" />
                  <span>Open Download Hub</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#FFFDF8] border-t border-[#E8D5AD] p-4 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
