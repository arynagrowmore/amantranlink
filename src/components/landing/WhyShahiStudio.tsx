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
    title: '3D Palace Gateway Reveal',
    subtitle: 'शाही 3D द्वार व भव्य प्रवेश',
    description: 'A cinematic royal entrance where sculpted palace gates part smoothly upon scroll, welcoming guests into your celebration with grandeur.',
    icon: <PalaceGateIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'Real-Time Guest RSVP',
    subtitle: 'रियल-टाइम उपस्थिति व गिनती',
    description: 'Know who is attending in real time with exact headcounts, dietary choices, and warm family blessings organized in your private dashboard.',
    icon: <Users className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'Curated Portrait Gallery',
    subtitle: 'शाही फोटो व प्री-वेडिंग यादें',
    description: 'Curate your pre-wedding portraits and family moments with royal golden frames, lossless compression, and custom photo filter effects.',
    icon: <ImageIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'Ceremonial Shehnai & Flute Audio',
    subtitle: 'मांगलिक शहनाई व स्वागत संगीत',
    description: 'Traditional auspicious wedding ragas or your own family song playing automatically on tap with high-fidelity lossless web audio.',
    icon: <ShehnaiIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: '1-Tap GPS Venue Navigation',
    subtitle: 'गूगल मैप्स व दिशा-निर्देश',
    description: 'Guests reach every celebration venue directly with 1-tap Google Maps directions, eliminating travel confusion on the wedding day.',
    icon: <VenueMapPinIcon className="w-6 h-6 text-[#C49A35]" />,
  },
  {
    title: 'WhatsApp Smart Link Dispatch',
    subtitle: 'व्हाट्सएप आमंत्रण व त्वरित शेयर',
    description: 'Share your invitation with rich OpenGraph cards and personalized guest names in 1 click, delivering directly to every family’s WhatsApp.',
    icon: <Share2 className="w-6 h-6 text-[#C49A35]" />,
  },
];

export const WhyShahiStudio: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
          <RoyalCrestIcon className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>HANDCRAFTED ROYAL CRAFTSMANSHIP</span>
        </div>

        <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          Why Modern Families Choose AmantranLink
        </h2>

        <p className="text-base sm:text-lg text-[#1A1412] font-semibold max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          Traditional Indian heritage aesthetics combined with refined digital precision for your family&apos;s biggest celebration.
        </p>
      </div>

      {/* 6 Minimalist Luxury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {DIFFERENTIATORS.map((item, idx) => (
          <div
            key={idx}
            className="p-7 sm:p-8 rounded-2xl bg-white border-2 border-[#E8D5AD] hover:border-[#C49A35] transition-all duration-300 shadow-[0_6px_24px_-4px_rgba(67,9,20,0.06)] hover:shadow-[0_14px_36px_-6px_rgba(196,154,53,0.18)] hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] flex items-center justify-center shadow-xs">
                {item.icon}
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1412] tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#8B1528] font-bold pt-1">
                  {item.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#1A1412] font-semibold leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-5 border-t border-[#E8DCC8]/70 text-xs text-[#065F46] font-bold flex items-center gap-1.5 mt-4">
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
