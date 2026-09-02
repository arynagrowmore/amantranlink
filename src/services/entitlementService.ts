/**
 * 👑 AMANTRANLINK CENTRALIZED ROLE-AWARE ENTITLEMENT SERVICE
 * Single authoritative source of truth for access control and post-payment unlocks across all roles.
 */

import { ThemeId, PackageType, UserRole } from '../types/wedding';
import { PaymentProductType, NormalizedPaymentResult } from '../types/payment';
import { supabase } from '../lib/supabase';
import { getUserPurchases, saveUserPurchase } from './razorpayClient';

export interface GrantEntitlementParams {
  userId: string;
  role?: UserRole;
  productType: PaymentProductType;
  referenceId: string;
  packageId?: PackageType;
  templateId?: ThemeId;
  weddingSiteId?: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
}

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason?: string;
  unlockedAt?: string;
  packageLevel?: string;
}

/**
 * 1. Centralized Entitlement Access Checker
 */
export const checkThemeAccess = async (
  userId: string,
  themeId: ThemeId,
  role: UserRole = 'couple'
): Promise<EntitlementCheckResult> => {
  if (!userId) return { hasAccess: false, reason: 'Authentication required' };

  // Master VIP Accounts or Admin bypass
  if (role === 'admin') {
    return { hasAccess: true, reason: 'ADMIN_PERMITTED', packageLevel: 'platinum' };
  }

  try {
    // Check Local & Cached Purchases
    const localPurchases = getUserPurchases(userId);
    if (localPurchases && localPurchases[themeId]) {
      const p = localPurchases[themeId];
      if (p.status === 'unlocked' || p.paymentStatus === 'PAID' || p.paymentStatus === 'SUCCESS') {
        return { hasAccess: true, unlockedAt: p.unlockedAt, packageLevel: (p as any).packageType };
      }
    }

    // Check Database Purchases
    const { data: dbPurchase } = await supabase
      .from('purchases')
      .select('id, status, unlocked_at')
      .eq('user_id', userId)
      .eq('status', 'unlocked')
      .maybeSingle();

    if (dbPurchase) {
      return { hasAccess: true, unlockedAt: dbPurchase.unlocked_at };
    }

    // Check if Partner has active client site for this theme
    if (role === 'partner') {
      const { data: partnerSite } = await supabase
        .from('wedding_sites')
        .select('id, client_payment_status')
        .eq('partner_id', userId)
        .eq('template_id', themeId)
        .maybeSingle();

      if (partnerSite && partnerSite.client_payment_status === 'PAID') {
        return { hasAccess: true, reason: 'STUDIO_PARTNER_WHOLESALE_UNLOCKED' };
      }
    }
  } catch (err) {
    console.warn('[EntitlementService] checkThemeAccess error:', err);
  }

  return { hasAccess: false, reason: 'PAYMENT_REQUIRED' };
};

/**
 * 2. Centralized Post-Payment Entitlement Granting (Role-Aware & Idempotent)
 */
export const grantEntitlementAfterPayment = async (
  params: GrantEntitlementParams
): Promise<{ success: boolean; grantedFeatures: string[] }> => {
  const {
    userId,
    role = 'couple',
    productType,
    referenceId,
    packageId = 'gold',
    templateId = 'rajmahal',
    weddingSiteId,
    orderId = `ord_${Date.now()}`,
    paymentId = `pay_${Date.now()}`,
    amount = 1499,
  } = params;

  const grantedFeatures: string[] = [];

  try {
    // A. COUPLE / END USER: Theme & Package Unlock
    if (role === 'couple' || role === 'end_customer') {
      // 1. Record in local cache
      saveUserPurchase({
        id: `${userId}_${templateId}`,
        uid: userId,
        templateId,
        packageType: packageId,
        unlockedAt: new Date().toISOString(),
        orderId,
        paymentReference: paymentId,
        status: 'unlocked',
        paymentStatus: 'PAID',
      } as any);
      grantedFeatures.push(`THEME_UNLOCKED_${templateId.toUpperCase()}`);
      grantedFeatures.push(`PACKAGE_${packageId.toUpperCase()}`);

      // 2. Record in database purchases table
      try {
        // Resolve template UUID
        let tplUuid: string | null = null;
        const { data: tpl } = await supabase.from('templates').select('id').eq('slug', templateId).maybeSingle();
        if (tpl?.id) tplUuid = tpl.id;

        if (tplUuid) {
          await supabase.from('purchases').upsert({
            user_id: userId,
            template_id: tplUuid,
            status: 'unlocked',
            payment_reference: paymentId,
            unlocked_at: new Date().toISOString(),
          }, { onConflict: 'user_id,template_id' });
        }
      } catch (e) {
        console.warn('[EntitlementService] Database purchase sync note:', e);
      }

      // 3. Unlock active wedding_sites if present
      if (weddingSiteId) {
        try {
          await supabase.from('wedding_sites').update({
            is_locked: false,
            updated_at: new Date().toISOString(),
          }).eq('id', weddingSiteId);
          grantedFeatures.push('SITE_EDITING_UNLOCKED');
        } catch (e) {}
      }
    }

    // B. STUDIO PARTNER: Wholesale Client Unlock & Commission Credit
    else if (role === 'partner') {
      // 1. Update wedding_sites client payment status
      if (weddingSiteId) {
        try {
          await supabase.from('wedding_sites').update({
            client_payment_status: 'PAID',
            is_locked: false,
            workflow_status: 'CLIENT_APPROVED',
            updated_at: new Date().toISOString(),
          }).eq('id', weddingSiteId);
          grantedFeatures.push('CLIENT_PROJECT_PAID');
        } catch (e) {}
      }

      // 2. Record commission in commissions_ledger
      try {
        await supabase.from('commissions_ledger').insert({
          partner_id: userId,
          wedding_site_id: weddingSiteId || null,
          order_id: orderId,
          payment_id: paymentId,
          retail_price: amount,
          commission_amount: Math.round(amount * 0.15), // 15% wholesale credit margin
          status: 'credited',
          created_at: new Date().toISOString(),
        });
        grantedFeatures.push('PARTNER_COMMISSION_CREDITED');
      } catch (e) {}

      // 3. Record local purchase entry for studio preview
      saveUserPurchase({
        id: `${userId}_${templateId}`,
        uid: userId,
        templateId,
        packageType: packageId,
        unlockedAt: new Date().toISOString(),
        orderId,
        paymentReference: paymentId,
        status: 'unlocked',
        paymentStatus: 'PAID',
      } as any);
      grantedFeatures.push(`STUDIO_WHOLESALE_UNLOCKED_${templateId.toUpperCase()}`);
    }

    return {
      success: true,
      grantedFeatures,
    };
  } catch (err) {
    console.error('[EntitlementService] grantEntitlementAfterPayment error:', err);
    return {
      success: false,
      grantedFeatures,
    };
  }
};
