import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TemplateGallery, ROYAL_7_TEMPLATES, StandardizedTemplateCard } from '../src/components/TemplateGallery';
import { LandingPage } from '../src/components/LandingPage';
import { ThemeSelector, themes } from '../src/components/ThemeSelector';
import { AuthProvider } from '../src/context/AuthContext';
import { DEFAULT_WEDDING_STATE } from '../src/types/wedding';

describe('Template Gallery & Cards Standardization Suite', () => {
  it('should include all 7 royal authentic templates in ROYAL_7_TEMPLATES', () => {
    expect(ROYAL_7_TEMPLATES.length).toBe(7);
    const slugs = ROYAL_7_TEMPLATES.map((t) => t.slug);
    expect(slugs).toEqual(['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory']);
  });

  it('should have 16:10 fixed aspect ratio container for preview images in StandardizedTemplateCard', () => {
    const cardHtml = renderToString(
      <AuthProvider>
        <StandardizedTemplateCard
          template={ROYAL_7_TEMPLATES[0]}
          onPreview={() => {}}
          onSelect={() => {}}
        />
      </AuthProvider>
    );

    expect(cardHtml).toContain('aspect-[16/10]');
    expect(cardHtml).toContain('The Rajmahal');
    expect(cardHtml).toContain('3D Royal Gate Opening Animation');
    expect(cardHtml).toContain('SELECT THEME');
    expect(cardHtml).toContain('Interactive 3D Preview');
  });

  it('should render all 7 templates in TemplateGallery component', () => {
    const galleryHtml = renderToString(
      <AuthProvider>
        <TemplateGallery
          selectedTheme="rajmahal"
          onSelectTheme={() => {}}
        />
      </AuthProvider>
    );

    expect(galleryHtml).toContain('THE ROYAL THEME COLLECTION');
    expect(galleryHtml).toContain('The Rajmahal');
    expect(galleryHtml).toContain('The Royal Dawn');
    expect(galleryHtml).toContain('The Jharokha');
    expect(galleryHtml).toContain('The Mayura');
    expect(galleryHtml).toContain('The Jodi');
    expect(galleryHtml).toContain('The Shahi Dâk');
    expect(galleryHtml).toContain('The Ivory');
  });

  it('should render standardized template cards on the LandingPage', () => {
    const landingHtml = renderToString(
      <AuthProvider>
        <LandingPage
          state={DEFAULT_WEDDING_STATE}
          onEnterStudio={() => {}}
          onPreviewTheme={() => {}}
        />
      </AuthProvider>
    );

    expect(landingHtml).toContain('THE ROYAL THEME COLLECTION');
    expect(landingHtml).toContain('aspect-[16/10]');
    expect(landingHtml).toContain('The Rajmahal');
    expect(landingHtml).toContain('ALL THEMES INCLUDED');
    expect(landingHtml).toContain('SINGLE THEME ACCESS');
  });

  it('should render standardized cards in ThemeSelector in editor mode', () => {
    const selectorHtml = renderToString(
      <AuthProvider>
        <ThemeSelector
          selectedTheme="rajmahal"
          onThemeChange={() => {}}
          onSaveAndNext={() => {}}
        />
      </AuthProvider>
    );

    expect(selectorHtml).toContain('aspect-[16/10]');
    expect(selectorHtml).toContain('The Rajmahal');
    expect(selectorHtml).toContain('The Royal Dawn');
  });
});
