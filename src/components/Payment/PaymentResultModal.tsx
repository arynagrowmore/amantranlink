/**
 * 👑 AMANTRANLINK COMMON REUSABLE PAYMENT RESULT MODAL
 * Unified modal across all user roles (Couple, Studio Partner, Photographer, Admin).
 * 
 * Supports: SUCCESS | FAILED | CANCELLED | PROCESSING | VERIFICATION_PENDING
 * Never displays raw technical errors like "Payment server returned status 500".
 */

import React from 'react';
import { 
  CheckCircle2, XCircle, Clock, RotateCw, 
  X, Sparkles, ShieldCheck, ArrowRight, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentStatus, PaymentErrorCode } from '../../types/payment';
import { UserRole } from '../../types/wedding';

export interface PaymentResultModalProps {
  isOpen: boolean;
  status: PaymentStatus | 'already_unlocked' | 'verification_pending';
  roleContext?: UserRole;
  title?: string;
  description?: string;
  errorMessage?: string;
  errorCode?: PaymentErrorCode;
  productName?: string;
  amount?: number;
  paymentReference?: string;
  isProcessing?: boolean;
  onRetry?: () => void;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  isOpen,
  status,
  roleContext = 'couple',
  title,
  description,
  errorMessage,
  errorCode,
  productName = 'Royal Theme Access',
  amount,
  paymentReference,
  isProcessing = false,
  onRetry,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  if (!isOpen) return null;

  // 1. Success Celebration Confetti Effect
  React.useEffect(() => {
    if (status === 'paid') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.45 },
        colors: ['#C9A227', '#741526', '#E59838', '#F7F0DF'],
        ticks: 250,
      });
    }
  }, [status]);

  // Contextual copy mappings
  const isPartner = roleContext === 'partner';
  
  // Default titles & descriptions
  const defaultSuccessTitle = isPartner 
    ? 'Studio Purchase Confirmed' 
    : 'Royal Invitation Unlocked!';

  const defaultSuccessDesc = isPartner
    ? 'Your Studio wholesale license is now active and ready for client customization.'
    : 'Your royal digital wedding invitation is unlocked with lifetime editing access.';

  const defaultFailureTitle = status === 'cancelled'
    ? 'Payment Cancelled'
    : 'Payment Couldn’t Be Completed';

  const defaultFailureDesc = errorMessage || (
    isPartner
      ? 'We couldn’t complete your Studio purchase at the moment. Please try again.'
      : 'We couldn’t complete your invitation unlock at the moment. Please try again.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#C9A227]/40 shadow-2xl max-w-lg w-full overflow-hidden text-[#2B1714]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#741526] via-[#8E1B30] to-[#500E1A] text-[#F7F0DF] p-5 relative flex items-center justify-between border-b border-[#C9A227]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E59838]" />
            <h3 className="font-fraunces font-bold text-base tracking-wide">
              {status === 'paid' ? 'Transaction Confirmed' : 'Payment Status'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#F7F0DF]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* ========================================================= */}
          {/* STATE: SUCCESS / PAID                                     */}
          {/* ========================================================= */}
          {status === 'paid' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-fraunces font-bold text-xl text-[#741526]">
                  {title || defaultSuccessTitle}
                </h4>
                <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                  {description || defaultSuccessDesc}
                </p>
              </div>

              {/* Verified Details Card */}
              <div className="bg-[#F7F0DF]/60 p-4 rounded-2xl border border-[#C9A227]/30 text-xs space-y-2">
                <div className="flex justify-between items-center text-[#8B7358]">
                  <span>Product:</span>
                  <strong className="text-[#741526] font-semibold">{productName}</strong>
                </div>
                {amount !== undefined && (
                  <div className="flex justify-between items-center text-[#8B7358]">
                    <span>Amount Paid:</span>
                    <strong className="text-emerald-800 font-mono font-bold">₹{amount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {paymentReference && (
                  <div className="flex justify-between items-center text-[11px] text-[#8B7358]">
                    <span>Reference ID:</span>
                    <span className="font-mono">{paymentReference}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#C9A227]/20 text-emerald-800 font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified with Razorpay HMAC SHA-256</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onPrimaryAction || onClose}
                  className="py-3 px-4 rounded-xl bg-[#741526] hover:bg-[#500E1A] text-[#F7F0DF] font-fraunces font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer text-center"
                >
                  {primaryActionLabel || (isPartner ? 'OPEN CLIENT STUDIO' : 'ENTER STUDIO')}
                </button>
                <button
                  type="button"
                  onClick={onSecondaryAction || onClose}
                  className="py-3 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#EDE0C8] text-[#741526] border border-[#C9A227] font-fraunces font-bold text-xs tracking-wide transition-all cursor-pointer text-center"
                >
                  {secondaryActionLabel || (isPartner ? 'BACK TO DASHBOARD' : 'VIEW PURCHASES')}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE: FAILED / CANCELLED                                 */}
          {/* ========================================================= */}
          {(status === 'failed' || status === 'cancelled') && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 border-2 border-rose-600 text-rose-700">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-fraunces font-bold text-xl text-rose-800">
                  {title || defaultFailureTitle}
                </h4>
                <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                  {description || defaultFailureDesc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onRetry || onPrimaryAction}
                  className="py-3 px-4 rounded-xl bg-[#741526] hover:bg-[#500E1A] text-[#F7F0DF] font-fraunces font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {primaryActionLabel || 'TRY PAYMENT AGAIN'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#EDE0C8] text-[#741526] border border-[#D8C7AA] font-fraunces font-bold text-xs tracking-wide transition-all cursor-pointer"
                >
                  {secondaryActionLabel || (isPartner ? 'BACK TO PROJECTS' : 'BACK TO INVITATION')}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE: PROCESSING / VERIFICATION PENDING                  */}
          {/* ========================================================= */}
          {(status === 'processing' || status === 'verification_pending') && (
            <div className="space-y-5 animate-fadeIn text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-600 text-amber-700">
                <Clock className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="font-fraunces font-bold text-xl text-amber-900">
                  {status === 'verification_pending' ? 'Verifying Transaction' : 'Processing Payment...'}
                </h4>
                <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                  Please do not close this window or refresh the page while we confirm your transaction.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentResultModal;
