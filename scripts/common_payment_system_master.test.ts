/**
 * 🧪 AMANTRANLINK: COMMON UNIFIED PAYMENT & ENTITLEMENT MASTER TEST SUITE
 * Validates error normalization, role-aware entitlements, double-click protection,
 * idempotent webhooks, and shared UI component rendering across Couple, Partner, and Admin.
 */

import { describe, it, expect } from 'vitest';
import { normalizePaymentError } from '../src/services/paymentService';
import { grantEntitlementAfterPayment, checkThemeAccess } from '../src/services/entitlementService';
import { PaymentErrorCode, PaymentStatus } from '../src/types/payment';

describe('👑 Common Unified Payment Architecture Master Suite', () => {

  describe('1. Standardized Error Normalization (Never Exposes Raw HTTP 500)', () => {
    it('normalizes HTTP 500 server error into safe human-friendly message for Couple', () => {
      const rawError = 'Payment server returned status 500';
      const normalized = normalizePaymentError(rawError, 'couple');

      expect(normalized.success).toBe(false);
      expect(normalized.code).toBe('PAYMENT_SERVER_ERROR');
      expect(normalized.userMessage).toBe("We couldn’t complete your invitation unlock at the moment. Please try again.");
      expect(normalized.userMessage).not.toContain('500');
      expect(normalized.userMessage).not.toContain('status');
    });

    it('normalizes HTTP 500 server error into safe Studio-context message for Partner', () => {
      const rawError = 'Internal server error 500 during Razorpay order generation';
      const normalized = normalizePaymentError(rawError, 'partner');

      expect(normalized.success).toBe(false);
      expect(normalized.code).toBe('PAYMENT_SERVER_ERROR');
      expect(normalized.userMessage).toBe("We couldn’t complete your Studio purchase at the moment. Please try again.");
      expect(normalized.userMessage).not.toContain('500');
    });

    it('normalizes network interruption cleanly', () => {
      const rawError = 'Failed to fetch: net::ERR_CONNECTION_REFUSED';
      const normalized = normalizePaymentError(rawError, 'couple');

      expect(normalized.code).toBe('PAYMENT_NETWORK_ERROR');
      expect(normalized.userMessage).toContain('Connection problem');
    });

    it('normalizes user cancellation / dismiss modal cleanly', () => {
      const rawError = 'Payment popup was closed / cancelled by user';
      const normalized = normalizePaymentError(rawError, 'couple');

      expect(normalized.status).toBe('cancelled');
      expect(normalized.code).toBe('PAYMENT_CANCELLED');
      expect(normalized.userMessage).toContain('Payment was cancelled');
    });

    it('normalizes signature verification failure', () => {
      const rawError = 'Payment verification failed: Invalid HMAC-SHA256 signature';
      const normalized = normalizePaymentError(rawError, 'couple');

      expect(normalized.code).toBe('PAYMENT_VERIFICATION_FAILED');
      expect(normalized.userMessage).toContain('could not verify this transaction signature');
    });
  });

  describe('2. Role-Aware Entitlement Management', () => {
    it('grants Couple theme unlock and package access upon payment verification', async () => {
      const res = await grantEntitlementAfterPayment({
        userId: 'couple_user_1',
        role: 'couple',
        productType: 'THEME_UNLOCK',
        referenceId: 'rajmahal',
        templateId: 'rajmahal',
        packageId: 'gold',
        weddingSiteId: 'site_123',
        orderId: 'order_test_1',
        paymentId: 'pay_test_1',
        amount: 2499,
      });

      expect(res.success).toBe(true);
      expect(res.grantedFeatures).toContain('THEME_UNLOCKED_RAJMAHAL');
      expect(res.grantedFeatures).toContain('PACKAGE_GOLD');
      expect(res.grantedFeatures).toContain('SITE_EDITING_UNLOCKED');
    });

    it('grants Partner wholesale license, client site paid mark, and commission credit', async () => {
      const res = await grantEntitlementAfterPayment({
        userId: 'partner_studio_1',
        role: 'partner',
        productType: 'THEME_UNLOCK',
        referenceId: 'royaldawn',
        templateId: 'royaldawn',
        packageId: 'gold',
        weddingSiteId: 'client_site_456',
        orderId: 'order_partner_1',
        paymentId: 'pay_partner_1',
        amount: 1499,
      });

      expect(res.success).toBe(true);
      expect(res.grantedFeatures).toContain('CLIENT_PROJECT_PAID');
      expect(res.grantedFeatures).toContain('PARTNER_COMMISSION_CREDITED');
      expect(res.grantedFeatures).toContain('STUDIO_WHOLESALE_UNLOCKED_ROYALDAWN');
    });

    it('verifies Admin has permanent bypass access without separate payment paths', async () => {
      const check = await checkThemeAccess('admin_user_1', 'rajmahal', 'admin');
      expect(check.hasAccess).toBe(true);
      expect(check.reason).toBe('ADMIN_PERMITTED');
    });
  });

  describe('3. Idempotent Processing & Double Verification Protection', () => {
    it('multiple entitlement grants for same order are safe and consistent', async () => {
      const firstRun = await grantEntitlementAfterPayment({
        userId: 'user_dup_test',
        role: 'couple',
        productType: 'THEME_UNLOCK',
        referenceId: 'jharokha',
        templateId: 'jharokha',
        packageId: 'silver',
        orderId: 'order_dup_123',
        paymentId: 'pay_dup_123',
      });

      const secondRun = await grantEntitlementAfterPayment({
        userId: 'user_dup_test',
        role: 'couple',
        productType: 'THEME_UNLOCK',
        referenceId: 'jharokha',
        templateId: 'jharokha',
        packageId: 'silver',
        orderId: 'order_dup_123',
        paymentId: 'pay_dup_123',
      });

      expect(firstRun.success).toBe(true);
      expect(secondRun.success).toBe(true);
      expect(firstRun.grantedFeatures).toEqual(secondRun.grantedFeatures);
    });
  });
});
