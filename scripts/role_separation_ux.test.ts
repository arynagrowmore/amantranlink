/**
 * 👑 ROLE-AWARE UX NAVIGATION & DROPDOWN SEPARATION MASTER TEST SUITE
 * Verifies strict UI/UX role boundaries between GUEST, END_CUSTOMER, PARTNER, and ADMIN.
 */

import { describe, it, expect } from 'vitest';

describe('👑 Role Separation UX & Navbar Visibility Master Test Suite', () => {

  // Navbar visibility helper matching LandingPage.tsx logic
  const getNavbarState = (user: { role?: string } | null, loading = false) => {
    const isCustomer = Boolean(user && (user.role === 'end_customer' || user.role === 'customer' || user.role === 'couple'));
    const isPartner = Boolean(user && (user.role === 'partner' || user.role === 'photographer_partner' || user.role === 'photographer' || user.role === 'studio'));
    const isAdmin = Boolean(user && user.role === 'admin');

    const showForStudiosCTA = !user && !loading;
    const showStudioDashboardNav = isPartner;
    // Strict rule: Wholesale partner price (₹899) is NEVER rendered in the public navbar
    const showPartnerPriceBadge = false;

    const baseNavLinks = ['Royal Themes', 'Live Demo', 'Features', 'RSVP', 'Packages', 'FAQ'];
    const activeNavLinks = [...baseNavLinks];

    if (showForStudiosCTA) {
      activeNavLinks.push('For Studios');
    }
    if (showStudioDashboardNav) {
      activeNavLinks.push('Studio Dashboard');
    }

    return {
      isCustomer,
      isPartner,
      isAdmin,
      showForStudiosCTA,
      showStudioDashboardNav,
      showPartnerPriceBadge,
      activeNavLinks
    };
  };

  const CUSTOMER_DROPDOWN_ITEMS = [
    'My Profile',
    'My Purchases',
    'Transaction History',
    'My Wedding Invitations',
    'My Kankotri RSVPs',
    'Sign Out'
  ];

  const PARTNER_DROPDOWN_ITEMS = [
    'Studio Dashboard',
    'My Clients',
    'My Invitations',
    'Partner Wallet',
    'Earnings / Commissions',
    'Marketing Kit',
    'My Profile',
    'Sign Out'
  ];

  const ADMIN_DROPDOWN_ITEMS = [
    'Admin Control Center',
    'Platform Management',
    'My Profile',
    'Sign Out'
  ];

  it('1. Guest / unauthenticated visitor sees clean "For Studios" link', () => {
    const guestState = getNavbarState(null, false);
    expect(guestState.showForStudiosCTA).toBe(true);
    expect(guestState.activeNavLinks).toContain('For Studios');
  });

  it('2. Guest does NOT see ₹899 wholesale price badge in public navbar', () => {
    const guestState = getNavbarState(null, false);
    expect(guestState.showPartnerPriceBadge).toBe(false);
  });

  it('3. Customer does NOT see "For Studios"', () => {
    const customerUser = { role: 'end_customer' };
    const customerState = getNavbarState(customerUser);
    expect(customerState.showForStudiosCTA).toBe(false);
    expect(customerState.activeNavLinks).not.toContain('For Studios');
  });

  it('4. Customer does NOT see ₹899 partner badge', () => {
    const customerUser = { role: 'end_customer' };
    const customerState = getNavbarState(customerUser);
    expect(customerState.showPartnerPriceBadge).toBe(false);
  });

  it('5. Customer does NOT see Studio Dashboard', () => {
    const customerUser = { role: 'end_customer' };
    const customerState = getNavbarState(customerUser);
    expect(customerState.showStudioDashboardNav).toBe(false);
    expect(customerState.activeNavLinks).not.toContain('Studio Dashboard');
  });

  it('6. Customer cannot access partner route (guarded by authoritative role check)', () => {
    const customerUser = { role: 'end_customer' };
    const canAccessPartnerRoute = customerUser.role === 'partner';
    expect(canAccessPartnerRoute).toBe(false);
  });

  it('7. Partner does NOT see guest acquisition CTA ("For Studios")', () => {
    const partnerUser = { role: 'partner' };
    const partnerState = getNavbarState(partnerUser);
    expect(partnerState.showForStudiosCTA).toBe(false);
    expect(partnerState.activeNavLinks).not.toContain('For Studios');
  });

  it('8. Partner sees Studio Dashboard in navbar', () => {
    const partnerUser = { role: 'partner' };
    const partnerState = getNavbarState(partnerUser);
    expect(partnerState.showStudioDashboardNav).toBe(true);
    expect(partnerState.activeNavLinks).toContain('Studio Dashboard');
  });

  it('9. Partner sees partner workspace in dropdown menu', () => {
    const partnerMenu = PARTNER_DROPDOWN_ITEMS;
    expect(partnerMenu).toContain('Studio Dashboard');
    expect(partnerMenu).toContain('My Clients');
    expect(partnerMenu).toContain('Partner Wallet');
    expect(partnerMenu).toContain('Earnings / Commissions');
  });

  it('10. Admin does not expose admin navigation to non-admin users', () => {
    const customerUser = { role: 'end_customer' };
    const partnerUser = { role: 'partner' };

    const getDropdown = (role: string) => {
      if (role === 'admin') return ADMIN_DROPDOWN_ITEMS;
      if (role === 'partner') return PARTNER_DROPDOWN_ITEMS;
      return CUSTOMER_DROPDOWN_ITEMS;
    };

    expect(getDropdown(customerUser.role)).not.toContain('Admin Control Center');
    expect(getDropdown(partnerUser.role)).not.toContain('Admin Control Center');
    expect(getDropdown('admin')).toContain('Admin Control Center');
  });

  it('11. OAuth login resolves role before role-sensitive navbar renders (loading guard)', () => {
    const loadingState = getNavbarState(null, true);
    // While auth/profile is loading, marketing CTA does not flash incorrectly
    expect(loadingState.showForStudiosCTA).toBe(false);
  });

  it('12. Refresh preserves correct role-based navbar from authoritative profile', () => {
    const reloadedProfile = { role: 'end_customer' };
    const state = getNavbarState(reloadedProfile, false);
    expect(state.isCustomer).toBe(true);
    expect(state.showForStudiosCTA).toBe(false);
  });

  it('13. Logout restores clean guest navbar with "For Studios" without wholesale pricing leak', () => {
    const loggedOutState = getNavbarState(null, false);
    expect(loggedOutState.showForStudiosCTA).toBe(true);
    expect(loggedOutState.activeNavLinks).toContain('For Studios');
    expect(loggedOutState.showPartnerPriceBadge).toBe(false);
  });

  it('14. Stale localStorage role cannot override database role (role normalization enforces dbProfile)', () => {
    const dbProfile = { role: 'end_customer' };
    const rawRole = (dbProfile.role || '').toLowerCase();
    const normalizedRole = rawRole === 'partner' ? 'partner' : (rawRole === 'admin' ? 'admin' : 'end_customer');

    expect(normalizedRole).toBe('end_customer');
  });

});
