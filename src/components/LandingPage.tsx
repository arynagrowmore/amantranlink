import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Eye, CheckCircle2, ShieldCheck, 
  MapPin, Globe, Heart, Star, Sparkles, MessageCircle,
  Menu, X, User, Layers, Smartphone, Users, HelpCircle, ChevronDown
} from 'lucide-react';
import { ThemeId, WeddingProjectState } from '../types/wedding';
import { 
  RoyalCrestIcon, PalaceGateIcon, ShehnaiIcon, 
  MuhuratClockIcon, VenueMapPinIcon, DiyaIcon 
} from './ShahiIcons';
import { InteractiveHeroGate } from './InteractiveHeroGate';
import { GoldParticlesCanvas } from './landing/GoldParticlesCanvas';
import { RoyalLiveDemo } from './landing/RoyalLiveDemo';
import { RsvpShowcase } from './landing/RsvpShowcase';
import { ArtOfRoyalInvitation } from './landing/ArtOfRoyalInvitation';
import { WhyShahiStudio } from './landing/WhyShahiStudio';
import { RoyalJourneyWorkflow } from './landing/RoyalJourneyWorkflow';
import { PalaceFaqAccordion } from './landing/PalaceFaqAccordion';
import { StudioGrowthStory } from './landing/StudioGrowthStory';
import { ComparisonSection } from './landing/ComparisonSection';
import { useAuth } from '../context/AuthContext';
import { isTemplateUnlockedForUser } from '../services/razorpayClient';
import { calculatePaymentDetails } from '../config/pricing';
import { UserAccountDropdown } from './UserAccountDropdown';
import { RoleIndicatorBanner } from './RoleIndicatorBanner';
import { stopAllIframesAudio } from '../services/audioCoordinator';

interface LandingPageProps {
  state?: WeddingProjectState;
  onEnterStudio: (preferredTheme?: ThemeId) => void;
  onPreviewTheme: (themeId: ThemeId) => void;
  onNavigateLogin?: () => void;
  onNavigateProfile?: (tab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => void;
  onNavigatePackages?: () => void;
  onOpenPartnerModal?: () => void;
  onNavigatePartnerHub?: () => void;
}

const THEME_CATALOG: Array<{
  id: ThemeId;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  category: 'heritage' | 'royal' | 'traditional' | 'modern' | 'engagement';
  categoryLabel: string;
  features: string[];
  previewImg: string;
  packageType: 'gold' | 'silver';
  price: number;
  imagePosition?: string;
  isFeatured?: boolean;
}> = [];

const TRUST_STRIP_ITEMS = [
  { 
    title: '3D Royal Gates', 
    desc: 'Interactive palace entrance', 
    icon: <PalaceGateIcon className="w-5 h-5 text-[#6E1020]" />,
    accent: 'border-[#6E1020]/25 bg-[#FAF0F2] text-[#6E1020]' 
  },
  { 
    title: 'Shehnai & Flute Audio', 
    desc: 'Immersive wedding music', 
    icon: <ShehnaiIcon className="w-5 h-5 text-[#6E1020]" />,
    accent: 'border-[#6E1020]/25 bg-[#FAF0F2] text-[#6E1020]' 
  },
  { 
    title: 'Live RSVP Tracking', 
    desc: 'Real-time guest headcounts', 
    icon: <Users className="w-5 h-5 text-[#6E1020]" />,
    accent: 'border-[#6E1020]/25 bg-[#FAF0F2] text-[#6E1020]' 
  },
  { 
    title: 'Google Maps Navigation', 
    desc: 'One-tap venue directions', 
    icon: <VenueMapPinIcon className="w-5 h-5 text-[#6E1020]" />,
    accent: 'border-[#6E1020]/25 bg-[#FAF0F2] text-[#6E1020]' 
  },
  { 
    title: 'Instant WhatsApp Links', 
    desc: 'Personalized guest dispatches', 
    icon: <MessageCircle className="w-5 h-5 text-[#6E1020]" />,
    accent: 'border-[#6E1020]/25 bg-[#FAF0F2] text-[#6E1020]' 
  },
];

const REAL_COUPLES = [
  {
    couple: 'Rudra & Ishani Patel',
    location: 'The Milestone Palace, Modasa',
    theme: 'The Rajmahal 3D',
    quote: 'Our guests were completely captivated when the 3D palace gates parted open with traditional shehnai music. Our catering headcounts were seamless because of the live RSVP dashboard.',
    avatar: '🏰',
  },
  {
    couple: 'Rohan & Ananya Singhania',
    location: 'Fateh Garh Palace, Udaipur',
    theme: 'The Royal Dawn',
    quote: 'The gold scratch-heart blessing card was the highlight for our family. Every relative loved scratching to reveal our wedding date and sacred muhurat.',
    avatar: '🌅',
  },
  {
    couple: 'Dr. Kabir & Dr. Sanjana Mehta',
    location: 'Taj Falaknuma Palace, Hyderabad',
    theme: 'The Mayura Emerald',
    quote: 'A truly memorable digital invitation experience. AmantranLink gave our guests a luxury hotel-grade invitation that everyone talked about.',
    avatar: '🦚',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  onEnterStudio,
  onPreviewTheme,
  onNavigateLogin,
  onNavigateProfile,
  onNavigatePackages,
  onOpenPartnerModal,
  onNavigatePartnerHub,
}) => {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'heritage' | 'traditional' | 'modern' | 'engagement'>('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMoreNavOpen, setIsMoreNavOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const moreNavRef = useRef<HTMLDivElement>(null);

  // 🛡️ Authoritative Role Normalization & Role-Based UI Gating
  const isCustomer = Boolean(user && (user.role === 'end_customer' || user.role === 'customer' || user.role === 'couple'));
  const isPartner = Boolean(user && (user.role === 'partner' || user.role === 'photographer_partner' || user.role === 'photographer' || user.role === 'studio'));
  const isAdmin = Boolean(user && user.role === 'admin');

  // "For Studios" marketing acquisition CTA is ONLY shown when user is NOT authenticated (Guest)
  const showForStudiosCTA = !user && !loading;

  // "Studio Dashboard" navigation item is shown when authenticated as Partner
  const showStudioDashboardNav = isPartner;

  // 🧭 Detect scroll to smoothly compact navbar by 5-10%
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🖱️ Close More popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreNavRef.current && !moreNavRef.current.contains(event.target as Node)) {
        setIsMoreNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔇 Silence all audio and template preview sound on Homepage
  useEffect(() => {
    stopAllIframesAudio();
  }, []);

  const filteredThemes = THEME_CATALOG.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#241A17] flex flex-col font-manrope antialiased relative selection:bg-[#6E1020] selection:text-[#FFFDF8]">
      
      {/* ========================================================================= */}
      {/* 👑 1. REFINED LUXURY NAVBAR (LEFT / CENTER / RIGHT CLEAN ARCHITECTURE)  */}
      {/* ========================================================================= */}
      <header className={`sticky top-2 sm:top-3 z-40 px-3 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full transition-all duration-300 ${
        isScrolled ? 'top-1.5 sm:top-2' : 'top-2 sm:top-3'
      }`}>
        <div className={`bg-[#FFFDF8]/95 backdrop-blur-md rounded-full flex items-center justify-between px-4 sm:px-6 lg:px-7 h-16 sm:h-[70px] transition-all duration-300 w-full ${
          isPartner 
            ? 'border border-[#167A5A]/25 shadow-[0_8px_24px_-8px_rgba(22,122,90,0.08)]' 
            : 'border border-[#E8D5AD]/80 shadow-[0_8px_24px_-8px_rgba(67,9,20,0.06)]'
        } ${
          isScrolled ? (isPartner ? 'shadow-[0_12px_28px_-6px_rgba(22,122,90,0.12)]' : 'shadow-[0_12px_28px_-6px_rgba(67,9,20,0.10)]') : ''
        }`}>
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: LEFT BRAND IDENTITY (FLEX: 0 0 AUTO)                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 group mr-2 sm:mr-3 lg:mr-4" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="AmantranLink · Royal Digital Invitations"
          >
            <img 
              src="/amantranlink.png" 
              alt="AmantranLink Logo" 
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain group-hover:scale-[1.03] transition-transform duration-150 shrink-0" 
            />
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="amantranlink-wordmark text-[14.5px] sm:text-[16px] lg:text-[17px] leading-none tracking-tight whitespace-nowrap">
                  AMANTRAN<span className="amantranlink-wordmark-gold">LINK</span>
                </span>
                {isPartner && (
                  <span className="hidden sm:inline-flex items-center text-[8.5px] font-mono font-bold bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/25 px-1.5 py-0.5 rounded tracking-wider uppercase leading-none">
                    STUDIO
                  </span>
                )}
              </div>
              <span className="amantranlink-wordmark-sub leading-none mt-1 whitespace-nowrap text-[8.5px] sm:text-[9px] text-[#7A6B63] font-semibold tracking-[0.14em] uppercase">
                {isPartner ? 'STUDIO PARTNER WORKSPACE' : 'Royal Digital Invitations'}
              </span>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: CENTER NAVIGATION (FLEX: 1 1 AUTO, MIN-WIDTH: 0)       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <nav className="hidden lg:flex items-center justify-center gap-[clamp(16px,1.8vw,28px)] text-[11.5px] lg:text-xs font-manrope font-semibold uppercase tracking-[0.06em] text-[#3D141A] flex-1 min-w-0 px-2">
            <a href="#themes" className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 whitespace-nowrap shrink-0">
              THEMES
            </a>
            <a href="#experience" className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 whitespace-nowrap shrink-0">
              FEATURES
            </a>
            <a 
              href="#packages" 
              onClick={(e) => {
                if (onNavigatePackages) {
                  e.preventDefault();
                  onNavigatePackages();
                }
              }}
              className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              Pricing &amp; Packages
            </a>
            
            {/* Extended Nav Items on Extra Wide Screens, More Dropdown on Narrower Desktop */}
            <div className="hidden 2xl:flex items-center gap-[clamp(16px,1.8vw,28px)] shrink-0">
              {!isPartner && (
                <a href="#rsvp" className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 whitespace-nowrap shrink-0">
                  RSVP
                </a>
              )}
              <a href="#faq" className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 whitespace-nowrap shrink-0">
                FAQ
              </a>
              {showForStudiosCTA && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPartnerModal) onOpenPartnerModal();
                    else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-partner-modal'));
                  }}
                  className="hover:text-[#C49A35] transition-colors duration-150 py-1.5 cursor-pointer font-bold text-[#6E1020] whitespace-nowrap shrink-0"
                >
                  <span>For Studios</span>
                </button>
              )}
            </div>

            {/* Compact More Popover for 1024px to 1535px screens */}
            <div className="2xl:hidden relative shrink-0" ref={moreNavRef}>
              <button
                type="button"
                onClick={() => setIsMoreNavOpen(!isMoreNavOpen)}
                className="flex items-center gap-1 text-[#3D141A] hover:text-[#C49A35] transition-colors duration-150 py-1.5 whitespace-nowrap shrink-0 cursor-pointer font-semibold"
              >
                <span>More</span>
                <ChevronDown className={`w-3 h-3 text-[#7A6B63] transition-transform duration-200 ${isMoreNavOpen ? 'rotate-180 text-[#C49A35]' : ''}`} />
              </button>

              {isMoreNavOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#FFFDF8] border border-[#E8D5AD]/90 rounded-2xl shadow-[0_12px_32px_-8px_rgba(67,9,20,0.12)] py-1.5 px-1 z-50 animate-in fade-in zoom-in-95 duration-150 text-left normal-case">
                  {!isPartner && (
                    <a
                      href="#rsvp"
                      onClick={() => setIsMoreNavOpen(false)}
                      className="block px-3.5 py-2 text-[11.5px] font-semibold text-[#3D141A] hover:bg-[#F8F3E8] hover:text-[#C49A35] rounded-xl transition-colors"
                    >
                      RSVP
                    </a>
                  )}
                  <a
                    href="#faq"
                    onClick={() => setIsMoreNavOpen(false)}
                    className="block px-3.5 py-2 text-[11.5px] font-semibold text-[#3D141A] hover:bg-[#F8F3E8] hover:text-[#C49A35] rounded-xl transition-colors"
                  >
                    FAQ
                  </a>
                  {showForStudiosCTA && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreNavOpen(false);
                        if (onOpenPartnerModal) onOpenPartnerModal();
                        else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-partner-modal'));
                      }}
                      className="w-full text-left px-3.5 py-2 text-[11.5px] font-bold text-[#6E1020] hover:bg-[#F8F3E8] hover:text-[#C49A35] rounded-xl transition-colors cursor-pointer"
                    >
                      For Studios
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: RIGHT ACTIONS & PRIMARY CTA (FLEX: 0 0 AUTO)            */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 lg:gap-3.5 shrink-0 ml-2 sm:ml-0">
            {user ? (
              <UserAccountDropdown
                onNavigateProfile={onNavigateProfile || (() => {})}
                onOpenPartnerModal={onOpenPartnerModal}
                onNavigatePartnerHub={onNavigatePartnerHub}
                className="shrink-0"
              />
            ) : (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 h-10 rounded-full border border-[#E8D5AD] text-[#430914] font-manrope font-semibold text-xs hover:bg-[#F8F3E8] hover:border-[#C49A35] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 text-[#C49A35] shrink-0" />
                <span>Log In</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEnterStudio('darbar')}
              className="px-3 sm:px-5 lg:px-6 h-9 sm:h-10 rounded-full bg-[#6E1020] hover:bg-[#5C0D1A] text-[#FFFDF8] font-manrope font-bold text-[11px] sm:text-xs uppercase tracking-[0.06em] shadow-[0_2px_8px_-2px_rgba(110,16,32,0.25)] hover:shadow-[0_4px_14px_-2px_rgba(110,16,32,0.35)] border border-[#C49A35]/60 hover:brightness-105 active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
            >
              <span className="hidden sm:inline">+ Create Invitation</span>
              <span className="sm:hidden">+ Create</span>
            </button>

            {/* Mobile Menu Toggle Button (<1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-[#F8F3E8] flex items-center justify-center text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] transition-colors cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* REFINED MOBILE NAVIGATION DRAWER (<1024px) */}
        {isMobileNavOpen && (
          <div className="lg:hidden mt-2 bg-[#FFFDF8] border border-[#E8D5AD] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 font-manrope text-xs font-semibold uppercase tracking-wider text-[#430914] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Studio Partner Identity Card in Mobile Drawer */}
            {isPartner && (
              <div className="p-3 bg-gradient-to-br from-[#F4F9F6] to-[#FFFDF8] border border-[#167A5A]/30 rounded-2xl mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#167A5A] block uppercase">
                    Partner Workspace
                  </span>
                  <span className="font-bold text-sm text-stone-900 block truncate">
                    {user?.studioName || user?.name || 'Studio Partner'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    if (onNavigatePartnerHub) onNavigatePartnerHub();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#167A5A] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Open Hub
                </button>
              </div>
            )}

            <a 
              href="#themes" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors min-h-[44px] flex items-center"
            >
              Explore Themes
            </a>
            <a 
              href="#experience" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors min-h-[44px] flex items-center"
            >
              Features
            </a>
            {!isPartner && (
              <a 
                href="#rsvp" 
                onClick={() => setIsMobileNavOpen(false)} 
                className="block py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors min-h-[44px] flex items-center"
              >
                RSVP
              </a>
            )}
            <a 
              href="#packages" 
              onClick={(e) => {
                setIsMobileNavOpen(false);
                if (onNavigatePackages) {
                  e.preventDefault();
                  onNavigatePackages();
                }
              }} 
              className="block py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Pricing &amp; Packages
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors min-h-[44px] flex items-center"
            >
              FAQ
            </a>

            {/* GUEST ONLY: Mobile Partner Acquisition CTA */}
            {showForStudiosCTA && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  if (onOpenPartnerModal) onOpenPartnerModal();
                  else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-partner-modal'));
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[#F8F3E8] text-[#6E1020] font-bold transition-colors cursor-pointer flex items-center justify-between min-h-[44px]"
              >
                <span>For Studios</span>
              </button>
            )}

            <div className="pt-2 border-t border-[#E8D5AD] space-y-2">
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    if (onNavigateLogin) onNavigateLogin();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#E8D5AD] text-center text-[#430914] hover:bg-[#F8F3E8] font-manrope font-semibold block transition-colors min-h-[44px]"
                >
                  Log In / Account
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onEnterStudio('darbar');
                }}
                className="w-full py-3 rounded-xl bg-[#6E1020] text-[#FFFDF8] text-center font-manrope font-semibold uppercase tracking-wider block border border-[#C49A35] min-h-[44px]"
              >
                + Create Invitation
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 🏰 2. CINEMATIC HERO SECTION                                             */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Soft Ambient Gold Particles */}
        <GoldParticlesCanvas className="opacity-50" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center relative z-10">
          
          {/* Left Side: Editorial Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-sans font-semibold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>✦ The Digital Wedding Heirloom · India&apos;s Premier Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif font-bold text-4xl sm:text-6xl xl:text-7xl text-[#6E1020] tracking-tight leading-[1.08] text-balance">
              The Art of the Royal Wedding Invitation, <span className="text-[#C49A35] italic font-normal">Reimagined</span> for the Modern Era.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg lg:text-[19px] text-[#6E1020] font-bold leading-[1.8] max-w-xl mx-auto lg:mx-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              Transform your sacred celebration into an authentic digital heirloom. Personal royal kankotris featuring 3D opening palace gates, ceremonial shehnai music, instant WhatsApp delivery, verified guest RSVPs, and GPS Google Maps directions.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                type="button"
                onClick={() => onEnterStudio('darbar')}
                className="px-8 py-4 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-[0_10px_28px_-6px_rgba(110,16,32,0.3)] border border-[#C49A35]/60 flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create Your Royal Invitation</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>

              <a
                href="#themes"
                className="px-6 py-4 rounded-2xl bg-white hover:bg-[#FAF6EE] text-[#6E1020] font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider border border-[#E8DCC8] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer hover:border-[#C49A35]"
              >
                <Eye className="w-4 h-4 text-[#C49A35]" />
                <span>Explore 8 Royal Themes</span>
              </a>
            </div>

            {/* Live Credibility & Proof Bar */}
            <div className="pt-6 border-t-2 border-[#E8D5AD] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#6E1020] block leading-tight">12,500+</span>
                <span className="text-xs text-[#6E1020] font-bold">Weddings Celebrated</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#6E1020] block leading-tight">4.9 ★★★★★</span>
                <span className="text-xs text-[#6E1020] font-bold">Family Rating</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#6E1020] block leading-tight">Instant</span>
                <span className="text-xs text-[#6E1020] font-bold">WhatsApp Delivery</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#167A5A] block leading-tight">₹0 Free</span>
                <span className="text-xs text-[#6E1020] font-bold">To Design &amp; Preview</span>
              </div>
            </div>

          </div>

          {/* Right Side: Interactive Invitation Preview */}
          <div className="lg:col-span-6 flex justify-center relative">
            <InteractiveHeroGate
              state={state}
              onOpenStudio={() => onEnterStudio('darbar')}
            />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌟 3. TRUST / FEATURE STRIP                                              */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EE] to-[#FFFDF8] border-y-2 border-[#E8D5AD] py-8 sm:py-10 px-4 sm:px-8 font-sans shadow-2xs">
        <div className="max-w-7xl mx-auto">
          {/* Subtle Strip Header */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs sm:text-sm font-serif font-bold text-[#6E1020] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C49A35]" />
              Signature Royal Capabilities
            </span>
            <span className="text-[11px] sm:text-xs font-sans font-bold text-[#8B1528] bg-white border border-[#E8DCC8] px-3 py-1 rounded-full shadow-2xs">
              ✦ Included in All 7 Themes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {TRUST_STRIP_ITEMS.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8D5AD] shadow-[0_4px_16px_-4px_rgba(67,9,20,0.06)] hover:border-[#C49A35] hover:shadow-md transition-all group ${
                  idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${item.accent}`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-[15px] sm:text-base text-[#6E1020] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-[#6E1020] font-bold leading-normal mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📊 3.5. TRADITIONAL PAPER VS ROYAL DIGITAL COMPARISON                     */}
      {/* ========================================================================= */}
      <ComparisonSection onEnterStudio={() => onEnterStudio('darbar')} />

      {/* ========================================================================= */}
      {/* 📜 4. ROYAL INVITATION EXPERIENCE (THE ART OF A ROYAL INVITATION)        */}
      {/* ========================================================================= */}
      <div id="experience">
        <ArtOfRoyalInvitation onEnterStudio={() => onEnterStudio('darbar')} />
      </div>

      {/* ========================================================================= */}
      {/* 🎨 5. 7 ROYAL THEMES COLLECTION (SELF-CONTAINED COMPLETE PRODUCT CARDS)   */}
      {/* ========================================================================= */}
      <section id="themes" className="pt-16 pb-24 sm:pt-20 sm:pb-32 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-sans font-semibold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>✦ Exclusive Royal Collection</span>
          </div>

          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
            The Royal Theme Collection
          </h2>

          <p className="text-base sm:text-lg text-[#6E1020] font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            This space has been completely cleared and prepared for the next flagship royal collection. New designs will be unveiled here shortly.
          </p>
        </div>

        {/* Clean Empty Placeholder State - Completely Pristine */}
        <div className="max-w-2xl mx-auto p-12 sm:p-16 rounded-3xl bg-[#FAF6EE]/90 border-2 border-dashed border-[#E8D5AD] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#6E1020]/10 border border-[#C49A35]/30 flex items-center justify-center text-[#6E1020]">
            <Sparkles className="w-7 h-7 text-[#C49A35]" />
          </div>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#6E1020]">
            New Royal Collection In Preparation
          </h3>
          <p className="text-xs sm:text-sm text-[#75675C] max-w-md mx-auto leading-relaxed">
            All previous templates have been cleared out. We are awaiting the next suite of royal wedding designs to be added here soon.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📱 6. LIVE DEMO (EXPERIENCE THE ROYAL INVITATION)                         */}
      {/* ========================================================================= */}
      <RoyalLiveDemo
        onEnterStudio={onEnterStudio}
        onPreviewTheme={onPreviewTheme}
      />

      {/* ========================================================================= */}
      {/* 🏆 7. WHY AMANTRANLINK (GENUINE PRODUCT DIFFERENTIATORS)                  */}
      {/* ========================================================================= */}
      <WhyShahiStudio />

      {/* ========================================================================= */}
      {/* 💌 8. LIVE RSVP COMMAND CENTER (DEEP WINE SECTION)                       */}
      {/* ========================================================================= */}
      <div id="rsvp">
        <RsvpShowcase onEnterStudio={() => onEnterStudio('darbar')} />
      </div>

      {/* ========================================================================= */}
      {/* 📜 9. YOUR ROYAL KANKOTRI IN 5 SIMPLE STEPS (HOW IT WORKS)               */}
      {/* ========================================================================= */}
      <RoyalJourneyWorkflow onEnterStudio={() => onEnterStudio('darbar')} />

      {/* ========================================================================= */}
      {/* 💌 10. REAL COUPLES / TESTIMONIALS                                       */}
      {/* ========================================================================= */}
      <section className="bg-[#FAF8F5] border-y border-[#E8DCC8] py-20 sm:py-28 px-4 sm:px-8 w-full font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-sans font-semibold tracking-wider uppercase shadow-2xs">
              <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Real Wedding Experiences</span>
            </div>

            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
              Cherished by Families Across India
            </h2>

            <p className="text-base sm:text-lg text-[#6E1020] font-bold max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              Stories from couples who chose digital royal invitations for their wedding celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REAL_COUPLES.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-[#E8DCC8] shadow-[0_4px_24px_-4px_rgba(67,9,20,0.06)] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#350811] font-medium leading-relaxed italic">
                    “{item.quote}”
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E8DCC8]/60 flex items-center gap-3 mt-6">
                  <span className="text-2xl">{item.avatar}</span>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#6E1020]">
                      {item.couple}
                    </h4>
                    <p className="text-[11px] text-[#6E1020] font-semibold">
                      {item.location}
                    </p>
                    <p className="text-[10px] font-mono text-[#C49A35] font-semibold pt-0.5">
                      Theme: {item.theme}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📸 11. STUDIO GROWTH STORY (DISTINCTIVE INDIAN WEDDING STUDIO JOURNEY)     */}
      {/* ========================================================================= */}
      {!isCustomer && (
        <StudioGrowthStory
          isPartner={isPartner}
          onOpenPartnerModal={onOpenPartnerModal}
          onNavigatePartnerHub={onNavigatePartnerHub}
        />
      )}

      {/* ========================================================================= */}
      {/* ❓ 12. FAQ                                                                */}
      {/* ========================================================================= */}
      <PalaceFaqAccordion />

      {/* ========================================================================= */}
      {/* 🌟 13. FINAL EMOTIONAL CTA                                                */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE1] text-[#1A1715] p-10 sm:p-16 text-center space-y-6 border-2 border-[#C49A35]/50 shadow-[0_16px_40px_-8px_rgba(196,154,53,0.18)] relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-sans font-semibold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Commence Your Celebration</span>
            </div>

            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
              Begin Your Royal Invitation
            </h2>

            <p className="text-sm sm:text-base text-[#6E1020] font-bold leading-relaxed">
              Turn your wedding announcement into an unforgettable digital celebration your guests will cherish forever.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center">
              <button
                type="button"
                onClick={() => onEnterStudio('darbar')}
                className="px-8 py-4 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Create My Royal Kankotri</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>

              <a
                href="#themes"
                className="px-7 py-4 rounded-2xl bg-white hover:bg-[#FAF6EE] text-[#6E1020] font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider border border-[#E8DCC8] hover:border-[#C49A35] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Explore Royal Themes</span>
              </a>
            </div>

            <p className="text-xs text-[#75675C] pt-2">
              ✓ Instant Setup · ✓ Real-Time Live Preview · ✓ WhatsApp Delivery Ready
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏰 14. LUXURY ROYAL ATELIER FOOTER                                       */}
      {/* ========================================================================= */}
      <footer className="bg-[#430914] text-[#FFFDF8] pt-16 pb-12 px-4 sm:px-8 border-t border-[#C49A35]/30 font-sans">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#C49A35]/20">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/amantranlink.png" 
                  alt="AmantranLink Logo" 
                  className="h-11 w-auto object-contain brightness-110 drop-shadow-md"
                />
              </div>

              <p className="text-xs text-[#E8D5AD]/85 font-normal leading-relaxed max-w-sm">
                India’s premier royal wedding invitation house. Handcrafted 3D palace architectures, Vedic rituals, and frictionless guest RSVP coordination.
              </p>

              <div className="text-xs text-[#C49A35] font-sans flex items-center gap-2 pt-1">
                <span>📍 Modasa, Gujarat · Serving Families Worldwide</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-serif font-bold text-base text-[#C49A35] tracking-wide">
                Explore Platform
              </h4>
              <ul className="space-y-2 text-xs text-[#E8D5AD]/80">
                <li><a href="#themes" className="hover:text-[#FFFDF8] transition-colors">Royal Themes</a></li>
                <li><a href="#demo" className="hover:text-[#FFFDF8] transition-colors">Live Demo</a></li>
                <li><a href="#experience" className="hover:text-[#FFFDF8] transition-colors">Features</a></li>
                <li><a href="#rsvp" className="hover:text-[#FFFDF8] transition-colors">RSVP System</a></li>
                <li>
                  <a 
                    href="#packages" 
                    onClick={(e) => {
                      if (onNavigatePackages) {
                        e.preventDefault();
                        onNavigatePackages();
                      }
                    }}
                    className="hover:text-[#FFFDF8] transition-colors cursor-pointer"
                  >
                    Pricing &amp; Packages
                  </a>
                </li>
                <li><a href="#faq" className="hover:text-[#FFFDF8] transition-colors">FAQ</a></li>
                {!isCustomer && (
                  <li className="pt-1.5 mt-1.5 border-t border-[#E8D5AD]/20">
                    <button 
                      type="button"
                      onClick={() => {
                        if (isPartner && onNavigatePartnerHub) {
                          onNavigatePartnerHub();
                        } else if (onOpenPartnerModal) {
                          onOpenPartnerModal();
                        } else if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-partner-modal'));
                        }
                      }}
                      className="hover:text-[#FFFDF8] text-[#C49A35] font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                    >
                      <span>{isPartner ? '📸 Studio Partner Workspace' : '📸 For Photographers & Studios'}</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Support Column */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-serif font-bold text-base text-[#C49A35] tracking-wide">
                Royal Concierge &amp; Support
              </h4>
              <p className="text-xs text-[#E8D5AD]/80 leading-relaxed">
                Need help personalizing your invitation or choosing a royal theme? Contact our studio directly.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://wa.me/919409360336?text=Namaste%20AmantranLink,%20I%20would%20like%20to%20know%20more%20about%20Royal%20Digital%20invitations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans font-semibold text-xs tracking-wider shadow transition-transform hover:scale-105 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp (+91 9409360336)</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8D5AD]/60">
            <div>
              © {new Date().getFullYear()} AmantranLink. All Royal Rights Reserved.
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Razorpay Verified</span>
              <span>·</span>
              <span>Made with Royal Craft in India</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 👑 Bottom Role Status Bar (Couple vs Photographer) */}
      <RoleIndicatorBanner
        onNavigatePartnerHub={onNavigatePartnerHub}
      />

    </div>
  );
};

export default LandingPage;
