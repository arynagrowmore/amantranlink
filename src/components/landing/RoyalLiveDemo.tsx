import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Eye, Volume2, VolumeX, ArrowRight, 
  ChevronLeft, ChevronRight, Play, CheckCircle2 
} from 'lucide-react';
import { ThemeId } from '../../types/wedding';
import { RoyalCrestIcon, DiyaIcon } from '../ShahiIcons';
import { IPhoneHardwareFrame } from '../IPhoneHardwareFrame';

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
    name: 'The Rajmahal',
    subtitle: 'शाही राजमहल व 3D द्वार',
    tagline: '3D Palace gateway opens on scroll with lossless shehnai melody.',
    badge: 'The Rajmahal',
    previewImg: '/previews/theme-rajmahal.webp',
  },
  {
    id: 'royaldawn',
    name: 'The Royal Dawn',
    subtitle: 'उदयपुर पैलेस व स्वर्ण भोर',
    tagline: 'Udaipur lakefront palace with interactive gold scratch-heart card.',
    badge: 'The Royal Dawn',
    previewImg: '/templates/royaldawn-template/public/assets/gate.jpg',
  },
  {
    id: 'jharokha',
    name: 'The Jharokha',
    subtitle: 'शाही झरोखा व संगमरमर',
    tagline: 'Rajasthani marble filigree arches, 24K gold foil inlays, and balcony view.',
    badge: 'The Jharokha',
    previewImg: '/previews/theme-jharokha.webp',
  },
  {
    id: 'mayura',
    name: 'The Mayura',
    subtitle: 'मयूर पंख व पन्ना वैभव',
    tagline: 'Deep emerald teal tones with dancing peacock feather animations.',
    badge: 'The Mayura',
    previewImg: '/previews/theme-mayura.webp',
  },
  {
    id: 'jodi',
    name: 'The Jodi',
    subtitle: 'शुभ विवाह व स्वर्ण थाली',
    tagline: 'Sacred 24K brass gold thaali with marigolds and illustrated couple art.',
    badge: 'The Jodi',
    previewImg: '/previews/theme-jodi.webp',
  },
  {
    id: 'dak',
    name: 'The Shahi Dâk',
    subtitle: 'शाही डाक व राजसी पत्र',
    tagline: 'Vintage royal telegram postal envelope with handcrafted gold embossing.',
    badge: 'The Shahi Dâk',
    previewImg: '/previews/theme-dak.webp',
  },
  {
    id: 'ivory',
    name: 'The Ivory',
    subtitle: 'मॉडर्न मिनिमलिस्ट व वोग',
    tagline: 'High-fashion editorial magazine look with clean typography & warm alabaster.',
    badge: 'The Ivory',
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
    <section id="demo" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-sans font-semibold tracking-wider uppercase shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>Interactive Mobile Experience</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          Experience the Royal Invitation
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Preview how your wedding guests will interact with each royal motif on an authentic mobile display.
        </p>

        {/* 7 Theme Switcher Buttons */}
        <div className="flex flex-wrap justify-center gap-2 pt-3">
          {DEMO_THEMES.map((theme, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-sm border border-[#C49A35]'
                    : 'bg-white text-[#241A17] border border-[#E8DCC8] hover:bg-[#FAF6EE] hover:border-[#C49A35]/50'
                }`}
              >
                {theme.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage: Authentic iPhone 16 Pro Frame + Feature Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Side: Theme Details and Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DCC8] shadow-[0_4px_24px_-4px_rgba(67,9,20,0.06)] space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-4">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#8E6725] bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#E8DCC8]">
                {current.badge}
              </span>
              <span className="text-xs text-[#75675C] font-serif italic">
                {current.subtitle}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#6E1020]">
                {current.name}
              </h3>
              <p className="text-sm text-[#4A3E39] font-normal leading-relaxed">
                {current.tagline}
              </p>
            </div>

            {/* 3 Genuine Highlights */}
            <div className="space-y-3 pt-2 text-xs text-[#241A17]/85 font-medium">
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
                className="flex-1 py-3.5 px-5 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-md border border-[#C49A35] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Customise {current.name}</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>

              <button
                type="button"
                onClick={() => onPreviewTheme(current.id)}
                className="py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF6EE] text-[#6E1020] font-sans font-semibold text-xs sm:text-sm border border-[#E8DCC8] flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:border-[#C49A35]"
              >
                <Eye className="w-4 h-4 text-[#C49A35]" />
                <span>Interactive Preview</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Authentic Apple iPhone 16 Pro Hardware Chassis */}
        <div className="lg:col-span-6 flex justify-center py-2">
          <div className="scale-[0.80] sm:scale-[0.88] lg:scale-[0.92] origin-top sm:origin-center drop-shadow-[0_25px_50px_rgba(43,9,20,0.18)]">
            <IPhoneHardwareFrame>
              <div className="w-full h-full relative overflow-hidden bg-black flex flex-col justify-between">
                
                {/* Active Theme Preview Image */}
                <img
                  src={current.previewImg}
                  alt={current.name}
                  className="w-full h-full object-cover object-center transition-all duration-500"
                />

                {/* Top Overlay Badge Inside iPhone Display */}
                <div className="absolute top-14 inset-x-4 flex items-center justify-between text-[#FFFDF8] z-10">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
                    {current.name}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-[#FAF6EE] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                    <Volume2 className="w-3 h-3 text-[#C49A35]" />
                    <span>Shehnai On</span>
                  </span>
                </div>

                {/* Bottom Interactive Floating Control Card Inside iPhone */}
                <div className="absolute bottom-6 inset-x-4 bg-[#140D0B]/85 backdrop-blur-md p-3.5 rounded-2xl border border-[#C49A35]/40 text-[#FFFDF8] space-y-2 z-10 shadow-2xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-base text-[#FAF6EE]">
                      Dhruv &amp; Shreya
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Live Preview
                    </span>
                  </div>

                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onPreviewTheme(current.id)}
                      className="flex-1 py-2 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-[11px] font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-[#C49A35]/50 transition-all hover:scale-[1.02]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C49A35]" />
                      <span>Open 3D Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEnterStudio(current.id)}
                      className="py-2 px-3.5 rounded-xl bg-[#FAF6EE] hover:bg-[#FFFFFF] text-[#6E1020] text-[11px] font-sans font-semibold cursor-pointer border border-[#E8DCC8] transition-all hover:scale-[1.02]"
                    >
                      Customise
                    </button>
                  </div>
                </div>

              </div>
            </IPhoneHardwareFrame>
          </div>
        </div>

      </div>
    </section>
  );
};

export default RoyalLiveDemo;
