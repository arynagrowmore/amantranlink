import React, { useState, useEffect } from 'react';
import { 
  Crown, Sparkles, Clock, Bell, CheckCircle2, ShieldCheck, 
  ArrowRight, Phone, Mail, Heart, Star, Compass, Layers, Lock
} from 'lucide-react';
import { ComingSoonConfig } from '../../types/adminSuperCenter';
import { fetchComingSoonConfig, isAdminVaultAuthenticated } from '../../services/adminSuperCenterService';

interface RoyalComingSoonViewProps {
  onAdminClick?: () => void;
  onBypassToStudio?: () => void;
}

export const RoyalComingSoonView: React.FC<RoyalComingSoonViewProps> = ({
  onAdminClick,
  onBypassToStudio,
}) => {
  const [config, setConfig] = useState<ComingSoonConfig>(fetchComingSoonConfig());
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 14,
    hours: 8,
    minutes: 45,
    seconds: 20
  });

  // Early access notification form
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isVaultAuthed, setIsVaultAuthed] = useState(false);

  useEffect(() => {
    setIsVaultAuthed(isAdminVaultAuthenticated());
    const handleConfigChange = (e: any) => {
      if (e.detail) setConfig(e.detail);
    };
    window.addEventListener('coming-soon-config-changed', handleConfigChange);

    // Calculate countdown timer
    const targetDate = new Date(config.launchDate || '2026-12-15T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('coming-soon-config-changed', handleConfigChange);
    };
  }, [config.launchDate]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('amantranlink_early_access_subscribers') || '[]');
      existing.push({
        name: name.trim() || 'Royal Guest',
        contact: contact.trim(),
        registered_at: new Date().toISOString()
      });
      localStorage.setItem('amantranlink_early_access_subscribers', JSON.stringify(existing));
    } catch (e) {}

    setSubmitted(true);
  };

  const themePills = [
    { name: 'Rajmahal Palace', tag: 'Royal Crimson', icon: '🏰' },
    { name: 'Mayura Peacock', tag: 'Emerald Luxury', icon: '🦚' },
    { name: 'Jharokha Heritage', tag: 'Archway Gold', icon: '🪟' },
    { name: 'Royal Dawn', tag: 'Auspicious Amber', icon: '🌅' },
    { name: 'Royal Ring', tag: 'Eternal Platinum', icon: '💍' },
    { name: 'Mandap Floral', tag: 'Traditional Vermilion', icon: '🌺' },
  ];

  return (
    <div className="min-h-screen bg-[#120306] text-white font-manrope selection:bg-[#F4D06F] selection:text-[#120306] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Decorative Gold Ambient Gradients & Mandalas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(164,19,60,0.35),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F4D06F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#540D1E]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Auspicious Header & Admin Portal Link */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#540D1E] to-[#2B060F] border border-[#F4D06F]/40 flex items-center justify-center text-[#F4D06F] font-bold text-lg shadow-lg shadow-black/40">
            👑
          </div>
          <div>
            <span className="font-cormorant text-xl sm:text-2xl font-bold tracking-wide text-[#F4D06F]">
              AmantranLink
            </span>
            <span className="text-[10px] text-stone-400 block tracking-widest uppercase font-mono">
              Shahi Vivah Suite
            </span>
          </div>
        </div>

        {/* Right Corner: Admin Vault Access or Bypass */}
        <div className="flex items-center gap-3">
          {isVaultAuthed && onBypassToStudio && (
            <button
              type="button"
              onClick={onBypassToStudio}
              className="px-3.5 py-1.5 rounded-xl bg-[#F4D06F] text-[#120306] text-xs font-bold hover:bg-[#E0B94D] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>⚡ Enter Studio Editor</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAdminClick || (() => { window.location.href = '/admin'; })}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#F4D06F]/30 text-[#F4D06F] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            title="Royal Admin Control Vault"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Vault</span>
          </button>
        </div>
      </header>

      {/* Central Majestic Content Stage */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-8 text-center flex flex-col items-center justify-center space-y-8 my-auto">
        
        {/* Sacred Auspicious Shloka Banner */}
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#540D1E]/60 border border-[#F4D06F]/40 text-[#F4D06F] text-xs sm:text-sm font-serif tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#F4D06F] animate-pulse" />
            <span>॥ श्री गणेशाय नमः ॥ · शुभ विवाह</span>
            <Sparkles className="w-3.5 h-3.5 text-[#F4D06F] animate-pulse" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-[#F4D06F]/80 font-mono font-semibold pt-1">
            {config.announcementBadge || '✨ THE GRAND ROYAL UNVEILING'}
          </p>
        </div>

        {/* Grand Headline & Subtitle */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="font-cormorant text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] text-balance">
            {config.headline || 'AmantranLink · Shahi Vivah Suite'}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl mx-auto font-light">
            {config.subheadline || 'The most auspicious and majestic Indian royal wedding invitation platform is being unveiled. Preparing timeless digital heritage kankotris with personalized RSVPs, venue QR passes, and live memory photo walls.'}
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="pt-2 pb-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F4D06F]" />
            <span>Royal Unveiling Countdown</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto">
            {[
              { label: 'DAYS', val: timeLeft.days },
              { label: 'HOURS', val: timeLeft.hours },
              { label: 'MINUTES', val: timeLeft.minutes },
              { label: 'SECONDS', val: timeLeft.seconds },
            ].map((unit) => (
              <div 
                key={unit.label}
                className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#240A10] to-[#1A0509] border border-[#F4D06F]/30 shadow-xl shadow-black/60 flex flex-col items-center justify-center"
              >
                <span className="font-mono text-2xl sm:text-4xl font-extrabold text-[#F4D06F] tracking-tight">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-stone-400 mt-1 uppercase">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Early Access & Notification Form */}
        <div className="w-full max-w-md bg-white/5 border border-[#F4D06F]/30 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-[#F4D06F]" />
              <span>Get Shahi VIP Early Access</span>
            </h3>
            <p className="text-xs text-stone-300">
              Be the first to experience our royal wedding templates with exclusive launch perks.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-[#540D1E]/40 border border-[#F4D06F]/50 text-xs text-[#F4D06F] flex items-center justify-center gap-2 animate-scaleUp">
              <CheckCircle2 className="w-4 h-4 text-[#F4D06F] shrink-0" />
              <span>Shahi Samaan! You are on our VIP royal invitation list. We will notify you at launch.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your Name (e.g. Aryan Patel)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-[#F4D06F] transition-colors"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="WhatsApp Number or Email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-[#F4D06F] transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F4D06F] to-[#E0B94D] hover:from-[#E0B94D] hover:to-[#CBA339] text-[#120306] font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                🔒 Zero spam guarantee · Confidential royal communications only
              </p>
            </form>
          )}
        </div>

        {/* 9 Auspicious Themes Sneak Peek */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">
            Auspicious Themes in Preparation
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
            {themePills.map((t) => (
              <span
                key={t.name}
                className="px-3 py-1.5 rounded-xl bg-[#240A10]/70 border border-[#F4D06F]/20 text-xs text-stone-200 flex items-center gap-1.5 shadow-sm"
              >
                <span>{t.icon}</span>
                <span className="font-medium">{t.name}</span>
              </span>
            ))}
          </div>
        </div>

      </main>

      {/* Royal Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-4">
          <span>© 2026 AmantranLink · Shahi Vivah Suite</span>
          <span>·</span>
          <span>Inquiries: {config.contactPhone || '+91 94093 60336'}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onAdminClick || (() => { window.location.href = '/admin'; })}
            className="hover:text-[#F4D06F] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-[#F4D06F]" />
            <span>Admin Portal</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
