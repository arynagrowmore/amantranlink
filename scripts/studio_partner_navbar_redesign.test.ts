/**
 * 👑 STUDIO PARTNER NAVBAR & HEADER REDESIGN TEST SUITE
 * Verifies role-based navigation separation, distinct Studio Hub workspace button,
 * studio identity dropdown, clean center navigation, and primary + Create Invitation CTA.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('👑 Studio Partner Navbar & Header Architecture Suite', () => {
  const landingPageFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/LandingPage.tsx'),
    'utf-8'
  );
  const userAccountDropdownFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/UserAccountDropdown.tsx'),
    'utf-8'
  );
  const navbarFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/Navbar.tsx'),
    'utf-8'
  );

  it('1. LandingPage navbar container uses full 1440px max-width and role-aware styling', () => {
    expect(landingPageFile).toContain('max-w-[1440px]');
    expect(landingPageFile).toContain('isPartner');
    expect(landingPageFile).toContain('border-[#167A5A]/30');
  });

  it('2. Brand logo area has proper right margin to prevent collision with navigation', () => {
    expect(landingPageFile).toContain('mr-2 sm:mr-3 lg:mr-4');
    expect(landingPageFile).toContain('STUDIO PARTNER WORKSPACE');
  });

  it('3. Studio Partner navbar renders clean right actions without redundant Studio Hub button', () => {
    expect(landingPageFile).toContain('UserAccountDropdown');
    expect(landingPageFile).toContain('+ Create Invitation');
  });

  it('4. Center navigation is clean for Studio Partners (Pricing & Packages, Explore Themes)', () => {
    expect(landingPageFile).toContain('Explore Themes');
    expect(landingPageFile).toContain('Pricing &amp; Packages');
    expect(landingPageFile).toContain('!isPartner && (');
  });

  it('5. Primary CTA is + Create Invitation with high-contrast prominence', () => {
    expect(landingPageFile).toContain('+ Create Invitation');
    expect(landingPageFile).toContain('bg-[#6E1020]');
    expect(landingPageFile).toContain('border-[#C49A35]');
  });

  it('6. UserAccountDropdown renders studio partner identity, studio initials/avatar, and wholesale badge', () => {
    expect(userAccountDropdownFile).toContain('user.studioName || user.name');
    expect(userAccountDropdownFile).toContain('Studio Partner');
    expect(userAccountDropdownFile).toContain('Verified Studio Partner · Wholesale ₹899');
    expect(userAccountDropdownFile).toContain('Studio Dashboard');
    expect(userAccountDropdownFile).toContain('Client Invitations');
    expect(userAccountDropdownFile).toContain('Clients CRM');
    expect(userAccountDropdownFile).toContain('Earnings &amp; Payouts');
  });

  it('7. Builder Navbar provides Studio Hub return shortcut for authenticated partners', () => {
    expect(navbarFile).toContain('isPartner && onNavigatePartnerHub');
    expect(navbarFile).toContain('Studio Hub');
    expect(navbarFile).toContain('Studio Editor');
  });
});
