import React from 'react';
import { 
  Layers, Users, Image as ImageIcon, 
  Globe, Share2, ArrowRight, Sparkles 
} from 'lucide-react';
import { RoyalCrestIcon } from '../ShahiIcons';

interface Step {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'CHOOSE YOUR ROYAL THEME',
    subtitle: '7 शाही टेम्पलेट्स',
    desc: 'Select from 7 authentic palace architectural masterworks with 3D gates and royal motifs.',
    icon: <Layers className="w-5 h-5 text-[#C49A35]" />,
  },
  {
    num: '02',
    title: 'CUSTOMIZE YOUR WEDDING DETAILS',
    subtitle: 'वर-वधू व शुभ मुहूर्त',
    desc: 'Add couple names in English, हिन्दी, or ગુજરાતી, wedding dates, and Google Map locations.',
    icon: <Users className="w-5 h-5 text-[#C49A35]" />,
  },
  {
    num: '03',
    title: 'UPLOAD YOUR PHOTOS & MUSIC',
    subtitle: 'शाही फोटो व संगीत',
    desc: 'Upload your pre-wedding portraits and auspicious shehnai melodies or family songs.',
    icon: <ImageIcon className="w-5 h-5 text-[#C49A35]" />,
  },
  {
    num: '04',
    title: 'PUBLISH YOUR KANKOTRI',
    subtitle: 'लाइव आमंत्रण निर्माण',
    desc: 'One-click publish generates a fast custom invitation link with permanent cloud hosting.',
    icon: <Globe className="w-5 h-5 text-[#C49A35]" />,
  },
  {
    num: '05',
    title: 'SHARE & TRACK RSVPs',
    subtitle: 'व्हाट्सएप शेयर व लाइव RSVP',
    desc: 'Send rich WhatsApp cards to family and track confirmed guest headcounts in real time.',
    icon: <Share2 className="w-5 h-5 text-[#C49A35]" />,
  },
];

export const RoyalJourneyWorkflow: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>FIVE EFFORTLESS STEPS</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          YOUR ROYAL KANKOTRI IN 5 SIMPLE STEPS
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          From selection to guest distribution in five effortless steps.
        </p>
      </div>

      {/* Visual Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {STEPS.map((step, idx) => (
          <div
            key={step.num}
            className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(67,9,20,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(67,9,20,0.1)] flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Number Badge & Icon */}
              <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] flex items-center justify-center shadow-xs">
                  {step.icon}
                </div>
                <span className="font-cormorant font-bold text-2xl text-[#C49A35]">
                  {step.num}
                </span>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1">
                <h3 className="font-cormorant font-bold text-lg text-[#6E1020] leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-[#C49A35] font-medium">
                  {step.subtitle}
                </p>
                <p className="text-xs text-[#241A17]/80 font-normal leading-relaxed pt-1">
                  {step.desc}
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="text-[10px] font-mono text-[#75675C] uppercase tracking-wider font-semibold pt-4 border-t border-[#E8D5AD]/60 mt-4">
              Step {idx + 1} of 5
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
          <span>CREATE MY KANKOTRI</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </section>
  );
};

export default RoyalJourneyWorkflow;
