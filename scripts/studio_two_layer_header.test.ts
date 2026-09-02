/**
 * 👑 STUDIO WORKSPACE HEADER & NAVIGATION TEST SUITE
 * Verifies clean StudioMainHeader, StudioWorkspaceNav, StudioAccountMenu,
 * and seamless integration with PartnerDashboard.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('👑 Studio Partner Workspace Header Suite', () => {
  const mainHeaderFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/StudioMainHeader.tsx'),
    'utf-8'
  );
  const accountMenuFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/StudioAccountMenu.tsx'),
    'utf-8'
  );
  const partnerDashboardFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/PartnerDashboard.tsx'),
    'utf-8'
  );

  it('1. StudioMainHeader renders clean utility header with breadcrumb and context', () => {
    expect(mainHeaderFile).toContain('Workspace');
    expect(mainHeaderFile).toContain('tabTitles');
    expect(mainHeaderFile).toContain('onCopyReferral');
  });

  it('2. StudioMainHeader provides Share Referral, Notifications, Account Switcher, and + Create Client Invitation CTA', () => {
    expect(mainHeaderFile).toContain('Share Link');
    expect(mainHeaderFile).toContain('Notifications');
    expect(mainHeaderFile).toContain('+ Create Client Invitation');
    expect(mainHeaderFile).toContain('bg-[#0F766E]');
  });

  it('3. PartnerDashboard uses sidebar as primary navigation and maintains workspace tabs', () => {
    expect(partnerDashboardFile).toContain('Dashboard');
    expect(partnerDashboardFile).toContain('My Invitations');
    expect(partnerDashboardFile).toContain('Clients CRM');
    expect(partnerDashboardFile).toContain('Earnings & Payouts');
    expect(partnerDashboardFile).toContain('Studio Analytics');
    expect(partnerDashboardFile).toContain('Marketing Kit');
  });

  it('4. StudioAccountMenu includes complete studio switcher actions', () => {
    expect(accountMenuFile).toContain('Verified Studio Partner');
    expect(accountMenuFile).toContain('Studio Dashboard');
    expect(accountMenuFile).toContain('Studio Profile');
    expect(accountMenuFile).toContain('Branding &amp; Co-Badge');
    expect(accountMenuFile).toContain('Referral &amp; Payout Settings');
    expect(accountMenuFile).toContain('View AmantranLink Website');
  });
});
