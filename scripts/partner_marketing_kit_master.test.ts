/**
 * 📢 PHOTOGRAPHER / STUDIO PARTNER MARKETING KIT MASTER TEST SUITE
 * Verifies dynamic non-localhost referral URL generation, 5-metric performance snapshot,
 * 4 unified marketing assets (QR, A4 Poster, Story, WhatsApp), client outreach templates,
 * client experience preview, and earnings connection.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('📢 Partner Marketing Kit Master Architecture Suite', () => {
  const marketingTabFile = fs.readFileSync(
    path.resolve(__dirname, '../src/components/PartnerDashboard/PartnerMarketingTab.tsx'),
    'utf-8'
  );
  const originUtilFile = fs.readFileSync(
    path.resolve(__dirname, '../src/utils/origin.ts'),
    'utf-8'
  );

  it('1. Referral URL uses dynamic origin resolver without hardcoding localhost', () => {
    expect(originUtilFile).toContain('getCurrentAppOrigin');
    expect(originUtilFile).toContain('window.location.origin');
    expect(originUtilFile).toContain('VITE_PUBLIC_APP_URL');
    expect(marketingTabFile).toContain('getCurrentAppOrigin()');
    expect(marketingTabFile).not.toContain('http://localhost:');
    expect(marketingTabFile).not.toContain('https://localhost:');
  });

  it('2. Page Header features Studio Hub breadcrumb, active partner indicator, and Create Invitation CTA', () => {
    expect(marketingTabFile).toContain('Studio Hub');
    expect(marketingTabFile).toContain('PARTNER NETWORK ACTIVE');
    expect(marketingTabFile).toContain('Grow Your Studio with AmantranLink');
    expect(marketingTabFile).toContain('+ Create Client Invitation');
  });

  it('3. Performance snapshot includes 5 compact partner metrics', () => {
    expect(marketingTabFile).toContain('Referral Visits');
    expect(marketingTabFile).toContain('Client Signups');
    expect(marketingTabFile).toContain('Paid Invitations');
    expect(marketingTabFile).toContain('Conversion Rate');
    expect(marketingTabFile).toContain('Estimated Earnings');
  });

  it('4. Primary Referral Command Center provides Copy Link, Open Link, and Web Share API with verification indicator', () => {
    expect(marketingTabFile).toContain('Your Studio Referral Link');
    expect(marketingTabFile).toContain('SERVER ATTRIBUTION ACTIVE');
    expect(marketingTabFile).toContain('handleCopyLink');
    expect(marketingTabFile).toContain('handleShare');
    expect(marketingTabFile).toContain('navigator.share');
  });

  it('5. Quick Share Channels includes WhatsApp, Instagram, Email, and 1-Click Copy', () => {
    expect(marketingTabFile).toContain('Share With Clients');
    expect(marketingTabFile).toContain('handleOpenWhatsAppClient');
    expect(marketingTabFile).toContain('handleOpenMailClient');
    expect(marketingTabFile).toContain('WhatsApp');
    expect(marketingTabFile).toContain('Instagram');
    expect(marketingTabFile).toContain('Email Client');
  });

  it('6. Marketing Assets Studio contains 4 unified downloadable and previewable assets', () => {
    expect(marketingTabFile).toContain('Studio Referral QR');
    expect(marketingTabFile).toContain('A4 Wedding Invitation Poster');
    expect(marketingTabFile).toContain('Instagram Story Card');
    expect(marketingTabFile).toContain('WhatsApp Client Card');
    expect(marketingTabFile).toContain('downloadQrPng');
    expect(marketingTabFile).toContain('downloadPrintCard');
    expect(marketingTabFile).toContain('downloadStoryAsset');
    expect(marketingTabFile).toContain('downloadWhatsAppCard');
  });

  it('7. Client Outreach Templates includes customizable WhatsApp, Instagram Caption, and Email proposals', () => {
    expect(marketingTabFile).toContain('Client Outreach Templates');
    expect(marketingTabFile).toContain('activeTemplateTab');
    expect(marketingTabFile).toContain('customGreeting');
    expect(marketingTabFile).toContain('customContactPhone');
    expect(marketingTabFile).toContain('handleCopyTemplateMessage');
  });

  it('8. Client Experience preview and Partner Earnings connection are present', () => {
    expect(marketingTabFile).toContain('Your Client Experience');
    expect(marketingTabFile).toContain('Partner Earnings Connection');
    expect(marketingTabFile).toContain('Available Balance');
    expect(marketingTabFile).toContain('Pending Commission');
    expect(marketingTabFile).toContain('Recent Referral Activity');
  });
});
