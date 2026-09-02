import React from 'react';
import { Camera, Heart, Sparkles, Crown, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RoleIndicatorBannerProps {
  onNavigatePartnerHub?: () => void;
  onOpenPricingModal?: () => void;
}

export const RoleIndicatorBanner: React.FC<RoleIndicatorBannerProps> = ({
  onNavigatePartnerHub,
  onOpenPricingModal,
}) => {
  const { user } = useAuth();
  const isPartner = user?.role === 'partner';

  if (isPartner) {
    // 📸 PHOTOGRAPHER / STUDIO PARTNER VIP FOOTER STATUS BAR (Sapphire / Emerald Luxury)
    return (
      <aside 
        aria-label="Studio partner mode banner"
        className="shrink-0 z-20 bg-gradient-to-r from-[#0B2545] via-[#133C55] to-[#04101E] border-t-2 border-[#38BDF8]/60 text-[#FFFDF8] px-3 sm:px-6 py-2 flex items-center justify-between shadow-[0_-4px_20px_rgba(11,37,69,0.35)] select-none font-manrope animate-fadeIn"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8] text-[#38BDF8] text-[11px] font-extrabold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Studio Partner VIP</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-[#E0F2FE]">
              {user?.studioName ? `${user.studioName} Workspace` : 'Photographer Mode Active'}
            </span>
            <span className="hidden md:inline text-white/40">&bull;</span>
            <div className="hidden sm:flex items-center gap-1 text-[#34D399] font-bold text-[11.5px] bg-[#064E3B]/60 px-2 py-0.5 rounded-md border border-[#34D399]/40">
              <Tag className="w-3 h-3" />
              <span>Wholesale Pricing Active: ₹899 (Save ₹400 / site)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigatePartnerHub && (
            <button
              type="button"
              onClick={onNavigatePartnerHub}
              className="px-3.5 py-1.5 rounded-full bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0B2545] text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-105"
            >
              <span>Multi-Client Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // 💑 REGULAR END USER / COUPLE ROYAL GOLD BOTTOM FOOTER BAR
  return (
    <aside 
      aria-label="Couple suite status banner"
      className="shrink-0 z-20 bg-gradient-to-r from-[#430914] via-[#6E1020] to-[#2D050B] border-t-2 border-[#C49A35] text-[#FFFDF8] px-3 sm:px-6 py-1.5 flex items-center justify-between shadow-[0_-4px_16px_rgba(67,9,20,0.25)] select-none font-manrope"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#D4AF37] text-[10.5px] font-bold uppercase tracking-wider">
          <Crown className="w-3 h-3" />
          <span>AmantranLink Couple Suite</span>
        </div>

        <span className="hidden sm:inline text-[11px] text-[#F8F3E8]/90 font-medium">
          7 Royal 3D Palace Themes &bull; Lossless Shehnai Audio &bull; Instant Live RSVP
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#E8D5AD]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden md:inline">24K Heritage Gold Certified</span>
      </div>
    </aside>
  );
};

export default RoleIndicatorBanner;
