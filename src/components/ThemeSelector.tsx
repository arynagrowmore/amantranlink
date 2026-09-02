import React from 'react';
import { Check, ArrowRight, Lock, Unlock, Sparkles, Eye } from 'lucide-react';
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

export const themes: Array<WeddingTheme & { previewImg: string }> = [
  {
    id: 'rajmahal',
    name: 'The Rajmahal',
    tagline: 'Royal Heritage & 3D Palace Gateways',
    price: 2299,
    icon: '🏰',
    badge: 'The Rajmahal',
    bgGradient: 'from-[#4A0E17] to-[#1C060A]',
    accentColor: '#C49A35',
    description: '3D palace gates open smoothly on scroll with elephant procession and darbar elegance.',
    url: '/templates/rajmahal-template/index.html',
    previewImg: '/previews/theme-rajmahal.webp',
  },
  {
    id: 'royaldawn',
    name: 'The Royal Dawn',
    tagline: 'Udaipur Palace Lakefront & Scratch Heart Blessing',
    price: 2299,
    icon: '🌅',
    badge: 'The Royal Dawn',
    bgGradient: 'from-[#4A121E] via-[#2A050D] to-[#0D0406]',
    accentColor: '#C49A35',
    description: 'Udaipur lakefront palace grandeur with interactive gold scratch-heart blessing and 4-box timer.',
    url: '/templates/royaldawn-template/index.html',
    previewImg: '/previews/theme-royaldawn.webp',
  },
  {
    id: 'jharokha',
    name: 'The Jharokha',
    tagline: 'Traditional Palace Arch & Gold Filigree',
    price: 1299,
    icon: '🪟',
    badge: 'The Jharokha',
    bgGradient: 'from-[#1B3B2B] to-[#0A1A12]',
    accentColor: '#C49A35',
    description: 'Intricate Rajasthani marble arches, gold filigree motifs, and animated peacock feather accents.',
    url: '/templates/jharokha-template/index.html',
    previewImg: '/previews/theme-jharokha.webp',
  },
  {
    id: 'mayura',
    name: 'The Mayura',
    tagline: 'Peacock Grandeur & Royal Emerald Teal',
    price: 1299,
    icon: '🦚',
    badge: 'The Mayura',
    bgGradient: 'from-[#0F2B48] to-[#051329]',
    accentColor: '#C49A35',
    description: 'Deep emerald teal tones with majestic dancing peacock feather animations and gold calligraphy.',
    url: '/templates/mayura-template/index.html',
    previewImg: '/previews/theme-mayura.webp',
  },
  {
    id: 'jodi',
    name: 'The Jodi',
    tagline: 'Festive Gold Thaali & Illustrated Couple Caricature',
    price: 1299,
    icon: '💑',
    badge: 'The Jodi',
    bgGradient: 'from-[#3D1E3A] to-[#180A17]',
    accentColor: '#C49A35',
    description: 'Sacred 24K brass gold thaali with marigolds and illustrated couple caricature.',
    url: '/templates/jodi-template/index.html',
    previewImg: '/previews/theme-jodi.webp',
  },
  {
    id: 'dak',
    name: 'The Shahi Dâk',
    tagline: 'Vintage Royal Telegram & Postal Stamp',
    price: 1299,
    icon: '💌',
    badge: 'The Shahi Dâk',
    bgGradient: 'from-[#3A2A1A] to-[#1A120B]',
    accentColor: '#C49A35',
    description: 'Vintage royal telegram postal envelope with handcrafted gold embossing and aged letterpress.',
    url: '/templates/dak-template/index.html',
    previewImg: '/previews/theme-dak.webp',
  },
  {
    id: 'ivory',
    name: 'The Ivory',
    tagline: 'Minimalist High-Fashion & Editorial Gold',
    price: 1299,
    icon: '🤍',
    badge: 'The Ivory',
    bgGradient: 'from-[#1A1A1A] to-[#0D0D0D]',
    accentColor: '#C49A35',
    description: 'High-fashion editorial magazine aesthetic with crisp serif typography and warm alabaster.',
    url: '/templates/ivory-template/index.html',
    previewImg: '/previews/theme-ivory.webp',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  onSaveAndNext,
  onPreviewTheme,
}) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>STEP 01 · CHOOSE ROYAL THEME</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          Select Your Architectural Invitation Masterpiece
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          Choose from 7 authentic palace architectural masterworks. Live preview updates immediately.
        </p>
      </div>

      {/* Grid of 7 Royal Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const isUnlocked = isTemplateUnlockedForUser(user?.uid, theme.id);
          const isPartner = user?.role === 'partner';
          const priceInfo = calculatePaymentDetails(null, theme.id, user?.role);

          return (
            <div
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all relative border flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-[#FFFDF8] border-[#C49A35] ring-2 ring-[#C49A35]/50 shadow-md scale-[1.01]'
                  : 'bg-[#F8F3E8] border-[#E8D5AD] hover:border-[#C49A35]/70 hover:bg-[#FFFDF8] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* 16:10 Standardized Thumbnail Image Header */}
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#160408] border border-[#E8D5AD]">
                  <img
                    src={theme.previewImg}
                    alt={theme.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badge & Lock Indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span className="text-[9px] font-mono font-bold bg-[#6E1020]/90 backdrop-blur-md text-[#FFFDF8] px-2 py-0.5 rounded border border-[#C49A35]/40 shadow-xs">
                      {theme.badge}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 z-10">
                    {isUnlocked ? (
                      <span className="text-[9px] font-mono font-bold bg-[#167A5A] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Unlock className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold bg-black/70 backdrop-blur-md text-[#E8D5AD] border border-[#C49A35]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-[#C49A35]" /> Preview
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h4 className="font-cormorant font-bold text-lg text-[#430914] flex items-center justify-between">
                    <span>{theme.name}</span>
                    <div className="text-right">
                      {isPartner ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-mono font-bold text-[#167A5A]">
                            ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-mono text-[#75675C] line-through">
                            ₹{priceInfo.retailPriceInr.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-mono font-bold text-[#C49A35]">
                          ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </h4>
                  <p className="text-[11px] text-[#75675C] line-clamp-2 leading-relaxed min-h-[32px]">
                    {theme.tagline}
                  </p>
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="mt-3 pt-2.5 border-t border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                {isSelected ? (
                  <span className="text-[10px] font-mono font-bold text-[#167A5A] bg-[#167A5A]/10 px-2.5 py-0.5 rounded-full border border-[#167A5A]/30 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Selected
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold text-[#6E1020] group-hover:text-[#C49A35]">
                    Select Theme ➜
                  </span>
                )}

                {onPreviewTheme && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewTheme(theme.id);
                    }}
                    className="text-[10px] font-mono text-[#75675C] hover:text-[#430914] flex items-center gap-0.5"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Live Modal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save & Next CTA */}
      <div className="pt-4 border-t border-[#E8D5AD]/60 flex justify-end">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-semibold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <span>Save &amp; Continue to Couple Details</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
