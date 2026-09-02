/**
 * 👑 TEMPLATE PREVIEW CARDS COMPLETION & UNCLIPPED BALANCE TEST SUITE
 * Verifies self-contained card layout, per-template image positioning,
 * full metadata & feature list, wholesale pricing footer, and sufficient section bottom padding.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('👑 Template Preview Card Completion & Unclipped Balance Suite', () => {
  it('1. Themes section has ample bottom padding to prevent visual clipping', () => {
    const landingFile = fs.readFileSync(
      path.resolve(__dirname, '../src/components/LandingPage.tsx'),
      'utf-8'
    );
    expect(landingFile).toContain('id="themes"');
    expect(landingFile).toContain('pb-24');
    expect(landingFile).toContain('sm:pb-32');
  });

  it('2. Template cards use self-contained flex column layout with 16:10 aspect ratio and per-template image positioning', () => {
    const landingFile = fs.readFileSync(
      path.resolve(__dirname, '../src/components/LandingPage.tsx'),
      'utf-8'
    );
    expect(landingFile).toContain('flex flex-col h-full');
    expect(landingFile).toContain('aspect-[16/10]');
    expect(landingFile).toContain('theme.imagePosition');
    expect(landingFile).toContain("object-[center_35%]");
  });

  it('3. Card body renders metadata, title, Hindi subtitle, description, and feature checkmarks', () => {
    const landingFile = fs.readFileSync(
      path.resolve(__dirname, '../src/components/LandingPage.tsx'),
      'utf-8'
    );
    expect(landingFile).toContain('theme.categoryLabel');
    expect(landingFile).toContain('theme.title');
    expect(landingFile).toContain('theme.subtitle');
    expect(landingFile).toContain('theme.tagline');
    expect(landingFile).toContain('theme.features.slice(0, 3)');
  });

  it('4. Card footer uses mt-auto with distinct wholesale pricing strip and dual editorial actions', () => {
    const landingFile = fs.readFileSync(
      path.resolve(__dirname, '../src/components/LandingPage.tsx'),
      'utf-8'
    );
    expect(landingFile).toContain('mt-auto');
    expect(landingFile).toContain('PARTNER RATE');
    expect(landingFile).toContain('LIVE PREVIEW');
    expect(landingFile).toContain('SELECT THEME');
  });

  it('5. StandardizedTemplateCard in TemplateGallery uses matching self-contained architecture with per-template positioning', () => {
    const galleryFile = fs.readFileSync(
      path.resolve(__dirname, '../src/components/TemplateGallery.tsx'),
      'utf-8'
    );
    expect(galleryFile).toContain('flex flex-col h-full');
    expect(galleryFile).toContain('aspect-[16/10]');
    expect(galleryFile).toContain('template.imagePosition');
    expect(galleryFile).toContain("object-[center_35%]");
    expect(galleryFile).toContain('mt-auto');
    expect(galleryFile).toContain('PARTNER RATE');
    expect(galleryFile).toContain('LIVE PREVIEW');
    expect(galleryFile).toContain('SELECT THEME');
  });
});
