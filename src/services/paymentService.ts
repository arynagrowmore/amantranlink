/**
 * 👑 AMANTRANLINK COMMON UNIFIED PAYMENT SERVICE
 * Centralized, role-agnostic payment orchestrator across Couple, Studio Partner, and Admin.
 * 
 * Pipeline:
 * USER ACTION → PAYMENT REQUEST → COMMON PAYMENT SERVICE → RAZORPAY PROVIDER 
 * → SERVER-SIDE VERIFICATION → COMMON ENTITLEMENT SERVICE → NORMALIZED RESULT
 */

import { 
  PaymentStatus, 
  PaymentErrorCode, 
  PaymentProductType, 
  PaymentRecord, 
  NormalizedPaymentError, 
  NormalizedPaymentResult, 
  PaymentRequestParams 
} from '../types/payment';
import { ThemeId, PackageType, UserRole } from '../types/wedding';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP, calculatePaymentDetails } from '../config/pricing';
import { grantEntitlementAfterPayment } from './entitlementService';
import { getStoredPartnerAttribution } from './partnerService';
import { supabase } from '../lib/supabase';
import { resolveApiUrl } from '../utils/apiConfig';

// In-Flight Payment Session Lock to strictly prevent duplicate double-click submissions
const inFlightPaymentLocks = new Set<string>();

/**
 * 1. Normalize All Payment Errors into Safe User-Friendly Contracts
 * Strips raw HTTP 500 status codes, database schema dumps, or provider credentials.
 */
export const normalizePaymentError = (
  rawError: any,
  contextRole: UserRole = 'couple'
): NormalizedPaymentError => {
  const errMsg = typeof rawError === 'string' ? rawError : (rawError?.message || '');
  const lower = errMsg.toLowerCase();

  // Log raw technical diagnostic securely for developers
  console.error('[PaymentService:Diagnostic]', { rawError, contextRole, timestamp: new Date().toISOString() });

  // A. User Closed / Cancelled
  if (lower.includes('cancel') || lower.includes('closed') || lower.includes('dismissed')) {
    return {
      success: false,
      status: 'cancelled',
      code: 'PAYMENT_CANCELLED',
      message: 'Payment session was dismissed or cancelled by the user.',
      userMessage: 'Payment was cancelled. No charges were made to your account.',
      technicalDetails: rawError,
    };
  }

  // B. Verification Failure
  if (lower.includes('verification') || lower.includes('signature') || lower.includes('tamper')) {
    return {
      success: false,
      status: 'failed',
      code: 'PAYMENT_VERIFICATION_FAILED',
      message: 'Payment security verification failed on the server.',
      userMessage: 'We could not verify this transaction signature. If funds were debited, they will be automatically refunded.',
      technicalDetails: rawError,
    };
  }

  // C. Network / Unreachable
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('unreachable')) {
    return {
      success: false,
      status: 'failed',
      code: 'PAYMENT_NETWORK_ERROR',
      message: 'Network connectivity failure during payment request.',
      userMessage: 'Connection problem. Please check your internet connection and try again.',
      technicalDetails: rawError,
    };
  }

  // D. Server Error / 500
  if (lower.includes('500') || lower.includes('internal') || lower.includes('credential') || lower.includes('credentials')) {
    const roleSpecificText = contextRole === 'partner' 
      ? 'We couldn’t complete your Studio purchase at the moment. Please try again.'
      : 'We couldn’t complete your invitation unlock at the moment. Please try again.';

    return {
      success: false,
      status: 'failed',
      code: 'PAYMENT_SERVER_ERROR',
      message: 'Payment service temporary internal issue.',
      userMessage: roleSpecificText,
      technicalDetails: rawError,
    };
  }

  // Default Fallback
  return {
    success: false,
    status: 'failed',
    code: 'PAYMENT_PROVIDER_ERROR',
    message: errMsg || 'Payment could not be completed.',
    userMessage: contextRole === 'partner'
      ? 'We couldn’t complete your Studio purchase at the moment. Please try again.'
      : 'We couldn’t complete your invitation unlock. Please try again.',
    technicalDetails: rawError,
  };
};

/**
 * 2. Secure Server Order Creation
 */
export const createPaymentOrder = async (
  params: PaymentRequestParams
): Promise<{ success: boolean; orderData?: any; error?: NormalizedPaymentError }> => {
  const {
    userId,
    userRole = 'couple',
    userName,
    userEmail,
    userPhone,
    packageId = 'gold',
    templateId = 'rajmahal',
    partnerSlug,
  } = params;

  // Double-Click Idempotency Lock
  const lockKey = `${userId}_${templateId}_${packageId}`;
  if (inFlightPaymentLocks.has(lockKey)) {
    return {
      success: false,
      error: {
        success: false,
        status: 'failed',
        code: 'PAYMENT_ALREADY_PROCESSED',
        message: 'A payment session is already processing for this request.',
        userMessage: 'Payment is already in progress. Please wait a moment.',
      },
    };
  }

  inFlightPaymentLocks.add(lockKey);

  try {
    const attributedPartner = partnerSlug || getStoredPartnerAttribution();
    const effectivePackage: PackageType = packageId || (templateId ? THEME_PACKAGE_MAP[templateId] : 'gold');

    const apiPayload = {
      templateId,
      packageId: effectivePackage,
      userId,
      userName: userName || 'Royal Patron',
      userEmail: userEmail || `${userId}@amantranlink.com`,
      userPhone: userPhone || '+91 9409360336',
      partnerSlug: attributedPartner || undefined,
    };

    // Call Backend API via centralized API URL resolver
    const orderUrl = resolveApiUrl('/api/razorpay/create-order');
    const res = await fetch(orderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    const data = res ? await res.json().catch(() => null) : null;

    if (!res || !res.ok || !data || data.success === false) {
      // Return normalized error without leaking raw 500 status
      const errorObj = normalizePaymentError(data?.error || `Server responded with status ${res?.status || 500}`, userRole);
      return { success: false, error: errorObj };
    }

    return {
      success: true,
      orderData: data,
    };
  } catch (err: any) {
    const errorObj = normalizePaymentError(err, userRole);
    return { success: false, error: errorObj };
  } finally {
    inFlightPaymentLocks.delete(lockKey);
  }
};

/**
 * 3. Server-Side HMAC SHA-256 Payment Verification & Entitlement Dispatcher
 */
export const verifyAndFinalizePayment = async (
  verificationPayload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
    userRole?: UserRole;
    templateId: ThemeId;
    packageId: PackageType;
    weddingSiteId?: string;
    amount?: number;
  }
): Promise<NormalizedPaymentResult> => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
    userRole = 'couple',
    templateId,
    packageId,
    weddingSiteId,
    amount,
  } = verificationPayload;

  try {
    const body = JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      userId,
      userRole,
      templateId,
      packageId,
      weddingSiteId,
    });

    const verifyUrl = resolveApiUrl('/api/razorpay/verify-payment');
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = verifyRes ? await verifyRes.json().catch(() => null) : null;

    if (!verifyRes?.ok || !data?.success) {
      return {
        success: false,
        status: 'failed',
        error: normalizePaymentError(data?.error || 'Payment signature verification failed.', userRole),
      };
    }

    // 🏆 Grant Role-Specific Entitlements
    const grantResult = await grantEntitlementAfterPayment({
      userId,
      role: userRole,
      productType: 'THEME_UNLOCK',
      referenceId: templateId,
      templateId,
      packageId,
      weddingSiteId,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      amount: amount || data.amountInRupees || 1499,
    });

    return {
      success: true,
      status: 'paid',
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      providerPaymentId: razorpayPaymentId,
      amount: amount || data.amountInRupees,
      currency: 'INR',
      productType: 'THEME_UNLOCK',
      referenceId: templateId,
      entitlementsGranted: grantResult.grantedFeatures,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      error: normalizePaymentError(err, userRole),
    };
  }
};
