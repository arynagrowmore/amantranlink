import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Heart, Download, Search, 
  RefreshCw, MessageCircle, ExternalLink, ArrowLeft, 
  Sparkles, Filter, ShieldCheck, Share2, UserCheck, ListOrdered, Check, Camera, Printer
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
      {/* 1. TOP APPLICATION BAR (Deep Royal Burgundy)                              */}
      {/* ========================================================================= */}
      <header className="border-b border-[#31060D] bg-[#430914] text-[#FDFBF7] sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        
        {/* Left Side: Back & Portal Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F4D06F] transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Return to Studio Editor"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#E2B968] uppercase font-bold">
                AmantranLink · Couple Portal
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Sync
              </span>
            </div>
            <h1 className="font-cormorant text-lg sm:text-xl font-bold text-[#FFFDF8] tracking-wide leading-tight">
              {coupleName}’s Vivah Portal
            </h1>
          </div>
        </div>

        {/* Right Side: Tab Switcher & Share Public Link */}
        <div className="flex items-center gap-2.5">
          
          {/* Restrained Tab Switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-[#2A050D] border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guests'
                  ? 'bg-white text-[#430914] font-bold shadow-2xs'
                  : 'text-[#D9C8CB] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Guest Management</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rsvps')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rsvps'
                  ? 'bg-white text-[#430914] font-bold shadow-2xs'
                  : 'text-[#D9C8CB] hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>RSVP Responses ({summary.totalRsvps})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'memories'
                  ? 'bg-white text-[#430914] font-bold shadow-2xs'
                  : 'text-[#D9C8CB] hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Memories &amp; Wishes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'exports'
                  ? 'bg-white text-[#430914] font-bold shadow-2xs'
                  : 'text-[#D9C8CB] hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export &amp; Download</span>
            </button>
          </div>

          {/* Secondary Action: Share Public Link */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F7E7C4] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            title="Copy Public Wedding Invitation Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#E2B968]" />}
            <span>{copiedLink ? 'Copied!' : 'Share Public Link'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="sm:hidden flex items-center justify-around bg-[#33070F] border-b border-[#430914] p-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('guests')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'guests' ? 'bg-white text-[#430914] font-bold' : 'text-[#D9C8CB]'
          }`}
        >
          Guest List
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rsvps')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'rsvps' ? 'bg-white text-[#430914] font-bold' : 'text-[#D9C8CB]'
          }`}
        >
          RSVP ({summary.totalRsvps})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('memories')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'memories' ? 'bg-white text-[#430914] font-bold' : 'text-[#D9C8CB]'
          }`}
        >
          Memories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exports')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
            activeTab === 'exports' ? 'bg-white text-[#430914] font-bold' : 'text-[#D9C8CB]'
          }`}
        >
          Export
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN BODY CONTAINER                                                       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        
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
