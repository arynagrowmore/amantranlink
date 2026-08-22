import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Eye, Volume2, VolumeX, ArrowRight, 
  ChevronLeft, ChevronRight, Play, CheckCircle2 
} from 'lucide-react';
import { ThemeId } from '../../types/wedding';
import { RoyalCrestIcon, DiyaIcon } from '../ShahiIcons';

interface RoyalLiveDemoProps {
  onEnterStudio: (themeId: ThemeId) => void;
  onPreviewTheme: (themeId: ThemeId) => void;
}

const DEMO_THEMES: Array<{
  id: ThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  badge: string;
  previewImg: string;
}> = [
  {
    id: 'rajmahal',
    name: 'Rajmahal',
    subtitle: 'शाही राजमहल व 3D द्वार',
    tagline: '3D Palace gateway opens on scroll with lossless shehnai melody.',
    badge: '3D Heritage',
    previewImg: '/previews/theme-rajmahal.webp',
  },
  {
    id: 'royaldawn',
    name: 'Royal Dawn',
    subtitle: 'उदयपुर पैलेस व स्वर्ण भोर',
    tagline: 'Udaipur lakefront palace with interactive gold scratch-heart card.',
    badge: 'Lakefront Aura',
    previewImg: '/templates/royaldawn-template/public/assets/gate.jpg',
  },
  {
    id: 'jharokha',
    name: 'Jharokha',
    subtitle: 'शाही झरोखा व संगमरमर',
    tagline: 'Rajasthani marble filigree arches, 24K gold foil inlays, and balcony view.',
    badge: 'Palace Filigree',
    previewImg: '/previews/theme-jharokha.webp',
  },
  {
    id: 'mayura',
    name: 'Mayura',
    subtitle: 'मयूर पंख व पन्ना वैभव',
    tagline: 'Deep emerald teal tones with dancing peacock feather animations.',
    badge: 'Emerald Grandeur',
    previewImg: '/previews/theme-mayura.webp',
  },
  {
    id: 'jodi',
    name: 'Jodi',
    subtitle: 'शुभ विवाह व स्वर्ण थाली',
    tagline: 'Sacred 24K brass gold thaali with marigolds and illustrated couple art.',
    badge: 'Sacred Tradition',
    previewImg: '/previews/theme-jodi.webp',
  },
  {
    id: 'dak',
    name: 'Shahi Dâk',
    subtitle: 'शाही डाक व मोहर पत्र',
    tagline: 'Vintage royal telegram postal envelope with crimson wax stamp seal.',
    badge: 'Vintage Letterpress',
    previewImg: '/previews/theme-dak.webp',
  },
  {
    id: 'ivory',
    name: 'Ivory',
    subtitle: 'मॉडर्न मिनिमलिस्ट व वोग',
    tagline: 'High-fashion editorial magazine look with clean typography & warm alabaster.',
    badge: 'Haute Couture',
    previewImg: '/previews/theme-ivory.webp',
  },
];

export const RoyalLiveDemo: React.FC<RoyalLiveDemoProps> = ({
  onEnterStudio,
  onPreviewTheme,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const current = DEMO_THEMES[activeIndex];

  // Auto-switch preview every 6 seconds if not paused by user interaction
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_THEMES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleSelectTheme = (idx: number) => {
    setActiveIndex(idx);
    setIsAutoPlaying(false);
  };

  return (
    <section id="demo" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
          <Smartphone className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>INTERACTIVE MOBILE EXPERIENCE</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          EXPERIENCE THE ROYAL INVITATION
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Preview how your guests will experience your invitation on mobile.
        </p>

        {/* 7 Theme Switcher Buttons */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {DEMO_THEMES.map((theme, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-md border border-[#C49A35]'
                    : 'bg-[#F8F3E8] text-[#241A17] border border-[#E8D5AD] hover:bg-[#FFFDF8]'
                }`}
              >
                {theme.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage: Smartphone Simulator + Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Theme Details and Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_10px_30px_-5px_rgba(67,9,20,0.06)] space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-4">
              <span className="text-xs font-manrope font-bold uppercase tracking-widest text-[#C49A35] bg-[#F8F3E8] px-3 py-1 rounded-full border border-[#E8D5AD]">
                {current.badge}
              </span>
              <span className="text-xs text-[#75675C] font-serif italic">
                {current.subtitle}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-cormorant font-bold text-3xl sm:text-4xl text-[#6E1020]">
                {current.name}
              </h3>
              <p className="text-sm text-[#241A17]/80 font-normal leading-relaxed">
                {current.tagline}
              </p>
            </div>

            {/* 3 Genuine Highlights */}
            <div className="space-y-3 pt-2 text-xs text-[#241A17]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                <span>Lossless Shehnai & Auspicious Welcome Music</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                <span>1-Tap Google Maps GPS Route for Wedding Venues</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
                <span>Integrated Live Guest RSVP & Family Wishes Wall</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onEnterStudio(current.id)}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <span>CUSTOMIZE {current.name.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>

              <button
                type="button"
                onClick={() => onPreviewTheme(current.id)}
                className="py-3.5 px-5 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#6E1020] font-manrope font-semibold text-xs sm:text-sm border border-[#E8D5AD] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#C49A35]" />
                <span>Interactive Preview</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Ultra-Refined Smartphone Mockup */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-[#1A0B0E] rounded-[48px] p-3.5 shadow-[0_25px_60px_-15px_rgba(43,9,20,0.3)] border-4 border-[#C49A35]">
            
            {/* Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3D6B4A]/80 animate-pulse" />
            </div>

            {/* Smartphone Inner Screen */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-black relative flex flex-col justify-between">
              
              {/* Active Theme Preview Image */}
              <img
                src={current.previewImg}
                alt={current.name}
                className="w-full h-full object-cover object-center animate-fade-in"
              />

              {/* Top Overlay Bar */}
              <div className="absolute top-7 inset-x-4 flex items-center justify-between text-[#FFFDF8] z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                  {current.name}
                </span>
                <span className="text-[10px] font-mono text-[#C49A35] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-[#C49A35]" />
                  <span>Audio On</span>
                </span>
              </div>

              {/* Bottom Interactive Bar inside Phone */}
              <div className="absolute bottom-4 inset-x-4 bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-[#C49A35]/40 text-[#FFFDF8] space-y-2 z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-cormorant font-bold text-base text-[#C49A35]">
                    Dhruv & Shreya
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Live Preview
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewTheme(current.id)}
                    className="flex-1 py-1.5 rounded-lg bg-[#6E1020] text-[#FFFDF8] text-[11px] font-manrope font-semibold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-[#C49A35]" />
                    <span>Open Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterStudio(current.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F8F3E8] text-[#6E1020] text-[11px] font-manrope font-semibold cursor-pointer"
                  >
                    Customize
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default RoyalLiveDemo;
