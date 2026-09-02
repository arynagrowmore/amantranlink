/**
 * 🏰 STUDIO PARTNER APPLICATION SHELL & WORKSPACE ARCHITECTURE TEST SUITE
 * Verifies persistent dark sidebar, compact workspace header, clean public vs workspace separation,
 * 10-tab workspace structure, studio account dropdown, and create invitation flow.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('🏰 Studio Partner Application Shell Architecture Suite', () => {
  const partnerDashboardFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/PartnerDashboard.tsx'),
    'utf-8'
  );
  const mainHeaderFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/StudioMainHeader.tsx'),
    'utf-8'
  );
  const accountMenuFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/StudioAccountMenu.tsx'),
    'utf-8'
  );
  const appFile = fs.readFileSync(
    path.resolve(__dirname, '../src/App.tsx'),
    'utf-8'
  );

  const navFile = fs.readFileSync(
    path.resolve(__dirname, '../src/utils/navigation.ts'),
    'utf-8'
  );

  it('1. Studio Sidebar includes AMANTRANLINK branding, STUDIO PARTNER badge, and Studio Identity card', () => {
    expect(partnerDashboardFile).toContain('AMANTRAN');
    expect(partnerDashboardFile).toContain('● STUDIO PARTNER');
    expect(partnerDashboardFile).toContain('Partner Active');
    expect(partnerDashboardFile).toContain('studioInitials');
  });

  it('2. Primary Navigation contains all 6 core workspace sections with line icons', () => {
    expect(partnerDashboardFile).toContain('Dashboard');
    expect(partnerDashboardFile).toContain('My Invitations');
    expect(partnerDashboardFile).toContain('Clients CRM');
    expect(partnerDashboardFile).toContain('Earnings &amp; Payouts');
    expect(partnerDashboardFile).toContain('Analytics');
    expect(partnerDashboardFile).toContain('Marketing Kit');
  });

  it('3. Studio Management Section includes Profile, Branding, Team Members, and Referral Settings', () => {
    expect(partnerDashboardFile).toContain('STUDIO MANAGEMENT');
    expect(partnerDashboardFile).toContain('Studio Profile');
    expect(partnerDashboardFile).toContain('Branding');
    expect(partnerDashboardFile).toContain('Team Members');
    expect(partnerDashboardFile).toContain('Referral Settings');
  });

  it('4. Compact Workspace Header contains Breadcrumbs, Share Link, Notifications, and Create CTA', () => {
    expect(mainHeaderFile).toContain('Workspace');
    expect(mainHeaderFile).toContain('tabTitles');
    expect(mainHeaderFile).toContain('Share Link');
    expect(mainHeaderFile).toContain('Notifications');
    expect(mainHeaderFile).toContain('+ Create Client Invitation');
    expect(mainHeaderFile).not.toContain('LIVE DEMO');
    expect(mainHeaderFile).not.toContain('PRICING &amp; PACKAGES');
  });

  it('5. Studio Account Dropdown provides Studio-focused options', () => {
    expect(accountMenuMenuText(accountMenuFile)).toContain('Studio Profile');
    expect(accountMenuFile).toContain('Branding &amp; Co-Badge');
    expect(accountMenuFile).toContain('Referral &amp; Payout Settings');
    expect(accountMenuFile).toContain('View AmantranLink Website');
    expect(accountMenuFile).toContain('Sign Out');
  });

  it('6. Create Invitation Flow uses 2-Step Client Details + Royal Theme Selection wizard', () => {
    expect(partnerDashboardFile).toContain('Step 1: Client & Wedding Details');
    expect(partnerDashboardFile).toContain('Step 2: Select Royal Theme');
    expect(partnerDashboardFile).toContain('handleCreateClientInvitation');
  });

  it('7. Navigation and App routes support all studio workspace hashes cleanly', () => {
    const combined = appFile + navFile;
    expect(combined).toContain('studio/dashboard');
    expect(combined).toContain('studio/invitations');
    expect(combined).toContain('studio/clients');
    expect(combined).toContain('studio/earnings');
    expect(combined).toContain('studio/analytics');
    expect(combined).toContain('studio/marketing');
    expect(combined).toContain('studio/profile');
    expect(combined).toContain('studio/branding');
    expect(combined).toContain('studio/team');
    expect(combined).toContain('studio/settings');
  });
});

function accountMenuMenuText(str: string): string {
  return str;
}
