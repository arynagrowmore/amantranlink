import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 🪔 1. Auspicious Diya Lamp Icon (1.5px single-weight line style)
export const DiyaIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2C11 5 9 6 9 8a3 3 0 0 0 6 0c0-2-2-3-3-6Z" fill="#C4522A" fillOpacity="0.25" />
    <path d="M4 14c0 4.418 3.582 8 8 8s8-3.582 8-8H4Z" />
    <line x1="2" y1="14" x2="22" y2="14" />
    <path d="M9 22v-3" />
    <path d="M15 22v-3" />
  </svg>
);

// 🎵 2. Shehnai / Royal Flute Icon
export const ShehnaiIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 21 12.5-12.5" />
    <path d="m15.5 8.5 2-2a2.828 2.828 0 0 1 4 4l-2 2-4-4Z" />
    <circle cx="8" cy="16" r="0.8" fill={color} />
    <circle cx="10.5" cy="13.5" r="0.8" fill={color} />
    <circle cx="13" cy="11" r="0.8" fill={color} />
    <path d="M19 12c1.5 1.5 2.5 3.5 2 5s-3 1.5-4 0" />
    <path d="M3 21c-.5-.5-.5-1.5 0-2l1.5-1.5 2 2L5 21c-.5.5-1.5.5-2 0Z" />
  </svg>
);

// 🏰 3. Royal Palace Gate Icon
export const PalaceGateIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16" />
    <path d="M12 3v18" />
    <path d="M3 10h18" />
    <path d="M7 10v11" />
    <path d="M17 10v11" />
    <path d="M7 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2" />
    <circle cx="10" cy="15" r="0.75" fill={color} />
    <circle cx="14" cy="15" r="0.75" fill={color} />
  </svg>
);

// ⏳ 4. Muhurat Astrological Countdown Clock Icon
export const MuhuratClockIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </svg>
);

// 📍 5. GPS Venue Direction Icon
export const VenueMapPinIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.5" />
    <path d="M9 19h6" strokeOpacity="0.5" />
  </svg>
);

// 💌 6. Wax Stamp Seal Icon
export const WaxStampIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="14" r="7" />
    <path d="M12 7V3" />
    <path d="M9 3h6" />
    <path d="M10 12l2 2 2-2" />
    <path d="M12 14v3" />
  </svg>
);

// 🦚 7. Mayura Peacock Plume Icon
export const PeacockPlumeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 4c-5 1-10 6-12 11-1 2.5-1 5 1 6 2.5 1 5-.5 7-3C19 14 21 8 20 4Z" />
    <circle cx="14" cy="10" r="2.5" fill="#A67C3D" fillOpacity="0.4" />
    <circle cx="14" cy="10" r="1" fill={color} />
  </svg>
);

// 👑 8. Royal Crown Monogram Crest
export const RoyalCrestIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18h18M4 18l2-9 4.5 4L12 6l1.5 7L18 9l2 9H4Z" />
    <circle cx="12" cy="5" r="1" fill={color} />
    <circle cx="6" cy="8" r="1" fill={color} />
    <circle cx="18" cy="8" r="1" fill={color} />
  </svg>
);

// 〰️ 9. Hand-Drawn Indigo Squiggle for Active Filter Tabs (Phase 0/1)
export const IndigoSquiggle: React.FC<{ className?: string }> = ({ className = 'w-16 h-2' }) => (
  <svg viewBox="0 0 60 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 4C10 1 15 7 23 4C31 1 36 7 44 4C50 1 54 6 58 4" stroke="#2C3E5C" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 🔗 10. Connecting Dotted Path for How-It-Works 3-Step Sequence
export const StepConnectorCurve: React.FC<{ className?: string }> = ({ className = 'w-full h-8 hidden md:block' }) => (
  <svg viewBox="0 0 240 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 15 C 60 0, 180 30, 230 15" stroke="#A67C3D" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
    <polygon points="232,15 224,11 224,19" fill="#A67C3D" />
  </svg>
);
