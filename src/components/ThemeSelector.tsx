import React, { useState } from 'react';
import { Check, ArrowRight, Lock, Unlock, Sparkles, Eye, Crown, Layers, Heart } from 'lucide-react';
import { ThemeId, WeddingTheme } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { isTemplateUnlockedForUser } from '../services/razorpayClient';
import { calculatePaymentDetails } from '../config/pricing';

interface ThemeSelectorProps {
  selectedTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
  onSaveAndNext: () => void;
  onPreviewTheme?: (themeId: ThemeId) => void;
}

export const ROYAL_THEMES: Array<WeddingTheme & { previewImg: string; taglineShort: string; tags: string }> = [
  {
    id: 'royal-gateway',
    name: 'THE ROYAL GATEWAY',
    tagline: 'Jewel-toned Rajasthani peacock palace gate opening with shehnai, velvet scrolls & scratch card.',
    taglineShort: 'Peacock Gate · Velvet Scroll · Scratch',
    tags: 'Carved Peacock Doors · Grand Palace Hero · Velvet Ceremonies',
    price: 699,
    icon: '🦚',
    badge: 'Peacock Palace Gate',
    bgGradient: 'from-[#080E2C] via-[#9E141E] to-[#FFE4B3]',
    accentColor: '#DEA645',
    description: 'Step into an imperial palace celebration with majestic carved peacock doors swinging open with shehnai music, grand sunset palace, velvet unrolling ceremony scrolls, and interactive scratch card.',
    url: '/templates/royal-gateway/index.html',
    previewImg: '/templates/royal-gateway/assets/gate/peacock.webp',
  },
  {
    id: 'shubh-vivah',
    name: 'SHUBH VIVAH',
    tagline: 'Full-screen sealed wax envelope with floating petals & interactive gold scratch card.',
    taglineShort: 'Interactive · Wax Seal · Scratch',
    tags: 'Wax Seal Envelope · Gold Scratch Foil · Drifting Petals',
    price: 499,
    icon: '💌',
    badge: 'Wax Seal Envelope',
    bgGradient: 'from-[#4A0E17] via-[#2D080E] to-[#FAF6EE]',
    accentColor: '#E07A16',
    description: 'A full-screen royal envelope sealed with animated wax emblem that opens with shehnai music, featuring drifting marigolds and an interactive rub-and-reveal scratch card.',
    url: '/templates/shubh-vivah/index.html',
    previewImg: '/templates/shubh-vivah/assets/couple.png',
  },
  {
    id: 'rose-farman',
    name: 'THE ROSE FARMAN',
    tagline: 'Royal wax envelope opening, falling rose petal rain physics & 7 illustrated ceremony chapters.',
    taglineShort: 'Blush · Petal Rain · 3D Flap',
    tags: 'Rose Petal Rain · 3D Flap · Illustrated Timeline',
    price: 699,
    icon: '🌹',
    badge: 'Rose Petal Rain',
    bgGradient: 'from-[#9F1239] via-[#881337] to-[#FFF5F7]',
    accentColor: '#F43F5E',
    description: 'Blush-toned luxury invitation with a 3D letter sliding out of a sealed envelope, continuous rose petal rain physics, interactive gold scratch card, and 7 ceremony illustrations.',
    url: '/templates/rose-farman/index.html',
    previewImg: '/templates/rose-farman/assets/hero-couple.png',
  },
];

export const MODERN_CLASSICS: Array<WeddingTheme & { previewImg: string; taglineShort: string; tags: string }> = [];

export const themes = ROYAL_THEMES;

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  onSaveAndNext,
  onPreviewTheme,
}) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'royal' | 'modern'>('royal');

  const displayedThemes = ROYAL_THEMES;

  return (
    <div className="flex flex-col h-full space-y-5 font-manrope">
      {/* 👑 Top Step Header & Progress */}
      <div className="space-y-1.5 border-b border-[#E8D5AD]/60 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest text-[#C49A35] font-semibold uppercase">
            Step 1 of 8
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35]" />
            <span className="text-[11px] font-mono text-[#8C7A73]">12% Complete</span>
          </div>
        </div>

        <h3 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#350811] leading-tight">
          Choose Your Architectural Theme
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          Select from our 4 flagship imperial themes. Your changes reflect instantly in the preview.
        </p>
      </div>

      {/* 🏛️ 2-Category Tab Selector: 👑 Royal Themes vs ◇ Modern Classics */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('royal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeCategory === 'royal'
              ? 'bg-[#6E1020] border-[#C49A35] text-[#FFFDF8] shadow-2xs font-bold'
              : 'bg-[#FFFDF8] border-[#E8D5AD] text-[#75675C] hover:text-[#350811] hover:bg-[#F8F3E8]'
          }`}
        >
          <Crown className={`w-3.5 h-3.5 ${activeCategory === 'royal' ? 'text-[#F4D06F]' : 'text-[#C49A35]'}`} />
          <span>Royal Themes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('modern')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeCategory === 'modern'
              ? 'bg-[#6E1020] border-[#C49A35] text-[#FFFDF8] shadow-2xs font-bold'
              : 'bg-[#FFFDF8] border-[#E8D5AD] text-[#75675C] hover:text-[#350811] hover:bg-[#F8F3E8]'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${activeCategory === 'modern' ? 'text-[#F4D06F]' : 'text-[#8C7A73]'}`} />
          <span>Modern Classics</span>
        </button>
      </div>

      {/* 🖼️ Grid of 4 Architectural Specimen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
        {displayedThemes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const isUnlocked = isTemplateUnlockedForUser(user?.uid, theme.id);
          const isPartner = user?.role === 'partner';
          const priceInfo = calculatePaymentDetails(null, theme.id, user?.role);

          return (
            <div
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all relative border flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-[#FFFDF8] border-[#C49A35] ring-2 ring-[#C49A35]/60 shadow-md'
                  : 'bg-[#FFFDF8] border-[#E8D5AD]/70 hover:border-[#C49A35]/60 hover:bg-[#FAF6EE] shadow-2xs'
              }`}
            >
              <div className="space-y-2.5">
                {/* 16:10 Architectural Preview Frame */}
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#160408] border border-[#E8D5AD]/60">
                  <img
                    src={theme.previewImg}
                    alt={theme.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
                  />

                  {/* Top Left Pill */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] font-mono bg-[#1C050B]/85 text-[#E8D5AD] px-2 py-0.5 rounded border border-[#C49A35]/30">
                      {theme.badge}
                    </span>
                  </div>

                  {/* Top Right Unlock / Preview Pill */}
                  <div className="absolute top-2 right-2 z-10">
                    {isUnlocked ? (
                      <span className="text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono bg-[#1C050B]/80 text-[#E8D5AD] border border-[#C49A35]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-[#C49A35]" /> Preview
                      </span>
                    )}
                  </div>
                </div>

                {/* Theme Title & Line */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-cormorant font-bold text-lg text-[#350811] tracking-wide">
                      {theme.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] line-through text-[#8C7A73]">
                        ₹{(theme.price * 2.5).toFixed(0)}
                      </span>
                      <span className="text-xs font-mono font-black text-[#C49A35]">
                        ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#C49A35] font-serif italic mt-0.5">
                    {theme.taglineShort}
                  </p>
                  <p className="text-[10px] text-[#75675C] mt-0.5">
                    {theme.tags}
                  </p>
                </div>
              </div>

              {/* Minimal Bottom Bar */}
              <div className="mt-2.5 pt-2 border-t border-[#E8D5AD]/40 flex items-center justify-between text-xs">
                {isSelected ? (
                  <span className="text-[10px] font-mono font-bold text-[#167A5A] flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Active Palace Selection
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#75675C] group-hover:text-[#350811] transition-colors">
                    Select Specimen ➜
                  </span>
                )}

                {onPreviewTheme && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewTheme(theme.id);
                    }}
                    className="text-[10px] text-[#8C7A73] hover:text-[#350811] flex items-center gap-0.5 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Enlarge</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* 🌸 Human Editorial Breathing Card (Shown on Modern Classics Tab) */}
        {activeCategory === 'modern' && (
          <div className="p-4 rounded-2xl border border-dashed border-[#C49A35]/40 bg-[#FAF6EE]/60 flex flex-col items-center justify-center text-center space-y-2 select-none min-h-[180px]">
            <span className="text-2xl text-[#C49A35]">⚜️</span>
            <p className="font-cormorant font-bold text-base text-[#430914] leading-snug">
              “Each theme is crafted with love for your special day.”
            </p>
            <span className="text-[10px] font-mono text-[#8C7A73] uppercase tracking-widest">
              AmantranLink Atelier
            </span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Next Action */}
      <div className="pt-3 border-t border-[#E8D5AD]/60 flex justify-end">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#520B17] text-[#FFFDF8] font-semibold text-xs tracking-wide shadow-2xs border border-[#C49A35]/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue to Couple Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;


