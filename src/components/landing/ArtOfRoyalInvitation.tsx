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
    title: 'The Royal Entrance',
    subtitle: 'शाही तोरण व 3D महल द्वार',
    description: '3D palace gates welcome your guests with smooth parting doors, royal elephants, and auspicious marigold torans.',
    icon: <PalaceGateIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Immersive first impression on any smartphone or browser',
  },
  {
    number: '02',
    title: 'The Auspicious Celebration',
    subtitle: 'मांगलिक प्रसंग व शुभ मुहूर्त',
    description: 'Events, rituals and sacred moments come alive with precise Vedic muhurats, attire dress codes, and 1-tap Google Maps directions.',
    icon: <MuhuratClockIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Trilingual support in English, हिन्दी, and ગુજરાતી',
  },
  {
    number: '03',
    title: 'The Ceremonial Shehnai',
    subtitle: 'शहनाई धुन व पारिवारिक यादें',
    description: 'Music, memories and family details stay together with background shehnai melodies, portrait galleries, and elder blessings.',
    icon: <ShehnaiIcon className="w-6 h-6 text-[#C49A35]" />,
    highlight: 'Lossless audio player and private family photo wall',
  },
  {
    number: '04',
    title: 'The Smart WhatsApp Dispatch',
    subtitle: 'व्हाट्सएप आमंत्रण व लाइव RSVP',
    description: 'Share your royal Kankotri instantly with every guest and track confirmed attendance headcounts in real time.',
    icon: <Share2 className="w-6 h-6 text-[#C49A35]" />,
    highlight: '1-click WhatsApp dispatch & dedicated invitation links',
  },
];

export const ArtOfRoyalInvitation: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>IMMERSIVE DIGITAL CELEBRATION</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A1715] tracking-tight">
          The Art of the Royal Invitation
        </h2>

        <p className="text-sm sm:text-base text-[#5C524B] font-normal max-w-xl mx-auto leading-relaxed">
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
              className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#C49A35] shadow-[0_16px_36px_-6px_rgba(196,154,53,0.18)] -translate-y-1.5'
                  : 'bg-white/80 border-[#E8DCC8] hover:border-[#C49A35]/60 hover:bg-white shadow-2xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DCC8]/70 pb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] flex items-center justify-center shadow-xs">
                    {stage.icon}
                  </div>
                  <span className="font-mono font-bold text-2xl text-[#8E6725] tabular-nums">
                    {stage.number}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1A1715] leading-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[#8E6725] font-semibold pt-1">
                    {stage.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#5C524B] leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DCC8]/70 mt-4">
                <span className="text-[11px] text-[#6E1020] font-semibold flex items-center gap-1">
                  <span>✦</span>
                  <span>{stage.highlight}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct CTA */}
      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={onEnterStudio}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#6E1020] hover:bg-[#520B17] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-105"
        >
          <span>Design Your Invitation Now</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </section>
  );
};

export default ArtOfRoyalInvitation;
