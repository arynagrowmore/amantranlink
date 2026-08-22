import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, Copy, Check, QrCode, Download, ExternalLink, Globe, 
  MessageCircle, Send, X, ShieldCheck, Sparkles, Loader2, Award, 
  Heart, CreditCard, Smartphone, Tag, ArrowRight, CheckCircle2,
  Lock, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeddingProjectState, Language } from '../types/wedding';
import { RoyalCrestIcon, DiyaIcon, PalaceGateIcon, ShehnaiIcon } from './ShahiIcons';
import { savePublishedInvitation } from '../utils/invitationStorage';
import { isTemplateUnlockedForUser, initiateRazorpayCheckout } from '../services/razorpayClient';
import { publishWeddingSite } from '../services/weddingSiteService';
import { useAuth } from '../context/AuthContext';
import { themes } from './ThemeSelector';
import { THEME_PACKAGE_MAP, calculatePaymentDetails, OFFICIAL_PACKAGES } from '../config/pricing';
import { 
  generateWhatsAppMessage, 
  getLocalizedCardTitle, 
  getLocalizedCardSubtitle 
} from '../utils/whatsappInvitationGenerator';

interface PublishModalProps {
  state: WeddingProjectState;
  onClose: () => void;
}

type ModalStage = 'checkout' | 'animating' | 'success_beat' | 'completed';

export const PublishModal: React.FC<PublishModalProps> = ({ state, onClose }) => {
  const { user } = useAuth();
  // 🎯 Main Flow State: 'checkout' -> 'animating' -> 'success_beat' -> 'completed'
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

  // Authoritative Single Source of Truth Pricing
  const currentThemeObj = themes.find((t) => t.id === state.theme) || themes[0];
  const themePackageId = THEME_PACKAGE_MAP[state.theme] || 'gold';
  const isAlreadyUnlocked = isTemplateUnlockedForUser(user?.uid, state.theme);
  const paymentDetails = calculatePaymentDetails(themePackageId, state.theme);
  const baseThemePrice = isAlreadyUnlocked ? 0 : paymentDetails.originalAmountInr;
  const finalPayableAmount = isAlreadyUnlocked ? 0 : paymentDetails.finalAmountInr;

  // 🎯 Couple's personalized pure Short URL slug (e.g. dhruv-shreya)
  const coupleSlug = `${(state.couple.groomEn || 'dhruv').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'shreya').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const [slug, setSlug] = useState<string>(coupleSlug);

  // Base domain & Canonical Public Invitation Short Link resolution
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://shahistudio.com';
  const cleanDomain = origin.replace(/^https?:\/\//, '');
  
  // 🔗 Canonical Pure & Dedicated Public Invitation Route (e.g. /i/dhruv-shreya)
  const shortUrl = `${origin}/i/${slug}`;
  const prettyUrl = shortUrl;
  const fullUrl = shortUrl;

  // 🌐 Multilingual WhatsApp Language State (Inherits from Customizer state.language, default EN)
  const initialLang: Language = (state?.language === 'hi' || state?.language === 'gu') ? state.language : 'en';
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLang);

  // Sync if state.language updates
  useEffect(() => {
    if (state?.language) {
      const validLang: Language = (state.language === 'hi' || state.language === 'gu') ? state.language : 'en';
      setSelectedLanguage(validLang);
    }
  }, [state?.language]);

  // Dynamic Couple Names based on selected language
  const groomName = selectedLanguage === 'hi' ? (state.couple.groomHi || state.couple.groomEn) :
                    selectedLanguage === 'gu' ? (state.couple.groomGu || state.couple.groomEn) :
                    state.couple.groomEn;
  const brideName = selectedLanguage === 'hi' ? (state.couple.brideHi || state.couple.brideEn) :
                    selectedLanguage === 'gu' ? (state.couple.brideGu || state.couple.brideEn) :
                    state.couple.brideEn;

  // Auspicious Personalized WhatsApp Message with Canonical Invitation Route
  const whatsappMessage = generateWhatsAppMessage({
    language: selectedLanguage,
    state,
    invitationUrl: fullUrl,
  });

  // Save current state to registry & localStorage
  useEffect(() => {
    if (stage === 'completed') {
      savePublishedInvitation(slug, state);
    }
  }, [state, slug, stage]);

  // Start Ceremonial Publishing Flow after Payment (Razorpay Only)
  const triggerPublishSequence = async () => {
    if (finalPayableAmount > 0) {
      setIsVerifyingPayment(true);
      setPaymentError(null);

      await initiateRazorpayCheckout({
        templateId: state.theme,
        packageId: themePackageId,
        uid: user?.uid || `user_${Date.now()}`,
        userName: groomName ? `${groomName} & ${brideName}` : 'Royal Couple',
        userEmail: user?.email || `${(groomName || 'dhruv').toLowerCase()}.${(brideName || 'shreya').toLowerCase()}@shahistudio.com`,
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

    // Already unlocked template
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

    const t1 = setTimeout(() => {
      setPublishProgress(38);
      setCurrentTaskIndex(1);
    }, 550);

    const t2 = setTimeout(() => {
      setPublishProgress(58);
      setCurrentTaskIndex(2);
    }, 1100);

    const t3 = setTimeout(() => {
      setPublishProgress(78);
      setCurrentTaskIndex(3);
    }, 1650);

    const t4 = setTimeout(() => {
      setPublishProgress(92);
      setCurrentTaskIndex(4);
    }, 2200);

    const t5 = setTimeout(() => {
      setPublishProgress(100);
      setCurrentTaskIndex(5);
      setPublishStageToSuccess();
    }, 2750);
  };

  const setPublishStageToSuccess = () => {
    // 1. Persist published site to localStorage and Supabase
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
      // 🎊 Grand Royal Gold & Marigold Shower!
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.45 },
        colors: ['#A67C3D', '#C4522A', '#E59838', '#6B1420', '#F7F0DD'],
        ticks: 260,
        gravity: 0.75,
        scalar: 1.15,
      });
    }, 950);
  };

  // Copy Helpers
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
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // On mobile, use direct whatsapp scheme; on desktop, use WhatsApp Web / API
    const targetUrl = isMobile 
      ? `https://api.whatsapp.com/send?text=${encoded}` 
      : `https://web.whatsapp.com/send?text=${encoded}`;
    
    const win = window.open(targetUrl, '_blank');
    if (!win) {
      window.location.href = `https://api.whatsapp.com/send?text=${encoded}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140306]/85 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#F7F0DD] rounded-3xl border-2 border-[#A67C3D] shadow-[0_30px_90px_rgba(74,12,20,0.6)] overflow-hidden flex flex-col max-h-[94vh] relative">
        
        {/* Four Corner Ornamental Flourishes */}
        <div className="absolute top-2.5 left-2.5 text-[#A67C3D] text-sm pointer-events-none z-30 select-none">✦</div>
        <div className="absolute top-2.5 right-2.5 text-[#A67C3D] text-sm pointer-events-none z-30 select-none">✦</div>
        <div className="absolute bottom-2.5 left-2.5 text-[#A67C3D] text-sm pointer-events-none z-30 select-none">✦</div>
        <div className="absolute bottom-2.5 right-2.5 text-[#A67C3D] text-sm pointer-events-none z-30 select-none">✦</div>

        {/* 👑 Top Royal Header */}
        <div className="bg-gradient-to-r from-[#500E1A] via-[#6E1020] to-[#500E1A] border-b-2 border-[#C49A35]/60 p-4 sm:p-5 flex items-center justify-between shrink-0 text-[#FFFDF8] shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#430914] border-2 border-[#C49A35] flex items-center justify-center text-xl text-[#C49A35] shadow-md shrink-0">
              <RoyalCrestIcon className="w-6 h-6 text-[#C49A35]" />
            </div>
            <div>
              <h3 className="font-fraunces font-bold text-lg sm:text-xl text-[#FFFDF8] flex items-center gap-2 tracking-wide drop-shadow-sm">
                <span>
                  {stage === 'checkout' && 'Shahi Checkout & Payment Gateway'}
                  {stage === 'animating' && 'Carving Your Royal Kankotri...'}
                  {stage === 'success_beat' && 'Payment Verified & Live!'}
                  {stage === 'completed' && '👑 Shahi Invitation Publish Center'}
                </span>
              </h3>
              <span className="text-xs font-serif font-bold text-[#E8D5AD] block tracking-wide pt-0.5">
                {stage === 'checkout' && '॥ सुरक्षित भुगतान · लाइफटाइम एक्सेस व लाइव डिजिटल निमंत्रण ॥'}
                {stage === 'animating' && '॥ शाही राजदरबार में निमंत्रण निर्माण प्रक्रिया ॥'}
                {stage === 'completed' && '॥ आपकी शाही कंकोत्री अब लाइव प्रकाशित हो चुकी है ॥'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#E8D5AD] hover:text-[#FFFDF8] hover:bg-white/10 transition-colors border border-[#C49A35]/40 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 💳 STAGE 0: SHAHI STUDIO ROYAL INVITATION CHECKOUT (RAZORPAY ONLY) */}
        {stage === 'checkout' && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-left font-hanken">
            {/* Header Title & Subtitle */}
            <div className="text-center sm:text-left space-y-1 pb-1">
              <h3 className="font-fraunces font-bold text-lg sm:text-xl text-[#6B1420] tracking-wide">
                Complete Your Royal Invitation
              </h3>
              <p className="text-xs text-[#2B1810]/75 font-serif italic">
                Secure your invitation, unlock your selected theme, and publish your royal kankotri.
              </p>
            </div>

            {/* 1. Auspicious Order Summary */}
            <div className="p-4 rounded-2xl bg-[#EDE0C8] border border-[#A67C3D] space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D8C7AA] pb-2.5">
                <span className="text-xs font-fraunces font-bold text-[#6B1420] flex items-center gap-1.5 uppercase tracking-wider">
                  <RoyalCrestIcon className="w-4 h-4 text-[#A67C3D]" />
                  <span>Order Summary</span>
                </span>
                {isAlreadyUnlocked ? (
                  <span className="text-[10px] font-mono bg-[#3D6B4A] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Theme Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#6B1420] bg-[#6B1420]/10 px-2.5 py-0.5 rounded-full border border-[#6B1420]/30 font-bold">
                    One-time Lifetime Access
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA]">
                  <span className="text-[9px] font-mono text-[#A67C3D] block font-bold uppercase">COUPLE:</span>
                  <span className="font-fraunces font-bold text-[#6B1420] text-xs sm:text-sm truncate block">
                    👑 {groomName} &amp; {brideName}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA]">
                  <span className="text-[9px] font-mono text-[#A67C3D] block font-bold uppercase">SELECTED THEME:</span>
                  <span className="font-fraunces font-bold text-[#6B1420] text-xs sm:text-sm truncate block">
                    {currentThemeObj.name}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA]">
                  <span className="text-[9px] font-mono text-[#A67C3D] block font-bold uppercase">PACKAGE:</span>
                  <span className="font-fraunces font-bold text-[#6B1420] text-xs sm:text-sm truncate block">
                    {OFFICIAL_PACKAGES[themePackageId].name}
                  </span>
                </div>
              </div>

              {/* Dynamic Price Summary Line */}
              <div className="flex items-baseline justify-between pt-1 border-t border-[#D8C7AA]/70">
                <div>
                  <span className="text-xs font-bold text-[#2B1810] block">Total Payable</span>
                  <span className="text-[10px] text-[#806B5A]">Includes all royal features &amp; hosting</span>
                </div>
                <div className="text-right">
                  <span className="font-fraunces font-extrabold text-2xl text-[#6B1420]">
                    ₹{finalPayableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Custom Short URL Slug editor */}
              <div className="pt-2 border-t border-[#D8C7AA]/70 space-y-1">
                <label className="text-[11px] font-fraunces font-bold text-[#6B1420] flex items-center justify-between">
                  <span>Your Dedicated Short Link Slug:</span>
                  <span className="text-[9px] font-mono text-[#A67C3D]">Clean &amp; Direct URL</span>
                </label>
                <div className="flex items-center gap-1.5 bg-[#F7F0DD] border border-[#A67C3D] rounded-xl px-3 py-2 text-xs font-mono">
                  <span className="text-[#A67C3D] font-bold shrink-0">{cleanDomain}/i/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    className="flex-1 bg-transparent font-bold text-[#6B1420] focus:outline-none"
                    placeholder="dhruv-shreya"
                  />
                </div>
              </div>
            </div>

            {/* 2. Razorpay Secure Payment (Shown if not yet unlocked) */}
            {finalPayableAmount === 0 ? (
              <div className="p-4 rounded-2xl bg-[#E8F2EC] border border-[#3D6B4A] space-y-2 text-center shadow-xs">
                <span className="text-2xl">✨</span>
                <h4 className="font-fraunces font-bold text-sm text-[#2A5236]">
                  Auspicious Theme Unlocked &amp; Ready to Publish!
                </h4>
                <p className="text-xs text-[#2A5236]/80 font-medium">
                  Click below to finalize and publish your royal invitation with lifetime access, Shehnai melody &amp; live guest RSVPs.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Razorpay Gateway Overview Box */}
                <div className="p-4 rounded-2xl bg-[#EDE0C8] border border-[#A67C3D] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-fraunces font-bold text-sm text-[#6B1420] block">
                          Secure Payment Powered by Razorpay
                        </span>
                        <span className="text-[9px] font-mono bg-[#3D6B4A] text-white px-2 py-0.5 rounded font-bold">
                          ✓ Verified Merchant
                        </span>
                      </div>
                      <span className="text-[11px] text-[#2B1810] font-medium">
                        Instant UPI (GPay, PhonePe, Paytm), RuPay / Visa / MasterCard &amp; 50+ Banks
                      </span>
                    </div>
                  </div>

                  {/* Razorpay Supported Modes Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    <div className="p-2 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA] text-center">
                      <span className="text-[10px] font-bold text-[#6B1420] block">⚡ Instant UPI</span>
                      <span className="text-[9px] text-[#2B1810]">GPay, PhonePe</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA] text-center">
                      <span className="text-[10px] font-bold text-[#6B1420] block">💳 Cards</span>
                      <span className="text-[9px] text-[#2B1810]">Credit / Debit</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA] text-center">
                      <span className="text-[10px] font-bold text-[#6B1420] block">🏦 NetBanking</span>
                      <span className="text-[9px] text-[#2B1810]">50+ Indian Banks</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F7F0DD] border border-[#D8C7AA] text-center">
                      <span className="text-[10px] font-bold text-[#6B1420] block">🔒 Security</span>
                      <span className="text-[9px] text-[#2B1810]">PCI-DSS Level 1</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Error Banner if Failed */}
            {paymentError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Payment Could Not Be Completed</span>
                </div>
                <p className="text-[11px] text-rose-700">{paymentError}</p>
              </div>
            )}

            {/* 4. Dominant Royal Payment Action Button */}
            <div className="pt-1 space-y-2.5">
              <button
                type="button"
                onClick={triggerPublishSequence}
                disabled={isVerifyingPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7A1024] via-[#8E182C] to-[#7A1024] hover:from-[#5A0C1B] hover:to-[#5A0C1B] text-[#F8F2E5] font-fraunces font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl border border-[#C89B2C] hover:-translate-y-0.5 active:scale-[0.99] transition-all min-h-[48px] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isVerifyingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#F8F2E5]" />
                    <span>SECURELY PROCESSING...</span>
                  </>
                ) : finalPayableAmount === 0 ? (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C89B2C]" />
                    <span>👑 FINALIZE &amp; PUBLISH LIVE KANKOTRI</span>
                    <ArrowRight className="w-4 h-4 text-[#C89B2C]" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#C89B2C]" />
                    <span>🔒 PAY ₹{finalPayableAmount.toLocaleString('en-IN')} &amp; PUBLISH MY KANKOTRI →</span>
                  </>
                )}
              </button>

              {/* Truthful Trust Indicators */}
              <div className="text-center text-[10px] text-[#806B5A] flex items-center justify-center gap-2 pt-0.5">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Secure Razorpay Payment</span>
                </span>
                <span>•</span>
                <span>Instant Unlock After Confirmation</span>
                <span>•</span>
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        )}

        {/* 👑 STAGE 1: ULTRA-HEAVY CINEMATIC ROYAL DARBAR PUBLISHING ANIMATION (LIGHT THEME) */}
        {stage === 'animating' && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 flex-1 bg-gradient-to-b from-[#F7F0DD] via-[#EDE0C8] to-[#F5EAD4] text-[#2B1810] relative overflow-hidden">
            
            {/* Ambient Shimmer & Sacred Jaali Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#A67C3D_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-20 pointer-events-none"></div>
            
            {/* Top Sacred Shloka Ribbon */}
            <div className="relative z-10 px-5 py-2 rounded-full bg-[#FFFDF9]/90 border-2 border-[#A67C3D]/70 shadow-sm text-center">
              <span className="font-baloo text-xs sm:text-sm text-[#6B1420] font-bold tracking-wider block">
                ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
              </span>
            </div>

            {/* Central Grand 3D Royal Crest with Rotating Concentric Gold Rings & Glowing Diyas */}
            <div className="relative flex items-center justify-center py-2 z-10">
              {/* Left Diya */}
              <div className="absolute -left-12 sm:-left-16 flex flex-col items-center animate-bounce duration-1000">
                <DiyaIcon className="w-8 h-8 text-[#C4522A] drop-shadow-[0_0_10px_rgba(196,82,42,0.6)]" />
                <span className="text-[10px] font-baloo text-[#6B1420] font-bold mt-1">शुभ</span>
              </div>

              {/* Glowing Center Crown & Seal */}
              <div className="relative">
                {/* Outer Rotating Sanskrit Mandap Ring */}
                <div 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-[#A67C3D] flex items-center justify-center shadow-[0_0_20px_rgba(166,124,61,0.25)]"
                  style={{ animation: 'spin 18s linear infinite' }}
                >
                  <div className="w-full h-full rounded-full border border-[#A67C3D]/40 p-2"></div>
                </div>

                {/* Inner Counter-Rotating Ring */}
                <div 
                  className="absolute inset-2 rounded-full border border-dotted border-[#C4522A]/70"
                  style={{ animation: 'spin 12s linear infinite reverse' }}
                ></div>

                {/* 3D Solid Maroon & Gold Core Wax Seal */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#7E1827] via-[#6B1420] to-[#4A0C14] border-2 border-[#A67C3D] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(107,20,32,0.35)]">
                  <span className="animate-pulse">👑</span>
                </div>
              </div>

              {/* Right Diya */}
              <div className="absolute -right-12 sm:-right-16 flex flex-col items-center animate-bounce duration-1000">
                <DiyaIcon className="w-8 h-8 text-[#C4522A] drop-shadow-[0_0_10px_rgba(196,82,42,0.6)]" />
                <span className="text-[10px] font-baloo text-[#6B1420] font-bold mt-1">लाभ</span>
              </div>
            </div>

            {/* Active Craftsmanship Stage Details */}
            <div className="space-y-1.5 max-w-lg min-h-[70px] flex flex-col justify-center relative z-10">
              <span className="stamped-label text-[#A67C3D] tracking-[0.2em] text-[10px] font-bold block">
                STAGE {currentTaskIndex + 1} OF 6 · {publishingTasks[currentTaskIndex]?.title}
              </span>
              <h4 className="font-fraunces font-bold text-lg sm:text-xl text-[#6B1420] tracking-tight">
                {publishingTasks[currentTaskIndex]?.text}
              </h4>
              <p className="font-baloo text-xs text-[#A67C3D] font-bold">
                ॥ {publishingTasks[currentTaskIndex]?.hindi} ॥
              </p>
            </div>

            {/* Heavy Luxury Gold Progress Bar with Sparkling Shimmer Light Trail */}
            <div className="w-full max-w-md space-y-2.5 relative z-10">
              <div className="w-full bg-[#EDE0C8] h-4 rounded-full overflow-hidden border-2 border-[#A67C3D] p-0.5 relative shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#A67C3D] via-[#C4522A] to-[#6B1420] h-full rounded-full transition-all duration-500 shadow-md relative"
                  style={{ width: `${publishProgress}%` }}
                >
                  {/* Glowing Leading Edge Particle */}
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full blur-[0.5px] shadow-[0_0_6px_#FFF]"></div>
                </div>

                {/* 6 Stage Ticks */}
                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx <= currentTaskIndex 
                          ? 'bg-[#FFFDF9] shadow-sm' 
                          : 'bg-[#D8C7AA]'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center justify-between text-xs font-mono font-bold px-1 text-[#6B1420]">
                <span className="flex items-center gap-1 text-[#A67C3D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4522A] animate-spin" />
                  <span>Royal Cloud Engine Active</span>
                </span>
                <span className="text-[#FFFDF9] bg-[#6B1420] px-2.5 py-0.5 rounded-full border border-[#A67C3D] shadow-sm">
                  {publishProgress}% COMPLETED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 STAGE 1.5: SUCCESS BEAT MOMENT */}
        {stage === 'success_beat' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 animate-fadeIn bg-gradient-to-b from-[#F7F0DD] via-[#E8F2EC] to-[#F5EAD4] text-[#2B1810]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3D6B4A] via-[#2A5236] to-[#1C3824] border-3 border-[#A67C3D] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(61,107,74,0.4)] scale-110 transition-transform">
                <Check className="w-12 h-12 text-[#FFFDF9]" />
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#A67C3D] animate-spin"></div>
            </div>
            <div className="space-y-2">
              <span className="stamped-label text-[#3D6B4A] text-xs tracking-widest font-bold block">
                ✦ 24K GOLD SEAL AFFIXED ✦
              </span>
              <h3 className="font-fraunces font-black text-2xl sm:text-3xl text-[#6B1420]">
                Your Royal Kankotri is Live!
              </h3>
              <p className="font-baloo text-sm text-[#A67C3D] font-bold">
                ॥ बधाई हो · शाही निमंत्रण सफलता पूर्वक प्रकाशित हो चुका है ॥
              </p>
            </div>
          </div>
        )}

        {/* 🎊 STAGE 2: PUBLISHED LIVE SHARE CENTER (Certificate Moment) */}
        {stage === 'completed' && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 animate-fadeIn">
            {/* 1. Standalone Dedicated Link */}
            <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B1420] font-fraunces flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#A67C3D]" />
                  <span>1. Dedicated Standalone Live Invitation URL</span>
                </span>
                <span className="text-[10px] font-mono text-[#3D6B4A] bg-[#3D6B4A]/10 px-2 py-0.5 rounded-full border border-[#3D6B4A]/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#3D6B4A]" /> Full-Screen Live Invitation
                </span>
              </div>

              {/* Generated Live URL Display with Open and Copy */}
              <div className="bg-[#EDE0C8] border border-[#A67C3D] p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                <div className="truncate text-xs font-mono font-bold text-[#6B1420] flex items-center gap-1.5" title={fullUrl}>
                  <Globe className="w-3.5 h-3.5 text-[#A67C3D] shrink-0" />
                  <span className="truncate">{prettyUrl}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl btn-vermillion text-xs uppercase font-bold flex items-center gap-1.5 shadow min-h-[36px]"
                    title="Open live invitation in full-screen tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#F7F0DD]" />
                    <span>Open Kankotri ↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm min-h-[36px] ${
                      copied 
                        ? 'bg-[#3D6B4A] text-white border-[#3D6B4A]' 
                        : 'bg-[#F7F0DD] border-[#A67C3D] text-[#6B1420] hover:bg-[#EDE0C8]'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied ✓' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-[#A67C3D] italic font-fraunces">
                ✦ Yeh link bina kisi editor ya toolbar ke, seedha pure full-screen shahi kankotri invitation open karega!
              </p>
            </div>

            {/* 2. Direct WhatsApp Instant Share */}
            <div className="p-4 rounded-2xl shahi-card-flat space-y-3.5 bg-[#F7F0DD]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#6B1420] font-fraunces flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>2. 1-Click WhatsApp Royal Invitation Dispatch</span>
                </span>
                <span className="text-[10px] font-mono text-[#3D6B4A] bg-[#3D6B4A]/10 px-2 py-0.5 rounded-full border border-[#3D6B4A]/30 font-bold self-start sm:self-auto">
                  ✓ Rich Card Preview Active
                </span>
              </div>

              {/* 🌐 Interactive Language Switcher Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#EDE0C8] p-2 rounded-xl border border-[#D8C7AA]">
                <span className="text-[11px] font-fraunces font-bold text-[#6B1420] pl-1 flex items-center gap-1.5">
                  <span>🌐 WhatsApp Message Language:</span>
                </span>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {(['en', 'hi', 'gu'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-[#6B1420] text-[#FFFDF9] shadow-sm border border-[#A67C3D]'
                          : 'bg-[#F7F0DD] text-[#6B1420] hover:bg-[#FFFDF9] border border-[#D8C7AA]'
                      }`}
                    >
                      {lang === 'en' ? 'EN (English)' : lang === 'hi' ? 'HI (हिन्दी)' : 'GU (ગુજરાતી)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Realistic WhatsApp Chat Bubble with Rich Media Preview */}
              <div className="bg-[#EFE8DD] p-3 rounded-2xl border border-[#D8C7AA] shadow-inner space-y-2">
                <div className="text-[10px] font-mono text-[#6B5A4A] flex items-center justify-between px-1">
                  <span>📱 WhatsApp Message &amp; Rich Link Card Preview ({selectedLanguage.toUpperCase()}):</span>
                  <span className="text-[#25D366] font-bold">● Live Preview</span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="max-w-md bg-[#DCF8C6] text-[#111B21] p-3 rounded-2xl rounded-tl-sm shadow-sm space-y-2 text-xs border border-[#C5E1A5]">
                  {/* Rich OpenGraph Card Box */}
                  <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#D8C7AA]/70 shadow-xs">
                    <div className="h-28 bg-[#1C060A] relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={state.media.photoSlots?.hero?.url || `/previews/theme-${state.theme}.webp`} 
                        alt="Royal Couple Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/previews/theme-rajmahal.webp'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="drop-shadow">👑 {groomName} &amp; {brideName}</span>
                        <span className="text-[9px] font-mono text-[#D4B37F] bg-black/40 px-1.5 py-0.5 rounded">Shahi Vivah</span>
                      </div>
                    </div>
                    <div className="p-2.5 space-y-0.5 bg-[#FAF7F2]">
                      <h5 className="font-bold text-[#6B1420] text-xs line-clamp-1">
                        {getLocalizedCardTitle(state, selectedLanguage)}
                      </h5>
                      <p className="text-[10px] text-[#6B5A4A] line-clamp-2">
                        {getLocalizedCardSubtitle(state, selectedLanguage)}
                      </p>
                      <span className="text-[9px] font-mono text-[#8696A0] block pt-1">
                        {cleanDomain}
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                    {whatsappMessage}
                  </div>
                  <div className="text-[9px] text-[#667781] text-right font-mono">
                    11:42 AM · Sent ✓✓
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-fraunces font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Open &amp; Send on WhatsApp ({selectedLanguage.toUpperCase()})</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`px-4 py-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm min-h-[44px] transition-all cursor-pointer ${
                    copiedMsg
                      ? 'bg-[#3D6B4A] text-white border-[#3D6B4A]'
                      : 'bg-[#F7F0DD] border-[#D8C7AA] hover:border-[#A67C3D] text-[#6B1420]'
                  }`}
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMsg ? 'Copied Text ✓' : `Copy Text (${selectedLanguage.toUpperCase()})`}</span>
                </button>
              </div>
            </div>

            {/* 3. Re-Lock Status Indicator */}
            <div className="p-4 rounded-2xl bg-[#EDE0C8] border-2 border-[#A67C3D]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6B1420] text-[#F7F0DD] flex items-center justify-center font-bold shrink-0 shadow-sm border border-[#A67C3D]">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <span className="font-fraunces font-bold text-xs sm:text-sm text-[#6B1420] block">
                    🔒 EDITING LOCKED · INVITATION LIVE
                  </span>
                  <span className="text-[11px] text-[#806B5A] block">
                    Your invitation is live and protected. Editing is locked.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#3D6B4A] text-white px-2.5 py-1 rounded-full shrink-0 shadow-xs">
                ✓ Live on Web
              </span>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="bg-[#EDE0C8] border-t border-[#D8C7AA] p-4 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl artisan-btn-gold text-xs font-fraunces font-bold flex items-center justify-center gap-2 shadow-md min-h-[40px] cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#D4B37F]" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

