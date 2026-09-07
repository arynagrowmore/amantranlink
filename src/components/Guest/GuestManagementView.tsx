import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, UploadCloud, Download, Search, 
  Share2, Copy, Trash2, Edit2, CheckCircle2, 
  XCircle, Clock, Sparkles, ExternalLink, 
  ArrowUpRight, Check, ChevronDown, ChevronRight,
  HelpCircle, Utensils, ArrowUpDown, AlertCircle, Eye, BarChart3, List,
  QrCode, UserCheck, Heart, Crown, Phone, Mail, BookOpen
} from 'lucide-react';
import { fetchWeddingGuests, calculateGuestMetrics, deleteGuest, exportGuestsToCSV } from '../../services/guestService';
import { GuestRecord, GuestCategory, AttendanceStatus } from '../../types/guest';
import { WeddingProjectState } from '../../types/wedding';
import { formatWhatsAppWeddingMessage, openWhatsAppShare } from '../../utils/whatsappShare';
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

type SortOption = 'recent' | 'family_asc' | 'name_asc' | 'headcount_desc' | 'rsvp';
type RsvpFilter = 'all' | 'attending' | 'pending' | 'maybe' | 'not_attending' | 'vip';

interface FamilyGroup {
  familyName: string;
  isCustomFamily: boolean;
  totalMembers: number;
  vip: boolean;
  guests: GuestRecord[];
  primaryGuest: GuestRecord;
  rsvpSummary: {
    attending: number;
    pending: number;
    maybe: number;
    notAttending: number;
    status: AttendanceStatus;
  };
}

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
  const [activeTab, setActiveTab] = useState<'guestbook' | 'analytics'>('guestbook');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('all');
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

  // Group Guests by Family
  const familyGroups = useMemo(() => {
    const map = new Map<string, GuestRecord[]>();

    guests.forEach(g => {
      // Determine family group key
      let key = (g.family_name || '').trim();
      if (!key) {
        // Fallback: derive family from full name
        const parts = g.full_name.trim().split(' ');
        if (parts.length > 1) {
          key = `${parts[parts.length - 1]} Family`;
        } else {
          key = `${g.full_name}'s Family`;
        }
      }
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(g);
    });

    const groups: FamilyGroup[] = [];
    map.forEach((familyGuests, familyName) => {
      const isCustomFamily = familyGuests.some(g => Boolean(g.family_name));
      const totalMembers = familyGuests.reduce((sum, g) => {
        const count = g.rsvp?.attendance_status === 'Attending'
          ? (g.rsvp.attending_member_count || g.number_of_members || 1)
          : (g.number_of_members || 1);
        return sum + count;
      }, 0);

      const hasVip = familyGuests.some(g => g.relationship === 'VIP');

      let attending = 0;
      let pending = 0;
      let maybe = 0;
      let notAttending = 0;

      familyGuests.forEach(g => {
        const st = g.rsvp?.attendance_status || 'Pending';
        if (st === 'Attending') attending++;
        else if (st === 'Maybe') maybe++;
        else if (st === 'Not Attending') notAttending++;
        else pending++;
      });

      let overallStatus: AttendanceStatus = 'Pending';
      if (attending > 0 && pending === 0 && notAttending === 0 && maybe === 0) {
        overallStatus = 'Attending';
      } else if (notAttending > 0 && attending === 0 && pending === 0 && maybe === 0) {
        overallStatus = 'Not Attending';
      } else if (maybe > 0 && attending === 0) {
        overallStatus = 'Maybe';
      } else if (attending > 0) {
        overallStatus = 'Attending';
      }

      groups.push({
        familyName,
        isCustomFamily,
        totalMembers,
        vip: hasVip,
        guests: familyGuests,
        primaryGuest: familyGuests[0],
        rsvpSummary: {
          attending,
          pending,
          maybe,
          notAttending,
          status: overallStatus,
        }
      });
    });

    return groups;
  }, [guests]);

  // Filtered & Sorted Family Groups
  const filteredFamilyGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = familyGroups.filter(fg => {
      // 1. Search Match
      const matchesSearch = !q ||
        fg.familyName.toLowerCase().includes(q) ||
        fg.guests.some(g => 
          g.full_name.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          (g.email && g.email.toLowerCase().includes(q)) ||
          g.relationship.toLowerCase().includes(q)
        );

      if (!matchesSearch) return false;

      // 2. RSVP Filter
      if (rsvpFilter === 'attending' && fg.rsvpSummary.attending === 0) return false;
      if (rsvpFilter === 'pending' && fg.rsvpSummary.pending === 0) return false;
      if (rsvpFilter === 'maybe' && fg.rsvpSummary.maybe === 0) return false;
      if (rsvpFilter === 'not_attending' && fg.rsvpSummary.notAttending === 0) return false;
      if (rsvpFilter === 'vip' && !fg.vip) return false;

      // 3. Category Filter
      if (categoryFilter !== 'all' && !fg.guests.some(g => g.relationship === categoryFilter)) {
        return false;
      }

      return true;
    });

    // 4. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'family_asc') {
        return a.familyName.localeCompare(b.familyName);
      }
      if (sortBy === 'name_asc') {
        return a.primaryGuest.full_name.localeCompare(b.primaryGuest.full_name);
      }
      if (sortBy === 'headcount_desc') {
        return b.totalMembers - a.totalMembers;
      }
      if (sortBy === 'rsvp') {
        const order: Record<string, number> = { 'Attending': 1, 'Maybe': 2, 'Pending': 3, 'Not Attending': 4 };
        return (order[a.rsvpSummary.status] || 5) - (order[b.rsvpSummary.status] || 5);
      }
      // Default: recent (newest primary guest created_at)
      return new Date(b.primaryGuest.created_at || 0).getTime() - new Date(a.primaryGuest.created_at || 0).getTime();
    });
  }, [familyGroups, searchQuery, rsvpFilter, categoryFilter, sortBy]);

  const handleCopyLink = (guest: GuestRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    showToast(`Personal invitation link copied for ${guest.family_name || guest.full_name}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (guest: GuestRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}`;
    const text = formatWhatsAppWeddingMessage({
      state,
      language: state.language || 'en',
      guest,
      invitationUrl: link,
    });
    openWhatsAppShare(text, guest.phone);
    showToast(`Opening WhatsApp for ${guest.family_name || guest.full_name}...`);
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
    showToast('Family entry removed from guest book');
  };

  const coupleTitle = `${state.couple.groomEn || 'Groom'} & ${state.couple.brideEn || 'Bride'}`;

  return (
    <div className="space-y-8 font-manrope text-[#241A17] relative max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241A17] text-[#FFFDF8] px-5 py-3 rounded-2xl shadow-2xl border border-[#C49A35]/40 flex items-center gap-3 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#C49A35]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER & HIGH-LEVEL INTENTION                                */}
      {/* ========================================================================= */}
      <div className="pt-2 border-b border-[#E8DFD1]/80 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-serif italic text-xs tracking-wider text-[#C49A35] font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>श्री गणेशाय नमः · Shahi Vivah Kutumb</span>
              </span>

              {/* Sub-tab switcher */}
              <div className="flex items-center p-0.5 bg-[#FAF6EE] rounded-xl border border-[#E8DFD1] text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('guestbook')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'guestbook'
                      ? 'bg-white text-[#6E1020] shadow-2xs'
                      : 'text-[#736567] hover:text-[#241A17]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Family Guest Book</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-white text-[#6E1020] shadow-2xs'
                      : 'text-[#736567] hover:text-[#241A17]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>RSVP Intelligence</span>
                </button>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#241A17] tracking-tight font-normal">
              Your Family Guest Book
            </h1>
            <p className="text-xs sm:text-sm text-[#736567] max-w-xl font-light leading-relaxed">
              Everyone who will share your celebration · <span className="font-medium text-[#241A17]">{metrics.totalMembersCount} guests</span> across <span className="font-medium text-[#241A17]">{familyGroups.length} families</span>
            </p>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {onOpenVenueCheckIn && (
              <button
                type="button"
                onClick={onOpenVenueCheckIn}
                className="px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#6E1020] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                title="Open Venue QR Check-in"
              >
                <QrCode className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Venue Check-In</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#241A17] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Import Guest List</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingGuest(null);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] active:bg-[#430914] text-[#FFFDF8] font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ring-1 ring-[#C49A35]/30 hover:shadow-md"
            >
              <UserPlus className="w-4 h-4 text-[#F4D06F]" />
              <span>+ Add Family</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT: GUEST BOOK VS ANALYTICS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' ? (
        <RsvpAnalyticsView
          guests={guests}
          state={state}
          weddingSlug={weddingSlug}
          onSelectGuest={(g) => setSelectedGuestForDrawer(g)}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 3. YOUR CELEBRATION — CONNECTED HEADCOUNT SUMMARY                        */}
          {/* ========================================================================= */}
          <div className="bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E8DFD1] relative overflow-hidden shadow-2xs">
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#C49A35]/10 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Left Main Counter */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E8DFD1] pb-6 lg:pb-0 lg:pr-8 space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#C49A35] font-bold block">
                  Your Celebration
                </span>
                <div className="font-serif text-4xl sm:text-5xl text-[#241A17] font-normal leading-none tracking-tight">
                  {metrics.totalMembersCount} <span className="text-xl sm:text-2xl text-[#736567] font-light">expected guests</span>
                </div>
                <p className="text-xs text-[#736567] pt-1">
                  Gathering for {coupleTitle} · {familyGroups.length} total families invited
                </p>
              </div>

              {/* Right Connected Headcount Flow */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* 1. Attending */}
                <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-[#E8DFD1]/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#167A5A] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
                    Attending
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl text-[#167A5A] font-medium">
                    {metrics.confirmedAttendingMembers}
                  </div>
                  <p className="text-[11px] text-[#736567]">
                    from {metrics.confirmedAttendingCount} families
                  </p>
                </div>

                {/* 2. Awaiting Reply */}
                <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-[#E8DFD1]/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C49A35] font-bold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#C49A35]" />
                    Awaiting RSVP
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl text-[#241A17] font-medium">
                    {metrics.pendingCount}
                  </div>
                  <p className="text-[11px] text-[#736567]">
                    invitations dispatched
                  </p>
                </div>

                {/* 3. Maybe / Tentative */}
                <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-[#E8DFD1]/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9C8C8E]" />
                    Maybe
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl text-[#241A17] font-medium">
                    {metrics.maybeCount}
                  </div>
                  <p className="text-[11px] text-[#736567]">
                    travel tentative
                  </p>
                </div>

                {/* 4. Unable to Join */}
                <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-[#E8DFD1]/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C4A4A] font-bold flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-[#8C4A4A]" />
                    Not Attending
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl text-[#8C4A4A] font-medium">
                    {metrics.notAttendingCount}
                  </div>
                  <p className="text-[11px] text-[#736567]">
                    sent warm regrets
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. REFINED SEARCH & CONTEXTUAL FILTERS                                    */}
          {/* ========================================================================= */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-white p-3 rounded-2xl border border-[#E8DFD1]">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#9C8C8E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a family or guest…"
                className="w-full pl-9 pr-3.5 py-2 bg-[#FAF6EE] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#C49A35] rounded-xl text-xs text-[#241A17] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
              />
            </div>

            {/* Contextual Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
              <div className="flex items-center p-0.5 bg-[#FAF6EE] rounded-xl border border-[#E8DFD1] text-xs overflow-x-auto max-w-full">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'attending', label: 'Attending' },
                    { id: 'pending', label: 'Awaiting' },
                    { id: 'maybe', label: 'Maybe' },
                    { id: 'vip', label: 'VIP' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRsvpFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                      rsvpFilter === tab.id
                        ? 'bg-white text-[#6E1020] font-bold shadow-2xs'
                        : 'text-[#736567] hover:text-[#241A17]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Group Category Selector */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] border border-[#E8DFD1] rounded-xl text-xs font-medium text-[#241A17] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Circles</option>
                  <option value="Family">Family Circle</option>
                  <option value="Friend">Friends</option>
                  <option value="VIP">VIP Dignitaries</option>
                  <option value="Relative">Relatives</option>
                  <option value="Business">Business Associates</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#736567] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] border border-[#E8DFD1] rounded-xl text-xs font-medium text-[#241A17] focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="family_asc">Family Name (A–Z)</option>
                  <option value="name_asc">Guest Name (A–Z)</option>
                  <option value="headcount_desc">Headcount (High–Low)</option>
                  <option value="rsvp">RSVP Status</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#736567] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => exportGuestsToCSV(guests, weddingSlug, originUrl)}
                disabled={guests.length === 0}
                className="p-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#736567] border border-[#E8DFD1] text-xs transition-colors cursor-pointer disabled:opacity-40"
                title="Download Guest Book (CSV)"
              >
                <Download className="w-3.5 h-3.5 text-[#C49A35]" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. GUEST BOOK ENTRIES (FAMILY-FIRST PRESENTATION)                          */}
          {/* ========================================================================= */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-[#E8DFD1] animate-pulse space-y-3">
                  <div className="h-4 bg-[#F0EAE1] rounded w-48" />
                  <div className="h-3 bg-[#F0EAE1] rounded w-96" />
                </div>
              ))}
            </div>
          ) : guests.length === 0 ? (
            /* 👑 EDITORIAL EMPTY STATE */
            <div className="p-10 sm:p-14 text-center bg-[#FAF6EE] rounded-3xl border border-[#E8DFD1] shadow-2xs max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-white border border-[#C49A35]/40 flex items-center justify-center text-[#C49A35] mx-auto shadow-2xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#C49A35] font-bold block">
                  ॥ शुभ विवाह आमंत्रण ॥
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
                  Your Guest Book Begins Here
                </h3>
                <p className="text-xs sm:text-sm text-[#736567] max-w-md mx-auto leading-relaxed">
                  Add the families who will make your celebration complete. Each family receives an exquisite personalized invitation with direct RSVP tracking.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuest(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] text-[#FFFDF8] font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#F4D06F]" />
                  <span>+ Add First Family</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5EFE4] text-[#241A17] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Import Guest List</span>
                </button>
              </div>
            </div>
          ) : filteredFamilyGroups.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs">
              <p className="text-xs text-[#736567]">No families found matching &ldquo;{searchQuery}&rdquo;.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRsvpFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-[#6E1020] hover:underline cursor-pointer"
              >
                Reset filters &amp; search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFamilyGroups.map((family) => {
                const primary = family.primaryGuest;
                const rsvp = primary.rsvp;
                const rsvpStatus = family.rsvpSummary.status;

                return (
                  <div
                    key={family.familyName}
                    onClick={() => setSelectedGuestForDrawer(primary)}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#C49A35]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-4"
                  >
                    {/* Family Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF6EE] pb-3.5">
                      <div className="flex items-center gap-3">
                        {/* Monogram Crest */}
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-serif text-sm font-semibold shrink-0 shadow-2xs ${
                          family.vip 
                            ? 'bg-[#FAF4E8] text-[#C49A35] border-[#E8D5AD]'
                            : 'bg-[#FAF6EE] text-[#6E1020] border-[#E8DFD1]'
                        }`}>
                          {family.familyName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif text-lg sm:text-xl text-[#241A17] font-medium tracking-tight group-hover:text-[#6E1020] transition-colors">
                              {family.familyName}
                            </h3>
                            {family.vip && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-[#C49A35] bg-[#FAF4E8] border border-[#E8D5AD] px-2 py-0.5 rounded-md">
                                <Crown className="w-3 h-3 text-[#C49A35]" />
                                VIP Family
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-[#736567] font-light">
                            {family.totalMembers} {family.totalMembers === 1 ? 'guest' : 'guests'} expected · {primary.relationship}
                          </p>
                        </div>
                      </div>

                      {/* RSVP Status Indicator */}
                      <div className="flex items-center gap-2">
                        {rsvpStatus === 'Attending' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7F2] text-[#167A5A] border border-[#BCE3D1] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
                            <span>Attending with Joy ({family.totalMembers})</span>
                          </div>
                        ) : rsvpStatus === 'Not Attending' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F2] text-[#8C4A4A] border border-[#F0D5D5] text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-[#8C4A4A]" />
                            <span>Unable to Join</span>
                          </div>
                        ) : rsvpStatus === 'Maybe' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E8] text-[#9C772F] border border-[#F2DEB0] text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-[#C49A35]" />
                            <span>Maybe / Travel Pending</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] text-[#736567] border border-[#E8DFD1] text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35]" />
                            <span>Awaiting RSVP</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Family Members List & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Members List */}
                      <div className="md:col-span-6 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9C8C8E] block">
                          Family Members &amp; Contact
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#241A17] font-medium flex-wrap">
                          <span>{primary.full_name}</span>
                          {family.guests.length > 1 && (
                            <span className="text-[#736567] font-normal">
                              + {family.guests.length - 1} other members
                            </span>
                          )}
                          <span className="text-[#9C8C8E] font-mono text-[11px]">
                            ({primary.phone})
                          </span>
                        </div>
                        {rsvp?.meal_preference && (
                          <div className="text-[11px] text-[#736567] flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-[#C49A35]" />
                            <span>Catering preference: {rsvp.meal_preference}</span>
                          </div>
                        )}
                      </div>

                      {/* Invitation Actions */}
                      <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        
                        {/* 1. Preview Invitation */}
                        <a
                          href={`${originUrl}/i/${weddingSlug}?guest=${primary.personal_invitation_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#241A17] border border-[#E8DFD1] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Preview family invitation link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#C49A35]" />
                          <span>Preview Invitation</span>
                        </a>

                        {/* 2. Copy Personal Link */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(primary, e)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#241A17] border border-[#E8DFD1] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy personalized invitation link"
                        >
                          {copiedId === primary.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#167A5A]" />
                              <span className="text-[#167A5A] font-semibold">Link Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#C49A35]" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {/* 3. Share on WhatsApp */}
                        <button
                          type="button"
                          onClick={(e) => handleShareWhatsApp(primary, e)}
                          className="px-3 py-1.5 rounded-xl bg-[#EDF7F2] hover:bg-[#DCF0E6] text-[#167A5A] border border-[#BCE3D1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Share invitation on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#167A5A]" />
                          <span>WhatsApp</span>
                        </button>

                        {/* 4. Edit Family */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGuest(primary);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#736567] border border-[#E8DFD1] transition-colors cursor-pointer"
                          title="Edit Family"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALS & DRAWERS                                                       */}
      {/* ========================================================================= */}

      {/* 👑 Family Detail Drawer */}
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

      {/* ➕ Add / Edit Family Modal (Guided Flow) */}
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
          showToast(editingGuest ? 'Family details updated' : 'Family added to your guest book');
          if (selectedGuestForDrawer?.id === saved.id) {
            setSelectedGuestForDrawer(saved);
          }
        }}
      />

      {/* 🗑️ Delete Family Confirmation Modal */}
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
          showToast(`${count} guests welcomed to your celebration list`);
        }}
      />

    </div>
  );
};

export default GuestManagementView;
