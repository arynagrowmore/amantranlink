import React from 'react';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ComparisonSectionProps {
  onEnterStudio: () => void;
}

interface ComparisonRow {
  aspect: string;
  traditional: string;
  royalDigital: string;
  royalHighlight: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    aspect: 'First Guest Impression',
    traditional: 'Flat 2D printed paper envelope that is easily misplaced.',
    royalDigital: 'Cinematic 3D Palace Gates that glide open with authentic ceremonial Shehnai music.',
    royalHighlight: 'Unforgettable royal grand entrance',
  },
  {
    aspect: 'Delivery Speed & Reach',
    traditional: '2–4 weeks for printing, courier delays, and expensive postal charges.',
    royalDigital: 'Instant 1-click delivery to WhatsApp contacts and family groups worldwide.',
    royalHighlight: 'Immediate delivery with ₹0 postage',
  },
  {
    aspect: 'Guest RSVP & Catering',
    traditional: 'Tedious manual phone calling and stressful catering food waste.',
    royalDigital: 'Real-time live RSVP dashboard with headcount counts and 1-click Excel export.',
    royalHighlight: 'Save up to ₹40,000+ in catering waste',
  },
  {
    aspect: 'Venue Directions & GPS',
    traditional: 'Tiny printed map snippet; confused guests calling on your wedding day.',
    royalDigital: 'Built-in 1-tap Google Maps turn-by-turn navigation straight to palace gates.',
    royalHighlight: 'Zero lost guests on event day',
  },
  {
    aspect: 'Event Changes & Muhurat Updates',
    traditional: 'Costly reprints and stress if dates, timings, or venues shift.',
    royalDigital: 'Unlimited instant re-edits from your studio; updates instantly on all shared links.',
    royalHighlight: '100% stress-free flexibility',
  },
  {
    aspect: 'Lasting Heritage & Memories',
    traditional: 'Paper cards inevitably get discarded or gather dust.',
    royalDigital: 'A permanent digital heirloom with photo gallery, family blessings wall, and video.',
    royalHighlight: 'Preserved forever for generations',
  },
];

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ onEnterStudio }) => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
      
      {/* Eyebrow & Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>The Modern Wedding Heirloom</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight text-balance">
          Traditional Paper Cards vs. AmantranLink Royal Digital
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-2xl mx-auto leading-relaxed">
          See why modern couples and prominent Indian families choose interactive royal digital invitations over conventional paper cards.
        </p>
      </div>

      {/* Comparison Table / Grid */}
      <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-[0_8px_32px_-6px_rgba(67,9,20,0.06)] overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 bg-[#FAF6EE] border-b border-[#E8DCC8] py-4 px-6 sm:px-8 text-xs font-bold uppercase tracking-wider text-[#6E1020]">
          <div className="hidden md:block md:col-span-3 text-[#75675C]">
            Experience Dimension
          </div>
          <div className="md:col-span-4 text-[#8C2A3C] flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#A84A5B] shrink-0" />
            <span>Traditional Printed Cards</span>
          </div>
          <div className="md:col-span-5 text-[#167A5A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
            <span>AmantranLink Royal Digital Invitation</span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E8DCC8]/60">
          {COMPARISON_DATA.map((row, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 sm:px-8 gap-4 sm:gap-6 items-center transition-colors ${
                index % 2 === 1 ? 'bg-[#FAF8F5]/50' : 'bg-white'
              }`}
            >
              {/* Aspect */}
              <div className="md:col-span-3">
                <span className="font-semibold text-sm sm:text-base text-[#1A1715] block">
                  {row.aspect}
                </span>
              </div>

              {/* Traditional Paper */}
              <div className="md:col-span-4 flex items-start gap-2.5 text-xs sm:text-sm text-[#75675C] leading-relaxed">
                <span className="inline-block md:hidden font-bold text-xs text-[#8C2A3C] uppercase tracking-wider min-w-[70px]">
                  Paper:
                </span>
                <span>{row.traditional}</span>
              </div>

              {/* Royal Digital */}
              <div className="md:col-span-5 flex items-start gap-3 bg-[#F4F9F6] md:bg-transparent p-3.5 md:p-0 rounded-2xl border md:border-0 border-[#167A5A]/20">
                <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-[#1A1715] leading-relaxed">
                    {row.royalDigital}
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-[#167A5A] bg-[#E8F5EE] px-2 py-0.5 rounded-md">
                    ✦ {row.royalHighlight}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Bottom Action Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE] border-t border-[#E8DCC8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] border border-[#167A5A]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#167A5A]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#1A1715]">
                Ready to Experience Royal Grandeur?
              </h4>
              <p className="text-xs text-[#75675C]">
                Free to design and preview in real-time. Only pay when ready to publish.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEnterStudio}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Create Your Royal Invitation</span>
            <ArrowRight className="w-4 h-4 text-[#C49A35]" />
          </button>
        </div>

      </div>

    </section>
  );
};
