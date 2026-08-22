import React, { useState } from 'react';
import { 
  PalaceGateIcon, ShehnaiIcon, MuhuratClockIcon, 
  VenueMapPinIcon, DiyaIcon, RoyalCrestIcon 
} from '../ShahiIcons';
import { 
  Sparkles, Music, Calendar, MapPin, 
  Users, Share2, CheckCircle2, ArrowRight 
} from 'lucide-react';

interface TimelineStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
  previewNote: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    step: 1,
    title: '3D Palace Gates Open',
    subtitle: 'शाही द्वार व भव्य प्रवेश',
    description: 'Guests are greeted with grand 3D golden palace gates that part open smoothly with elephant procession and auspicious floral torans.',
    tag: '3D Spatial Entry',
    icon: <PalaceGateIcon className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Simulates walking into a royal Jaipur darbar',
  },
  {
    step: 2,
    title: 'Lossless Shehnai & Flute Audio',
    subtitle: 'मांगलिक शहनाई व स्वागत धुन',
    description: 'Autoplays traditional live Vedic wedding chimes or your chosen family song, bringing sacred celebration atmosphere to every guest’s phone.',
    tag: 'Auspicious Audio',
    icon: <ShehnaiIcon className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Interactive floating golden music player with mute toggle',
  },
  {
    step: 3,
    title: 'Events, Muhurat & Live Countdown',
    subtitle: 'शुभ मुहूर्त, फेरे व रस्में',
    description: 'Every ritual (Ganesh Sthapna, Mehendi, Sangeet, Baarat, Pheras) displayed with precise Vedic timings, dress codes, and 4-box live timer.',
    tag: 'Sacred Rituals',
    icon: <MuhuratClockIcon className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Trilingual Vivah Engine (English, हिन्दी, ગુજરાતી)',
  },
  {
    step: 4,
    title: '1-Tap GPS Venue Navigation',
    subtitle: 'गूगल मैप्स व दिशा-निर्देश',
    description: 'Direct 1-tap Google Maps integration so out-of-town guests navigate straight to palace gates without calling you on your wedding day.',
    tag: 'Zero Guest Confusion',
    icon: <VenueMapPinIcon className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Embedded Google Maps pin for all ceremonies',
  },
  {
    step: 5,
    title: 'Live Guest RSVP Collection',
    subtitle: 'उपस्थिति पुष्टि व शुभकामनाएँ',
    description: 'Collect confirmed headcounts, dietary requirements, and personal blessings directly into your secure couple dashboard with instant CSV download.',
    tag: 'Live Headcount Tracking',
    icon: <Users className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Saves ₹40,000+ in unnecessary catering wastage',
  },
  {
    step: 6,
    title: 'Instant WhatsApp Dispatch & Golden QR',
    subtitle: 'व्हाट्सएप आमंत्रण व क्यूआर कोड',
    description: 'Send beautifully formatted WhatsApp cards with high-definition OpenGraph previews and personalized guest names in 1 click.',
    tag: '1-Click Distribution',
    icon: <Share2 className="w-6 h-6 text-[#C9A227]" />,
    previewNote: 'Includes high-res printable 24K Gold QR for gift boxes',
  },
];

export const RoyalFeatureTimeline: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-hanken relative">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDE0C8] border border-[#C9A227]/60 text-[#741526] text-xs font-fraunces font-bold tracking-wider shadow-xs uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>CINEMATIC ROYAL TIMELINE</span>
        </div>

        <h2 className="font-fraunces font-black text-3xl sm:text-5xl text-[#741526] tracking-tight">
          THE COMPLETE ROYAL GUEST JOURNEY
        </h2>

        <p className="text-sm sm:text-base text-[#2B1714]/80 font-medium max-w-xl mx-auto leading-relaxed">
          From the instant your invitation link opens to the sacred final pheras, explore the 6 moments that make Shahi Studio invitations unforgettable.
        </p>
      </div>

      {/* Interactive 6-Step Vertical & Grid Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step Navigation Pill List (Left on Desktop) */}
        <div className="lg:col-span-5 space-y-3">
          {TIMELINE_STEPS.map((stepItem) => {
            const isSelected = activeStep === stepItem.step;
            return (
              <div
                key={stepItem.step}
                onClick={() => setActiveStep(stepItem.step)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-4 ${
                  isSelected
                    ? 'bg-[#741526] text-[#F7F0DF] border-[#C9A227] shadow-lg scale-[1.02]'
                    : 'bg-[#FAF7F2] text-[#2B1714] border-[#D8C7AA] hover:bg-[#EDE0C8]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-fraunces font-bold text-sm shrink-0 ${
                  isSelected
                    ? 'bg-[#500E1A] text-[#C9A227] border border-[#C9A227]'
                    : 'bg-[#EDE0C8] text-[#741526] border border-[#D8C7AA]'
                }`}>
                  0{stepItem.step}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-fraunces font-bold text-sm truncate">
                      {stepItem.title}
                    </h4>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#500E1A] text-[#C9A227]' : 'text-[#8B7358]'
                    }`}>
                      {stepItem.tag}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${isSelected ? 'text-[#F7F0DF]/80' : 'text-[#8B7358]'}`}>
                    {stepItem.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Deep Presentation (Right on Desktop) */}
        <div className="lg:col-span-7">
          {(() => {
            const current = TIMELINE_STEPS.find((s) => s.step === activeStep) || TIMELINE_STEPS[0];
            return (
              <div className="palace-bezel">
                <div className="palace-bezel-inner p-7 sm:p-10 space-y-6 bg-[#FFFDF9]">
                  
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between border-b border-[#D8C7AA]/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#741526] border border-[#C9A227] flex items-center justify-center shadow-md">
                        {current.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C9A227]">
                          STAGE 0{current.step} OF 06
                        </span>
                        <h3 className="font-fraunces font-black text-2xl text-[#741526]">
                          {current.title}
                        </h3>
                      </div>
                    </div>

                    <span className="stamped-label text-[#741526] bg-[#EDE0C8] px-3 py-1 rounded-full border border-[#D8C7AA]">
                      {current.tag}
                    </span>
                  </div>

                  <p className="font-serif italic text-sm text-[#8B7358]">
                    {current.subtitle}
                  </p>

                  <p className="text-sm sm:text-base text-[#2B1714] font-medium leading-relaxed">
                    {current.description}
                  </p>

                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#C9A227]/40 flex items-center gap-3 text-xs text-[#500E1A]">
                    <Sparkles className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>
                      <strong>Royal Advantage:</strong> {current.previewNote}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => (prev % 6) + 1)}
                      className="text-xs font-fraunces font-bold text-[#741526] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Next Stage ({((activeStep % 6) + 1)})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={onEnterStudio}
                      className="px-5 py-2.5 rounded-xl bg-[#741526] hover:bg-[#500E1A] text-[#F7F0DF] font-fraunces font-bold text-xs shadow-md border border-[#C9A227] transition-all cursor-pointer"
                    >
                      Start Customizing
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </section>
  );
};
