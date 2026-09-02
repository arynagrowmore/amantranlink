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
    <section className="relative py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope overflow-hidden">
      
      {/* 🏛️ Container Card: Dark Editorial Parchment with Fine Gold & Terracotta Thread */}
      <div className="relative rounded-[2.5rem] bg-[#12070A] border border-[#C49A35]/35 p-6 sm:p-12 lg:p-16 shadow-[0_25px_60px_-15px_rgba(18,7,10,0.8)] overflow-hidden">
        
        {/* Subtle Ambient Background Grain & Light Texture */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C49A35]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C84B31]/10 rounded-full blur-3xl pointer-events-none" />

        {/* ═══════════════════════════════════════════════════════════════════════
            TOP EDITORIAL HEADER & COPY
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 max-w-3xl space-y-4 text-left">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#2A1016] border border-[#C49A35]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2C792]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#E2C792] font-semibold">
              Studio Growth Story
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-cormorant font-bold text-3xl sm:text-5xl lg:text-6xl text-[#FFFDF8] tracking-tight leading-[1.1]">
            Don’t stop at delivering photographs.
          </h2>

          {/* Primary & Secondary Supporting Copy */}
          <div className="space-y-2 pt-1 text-left">
            <p className="text-base sm:text-xl text-[#F2E5CC] font-cormorant italic tracking-wide font-normal">
              Give every wedding client something they can share, revisit, and remember.
            </p>
            <p className="text-xs sm:text-sm text-[#D1C2B5] font-normal leading-relaxed max-w-2xl">
              You capture the memories. AmantranLink helps your studio deliver the digital wedding experience around them.
            </p>
          </div>

          {/* CTA & Verified Sub-line */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C49A35] via-[#D4AB45] to-[#B88E34] hover:from-[#D4AB45] hover:to-[#C49A35] text-[#140508] font-manrope font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-[#C49A35]/20 transition-all duration-200 cursor-pointer group"
            >
              <span>{isPartner ? 'Open Studio Dashboard' : 'Become a Studio Partner'}</span>
              <ArrowRight className="w-4 h-4 text-[#140508] transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <span className="text-xs text-[#9E8B83] font-medium">
              Built for studios. Designed for wedding clients.
            </span>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            THE CEREMONIAL THREAD & 3-STAGE VISUAL STORY
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 mt-12 sm:mt-16 pt-10 border-t border-[#C49A35]/20">
          
          {/* Subtle Decorative Thread Line (Desktop SVG connecting line) */}
          <div className="hidden lg:block absolute top-[62px] left-8 right-8 h-0.5 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#C49A35]/60 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* STAGE 01 — CAPTURE */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#200A10] border border-[#C49A35]/50 flex items-center justify-center text-[#E2C792] font-mono text-xs font-bold shrink-0 shadow-inner">
                  01
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C49A35] font-semibold">
                  STAGE 01 · CAPTURE
                </span>
              </div>
              <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#FFFDF8]">
                Wedding Photography
              </h3>
              <p className="text-xs text-[#B5A59E] leading-relaxed">
                The haldi smiles, baraat energy, and varmala rituals captured through your team’s artistic lens.
              </p>
            </div>

            {/* STAGE 02 — MAKE IT YOURS */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#200A10] border border-[#C49A35]/50 flex items-center justify-center text-[#E2C792] font-mono text-xs font-bold shrink-0 shadow-inner">
                  02
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C49A35] font-semibold">
                  STAGE 02 · MAKE IT YOURS
                </span>
              </div>
              <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#FFFDF8]">
                Studio Branding
              </h3>
              <p className="text-xs text-[#B5A59E] leading-relaxed">
                Your studio watermark, custom domain, and co-branded invitations presented seamlessly to the couple.
              </p>
            </div>

            {/* STAGE 03 — DELIVER */}
            <div className="relative space-y-3 group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#200A10] border border-[#C49A35]/50 flex items-center justify-center text-[#E2C792] font-mono text-xs font-bold shrink-0 shadow-inner">
                  03
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C49A35] font-semibold">
                  STAGE 03 · DELIVER
                </span>
              </div>
              <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#FFFDF8]">
                Digital Wedding Experience
              </h3>
              <p className="text-xs text-[#B5A59E] leading-relaxed">
                An interactive 3D invitation, live RSVP headcount, and QR entry passes delivered before day one.
              </p>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            LAYERED REAL-PRODUCT COMPOSITION (CONTROLLED ASYMMETRICAL OVERLAP)
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 mt-12 sm:mt-16 pt-8 border-t border-[#C49A35]/20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Contextual Annotation */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#250D13] border border-[#C49A35]/30 text-[10px] font-mono uppercase tracking-widest text-[#E2C792]">
                <Award className="w-3 h-3 text-[#C49A35]" />
                <span>Full Client Ecosystem</span>
              </div>

              <h4 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#FFFDF8] leading-tight">
                One complete digital suite for every wedding client.
              </h4>

              <p className="text-xs text-[#B5A59E] leading-relaxed">
                Instead of sending a plain PDF card or separate RSVP forms, your clients receive a synchronized royal suite with invitation gates, guest response tracking, and venue entry passes.
              </p>

              <div className="space-y-2 pt-2 text-xs text-[#E8D5AD]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>3D Palace Architectural Gate Invitations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Real-Time Guest Attendance &amp; RSVP Directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Digital QR Entry Passes for Venue Check-In</span>
                </div>
              </div>
            </div>

            {/* Right Column: Layered Real-Product Cards */}
            <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
              
              {/* Card 1 (Backdrop Base): 3D Palace Invitation Comp */}
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] bg-[#1E0B12] border-2 border-[#C49A35]/50 rounded-2xl p-5 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                
                {/* Header in Mock Card */}
                <div className="flex items-center justify-between border-b border-[#C49A35]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[10px] font-mono tracking-wider text-[#E8D5AD] uppercase font-semibold">
                      Live Wedding Site · Udaipur
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#C49A35]/20 text-[#E2C792] border border-[#C49A35]/40 font-bold">
                    THE RAJMAHAL 3D
                  </span>
                </div>

                {/* Mock Card Hero */}
                <div className="py-5 text-center space-y-2">
                  <p className="text-[10px] tracking-widest text-[#C49A35] uppercase font-semibold font-mono">
                    ॥ शुभ विवाह ॥
                  </p>
                  <h5 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                    Dhruv &amp; Shreya
                  </h5>
                  <p className="text-[11px] text-[#D1C2B5] italic">
                    Sunday, 14th December 2026 · Taj Lake Palace
                  </p>
                </div>

                {/* Interactive Audio Bar Mock */}
                <div className="bg-[#2D101A] border border-[#C49A35]/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#C49A35] flex items-center justify-center text-[#140508] text-[10px] font-bold">
                      ▶
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#FFFDF8]">Shehnai &amp; Sitar Raga</p>
                      <p className="text-[8px] text-[#A6938B]">Lossless Traditional Audio</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#E2C792]">02:45</span>
                </div>

              </div>

              {/* Card 2 (Front Left Overlap): Live RSVP Directory Comp */}
              <div className="absolute -bottom-4 left-0 sm:left-2 w-[220px] sm:w-[260px] bg-[#2A0E17] border border-[#C49A35]/60 rounded-xl p-3.5 shadow-[0_20px_35px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md space-y-2.5 z-20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase text-[#C49A35] font-bold flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#C49A35]" />
                    Live Guest RSVPs
                  </span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    342 Confirmed
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center bg-[#1D0810] px-2 py-1 rounded border border-[#C49A35]/20">
                    <span className="text-[#F2E5CC] font-medium">Patel Parivar (Modasa)</span>
                    <span className="text-emerald-400 font-mono text-[9px]">Attending (4)</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1D0810] px-2 py-1 rounded border border-[#C49A35]/20">
                    <span className="text-[#F2E5CC] font-medium">Shah Family (Ahmedabad)</span>
                    <span className="text-emerald-400 font-mono text-[9px]">Attending (2)</span>
                  </div>
                </div>
              </div>

              {/* Card 3 (Front Right Float): QR Entry Pass Comp */}
              <div className="absolute -top-4 right-0 sm:right-2 w-[200px] sm:w-[230px] bg-[#1A070D] border border-[#E2C792]/50 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-2 z-20">
                <div className="flex items-center justify-between border-b border-[#C49A35]/20 pb-1.5">
                  <span className="text-[9px] font-mono uppercase text-[#E2C792] font-bold flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-[#E2C792]" />
                    Digital Entry Pass
                  </span>
                  <span className="text-[8px] font-mono text-[#A6938B]">PASS #042</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-[#FFFDF8] rounded p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-[#140508]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#FFFDF8]">VIP Guest Entry</p>
                    <p className="text-[8px] text-[#C49A35]">Table 04 · Mandap Zone</p>
                  </div>
                </div>
              </div>

              {/* Studio Co-Branding Stamp (Distinct Signature Motif) */}
              <div className="absolute -bottom-6 right-4 sm:right-8 bg-[#140508] border-2 border-[#C49A35] rounded-full px-4 py-1.5 shadow-xl flex items-center gap-2 z-30">
                <Camera className="w-3.5 h-3.5 text-[#C49A35]" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#FFFDF8] font-bold">
                  Captured by Your Studio Brand
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default StudioGrowthStory;
