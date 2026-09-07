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
    id: 'rajmahal',
    name: 'THE RAJMAHAL',
    tagline: 'An evening beneath carved sandstone arches.',
    taglineShort: 'Royal · Grand · Majestic',
    tags: 'Palace Heritage · 3D Scroll Gates',
    price: 2299,
    icon: '🏰',
    badge: 'Heritage Masterpiece',
    bgGradient: 'from-[#4A0E17] to-[#1C060A]',
    accentColor: '#C49A35',
    description: '3D palace gates open smoothly on scroll with elephant procession and darbar elegance.',
    url: '/templates/rajmahal-template/index.html',
    previewImg: '/previews/theme-rajmahal.webp',
  },
  {
    id: 'royaldawn',
    name: 'THE ROYAL DAWN',
    tagline: 'Soft morning light over a palace courtyard.',
    taglineShort: 'Heritage · Elegant · Timeless',
    tags: 'Udaipur Lakefront · Interactive Gold Scratch',
    price: 2299,
    icon: '🌅',
    badge: 'Udaipur Lakefront',
    bgGradient: 'from-[#4A121E] via-[#2A050D] to-[#0D0406]',
    accentColor: '#C49A35',
    description: 'Udaipur lakefront palace grandeur with interactive gold scratch-heart blessing and 4-box timer.',
    url: '/templates/royaldawn-template/index.html',
    previewImg: '/previews/theme-royaldawn.webp',
  },
  {
    id: 'jharokha',
    name: 'THE JHAROKHA',
    tagline: 'Traditional jharokha lattice & gold filigree.',
    taglineShort: 'Ornate · Cultural · Regal',
    tags: 'Rajasthani Marble Arch · Gold Filigree',
    price: 1299,
    icon: '🪟',
    badge: 'Rajasthani Arch',
    bgGradient: 'from-[#1B3B2B] to-[#0A1A12]',
    accentColor: '#C49A35',
    description: 'Intricate Rajasthani marble arches, gold filigree motifs, and animated peacock feather accents.',
    url: '/templates/jharokha-template/index.html',
    previewImg: '/previews/theme-jharokha.webp',
  },
  {
    id: 'mayura',
    name: 'THE MAYURA',
    tagline: 'Deep emerald teal tones and dancing peacock grace.',
    taglineShort: 'Traditional · Warm · Cultural',
    tags: 'Emerald Teal · Sacred Peacock Motifs',
    price: 1299,
    icon: '🦚',
    badge: 'Mayura Peacock',
    bgGradient: 'from-[#0F2B48] to-[#051329]',
    accentColor: '#C49A35',
    description: 'Deep emerald teal tones with majestic dancing peacock feather animations and gold calligraphy.',
    url: '/templates/mayura-template/index.html',
    previewImg: '/previews/theme-mayura.webp',
  },
];

export const MODERN_CLASSICS: Array<WeddingTheme & { previewImg: string; taglineShort: string; tags: string }> = [
  {
    id: 'jodi',
    name: 'THE JODI',
    tagline: 'Sacred brass gold thaali and auspicious marigolds.',
    taglineShort: 'Auspicious · Festive · Joyful',
    tags: 'Gold Thaali · Illustrated Caricature',
    price: 1299,
    icon: '💑',
    badge: 'Festive Thaali',
    bgGradient: 'from-[#3D1E3A] to-[#180A17]',
    accentColor: '#C49A35',
    description: 'Sacred 24K brass gold thaali with marigolds and illustrated couple caricature.',
    url: '/templates/jodi-template/index.html',
    previewImg: '/previews/theme-jodi.webp',
  },
  {
    id: 'dak',
    name: 'THE SHAHI DĀK',
    tagline: 'Vintage royal telegram with handcrafted stamp seal.',
    taglineShort: 'Vintage · Postal · Poetic',
    tags: 'Royal Telegram · Wax Seal Stamp',
    price: 1299,
    icon: '💌',
    badge: 'Vintage Telegram',
    bgGradient: 'from-[#3A2A1A] to-[#1A120B]',
    accentColor: '#C49A35',
    description: 'Vintage royal telegram postal envelope with handcrafted gold embossing and aged letterpress.',
    url: '/templates/dak-template/index.html',
    previewImg: '/previews/theme-dak.webp',
  },
  {
    id: 'ivory',
    name: 'THE IVORY',
    tagline: 'High-fashion editorial aesthetic & warm alabaster.',
    taglineShort: 'Peaceful · Divine · Serene',
    tags: 'Editorial Serif · Modern Alabaster',
    price: 1299,
    icon: '🤍',
    badge: 'Ivory Modern',
    bgGradient: 'from-[#1A1A1A] to-[#0D0D0D]',
    accentColor: '#C49A35',
    description: 'High-fashion editorial magazine aesthetic with crisp serif typography and warm alabaster.',
    url: '/templates/ivory-template/index.html',
    previewImg: '/previews/theme-ivory.webp',
  },
];

export const themes = [...ROYAL_THEMES, ...MODERN_CLASSICS];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  onSaveAndNext,
  onPreviewTheme,
}) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'royal' | 'modern'>('royal');

  const displayedThemes = activeCategory === 'royal' ? ROYAL_THEMES : MODERN_CLASSICS;

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
          Select from 7 authentic palace themes. Your changes reflect instantly in the preview.
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
                    <span className="text-xs font-mono font-bold text-[#C49A35]">
                      ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')}
                    </span>
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


