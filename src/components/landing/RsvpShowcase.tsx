import React, { useState } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, Download, 
  Search, MessageSquare, ArrowRight, ShieldCheck, Heart, Sparkles, Filter 
} from 'lucide-react';

interface DemoGuest {
  name: string;
  phone: string;
  attending: boolean;
  count: number;
  dietary?: string;
  wishes: string;
  time: string;
}

const DEMO_GUESTS: DemoGuest[] = [
  { 
    name: 'Rajesh & Meena Sharma', 
    phone: '+91 98250 11223', 
    attending: true, 
    count: 4, 
    dietary: 'Traditional / Jain Options',
    wishes: 'हार्दिक बधाई व शुभकामनाएं! May your marriage be filled with endless joy, laughter and divine blessings.', 
    time: '10 mins ago' 
  },
  { 
    name: 'Dr. Vikramaditya Rathore', 
    phone: '+91 98790 44556', 
    attending: true, 
    count: 2, 
    dietary: 'Regular Royal Feast',
    wishes: 'Congratulations to both families on this auspicious royal union! Looking forward to attending the Vivah.', 
    time: '25 mins ago' 
  },
  { 
    name: 'Ananya & Kabir Desai', 
    phone: '+91 94280 77889', 
    attending: true, 
    count: 3, 
    dietary: 'Pure Vegetarian',
    wishes: 'So excited for the Sangeet night! Looking forward to celebrating with you both.', 
    time: '1 hour ago' 
  },
  { 
    name: 'Sanjaybhai Patel (USA)', 
    phone: '+1 408 555 0192', 
    attending: false, 
    count: 0, 
    wishes: 'Heartiest congratulations! Sending our deepest blessings and shagun from California.', 
    time: '2 hours ago' 
  },
];

export const RsvpShowcase: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const [filter, setFilter] = useState<'all' | 'attending' | 'regrets'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGuests = DEMO_GUESTS.filter((g) => {
    if (filter === 'attending' && !g.attending) return false;
    if (filter === 'regrets' && g.attending) return false;
    if (searchQuery.trim() && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 bg-[#FAF8F5] text-[#241A17] font-sans relative overflow-hidden border-y border-[#E8DCC8]">
      
      {/* Subtle Ambient Gold Particle Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#C49A35]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#6E1020]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DCC8] text-[#6E1020] text-xs font-semibold tracking-wider uppercase shadow-2xs">
            <Users className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>REAL-TIME GUEST HOSPITALITY</span>
          </div>

          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
            Live RSVP &amp; Guest Command Center
          </h2>

          <p className="text-base sm:text-lg text-[#1A1412] font-semibold max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            Eliminate wedding planning guesswork. Track confirmed family headcounts, meal preferences, and heartfelt blessings in real time.
          </p>
        </div>

        {/* Luminous Light Theme Dashboard Card */}
        <div className="max-w-5xl mx-auto bg-white border-2 border-[#E8D5AD] rounded-3xl p-6 sm:p-10 shadow-[0_16px_40px_-12px_rgba(67,9,20,0.08)] space-y-8">
          
          {/* Top Bar: Wedding Info & Export CSV Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCC8]/70 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#167A5A] animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-[#1A1412]">
                  Dhruv &amp; Shreya’s Royal Vivah
                </h3>
                <span className="text-[10px] font-mono font-bold bg-[#FAF6EE] text-[#6E1020] border border-[#E8DCC8] px-2.5 py-0.5 rounded-full uppercase">
                  LIVE TRACKING
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#1A1412] font-semibold mt-1">
                The Milestone Palace, Himmatnagar · 3 December 2026
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Demo mode: In live weddings, your full guest list exports to an Excel/CSV spreadsheet in 1 click.')}
              className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#241A17] font-semibold text-xs border border-[#E8DCC8] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C49A35]" />
              <span>Export RSVP Spreadsheet (CSV)</span>
            </button>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F9F6] border border-[#167A5A]/30 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-[#167A5A] uppercase tracking-wider block">
                Confirmed Attending
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#167A5A] tabular-nums">
                  124
                </span>
                <span className="text-xs text-[#167A5A] font-bold">Guests</span>
              </div>
              <span className="text-xs text-[#167A5A] font-semibold block pt-0.5">
                42 Families Confirmed
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C49A35]/40 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-[#8E6725] uppercase tracking-wider block">
                Awaiting Response
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#8E6725] tabular-nums">
                  18
                </span>
                <span className="text-xs text-[#8E6725] font-bold">Families</span>
              </div>
              <span className="text-xs text-[#8E6725] font-semibold block pt-0.5">
                Automated reminder ready
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF2F4] border border-[#8B1528]/25 space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-[#8B1528] uppercase tracking-wider block">
                Unable to Attend
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#8B1528] tabular-nums">
                  6
                </span>
                <span className="text-xs text-[#8B1528] font-bold">Regrets</span>
              </div>
              <span className="text-xs text-[#8B1528] font-semibold block pt-0.5">
                Sent blessings online
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC8] space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold text-[#6E1020] uppercase tracking-wider block">
                Total Headcount
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#6E1020] tabular-nums">
                  148
                </span>
                <span className="text-xs text-[#6E1020]/80 font-medium">Invites</span>
              </div>
              <span className="text-[10px] text-[#6E1020]/70 block pt-0.5">
                83.7% Response Rate
              </span>
            </div>

          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                    : 'text-[#75675C] hover:text-[#241A17]'
                }`}
              >
                All Responses ({DEMO_GUESTS.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('attending')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'attending'
                    ? 'bg-[#167A5A] text-white shadow-xs'
                    : 'text-[#75675C] hover:text-[#241A17]'
                }`}
              >
                Attending (3)
              </button>
              <button
                type="button"
                onClick={() => setFilter('regrets')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'regrets'
                    ? 'bg-stone-700 text-white shadow-xs'
                    : 'text-[#75675C] hover:text-[#241A17]'
                }`}
              >
                Regrets (1)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest or family..."
                className="w-full px-3.5 py-2 pl-9 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#241A17] outline-none focus:border-[#C49A35] placeholder:text-[#A8957F]"
              />
              <Search className="w-3.5 h-3.5 text-[#75675C] absolute left-3 top-3" />
            </div>

          </div>

          {/* Interactive Guest Response Cards */}
          <div className="space-y-3">
            {filteredGuests.map((guest, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC8] hover:border-[#C49A35]/60 transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      guest.attending 
                        ? 'bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/30' 
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {guest.attending ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#1A1715] flex items-center gap-2">
                        <span>{guest.name}</span>
                        {guest.dietary && (
                          <span className="text-[10px] font-medium bg-[#FAF6EE] text-[#8E6725] px-2 py-0.5 rounded-md border border-[#E8DCC8]">
                            {guest.dietary}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#75675C] mt-0.5">
                        <span className="font-mono">{guest.phone}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-[#A8957F]" />
                          {guest.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {guest.attending ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/25">
                        Attending · {guest.count} Family Members
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        Unable to Attend
                      </span>
                    )}
                  </div>
                </div>

                {guest.wishes && (
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8]/60 text-xs text-[#5C524B] italic flex items-start gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C49A35] shrink-0 mt-0.5" />
                    <span>“{guest.wishes}”</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Privacy & Direct Studio Link */}
          <div className="pt-6 border-t border-[#E8DCC8]/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#75675C]">
              <ShieldCheck className="w-4 h-4 text-[#167A5A]" />
              <span>Isolated Private Database · Only you and your family can access guest records</span>
            </div>

            <button
              type="button"
              onClick={onEnterStudio}
              className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <span>Set Up RSVP For Your Wedding</span>
              <ArrowRight className="w-4 h-4 text-[#C49A35]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default RsvpShowcase;
