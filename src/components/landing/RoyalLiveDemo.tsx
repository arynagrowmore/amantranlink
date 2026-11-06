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

const DEMO_THEMES: Array<any> = [
  {
    id: 'royal-gateway',
    name: 'The Royal Gateway',
    badge: '🦚 Peacock Palace Gate',
    subtitle: 'Carved Peacock Doors · Rajasthani Grandeur',
    previewUrl: '/templates/royal-gateway/index.html?preview=mobile&noaudio=true&mute=1',
    previewImg: '/templates/royal-gateway/assets/gate/peacock.webp',
    description: 'Jewel-toned carved peacock palace doors swing open with shehnai music, grand sunset palace, velvet unrolling scrolls, and interactive scratch card.',
    features: ['3D Carved Peacock Doors', 'Sunset Palace & Spinning Rosette', 'Velvet Unrolling Ceremony Scrolls', 'Gold Scratch-Off Date Card', 'Live Countdown & RSVP'],
    accentColor: '#9E141E',
  },
  {
    id: 'shubh-vivah',
    name: 'Shubh Vivah',
    badge: '👑 Flagship Heritage',
    subtitle: 'Wax Seal & Gold Scratch · Shubh Vivah',
    previewUrl: '/templates/shubh-vivah/index.html?preview=mobile&noaudio=true&mute=1',
    previewImg: '/templates/shubh-vivah/assets/couple.png',
    description: 'Full-screen sealed wax envelope with floating petals, interactive gold scratch card revealing wedding date and 5 sacred ceremonies.',
    features: ['Full-Screen Wax Seal Cover', 'Gold Scratch-Off Date Card', 'Rotating Mandala Watermark', 'Drifting Petals Animation', '5-Ceremony Timeline'],
    accentColor: '#4A0E17',
  },
  {
    id: 'rose-farman',
    name: 'The Rose Farman',
    badge: '🌹 Haute Couture',
    subtitle: 'Petal Rain & Scratch Card · Blush Luxury',
    previewUrl: '/templates/rose-farman/index.html?preview=mobile&noaudio=true&mute=1',
    previewImg: '/templates/rose-farman/assets/hero-couple.png',
    description: 'Royal wax envelope opening, falling rose petal rain physics, interactive gold scratch card and 7 ceremony illustrations.',
    features: ['3D Animated Envelope Flap', 'Falling Rose Petal Rain', 'Gold Heart Scratch Card', '7 Illustrated Ceremony Cards', 'Shehnai Audio Player'],
    accentColor: '#9F1239',
  },
];

export const RoyalLiveDemo: React.FC<RoyalLiveDemoProps> = ({
  onEnterStudio,
  onPreviewTheme,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  if (DEMO_THEMES.length === 0) return null;
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

        <p className="text-base sm:text-lg text-[#6E1020] font-bold max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
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
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-md border-2 border-[#C49A35]'
                    : 'bg-white text-[#1A1412] border border-[#E8D5AD] hover:bg-[#FAF6EE] hover:border-[#C49A35]'
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
          <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#E8D5AD] shadow-[0_10px_32px_-4px_rgba(67,9,20,0.08)] space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-4">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#8E6725] bg-[#FAF6EE] px-3.5 py-1 rounded-full border border-[#E8D5AD] shadow-2xs">
                {current.badge}
              </span>
              <span className="text-xs sm:text-sm text-[#6E1020] font-serif font-bold italic">
                {current.subtitle}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#6E1020]">
                {current.name}
              </h3>
              <p className="text-sm sm:text-base text-[#430914] font-semibold leading-relaxed">
                {current.tagline}
              </p>
            </div>

            {/* 3 Genuine Highlights */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#6E1020] font-bold">
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
              <div className="w-full h-full relative overflow-hidden bg-[#1A0508]">
                {/* Live Interactive Template Frame */}
                <iframe
                  key={current.id}
                  src={current.previewUrl}
                  title={`Live Demo of ${current.name}`}
                  className="w-full h-full border-0 block"
                  allow="autoplay; clipboard-write"
                />

                {/* Top Subtle Overlay Badge */}
                <div className="absolute top-12 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-[#F4D06F] px-2.5 py-1 rounded-full border border-[#C49A35]/30 shadow-md">
                    {current.name}
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-emerald-300 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live 3D</span>
                  </span>
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
