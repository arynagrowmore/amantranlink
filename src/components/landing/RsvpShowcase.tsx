import React, { useState } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, Download, 
  Search, MessageSquare, ArrowRight, ShieldCheck, Heart, Sparkles 
} from 'lucide-react';
import { RoyalCrestIcon, DiyaIcon } from '../ShahiIcons';

interface DemoGuest {
  name: string;
  phone: string;
  attending: boolean;
  count: number;
  wishes: string;
  time: string;
}

const DEMO_GUESTS: DemoGuest[] = [
  { name: 'Rajesh & Meena Sharma', phone: '+91 98250 11223', attending: true, count: 4, wishes: 'हार्दिक बधाई व शुभकामनाएं! May your marriage be filled with endless joy and blessings.', time: '10 mins ago' },
  { name: 'Dr. Vikramaditya Rathore', phone: '+91 98790 44556', attending: true, count: 2, wishes: 'Congratulations to both families on this auspicious royal union!', time: '25 mins ago' },
  { name: 'Ananya & Kabir Desai', phone: '+91 94280 77889', attending: true, count: 3, wishes: 'So excited for the Sangeet night! Looking forward to celebrating with you.', time: '1 hour ago' },
  { name: 'Sanjaybhai Patel (USA)', phone: '+1 408 555 0192', attending: false, count: 0, wishes: 'Heartiest congratulations! Sending our deepest blessings from California.', time: '2 hours ago' },
];

export const RsvpShowcase: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const [filter, setFilter] = useState<'all' | 'attending' | 'regrets'>('all');

  const filteredGuests = DEMO_GUESTS.filter((g) => {
    if (filter === 'attending') return g.attending;
    if (filter === 'regrets') return !g.attending;
    return true;
  });

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 bg-[#430914] text-[#FFFDF8] font-manrope relative overflow-hidden">
      
      {/* Decorative Gold Filigree Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C49A35]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6E1020]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6E1020] border border-[#C49A35]/60 text-[#E8D5AD] text-xs font-manrope font-semibold tracking-wider uppercase">
            <Users className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>REAL-TIME ATTENDANCE TRACKING</span>
          </div>

          <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#FFFDF8] tracking-tight">
            LIVE RSVP COMMAND CENTER
          </h2>

          <p className="text-sm sm:text-base text-[#E8D5AD]/90 font-normal max-w-xl mx-auto leading-relaxed">
            Know your guest count before the celebration begins.
          </p>

          <div className="inline-block text-[11px] font-mono text-[#C49A35] font-semibold bg-[#2B060C] px-3 py-1 rounded-full border border-[#C49A35]/30">
            DEMO RSVP DATA · REAL WEDDINGS DISPLAY LIVE GUEST RESPONSES
          </div>
        </div>

        {/* Realistic RSVP Dashboard Preview Card */}
        <div className="max-w-5xl mx-auto bg-[#24050B] border border-[#C49A35]/40 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-8">
          
          {/* Top Bar: Wedding Info & Export CSV Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C49A35]/20 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C49A35] uppercase">
                  Dhruv & Shreya's Royal Vivah
                </span>
                <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-pulse" />
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                Guest Attendance & Headcount Intelligence
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#6E1020] hover:bg-[#8A1828] text-[#FFFDF8] text-xs font-manrope font-semibold flex items-center gap-1.5 border border-[#C49A35]/50 shadow transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Export Caterer CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Attending */}
            <div className="p-5 rounded-2xl bg-[#1A0407] border border-[#167A5A]/50 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                ATTENDING
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-cormorant font-bold text-4xl text-emerald-300">152</span>
                <span className="text-xs text-emerald-400 font-medium">+342 total guests</span>
              </div>
            </div>

            {/* Not Attending */}
            <div className="p-5 rounded-2xl bg-[#1A0407] border border-rose-900/50 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold block">
                NOT ATTENDING
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-cormorant font-bold text-4xl text-rose-300">21</span>
                <span className="text-xs text-rose-400 font-medium">Warm wishes sent</span>
              </div>
            </div>

            {/* Awaiting Response */}
            <div className="p-5 rounded-2xl bg-[#1A0407] border border-[#C49A35]/40 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C49A35] font-semibold block">
                AWAITING RESPONSE
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-cormorant font-bold text-4xl text-[#E8D5AD]">38</span>
                <span className="text-xs text-[#C49A35] font-medium">Invitations viewed</span>
              </div>
            </div>

          </div>

          {/* Guest Feed Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#E8D5AD]/80 border-b border-[#C49A35]/20 pb-2">
              <span className="font-semibold uppercase tracking-wider">Recent Guest Responses</span>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer ${filter === 'all' ? 'bg-[#C49A35] text-[#24050B] font-bold' : 'hover:text-[#FFFDF8]'}`}
                >
                  All (173)
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('attending')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer ${filter === 'attending' ? 'bg-[#C49A35] text-[#24050B] font-bold' : 'hover:text-[#FFFDF8]'}`}
                >
                  Attending (152)
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('regrets')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer ${filter === 'regrets' ? 'bg-[#C49A35] text-[#24050B] font-bold' : 'hover:text-[#FFFDF8]'}`}
                >
                  Regrets (21)
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredGuests.map((guest, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1A0407] border border-[#C49A35]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#FFFDF8]">{guest.name}</span>
                      <span className="text-[#75675C] font-mono text-[11px]">{guest.phone}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        guest.attending ? 'bg-[#167A5A]/30 text-emerald-300 border border-[#167A5A]' : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                      }`}>
                        {guest.attending ? `Going (${guest.count})` : 'Regrets'}
                      </span>
                    </div>
                    <p className="text-[#E8D5AD]/75 italic text-[11px]">
                      “{guest.wishes}”
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-[#75675C] shrink-0">
                    {guest.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C49A35]/20">
            <p className="text-xs text-[#E8D5AD]/70 font-normal">
              Every couple receives a private, secure dashboard with 100% isolated guest records.
            </p>
            <button
              type="button"
              onClick={onEnterStudio}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C49A35] to-[#A87E24] hover:from-[#D4AA45] hover:to-[#B88E34] text-[#24050B] font-manrope font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <span>CREATE YOUR WEDDING DASHBOARD</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default RsvpShowcase;
