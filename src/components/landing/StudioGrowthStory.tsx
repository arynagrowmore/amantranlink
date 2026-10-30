import React from 'react';
import { ArrowRight, Camera, Sparkles, QrCode, Users, Check, Award } from 'lucide-react';

interface StudioGrowthStoryProps {
  isPartner?: boolean;
  onOpenPartnerModal?: () => void;
  onNavigatePartnerHub?: () => void;
}

export const StudioGrowthStory: React.FC<StudioGrowthStoryProps> = ({
  isPartner = false,
  onOpenPartnerModal,
  onNavigatePartnerHub,
}) => {
  const handleCtaClick = () => {
    if (isPartner && onNavigatePartnerHub) {
      onNavigatePartnerHub();
    } else if (onOpenPartnerModal) {
      onOpenPartnerModal();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-partner-modal'));
    }
  };

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans overflow-hidden">
      
      {/* 🏛️ Container Card: Luminous Light Atelier Card */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE1] border border-[#E8DCC8] p-6 sm:p-12 lg:p-16 shadow-[0_16px_40px_-12px_rgba(67,9,20,0.06)] overflow-hidden">
        
        {/* Subtle Ambient Background Grain & Light Texture */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C49A35]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#6E1020]/5 rounded-full blur-3xl pointer-events-none" />

        {/* TOP EDITORIAL HEADER & COPY */}
        <div className="relative z-10 max-w-3xl space-y-4 text-left">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white border border-[#E8DCC8] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#6E1020] font-bold">
              Studio Partner Ecosystem
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[#1A1715] tracking-tight leading-[1.1]">
            Don’t stop at delivering photographs.
          </h2>

          {/* Primary & Secondary Supporting Copy */}
          <div className="space-y-2 pt-1 text-left">
            <p className="text-base sm:text-xl text-[#6E1020] font-serif italic tracking-wide font-normal">
              Give every wedding client an interactive digital heirloom they can share and remember forever.
            </p>
            <p className="text-sm sm:text-base text-[#6E1020] font-bold leading-relaxed max-w-2xl">
              You capture the memories. AmantranLink helps your studio deliver the living digital celebration around them — earn wholesale studio rates and delighted client referrals.
            </p>
          </div>

          {/* CTA & Verified Sub-line */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#520B17] text-[#FFFDF8] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border border-[#C49A35]"
            >
              <span>{isPartner ? 'Open Studio Dashboard' : 'Become a Studio Partner'}</span>
              <ArrowRight className="w-4 h-4 text-[#C49A35] transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <span className="text-xs sm:text-[13px] text-[#1A1412] font-bold">
              Built for wedding studios, planners &amp; photographers across India.
            </span>
          </div>

        </div>

        {/* THE 3-STAGE VISUAL STORY */}
        <div className="relative z-10 mt-12 sm:mt-16 pt-10 border-t border-[#E8DCC8]">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* STAGE 01 — CAPTURE */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white border border-[#C49A35] flex items-center justify-center text-[#6E1020] font-mono text-xs font-bold shrink-0 shadow-xs">
                  01
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6725] font-bold">
                  STAGE 01 · CAPTURE
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1715]">
                Wedding Photography
              </h3>
              <p className="text-xs text-[#5C524B] leading-relaxed">
                The haldi smiles, baraat energy, and varmala rituals captured through your team’s artistic lens.
              </p>
            </div>

            {/* STAGE 02 — ELEVATE */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white border border-[#C49A35] flex items-center justify-center text-[#6E1020] font-mono text-xs font-bold shrink-0 shadow-xs">
                  02
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6725] font-bold">
                  STAGE 02 · ELEVATE
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1715]">
                Digital Palace Invitation
              </h3>
              <p className="text-xs text-[#5C524B] leading-relaxed">
                Transform their portraits into a living 3D palace experience with shehnai music and personalized WhatsApp invites.
              </p>
            </div>

            {/* STAGE 03 — MONETIZE */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white border border-[#C49A35] flex items-center justify-center text-[#6E1020] font-mono text-xs font-bold shrink-0 shadow-xs">
                  03
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6725] font-bold">
                  STAGE 03 · MONETIZE
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1715]">
                Studio Branding &amp; Referrals
              </h3>
              <p className="text-xs text-[#5C524B] leading-relaxed">
                Every wedding displays your studio badge to 500+ guests, generating seamless high-ticket photography inquiries.
              </p>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default StudioGrowthStory;
