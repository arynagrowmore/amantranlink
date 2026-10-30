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
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>The Modern Wedding Heirloom</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight text-balance">
          Traditional Paper Cards vs. AmantranLink Royal Digital
        </h2>

        <p className="text-base sm:text-lg text-[#6E1020] font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          See why modern couples and prominent Indian families choose interactive royal digital invitations over conventional paper cards.
        </p>
      </div>

      {/* Comparison Table / Grid (Full Table-Wise Layout on Mobile & Desktop) */}
      <div className="bg-white rounded-3xl border-2 border-[#E8D5AD] shadow-[0_10px_36px_-6px_rgba(67,9,20,0.08)] overflow-hidden">
        
        {/* Mobile Swipe Hint Badge */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE] border-b border-[#E8DCC8] text-[#6E1020]">
          <span className="text-xs font-serif font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            Side-by-Side Comparison Table
          </span>
          <span className="text-[11px] font-sans font-bold text-[#8B1528] bg-white border border-[#E8DCC8] px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
            Swipe table ➔
          </span>
        </div>

        {/* Responsive Horizontal Scroll Container to maintain real table structure on mobile */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#C49A35]/40 -webkit-overflow-scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#FAF6EE] border-b-2 border-[#E8D5AD]">
                <th className="py-4.5 px-6 sm:px-8 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider text-[#6E1020] w-[26%]">
                  Experience Dimension
                </th>
                <th className="py-4.5 px-6 sm:px-8 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-[#991B1B] w-[34%]">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Traditional Printed Cards</span>
                  </div>
                </th>
                <th className="py-4.5 px-6 sm:px-8 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-[#065F46] w-[40%]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>AmantranLink Royal Digital Invitation</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8DCC8]/70">
              {COMPARISON_DATA.map((row, index) => (
                <tr 
                  key={index}
                  className={`transition-colors ${
                    index % 2 === 1 ? 'bg-[#FAF8F5]' : 'bg-white'
                  }`}
                >
                  {/* Experience Dimension Aspect */}
                  <td className="py-5 px-6 sm:px-8 align-top">
                    <span className="font-serif font-bold text-[15px] sm:text-base text-[#6E1020] block leading-snug">
                      {row.aspect}
                    </span>
                  </td>

                  {/* Traditional Paper */}
                  <td className="py-5 px-6 sm:px-8 align-top">
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2A1E1A] font-semibold leading-relaxed">
                      <XCircle className="w-4 h-4 text-[#DC2626]/80 shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>

                  {/* Royal Digital */}
                  <td className="py-5 px-6 sm:px-8 align-top">
                    <div className="flex items-start gap-3 bg-[#F0FDF4] p-3.5 rounded-2xl border border-[#059669]/30 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed">
                          {row.royalDigital}
                        </p>
                        <span className="inline-block text-[11px] font-bold text-[#065F46] bg-[#DCFCE7] border border-[#059669]/30 px-2.5 py-0.5 rounded-full">
                          ✦ {row.royalHighlight}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Action Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE] border-t-2 border-[#E8D5AD] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] border border-[#167A5A]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#167A5A]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-[#6E1020]">
                Ready to Experience Royal Grandeur?
              </h4>
              <p className="text-xs sm:text-[13px] text-[#6E1020] font-semibold">
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
