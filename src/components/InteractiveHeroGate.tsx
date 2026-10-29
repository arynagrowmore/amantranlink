import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Volume2, VolumeX, MapPin, Calendar, 
  ChevronRight, ArrowRight, ShieldCheck, Heart, Send, CheckCircle2 
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { IPhoneHardwareFrame } from './IPhoneHardwareFrame';

interface InteractiveHeroGateProps {
  state?: WeddingProjectState;
  onOpenStudio?: (theme?: string) => void;
}

export const InteractiveHeroGate: React.FC<InteractiveHeroGateProps> = ({ state, onOpenStudio }) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Couple Data (Preserved from state)
  const brideName = state?.couple?.brideEn || 'Shreya';
  const groomName = state?.couple?.groomEn || 'Dhruv';
  const weddingDate = state?.couple?.weddingDate || '3 December 2026';
  const venueName = state?.couple?.venueName || 'The Milestone Palace, Himmatnagar';
  const coupleMonogram = state?.couple?.mark || `${groomName.charAt(0)} · ${brideName.charAt(0)}`;

  // Multi-layer 3D cursor parallax physics (Desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingMusic(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto py-4 flex flex-col items-center select-none"
    >
      {/* 🌟 1. RADIANT AMBIENT LIGHT AURA */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[520px] h-[640px] bg-gradient-to-tr from-[#C49A35]/25 via-[#6E1020]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Hidden Audio Player for Shehnai Preview */}
      <audio
        ref={audioRef}
        src="/audio/shehnai-classical.mp3"
        loop
        className="hidden"
      />

      {/* 👑 2. FLOATING EDITORIAL BADGES (High-Fashion Atelier Pins) */}
      
      {/* Plaque 1 (Top Left): 3D ROYAL GATES */}
      <div 
        className="hidden sm:flex absolute -left-12 top-14 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DCC8] shadow-[0_10px_26px_-4px_rgba(67,9,20,0.08)] z-40 pointer-events-none transition-transform duration-300"
        style={{ transform: `translate3d(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px, 0)` }}
      >
        <div className="w-8 h-8 rounded-xl bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs shadow-xs border border-[#C49A35]/50 shrink-0">
          <Sparkles className="w-4 h-4 text-[#C49A35]" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-[#1A1715] block leading-tight">
            3D Palace Gates
          </span>
          <span className="text-[9.5px] font-medium text-[#75675C]">
            Cinematic Opening Reveal
          </span>
        </div>
      </div>

      {/* Plaque 2 (Top Right): CEREMONIAL SHEHNAI */}
      <div 
        className="hidden sm:flex absolute -right-12 top-24 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DCC8] shadow-[0_10px_26px_-4px_rgba(67,9,20,0.08)] z-40 pointer-events-auto cursor-pointer group hover:border-[#C49A35] transition-all"
        onClick={toggleMusic}
        style={{ transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)` }}
      >
        <div className="w-8 h-8 rounded-xl bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs shadow-xs border border-[#C49A35]/50 shrink-0">
          {isPlayingMusic ? <Volume2 className="w-4 h-4 text-[#C49A35] animate-pulse" /> : <VolumeX className="w-4 h-4 text-[#FFFDF8]/70" />}
        </div>
        <div>
          <span className="text-[11px] font-bold text-[#1A1715] block leading-tight">
            Ceremonial Shehnai
          </span>
          <span className="text-[9.5px] font-medium text-[#75675C] flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlayingMusic ? 'bg-[#167A5A] animate-pulse' : 'bg-stone-400'}`} />
            {isPlayingMusic ? 'Playing · Tap to Mute' : 'Tap to Listen'}
          </span>
        </div>
      </div>

      {/* Plaque 3 (Bottom Left): 1-TAP GPS VENUE */}
      <div 
        className="hidden sm:flex absolute -left-10 bottom-28 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DCC8] shadow-[0_10px_26px_-4px_rgba(67,9,20,0.08)] z-40 pointer-events-none transition-transform duration-300"
        style={{ transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 0)` }}
      >
        <div className="w-8 h-8 rounded-xl bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs shadow-xs border border-[#C49A35]/50 shrink-0">
          <MapPin className="w-4 h-4 text-[#C49A35]" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-[#1A1715] block leading-tight">
            1-Tap GPS Navigation
          </span>
          <span className="text-[9.5px] font-medium text-[#75675C]">
            Directs Guests to Mandap
          </span>
        </div>
      </div>

      {/* Plaque 4 (Bottom Right): INSTANT WHATSAPP */}
      <div 
        className="hidden sm:flex absolute -right-10 bottom-16 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DCC8] shadow-[0_10px_26px_-4px_rgba(67,9,20,0.08)] z-40 pointer-events-none transition-transform duration-300"
        style={{ transform: `translate3d(${mousePos.x * 1}px, ${mousePos.y * 1}px, 0)` }}
      >
        <div className="w-8 h-8 rounded-xl bg-[#167A5A] text-white flex items-center justify-center text-xs shadow-xs shrink-0">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-[#1A1715] block leading-tight">
            WhatsApp Smart Link
          </span>
          <span className="text-[9.5px] font-medium text-[#75675C]">
            Bespoke Family Greeting
          </span>
        </div>
      </div>

      {/* 📱 3. PHOTOREALISTIC APPLE IPHONE 16 PRO WITH LIVE TEMPLATE */}
      <div 
        className="transition-transform duration-500 ease-out cursor-pointer group"
        onClick={() => onOpenStudio?.('rajmahal')}
        style={{
          transform: `perspective(1200px) rotateY(${mousePos.x * 0.3}deg) rotateX(${mousePos.y * 0.3}deg)`,
        }}
      >
        <IPhoneHardwareFrame>
          <iframe
            src="/templates/rajmahal-template/index.html?preview=hero"
            title="Interactive Live Invitation Preview"
            className="w-full h-full border-none block"
            loading="eager"
          />
        </IPhoneHardwareFrame>
      </div>

      {/* Interactive Hint Underneath */}
      <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E8DCC8] text-[11px] font-medium text-[#5C524B] shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-ping" />
        <span>Interactive Live Preview · Tap phone to customize in studio</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#C49A35]" />
      </div>

    </div>
  );
};

export default InteractiveHeroGate;
