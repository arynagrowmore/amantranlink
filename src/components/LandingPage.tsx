import React, { useState } from 'react';
import { 
  ArrowRight, Eye, CheckCircle2, ShieldCheck, 
  MapPin, Globe, Heart, Star, Sparkles, MessageCircle,
  Menu, X, User, Layers, Smartphone, Users, HelpCircle
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
import { useAuth } from '../context/AuthContext';
import { isTemplateUnlockedForUser } from '../services/razorpayClient';
import { UserAccountDropdown } from './UserAccountDropdown';

interface LandingPageProps {
  state?: WeddingProjectState;
  onEnterStudio: (preferredTheme?: ThemeId) => void;
  onPreviewTheme: (themeId: ThemeId) => void;
  onNavigateLogin?: () => void;
  onNavigateProfile?: (tab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => void;
  onNavigatePackages?: () => void;
}

const THEME_CATALOG: Array<{
  id: ThemeId;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  category: 'heritage' | 'traditional' | 'modern';
  features: string[];
  previewImg: string;
  price: number;
  isFeatured?: boolean;
}> = [
  {
    id: 'rajmahal',
    title: 'The Rajmahal',
    subtitle: 'शाही राजमहल व 3D द्वार',
    tagline: '3D Palace gates part open smoothly upon scroll with elephant procession and darbar elegance.',
    badge: '3D Heritage',
    category: 'heritage',
    features: ['3D Royal Gate Opening Animation', 'Elephant Procession Scroll Parallax', 'Auspicious Toran Decor & Shehnai'],
    previewImg: '/previews/theme-rajmahal.webp',
    price: 2299,
    isFeatured: true,
  },
  {
    id: 'royaldawn',
    title: 'The Royal Dawn',
    subtitle: 'उदयपुर पैलेस व स्वर्ण भोर',
    tagline: 'Udaipur lakefront palace grandeur with interactive gold foil scratch-heart blessing and 4-box live timer.',
    badge: 'Lakefront Aura',
    category: 'heritage',
    features: ['Lakefront Palace 3D Gate Reveal', 'Interactive Gold Scratch-Heart Card', 'Live 4-Box Muhurat Countdown'],
    previewImg: '/templates/royaldawn-template/public/assets/gate.jpg',
    price: 2299,
    isFeatured: true,
  },
  {
    id: 'jharokha',
    title: 'The Jharokha',
    subtitle: 'शाही झरोखा व संगमरमर',
    tagline: 'Rajasthani marble filigree arches, 24K gold foil inlays, and regal palace balcony view.',
    badge: 'Palace Filigree',
    category: 'heritage',
    features: ['Marble Filigree Balcony View', 'Golden Arch Shimmer & Parallax', 'Heritage Rajasthani Motifs'],
    previewImg: '/previews/theme-jharokha.webp',
    price: 1299,
  },
  {
    id: 'mayura',
    title: 'The Mayura',
    subtitle: 'मयूर पंख व पन्ना वैभव',
    tagline: 'Deep emerald teal tones with majestic dancing peacock feather animations and gold calligraphy.',
    badge: 'Emerald Grandeur',
    category: 'heritage',
    features: ['Dancing Peacock Plumes Animation', 'Emerald Teal & Gold Foil Luxury', 'Gold-Inlaid Royal Typography'],
    previewImg: '/previews/theme-mayura.webp',
    price: 1299,
  },
  {
    id: 'jodi',
    title: 'The Jodi',
    subtitle: 'शुभ विवाह व स्वर्ण थाली',
    tagline: 'Sacred 24K brass gold thaali with marigolds and illustrated couple caricature.',
    badge: 'Sacred Tradition',
    category: 'traditional',
    features: ['Sacred Gold Thaali Plate Rotation', 'Custom Illustrated Couple Portrait', 'Traditional Vivah Rasam Icons'],
    previewImg: '/previews/theme-jodi.webp',
    price: 1299,
  },
  {
    id: 'dak',
    title: 'The Shahi Dâk',
    subtitle: 'शाही डाक व मोहर पत्र',
    tagline: 'Vintage royal telegram postal envelope with crimson wax stamp seal and aged letterpress.',
    badge: 'Vintage Letterpress',
    category: 'traditional',
    features: ['Crimson Wax Stamp Seal Break', 'Vintage Postal Envelope Slide', 'Handcrafted Letterpress Texture'],
    previewImg: '/previews/theme-dak.webp',
    price: 1299,
  },
  {
    id: 'ivory',
    title: 'The Ivory',
    subtitle: 'मॉडर्न मिनिमलिस्ट व वोग',
    tagline: 'High-fashion editorial magazine aesthetic with crisp serif typography and warm alabaster.',
    badge: 'Haute Couture',
    category: 'modern',
    features: ['Vogue Editorial Layout & Grids', 'High-Fashion Split Serif Titles', 'Subtle Minimalist Parallax Scroll'],
    previewImg: '/previews/theme-ivory.webp',
    price: 1299,
  },
];

const TRUST_STRIP_ITEMS = [
  { title: '3D ROYAL GATES', desc: 'Interactive palace entrance', icon: <PalaceGateIcon className="w-5 h-5 text-[#C49A35]" /> },
  { title: 'SHEHNAI & FLUTE', desc: 'Immersive wedding audio', icon: <ShehnaiIcon className="w-5 h-5 text-[#C49A35]" /> },
  { title: 'LIVE RSVP', desc: 'Real-time guest responses', icon: <Users className="w-5 h-5 text-[#C49A35]" /> },
  { title: 'GPS NAVIGATION', desc: 'One-tap venue directions', icon: <VenueMapPinIcon className="w-5 h-5 text-[#C49A35]" /> },
  { title: 'WHATSAPP SHARING', desc: 'Instant invitation delivery', icon: <Globe className="w-5 h-5 text-[#C49A35]" /> },
];

const REAL_COUPLES = [
  {
    couple: 'Dhruv & Shreya Patel',
    location: 'The Milestone Palace, Himmatnagar',
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
    quote: 'A truly memorable digital invitation experience. Shahi Studio gave our guests a luxury hotel-grade invitation that everyone talked about.',
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
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'heritage' | 'traditional' | 'modern'>('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // 🧭 Detect scroll to smoothly compact navbar by 5-10%
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredThemes = THEME_CATALOG.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#241A17] flex flex-col font-manrope antialiased relative selection:bg-[#6E1020] selection:text-[#FFFDF8]">
      
      {/* ========================================================================= */}
      {/* 👑 1. REFINED LUXURY NAVBAR (FLOATING PILL OBJECT)                       */}
      {/* ========================================================================= */}
      <header className={`sticky top-3 sm:top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-all duration-300 ${
        isScrolled ? 'top-2 sm:top-2.5' : 'top-3 sm:top-4'
      }`}>
        <div className={`bg-[#FFFDF8]/95 backdrop-blur-xl border border-[#E8D5AD] rounded-full shadow-[0_10px_30px_-10px_rgba(67,9,20,0.08)] flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'px-5 sm:px-7 py-2.5 sm:py-3 shadow-[0_12px_32px_-8px_rgba(67,9,20,0.12)]' : 'px-5 sm:px-8 py-3.5 sm:py-4'
        }`}>
          
          {/* GROUP 1: BRAND LOGO (~18-20% Width) */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-[#6E1020] border border-[#C49A35] flex items-center justify-center text-[#C49A35] shadow-xs group-hover:scale-105 transition-transform duration-200">
              <RoyalCrestIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-cormorant font-bold text-lg sm:text-xl tracking-wider text-[#430914] uppercase block leading-none">
                Shahi Studio
              </span>
              <span className="text-[9px] font-manrope tracking-widest text-[#C49A35] uppercase font-bold block pt-0.5">
                Royal Digital Kankotri
              </span>
            </div>
          </div>

          {/* GROUP 2: MAIN NAVIGATION (CENTERED WITH GENEROUS BREATHING ROOM) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-manrope font-semibold uppercase tracking-wider text-[#430914]">
            <a href="#themes" className="hover:text-[#C49A35] transition-colors duration-200 py-1">
              7 Royal Themes
            </a>
            <a href="#demo" className="hover:text-[#C49A35] transition-colors duration-200 py-1">
              Live Demo
            </a>
            <a href="#experience" className="hover:text-[#C49A35] transition-colors duration-200 py-1">
              Features
            </a>
            <a href="#rsvp" className="hover:text-[#C49A35] transition-colors duration-200 py-1">
              RSVP
            </a>
            <a 
              href="#packages" 
              onClick={(e) => {
                if (onNavigatePackages) {
                  e.preventDefault();
                  onNavigatePackages();
                }
              }}
              className="hover:text-[#C49A35] transition-colors duration-200 py-1 cursor-pointer"
            >
              Packages
            </a>
            <a href="#faq" className="hover:text-[#C49A35] transition-colors duration-200 py-1">
              FAQ
            </a>
          </nav>

          {/* GROUP 3: ACCOUNT & PRIMARY CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <UserAccountDropdown
                onNavigateProfile={onNavigateProfile || (() => {})}
              />
            ) : (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8D5AD] text-[#430914] font-manrope font-semibold text-xs hover:bg-[#F8F3E8] hover:border-[#C49A35] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Log In</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEnterStudio('rajmahal')}
              className="px-5 py-2.5 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs uppercase tracking-wider shadow-xs border border-[#C49A35] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Create Invitation</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-[#F8F3E8] flex items-center justify-center text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* REFINED MOBILE NAVIGATION DRAWER */}
        {isMobileNavOpen && (
          <div className="md:hidden mt-2 bg-[#FFFDF8] border border-[#E8D5AD] rounded-3xl p-5 shadow-2xl space-y-3 font-manrope text-xs font-semibold uppercase tracking-wider text-[#430914] animate-in fade-in slide-in-from-top-2 duration-200">
            <a 
              href="#themes" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              7 Royal Themes
            </a>
            <a 
              href="#demo" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              Live Demo
            </a>
            <a 
              href="#experience" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              Features
            </a>
            <a 
              href="#rsvp" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              RSVP
            </a>
            <a 
              href="#packages" 
              onClick={(e) => {
                setIsMobileNavOpen(false);
                if (onNavigatePackages) {
                  e.preventDefault();
                  onNavigatePackages();
                }
              }} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              Packages
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsMobileNavOpen(false)} 
              className="block py-2 px-3 rounded-xl hover:bg-[#F8F3E8] hover:text-[#C49A35] transition-colors"
            >
              FAQ
            </a>
            
            <div className="pt-2 border-t border-[#E8D5AD] space-y-2">
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    if (onNavigateLogin) onNavigateLogin();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#E8D5AD] text-center text-[#430914] hover:bg-[#F8F3E8] font-manrope font-semibold block transition-colors"
                >
                  Log In / Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    if (onNavigateProfile) onNavigateProfile('profile');
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#E8D5AD] text-center text-[#430914] hover:bg-[#F8F3E8] font-manrope font-semibold block transition-colors"
                >
                  My Account Center
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onEnterStudio('rajmahal');
                }}
                className="w-full py-3 rounded-xl bg-[#6E1020] text-[#FFFDF8] text-center font-manrope font-semibold uppercase tracking-wider block border border-[#C49A35]"
              >
                Create Invitation
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/60 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>THE NEW ROYAL STANDARD IN INDIAN WEDDINGS</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-cormorant font-bold text-4xl sm:text-6xl xl:text-7xl text-[#6E1020] tracking-tight leading-[1.08]">
              ROYAL DIGITAL<br />
              WEDDING<br />
              KANKOTRI
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#241A17]/85 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              An unforgettable digital invitation crafted for the celebrations that matter most.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                type="button"
                onClick={() => onEnterStudio('rajmahal')}
                className="px-8 py-4 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-sm tracking-wider uppercase shadow-lg border border-[#C49A35] flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-105"
              >
                <span>CREATE MY KANKOTRI</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>

              <a
                href="#demo"
                className="px-6 py-4 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#6E1020] font-manrope font-semibold text-sm border border-[#E8D5AD] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#C49A35]" />
                <span>EXPLORE LIVE DEMO</span>
              </a>
            </div>

            {/* Trust Line */}
            <div className="pt-4 border-t border-[#E8D5AD]/60">
              <p className="text-xs text-[#75675C] font-medium leading-relaxed">
                3D Royal Gates • Shehnai Music • Live RSVP • GPS Navigation • WhatsApp Sharing
              </p>
            </div>

          </div>

          {/* Right Side: Interactive Invitation Preview */}
          <div className="lg:col-span-6 flex justify-center relative">
            <InteractiveHeroGate
              state={state}
              onOpenStudio={() => onEnterStudio('rajmahal')}
            />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌟 3. TRUST / FEATURE STRIP                                              */}
      {/* ========================================================================= */}
      <section className="bg-[#F8F3E8] border-y border-[#E8D5AD] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          {TRUST_STRIP_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-center shrink-0 shadow-xs">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-cormorant font-bold text-base text-[#6E1020] leading-tight truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#75675C] font-normal truncate">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📜 4. ROYAL INVITATION EXPERIENCE (THE ART OF A ROYAL INVITATION)        */}
      {/* ========================================================================= */}
      <div id="experience">
        <ArtOfRoyalInvitation onEnterStudio={() => onEnterStudio('rajmahal')} />
      </div>

      {/* ========================================================================= */}
      {/* 🎨 5. 7 ROYAL THEMES COLLECTION                                          */}
      {/* ========================================================================= */}
      <section id="themes" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>AUTHENTIC HERITAGE MOTIFS</span>
          </div>

          <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
            THE ROYAL THEME COLLECTION
          </h2>

          <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
            Seven distinctive expressions of Indian wedding grandeur.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All 7 Themes' },
              { id: 'heritage', label: 'Palace Heritage' },
              { id: 'traditional', label: 'Sacred Tradition' },
              { id: 'modern', label: 'Modern Couture' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-manrope font-semibold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-md border border-[#C49A35]'
                    : 'bg-[#F8F3E8] text-[#241A17] border border-[#E8D5AD] hover:bg-[#FFFDF8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7 Themes Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredThemes.map((theme) => (
            <div
              key={theme.id}
              className="group rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] overflow-hidden transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(67,9,20,0.05)] hover:shadow-[0_12px_35px_-5px_rgba(67,9,20,0.12)] flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-black">
                  <img
                    src={theme.previewImg}
                    alt={theme.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#6E1020]/90 backdrop-blur-md text-[#FFFDF8] px-2.5 py-1 rounded border border-[#C49A35]/40 shadow-xs">
                      {theme.badge}
                    </span>
                  </div>

                  {/* Hover Quick Preview Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button
                      type="button"
                      onClick={() => onPreviewTheme(theme.id)}
                      className="px-5 py-2.5 rounded-xl bg-[#FFFDF8] text-[#6E1020] font-manrope font-semibold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#C49A35]" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-cormorant font-bold text-2xl text-[#6E1020]">
                      {theme.title}
                    </h3>
                    <p className="text-xs text-[#C49A35] font-serif italic">
                      {theme.subtitle}
                    </p>
                    <p className="text-xs text-[#241A17]/80 font-normal leading-relaxed pt-1">
                      {theme.tagline}
                    </p>
                  </div>

                  {/* 3 Key Features */}
                  <div className="space-y-1.5 pt-3 border-t border-[#E8D5AD]/60 text-xs text-[#241A17]/85">
                    {theme.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEnterStudio(theme.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>CUSTOMIZE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C49A35]" />
                </button>
                <button
                  type="button"
                  onClick={() => onPreviewTheme(theme.id)}
                  className="p-3 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#6E1020] border border-[#E8D5AD] cursor-pointer"
                  title="Live Preview"
                >
                  <Eye className="w-4 h-4 text-[#C49A35]" />
                </button>
              </div>

            </div>
          ))}
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
      {/* 🏆 7. WHY SHAHI STUDIO (GENUINE PRODUCT DIFFERENTIATORS)                 */}
      {/* ========================================================================= */}
      <WhyShahiStudio />

      {/* ========================================================================= */}
      {/* 💌 8. LIVE RSVP COMMAND CENTER (DEEP WINE SECTION)                       */}
      {/* ========================================================================= */}
      <div id="rsvp">
        <RsvpShowcase onEnterStudio={() => onEnterStudio('rajmahal')} />
      </div>

      {/* ========================================================================= */}
      {/* 📜 9. YOUR ROYAL KANKOTRI IN 5 SIMPLE STEPS (HOW IT WORKS)               */}
      {/* ========================================================================= */}
      <RoyalJourneyWorkflow onEnterStudio={() => onEnterStudio('rajmahal')} />

      {/* ========================================================================= */}
      {/* 💌 10. REAL COUPLES / TESTIMONIALS                                       */}
      {/* ========================================================================= */}
      <section className="bg-[#F8F3E8] border-y border-[#E8D5AD] py-20 sm:py-28 px-4 sm:px-8 w-full font-manrope">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
              <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>REAL WEDDING EXPERIENCES</span>
            </div>

            <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
              CHERISHED BY FAMILIES ACROSS INDIA
            </h2>

            <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
              Stories from couples who chose digital royal invitations for their wedding celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REAL_COUPLES.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_4px_20px_-4px_rgba(67,9,20,0.05)] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#241A17]/85 font-normal leading-relaxed italic">
                    “{item.quote}”
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E8D5AD]/60 flex items-center gap-3 mt-6">
                  <span className="text-2xl">{item.avatar}</span>
                  <div>
                    <h4 className="font-cormorant font-bold text-base text-[#6E1020]">
                      {item.couple}
                    </h4>
                    <p className="text-[11px] text-[#75675C]">
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
      {/* ❓ 11. FAQ                                                                */}
      {/* ========================================================================= */}
      <PalaceFaqAccordion />

      {/* ========================================================================= */}
      {/* 🌟 13. FINAL EMOTIONAL CTA                                                */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
        <div className="rounded-3xl bg-gradient-to-br from-[#6E1020] via-[#560C19] to-[#430914] text-[#FFFDF8] p-10 sm:p-16 text-center space-y-6 border border-[#C49A35] shadow-[0_20px_50px_-10px_rgba(67,9,20,0.3)] relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#430914] border border-[#C49A35]/60 text-[#E8D5AD] text-xs font-manrope font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>COMMENCE YOUR CELEBRATION</span>
            </div>

            <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#FFFDF8] tracking-tight">
              BEGIN YOUR ROYAL INVITATION
            </h2>

            <p className="text-sm sm:text-base text-[#E8D5AD]/90 font-normal leading-relaxed">
              Turn your wedding announcement into an experience your guests will remember.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center">
              <button
                type="button"
                onClick={() => onEnterStudio('rajmahal')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#C49A35] to-[#A87E24] hover:from-[#D4AA45] hover:to-[#B88E34] text-[#24050B] font-manrope font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                CREATE MY KANKOTRI
              </button>

              <a
                href="#themes"
                className="px-7 py-4 rounded-xl bg-[#430914]/80 hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs sm:text-sm uppercase tracking-wider border border-[#C49A35]/50 transition-colors cursor-pointer"
              >
                EXPLORE THE ROYAL THEMES
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏰 14. LUXURY DEEP WINE FOOTER                                           */}
      {/* ========================================================================= */}
      <footer className="bg-[#430914] text-[#FFFDF8] pt-16 pb-12 px-4 sm:px-8 border-t border-[#C49A35]/30 font-manrope">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#C49A35]/20">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6E1020] border border-[#C49A35] flex items-center justify-center text-[#C49A35] shadow-xs">
                  <RoyalCrestIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-cormorant font-bold text-xl tracking-wider text-[#FFFDF8] uppercase block">
                    Shahi Studio
                  </span>
                  <span className="text-[10px] font-manrope tracking-widest text-[#C49A35] uppercase font-bold">
                    Royal Digital Kankotri Platform
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#E8D5AD]/75 font-normal leading-relaxed max-w-sm">
                India’s premier royal wedding invitation house. Handcrafted 3D palace architectures, Vedic rituals, and frictionless guest RSVP coordination.
              </p>

              <div className="text-xs text-[#C49A35] font-mono flex items-center gap-2 pt-1">
                <span>📍 Himmatnagar, Gujarat · Serving Families Worldwide</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-cormorant font-bold text-sm text-[#C49A35] uppercase tracking-wider">
                Explore Platform
              </h4>
              <ul className="space-y-1.5 text-xs text-[#E8D5AD]/80">
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
                    Packages
                  </a>
                </li>
                <li><a href="#faq" className="hover:text-[#FFFDF8] transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-cormorant font-bold text-sm text-[#C49A35] uppercase tracking-wider">
                Royal Concierge & Support
              </h4>
              <p className="text-xs text-[#E8D5AD]/75 leading-relaxed">
                Need help personalizing your invitation or choosing a royal theme? Contact our studio directly.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://wa.me/919409360336?text=Namaste%20Shahi%20Studio,%20I%20would%20like%20to%20know%20more%20about%20Royal%20Kankotri%20invitations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-manrope font-semibold text-xs uppercase tracking-wider shadow transition-transform hover:scale-105 cursor-pointer"
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
              © {new Date().getFullYear()} Shahi Studio. All Royal Rights Reserved.
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </span>
              <span>·</span>
              <span>Razorpay Verified</span>
              <span>·</span>
              <span>Made with Royal Craft in India</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
