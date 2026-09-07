import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Heart, Download, Search, 
  RefreshCw, MessageCircle, ExternalLink, ArrowLeft, 
  Sparkles, Filter, ShieldCheck, Share2, UserCheck, ListOrdered, Check, Camera, Printer, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWeddingRsvps, exportRsvpsToCSV, RsvpRecord, RsvpSummary } from '../services/rsvpService';
import { WeddingProjectState } from '../types/wedding';
import { GuestManagementView } from './Guest/GuestManagementView';
import { CoupleMemoriesDashboard } from './Memories/CoupleMemoriesDashboard';
import { ExportCenterView } from './Export/ExportCenterView';

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
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'memories' | 'exports'>('guests');
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

  const weddingSlug = `${(state.couple.groomEn || 'dhruv').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'shreya').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const coupleName = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;
  const resolvedSiteId = siteId || `site_${weddingSlug}`;
  const resolvedUserId = user?.uid || 'guest_user';

  const loadRsvpData = async () => {
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

  // Filtered RSVP List
  const filteredRsvps = summary.rsvps.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      r.guest_name.toLowerCase().includes(q) ||
      r.guest_phone.includes(q) ||
      (r.wishes && r.wishes.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filterType === 'attending') return r.attending;
    if (filterType === 'regrets') return !r.attending;
    return true;
  });

  const handleCopyInviteLink = () => {
    const fullUrl = `${window.location.origin}/i/${weddingSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope selection:bg-[#C59B4B]/30 pb-20">
      
      {/* ========================================================================= */}
      {/* 1. TOP ATELIER BAR                                                        */}
      {/* ========================================================================= */}
      <header className="border-b border-[#E8D5AD]/60 bg-[#FFFDF8] text-[#241A17] sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        
        {/* Left Side: Back & Atelier Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-[#E8D5AD] text-[#350811] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Studio Atelier"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Invitation Atelier</span>
          </button>

          <div className="hidden sm:flex flex-col border-l border-[#E8D5AD]/60 pl-3">
            <span className="font-cormorant font-bold text-base tracking-wider text-[#350811] block leading-none">
              AMANTRAN<span className="text-[#C49A35]">LINK</span>
            </span>
            <span className="text-[8px] font-mono font-medium text-[#8C7A73] uppercase tracking-widest block leading-none mt-0.5">
              COUPLE WEDDING WORKSPACE
            </span>
          </div>
        </div>

        {/* Right Side: Tab Navigation & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Atelier Navigation Tabs */}
          <div className="hidden md:flex items-center p-0.5 rounded-lg bg-[#F8F3E8] border border-[#E8D5AD]/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guests'
                  ? 'bg-[#FFFDF8] text-[#350811] shadow-2xs font-bold'
                  : 'text-[#75675C] hover:text-[#350811]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Guest Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rsvps')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rsvps'
                  ? 'bg-[#FFFDF8] text-[#350811] shadow-2xs font-bold'
                  : 'text-[#75675C] hover:text-[#350811]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>RSVP Responses ({summary.totalRsvps})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'memories'
                  ? 'bg-[#FFFDF8] text-[#350811] shadow-2xs font-bold'
                  : 'text-[#75675C] hover:text-[#350811]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Memories &amp; Wall</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'exports'
                  ? 'bg-[#FFFDF8] text-[#350811] shadow-2xs font-bold'
                  : 'text-[#75675C] hover:text-[#350811]'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Export &amp; Print</span>
            </button>
          </div>

          {/* Share Invitation CTA */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3.5 py-1.5 rounded-lg bg-[#6E1020] hover:bg-[#520B17] text-[#FFFDF8] text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Copy Public Wedding Invitation Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#F4D06F]" /> : <Share2 className="w-3.5 h-3.5 text-[#F4D06F]" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Invitation'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#FFFDF8] border-b border-[#E8D5AD]/60 p-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('guests')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'guests' ? 'bg-[#6E1020] text-white font-bold' : 'text-[#75675C]'
          }`}
        >
          Guests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rsvps')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'rsvps' ? 'bg-[#6E1020] text-white font-bold' : 'text-[#75675C]'
          }`}
        >
          RSVP ({summary.totalRsvps})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('memories')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'memories' ? 'bg-[#6E1020] text-white font-bold' : 'text-[#75675C]'
          }`}
        >
          Memories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exports')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'exports' ? 'bg-[#6E1020] text-white font-bold' : 'text-[#75675C]'
          }`}
        >
          Export
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN BODY CONTAINER                                                       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        
        {/* 👑 WEDDING HERO IDENTITY & EDITORIAL PULSE */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_4px_25px_rgba(36,26,23,0.04)] relative overflow-hidden">
          {/* Subtle watermark crest */}
          <div className="absolute right-6 top-6 opacity-5 pointer-events-none select-none text-9xl font-serif text-[#C49A35]">
            🏰
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left Column: Couple Identity & Emotional Story Status */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C49A35] uppercase font-bold">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <span className="text-[#8C7A73]">·</span>
                <span className="text-xs font-mono text-[#8C7A73] uppercase tracking-wider">
                  {state.couple.venueName || 'Udaipur, Rajasthan'} · {state.couple.weddingDate || '18 February 2027'}
                </span>
              </div>

              <h1 className="font-cormorant text-2xl sm:text-4xl font-bold text-[#350811] tracking-tight">
                {coupleName.toUpperCase()}
              </h1>

              <p className="text-xs sm:text-sm text-[#75675C] leading-relaxed">
                Your wedding is taking shape beautifully. Every guest response, blessing and moment gathered in one sacred atelier.
              </p>
            </div>

            {/* Right Column: Next in Your Wedding Journey & Quick Actions */}
            <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-[#E8D5AD]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:min-w-[420px]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E1020] font-bold block">
                  Next in your wedding journey
                </span>
                <p className="text-xs font-semibold text-[#241A17] leading-snug">
                  {summary.totalRsvps === 0
                    ? 'Your invitation is ready to personalize and share with families.'
                    : `${summary.totalAttendingCount} families have confirmed. Review dietary choices & passes.`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onBackToStudio}
                  className="px-4 py-2 rounded-lg bg-[#6E1020] hover:bg-[#520B17] text-white text-xs font-bold tracking-wide transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <span>Open Atelier</span>
                </button>
              </div>
            </div>
          </div>

          {/* 📊 Asymmetric Wedding Pulse Strip */}
          <div className="mt-8 pt-6 border-t border-[#E8D5AD]/60 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A73] font-bold block">
                Invitations
              </span>
              <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] leading-none">
                {summary.totalRsvps > 0 ? `${summary.totalRsvps} Families` : 'Ready to Share'}
              </div>
              <span className="text-[11px] text-[#75675C] block">Personalized Digital Passes</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A73] font-bold block">
                RSVP Responses
              </span>
              <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#167A5A] leading-none">
                {summary.totalAttendingCount} Confirmed
              </div>
              <span className="text-[11px] text-[#75675C] block">
                {summary.totalRegretsCount > 0 ? `${summary.totalRegretsCount} Declining` : 'Awaiting responses'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A73] font-bold block">
                Expected Guests
              </span>
              <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] leading-none">
                {summary.totalAttendingCount > 0 ? `${summary.totalAttendingCount} Guests` : '0 Headcount'}
              </div>
              <span className="text-[11px] text-[#75675C] block">Confirmed Headcount</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A73] font-bold block">
                Ceremony Muhurat
              </span>
              <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] leading-none">
                {state.couple.muhuratTime || '06:30 PM'}
              </div>
              <span className="text-[11px] text-[#75675C] block">Auspicious Vivah Pheras</span>
            </div>
          </div>
        </section>

        {/* TAB 1: GUEST MANAGEMENT VIEW */}
        {activeTab === 'guests' && (
          <GuestManagementView
            state={state}
            weddingSiteId={resolvedSiteId}
            userId={resolvedUserId}
            weddingSlug={weddingSlug}
            onOpenVenueCheckIn={() => {
              if (typeof window !== 'undefined') {
                window.location.search = '?view=checkin';
              }
            }}
          />
        )}

        {/* TAB 2: RSVP RESPONSES DIRECTORY */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
                  RSVP Intelligence
                </span>
                <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5 tracking-tight">
                  Guest RSVP Responses
                </h1>
                <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
                  Real-time guest submissions, confirmed headcount counts, meal choices, and family wishes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportRsvpsToCSV(summary.rsvps, weddingSlug)}
                disabled={summary.rsvps.length === 0}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40] hover:text-[#350811] hover:bg-[#FBF8F2] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 self-start sm:self-auto shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#9C772F]" />
                <span>Export RSVPs to CSV</span>
              </button>
            </div>

            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
                <span className="text-[11px] font-mono font-bold uppercase text-[#736567]">Total Submissions</span>
                <div className="font-cormorant font-bold text-3xl text-[#2A171B] mt-2">
                  {summary.totalRsvps}
                </div>
                <p className="text-[11px] text-[#736567] mt-1">Recorded in Cloud</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs">
                <span className="text-[11px] font-mono font-bold uppercase text-[#136A4E]">Confirmed Attending</span>
                <div className="font-cormorant font-bold text-3xl text-[#136A4E] mt-2">
                  {summary.totalAttendingCount}
                </div>
                <p className="text-[11px] text-[#247559] mt-1">Confirmed guest headcount</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8D9D8] shadow-2xs">
                <span className="text-[11px] font-mono font-bold uppercase text-[#8C4A4A]">Regrets Received</span>
                <div className="font-cormorant font-bold text-3xl text-[#8C4A4A] mt-2">
                  {summary.totalRegretsCount}
                </div>
                <p className="text-[11px] text-[#8C6D6E] mt-1">Unable to attend</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-2.5 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-[#9C8C8E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search RSVP responses by name, phone, wishes..."
                  className="w-full pl-8.5 pr-3 py-1.5 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#2A171B] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                />
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-[11px]">
                {(
                  [
                    { id: 'all', label: 'All Responses' },
                    { id: 'attending', label: 'Attending' },
                    { id: 'regrets', label: 'Declined' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      filterType === tab.id
                        ? 'bg-white text-[#540D1E] font-bold shadow-2xs'
                        : 'text-[#6C5D60] hover:text-[#2A171B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RSVP Table */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs">
                <RefreshCw className="w-5 h-5 text-[#9C772F] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#6C5D60]">Loading RSVP responses...</p>
              </div>
            ) : filteredRsvps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs">
                <p className="text-xs text-[#736567]">No matching RSVP submissions found.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] border-b border-[#E8DFD1] text-[#736567] uppercase font-mono font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Guest</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Headcount</th>
                        <th className="py-3 px-4">Meal Choice</th>
                        <th className="py-3 px-4">Wishes / Note</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {filteredRsvps.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAF6EF]/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#20181A]">
                            {r.guest_name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#736567]">
                            {r.guest_phone}
                          </td>
                          <td className="py-3 px-4">
                            {r.attending ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#136A4E] bg-[#EDF7F2] border border-[#BCE3D1] px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Attending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C4A4A] bg-[#FDF2F2] border border-[#F0D5D5] px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Declined
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#350811]">
                            {r.attending ? r.attendees_count : 0}
                          </td>
                          <td className="py-3 px-4 text-[#4A3E40]">
                            {r.meal_preference || 'Standard'}
                          </td>
                          <td className="py-3 px-4 text-[#736567] max-w-xs truncate" title={r.wishes || r.special_note}>
                            {r.wishes || r.special_note || '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-[11px] text-[#8C7A7C]">
                            {new Date(r.responded_at || r.created_at).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMORIES & WISHES MODERATION */}
        {activeTab === 'memories' && (
          <CoupleMemoriesDashboard
            state={state}
            weddingSlug={weddingSlug}
            weddingSiteId={resolvedSiteId}
            userId={resolvedUserId}
          />
        )}

        {/* TAB 4: INVITATION EXPORT & DOWNLOAD STUDIO */}
        {activeTab === 'exports' && (
          <ExportCenterView
            state={state}
            weddingSlug={weddingSlug}
            weddingSiteId={resolvedSiteId}
            userId={resolvedUserId}
          />
        )}
      </main>
    </div>
  );
};

export default CoupleDashboard;
