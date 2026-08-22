import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Sparkles, CheckCircle2, XCircle, ArrowRight, 
  RotateCw, ExternalLink, X, Heart, CreditCard, ChevronRight, Tag, AlertCircle, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeId, WeddingProjectState, PackageType } from '../types/wedding';
import { RoyalCrestIcon, DiyaIcon, PalaceGateIcon } from './ShahiIcons';
import { themes } from './ThemeSelector';
import { initiateRazorpayCheckout } from '../services/razorpayClient';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP, calculatePaymentDetails } from '../config/pricing';

export interface RoyalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  packageType?: PackageType;
  onPaymentSuccess?: (themeId: ThemeId) => void;
}

export const PACKAGES_META: Record<PackageType, { name: string; price: number; badge: string; subtitle: string; features: string[] }> = {
  silver: {
    name: OFFICIAL_PACKAGES.silver.name,
    price: OFFICIAL_PACKAGES.silver.priceInr,
    badge: OFFICIAL_PACKAGES.silver.badge,
    subtitle: OFFICIAL_PACKAGES.silver.subtitle,
    features: OFFICIAL_PACKAGES.silver.features,
  },
  gold: {
    name: OFFICIAL_PACKAGES.gold.name,
    price: OFFICIAL_PACKAGES.gold.priceInr,
    badge: OFFICIAL_PACKAGES.gold.badge,
    subtitle: OFFICIAL_PACKAGES.gold.subtitle,
    features: OFFICIAL_PACKAGES.gold.features,
  },
  platinum: {
    name: OFFICIAL_PACKAGES.platinum.name,
    price: OFFICIAL_PACKAGES.platinum.priceInr,
    badge: OFFICIAL_PACKAGES.platinum.badge,
    subtitle: OFFICIAL_PACKAGES.platinum.subtitle,
    features: OFFICIAL_PACKAGES.platinum.features,
  },
};

type PaymentModalState = 'confirm' | 'processing' | 'success' | 'failed';

export const RoyalPaymentModal: React.FC<RoyalPaymentModalProps> = ({
  isOpen,
  onClose,
  state,
  packageType,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const [modalState, setModalState] = useState<PaymentModalState>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verifiedPaymentRef, setVerifiedPaymentRef] = useState<string>('');

  const effectivePackageType: PackageType = packageType || (state?.theme ? THEME_PACKAGE_MAP[state.theme] : 'gold');
  const currentTheme = themes.find((t) => t.id === state.theme) || themes[0];
  const pkg = PACKAGES_META[effectivePackageType] || PACKAGES_META.gold;

  // Single authoritative source of pricing
  const paymentDetails = calculatePaymentDetails(effectivePackageType, state.theme);
  const payableAmount = paymentDetails.finalAmountInr;

  // Dynamic Couple Names
  const groomName = state.couple.groomEn || 'Dhruv';
  const brideName = state.couple.brideEn || 'Shreya';
  const coupleTitle = `${groomName} & ${brideName}`;

  useEffect(() => {
    if (isOpen) {
      setModalState('confirm');
      setErrorMessage('');
      setVerifiedPaymentRef('');
    }
  }, [isOpen, packageType, state.theme]);

  if (!isOpen) return null;

  const handleProceedToPayment = async () => {
    setModalState('processing');
    setErrorMessage('');

    await initiateRazorpayCheckout({
      templateId: state.theme,
      packageId: effectivePackageType,
      uid: user?.uid || `guest_${Date.now()}`,
      userName: user?.name || coupleTitle,
      userEmail: user?.email || `${groomName.toLowerCase()}.${brideName.toLowerCase()}@shahistudio.com`,
      userPhone: user?.phone || state.family.rsvp1Phone || '+91 9409360336',
      state,
      onSuccess: (purchase) => {
        setVerifiedPaymentRef(purchase.paymentReference || 'RZP_VERIFIED');
        setModalState('success');
        
        // 🎊 Grand Royal Gold Celebration
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.45 },
          colors: ['#C9A227', '#741526', '#E59838', '#F7F0DF'],
          ticks: 280,
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(state.theme);
        }
      },
      onError: (err) => {
        setErrorMessage(err || 'Payment was not completed. Please try again.');
        setModalState('failed');
      },
      onCancel: () => {
        // Return gracefully to confirmation screen
        setModalState('confirm');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A0B0E]/80 backdrop-blur-md animate-fade-in font-hanken">
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F2] text-[#2B1714] rounded-3xl border-2 border-[#C9A227]/60 shadow-[0_25px_60px_-15px_rgba(43,23,20,0.4)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🏰 Top Royal Arch Banner */}
        <div className="relative bg-gradient-to-r from-[#500E1A] via-[#741526] to-[#500E1A] text-[#F7F0DF] p-6 sm:p-7 text-center border-b-2 border-[#C9A227]/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-[#F7F0DF] flex items-center justify-center transition-colors cursor-pointer border border-[#C9A227]/30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#741526] border-2 border-[#C9A227] shadow-md mb-2 text-[#C9A227]">
            <RoyalCrestIcon className="w-7 h-7" />
          </div>

          <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold">
            SHAHI STUDIO · ROYAL DIGITAL KANKOTRI
          </div>

          <h2 className="font-fraunces font-bold text-xl sm:text-2xl text-[#F7F0DF] tracking-wide mt-1">
            {modalState === 'success' 
              ? '✦ PAYMENT SUCCESSFUL ✦'
              : modalState === 'failed'
              ? 'PAYMENT NOT COMPLETED'
              : 'Complete Your Royal Invitation'}
          </h2>

          <p className="text-xs text-[#F7F0DF]/80 font-serif italic max-w-sm mx-auto mt-1">
            {modalState === 'success'
              ? 'Your Royal Kankotri is officially unlocked and cloud-bound.'
              : modalState === 'failed'
              ? 'Your Kankotri has not been unlocked.'
              : 'Secure your invitation, unlock your selected theme, and publish your kankotri.'}
          </p>
        </div>

        {/* 📜 Body Content Based on State */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[75vh]">

          {/* ========================================================= */}
          {/* VIEW 1: PRE-PAYMENT ROYAL CONFIRMATION SCREEN             */}
          {/* ========================================================= */}
          {modalState === 'confirm' && (
            <>
              {/* Royal Summary Card */}
              <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 border border-[#D8C7AA] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8C7AA]/50 pb-2.5">
                  <span className="text-xs text-[#741526] font-bold uppercase tracking-wider">
                    Couple
                  </span>
                  <span className="font-fraunces font-bold text-sm sm:text-base text-[#741526]">
                    👑 {coupleTitle}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#D8C7AA]/50 pb-2.5">
                  <span className="text-xs text-[#8B7358] font-bold uppercase tracking-wider">
                    Theme
                  </span>
                  <span className="font-medium text-xs text-[#2B1714] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                    {currentTheme.name}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#D8C7AA]/50 pb-2.5">
                  <span className="text-xs text-[#8B7358] font-bold uppercase tracking-wider">
                    Package
                  </span>
                  <span className="font-fraunces font-bold text-xs text-[#741526] bg-[#F7F0DF] px-2.5 py-1 rounded-lg border border-[#C9A227]/40">
                    {pkg.name}
                  </span>
                </div>

                {/* Amount Line */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-xs font-bold text-[#2B1714] block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-[#8B7358]">
                      One-time fee · Lifetime access &amp; cloud hosting
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-fraunces font-extrabold text-2xl text-[#741526]">
                      ₹{payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay Gateway Overview Box */}
              <div className="p-3.5 rounded-2xl bg-[#F7F0DF] border border-[#C9A227]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-fraunces font-bold text-xs text-[#741526] block">
                      Secure Payment Powered by Razorpay
                    </span>
                    <span className="text-[9px] font-mono bg-[#3D6B4A] text-white px-2 py-0.5 rounded font-bold">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Razorpay Supported Modes Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#D8C7AA]">
                    <span className="text-[10px] font-bold text-[#741526] block">⚡ UPI</span>
                    <span className="text-[8px] text-[#2B1714]">GPay, PhonePe</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#D8C7AA]">
                    <span className="text-[10px] font-bold text-[#741526] block">💳 Cards</span>
                    <span className="text-[8px] text-[#2B1810]">Credit/Debit</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#D8C7AA]">
                    <span className="text-[10px] font-bold text-[#741526] block">🏦 NetBanking</span>
                    <span className="text-[8px] text-[#2B1810]">50+ Banks</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#D8C7AA]">
                    <span className="text-[10px] font-bold text-[#741526] block">🔒 Security</span>
                    <span className="text-[8px] text-[#2B1810]">PCI-DSS Level 1</span>
                  </div>
                </div>
              </div>

              {/* CTA Action */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7A1024] via-[#8E182C] to-[#7A1024] hover:from-[#5A0C1B] hover:to-[#5A0C1B] text-[#F8F2E5] font-fraunces font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg border border-[#C89B2C] hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#C89B2C]" />
                  <span>PAY ₹{payableAmount.toLocaleString('en-IN')} &amp; UNLOCK ROYAL INVITATION →</span>
                </button>

                {/* Trust Badge */}
                <div className="text-center text-[10px] text-[#8B7358] flex items-center justify-center gap-2 pt-0.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Secure Razorpay Payment</span>
                  </span>
                  <span>•</span>
                  <span>Instant Access After Confirmation</span>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: PROCESSING SCREEN                                 */}
          {/* ========================================================= */}
          {modalState === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F7F0DF] border-2 border-[#C9A227] text-[#741526]">
                <RotateCw className="w-7 h-7 animate-spin text-[#C9A227]" />
              </div>
              <h3 className="font-fraunces font-bold text-lg text-[#741526]">
                Opening Razorpay Secure Gateway...
              </h3>
              <p className="text-xs text-[#8B7358] max-w-xs mx-auto">
                Please complete your payment in the Razorpay dialog. Do not refresh or close this window.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: VERIFIED SUCCESS SCREEN                           */}
          {/* ========================================================= */}
          {modalState === 'success' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#FFFDF9] rounded-2xl p-5 border-2 border-emerald-600/40 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Purchase Confirmation</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#D8C7AA]/40 text-xs text-[#2B1714]">
                  <div className="flex justify-between">
                    <span className="text-[#8B7358]">Couple:</span>
                    <strong className="text-[#741526] font-fraunces">{coupleTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7358]">Theme:</span>
                    <strong>{currentTheme.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7358]">Package:</span>
                    <strong className="text-[#741526]">{pkg.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7358]">Amount Paid:</span>
                    <strong className="text-emerald-800 font-mono">₹{payableAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  {verifiedPaymentRef && (
                    <div className="flex justify-between text-[10px] text-[#8B7358]">
                      <span>Payment Ref:</span>
                      <span className="font-mono">{verifiedPaymentRef}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Royal Unlocks Checklist */}
              <div className="space-y-2 bg-[#F7F0DF] p-4 rounded-xl border border-[#C9A227]/40 text-xs text-[#500E1A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Payment verified with Razorpay HMAC SHA-256</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Royal theme permanently unlocked for editing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Your royal invitation is ready to customize and publish</span>
                </div>
              </div>

              {/* Success Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-[#741526] hover:bg-[#500E1A] text-[#F7F0DF] font-fraunces font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer text-center"
                >
                  START CUSTOMIZING
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (typeof window !== 'undefined') window.location.hash = '#profile';
                  }}
                  className="py-3 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#EDE0C8] text-[#741526] border border-[#C9A227] font-fraunces font-bold text-xs tracking-wide transition-all cursor-pointer text-center"
                >
                  VIEW MY PURCHASE
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: FAILED PAYMENT SCREEN                             */}
          {/* ========================================================= */}
          {modalState === 'failed' && (
            <div className="space-y-5 animate-fade-in text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 border-2 border-rose-600 text-rose-700">
                <XCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-fraunces font-bold text-lg text-rose-800">
                  Payment Was Not Completed
                </h3>
                <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                  {errorMessage || 'Your Kankotri has not been unlocked. No funds were debited, or your bank cancelled the transaction.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="py-3 px-4 rounded-xl bg-[#741526] hover:bg-[#500E1A] text-[#F7F0DF] font-fraunces font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                >
                  TRY AGAIN
                </button>
                <button
                  type="button"
                  onClick={() => setModalState('confirm')}
                  className="py-3 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#EDE0C8] text-[#741526] border border-[#D8C7AA] font-fraunces font-bold text-xs tracking-wide transition-all cursor-pointer"
                >
                  BACK TO KANKOTRI
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RoyalPaymentModal;
