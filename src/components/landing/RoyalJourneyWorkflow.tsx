import React from 'react';
import { 
  Layers, Send, Users, QrCode, 
  ArrowRight, Sparkles, Check 
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
    stageName: 'Prepare',
    hindiTitle: 'सृजन व मुहूर्त',
    headline: 'Curate your royal wedding invitation',
    description: 'Select your palace architectural theme, add couple names in English, हिन्दी, or ગુજરાતી, set auspicious muhurats, and embed Google Maps navigation.',
    icon: <PalaceGateIcon className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['7 Masterwork Royal Themes', 'Trilingual Vedic Shlokas', '1-Tap Google Maps GPS Directions']
  },
  {
    stageNumber: '02',
    stageName: 'Invite',
    hindiTitle: 'निमंत्रण व संदेश',
    headline: 'Send personalized links to each family',
    description: 'Every family receives an individual personalized link. When opened, the invitation greets them respectfully with their family name and shehnai music.',
    icon: <Send className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Unique WhatsApp Guest Tokens', 'Ceremonial Shehnai Audio', 'Zero Spam / Tamper-Proof Access']
  },
  {
    stageNumber: '03',
    stageName: 'Gather',
    hindiTitle: 'स्वीकृति व व्यवस्था',
    headline: 'Collect verified RSVPs and meal choices',
    description: 'Guests confirm attendance headcounts, dietary choices (Jain, Traditional), and personal wishes directly from their digital invitation.',
    icon: <Users className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Real-Time Headcount Counter', 'Dietary Preference Collection', 'Instant Couple & Family Dashboard']
  },
  {
    stageNumber: '04',
    stageName: 'Celebrate',
    hindiTitle: 'विवाह व स्वागत',
    headline: 'Digital entry passes & seamless check-in',
    description: 'On the wedding day, guests present their royal digital entry pass at the venue gates for rapid, tamper-proof QR check-in by your coordinators.',
    icon: <QrCode className="w-5 h-5 text-[#C49A35]" />,
    highlights: ['Digital Gate Pass with QR', 'Instant Headcount Check-in', 'Duplicate Entry Blocked']
  }
];

export const RoyalJourneyWorkflow: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>FROM FIRST DRAFT TO PALACE GATES</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          Your Digital Wedding in 4 Simple Steps
        </h2>

        <p className="text-base sm:text-lg text-[#6E1020] font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          A wedding is not software — it is a sacred sequence of moments. AmantranLink connects every stage seamlessly from your first draft to the wedding reception gates.
        </p>
      </div>

      {/* 4-Stage Asymmetric Journey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {JOURNEY_STAGES.map((stage) => (
          <div
            key={stage.stageNumber}
            className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#E8D5AD] hover:border-[#C49A35] transition-all duration-300 shadow-[0_6px_24px_-4px_rgba(67,9,20,0.06)] hover:shadow-[0_14px_36px_-6px_rgba(196,154,53,0.18)] hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-[#E8DCC8]/70 pb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] flex items-center justify-center shadow-xs">
                  {stage.icon}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-2xl text-[#8E6725] block leading-none tabular-nums">
                    {stage.stageNumber}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B1528] font-bold">
                    STEP
                  </span>
                </div>
              </div>

              {/* Stage Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#6E1020] tracking-tight">
                    {stage.stageName}
                  </h3>
                  <span className="text-xs text-[#8B1528] font-bold">
                    ({stage.hindiTitle})
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#6E1020] leading-snug pt-0.5">
                  {stage.headline}
                </h4>
                <p className="text-xs sm:text-[13px] text-[#430914] font-semibold leading-relaxed pt-1.5">
                  {stage.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="pt-3 border-t border-[#E8DCC8]/60 space-y-1.5">
                {stage.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#430914] font-semibold">
                    <Check className="w-3.5 h-3.5 text-[#167A5A] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3">
              <span className="text-[10px] font-mono text-[#8E6725] font-semibold uppercase tracking-wider block">
                ✦ Ready in minutes
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoyalJourneyWorkflow;
