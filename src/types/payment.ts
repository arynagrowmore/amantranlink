/**
 * 👑 AMANTRANLINK UNIFIED PAYMENT ARCHITECTURE & STATE TYPES
 * Single authoritative payment state machine and error taxonomy across all roles.
 */

import { ThemeId, PackageType, UserRole } from './wedding';

// 💳 Standardized Payment Status Machine
export type PaymentStatus = 
  | 'pending'
  | 'initiated'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

// 🚨 Standardized Payment Error Taxonomy
export type PaymentErrorCode =
  | 'PAYMENT_SERVER_ERROR'
  | 'PAYMENT_NETWORK_ERROR'
  | 'PAYMENT_CANCELLED'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'PAYMENT_ALREADY_PROCESSED'
  | 'PAYMENT_AMOUNT_INVALID'
  | 'PAYMENT_PROVIDER_ERROR'
  | 'PAYMENT_TIMEOUT';

// 📦 Standardized Product Purchased
export type PaymentProductType = 
  | 'THEME_UNLOCK'
  | 'PACKAGE_UNLOCK'
  | 'STUDIO_CREDITS'
  | 'STUDIO_WHOLESALE_LICENSE'
  | 'CLIENT_PROJECT_UNLOCK'
  | 'BESPOKE_CUSTOMIZATION';

// 🧾 Unified Normalized Payment Record
export interface PaymentRecord {
  paymentId: string;
  userId: string;
  role: UserRole;
  amount: number;
  amountInRupees: number;
  currency: 'INR' | string;
  productType: PaymentProductType;
  referenceId: string; // themeId, packageId, siteId, or creditBundleId
  status: PaymentStatus;
  provider: 'razorpay' | 'offline_simulator' | 'stripe';
  providerOrderId?: string;
  providerPaymentId?: string;
  failureReason?: string;
  errorCode?: PaymentErrorCode;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 🛡️ Normalized Safe Error Response (Never exposes raw HTTP 500 or DB traces)
export interface NormalizedPaymentError {
  success: false;
  status: 'failed' | 'cancelled';
  code: PaymentErrorCode;
  message: string;
  userMessage: string;
  technicalDetails?: any;
}

// 🎯 Normalized Payment Result
export interface NormalizedPaymentResult {
  success: boolean;
  status: PaymentStatus;
  paymentId?: string;
  orderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  productType?: PaymentProductType;
  referenceId?: string;
  error?: NormalizedPaymentError;
  entitlementsGranted?: string[];
}

// 🚀 Unified Payment Request Parameters
export interface PaymentRequestParams {
  userId: string;
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  productType: PaymentProductType;
  referenceId: string; // e.g. themeId 'rajmahal' or packageId 'gold'
  packageId?: PackageType;
  templateId?: ThemeId;
  weddingSiteId?: string;
  customNotes?: string;
  partnerSlug?: string;
}
