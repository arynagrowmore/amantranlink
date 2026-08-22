import React from 'react';
import { 
  ArrowLeft, Check, Sparkles, ShieldCheck, Crown, 
  ArrowRight, Shield, Award, Heart, MessageCircle
} from 'lucide-react';
import { ThemeId, PackageType } from '../types/wedding';
import { RoyalCrestIcon, DiyaIcon } from './ShahiIcons';

interface PackagesPageProps {
  onBackToHome: () => void;
  onEnterStudio: (preferredTheme?: ThemeId) => void;
  onSelectPackage?: (pkg: PackageType, preferredTheme?: ThemeId) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onBackToHome,
  onEnterStudio,
  onSelectPackage,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F0DD] text-[#2B1810] flex flex-col font-hanken">
      {/* 👑 Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#EDE0C8]/90 backdrop-blur-md border-b border-[#D8C7AA] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#A67C3D]/60 text-[#6B1420] font-fraunces font-bold text-xs hover:bg-[#F7F0DD] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7E1827] to-[#4A0C14] border border-[#A67C3D] flex items-center justify-center text-[#D4B37F] shadow-sm">
            <RoyalCrestIcon className="w-5 h-5 text-[#D4B37F]" />
          </div>
          <span className="font-fraunces font-black text-sm tracking-widest text-[#6B1420] uppercase">
            Shahi Studio
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEnterStudio('rajmahal')}
          className="px-4 py-1.5 rounded-xl btn-vermillion font-fraunces font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-105 transition-transform cursor-pointer"
        >
          Enter Studio
        </button>
      </header>

      {/* 🌟 Main Packages Content */}
      <main className="flex-1 py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Header Ribbon */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 stamped-label text-[#2C3E5C] bg-[#EDE0C8] border border-[#D8C7AA] px-3 py-1 rounded-full shadow-xs">
            <RoyalCrestIcon className="w-4 h-4 text-[#A67C3D]" />
            <span>ROYAL PACKAGES</span>
          </div>

          <h1 className="font-fraunces font-black text-3xl sm:text-5xl text-[#6B1420] tracking-tight">
            ROYAL PACKAGES
          </h1>

          <p className="font-hanken text-base sm:text-lg text-[#2B1810] font-bold leading-relaxed max-w-2xl mx-auto">
            Choose the invitation experience made for your celebration.
          </p>
        </div>

        {/* 💎 3 Heavy Royal Package Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          
          {/* Tier 1: Silver */}
          <div className="shahi-card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-[#EDE0C8] border-2 border-[#A67C3D]/60 rounded-3xl shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-4">
              <span className="stamped-label text-[#2C3E5C]">SHAHI SILVER</span>
              
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-fraunces font-black text-[#6B1420]">₹1,299</span>
                <span className="text-xs text-[#2B1810] font-bold">/ wedding</span>
              </div>

              <p className="text-xs text-[#2B1810] font-bold leading-relaxed">
                Ideal for intimate celebrations and single-event ceremonies.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#D8C7AA]">
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Any 1 Royal Theme</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Background Music Player</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Live Google Maps Integration</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>1-Click WhatsApp Dispatch</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Guest RSVP Collection</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackage ? onSelectPackage('silver', 'jharokha') : onEnterStudio('jharokha')}
              className="w-full py-3.5 rounded-xl border-2 border-[#A67C3D] text-[#6B1420] font-fraunces font-black text-xs uppercase tracking-wider hover:bg-[#F7F0DD] transition-all min-h-[44px] cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>Select Silver</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tier 2: Shahi Gold Royal (Featured Most Popular) */}
          <div className="shahi-card-elevated p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-gradient-to-b from-[#FFFDF9] via-[#F7F0DD] to-[#EDE0C8] border-3 border-[#A67C3D] rounded-3xl relative lg:-translate-y-3 shadow-2xl">
            {/* Top Crown Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6B1420] text-[#F7F0DD] px-4 py-1 rounded-full text-[10px] font-fraunces font-black uppercase tracking-widest border-2 border-[#A67C3D] shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>MOST POPULAR CHOICE</span>
            </div>

            <div className="space-y-4 mt-2">
              <span className="stamped-label text-[#C4522A]">SHAHI GOLD ROYAL</span>
              
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-fraunces font-black text-[#6B1420]">₹2,299</span>
                <span className="text-xs text-[#2B1810] font-bold">/ wedding</span>
              </div>

              <p className="text-xs text-[#2B1810] font-bold leading-relaxed">
                Our flagship 3D animated royal suite with all 7 themes included.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#A67C3D]/40">
                <div className="flex items-center gap-2.5 text-xs text-[#6B1420] font-black">
                  <Check className="w-4 h-4 text-[#A67C3D] shrink-0 stroke-[3]" />
                  <span>All 7 Royal Themes Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#6B1420] font-black">
                  <Check className="w-4 h-4 text-[#A67C3D] shrink-0 stroke-[3]" />
                  <span>3D Animated Palace Gates &amp; Parallax</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-black">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0 stroke-[2.5]" />
                  <span>Trilingual Vivah Engine (English, हिन्दी, ગુજરાતી)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-black">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0 stroke-[2.5]" />
                  <span>Background Music Player &amp; Audio Chimes</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-black">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0 stroke-[2.5]" />
                  <span>1-Click WhatsApp Dispatch &amp; Golden QR Code</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-black">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0 stroke-[2.5]" />
                  <span>Unlimited Guest RSVPs &amp; Live Counter</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackage ? onSelectPackage('gold', 'rajmahal') : onEnterStudio('rajmahal')}
              className="w-full py-4 rounded-xl btn-vermillion text-xs sm:text-sm font-fraunces font-black uppercase tracking-wider shadow-xl hover:-translate-y-0.5 transition-transform min-h-[48px] cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>Select Gold Royal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tier 3: Rajmahal Platinum VIP */}
          <div className="shahi-card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-[#EDE0C8] border-2 border-[#A67C3D]/60 rounded-3xl shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-4">
              <span className="stamped-label text-[#2C3E5C]">RAJMAHAL PLATINUM VIP</span>
              
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-fraunces font-black text-[#6B1420]">₹24,999</span>
                <span className="text-xs text-[#2B1810] font-bold">/ VIP Suite</span>
              </div>

              <p className="text-xs text-[#2B1810] font-bold leading-relaxed">
                White-glove design concierge, custom domain &amp; acrylic keepsake.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#D8C7AA]">
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Custom .com Domain Setup</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>All 7 Royal Themes Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Dedicated 1-on-1 Design Concierge</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Custom Ceremony Animations &amp; Palette</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Printable 24K Gold Acrylic QR Keepsake</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackage ? onSelectPackage('platinum', 'royaldawn') : onEnterStudio('royaldawn')}
              className="w-full py-3.5 rounded-xl border-2 border-[#A67C3D] text-[#6B1420] font-fraunces font-black text-xs uppercase tracking-wider hover:bg-[#F7F0DD] transition-all min-h-[44px] cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>Select Platinum VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 🛡️ Reassurance & Trust Badges */}
        <div className="p-6 rounded-2xl bg-[#EDE0C8] border border-[#D8C7AA] max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#3D6B4A] shrink-0" />
            <div>
              <h5 className="font-fraunces font-bold text-xs text-[#6B1420]">256-Bit SSL Encrypted</h5>
              <p className="text-[10px] text-[#2B1810] font-medium">Bank-grade payment security</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DiyaIcon className="w-6 h-6 text-[#C4522A] shrink-0" />
            <div>
              <h5 className="font-fraunces font-bold text-xs text-[#6B1420]">Instant Activation</h5>
              <p className="text-[10px] text-[#2B1810] font-medium">0ms delay to start designing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-[#A67C3D] shrink-0" />
            <div>
              <h5 className="font-fraunces font-bold text-xs text-[#6B1420]">WhatsApp Concierge</h5>
              <p className="text-[10px] text-[#2B1810] font-medium">Support: +91 9409360336</p>
            </div>
          </div>
        </div>
      </main>

      {/* 🏰 Footer */}
      <footer className="bg-[#EDE0C8] border-t border-[#D8C7AA] py-6 text-center text-xs text-[#6B5A4A] font-hanken">
        <p>Shahi Studio™ · India's Premier 3D Digital Wedding Kankotri Platform</p>
      </footer>
    </div>
  );
};
