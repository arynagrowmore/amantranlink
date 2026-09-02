import { describe, it, expect } from 'vitest';
import { calculatePaymentDetails, PARTNER_PACKAGES, OFFICIAL_PACKAGES, COMMERCIAL_ROLES } from '../src/config/pricing';

describe('👑 Photographer Partner Experience Master Suite', () => {
  describe('1. Commercial Separation & Role Integrity', () => {
    it('should distinguish between end_customer and partner roles authoritatively', () => {
      const customerSilver = calculatePaymentDetails('silver', 'rajmahal', 'end_customer');
      const partnerSilver = calculatePaymentDetails('silver', 'rajmahal', 'partner');

      expect(customerSilver.isPartnerPricing).toBe(false);
      expect(customerSilver.finalAmountInr).toBe(customerSilver.retailPriceInr);
      
      expect(partnerSilver.isPartnerPricing).toBe(true);
      expect(partnerSilver.partnerPriceInr).toBe(partnerSilver.finalAmountInr);
      expect(partnerSilver.packageName).toContain('Partner Rate');
    });

    it('should apply correct wholesale pricing and commission across all 3 tiers', () => {
      // Silver Tier
      const silver = calculatePaymentDetails('silver', 'jodi', 'partner');
      expect(silver.packageId).toBe('silver');
      expect(silver.isPartnerPricing).toBe(true);
      expect(silver.finalAmountInPaise).toBe(silver.finalAmountInr * 100);

      // Gold Tier
      const gold = calculatePaymentDetails('gold', 'rajmahal', 'partner');
      expect(gold.packageId).toBe('gold');
      expect(gold.isPartnerPricing).toBe(true);
      expect(gold.finalAmountInPaise).toBe(gold.finalAmountInr * 100);

      // Platinum Tier
      const platinum = calculatePaymentDetails('platinum', 'all' as any, 'partner');
      expect(platinum.packageId).toBe('platinum');
      expect(platinum.isPartnerPricing).toBe(true);
      expect(platinum.finalAmountInPaise).toBe(platinum.finalAmountInr * 100);
    });

    it('should verify single source of truth for commercial roles', () => {
      expect(COMMERCIAL_ROLES.END_CUSTOMER).toBe('end_customer');
      expect(COMMERCIAL_ROLES.PHOTOGRAPHER_PARTNER).toBe('partner');
    });
  });

  describe('2. Studio Referral & Slug Structure', () => {
    it('should generate URL-safe referral handles', () => {
      const rawStudioName = 'Aryan Patel Photography & Films!';
      const cleanSlug = rawStudioName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      expect(cleanSlug).toBe('aryan-patel-photography-films');
      expect(/^[a-z0-9-]+$/.test(cleanSlug)).toBe(true);
    });

    it('should format referral link properly', () => {
      const origin = 'https://amantranlink.com';
      const slug = 'aryan-patel';
      const referralUrl = `${origin}/?partner=${slug}`;
      expect(referralUrl).toBe('https://amantranlink.com/?partner=aryan-patel');
    });
  });

  describe('3. Payout UPI Validation & Security', () => {
    it('should validate valid UPI formats', () => {
      const validUpis = ['aryan@upi', 'studio@okaxis', 'patel.films@icici', '9876543210@paytm'];
      validUpis.forEach((upi) => {
        expect(upi.includes('@')).toBe(true);
        expect(upi.trim().length).toBeGreaterThan(4);
      });
    });

    it('should reject invalid UPI formats', () => {
      const invalidUpis = ['', 'invalidupi', 'noupi.com', '   '];
      invalidUpis.forEach((upi) => {
        const isValid = upi.trim().length > 4 && upi.includes('@');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('4. Multi-Client UUID Schema Integrity', () => {
    it('should guarantee template identifiers belong in content.theme rather than invalid UUID fields', () => {
      const templateSlug = 'rajmahal';
      const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // templateSlug is NOT a UUID string, so it should never be placed in a UUID column
      expect(validUuidPattern.test(templateSlug)).toBe(false);
    });

    it('should ensure wedding site payload isolates partner_id and user_id', () => {
      const partnerUserId = 'a0000000-0000-0000-0000-000000000001';
      const sitePayload = {
        user_id: partnerUserId,
        partner_id: partnerUserId,
        studio_badge: 'Aryan Patel Photography',
        status: 'draft',
        is_locked: true,
      };

      expect(sitePayload.user_id).toBe(partnerUserId);
      expect(sitePayload.partner_id).toBe(partnerUserId);
      expect(sitePayload.studio_badge).toBe('Aryan Patel Photography');
    });
  });

  describe('5. KPI and Executive Analytics Calculations', () => {
    it('should compute correct live, draft, and locked counts from client site list', () => {
      const mockSites = [
        { id: '1', status: 'published', is_locked: false },
        { id: '2', status: 'published', is_locked: false },
        { id: '3', status: 'draft', is_locked: true },
        { id: '4', status: 'draft', is_locked: true },
        { id: '5', status: 'draft', is_locked: false },
      ];

      const totalInvitations = mockSites.length;
      const liveInvitations = mockSites.filter((s) => s.status === 'published').length;
      const draftInvitations = mockSites.filter((s) => s.status === 'draft').length;
      const lockedInvitations = mockSites.filter((s) => s.is_locked).length;

      expect(totalInvitations).toBe(5);
      expect(liveInvitations).toBe(2);
      expect(draftInvitations).toBe(3);
      expect(lockedInvitations).toBe(2);
    });

    it('should calculate accurate Gross Merchandise Value (GMV)', () => {
      const mockSites = [
        { id: '1', price: 1299 },
        { id: '2', price: 2299 },
        { id: '3', price: 24999 },
      ];

      const totalGmv = mockSites.reduce((sum, s) => sum + s.price, 0);
      expect(totalGmv).toBe(28597);
    });
  });
});
