import React from 'react';
import { 
  Palette, Heart, Calendar, MapPin, 
  Image as ImageIcon, Music, Users, 
  Check, Sparkles, Globe, ShieldCheck 
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';

export interface StepItem {
  id: string;
  num: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STUDIO_STEPS: StepItem[] = [
  { id: 'theme', num: '01', label: 'Theme', sub: 'शाही थीम', icon: Palette },
  { id: 'couple', num: '02', label: 'Couple', sub: 'वर-वधू विवरन', icon: Heart },
  { id: 'events', num: '03', label: 'Events', sub: 'शुभ प्रसंग', icon: Calendar },
  { id: 'venue', num: '04', label: 'Venue', sub: 'स्थान व नक्शा', icon: MapPin },
  { id: 'media', num: '05', label: 'Photos', sub: 'शाही फोटो', icon: ImageIcon },
  { id: 'music', num: '06', label: 'Music', sub: 'शहनाई संगीत', icon: Music },
  { id: 'rsvp', num: '07', label: 'RSVP', sub: 'मेहमान निमंत्रण', icon: Users },
  { id: 'review', num: '08', label: 'Review', sub: 'अंतिम पूर्वावलोकन', icon: Sparkles },
];

interface SidebarProps {
  activeTab: string;
  completedTabs: Set<string>;
  onTabChange: (tab: string) => void;
  state?: WeddingProjectState;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  completedTabs, 
  onTabChange,
  state,
}) => {
  const currentStepIndex = STUDIO_STEPS.findIndex((s) => s.id === activeTab);
  const activeStepNum = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const totalSteps = STUDIO_STEPS.length;

  // 🎯 Calculate Dynamic Invitation Readiness Score based on real state data
  let readinessScore = 0;
  if (state) {
    if (state.theme) readinessScore += 10;
    if (state.couple?.groomEn && state.couple?.brideEn) readinessScore += 20;
    if (state.couple?.weddingDate) readinessScore += 15;
    if (state.events && state.events.length > 0) readinessScore += 20;
    if (state.couple?.venueName) readinessScore += 15;
    if (state.media?.photoSlots?.hero?.url) readinessScore += 10;
    if (state.media?.audioUrl || state.media?.bgMusicPreset || state.media?.audioName) readinessScore += 5;
    if (state.rsvpConfig?.enabled !== false) readinessScore += 5;
  } else {
    readinessScore = Math.round((completedTabs.size / totalSteps) * 100);
  }

  const finalReadiness = Math.min(100, Math.max(12, readinessScore));

  return (
    <div className="bg-[#FFFDF8] border-b border-[#E8D5AD] px-3 sm:px-4 py-2.5 shrink-0 font-manrope select-none">
      
      {/* Header Blessing Ribbon & Step Counter */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8D5AD]/60 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-serif text-[#C49A35] font-semibold tracking-wider">
            ॥ श्री गणेशाय नमः ॥
          </span>
          <span className="text-[10px] font-mono text-[#75675C] font-semibold">
            Step {activeStepNum} of {totalSteps}
          </span>
        </div>

        {/* Dynamic Readiness Badge */}
        <div className="flex items-center gap-2">
          <div className="w-24 bg-[#E8D5AD]/50 h-1.5 rounded-full overflow-hidden hidden sm:block">
            <div 
              className="bg-[#C49A35] h-full rounded-full transition-all duration-300"
              style={{ width: `${finalReadiness}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#6E1020] bg-[#F8F3E8] px-2 py-0.5 rounded-full border border-[#E8D5AD] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C49A35]" />
            <span>Readiness: {finalReadiness}%</span>
          </span>
        </div>
      </div>

      {/* Stepper Navigation (Horizontal on All Screens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STUDIO_STEPS.map((step, idx) => {
          const isActive = activeTab === step.id;
          const isCompleted = completedTabs.has(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onTabChange(step.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#6E1020] border-[#C49A35] text-[#FFFDF8] font-bold shadow-xs ring-1 ring-[#C49A35]/50'
                  : isCompleted
                  ? 'bg-[#F8F3E8] border-[#E8D5AD] text-[#430914] hover:border-[#C49A35]/60'
                  : 'bg-[#FFFDF8] border-[#E8D5AD]/60 text-[#75675C] hover:text-[#430914] hover:bg-[#F8F3E8]'
              }`}
            >
              {/* Step Number, Dot, or Checkmark */}
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
                  isActive
                    ? 'bg-[#430914] text-[#C49A35] border-[#C49A35]'
                    : isCompleted
                    ? 'bg-[#167A5A]/15 text-[#167A5A] border-[#167A5A]/40'
                    : 'bg-[#F8F3E8] text-[#75675C] border-[#E8D5AD]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-[#167A5A] stroke-[3]" />
                ) : (
                  <span>{step.num}</span>
                )}
              </div>

              {/* Label & Subtitle */}
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className={`block text-xs font-semibold leading-tight ${
                    isActive ? 'text-[#FFFDF8]' : 'text-[#430914]'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35] animate-ping" />}
                </div>
                <span className={`block text-[9px] font-serif leading-none pt-0.5 ${
                  isActive ? 'text-[#E8D5AD]' : 'text-[#C49A35]'
                }`}>
                  {step.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Sidebar;
