/**
 * 🎨 STUDIO BRANDING PAGE REDESIGN TEST SUITE
 * Verifies the human-designed Studio Branding & Live Preview experience.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('🎨 Studio Branding & Customization Redesign Suite', () => {
  const brandingFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/StudioBrandingTab.tsx'),
    'utf-8'
  );
  const partnerDashboardFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/PartnerDashboard.tsx'),
    'utf-8'
  );

  it('1. Page Header contains Title, Subtitle, and Preview Client Experience CTA', () => {
    expect(brandingFile).toContain('Studio Branding');
    expect(brandingFile).toContain('Customize how your studio appears across client-facing AmantranLink experiences.');
    expect(brandingFile).toContain('Preview Client Experience');
  });

  it('2. Brand Identity Surface contains Title and Subtitle', () => {
    expect(brandingFile).toContain('BRAND IDENTITY');
    expect(brandingFile).toContain('Make every client invitation feel consistent with your studio.');
  });

  it('3. Studio Display Name input includes helper text', () => {
    expect(brandingFile).toContain('Studio Display Name');
    expect(brandingFile).toContain('This name appears on client-facing invitations');
  });

  it('4. Studio Accent contains all curated color options and custom hex picker', () => {
    expect(brandingFile).toContain('Studio Accent');
    expect(brandingFile).toContain('Amantran Teal');
    expect(brandingFile).toContain('Royal Burgundy');
    expect(brandingFile).toContain('Heritage Gold');
    expect(brandingFile).toContain('Midnight');
    expect(brandingFile).toContain('Custom Color');
    expect(brandingFile).toContain('#2D7A74');
    expect(brandingFile).toContain('#7B1620');
    expect(brandingFile).toContain('#B58A2A');
    expect(brandingFile).toContain('#1C1917');
  });

  it('5. Client Welcome Message includes textarea, character count, and helper text', () => {
    expect(brandingFile).toContain('Client Welcome Message');
    expect(brandingFile).toContain('charCount');
    expect(brandingFile).toContain('maxChars');
    expect(brandingFile).toContain('Shown to clients when they open an invitation');
  });

  it('6. Action Footer contains Unsaved Changes indicator, Reset button, and Save Branding CTA', () => {
    expect(brandingFile).toContain('Unsaved changes');
    expect(brandingFile).toContain('All changes saved');
    expect(brandingFile).toContain('Reset');
    expect(brandingFile).toContain('SAVE BRANDING');
  });

  it('7. Live Client Preview features realistic browser mockup, dynamic badge, heading, and styled CTA', () => {
    expect(brandingFile).toContain('LIVE CLIENT PREVIEW');
    expect(brandingFile).toContain('PRESENTED BY');
    expect(brandingFile).toContain('A Royal Celebration Awaits');
    expect(brandingFile).toContain('View Invitation');
    expect(brandingFile).toContain('Verified Studio Partner Experience');
  });

  it('8. PartnerDashboard wires StudioBrandingTab into activeTab === branding', () => {
    expect(partnerDashboardFile).toContain('StudioBrandingTab');
    expect(partnerDashboardFile).toContain("activeTab === 'branding'");
  });
});
