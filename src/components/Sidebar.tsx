import React from 'react';
import { 
  Palette, Heart, Calendar, MapPin, 
  Image as ImageIcon, Music, Users, 
  Sparkles, Download, Check
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';

export interface StepItem {
  id: string;
  num: string;
  label: string;
  sub: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WEDDING_STUDIO_STEPS: StepItem[] = [
  { id: 'theme', num: '01', label: 'Theme', sub: 'शैली', desc: "Your invitation's character", icon: Palette },
  { id: 'couple', num: '02', label: 'Couple', sub: 'दूल्हा-दुल्हन', desc: 'The names at its heart', icon: Heart },
  { id: 'events', num: '03', label: 'Events', sub: 'शुभ अवसर', desc: 'The moments to remember', icon: Calendar },
  { id: 'venue', num: '04', label: 'Venue', sub: 'स्थान', desc: 'Where celebration unfolds', icon: MapPin },
  { id: 'media', num: '05', label: 'Photos', sub: 'शाही फोटो', desc: 'Photographs & moments', icon: ImageIcon },
  { id: 'music', num: '06', label: 'Music', sub: 'संगीत', desc: 'The sound of evening', icon: Music },
  { id: 'rsvp', num: '07', label: 'QR & Story', sub: 'मेहमान व पास', desc: 'Family & guest hospitality', icon: Users },
  { id: 'review', num: '08', label: 'Preview', sub: 'अंतिम दर्शन', desc: 'Ready to share', icon: Sparkles },
];

export const ENGAGEMENT_STUDIO_STEPS: StepItem[] = [
  { id: 'theme', num: '01', label: 'Theme', sub: 'शैली', desc: "Your invitation's character", icon: Palette },
  { id: 'couple', num: '02', label: 'Couple', sub: 'युगल विवरण', desc: 'The names at its heart', icon: Heart },
  { id: 'events', num: '03', label: 'Events', sub: 'सगाई प्रसंग', desc: 'The moments to remember', icon: Calendar },
  { id: 'venue', num: '04', label: 'Venue', sub: 'स्थान', desc: 'Where celebration unfolds', icon: MapPin },
  { id: 'media', num: '05', label: 'Photos', sub: 'सगाई फोटो', desc: 'Photographs & moments', icon: ImageIcon },
  { id: 'music', num: '06', label: 'Music', sub: 'उत्सव संगीत', desc: 'The sound of evening', icon: Music },
  { id: 'rsvp', num: '07', label: 'QR & Story', sub: 'मेहमान व पास', desc: 'Family & guest hospitality', icon: Users },
  { id: 'review', num: '08', label: 'Preview', sub: 'पूर्वावलोकन', desc: 'Ready to share', icon: Sparkles },
];

export const STUDIO_STEPS = WEDDING_STUDIO_STEPS;

interface SidebarProps {
  activeTab: string;
  completedTabs: Set<string>;
  onTabChange: (tab: string) => void;
  onOpenDownloadHub?: () => void;
  state?: WeddingProjectState;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  completedTabs, 
  onTabChange,
  onOpenDownloadHub,
  state 
}) => {
  const isEngagement = state?.invitation_type === 'engagement';
  const steps = isEngagement ? ENGAGEMENT_STUDIO_STEPS : WEDDING_STUDIO_STEPS;

  return (
    <nav aria-label="Studio steps" className="bg-[#FFFDF8] border-r border-[#E8D5AD]/60 p-2 sm:p-3 shrink-0 font-manrope select-none flex flex-row lg:flex-col justify-between overflow-x-auto lg:overflow-y-auto w-full lg:w-[175px] h-auto lg:h-full">
      
      {/* Step Sequence Items */}
      <div className="flex flex-row lg:flex-col gap-1.5 w-full">
        {steps.map((step) => {
          const isActive = activeTab === step.id;
          const isCompleted = completedTabs.has(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onTabChange(step.id)}
              className={`px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                isActive
                  ? 'bg-[#6E1020] border-[#C49A35] text-[#FFFDF8] shadow-xs'
                  : isCompleted
                  ? 'bg-[#FFFDF8] border-[#E8D5AD]/60 text-[#241A17] hover:border-[#C49A35]/60 hover:bg-[#FAF6EE]'
                  : 'bg-[#FFFDF8] border-transparent text-[#75675C] hover:border-[#E8D5AD]/60 hover:bg-[#FAF6EE]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`text-[10px] font-mono font-bold tracking-wider shrink-0 ${
                  isActive ? 'text-[#F4D06F]' : isCompleted ? 'text-[#167A5A]' : 'text-[#8C7A73]'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>

                <div className="min-w-0">
                  <span className={`block text-xs font-semibold tracking-wide truncate ${
                    isActive ? 'text-[#FFFDF8] font-bold' : 'text-[#241A17]'
                  }`}>
                    {step.label}
                  </span>
                  <span className={`block text-[9px] font-serif leading-none mt-0.5 truncate ${
                    isActive ? 'text-[#F4D06F]' : 'text-[#8C7A73]'
                  }`}>
                    {step.sub}
                  </span>
                </div>
              </div>

              <Icon className={`w-3.5 h-3.5 shrink-0 hidden sm:block ${
                isActive ? 'text-[#F4D06F]' : 'text-[#A8957F]'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Subtle Bottom Blessing & Asset Download Link */}
      <div className="hidden lg:flex flex-col pt-3 border-t border-[#E8D5AD]/40 mt-3 space-y-2">
        {onOpenDownloadHub && (
          <button
            type="button"
            onClick={onOpenDownloadHub}
            className="text-[11px] font-medium text-[#75675C] hover:text-[#430914] flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <Download className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>4K Assets</span>
          </button>
        )}

        <div className="text-center">
          <span className="text-[9px] font-serif text-[#C49A35] font-semibold tracking-widest block">
            ॥ श्री गणेशाय नमः ॥
          </span>
          <span className="text-[8.5px] font-mono text-[#8C7A73] uppercase tracking-wider block mt-0.5">
            AmantranLink Atelier
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;


