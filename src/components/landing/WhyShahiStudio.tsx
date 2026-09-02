import React from 'react';
import { 
  PalaceGateIcon, ShehnaiIcon, MuhuratClockIcon, 
  VenueMapPinIcon, DiyaIcon, RoyalCrestIcon 
} from '../ShahiIcons';
import { 
  Users, Image as ImageIcon, Sparkles, MapPin, 
  Share2, ShieldCheck, Heart 
} from 'lucide-react';

interface Differentiator {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    title: '3D ROYAL ENTRANCE',
    subtitle: 'शाही 3D द्वार व भव्य प्रवेश',
    description: 'A cinematic palace-style opening where golden gates part smoothly upon scroll, welcoming guests into your celebration.',
    icon: <PalaceGateIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'LIVE GUEST RSVP',
    subtitle: 'रियल-टाइम उपस्थिति व गिनती',
    description: 'Know who is attending in real time with exact headcounts, dietary choices, and warm family blessings in your private dashboard.',
    icon: <Users className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'PERSONAL PHOTO GALLERY',
    subtitle: 'शाही फोटो व प्री-वेडिंग यादें',
    description: 'Upload and curate your pre-wedding portraits and family memories with elegant royal golden framing.',
    icon: <ImageIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'SHEHNAI & FLUTE AUDIO',
    subtitle: 'मांगलिक शहनाई व स्वागत संगीत',
    description: 'Bring traditional auspicious wedding melodies or your own family song into every guest’s phone with a lossless audio player.',
    icon: <ShehnaiIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: '1-TAP GPS NAVIGATION',
    subtitle: 'गूगल मैप्स व दिशा-निर्देश',
    description: 'Guests reach every ceremony venue directly with 1-tap Google Maps route integration, eliminating travel confusion.',
    icon: <VenueMapPinIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'WHATSAPP READY',
    subtitle: 'व्हाट्सएप आमंत्रण व त्वरित शेयर',
    description: 'Share your royal invitation cards with rich OpenGraph previews and personalized guest names in 1 click.',
    icon: <Share2 className="w-6 h-6 text-[#C49A35]" />,
  },
];

export const WhyShahiStudio: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-manrope">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase">
          <RoyalCrestIcon className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>HANDCRAFTED ROYAL CRAFTSMANSHIP</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          WHY AMANTRANLINK
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Traditional Indian heritage aesthetics combined with refined digital precision for your family's biggest celebration.
        </p>
      </div>

      {/* 6 Minimalist Luxury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {DIFFERENTIATORS.map((item, idx) => (
          <div
            key={idx}
            className="p-7 sm:p-8 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(67,9,20,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(67,9,20,0.1)] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] flex items-center justify-center shadow-xs">
                {item.icon}
              </div>

              <div>
                <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#6E1020] tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs text-[#C49A35] font-medium pt-0.5">
                  {item.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#241A17]/80 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-5 border-t border-[#E8D5AD]/60 text-[11px] text-[#75675C] font-medium flex items-center gap-1.5 mt-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Standard in all AmantranLink invitations</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyShahiStudio;
