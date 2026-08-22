import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Volume2, VolumeX, MapPin, Calendar, 
  ChevronRight, ArrowRight
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { DiyaIcon, RoyalCrestIcon, PalaceGateIcon } from './ShahiIcons';

interface InteractiveHeroGateProps {
  state?: WeddingProjectState;
  onOpenStudio?: (theme?: string) => void;
}

export const InteractiveHeroGate: React.FC<InteractiveHeroGateProps> = ({ state, onOpenStudio }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Couple Data (Preserved directly from state)
  const brideName = state?.couple?.brideEn || 'Shreya';
  const groomName = state?.couple?.groomEn || 'Dhruv';
  const weddingDate = state?.couple?.weddingDate || '3 December 2026';
  const venueName = state?.couple?.venueName || 'The Milestone Palace, Himmatnagar';
  const coupleMonogram = state?.couple?.mark || `${groomName.charAt(0)} · ${brideName.charAt(0)}`;
  const hashtag = state?.couple?.hashtag || `#${groomName}Ki${brideName}`;

  // Cinematic initial gate entrance opening
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Multi-layer 3D cursor parallax physics (Desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10; // -5deg to +5deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] sm:max-w-[620px] lg:max-w-[680px] xl:max-w-[720px] mx-auto select-none py-2 sm:py-6"
    >
      {/* 🌟 1. GRAND AMBER GOD-RAYS & RADIANT PALACE AURA */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[680px] h-[720px] bg-gradient-to-tr from-[#D4AF37]/35 via-[#FFB84D]/35 to-[#E8DEC8]/25 rounded-full blur-3xl pointer-events-none -z-10 transition-opacity duration-1000"
        style={{ opacity: isOpen ? 1 : 0.5 }}
      ></div>

      {/* Floating Gold Sparkles & Petal Dust Shower */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5">
        {[
          { top: '15%', left: '10%', delay: '0s', duration: '6s', size: 'w-2 h-2', color: 'bg-[#FFD700]' },
          { top: '25%', left: '85%', delay: '1.5s', duration: '7s', size: 'w-1.5 h-1.5', color: 'bg-[#E6CA85]' },
          { top: '60%', left: '8%', delay: '3s', duration: '8s', size: 'w-2.5 h-2.5', color: 'bg-[#C89D3C]' },
          { top: '75%', left: '90%', delay: '0.8s', duration: '5.5s', size: 'w-2 h-2', color: 'bg-[#E63946]' },
          { top: '40%', left: '92%', delay: '2.2s', duration: '6.5s', size: 'w-1.5 h-1.5', color: 'bg-[#FFD700]' },
        ].map((sparkle, idx) => (
          <div 
            key={idx}
            className={`absolute ${sparkle.size} ${sparkle.color} rounded-full blur-[0.5px] opacity-75 animate-pulse`}
            style={{
              top: sparkle.top,
              left: sparkle.left,
              animationDuration: sparkle.duration,
              animationDelay: sparkle.delay,
              transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
            }}
          ></div>
        ))}
      </div>

      {/* 👑 2. THREE FLOATING LUXURY ORNAMENTAL BADGES (Heritage Editorial Plaques) */}
      
      {/* Plaque 1 (Top Left): 3D ROYAL ENTRANCE */}
      <div 
        className="hidden sm:flex absolute -left-8 top-12 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FAF6EE]/95 backdrop-blur-md border-2 border-[#C89D3C] shadow-[0_14px_35px_-6px_rgba(180,140,60,0.35)] z-40 pointer-events-none animate-bounce duration-1000"
        style={{ transform: `translate3d(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px, 0)` }}
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#7E1827] to-[#4A0C14] text-[#E6CA85] flex items-center justify-center text-xs shadow-md border border-[#C89D3C]/60">
          <PalaceGateIcon className="w-4 h-4 text-[#E6CA85]" />
        </div>
        <div>
          <span className="text-[10px] font-fraunces font-black text-[#6B1420] block leading-tight">
            3D ROYAL ENTRANCE
          </span>
          <span className="text-[8.5px] font-sans font-bold text-[#8B7355]">
            Physical Palace Gates
          </span>
        </div>
      </div>

      {/* Plaque 2 (Top Right): SHEHNAI AUDIO */}
      <div 
        className="hidden sm:flex absolute -right-8 top-24 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FAF6EE]/95 backdrop-blur-md border-2 border-[#C89D3C] shadow-[0_14px_35px_-6px_rgba(180,140,60,0.35)] z-40 pointer-events-auto cursor-pointer group hover:border-[#6B1420] transition-all"
        onClick={() => setIsPlayingMusic(!isPlayingMusic)}
        style={{ transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 0)` }}
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#7E1827] to-[#4A0C14] text-[#E6CA85] flex items-center justify-center text-xs shadow-md border border-[#C89D3C]/60">
          {isPlayingMusic ? <Volume2 className="w-4 h-4 text-[#E6CA85] animate-pulse" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
        </div>
        <div>
          <span className="text-[10px] font-fraunces font-black text-[#6B1420] block leading-tight">
            SHEHNAI AUDIO
          </span>
          <span className="text-[8.5px] font-sans font-bold text-[#8B7355] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            {isPlayingMusic ? 'Live Flute & Shehnai' : 'Muted'}
          </span>
        </div>
      </div>

      {/* Plaque 3 (Bottom Left): 1-TAP GPS VENUE */}
      <div 
        className="hidden sm:flex absolute -left-6 bottom-28 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FAF6EE]/95 backdrop-blur-md border-2 border-[#C89D3C] shadow-[0_14px_35px_-6px_rgba(180,140,60,0.35)] z-40 pointer-events-none"
        style={{ transform: `translate3d(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px, 0)` }}
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#7E1827] to-[#4A0C14] text-[#E6CA85] flex items-center justify-center text-xs shadow-md border border-[#C89D3C]/60">
          <MapPin className="w-4 h-4 text-[#E6CA85]" />
        </div>
        <div>
          <span className="text-[10px] font-fraunces font-black text-[#6B1420] block leading-tight">
            1-TAP GPS ROUTE
          </span>
          <span className="text-[8.5px] font-sans font-bold text-[#8B7355]">
            Direct Guest Navigation
          </span>
        </div>
      </div>

      {/* 🦚 3. LEFT & RIGHT ROYAL PEACOCKS (THE MAYURA GUARDIANS) */}
      
      {/* Left Peacock Perched on Carved Bracket */}
      <div 
        className="hidden md:flex absolute -left-10 top-36 z-35 flex-col items-center pointer-events-none transition-transform duration-700"
        style={{ transform: `translate3d(${mousePos.x * -1.8}px, ${mousePos.y * -1.8}px, 0) scale(${isOpen ? 1.05 : 1})` }}
      >
        <div className="w-16 h-28 bg-gradient-to-b from-[#0F4C81] via-[#1D7874] to-[#C89D3C] rounded-t-full rounded-bl-3xl border-2 border-[#E6CA85] shadow-xl p-1.5 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-4 h-4 rounded-full bg-[#E6CA85] border border-[#0F4C81] flex items-center justify-center text-[8px] font-black text-[#0F4C81]">
            🦚
          </div>
          {/* Shimmering Feather Pattern */}
          <div className="space-y-1 my-auto">
            <div className="w-3.5 h-3.5 mx-auto rounded-full bg-[#00A896] border border-[#FFD700] shadow-[0_0_8px_#00A896]"></div>
            <div className="w-4 h-4 mx-auto rounded-full bg-[#028090] border border-[#FFD700] shadow-[0_0_8px_#028090]"></div>
            <div className="w-4.5 h-4.5 mx-auto rounded-full bg-[#05668D] border border-[#FFD700] shadow-[0_0_8px_#05668D]"></div>
          </div>
          <span className="text-[7.5px] font-fraunces font-black text-[#FAF6EE] tracking-tighter">MAYURA</span>
        </div>
        {/* Carved Stone Bracket Base */}
        <div className="w-12 h-3.5 bg-gradient-to-b from-[#C5A869] to-[#8A6526] rounded-b-lg border border-[#8A6526] shadow-md"></div>
      </div>

      {/* Right Peacock Perched on Carved Bracket */}
      <div 
        className="hidden md:flex absolute -right-10 top-36 z-35 flex-col items-center pointer-events-none transition-transform duration-700"
        style={{ transform: `translate3d(${mousePos.x * 1.8}px, ${mousePos.y * 1.8}px, 0) scale(${isOpen ? 1.05 : 1})` }}
      >
        <div className="w-16 h-28 bg-gradient-to-b from-[#0F4C81] via-[#1D7874] to-[#C89D3C] rounded-t-full rounded-br-3xl border-2 border-[#E6CA85] shadow-xl p-1.5 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-4 h-4 rounded-full bg-[#E6CA85] border border-[#0F4C81] flex items-center justify-center text-[8px] font-black text-[#0F4C81]">
            🦚
          </div>
          {/* Shimmering Feather Pattern */}
          <div className="space-y-1 my-auto">
            <div className="w-3.5 h-3.5 mx-auto rounded-full bg-[#00A896] border border-[#FFD700] shadow-[0_0_8px_#00A896]"></div>
            <div className="w-4 h-4 mx-auto rounded-full bg-[#028090] border border-[#FFD700] shadow-[0_0_8px_#028090]"></div>
            <div className="w-4.5 h-4.5 mx-auto rounded-full bg-[#05668D] border border-[#FFD700] shadow-[0_0_8px_#05668D]"></div>
          </div>
          <span className="text-[7.5px] font-fraunces font-black text-[#FAF6EE] tracking-tighter">MAYURA</span>
        </div>
        {/* Carved Stone Bracket Base */}
        <div className="w-12 h-3.5 bg-gradient-to-b from-[#C5A869] to-[#8A6526] rounded-b-lg border border-[#8A6526] shadow-md"></div>
      </div>

      {/* 🏛️ 4. FULL-BLEED 3D STANDALONE ARCHITECTURAL PALACE GATE MONUMENT */}
      <div 
        className="relative w-full aspect-[4/5.2] rounded-t-[160px] sm:rounded-t-[200px] rounded-b-3xl overflow-hidden shadow-[0_45px_100px_-20px_rgba(70,25,10,0.55),0_15px_35px_rgba(0,0,0,0.2)] border-4 sm:border-[5px] border-[#C89D3C] transition-transform duration-500 ease-out bg-[#FDFBF7]"
        style={{
          transform: `perspective(1200px) rotateY(${mousePos.x * 0.6}deg) rotateX(${mousePos.y * 0.6}deg)`,
        }}
      >
        {/* 🌼 SWAYING MARIGOLD FESTOONS (GENDA PHOOL TORAN) ACROSS THE ARCH */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FAF0DC] via-[#FAF6EE]/95 to-transparent z-30 pointer-events-none flex flex-col items-center pt-3 border-b-2 border-[#C89D3C]/40">
          
          {/* Hanging Marigold Balls Garlands */}
          <div className="w-full flex items-center justify-around px-6 -mt-1">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center transition-transform duration-1000"
                style={{
                  transform: `translateY(${Math.sin(i * 0.8) * 4}px) rotate(${Math.sin(i + mousePos.x * 0.1) * 6}deg)`,
                }}
              >
                <div className="w-0.5 h-3 bg-[#A67C3D]/60"></div>
                <div className={`w-3.5 h-3.5 rounded-full ${i % 2 === 0 ? 'bg-[#FF9F1C] border border-[#FFD700]' : 'bg-[#E63946] border border-[#FAF6EE]'} shadow-sm flex items-center justify-center text-[6px]`}>
                  ✿
                </div>
              </div>
            ))}
          </div>

          {/* Central Sacred Crest */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7E1827] to-[#4A0C14] border-2 border-[#C89D3C] flex items-center justify-center shadow-lg mt-1 text-[#E6CA85]">
            <DiyaIcon className="w-5 h-5 text-[#E6CA85] animate-pulse" />
          </div>
          <span className="text-[11px] font-baloo font-black text-[#6B1420] tracking-widest mt-1 drop-shadow-xs">
            ॥ श्री गणेशाय नमः ॥
          </span>
        </div>

        {/* 📜 LAYER 1: INNER SANCTUM (Revealed Royal Mandap Invitation) */}
        <div 
          className="absolute inset-0 pt-28 pb-8 px-6 sm:px-8 bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EA] to-[#F5EFEB] text-[#2B1810] flex flex-col items-center justify-between text-center z-10 overflow-hidden"
          style={{
            transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
          }}
        >
          {/* Background Palace Watermark & Radiant Center Light */}
          <div className="absolute inset-0 bg-[radial-gradient(#C89D3C_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFD700]/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Ornate Gold Double Borders */}
          <div className="absolute inset-3.5 border-2 border-[#C89D3C]/60 rounded-t-[140px] rounded-b-2xl pointer-events-none"></div>
          <div className="absolute inset-5 border border-[#C89D3C]/30 rounded-t-[130px] rounded-b-xl pointer-events-none"></div>

          {/* Header Text */}
          <div className="relative z-10 space-y-0.5 pt-1">
            <span className="text-[9.5px] font-sans font-black uppercase tracking-[0.3em] text-[#8B7355] block">
              Together with their families
            </span>
            <p className="text-[12px] font-fraunces font-black text-[#6B1420] italic">
              Cordially invite you to celebrate the royal wedding of
            </p>
          </div>

          {/* Dynamic Couple Names (Large High-Contrast Serif Typography) */}
          <div className="relative z-10 space-y-1.5 my-auto py-2">
            <h2 className="font-fraunces font-black text-3xl sm:text-5xl text-[#6B1420] tracking-tight leading-none drop-shadow-sm">
              {groomName}
            </h2>
            <div className="flex items-center justify-center gap-3 py-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#C89D3C]"></div>
              <span className="font-playfair italic text-2xl text-[#C89D3C] font-black">&amp;</span>
              <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#C89D3C]"></div>
            </div>
            <h2 className="font-fraunces font-black text-3xl sm:text-5xl text-[#6B1420] tracking-tight leading-none drop-shadow-sm">
              {brideName}
            </h2>

            {/* Sacred Monogram Seal */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0DC] border-2 border-[#C89D3C] shadow-sm mt-2">
              <span className="text-[10px] font-cinzel font-black text-[#6B1420] tracking-widest">
                {coupleMonogram}
              </span>
              <span className="text-[9px] text-[#C89D3C]">❖</span>
              <span className="text-[9px] font-sans font-bold text-[#8B7355]">
                {hashtag}
              </span>
            </div>
          </div>

          {/* Date, Venue & Muhurat Action Strip */}
          <div className="relative z-10 w-full space-y-3 px-2">
            <div className="p-3 rounded-2xl bg-[#FAF0DC] border-2 border-[#C89D3C]/70 shadow-sm space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm font-fraunces font-black text-[#6B1420]">
                <Calendar className="w-4 h-4 text-[#C89D3C]" />
                <span>{weddingDate}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-sans font-bold text-[#4A2F1A] truncate">
                <MapPin className="w-3.5 h-3.5 text-[#6B1420] shrink-0" />
                <span className="truncate">{venueName}</span>
              </div>
            </div>

            {/* 4 Micro Muhurat Timer Counters */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'दिन', val: '14' },
                { label: 'घंटे', val: '08' },
                { label: 'मिनट', val: '42' },
                { label: 'सेकंड', val: '19' },
              ].map((item, idx) => (
                <div key={idx} className="p-1.5 rounded-xl bg-[#FFFFFF] border-2 border-[#C89D3C]/60 text-center shadow-sm">
                  <span className="text-sm font-mono font-black text-[#6B1420] block leading-tight">
                    {item.val}
                  </span>
                  <span className="text-[8.5px] font-baloo font-bold text-[#8B7355] block">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Direct 1-Click Studio CTA */}
            <button
              type="button"
              onClick={() => onOpenStudio?.('rajmahal')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6B1420] via-[#8B1D2C] to-[#6B1420] text-[#FAF6EE] text-xs font-fraunces font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all cursor-pointer border-2 border-[#C89D3C]"
            >
              <span>Step Inside Royal Celebration</span>
              <ChevronRight className="w-4 h-4 text-[#E6CA85]" />
            </button>
          </div>
        </div>

        {/* 🚪 LAYER 2: 3D SOLID TEAKWOOD & 24K GOLD FILIGREE PALACE GATES */}
        <div 
          className="absolute inset-0 z-20 pointer-events-auto cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Click to close palace gates' : 'Click to open royal palace gates'}
          style={{ perspective: '1200px' }}
        >
          {/* Left Palace Door */}
          <div 
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#3D0A11] via-[#5E121E] to-[#2B060C] border-r-2 border-[#C89D3C] transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left flex flex-col items-end justify-center pr-4 shadow-[30px_0_60px_rgba(0,0,0,0.85)]"
            style={{
              transform: isOpen ? 'rotateY(-118deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Intricate Teakwood Carvings & 24K Gold Filigree Arch */}
            <div className="absolute inset-4 border-2 border-[#C89D3C]/75 rounded-r-3xl pointer-events-none bg-[radial-gradient(#C89D3C_1px,transparent_1px)] [background-size:12px_12px] opacity-35"></div>
            <div className="absolute inset-7 border border-[#C89D3C]/45 rounded-r-2xl pointer-events-none"></div>

            {/* Embossed Rajasthani Floral Jharokha Motifs */}
            <div className="absolute top-20 right-5 text-[#E6CA85] text-base opacity-85">❖</div>
            <div className="absolute bottom-20 right-5 text-[#E6CA85] text-base opacity-85">❖</div>

            {/* 🦁 3D Antique 24K Cast Brass Lion Head Knocker (सिंह मुखी कड़ा) */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 group-hover:scale-105 transition-transform mr-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6CA85] via-[#C89D3C] to-[#8A6526] border-2 border-[#FAF6EE] shadow-[0_8px_25px_rgba(0,0,0,0.7)] flex items-center justify-center text-base text-[#3D0A11]">
                🦁
              </div>
              {/* Heavy Cast-Brass Ring */}
              <div className="w-7 h-10 rounded-full border-[3.5px] border-[#E6CA85] shadow-inner bg-transparent -mt-3.5"></div>
            </div>
          </div>

          {/* Right Palace Door */}
          <div 
            className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3D0A11] via-[#5E121E] to-[#2B060C] border-l-2 border-[#C89D3C] transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] origin-right flex flex-col items-start justify-center pl-4 shadow-[-30px_0_60px_rgba(0,0,0,0.85)]"
            style={{
              transform: isOpen ? 'rotateY(118deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Intricate Teakwood Carvings & 24K Gold Filigree Arch */}
            <div className="absolute inset-4 border-2 border-[#C89D3C]/75 rounded-l-3xl pointer-events-none bg-[radial-gradient(#C89D3C_1px,transparent_1px)] [background-size:12px_12px] opacity-35"></div>
            <div className="absolute inset-7 border border-[#C89D3C]/45 rounded-l-2xl pointer-events-none"></div>

            {/* Embossed Rajasthani Floral Jharokha Motifs */}
            <div className="absolute top-20 left-5 text-[#E6CA85] text-base opacity-85">❖</div>
            <div className="absolute bottom-20 left-5 text-[#E6CA85] text-base opacity-85">❖</div>

            {/* 🦁 3D Antique 24K Cast Brass Lion Head Knocker (सिंह मुखी कड़ा) */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 group-hover:scale-105 transition-transform ml-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6CA85] via-[#C89D3C] to-[#8A6526] border-2 border-[#FAF6EE] shadow-[0_8px_25px_rgba(0,0,0,0.7)] flex items-center justify-center text-base text-[#3D0A11]">
                🦁
              </div>
              {/* Heavy Cast-Brass Ring */}
              <div className="w-7 h-10 rounded-full border-[3.5px] border-[#E6CA85] shadow-inner bg-transparent -mt-3.5"></div>
            </div>
          </div>

          {/* Center Glowing Gold Light Leak Seam */}
          {!isOpen && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-full bg-gradient-to-b from-transparent via-[#FFD700] to-transparent animate-pulse pointer-events-none shadow-[0_0_30px_#FFD700]"></div>
          )}

          {/* Interactive Tap Prompt Hint */}
          <div 
            className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-[#FAF0DC]/95 backdrop-blur-md border-2 border-[#C89D3C] shadow-2xl flex items-center gap-2 transition-all duration-500 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 animate-pulse'}`}
          >
            <Sparkles className="w-4 h-4 text-[#C89D3C]" />
            <span className="text-[11px] font-fraunces font-black text-[#6B1420] uppercase tracking-wider whitespace-nowrap">
              Tap to Open 3D Palace Gates
            </span>
          </div>
        </div>
      </div>

      {/* 🏛️ 5. GROUNDING CARVED STONE PLATFORM BASE & FLICKERING DIYAS (चबूतरा) */}
      <div className="relative -mt-4 z-10 text-center">
        {/* Carved Pedestal Base */}
        <div className="h-6 sm:h-7 max-w-[94%] mx-auto bg-gradient-to-b from-[#DFCAB0] via-[#C5A869] to-[#8A6526] rounded-b-2xl border-x-2 border-b-2 border-[#8A6526] shadow-2xl flex items-center justify-around px-6">
          
          {/* Flickering Left Brass Diya */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-[10px] text-[#FAF6EE]">🪔</span>
          </div>
          
          {/* Center Medallions */}
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF6EE]/90 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF6EE]/90 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF6EE]/90 shadow-sm"></span>
          </div>

          {/* Flickering Right Brass Diya */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#FAF6EE]">🪔</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
        </div>

        {/* Soft Ground Contact Shadow */}
        <div className="w-4/5 h-5 mx-auto bg-gradient-to-r from-transparent via-[#5A3815]/40 to-transparent blur-lg rounded-full mt-1"></div>
      </div>

      {/* 🎛️ 6. INTERACTIVE PALACE GATES CONTROL & LIVE STUDIO LINK */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-5 py-2.5 rounded-full bg-[#FAF0DC] border-2 border-[#C89D3C] text-[#6B1420] text-xs font-fraunces font-black hover:bg-[#F5E8CE] transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>{isOpen ? '🔒 Part Close Palace Gates' : '✨ Part Open Palace Gates'}</span>
        </button>

        {onOpenStudio && (
          <button
            type="button"
            onClick={() => onOpenStudio('rajmahal')}
            className="px-5 py-2.5 rounded-full bg-[#6B1420] text-[#FAF6EE] border-2 border-[#C89D3C] text-xs font-fraunces font-black hover:brightness-110 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Studio Editor ↗</span>
          </button>
        )}
      </div>
    </div>
  );
};
