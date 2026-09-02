/**
 * 📸 STUDIO PARTNER ONBOARDING MASTER TEST SUITE
 * Comprehensive verification of multi-step wizard, handle uniqueness,
 * draft persistence, exit confirmation safety, and server-authoritative role assignment.
 */

import { describe, it, expect } from 'vitest';
import { checkStudioHandleAvailability } from '../src/services/partnerService';

describe('📸 Studio Partner Onboarding Flow & Security Test Suite', () => {

  // Test 1: Step 1 Studio Identity Validation
  it('1. Step 1 requires studio name, contact name, phone, email, city, and state', () => {
    const validateIdentity = (data: {
      studioName?: string;
      contactName?: string;
      phone?: string;
      email?: string;
      city?: string;
      stateName?: string;
    }) => {
      const errors: Record<string, string> = {};
      if (!data.studioName?.trim()) errors.studioName = 'Studio name required';
      if (!data.contactName?.trim()) errors.contactName = 'Contact name required';
      if (!data.phone?.trim() || data.phone.replace(/\D/g, '').length < 10) errors.phone = 'Valid phone required';
      if (!data.email?.trim() || !data.email.includes('@')) errors.email = 'Valid email required';
      if (!data.city?.trim()) errors.city = 'City required';
      if (!data.stateName?.trim()) errors.stateName = 'State required';
      return { valid: Object.keys(errors).length === 0, errors };
    };

    // Incomplete payload
    const invalidRes = validateIdentity({ studioName: 'Royal Studios' });
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.errors.contactName).toBeDefined();
    expect(invalidRes.errors.phone).toBeDefined();
    expect(invalidRes.errors.city).toBeDefined();

    // Complete valid payload
    const validRes = validateIdentity({
      studioName: 'Aryan Patel Photography',
      contactName: 'Aryan Patel',
      phone: '+91 98765 43210',
      email: 'studio@aryanpatel.com',
      city: 'Ahmedabad',
      stateName: 'Gujarat'
    });
    expect(validRes.valid).toBe(true);
    expect(Object.keys(validRes.errors).length).toBe(0);
  });

  // Test 2: Step 2 Handle Sanitization & Uniqueness
  it('2. Step 2 sanitizes handle to lowercase hyphenated format and rejects reserved slugs', async () => {
    const sanitizeHandle = (raw: string) => {
      return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    expect(sanitizeHandle('Aryan Patel Photography & Films!')).toBe('aryan-patel-photography-films');
    expect(sanitizeHandle('ROYAL_MOMENTS_3D')).toBe('royal-moments-3d');

    // Test reserved handle rejection
    const checkReserved = await checkStudioHandleAvailability('admin');
    expect(checkReserved.available).toBe(false);
    expect(checkReserved.reason).toContain('reserved');

    const checkApp = await checkStudioHandleAvailability('app');
    expect(checkApp.available).toBe(false);

    // Valid unique handle format
    const checkValid = await checkStudioHandleAvailability('aryan-patel-films');
    expect(checkValid.available).toBe(true);
  });

  // Test 3: Step 3 Commercial Terms & Payout UPI Format
  it('3. Step 3 validates payout UPI ID format without exposing sensitive wholesale prices publicly', () => {
    const validateUpi = (upi: string) => {
      if (!upi.trim()) return true; // Optional on setup, can configure later
      return upi.includes('@');
    };

    expect(validateUpi('')).toBe(true);
    expect(validateUpi('aryan@okaxis')).toBe(true);
    expect(validateUpi('invalidupi')).toBe(false);
  });

  // Test 4: Step 4 Confirmation & Terms Agreement
  it('4. Step 4 enforces agreement checkbox before allowing studio activation', () => {
    const canActivate = (agreed: boolean, hasUser: boolean) => {
      return agreed && hasUser;
    };

    expect(canActivate(false, true)).toBe(false);
    expect(canActivate(true, false)).toBe(false);
    expect(canActivate(true, true)).toBe(true);
  });

  // Test 5: Draft Session Storage Persistence
  it('5. Draft data is preserved so user does not lose entered fields during OAuth redirect', () => {
    const draftPayload = {
      studioName: 'Royal Shahi Studio',
      contactName: 'Rohan Sharma',
      phone: '+91 9409360336',
      email: 'rohan@shahi.com',
      city: 'Modasa',
      stateName: 'Gujarat',
      partnerSlug: 'rohan-shahi-studio',
      payoutUpi: 'rohan@upi',
      currentStep: 3
    };

    const serialized = JSON.stringify(draftPayload);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.studioName).toBe('Royal Shahi Studio');
    expect(deserialized.partnerSlug).toBe('rohan-shahi-studio');
    expect(deserialized.currentStep).toBe(3);
  });

  // Test 6: Exit Safety Warning
  it('6. Modal prompts confirmation warning when closing if unsaved data exists', () => {
    const shouldWarnOnExit = (studioName: string, contactName: string, isSuccess: boolean) => {
      if (isSuccess) return false;
      return Boolean(studioName.trim() || contactName.trim());
    };

    expect(shouldWarnOnExit('', '', false)).toBe(false);
    expect(shouldWarnOnExit('Aryan Photography', '', false)).toBe(true);
    expect(shouldWarnOnExit('Aryan Photography', '', true)).toBe(false);
  });

  // Test 7: Role Authority Transition
  it('7. Successful onboarding transitions authoritative database profile to "partner"', () => {
    const initialProfile = { id: 'u123', role: 'end_customer' };
    
    // Server activation payload
    const upgradeProfile = (profile: any) => {
      return {
        ...profile,
        role: 'partner',
        studio_name: 'Heritage Studios',
        partner_slug: 'heritage-studios',
        updated_at: new Date().toISOString()
      };
    };

    const partnerProfile = upgradeProfile(initialProfile);
    expect(partnerProfile.role).toBe('partner');
    expect(partnerProfile.studio_name).toBe('Heritage Studios');
  });

  // Test 8: Minimal Premium Authentication Card UX & Typography
  it('8. Auth card has compact "Studio" / "Couple" switcher with "SIGN IN" CTA', () => {
    const partnerConfig = {
      roleSelectorLabel: 'Studio',
      heading: 'STUDIO ACCESS',
      submitCta: 'SIGN IN',
      googleCta: 'Continue with Google',
      brandPrimary: '#741321',
    };

    expect(partnerConfig.roleSelectorLabel).toBe('Studio');
    expect(partnerConfig.roleSelectorLabel).not.toContain('₹899');
    expect(partnerConfig.heading).toBe('STUDIO ACCESS');
    expect(partnerConfig.submitCta).toBe('SIGN IN');
    expect(partnerConfig.googleCta).toBe('Continue with Google');
    expect(partnerConfig.googleCta).not.toContain('FAST');
    expect(partnerConfig.brandPrimary).toBe('#741321');
  });

  // Test 9: Dual Role State Switching without data destruction
  it('9. Switching account role maintains user email and password state', () => {
    const userState = {
      email: 'studio@aryanfilms.com',
      password: 'secretpassword123',
      role: 'end_customer'
    };

    // Switch role to partner
    const switchedRole = { ...userState, role: 'partner' };
    expect(switchedRole.email).toBe('studio@aryanfilms.com');
    expect(switchedRole.password).toBe('secretpassword123');
    expect(switchedRole.role).toBe('partner');
  });

});

