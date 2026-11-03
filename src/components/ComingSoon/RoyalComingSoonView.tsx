import React, { useState, useEffect } from 'react';
import { 
  Crown, Sparkles, Clock, Bell, CheckCircle2, ShieldCheck, 
  ArrowRight, Phone, Mail, Heart
} from 'lucide-react';
import { ComingSoonConfig } from '../../types/adminSuperCenter';
import { fetchComingSoonConfig } from '../../services/adminSuperCenterService';

interface RoyalComingSoonViewProps {
  onAdminClick?: () => void;
  onBypassToStudio?: () => void;
}

export const RoyalComingSoonView: React.FC<RoyalComingSoonViewProps> = () => {
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

  useEffect(() => {
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
        const minutes = Math.floor((difference % (1000 * 60)) / (1000 * 60));
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D151B] font-manrope selection:bg-[#F3E5C8] selection:text-[#540D1E] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Soft Regal Warm Gradients & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(212,175,55,0.12),rgba(250,247,242,0))]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-100/50 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-amber-100/40 via-orange-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Auspicious Branding Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/Amantran.png" 
            alt="Amantran Logo" 
            className="w-11 h-11 object-contain filter drop-shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/amantranlink.png';
            }}
          />
          <div>
            <span className="font-cormorant text-2xl font-bold tracking-wide text-[#540D1E] block leading-tight">
              AmantranLink
            </span>
            <span className="text-[10px] text-[#8C7A7E] tracking-widest uppercase font-mono font-medium">
              Shahi Vivah Suite
            </span>
          </div>
        </div>

        {/* Discreet Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E5D7BE] text-[11px] font-medium text-[#7A6A6E] shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#B38728]" />
          <span>Crafting Digital Heritage</span>
        </div>
      </header>

      {/* Central Majestic Content Stage */}
      <main className="relative z-10 max-w-3xl w-full mx-auto px-6 py-8 text-center flex flex-col items-center justify-center space-y-6 my-auto">
        
        {/* Royal Amantran Emblem */}
        <div className="animate-fadeIn">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-white/70 border border-[#D4AF37]/40 shadow-xl shadow-amber-900/5 p-2 flex items-center justify-center backdrop-blur-xs">
            <img 
              src="/Amantran.png" 
              alt="Amantran Shahi Emblem" 
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/amantranlink.png';
              }}
            />
          </div>
        </div>

        {/* Sacred Auspicious Shloka Banner */}
        <div className="space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-[#D4AF37]/50 text-[#540D1E] text-xs sm:text-sm font-serif tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#B38728] animate-pulse" />
            <span className="font-semibold">॥ श्री गणेशाय नमः ॥ · शुभ विवाह</span>
            <Sparkles className="w-3.5 h-3.5 text-[#B38728] animate-pulse" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E6D18] font-mono font-bold pt-1">
            {config.announcementBadge || '✨ THE GRAND ROYAL UNVEILING'}
          </p>
        </div>

        {/* Grand Headline & Subtitle */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="font-cormorant text-4xl sm:text-6xl font-bold text-[#2D151B] tracking-tight leading-[1.1] text-balance">
            {config.headline || 'AmantranLink · Shahi Vivah Suite'}
          </h1>
          <p className="text-sm sm:text-base text-[#614E53] leading-relaxed max-w-xl mx-auto font-normal">
            {config.subheadline || 'The most auspicious and majestic Indian royal wedding invitation platform is being unveiled. Preparing timeless digital heritage kankotris with personalized RSVPs, venue QR passes, and live memory photo walls.'}
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="pt-1 pb-1 w-full">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C7A7E] mb-3 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#B38728]" />
            <span>Royal Unveiling Countdown</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
            {[
              { label: 'DAYS', val: timeLeft.days },
              { label: 'HOURS', val: timeLeft.hours },
              { label: 'MINUTES', val: timeLeft.minutes },
              { label: 'SECONDS', val: timeLeft.seconds },
            ].map((unit) => (
              <div 
                key={unit.label}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5D7BE] shadow-md shadow-amber-900/5 flex flex-col items-center justify-center"
              >
                <span className="font-mono text-2xl sm:text-4xl font-extrabold text-[#540D1E] tracking-tight">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#8C7A7E] mt-1 uppercase">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Early Access & Notification Form */}
        <div className="w-full max-w-md bg-white border border-[#E5D7BE] rounded-3xl p-6 sm:p-7 shadow-xl shadow-amber-900/5 space-y-4 text-left">
          <div className="space-y-1 text-center">
            <h3 className="text-base font-bold text-[#2D151B] flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-[#B38728]" />
              <span>Get Shahi VIP Early Access</span>
            </h3>
            <p className="text-xs text-[#7A6A6E]">
              Be the first to experience our royal wedding suites with exclusive launch perks.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-[#540D1E]/5 border border-[#540D1E]/20 text-xs text-[#540D1E] flex items-center justify-center gap-2 animate-scaleUp">
              <CheckCircle2 className="w-4 h-4 text-[#540D1E] shrink-0" />
              <span className="font-medium text-center">Shahi Samaan! You are on our VIP royal invitation list. We will notify you at launch.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your Name (e.g. Aryan Patel)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DDD0BC] text-[#2D151B] placeholder-stone-400 text-xs focus:outline-none focus:border-[#B38728] focus:ring-1 focus:ring-[#B38728] transition-colors"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="WhatsApp Number or Email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DDD0BC] text-[#2D151B] placeholder-stone-400 text-xs focus:outline-none focus:border-[#B38728] focus:ring-1 focus:ring-[#B38728] transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B38728] to-[#996F19] hover:from-[#C89B3C] hover:to-[#B38728] text-white font-bold text-xs transition-all shadow-md shadow-[#B38728]/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8C7A7E] text-center">
                🔒 Zero spam guarantee · Confidential royal communications only
              </p>
            </form>
          )}
        </div>

      </main>

      {/* Royal Clean Footer - Zero Admin Mentions */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto px-6 py-6 border-t border-[#E8DFD1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7A7E]">
        <div className="flex items-center gap-2">
          <span>© 2026 AmantranLink · Shahi Vivah Suite</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Inquiries: {config.contactPhone || '+91 94093 60336'}</span>
        </div>
      </footer>

    </div>
  );
};
