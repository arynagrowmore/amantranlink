import React, { useState } from 'react';
import { 
  PalaceGateIcon, ShehnaiIcon, MuhuratClockIcon, 
  VenueMapPinIcon, RoyalCrestIcon 
} from '../ShahiIcons';
import { Sparkles, ArrowRight, Heart, Share2, Music, Calendar } from 'lucide-react';

interface Stage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlight: string;
}

const STAGES: Stage[] = [
  {
    number: '01',
    title: 'THE ROYAL ENTRANCE',
    subtitle: 'शाही तोरण व 3D महल द्वार',
    description: '3D palace gates welcome your guests with smooth parting doors, royal elephants, and auspicious marigold torans.',
    icon: <PalaceGateIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Immersive first impression on any smartphone or browser',
  },
  {
    number: '02',
    title: 'THE CELEBRATION',
    subtitle: 'मांगलिक प्रसंग व शुभ मुहूर्त',
    description: 'Events, rituals and auspicious moments come alive with precise Vedic muhurats, attire dress codes, and 1-tap Google Maps directions.',
    icon: <MuhuratClockIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Trilingual support in English, हिन्दी, and ગુજરાતી',
  },
  {
    number: '03',
    title: 'THE CONNECTION',
    subtitle: 'शहनाई धुन व पारिवारिक यादें',
    description: 'Music, memories and family details stay together with background shehnai melodies, portrait galleries, and elder blessings.',
    icon: <ShehnaiIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Lossless audio player and private family photo wall',
  },
  {
    number: '04',
    title: 'THE INVITATION',
    subtitle: 'व्हाट्सएप आमंत्रण व लाइव RSVP',
    description: 'Share your royal Kankotri instantly with every guest and track confirmed attendance headcounts in real time.',
    icon: <Share2 className="w-6 h-6 text-[#C49A35]" />,
    highlight: '1-click WhatsApp dispatch & dedicated invitation links',
  },
];

export const ArtOfRoyalInvitation: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>IMMERSIVE DIGITAL CELEBRATION</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          THE ART OF A ROYAL INVITATION
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Traditional Indian wedding aesthetics, brought to life as an unforgettable digital celebration.
        </p>
      </div>

      {/* 4 Interactive Horizontal Progression Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAGES.map((stage, idx) => {
          const isSelected = activeStage === idx;
          return (
            <div
              key={stage.number}
              onClick={() => setActiveStage(idx)}
              className={`p-7 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#FFFDF8] border-[#C49A35] shadow-[0_10px_30px_-5px_rgba(110,16,32,0.15)] ring-1 ring-[#C49A35]/50 scale-[1.02]'
                  : 'bg-[#F8F3E8] border-[#E8D5AD] hover:bg-[#FFFDF8] hover:border-[#C49A35]/60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-center shadow-xs">
                    {stage.icon}
                  </div>
                  <span className="font-cormorant font-bold text-2xl text-[#C49A35]">
                    {stage.number}
                  </span>
                </div>

                <div>
                  <h3 className="font-cormorant font-bold text-xl text-[#6E1020] tracking-wide">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[#C49A35] font-medium pt-0.5">
                    {stage.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#241A17]/80 font-normal leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8D5AD]/60 text-[11px] text-[#75675C] font-medium flex items-center gap-1.5 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
                <span>{stage.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="text-center mt-12">
        <button
          type="button"
          onClick={onEnterStudio}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-manrope font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] transition-all cursor-pointer hover:scale-105"
        >
          <span>EXPERIENCE THE STUDIO</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </section>
  );
};

export default ArtOfRoyalInvitation;
