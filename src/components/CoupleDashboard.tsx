import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Heart, Download, Search, 
  RefreshCw, MessageCircle, ExternalLink, ArrowLeft, 
  Sparkles, Filter, ShieldCheck, Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWeddingRsvps, exportRsvpsToCSV, RsvpRecord, RsvpSummary } from '../services/rsvpService';
import { WeddingProjectState } from '../types/wedding';

interface CoupleDashboardProps {
  state: WeddingProjectState;
  siteId?: string;
  onBackToStudio: () => void;
  onBackToHome: () => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({
  state,
  siteId,
  onBackToStudio,
  onBackToHome,
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<RsvpSummary>({
    totalRsvps: 0,
    totalAttendingCount: 0,
    totalRegretsCount: 0,
    rsvps: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'attending' | 'regrets'>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const weddingSlug = `${(state.couple.groomEn || 'dhruv').toLowerCase()}-${(state.couple.brideEn || 'shreya').toLowerCase()}`;
  const coupleName = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;

  const loadRsvpData = async () => {
    // Clear old state immediately to prevent showing previous wedding RSVPs
    setSummary({ totalRsvps: 0, totalAttendingCount: 0, totalRegretsCount: 0, rsvps: [] });
    setLoading(true);
    try {
      const data = await fetchWeddingRsvps(siteId || weddingSlug);
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRsvpData();
  }, [siteId, weddingSlug]);

  // Filtered List
  const filteredRsvps = summary.rsvps.filter((r) => {
    const matchesSearch = 
      r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guest_phone.includes(searchQuery) ||
      (r.wishes && r.wishes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'attending') return r.attending;
    if (filterType === 'regrets') return !r.attending;
    return true;
  });

  const handleCopyInviteLink = () => {
    const fullUrl = `${window.location.origin}/?invite=${weddingSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#140508] text-[#F7E7C4] font-hanken selection:bg-[#C59B4B]/30 pb-20">
      {/* 👑 Top Navigation Header */}
      <header className="border-b border-[#C59B4B]/30 bg-[#23080E]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C59B4B]/30 text-[#E2B968] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Studio</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-[#E2B968] uppercase font-bold">
                Shahi Studio · Couple Portal
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <h1 className="font-cinzel text-lg sm:text-xl font-bold text-[#F7E7C4] tracking-wide">
              {coupleName}’s Vivah RSVP Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C59B4B]/40 text-[#E2B968] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied! ✓' : 'Share Invite'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportRsvpsToCSV(summary.rsvps, weddingSlug)}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-[#C59B4B] to-[#9C772F] text-[#140508] font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-[#C59B4B]/20 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel/CSV</span>
          </button>
        </div>
      </header>

      {/* 📊 Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* 1. Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Responses */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#2B0B11] to-[#1D060B] border border-[#C59B4B]/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-[#A8957F]">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Responses</span>
              <Users className="w-5 h-5 text-[#E2B968]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F7E7C4]">
                {summary.totalRsvps}
              </span>
              <span className="text-xs text-[#D1BFA5]">families</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A8957F]">
              Realtime guest submissions
            </div>
          </div>

          {/* Confirmed Headcount */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#2B0B11] to-[#1D060B] border border-emerald-500/40 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Attending Headcount</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-cinzel font-bold text-emerald-300">
                {summary.totalAttendingCount}
              </span>
              <span className="text-xs text-emerald-400/80">confirmed guests</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A8957F]">
              Catering &amp; seating count
            </div>
          </div>

          {/* Regrets */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#2B0B11] to-[#1D060B] border border-[#C59B4B]/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-[#A8957F]">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Unable to Attend</span>
              <XCircle className="w-5 h-5 text-rose-400/80" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-cinzel font-bold text-rose-300">
                {summary.totalRegretsCount}
              </span>
              <span className="text-xs text-[#D1BFA5]">guests</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A8957F]">
              Sent blessings remotely
            </div>
          </div>

          {/* Wishes */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#2B0B11] to-[#1D060B] border border-[#C59B4B]/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-[#A8957F]">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Blessing Notes</span>
              <Heart className="w-5 h-5 text-pink-400 fill-pink-400/30" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F7E7C4]">
                {summary.rsvps.filter((r) => r.wishes).length}
              </span>
              <span className="text-xs text-[#D1BFA5]">messages</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A8957F]">
              Warm couple blessings
            </div>
          </div>
        </div>

        {/* 2. Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#23080E]/70 p-4 rounded-2xl border border-[#C59B4B]/20">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8957F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name, phone, or wish keywords..."
              className="w-full bg-[#140508] border border-[#C59B4B]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F7E7C4] placeholder-[#A8957F]/60 focus:outline-none focus:border-[#E2B968]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#C59B4B] text-[#140508]'
                  : 'bg-white/5 text-[#D1BFA5] hover:bg-white/10'
              }`}
            >
              All ({summary.totalRsvps})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('attending')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'attending'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-[#D1BFA5] hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Attending ({summary.rsvps.filter((r) => r.attending).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('regrets')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'regrets'
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40'
                  : 'bg-white/5 text-[#D1BFA5] hover:bg-white/10'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Regrets ({summary.totalRegretsCount})
            </button>

            <button
              type="button"
              onClick={loadRsvpData}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C59B4B]/30 text-[#E2B968] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3. Live RSVP Table */}
        <div className="rounded-2xl border border-[#C59B4B]/30 bg-[#23080E]/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2E0B12] text-[#E2B968] font-cinzel uppercase tracking-wider text-[10px] border-b border-[#C59B4B]/30">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Guest &amp; Family</th>
                  <th className="py-3.5 px-4 font-bold">Contact / WhatsApp</th>
                  <th className="py-3.5 px-4 font-bold text-center">Headcount</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-6 font-bold">Blessing Message</th>
                  <th className="py-3.5 px-4 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C59B4B]/10">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#A8957F]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-[#A8957F]/40" />
                        <p className="font-semibold text-sm">No RSVP submissions found</p>
                        <p className="text-xs text-[#A8957F]/70">
                          Share your invitation link with guests to start collecting RSVPs!
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => {
                    const cleanPhone = rsvp.guest_phone.replace(/[^0-9]/g, '');
                    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Namaste ${rsvp.guest_name}! Thank you so much for confirming your RSVP for ${coupleName}'s wedding. We look forward to celebrating together! ✨`
                    )}`;

                    return (
                      <tr key={rsvp.id} className="hover:bg-white/3 transition-colors">
                        {/* Guest Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#C59B4B] to-[#9C772F] text-[#140508] font-bold font-cinzel flex items-center justify-center text-xs shrink-0 shadow">
                              {rsvp.guest_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#F7E7C4] text-sm">
                              {rsvp.guest_name}
                            </span>
                          </div>
                        </td>

                        {/* Phone & WhatsApp */}
                        <td className="py-4 px-4 font-mono text-[#D1BFA5]">
                          <div className="flex items-center gap-2">
                            <span>{rsvp.guest_phone}</span>
                            {cleanPhone.length >= 10 && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Message on WhatsApp"
                                className="p-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/40 transition-all inline-flex items-center"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Headcount */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center font-bold font-mono text-sm px-2.5 py-0.5 rounded-full bg-white/5 border border-[#C59B4B]/30 text-[#E2B968]">
                            {rsvp.attending ? rsvp.attendees_count : 0}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {rsvp.attending ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Attending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              Regret
                            </span>
                          )}
                        </td>

                        {/* Wishes */}
                        <td className="py-4 px-6 max-w-xs">
                          {rsvp.wishes ? (
                            <p className="text-xs text-[#E5D2B8] italic line-clamp-2 leading-relaxed bg-[#190408]/60 p-2 rounded-lg border border-[#C59B4B]/15">
                              "{rsvp.wishes}"
                            </p>
                          ) : (
                            <span className="text-[#A8957F]/50 italic text-[11px]">No message left</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 px-4 text-right font-mono text-[10px] text-[#A8957F] whitespace-nowrap">
                          {new Date(rsvp.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoupleDashboard;
