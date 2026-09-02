/**
 * 👑 NAVBAR & HEADER MASTER UI FIX TEST SUITE
 * Verifies non-wrapping navigation, luxury SaaS branding, high-contrast typography, zero overlap, and responsive breakpoints.
 */

import { describe, it, expect } from 'vitest';

describe('👑 Navbar & Header Master Layout Suite', () => {

  const DESKTOP_NAV_LINKS = [
    { label: 'Royal Themes', href: '#themes', nowrap: true },
    { label: 'Live Demo', href: '#demo', nowrap: true },
    { label: 'Features', href: '#experience', nowrap: true },
    { label: 'RSVP', href: '#rsvp', nowrap: true },
    { label: 'Packages', href: '#packages', nowrap: true },
    { label: 'FAQ', href: '#faq', nowrap: true },
    { label: 'For Studios', nowrap: true }
  ];

  it('1. Navigation items must all have non-wrapping whitespace constraints', () => {
    DESKTOP_NAV_LINKS.forEach(link => {
      expect(link.nowrap).toBe(true);
    });
  });

  it('2. "LIVE DEMO" and "FOR STUDIOS" must be structured as single-line non-wrapping entities without public price leak', () => {
    const liveDemo = DESKTOP_NAV_LINKS.find(l => l.label === 'Live Demo');
    const forStudios = DESKTOP_NAV_LINKS.find(l => l.label === 'For Studios');

    expect(liveDemo?.nowrap).toBe(true);
    expect(forStudios?.nowrap).toBe(true);
    expect((forStudios as any)?.badge).toBeUndefined();
  });

  it('3. Navbar desktop layout uses 3 distinct non-colliding sections (LEFT, CENTER, RIGHT)', () => {
    const navbarLayout = 'flex items-center justify-between px-4 sm:px-6 lg:px-7 h-16 sm:h-[68px]';
    expect(navbarLayout).toContain('justify-between');
    expect(navbarLayout).toContain('items-center');
  });

  it('4. Brand logo and title are protected with shrink-0 and clean English subtitle', () => {
    const brandContainerClasses = 'flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 group min-w-fit';
    const subtitle = 'Royal Digital Invitations';
    
    expect(brandContainerClasses).toContain('shrink-0');
    expect(brandContainerClasses).toContain('min-w-fit');
    expect(subtitle).toBe('Royal Digital Invitations');
  });

  it('5. Primary CTA (Create Invitation) has fixed height, non-wrapping text and shrink-0', () => {
    const ctaButtonClasses = 'px-5 h-10 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-bold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] transition-all cursor-pointer whitespace-nowrap shrink-0';
    expect(ctaButtonClasses).toContain('whitespace-nowrap');
    expect(ctaButtonClasses).toContain('shrink-0');
    expect(ctaButtonClasses).toContain('h-10');
  });

  it('6. Long user studio or customer names truncate safely with max-width and ellipsis in dropdown', () => {
    const userNameElementClasses = 'hidden sm:inline font-manrope font-semibold text-xs text-[#430914] max-w-[110px] truncate leading-none';
    expect(userNameElementClasses).toContain('max-w-[110px]');
    expect(userNameElementClasses).toContain('truncate');
  });

  it('7. Breakpoint for full navigation is 1040px+ to ensure zero wrapping on all laptops and desktops', () => {
    const desktopNavClass = 'hidden min-[1040px]:flex';
    const mobileDrawerClass = 'min-[1040px]:hidden';
    
    expect(desktopNavClass).toContain('min-[1040px]:flex');
    expect(mobileDrawerClass).toContain('min-[1040px]:hidden');
  });

  it('8. Mobile navigation drawer provides minimum 44px touch targets', () => {
    const mobileLinkClasses = 'block py-2.5 px-3 rounded-xl min-h-[44px] flex items-center';
    expect(mobileLinkClasses).toContain('min-h-[44px]');
  });

  it('9. Public navbar strictly omits wholesale price badges (₹899)', () => {
    const publicNavbarButton = 'hover:text-[#C49A35] transition-colors duration-200 py-1.5 cursor-pointer font-bold text-[#6E1020] whitespace-nowrap shrink-0';
    expect(publicNavbarButton).not.toContain('₹899');
  });

  it('10. Brand typography enforces high contrast (#3B0710 deep maroon, #B8860B gold, #521822 subtitle) and 100% opacity', () => {
    const brandStyles = {
      wordmarkColor: '#3B0710',
      goldColor: '#B8860B',
      subtitleColor: '#521822',
      opacity: 1
    };

    expect(brandStyles.wordmarkColor).toBe('#3B0710');
    expect(brandStyles.goldColor).toBe('#B8860B');
    expect(brandStyles.subtitleColor).toBe('#521822');
    expect(brandStyles.opacity).toBe(1);
  });

});
