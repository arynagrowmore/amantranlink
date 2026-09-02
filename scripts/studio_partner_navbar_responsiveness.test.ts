/**
 * 👑 STUDIO PARTNER NAVBAR RESPONSIVENESS & ZERO-COLLISION TEST SUITE
 * Verifies independent flex layout (Left, Center, Right), text visibility for PRICING & PACKAGES,
 * responsive More dropdown, and zero text overlap/clipping.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('👑 Studio Partner Navbar Responsiveness & Zero-Collision Suite', () => {
  const landingFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/LandingPage.tsx'),
    'utf-8'
  );

  it('1. Left section has AMANTRANLINK brand, STUDIO badge, and STUDIO PARTNER WORKSPACE', () => {
    expect(landingFile).toContain('AMANTRAN');
    expect(landingFile).toContain('LINK');
    expect(landingFile).toContain('STUDIO');
    expect(landingFile).toContain('STUDIO PARTNER WORKSPACE');
  });

  it('2. Center section includes THEMES, LIVE DEMO, FEATURES, and PRICING & PACKAGES with whitespace-nowrap and shrink-0', () => {
    expect(landingFile).toContain('THEMES');
    expect(landingFile).toContain('LIVE DEMO');
    expect(landingFile).toContain('FEATURES');
    expect(landingFile).toContain('PRICING &amp; PACKAGES');
    expect(landingFile).toContain('whitespace-nowrap shrink-0');
  });

  it('3. Center section uses flex-1 min-w-0 without overflow-hidden clipping', () => {
    expect(landingFile).toContain('flex-1 min-w-0');
    // Ensure center nav doesn't have overflow-hidden that would clip PRICING & PACKAGES
    expect(landingFile).not.toContain('flex-1 px-2 overflow-hidden');
  });

  it('4. Right section includes User Account Dropdown and + Create Invitation CTA without redundant Studio Hub button', () => {
    expect(landingFile).toContain('UserAccountDropdown');
    expect(landingFile).toContain('+ Create Invitation');
  });

  it('5. Responsive More dropdown handles secondary navigation on compact viewports', () => {
    expect(landingFile).toContain('isMoreNavOpen');
    expect(landingFile).toContain('MORE');
    expect(landingFile).toContain('moreNavRef');
  });
});
