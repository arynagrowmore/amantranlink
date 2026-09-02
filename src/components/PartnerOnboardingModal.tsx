import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  X, Camera, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, 
  CheckCircle2, Wallet, Link2, Building2, User, Phone, Mail, 
  MapPin, Globe, Instagram, Lock, AlertCircle, RefreshCw, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkStudioHandleAvailability } from '../services/partnerService';

interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
}

const STORAGE_DRAFT_KEY = 'AMANTRANLINK_STUDIO_ONBOARDING_DRAFT';

export const PartnerOnboardingModal: React.FC<PartnerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigateLogin,
}) => {
  const { user, upgradeToPartner } = useAuth();
  
  // Step state: 1 (Identity), 2 (Handle), 3 (Terms & Payout), 4 (Review & Activate), 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Form fields
  const [studioName, setStudioName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 ');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [websiteOrInsta, setWebsiteOrInsta] = useState<string>('');
  
  const [partnerSlug, setPartnerSlug] = useState<string>('');
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [handleError, setHandleError] = useState<string>('');
  
  const [payoutUpi, setPayoutUpi] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Submission & UI States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Restore draft from sessionStorage on mount / open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const draftJson = sessionStorage.getItem(STORAGE_DRAFT_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        if (draft.studioName) setStudioName(draft.studioName);
        if (draft.contactName) setContactName(draft.contactName);
        if (draft.phone) setPhone(draft.phone);
        if (draft.email) setEmail(draft.email);
        if (draft.city) setCity(draft.city);
        if (draft.stateName) setStateName(draft.stateName);
        if (draft.websiteOrInsta) setWebsiteOrInsta(draft.websiteOrInsta);
        if (draft.partnerSlug) setPartnerSlug(draft.partnerSlug);
        if (draft.payoutUpi) setPayoutUpi(draft.payoutUpi);
        if (draft.currentStep && draft.currentStep < 5) setCurrentStep(draft.currentStep);
      } else if (user) {
        if (user.studioName) setStudioName(user.studioName);
        else if (user.name) setStudioName(`${user.name} Photography`);
        if (user.name) setContactName(user.name);
        if (user.phone) setPhone(user.phone);
        if (user.email) setEmail(user.email);
        if (user.partnerSlug) setPartnerSlug(user.partnerSlug);
        if (user.payoutUpi) setPayoutUpi(user.payoutUpi);
      }
    } catch (e) {}
  }, [isOpen, user]);

  // Persist form draft on field change
  useEffect(() => {
    if (!isOpen) return;
    try {
      sessionStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify({
        studioName,
        contactName,
        phone,
        email,
        city,
        stateName,
        websiteOrInsta,
        partnerSlug,
        payoutUpi,
        currentStep: currentStep < 5 ? currentStep : 1
      }));
    } catch (e) {}
  }, [isOpen, studioName, contactName, phone, email, city, stateName, websiteOrInsta, partnerSlug, payoutUpi, currentStep]);

  // Handle auto-generation from Studio Name
  const handleStudioNameChange = (val: string) => {
    setStudioName(val);
    if (!partnerSlug || partnerSlug === studioName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const generated = val.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setPartnerSlug(generated);
    }
  };

  // Debounced Handle Availability Check
  useEffect(() => {
    if (!partnerSlug || currentStep !== 2) return;
    const cleanSlug = partnerSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (cleanSlug.length < 3) {
      setHandleStatus('idle');
      setHandleError('Handle must be at least 3 characters');
      return;
    }

    setHandleStatus('checking');
    setHandleError('');

    const timer = setTimeout(async () => {
      const result = await checkStudioHandleAvailability(cleanSlug, user?.uid);
      if (result.available) {
        setHandleStatus('available');
        setHandleError('');
      } else {
        setHandleStatus('taken');
        setHandleError(result.reason || 'This studio handle is already taken');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [partnerSlug, currentStep, user?.uid]);

  if (!isOpen) return null;

  const previewSlug = partnerSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '') || 'your-studio';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amantranlink.com';
  const referralPreviewUrl = `${origin}/?partner=${previewSlug}`;

  // Form validations per step
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!studioName.trim()) newErrors.studioName = 'Studio or photography business name is required.';
    if (!contactName.trim()) newErrors.contactName = 'Studio contact name is required.';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit WhatsApp phone number.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid studio email address.';
    }
    if (!city.trim()) newErrors.city = 'City is required.';
    if (!stateName.trim()) newErrors.stateName = 'State is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const cleanSlug = partnerSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanSlug || cleanSlug.length < 3) {
      newErrors.partnerSlug = 'Studio handle must be at least 3 characters long.';
    } else if (handleStatus === 'taken') {
      newErrors.partnerSlug = handleError || 'This studio handle is already taken. Please choose another.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && handleStatus !== 'taken';
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (payoutUpi.trim() && !payoutUpi.includes('@')) {
      newErrors.payoutUpi = 'Please enter a valid UPI ID (e.g. yourstudio@okaxis or 9876543210@upi).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setSubmitError('');
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setSubmitError('');
    setErrors({});
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Safe Exit Handling
  const hasEnteredData = Boolean(
    studioName.trim() || contactName.trim() || city.trim() || partnerSlug.trim()
  );

  const handleCloseAttempt = () => {
    if (hasEnteredData && !isSuccess) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  // Final Partner Activation
  const handleActivateStudio = async () => {
    setSubmitError('');
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setSubmitError('Please complete all required fields correctly before activating.');
      return;
    }

    if (!agreedToTerms) {
      setSubmitError('Please confirm that the information provided is accurate.');
      return;
    }

    // Auth gate: If user is not logged in, prompt authentication
    if (!user) {
      if (onNavigateLogin) {
        onNavigateLogin();
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-login-modal', { detail: { returnToPartnerOnboarding: true } }));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Primary: AuthContext upgradeToPartner
      await upgradeToPartner(studioName.trim(), previewSlug, payoutUpi.trim());
      
      // 2. Clear draft upon success
      try {
        sessionStorage.removeItem(STORAGE_DRAFT_KEY);
      } catch (e) {}

      setIsSuccess(true);
      setCurrentStep(5);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to activate Studio Partner status. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    if (onSuccess) onSuccess();
    onClose();
    if (typeof window !== 'undefined') {
      window.location.hash = '#partner';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-manrope">
      
      {/* ⚠️ Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#FFFDF8] border border-[#E8D5AD] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#6E1020]/10 text-[#6E1020] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-cormorant font-bold text-xl text-[#430914]">Leave Studio Onboarding?</h4>
            <p className="text-xs text-[#75675C] leading-relaxed">
              Your studio onboarding information has not been completed. Your entered details will be preserved in this session.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#6E1020] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Continue Onboarding
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] text-[#430914] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏰 Main Onboarding Container */}
      <div className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-[0_25px_60px_-15px_rgba(67,9,20,0.3)] overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* 👑 Sticky Luxury Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#430914] via-[#5C0D1C] to-[#24060B] text-white relative shrink-0">
          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={isSubmitting}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#C49A35] text-[#24060B] flex items-center justify-center font-bold shadow-md shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#E8D5AD] uppercase block">
                  Studio Partner Network
                </span>
                <span className="bg-[#167A5A] text-[#FFFDF8] text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/40">
                  OFFICIAL PARTNER
                </span>
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8] leading-tight">
                Studio Partner Onboarding
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#E8D5AD]/90 leading-relaxed max-w-xl">
            Deliver bespoke 3D digital wedding invitations to your clients. Access wholesale partner pricing, multi-client hubs, proof review links, and instant referral settlements.
          </p>

          {/* 4-Step Progress Indicator */}
          {!isSuccess && (
            <div className="grid grid-cols-4 gap-2 pt-4 mt-2 border-t border-white/10">
              {[
                { num: 1, label: 'Identity' },
                { num: 2, label: 'Handle' },
                { num: 3, label: 'Terms' },
                { num: 4, label: 'Activate' },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div 
                    className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mb-1 transition-all ${
                      currentStep === s.num
                        ? 'bg-[#C49A35] text-[#24060B] ring-2 ring-white shadow-xs scale-110'
                        : currentStep > s.num
                        ? 'bg-[#167A5A] text-white'
                        : 'bg-white/15 text-[#E8D5AD]/70'
                    }`}
                  >
                    {currentStep > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    currentStep === s.num ? 'text-[#C49A35]' : 'text-[#E8D5AD]/60'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📜 Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4 pb-8 custom-scrollbar">
          
          {submitError && (
            <div className="p-3.5 bg-[#FDF2F4] border border-[#6E1020]/25 text-[#6E1020] text-xs rounded-2xl font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#6E1020]" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: STUDIO IDENTITY                                                  */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#F8F3E8] p-3.5 rounded-2xl border border-[#E8D5AD] flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#C49A35] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#430914] uppercase tracking-wider">Step 1: Studio Identity</h4>
                  <p className="text-[11px] text-[#75675C]">Enter your photography business details for client invitations and partner credentials.</p>
                </div>
              </div>

              {/* Studio Business Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Studio / Photography Business Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => handleStudioNameChange(e.target.value)}
                  placeholder="e.g. Aryan Patel Photography"
                  className={`w-full px-3.5 py-2.5 bg-white border ${errors.studioName ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                />
                {errors.studioName && <p className="text-[11px] text-red-600 font-semibold">{errors.studioName}</p>}
              </div>

              {/* Contact Lead Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Studio Lead / Contact Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Aryan Patel"
                  className={`w-full px-3.5 py-2.5 bg-white border ${errors.contactName ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                />
                {errors.contactName && <p className="text-[11px] text-red-600 font-semibold">{errors.contactName}</p>}
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C49A35]" />
                    <span>WhatsApp / Phone *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3.5 py-2.5 bg-white border ${errors.phone ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs font-mono text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C49A35]" />
                    <span>Studio Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="studio@aryanpatel.com"
                    className={`w-full px-3.5 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs font-mono text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 font-semibold">{errors.email}</p>}
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C49A35]" />
                    <span>City *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ahmedabad / Modasa"
                    className={`w-full px-3.5 py-2.5 bg-white border ${errors.city ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                  />
                  {errors.city && <p className="text-[11px] text-red-600 font-semibold">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C49A35]" />
                    <span>State *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Gujarat"
                    className={`w-full px-3.5 py-2.5 bg-white border ${errors.stateName ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                  />
                  {errors.stateName && <p className="text-[11px] text-red-600 font-semibold">{errors.stateName}</p>}
                </div>
              </div>

              {/* Website / Instagram (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Website or Instagram Profile (Optional)</span>
                </label>
                <input
                  type="text"
                  value={websiteOrInsta}
                  onChange={(e) => setWebsiteOrInsta(e.target.value)}
                  placeholder="e.g. @aryanpatel_films or https://aryanpatel.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8D5AD] rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CHOOSE STUDIO HANDLE                                             */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#F8F3E8] p-3.5 rounded-2xl border border-[#E8D5AD] flex items-center gap-3">
                <Link2 className="w-5 h-5 text-[#C49A35] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#430914] uppercase tracking-wider">Step 2: Choose Studio Handle</h4>
                  <p className="text-[11px] text-[#75675C]">Your unique handle generates your attributed studio referral link and client workspace.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Unique Studio Handle (URL-Safe) *</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-[#F8F3E8] border border-r-0 border-[#E8D5AD] px-3 py-2.5 rounded-l-xl text-[11px] text-[#75675C] font-mono select-none">
                    ?partner=
                  </span>
                  <input
                    type="text"
                    required
                    value={partnerSlug}
                    onChange={(e) => setPartnerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="e.g. aryan-photography"
                    className={`w-full px-3.5 py-2.5 bg-white border ${errors.partnerSlug || handleStatus === 'taken' ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-r-xl text-xs font-mono text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                  />
                </div>

                {/* Handle Availability Feedback */}
                <div className="pt-1">
                  {handleStatus === 'checking' && (
                    <div className="text-[11px] text-[#75675C] flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C49A35]" />
                      <span>Checking handle availability...</span>
                    </div>
                  )}
                  {handleStatus === 'available' && (
                    <div className="text-[11px] text-[#167A5A] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A]" />
                      <span>✓ @{previewSlug} is available!</span>
                    </div>
                  )}
                  {handleStatus === 'taken' && (
                    <div className="text-[11px] text-red-600 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>✕ {handleError || 'This studio handle is already taken'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-white border border-[#C49A35]/40 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#75675C] block">
                  Studio Referral URL Live Preview
                </span>
                <div className="p-3 bg-[#F8F3E8] rounded-xl border border-[#E8D5AD] font-mono text-xs text-[#6E1020] break-all select-all font-semibold">
                  {referralPreviewUrl}
                </div>
                <p className="text-[11px] text-[#75675C] leading-relaxed">
                  ✦ Share this link with clients or embed on your studio website. Any client visiting via this link is automatically attributed to your studio.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: COMMERCIAL & PARTNER TERMS                                       */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#F8F3E8] p-3.5 rounded-2xl border border-[#E8D5AD] flex items-center gap-3">
                <Wallet className="w-5 h-5 text-[#C49A35] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#430914] uppercase tracking-wider">Step 3: Studio Partner Benefits &amp; Terms</h4>
                  <p className="text-[11px] text-[#75675C]">Transparent commercial framework and direct UPI commission settlements.</p>
                </div>
              </div>

              {/* Program Benefits Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8D5AD] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#167A5A]" />
                    <span className="text-xs font-bold text-[#430914]">Wholesale Studio Rates</span>
                  </div>
                  <p className="text-[11px] text-[#75675C] leading-relaxed">
                    Access privileged wholesale pricing across all royal 3D themes for maximum studio margins.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E8D5AD] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C49A35]" />
                    <span className="text-xs font-bold text-[#430914]">Multi-Client Workspace</span>
                  </div>
                  <p className="text-[11px] text-[#75675C] leading-relaxed">
                    Manage independent wedding invitations, client review links, and approval states in one hub.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E8D5AD] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C49A35]" />
                    <span className="text-xs font-bold text-[#430914]">100% Studio Branding</span>
                  </div>
                  <p className="text-[11px] text-[#75675C] leading-relaxed">
                    Custom "Crafted by [Your Studio]" badge on all client invitations and proof links.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E8D5AD] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#167A5A]" />
                    <span className="text-xs font-bold text-[#430914]">Direct UPI Settlements</span>
                  </div>
                  <p className="text-[11px] text-[#75675C] leading-relaxed">
                    Automated payouts and commission ledger tracking directly to your verified UPI ID.
                  </p>
                </div>
              </div>

              {/* UPI ID Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#430914] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Payout UPI ID (Secure &amp; Private)</span>
                </label>
                <input
                  type="text"
                  value={payoutUpi}
                  onChange={(e) => setPayoutUpi(e.target.value.trim())}
                  placeholder="e.g. yourstudio@okaxis or 9876543210@upi"
                  className={`w-full px-3.5 py-2.5 bg-white border ${errors.payoutUpi ? 'border-red-500' : 'border-[#E8D5AD]'} rounded-xl text-xs font-mono text-[#430914] focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35]`}
                />
                {errors.payoutUpi && <p className="text-[11px] text-red-600 font-semibold">{errors.payoutUpi}</p>}
                <p className="text-[10px] text-[#75675C] flex items-center gap-1 pt-0.5">
                  <Lock className="w-3 h-3 text-[#167A5A] shrink-0" />
                  <span>Your UPI ID is strictly encrypted and used exclusively for verified commission payouts.</span>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: REVIEW & ACTIVATE                                                */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#F8F3E8] p-3.5 rounded-2xl border border-[#E8D5AD] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#C49A35] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#430914] uppercase tracking-wider">Step 4: Confirm Studio Details</h4>
                  <p className="text-[11px] text-[#75675C]">Review your studio profile before server-authorized activation.</p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8D5AD] space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E8D5AD]/60">
                  <span className="text-[#75675C]">Studio Name:</span>
                  <span className="font-bold text-[#430914]">{studioName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D5AD]/60">
                  <span className="text-[#75675C]">Contact Lead:</span>
                  <span className="font-semibold text-[#430914]">{contactName} ({phone})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D5AD]/60">
                  <span className="text-[#75675C]">Studio Email:</span>
                  <span className="font-mono text-[#430914]">{email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D5AD]/60">
                  <span className="text-[#75675C]">Location:</span>
                  <span className="text-[#430914] font-medium">{city}, {stateName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E8D5AD]/60">
                  <span className="text-[#75675C]">Studio Handle:</span>
                  <span className="font-mono font-bold text-[#6E1020]">@{previewSlug}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#75675C]">Payout UPI:</span>
                  <span className="font-mono font-bold text-[#167A5A]">{payoutUpi || 'Will configure later'}</span>
                </div>
              </div>

              {/* Auth Prompt if not logged in */}
              {!user && (
                <div className="p-3.5 bg-[#FFF9ED] border border-[#C49A35]/50 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#8C6B14]">
                    <LogIn className="w-4 h-4" />
                    <span>Authentication Required for Studio Activation</span>
                  </div>
                  <p className="text-[11px] text-[#75675C]">
                    You are currently logged out. Clicking "Sign In &amp; Activate Studio" will authenticate your account via Google / Email and immediately create your Studio Workspace without losing any entered details.
                  </p>
                </div>
              )}

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8F3E8] border border-[#E8D5AD] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#6E1020] focus:ring-[#C49A35] border-[#E8D5AD] cursor-pointer"
                />
                <span className="text-xs text-[#430914] font-medium leading-relaxed">
                  I confirm that the information provided is accurate and agree to the AmantranLink Studio Partner Terms &amp; Conditions.
                </span>
              </label>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: SUCCESS CELEBRATION SCREEN                                       */}
          {/* ========================================================================= */}
          {currentStep === 5 && isSuccess && (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#167A5A]/15 text-[#167A5A] border-2 border-[#167A5A]/40 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C49A35] block">
                  PARTNERSHIP VERIFIED
                </span>
                <h3 className="font-cormorant font-bold text-3xl text-[#430914]">
                  WELCOME TO THE AMANTRANLINK STUDIO NETWORK
                </h3>
                <p className="text-xs sm:text-sm text-[#75675C] max-w-md mx-auto leading-relaxed">
                  Congratulations! <strong>{studioName}</strong> is now an official Studio Partner. Your dedicated client workspace and attributed referral link are active.
                </p>
              </div>

              <div className="p-4 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD] max-w-md mx-auto font-mono text-xs text-[#6E1020] break-all select-all font-semibold">
                {referralPreviewUrl}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#167A5A] via-[#0F766E] to-[#167A5A] text-white font-manrope font-bold text-xs uppercase tracking-wider shadow-lg border border-emerald-400/50 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>GO TO STUDIO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 👑 Sticky Luxury Footer */}
        {!isSuccess && (
          <div className="p-4 sm:p-5 bg-[#F8F3E8] border-t border-[#E8D5AD] flex items-center justify-between shrink-0">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8D5AD] hover:border-[#C49A35] text-[#430914] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-[#167A5A] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#167A5A]" />
                  <span>Free to Join · Zero Upfront Fee</span>
                </div>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider shadow-sm border border-[#C49A35] flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 min-h-[44px]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateStudio}
                  disabled={isSubmitting || !agreedToTerms}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7E1827] via-[#6E1020] to-[#500E1A] text-[#FFFDF8] text-xs font-bold uppercase tracking-widest shadow-md border border-[#C49A35] flex items-center gap-2 transition-all cursor-pointer hover:scale-105 disabled:opacity-50 min-h-[44px]"
                >
                  <span>
                    {isSubmitting 
                      ? 'Activating Studio...' 
                      : user 
                      ? 'ACTIVATE STUDIO ACCOUNT' 
                      : 'SIGN IN & ACTIVATE STUDIO'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C49A35]" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerOnboardingModal;
