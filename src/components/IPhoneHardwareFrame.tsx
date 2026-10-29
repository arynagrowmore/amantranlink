import React, { useEffect, useState } from 'react';

interface IPhoneHardwareFrameProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export const IPhoneHardwareFrame: React.FC<IPhoneHardwareFrameProps> = ({
  children,
  scale = 1,
  className = '',
}) => {
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-[366px] sm:w-[380px] h-[750px] max-h-[calc(100vh-110px)] shrink-0 my-auto transition-transform duration-300 select-none ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      {/* 🔘 Physical Titanium Side Buttons (Flush, tactile CNC chamfered edges) */}
      {/* Left: Action Button */}
      <div
        className="absolute -left-[5.5px] top-[102px] w-[3px] h-[17px] bg-[#5C5963] rounded-l-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border-r border-[#2C2A30]"
        title="Action Button"
      />
      {/* Left: Volume Up */}
      <div
        className="absolute -left-[5.5px] top-[134px] w-[3px] h-[35px] bg-[#5C5963] rounded-l-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border-r border-[#2C2A30]"
        title="Volume Up"
      />
      {/* Left: Volume Down */}
      <div
        className="absolute -left-[5.5px] top-[178px] w-[3px] h-[35px] bg-[#5C5963] rounded-l-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border-r border-[#2C2A30]"
        title="Volume Down"
      />

      {/* Right: Side / Power Button */}
      <div
        className="absolute -right-[5.5px] top-[138px] w-[3px] h-[52px] bg-[#5C5963] rounded-r-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border-l border-[#2C2A30]"
        title="Side / Power Button"
      />
      {/* Right: Camera Control Button (iPhone 16 Pro Signature Sapphire Flush Button) */}
      <div
        className="absolute -right-[5px] top-[242px] w-[2.5px] h-[40px] bg-[#434047] rounded-r-[1.5px] shadow-inner border-l border-white/15"
        title="Camera Control Sapphire Button"
      />

      {/* 📡 Polymer Antenna Separation Bands */}
      <div className="absolute -left-[3.5px] top-[74px] w-[2.5px] h-[2px] bg-[#2A292E]" />
      <div className="absolute -left-[3.5px] bottom-[74px] w-[2.5px] h-[2px] bg-[#2A292E]" />
      <div className="absolute -right-[3.5px] top-[74px] w-[2.5px] h-[2px] bg-[#2A292E]" />
      <div className="absolute -right-[3.5px] bottom-[74px] w-[2.5px] h-[2px] bg-[#2A292E]" />

      {/* 👑 Outer Titanium Grade-5 Chassis (Sleek brushed titanium with CNC highlight bevel) */}
      <div className="w-full h-full p-[3.5px] bg-gradient-to-b from-[#58555D] via-[#3C3A40] to-[#2B292F] rounded-[52px] shadow-[0_28px_70px_-10px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.18),0_1px_3px_rgba(255,255,255,0.25)_inset] flex flex-col">
        {/* Ultra-thin Uniform Super Retina XDR Screen Bezel (2.5mm) */}
        <div className="w-full h-full p-[2.5px] bg-black rounded-[49px] flex flex-col overflow-hidden relative">
          
          {/* Micro Ear-Speaker Slit (Recessed at top edge of bezel) */}
          <div className="w-10 h-[2.5px] bg-[#161618] rounded-full mx-auto absolute top-[4px] left-1/2 -translate-x-1/2 z-40 border border-white/5" />

          {/* Full-Bleed Edge-to-Edge Display Glass (True Squircle) */}
          <div className="w-full h-full bg-black rounded-[46.5px] overflow-hidden relative flex flex-col">
            
            {/* 🌫️ Top Ambient Shadow Scrim (Ensures status bar icons stay crisp over light templates) */}
            <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none z-30" />

            {/* 🏝️ Floating iOS Status Bar & Dynamic Island */}
            <div className="absolute top-0 inset-x-0 pt-2.5 px-6 flex items-center justify-between pointer-events-none z-30 select-none">
              {/* Left: Clock */}
              <div className="w-16 flex items-center">
                <span className="text-[12px] font-sans font-semibold tracking-tight text-white/95 pl-1 drop-shadow-sm">
                  {timeStr}
                </span>
              </div>

              {/* Center: Authentic Apple Dynamic Island */}
              <div
                className="w-[108px] h-[26px] bg-black rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.7)] border border-white/[0.08] flex items-center justify-between px-2.5 pointer-events-auto"
                title="Apple Dynamic Island"
              >
                {/* Front Camera Lens with Sapphire Reflection */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#070b14] ring-1 ring-[#1b2538] flex items-center justify-center relative">
                  <div className="w-1 h-1 rounded-full bg-[#1b3a6b]" />
                </div>
                {/* FaceID / Proximity Sensor */}
                <div className="w-2 h-2 rounded-full bg-[#0a0a0c] ring-1 ring-white/5" />
              </div>

              {/* Right: Cellular, 5G, Wi-Fi & Battery */}
              <div className="w-16 flex items-center justify-end gap-1.5 text-white/90 pr-1 drop-shadow-sm">
                {/* Cellular Signal Bars */}
                <svg className="w-3.5 h-2.5" viewBox="0 0 16 12" fill="currentColor">
                  <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
                  <rect x="4.5" y="5.5" width="2.5" height="6.5" rx="0.5" />
                  <rect x="9" y="3" width="2.5" height="9" rx="0.5" />
                  <rect x="13.5" y="0.5" width="2.5" height="11.5" rx="0.5" />
                </svg>

                {/* 5G Label */}
                <span className="text-[9px] font-sans font-extrabold tracking-tight">5G</span>

                {/* Battery Pill */}
                <div className="w-[20px] h-[10.5px] rounded-[3px] border-[1.2px] border-white/90 p-[1.5px] flex items-center relative">
                  {/* Green Battery Juice */}
                  <div className="h-full w-[85%] bg-[#34C759] rounded-[1.5px]" />
                  {/* Battery Terminal Bump */}
                  <div className="w-[1.5px] h-[4px] bg-white/90 rounded-r-xs absolute -right-[2.5px] top-[2px]" />
                </div>
              </div>
            </div>

            {/* 🖥️ Iframe Viewport (Full Bleed Edge-to-Edge) */}
            <div className="w-full h-full bg-white overflow-hidden relative">
              {children}
            </div>

            {/* 🌫️ Bottom Ambient Scrim for Home Indicator */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none z-30" />

            {/* 📱 Floating iOS Home Gesture Indicator Bar */}
            <div className="w-32 h-[4px] bg-white/80 backdrop-blur-md rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.4)] pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-30" />

            {/* ✨ Ultra-subtle Diagonal Screen Glare */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06] rounded-[46.5px] z-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPhoneHardwareFrame;
