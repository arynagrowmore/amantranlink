import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';

interface RoyalWaxSealEnvelopeProps {
  state: WeddingProjectState;
  onOpenComplete?: () => void;
}

export const RoyalWaxSealEnvelope: React.FC<RoyalWaxSealEnvelopeProps> = ({
  state,
  onOpenComplete,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const groomName = state?.couple?.groomEn || state?.couple?.groomHi || 'Rudra';
  const brideName = state?.couple?.brideEn || state?.couple?.brideHi || 'Ishani';
  const gInit = (groomName.trim().charAt(0) || 'R').toUpperCase();
  const bInit = (brideName.trim().charAt(0) || 'I').toUpperCase();
  const monogram = `${gInit} & ${bInit}`;
  const weddingDate = state?.couple?.weddingDate || '3 December 2026';

  // 🎵 Procedural Royal Chime & Wax Fracture Audio Synthesizer (Web Audio API)
  const playRoyalSealCrackSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Crack / Snap Transient (Noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 2. Auspicious Golden Bell Chime (Harmonics at 528Hz, 792Hz, 1056Hz, 1320Hz)
      const freqs = [528, 792, 1056, 1320];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + 0.02);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.02);
        osc.stop(now + 1.9);
      });
    } catch (e) {
      // Graceful fallback if browser blocks audio context
    }
  };

  // ✨ Golden Particle Burst Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
    }

    const goldColors = ['#F7D78A', '#D4AF37', '#E8D5AD', '#FFFDF8', '#C49A35'];
    let particles: Particle[] = [];

    // Ambient floating dust before click
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        decay: 0,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.decay > 0) {
          p.alpha -= p.decay;
        }

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        // Wrap around ambient
        if (p.decay === 0) {
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#F7D78A';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleBreakSeal = () => {
    if (isAnimating || isOpen) return;
    setIsAnimating(true);
    playRoyalSealCrackSound();

    setTimeout(() => {
      setIsOpen(true);
    }, 450);

    setTimeout(() => {
      setIsRendered(false);
      if (onOpenComplete) onOpenComplete();
    }, 1250);
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-1000 select-none ${
        isOpen ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 bg-[#120306]'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #2B060D 0%, #150205 70%, #080002 100%)',
      }}
    >
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Subtle Royal Damask Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Central Envelope Stage */}
      <div className="relative z-10 w-full max-w-[440px] px-4 flex flex-col items-center">
        
        {/* Top Auspicious Inscription */}
        <div className="text-center space-y-1 mb-5 animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D0A13]/90 border border-[#C49A35]/50 text-[#F8E7C5] text-[11px] font-semibold tracking-widest uppercase shadow-lg">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>॥ श्री गणेशाय नमः ॥</span>
          </div>
          <h2 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold pt-1">
            Royal Vivah Invitation
          </h2>
        </div>

        {/* ✉️ 3D Royal Velvet Envelope Container */}
        <div 
          onClick={handleBreakSeal}
          className={`relative w-full aspect-[4/3] rounded-2xl cursor-pointer group transition-all duration-700 ${
            isAnimating ? 'scale-102' : 'hover:scale-[1.02]'
          }`}
          style={{
            perspective: '1200px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(196, 154, 53, 0.25)',
          }}
        >
          {/* Outer Velvet Pocket Base */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#4A0A14] via-[#33050C] to-[#220207] border-2 border-[#C49A35]/80 overflow-hidden shadow-2xl">
            
            {/* Ornate Gold Filigree Corners */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-sm opacity-80" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-sm opacity-80" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-sm opacity-80" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] rounded-br-sm opacity-80" />

            {/* Inner Invitation Card Peek (Slides upwards when opened) */}
            <div 
              className={`absolute inset-x-4 top-4 bottom-4 rounded-xl bg-gradient-to-b from-[#FFFDF8] via-[#FAF4E6] to-[#F1E2C3] border border-[#C49A35] p-5 flex flex-col items-center justify-center text-center transition-transform duration-1000 ease-out shadow-inner ${
                isOpen ? '-translate-y-24 scale-95 opacity-0' : 'translate-y-0'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#6E1020] text-[#D4AF37] flex items-center justify-center mb-1 border border-[#C49A35] shadow-xs">
                <Crown className="w-4 h-4" />
              </div>
              <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-[#500A15] tracking-wide leading-tight">
                {groomName}
              </h3>
              <span className="font-serif italic text-xs text-[#C49A35] font-semibold my-0.5">
                weds
              </span>
              <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-[#500A15] tracking-wide leading-tight">
                {brideName}
              </h3>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C49A35] to-transparent my-2" />
              <p className="text-[11px] font-manrope font-semibold uppercase tracking-widest text-[#75675C]">
                {weddingDate}
              </p>
            </div>

            {/* Bottom & Side Fold Flaps */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(80, 10, 21, 0.95) 0%, rgba(40, 4, 10, 0.98) 100%)',
                clipPath: 'polygon(0% 100%, 50% 55%, 100% 100%)',
                borderTop: '1px solid rgba(212, 175, 55, 0.4)'
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(65, 8, 17, 0.95) 0%, rgba(40, 4, 10, 0.98) 100%)',
                clipPath: 'polygon(0% 0%, 0% 100%, 50% 55%)',
                borderRight: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(-90deg, rgba(65, 8, 17, 0.95) 0%, rgba(40, 4, 10, 0.98) 100%)',
                clipPath: 'polygon(100% 0%, 100% 100%, 50% 55%)',
                borderLeft: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            />

            {/* Top Triangular Flap (Folds open upwards in 3D) */}
            <div 
              className={`absolute top-0 inset-x-0 h-full origin-top transition-transform duration-700 ease-in-out pointer-events-none ${
                isOpen ? '[transform:rotateX(180deg)]' : '[transform:rotateX(0deg)]'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(180deg, #5A0C1A 0%, #3D050E 100%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 56%)',
                borderBottom: '1.5px solid rgba(212, 175, 55, 0.6)'
              }}
            />
          </div>

          {/* 🔴 3D Royal Wax Seal Stamp (Centered on Flap Point) */}
          <div 
            className={`absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 ${
              isAnimating ? 'scale-125 opacity-0' : 'group-hover:scale-110'
            }`}
          >
            {/* Outer Glowing Halo */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] opacity-40 blur-md animate-pulse" />

            {/* 3D Wax Seal Button Shell */}
            <div 
              className="relative w-20 h-20 rounded-full flex items-center justify-center text-center shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.6)] cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #E6C265 0%, #C49A35 40%, #8C1322 75%, #590A14 100%)',
                border: '2.5px solid #F5DE88',
              }}
            >
              {/* Wax Irregular Stamped Rim Details */}
              <div className="absolute inset-1 rounded-full border border-[#FFE89E]/40 border-dashed pointer-events-none" />

              <div className="flex flex-col items-center justify-center select-none text-[#FFFDF8] drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.8)]">
                <Crown className="w-4 h-4 text-[#FFFDF8] mb-0.5" />
                <span className="font-cinzel font-black text-xs tracking-wider leading-none">
                  {monogram}
                </span>
                <span className="text-[7.5px] font-serif tracking-widest text-[#FFFDF8]/90 font-bold uppercase mt-0.5">
                  SHAHI SEAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 👆 Interactive Call-To-Action Button */}
        <div className="mt-7 text-center space-y-2">
          <button
            type="button"
            onClick={handleBreakSeal}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#6E1020] via-[#8C1322] to-[#6E1020] hover:from-[#8C1322] hover:to-[#A31829] text-[#FFFDF8] text-xs font-cinzel font-bold tracking-widest uppercase border border-[#C49A35] shadow-[0_8px_25px_rgba(110,16,32,0.6)] hover:shadow-[0_10px_30px_rgba(196,154,53,0.5)] hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '4s' }} />
            <span>BREAK THE ROYAL SEAL</span>
          </button>
          
          <p className="text-[11px] font-manrope text-[#E8D5AD]/70 tracking-wider">
            Tap the seal or button to open the invitation
          </p>
        </div>

      </div>
    </div>
  );
};

export default RoyalWaxSealEnvelope;
