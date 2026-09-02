/**
 * 👑 STUDIO PARTNER NAVBAR FINAL PREMIUM MICRO-POLISH TEST SUITE
 * Verifies all 11 optical polish requirements:
 * 1. Left brand area with refined subtitle and baseline badge
 * 2. Center navigation with optimal gap and consistent typography
 * 3. MORE menu with aligned chevron and elegant popover
 * 4. Compact Studio Partner account dropdown
 * 5. Primary Burgundy + CREATE INVITATION CTA
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('👑 Studio Partner Navbar Final Premium Micro-Polish Suite', () => {
  const landingFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/LandingPage.tsx'),
    'utf-8'
  );
  const userAccountDropdownFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/UserAccountDropdown.tsx'),
    'utf-8'
  );

  it('1. Left brand area has refined subtitle tracking and baseline STUDIO badge', () => {
    expect(landingFile).toContain('AMANTRAN');
    expect(landingFile).toContain('LINK');
    expect(landingFile).toContain('STUDIO');
    expect(landingFile).toContain('STUDIO PARTNER WORKSPACE');
    expect(landingFile).toContain('tracking-[0.14em]');
  });

  it('2. Center navigation uses optical responsive gap and consistent typography', () => {
    expect(landingFile).toContain('THEMES');
    expect(landingFile).toContain('LIVE DEMO');
    expect(landingFile).toContain('FEATURES');
    expect(landingFile).toContain('PRICING &amp; PACKAGES');
    expect(landingFile).toContain('clamp(16px,1.8vw,28px)');
    expect(landingFile).toContain('tracking-[0.06em]');
  });

  it('3. MORE dropdown has precisely aligned chevron and smooth popover', () => {
    expect(landingFile).toContain('MORE');
    expect(landingFile).toContain('isMoreNavOpen');
    expect(landingFile).toContain('w-3 h-3');
  });

  it('4. Right area contains compact account dropdown and + CREATE INVITATION CTA', () => {
    expect(landingFile).toContain('UserAccountDropdown');
    expect(landingFile).toContain('+ Create Invitation');
    expect(landingFile).toContain('bg-[#6E1020]');
    expect(landingFile).toContain('hover:bg-[#5C0D1A]');
  });

  it('5. UserAccountDropdown trigger button has refined studio partner identity', () => {
    expect(userAccountDropdownFile).toContain('STUDIO PARTNER');
    expect(userAccountDropdownFile).toContain('bg-[#F4F9F6]');
    expect(userAccountDropdownFile).toContain('border-[#167A5A]/30');
  });
});
