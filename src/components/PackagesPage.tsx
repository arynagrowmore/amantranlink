import React, { useState } from 'react';
import { 
  ArrowLeft, Check, Sparkles, ShieldCheck, Crown, 
  ArrowRight, Shield, Award, Heart, MessageCircle,
  Camera, Building2, Tag, Percent
} from 'lucide-react';
import { ThemeId, PackageType } from '../types/wedding';
import { RoyalCrestIcon, DiyaIcon } from './ShahiIcons';
import { OFFICIAL_PACKAGES, PARTNER_PACKAGES } from '../config/pricing';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [pricingMode, setPricingMode] = useState<'retail' | 'partner'>(
    user?.role === 'partner' ? 'partner' : 'retail'
  );

  const isPartnerView = pricingMode === 'partner';

  return (
    <div className="min-h-screen bg-[#F7F0DD] text-[#2B1810] flex flex-col font-hanken">
      {/* 👑 Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#EDE0C8]/95 backdrop-blur-md border-b border-[#D8C7AA] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#A67C3D]/60 text-[#6B1420] font-fraunces font-bold text-xs hover:bg-[#F7F0DD] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <img 
            src="/amantranlink.png" 
            alt="AmantranLink Logo" 
            className="h-8 w-auto object-contain" 
          />
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
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Header Ribbon */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 stamped-label text-[#2C3E5C] bg-[#EDE0C8] border border-[#D8C7AA] px-3 py-1 rounded-full shadow-xs">
            <RoyalCrestIcon className="w-4 h-4 text-[#A67C3D]" />
            <span>TRANSPARENT ROYAL PRICING</span>
          </div>

          <h1 className="font-fraunces font-black text-3xl sm:text-5xl text-[#6B1420] tracking-tight">
            ROYAL PACKAGES &amp; PLANS
          </h1>

          <p className="font-hanken text-base sm:text-lg text-[#2B1810] font-bold leading-relaxed max-w-2xl mx-auto">
            Choose the invitation experience made for your celebration or studio clients.
          </p>

          {/* 🌟 2-ROLE PRICING SWITCHER (Couples vs Photographers) */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1 bg-[#EDE0C8] rounded-2xl border-2 border-[#A67C3D]/60 shadow-sm">
              <button
                type="button"
                onClick={() => setPricingMode('retail')}
                className={`py-2 px-5 rounded-xl font-fraunces font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                  !isPartnerView
                    ? 'bg-[#6B1420] text-[#FFFDF8] shadow-sm'
                    : 'text-[#6B1420] hover:bg-[#F7F0DD]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>For Couples &amp; Families (Retail)</span>
              </button>

              <button
                type="button"
                onClick={() => setPricingMode('partner')}
                className={`py-2 px-5 rounded-xl font-fraunces font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                  isPartnerView
                    ? 'bg-[#0B2545] text-[#38BDF8] shadow-sm border border-[#38BDF8]/40'
                    : 'text-[#0B2545] hover:bg-[#F7F0DD]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>For Photographers &amp; Studios (Wholesale)</span>
                <span className="text-[9px] bg-[#38BDF8] text-[#0B2545] px-1.5 py-0.5 rounded-full font-black">Save ₹400</span>
              </button>
            </div>
          </div>
        </div>

        {/* 💎 3 Heavy Royal Package Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          
          {/* Tier 1: Silver */}
          <div className="shahi-card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-[#EDE0C8] border-2 border-[#A67C3D]/60 rounded-3xl shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-4">
              <span className="stamped-label text-[#2C3E5C]">SHAHI SILVER</span>
              
              <div className="flex items-baseline gap-2">
                {isPartnerView && (
                  <span className="text-xl line-through text-[#806B5A]">
                    ₹{OFFICIAL_PACKAGES.silver.priceInr.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-3xl sm:text-4xl font-fraunces font-black text-[#6B1420]">
                  ₹{(isPartnerView ? PARTNER_PACKAGES.silver.partnerPriceInr : OFFICIAL_PACKAGES.silver.priceInr).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#2B1810] font-bold">/ wedding</span>
              </div>

              {isPartnerView && (
                <div className="text-[11px] font-bold text-[#065F46] bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-[#10B981]/40 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Save ₹{OFFICIAL_PACKAGES.silver.priceInr - PARTNER_PACKAGES.silver.partnerPriceInr} Partner Discount</span>
                </div>
              )}

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
                  <span>Digital QR Entry Pass</span>
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
              <span>{isPartnerView ? 'Get Wholesale Silver (₹699)' : 'Select Silver'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tier 2: Shahi Gold Royal (Featured Most Popular) */}
          <div className="shahi-card-elevated p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-gradient-to-b from-[#FFFDF9] via-[#F7F0DD] to-[#EDE0C8] border-3 border-[#A67C3D] rounded-3xl relative lg:-translate-y-3 shadow-2xl">
            {/* Top Crown Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6B1420] text-[#F7F0DD] px-4 py-1 rounded-full text-[10px] font-fraunces font-black uppercase tracking-widest border-2 border-[#A67C3D] shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isPartnerView ? 'MOST PROFITABLE FOR STUDIOS' : 'MOST POPULAR CHOICE'}</span>
            </div>

            <div className="space-y-4 mt-2">
              <span className="stamped-label text-[#C4522A]">SHAHI GOLD ROYAL</span>
              
              <div className="flex items-baseline gap-2">
                {isPartnerView && (
                  <span className="text-xl line-through text-[#806B5A]">
                    ₹{OFFICIAL_PACKAGES.gold.priceInr.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-4xl sm:text-5xl font-fraunces font-black text-[#6B1420]">
                  ₹{(isPartnerView ? PARTNER_PACKAGES.gold.partnerPriceInr : OFFICIAL_PACKAGES.gold.priceInr).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#2B1810] font-bold">/ wedding</span>
              </div>

              {isPartnerView && (
                <div className="text-[11px] font-bold text-[#065F46] bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-[#10B981]/40 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Save ₹{OFFICIAL_PACKAGES.gold.priceInr - PARTNER_PACKAGES.gold.partnerPriceInr} / Site (Instant Wholesale Rate)</span>
                </div>
              )}

              <p className="text-xs text-[#2B1810] font-bold leading-relaxed">
                Our flagship 3D animated royal suite with all 7 themes included.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#A67C3D]/40">
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#C4522A] shrink-0" />
                  <span className="font-bold text-[#6B1420]">All 7 Royal Themes Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#C4522A] shrink-0" />
                  <span>3D Animated Palace Gate Opening</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#C4522A] shrink-0" />
                  <span>Interactive Gold Scratch-Heart Card</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#C4522A] shrink-0" />
                  <span>Lossless Audio &amp; Shehnai Player</span>
                </div>
                {isPartnerView && (
                  <div className="flex items-center gap-2.5 text-xs font-hanken text-[#0B2545] font-bold">
                    <Building2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                    <span className="text-[#0B2545]">Custom Studio Name &amp; Branding on Invitation</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#C4522A] shrink-0" />
                  <span>Live RSVP Analytics &amp; CSV Export</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackage ? onSelectPackage('gold', 'rajmahal') : onEnterStudio('rajmahal')}
              className="w-full py-4 rounded-xl btn-vermillion font-fraunces font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all min-h-[48px] cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>{isPartnerView ? 'Get Wholesale Gold (₹899)' : 'Select Gold Royal'}</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

          {/* Tier 3: Rajmahal Platinum VIP */}
          <div className="shahi-card-flat p-6 sm:p-8 space-y-6 flex flex-col justify-between text-left bg-[#EDE0C8] border-2 border-[#A67C3D]/60 rounded-3xl shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-4">
              <span className="stamped-label text-[#2C3E5C]">RAJMAHAL PLATINUM VIP</span>
              
              <div className="flex items-baseline gap-2">
                {isPartnerView && (
                  <span className="text-xl line-through text-[#806B5A]">
                    ₹{OFFICIAL_PACKAGES.platinum.priceInr.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-3xl sm:text-4xl font-fraunces font-black text-[#6B1420]">
                  ₹{(isPartnerView ? PARTNER_PACKAGES.platinum.partnerPriceInr : OFFICIAL_PACKAGES.platinum.priceInr).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#2B1810] font-bold">/ bespoke</span>
              </div>

              {isPartnerView && (
                <div className="text-[11px] font-bold text-[#065F46] bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-[#10B981]/40 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Save ₹{OFFICIAL_PACKAGES.platinum.priceInr - PARTNER_PACKAGES.platinum.partnerPriceInr} Partner Discount</span>
                </div>
              )}

              <p className="text-xs text-[#2B1810] font-bold leading-relaxed">
                Full bespoke white-glove setup with dedicated concierge director.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#D8C7AA]">
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Dedicated Royal Design Director</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>Custom Domain Setup (.com / .in)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>All 7 Royal Themes Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-hanken text-[#2B1810] font-bold">
                  <Check className="w-4 h-4 text-[#3D6B4A] shrink-0" />
                  <span>24K Gold Keepsake Acrylic QR Plaque</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackage ? onSelectPackage('platinum', 'rajmahal') : onEnterStudio('rajmahal')}
              className="w-full py-3.5 rounded-xl border-2 border-[#A67C3D] text-[#6B1420] font-fraunces font-black text-xs uppercase tracking-wider hover:bg-[#F7F0DD] transition-all min-h-[44px] cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>{isPartnerView ? 'Get Wholesale Platinum (₹1,699)' : 'Select Platinum VIP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 🛡️ Royal Guarantee Strip */}
        <div className="p-6 rounded-3xl bg-[#EDE0C8] border border-[#A67C3D]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F0DD] border border-[#A67C3D] flex items-center justify-center text-[#6B1420] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-fraunces font-bold text-sm text-[#6B1420] block">
                Official Razorpay &amp; Supabase Verified Platform
              </span>
              <span className="text-xs text-[#2B1810]/75">
                Instant lifetime activation &bull; 100% money-back satisfaction guarantee.
              </span>
            </div>
          </div>

          <a
            href="https://wa.me/919409360336?text=Namaste%20AmantranLink%20Pricing%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-fraunces font-bold text-xs uppercase tracking-wider shadow-sm transition-transform hover:scale-105 cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
};

export default PackagesPage;
