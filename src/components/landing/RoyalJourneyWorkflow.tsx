import React from 'react';
import { 
  Layers, Send, Users, QrCode, 
  ArrowRight, Sparkles 
} from 'lucide-react';
import { PalaceGateIcon, MuhuratClockIcon } from '../ShahiIcons';

interface JourneyStage {
  stageNumber: string;
  stageName: string;
  hindiTitle: string;
  headline: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    stageNumber: '01',
    stageName: 'PREPARE',
    hindiTitle: 'सृजन व मुहूर्त',
    headline: 'Curate your royal wedding invitation',
    description: 'Select your palace architectural theme, add couple names in English, हिन्दी, or ગુજરાતી, set auspicious muhurats, and embed Google Map navigation.',
    icon: <PalaceGateIcon className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['8 Royal Masterwork Themes', 'Trilingual Vedic Shlokas', 'GPS Venue Directions']
  },
  {
    stageNumber: '02',
    stageName: 'INVITE',
    hindiTitle: 'निमंत्रण व संदेश',
    headline: 'Send personalized links to each family',
    description: 'Every family receives an individual personalized link. When opened, the invitation greets them respectfully by their family name.',
    icon: <Send className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Unique Guest Tokens', 'Ceremonial Shehnai Audio', 'Zero Spam / Secure Access']
  },
  {
    stageNumber: '03',
    stageName: 'GATHER',
    hindiTitle: 'स्वीकृति व व्यवस्था',
    headline: 'Collect verified RSVPs and meal choices',
    description: 'Guests confirm their attendance headcount, dietary preferences (Jain, Traditional), and personal wishes directly from their invitation.',
    icon: <Users className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Real-Time Headcount Count', 'Dietary Preferences', 'Instant Host Dashboard']
  },
  {
    stageNumber: '04',
    stageName: 'CELEBRATE',
    hindiTitle: 'विवाह व स्वागत',
    headline: 'Digital entry passes & seamless check-in',
    description: 'On wedding day, guests present their royal digital entry pass at the venue gates for rapid, tamper-proof QR check-in by your coordinators.',
    icon: <QrCode className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Digital Gate Pass with QR', 'Instant Headcount Check-in', 'Duplicate Entry Blocked']
  }
];

export const RoyalJourneyWorkflow: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>THE DIGITAL WEDDING JOURNEY</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          PREPARE · INVITE · GATHER · CELEBRATE
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-2xl mx-auto leading-relaxed">
          A wedding is not a software workflow — it is a sacred sequence of moments. AmantranLink connects every stage from your first draft to the wedding reception gates.
        </p>
      </div>

      {/* 4-Stage Asymmetric Journey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {JOURNEY_STAGES.map((stage) => (
          <div
            key={stage.stageNumber}
            className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(67,9,20,0.05)] hover:shadow-[0_12px_32px_-6px_rgba(67,9,20,0.12)] flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] flex items-center justify-center shadow-xs">
                  {stage.icon}
                </div>
                <div className="text-right">
                  <span className="font-cormorant font-bold text-2xl text-[#C49A35] block leading-none">
                    {stage.stageNumber}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#75675C]">
                    STAGE
                  </span>
                </div>
              </div>

              {/* Stage Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-cormorant font-bold text-xl text-[#6E1020] tracking-wide">
                    {stage.stageName}
                  </h3>
                  <span className="text-xs text-[#C49A35] font-medium font-cormorant">
                    ({stage.hindiTitle})
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#241A17] leading-snug pt-0.5">
                  {stage.headline}
                </h4>
                <p className="text-xs text-[#241A17]/75 font-normal leading-relaxed pt-2">
                  {stage.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="pt-3 border-t border-[#E8D5AD]/40 space-y-1.5">
                {stage.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-[#75675C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Footer Tag */}
            <div className="text-[10px] font-mono text-[#75675C] uppercase tracking-wider font-semibold pt-4 border-t border-[#E8D5AD]/60 mt-5">
              Stage {stage.stageNumber} of 04
            </div>
          </div>
        ))}
      </div>

      {/* Action CTA */}
      <div className="text-center mt-12">
        <button
          type="button"
          onClick={onEnterStudio}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] transition-all cursor-pointer hover:scale-105"
        >
          <span>BEGIN YOUR WEDDING JOURNEY</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </section>
  );
};

export default RoyalJourneyWorkflow;
