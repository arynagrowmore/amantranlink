import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, UploadCloud, Download, Search, Filter, 
  MoreVertical, Share2, Copy, Trash2, Edit2, CheckCircle2, 
  XCircle, Clock, Sparkles, ExternalLink, 
  ShieldCheck, ArrowUpRight, RefreshCw, Check, ChevronDown, 
  HelpCircle, Utensils, ArrowUpDown, AlertCircle, Eye, BarChart3, List,
  QrCode, UserCheck
} from 'lucide-react';
import { fetchWeddingGuests, calculateGuestMetrics, deleteGuest, exportGuestsToCSV } from '../../services/guestService';
import { GuestRecord, GuestCategory, AttendanceStatus } from '../../types/guest';
import { WeddingProjectState } from '../../types/wedding';
import { AddEditGuestModal } from './AddEditGuestModal';
import { BulkImportGuestsModal } from './BulkImportGuestsModal';
import { GuestDetailDrawer } from './GuestDetailDrawer';
import { DeleteGuestModal } from './DeleteGuestModal';
import { RsvpAnalyticsView } from './RsvpAnalyticsView';
import { DigitalEntryPassModal } from './DigitalEntryPassModal';

interface GuestManagementViewProps {
  state: WeddingProjectState;
  weddingSiteId: string;
  userId: string;
  weddingSlug: string;
  onOpenLivePreview?: () => void;
  onOpenVenueCheckIn?: () => void;
}

type SortOption = 'recent' | 'name_asc' | 'name_desc' | 'viewed' | 'rsvp' | 'headcount_desc';

export const GuestManagementView: React.FC<GuestManagementViewProps> = ({
  state,
  weddingSiteId,
  userId,
  weddingSlug,
  onOpenLivePreview,
  onOpenVenueCheckIn,
}) => {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'analytics'>('directory');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'pending' | 'not_attending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawer
  const [selectedGuestForDrawer, setSelectedGuestForDrawer] = useState<GuestRecord | null>(null);
  const [entryPassGuest, setEntryPassGuest] = useState<GuestRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingGuest, setEditingGuest] = useState<GuestRecord | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<GuestRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeddingGuests(weddingSiteId);
      setGuests(data);

      // If drawer is open, keep selected guest fresh
      if (selectedGuestForDrawer) {
        const fresh = data.find(g => g.id === selectedGuestForDrawer.id);
        if (fresh) setSelectedGuestForDrawer(fresh);
      }
    } catch (e: any) {
      console.error('Error fetching guests:', e);
      setError('We could not load your guest list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [weddingSiteId]);

  // Dynamic Metrics Calculation
  const metrics = useMemo(() => calculateGuestMetrics(guests), [guests]);

  // Filtered & Sorted Guests List
  const filteredAndSortedGuests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Filter
    const filtered = guests.filter((g) => {
      const matchesSearch = 
        !q ||
        g.full_name.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.family_name && g.family_name.toLowerCase().includes(q)) ||
        (g.email && g.email.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const rsvpStatus = g.rsvp?.attendance_status || 'Pending';
      if (statusFilter === 'attending' && rsvpStatus !== 'Attending') return false;
      if (statusFilter === 'pending' && rsvpStatus !== 'Pending') return false;
      if (statusFilter === 'not_attending' && rsvpStatus !== 'Not Attending' && rsvpStatus !== 'Maybe') return false;

      if (categoryFilter !== 'all' && g.relationship !== categoryFilter) return false;

      return true;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === 'name_desc') {
        return b.full_name.localeCompare(a.full_name);
      }
      if (sortBy === 'viewed') {
        const aView = a.viewed_at ? new Date(a.viewed_at).getTime() : 0;
        const bView = b.viewed_at ? new Date(b.viewed_at).getTime() : 0;
        return bView - aView;
      }
      if (sortBy === 'rsvp') {
        const order: Record<string, number> = { 'Attending': 1, 'Maybe': 2, 'Pending': 3, 'Not Attending': 4 };
        const aStatus = a.rsvp?.attendance_status || 'Pending';
        const bStatus = b.rsvp?.attendance_status || 'Pending';
        return (order[aStatus] || 5) - (order[bStatus] || 5);
      }
      if (sortBy === 'headcount_desc') {
        return (b.number_of_members || 1) - (a.number_of_members || 1);
      }
      // Default: 'recent' (created_at descending)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [guests, searchQuery, statusFilter, categoryFilter, sortBy]);

  const handleCopyLink = (guest: GuestRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setActiveActionMenuId(null);
    showToast(`Personalized link copied for ${guest.full_name}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmDelete = async (guestId: string) => {
    setIsDeleting(true);
    await deleteGuest(weddingSiteId, guestId);
    setGuests(prev => prev.filter(g => g.id !== guestId));
    if (selectedGuestForDrawer?.id === guestId) {
      setSelectedGuestForDrawer(null);
    }
    setIsDeleting(false);
    setDeletingGuest(null);
    showToast('Guest removed successfully');
  };

  // Close 3-dot dropdown on window click
  useEffect(() => {
    const handleOutside = () => setActiveActionMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  return (
    <div className="space-y-6 font-manrope text-[#20181A] relative">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#350811] text-[#FFFDF8] px-4 py-2.5 rounded-2xl shadow-xl border border-[#C59B4B]/30 flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#F4D06F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PAGE HERO & TAB CONTROLS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              Guest Operations &amp; RSVP
            </span>

            {/* Sub-tab switcher */}
            <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-white text-[#540D1E] shadow-2xs'
                    : 'text-[#6C5D60] hover:text-[#2A171B]'
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#9C772F]" />
                <span>Guest List</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-[#540D1E] shadow-2xs'
                    : 'text-[#6C5D60] hover:text-[#2A171B]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#9C772F]" />
                <span>RSVP Analytics</span>
              </button>
            </div>
          </div>

          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-1 tracking-tight">
            {activeTab === 'directory' 
              ? 'Wedding Guest List' 
              : 'Attendance & Engagement Intelligence'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            {activeTab === 'directory' 
              ? 'Manage personalized invitations, track live RSVP attendance, and oversee guest catering preferences.'
              : 'Real-time analytics on invitation views, confirmed catering headcount, and follow-up reminders.'}
          </p>
        </div>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          
          {/* 🎟️ Venue Check-in Button */}
          {onOpenVenueCheckIn && (
            <button
              type="button"
              onClick={onOpenVenueCheckIn}
              className="px-3.5 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F5EFE4] text-[#540D1E] border border-[#E8DFD1] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Open Venue Check-in Scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-[#9C772F]" />
              <span>Venue Check-In</span>
            </button>
          )}

          <div className="flex items-center rounded-xl bg-white border border-[#E8DFD1] shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-[#4A3E40] hover:text-[#350811] hover:bg-[#FBF8F2] flex items-center gap-1.5 transition-colors cursor-pointer border-r border-[#E8DFD1]"
              title="Import guests from a CSV spreadsheet"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#9C772F]" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={() => exportGuestsToCSV(guests, weddingSlug, originUrl)}
              disabled={guests.length === 0}
              className="px-3 py-2 text-xs font-semibold text-[#4A3E40] hover:text-[#350811] hover:bg-[#FBF8F2] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              title="Export guest directory and RSVPs to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#9C772F]" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingGuest(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] active:bg-[#430914] text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer ring-1 ring-[#C59B4B]/30"
          >
            <UserPlus className="w-4 h-4 text-[#F4D06F]" />
            <span>+ Add Guest</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT: ANALYTICS VS DIRECTORY                                    */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' ? (
        
        /* 📊 RSVP ANALYTICS VIEW */
        <RsvpAnalyticsView
          guests={guests}
          state={state}
          weddingSlug={weddingSlug}
          onSelectGuest={(g) => setSelectedGuestForDrawer(g)}
        />

      ) : (

        /* 👥 DIRECTORY TABLE VIEW */
        <>
          {/* Top 4 Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#E8DFD1] animate-pulse space-y-3">
                  <div className="h-3 bg-[#F0EAE1] rounded w-24" />
                  <div className="h-8 bg-[#F0EAE1] rounded w-16" />
                  <div className="h-2.5 bg-[#F0EAE1] rounded w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Card 1: TOTAL GUESTS */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#736567] uppercase">
                    Total Guests
                  </span>
                  <Users className="w-4 h-4 text-[#8C7A7C]" />
                </div>
                <div className="mt-2.5">
                  <div className="font-cormorant font-bold text-3xl text-[#2A171B] leading-none">
                    {metrics.totalGuests}
                  </div>
                  <p className="text-[11px] text-[#736567] mt-1.5 font-medium">
                    {metrics.totalMembersCount} expected members
                  </p>
                </div>
              </div>

              {/* Card 2: CONFIRMED ATTENDING */}
              <div className="p-4 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#136A4E] uppercase">
                    Confirmed Attending
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#167A5A]" />
                </div>
                <div className="mt-2.5">
                  <div className="font-cormorant font-bold text-3xl text-[#136A4E] leading-none">
                    {metrics.confirmedAttendingCount}
                  </div>
                  <p className="text-[11px] text-[#247559] mt-1.5 font-medium">
                    {metrics.confirmedAttendingMembers} confirmed members · {metrics.responseRatePercent}% response
                  </p>
                </div>
              </div>

              {/* Card 3: PENDING RESPONSES */}
              <div className="p-4 rounded-2xl bg-white border border-[#F2DEB0] shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#976008] uppercase">
                    Pending Responses
                  </span>
                  <Clock className="w-4 h-4 text-[#C59B4B]" />
                </div>
                <div className="mt-2.5">
                  <div className="font-cormorant font-bold text-3xl text-[#976008] leading-none">
                    {metrics.pendingCount}
                  </div>
                  <p className="text-[11px] text-[#9C772F] mt-1.5 font-medium">
                    {metrics.viewedInvitationsCount} invitations viewed · awaiting RSVP
                  </p>
                </div>
              </div>

              {/* Card 4: NOT ATTENDING & MAYBE */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8D9D8] shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#8C4A4A] uppercase">
                    Not Attending
                  </span>
                  <XCircle className="w-4 h-4 text-[#A86565]" />
                </div>
                <div className="mt-2.5">
                  <div className="font-cormorant font-bold text-3xl text-[#8C4A4A] leading-none">
                    {metrics.notAttendingCount}
                  </div>
                  <p className="text-[11px] text-[#8C6D6E] mt-1.5 font-medium">
                    {metrics.maybeCount > 0 ? `${metrics.maybeCount} marked as Maybe` : 'Regrets received'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Directory Toolbar */}
          <div className="p-2.5 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#9C8C8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, family..."
                className="w-full pl-8.5 pr-3 py-1.5 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#2A171B] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
              <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-[11px]">
                {(
                  [
                    { id: 'all', label: 'All Guests' },
                    { id: 'attending', label: 'Attending' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'not_attending', label: 'Not Attending' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? 'bg-white text-[#540D1E] font-bold shadow-2xs'
                        : 'text-[#6C5D60] hover:text-[#2A171B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-2.5 pr-7 py-1 bg-[#FAF6EF] hover:bg-[#F5EFE4] border border-[#E8DFD1] rounded-xl text-[11px] font-semibold text-[#4A3E40] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Groups</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="VIP">VIP</option>
                  <option value="Relative">Relative</option>
                  <option value="Business">Business</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#736567] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-2.5 pr-7 py-1 bg-[#FAF6EF] hover:bg-[#F5EFE4] border border-[#E8DFD1] rounded-xl text-[11px] font-semibold text-[#4A3E40] focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name_asc">Name (A–Z)</option>
                  <option value="name_desc">Name (Z–A)</option>
                  <option value="viewed">Recently Viewed</option>
                  <option value="rsvp">RSVP Status</option>
                  <option value="headcount_desc">Headcount (High–Low)</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-[#736567] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <span className="text-[11px] font-mono font-semibold bg-[#F4EFE6] text-[#6C5D60] px-2.5 py-1 rounded-lg border border-[#E8DFD1]">
                {filteredAndSortedGuests.length} {filteredAndSortedGuests.length === 1 ? 'guest' : 'guests'}
              </span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F0D5D5] flex items-center justify-between gap-3 text-xs text-[#8C4A4A]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadGuests}
                className="px-3 py-1 bg-white border border-[#F0D5D5] rounded-lg font-bold text-xs text-[#8C4A4A] hover:bg-[#FAF2F2] transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Directory Table */}
          {guests.length === 0 ? (
            <div className="p-8 sm:p-10 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#FAF4E8] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant font-bold text-xl text-[#350811]">
                Your guest list is ready to begin
              </h3>
              <p className="text-xs text-[#6C5D60] mt-1 max-w-sm mx-auto leading-relaxed">
                Add your first guest to create a personalized invitation link and start tracking RSVP responses.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuest(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4.5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>+ Add First Guest</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="text-xs font-semibold text-[#8C6D2E] hover:text-[#540D1E] hover:underline cursor-pointer py-1"
                >
                  Import guests from CSV
                </button>
              </div>
            </div>
          ) : filteredAndSortedGuests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs">
              <p className="text-xs text-[#736567]">No guests match your active search or filter selection.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-[#9C772F] hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs overflow-visible">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EF] border-b border-[#E8DFD1] text-[#736567] uppercase font-mono font-bold text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Family / Group</th>
                      <th className="py-3 px-4 text-center">Members</th>
                      <th className="py-3 px-4">Invitation</th>
                      <th className="py-3 px-4">RSVP Status</th>
                      <th className="py-3 px-4">Meal Preference</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {filteredAndSortedGuests.map((g) => {
                      const rsvpStatus = g.rsvp?.attendance_status || 'Pending';
                      const initials = g.full_name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join('');

                      return (
                        <tr 
                          key={g.id} 
                          className={`transition-colors cursor-pointer group ${
                            selectedGuestForDrawer?.id === g.id ? 'bg-[#FAF4E8]/80' : 'hover:bg-[#FAF6EF]/70'
                          }`}
                          onClick={() => setSelectedGuestForDrawer(g)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs ${
                                g.relationship === 'VIP'
                                  ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#E8D5AD]'
                                  : 'bg-[#F4EFE6] text-[#540D1E] border-[#E8DFD1]'
                              }`}>
                                {initials || 'G'}
                              </div>
                              <div>
                                <div className="font-semibold text-[#20181A] group-hover:text-[#540D1E] transition-colors">
                                  {g.full_name}
                                </div>
                                <div className="text-[10px] text-[#8C7A7C]">
                                  {g.relationship}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-[#2A171B]">{g.phone}</div>
                            {g.email ? (
                              <div className="text-[10px] text-[#8C7A7C] truncate max-w-[140px]" title={g.email}>
                                {g.email}
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-[#350811]">
                                {g.family_name || '—'}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.2 text-[9px] font-semibold rounded-md border ${
                                g.relationship === 'VIP' 
                                  ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#E8D5AD]'
                                  : g.relationship === 'Family'
                                  ? 'bg-[#F4EFE6] text-[#540D1E] border-[#E8DFD1]'
                                  : 'bg-[#F7F4F0] text-[#5C5052] border-[#E5DDD9]'
                              }`}>
                                {g.relationship}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-[#350811]">
                              {g.rsvp?.attendance_status === 'Attending'
                                ? `${g.rsvp.attending_member_count || g.number_of_members} attending`
                                : `${g.number_of_members || 1} members`}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {g.invitation_status === 'viewed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#136A4E] bg-[#EDF7F2] border border-[#BCE3D1] px-2 py-0.5 rounded-full" title={g.viewed_at ? `Viewed on ${new Date(g.viewed_at).toLocaleDateString('en-IN')}` : 'Viewed'}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
                                ◉ Viewed
                              </span>
                            ) : g.invitation_status === 'delivered' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#24638F] bg-[#EEF5FA] border border-[#CDE0ED] px-2 py-0.5 rounded-full">
                                ✓ Delivered
                              </span>
                            ) : g.invitation_status === 'sent' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#976008] bg-[#FFF8EC] border border-[#F2DEB0] px-2 py-0.5 rounded-full">
                                ↗ Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#736567] bg-[#F4EFE6] border border-[#E8DFD1] px-2 py-0.5 rounded-full">
                                ○ Draft
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {rsvpStatus === 'Attending' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#136A4E] bg-[#EDF7F2] border border-[#BCE3D1] px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-[#167A5A]" />
                                Attending
                              </span>
                            ) : rsvpStatus === 'Not Attending' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C4A4A] bg-[#FDF2F2] border border-[#F0D5D5] px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3 text-[#A86565]" />
                                Not Attending
                              </span>
                            ) : rsvpStatus === 'Maybe' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6B5E7A] bg-[#F4F0F7] border border-[#DDD6E5] px-2 py-0.5 rounded-full">
                                ⏳ Maybe
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#976008] bg-[#FFF8EC] border border-[#F2DEB0] px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[#4A3E40]">
                            {g.rsvp?.meal_preference ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#20181A] bg-[#FAF6EF] border border-[#E8DFD1] px-2 py-0.5 rounded-md">
                                <Utensils className="w-3 h-3 text-[#9C772F]" />
                                {g.rsvp.meal_preference}
                              </span>
                            ) : (
                              <span className="text-[#A09395] text-[10px] italic">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActiveActionMenuId(activeActionMenuId === g.id ? null : g.id)}
                                className="p-1.5 rounded-lg hover:bg-[#EAE2D5] text-[#5C5052] transition-colors cursor-pointer"
                                title="Guest Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeActionMenuId === g.id && (
                                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-[#E8DFD1] shadow-xl text-[11px] z-30 py-1 font-medium animate-fadeIn">
                                  
                                  {/* 1. Open Live Invitation */}
                                  <a
                                    href={`${originUrl}/i/${weddingSlug}?guest=${g.personal_invitation_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveActionMenuId(null)}
                                    className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#540D1E] cursor-pointer font-semibold"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#9C772F]" />
                                    <span>Open Invitation</span>
                                  </a>

                                  {/* 2. QR Entry Pass (if Attending) */}
                                  {rsvpStatus === 'Attending' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEntryPassGuest(g);
                                        setActiveActionMenuId(null);
                                      }}
                                      className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#540D1E] cursor-pointer font-semibold"
                                    >
                                      <QrCode className="w-3.5 h-3.5 text-[#9C772F]" />
                                      <span>View QR Entry Pass</span>
                                    </button>
                                  )}

                                  {/* 3. Copy Personal Link */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyLink(g, e)}
                                    className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#4A3E40] cursor-pointer"
                                  >
                                    {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#9C772F]" />}
                                    <span>{copiedId === g.id ? 'Copied Link!' : 'Copy Personal Link'}</span>
                                  </button>

                                  {/* 4. View Guest Details */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedGuestForDrawer(g);
                                      setActiveActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#4A3E40] cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#9C772F]" />
                                    <span>View Guest Details</span>
                                  </button>

                                  {/* 5. Edit Guest */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGuest(g);
                                      setIsAddModalOpen(true);
                                      setActiveActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#4A3E40] cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#9C772F]" />
                                    <span>Edit Guest</span>
                                  </button>

                                  <div className="h-px bg-[#F0EAE1] my-1" />

                                  {/* 6. Delete Guest */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingGuest(g);
                                      setActiveActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-[#FDF2F2] flex items-center gap-2 text-[#8C4A4A] cursor-pointer font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Guest</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="lg:hidden divide-y divide-[#F2ECE1]">
                {filteredAndSortedGuests.map((g) => {
                  const rsvpStatus = g.rsvp?.attendance_status || 'Pending';
                  const initials = g.full_name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join('');

                  return (
                    <div 
                      key={g.id} 
                      className={`p-3.5 space-y-2.5 transition-colors cursor-pointer ${
                        selectedGuestForDrawer?.id === g.id ? 'bg-[#FAF4E8]/80' : 'hover:bg-[#FAF6EF]/60'
                      }`}
                      onClick={() => setSelectedGuestForDrawer(g)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            g.relationship === 'VIP'
                              ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#E8D5AD]'
                              : 'bg-[#F4EFE6] text-[#540D1E] border-[#E8DFD1]'
                          }`}>
                            {initials || 'G'}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[#20181A]">{g.full_name}</div>
                            <div className="text-[10px] font-mono text-[#736567]">{g.phone}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {rsvpStatus === 'Attending' && (
                            <button
                              type="button"
                              onClick={() => setEntryPassGuest(g)}
                              className="p-1.5 rounded-lg bg-[#FAF6EF] text-[#540D1E] border border-[#E8DFD1]"
                              title="QR Pass"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#9C772F]" />
                            </button>
                          )}

                          <a
                            href={`${originUrl}/i/${weddingSlug}?guest=${g.personal_invitation_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#FAF6EF] text-[#540D1E] border border-[#E8DFD1]"
                            title="Open Invitation"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#9C772F]" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(g, e)}
                            className="p-1.5 rounded-lg bg-[#FAF6EF] text-[#8C6D2E] border border-[#E8DFD1]"
                            title="Copy Link"
                          >
                            {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingGuest(g);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1]"
                            title="Edit Guest"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F2ECE1]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#736567]">Group:</span>
                          <span className="font-semibold text-[#20181A]">{g.family_name || g.relationship}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#736567]">Members:</span>
                          <span className="font-bold text-[#540D1E]">
                            {rsvpStatus === 'Attending' ? `${g.rsvp?.attending_member_count || g.number_of_members} attending` : `Exp: ${g.number_of_members || 1}`}
                          </span>
                        </div>

                        <div>
                          {rsvpStatus === 'Attending' ? (
                            <span className="text-[10px] font-bold text-[#136A4E] bg-[#EDF7F2] px-2 py-0.5 rounded-full">
                              Attending
                            </span>
                          ) : rsvpStatus === 'Not Attending' ? (
                            <span className="text-[10px] font-bold text-[#8C4A4A] bg-[#FDF2F2] px-2 py-0.5 rounded-full">
                              Declined
                            </span>
                          ) : rsvpStatus === 'Maybe' ? (
                            <span className="text-[10px] font-bold text-[#6B5E7A] bg-[#F4F0F7] px-2 py-0.5 rounded-full">
                              Maybe
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#976008] bg-[#FFF8EC] px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 👑 Guest Detail Drawer (Slide-in right / Mobile sheet) */}
      <GuestDetailDrawer
        isOpen={Boolean(selectedGuestForDrawer)}
        onClose={() => setSelectedGuestForDrawer(null)}
        guest={selectedGuestForDrawer}
        state={state}
        weddingSlug={weddingSlug}
        onEditGuest={(g) => {
          setEditingGuest(g);
          setIsAddModalOpen(true);
        }}
        onDeleteGuest={(guestId) => {
          const target = guests.find(g => g.id === guestId);
          if (target) setDeletingGuest(target);
        }}
        onOpenEntryPass={(g) => setEntryPassGuest(g)}
      />

      {/* 🎫 Digital Entry Pass Modal */}
      <DigitalEntryPassModal
        isOpen={Boolean(entryPassGuest)}
        onClose={() => setEntryPassGuest(null)}
        guest={entryPassGuest}
        state={state}
        weddingSlug={weddingSlug}
        weddingSiteId={weddingSiteId}
      />

      {/* ➕ Add / Edit Guest Modal */}
      <AddEditGuestModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGuest(null);
        }}
        weddingSiteId={weddingSiteId}
        weddingSlug={weddingSlug}
        userId={userId}
        editingGuest={editingGuest}
        onSaved={(saved) => {
          loadGuests();
          showToast(editingGuest ? 'Guest details updated' : 'Guest added successfully');
          if (selectedGuestForDrawer?.id === saved.id) {
            setSelectedGuestForDrawer(saved);
          }
        }}
      />

      {/* 🗑️ Delete Guest Confirmation Modal */}
      <DeleteGuestModal
        isOpen={Boolean(deletingGuest)}
        onClose={() => setDeletingGuest(null)}
        guest={deletingGuest}
        loading={isDeleting}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* 📥 Bulk Import Modal */}
      <BulkImportGuestsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        weddingSiteId={weddingSiteId}
        weddingSlug={weddingSlug}
        userId={userId}
        onImportComplete={(count) => {
          loadGuests();
          showToast(`${count} guests imported successfully`);
        }}
      />
    </div>
  );
};

export default GuestManagementView;
