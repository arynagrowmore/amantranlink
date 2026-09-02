import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, CheckCircle2, XCircle, Heart, Download, Search, 
  RefreshCw, MessageCircle, ExternalLink, ArrowLeft, ArrowRight,
  Sparkles, Filter, ShieldCheck, Share2, Calendar, MapPin, 
  Clock, DollarSign, CheckSquare, QrCode, Phone, Plus, Trash2, 
  Copy, Check, ChevronRight, AlertCircle, ArrowUpRight, Award,
  Utensils, UserCheck, Flame, Compass, Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WeddingProjectState, WeddingSite, WeddingEvent } from '../../types/wedding';
import { RsvpRecord, RsvpSummary, fetchWeddingRsvps, exportRsvpsToCSV } from '../../services/rsvpService';
import { 
  WeddingExpense, WeddingChecklistItem, GuestCategoryMap,
  fetchWeddingExpenses, saveWeddingExpense, deleteWeddingExpense,
  fetchWeddingChecklist, toggleChecklistItem, addCustomChecklistItem, deleteChecklistItem,
  fetchGuestSideMap, updateGuestSideCategory, computeCommandCenterMetrics,
  DEFAULT_BUDGET_CATEGORIES
} from '../../services/commandCenterService';
import { RoyalCrestIcon, PalaceGateIcon } from '../ShahiIcons';
import { GuestManagementView } from '../Guest/GuestManagementView';

interface WeddingCommandCenterProps {
  site: any; // WeddingSite or wedding_sites record
  allUserSites?: any[];
  onSelectSite?: (site: any) => void;
  onBackToProfile: () => void;
  onBackToStudio: () => void;
  onOpenLiveInvitation?: (slug: string) => void;
}

export const WeddingCommandCenter: React.FC<WeddingCommandCenterProps> = ({
  site,
  allUserSites = [],
  onSelectSite,
  onBackToProfile,
  onBackToStudio,
  onOpenLiveInvitation,
}) => {
  const { user } = useAuth();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'guests' | 'budget' | 'checklist' | 'qr'>('overview');
  const [isLiveDayMode, setIsLiveDayMode] = useState<boolean>(false);

  // Core Data States
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [expenses, setExpenses] = useState<WeddingExpense[]>([]);
  const [checklist, setChecklist] = useState<WeddingChecklistItem[]>([]);
  const [guestSides, setGuestSides] = useState<GuestCategoryMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Guest Search & Filters
  const [guestSearch, setGuestSearch] = useState<string>('');
  const [guestFilter, setGuestFilter] = useState<'all' | 'attending' | 'regrets'>('all');
  const [guestSideFilter, setGuestSideFilter] = useState<string>('all');

  // Selected Event for Event Command Room Modal
  const [selectedEvent, setSelectedEvent] = useState<WeddingEvent | null>(null);

  // New Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState<{
    category: WeddingExpense['category'];
    item_name: string;
    estimated_cost: number;
    actual_cost: number;
    is_paid: boolean;
    vendor_name: string;
    vendor_phone: string;
    notes: string;
  }>({
    category: 'venue',
    item_name: '',
    estimated_cost: 0,
    actual_cost: 0,
    is_paid: false,
    vendor_name: '',
    vendor_phone: '',
    notes: ''
  });

  // New Custom Task Input
  const [newChecklistTitle, setNewChecklistTitle] = useState<string>('');

  // Add Manual Guest Modal
  const [isAddGuestOpen, setIsAddGuestOpen] = useState<boolean>(false);
  const [newGuest, setNewGuest] = useState<{
    guest_name: string;
    guest_phone: string;
    attendees_count: number;
    attending: boolean;
    dietary: string;
    wishes: string;
    side: 'bride_side' | 'groom_side' | 'family' | 'friends' | 'vip';
  }>({
    guest_name: '',
    guest_phone: '',
    attendees_count: 2,
    attending: true,
    dietary: 'Vegetarian',
    wishes: 'Heartiest congratulations from our family!',
    side: 'family'
  });

  // Extract Wedding Details safely
  const siteId = site?.id || site?.siteId || 'default-site';
  const state: WeddingProjectState = site?.content || site?.state || {
    couple: {
      groomEn: 'Dhruv',
      brideEn: 'Shreya',
      weddingDate: '15 December 2026',
      venueName: 'The Milestone Palace Ground, Gujarat',
      mapUrl: 'https://maps.google.com'
    },
    events: [
      { id: '1', name: '💛 Haldi Rasam', date: '13 Dec 2026', time: '10:00 AM', venue: 'Palace Courtyard', mapUrl: 'https://maps.google.com' },
      { id: '2', name: '🎶 Sangeet Sandhya', date: '14 Dec 2026', time: '07:30 PM', venue: 'Royal Darbar Banquet', mapUrl: 'https://maps.google.com' },
      { id: '3', name: '💍 Shubh Vivah & Pheras', date: '15 Dec 2026', time: '06:30 PM Muhurat', venue: 'The Milestone Palace Ground', mapUrl: 'https://maps.google.com' }
    ],
    family: {
      rsvp1Name: 'Nalinkumar Patel',
      rsvp1Phone: '+91 9409360336',
      rsvp2Name: 'Family Helpdesk',
      rsvp2Phone: '+91 9409360336'
    }
  };

  const groomName = state.couple?.groomEn || 'Groom';
  const brideName = state.couple?.brideEn || 'Bride';
  const weddingDateStr = state.couple?.weddingDate || '15 December 2026';
  const weddingSlug = site?.published_url?.replace(/^\/i\//, '') || site?.slug || `${groomName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const canonicalUrl = `https://shahistudio.com/i/${weddingSlug}`;

  // 1. Initial Data Loader Scoped Strictly to siteId
  const loadCommandCenterData = async () => {
    setLoading(true);
    try {
      // 1. RSVPs
      const rsvpData = await fetchWeddingRsvps(siteId || weddingSlug);
      setRsvps(rsvpData.rsvps || []);

      // 2. Expenses
      const expData = await fetchWeddingExpenses(siteId, user?.uid);
      setExpenses(expData);

      // 3. Checklist
      const chkData = await fetchWeddingChecklist(siteId, state, user?.uid);
      setChecklist(chkData);

      // 4. Guest Sides
      const sideData = fetchGuestSideMap(siteId);
      setGuestSides(sideData);
    } catch (e) {
      console.error('Command center data sync note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandCenterData();
  }, [siteId, weddingSlug]);

  // 2. Real-Time Dynamic Countdown Calculation
  const [countdown, setCountdown] = useState<{ days: number; hours: number; mins: number; secs: number; isPast: boolean }>({
    days: 0, hours: 0, mins: 0, secs: 0, isPast: false
  });

  useEffect(() => {
    const parseTargetDate = (raw: string): number => {
      const parsed = Date.parse(raw.split('·')[0]);
      if (!isNaN(parsed)) return parsed;
      return new Date(2026, 11, 15, 18, 30, 0).getTime();
    };

    const targetMs = parseTargetDate(weddingDateStr);

    const updateTimer = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0, isPast: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60),
        isPast: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [weddingDateStr]);

  // 3. Computed Metrics Memo
  const metrics = useMemo(() => {
    return computeCommandCenterMetrics(
      rsvps,
      expenses,
      checklist,
      guestSides,
      state.events?.length || 0
    );
  }, [rsvps, expenses, checklist, guestSides, state.events]);

  // 4. Filtered Guest List
  const filteredGuests = useMemo(() => {
    return rsvps.filter((r) => {
      const matchesSearch = 
        r.guest_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        r.guest_phone.includes(guestSearch) ||
        (r.wishes && r.wishes.toLowerCase().includes(guestSearch.toLowerCase()));

      if (!matchesSearch) return false;
      if (guestFilter === 'attending' && !r.attending) return false;
      if (guestFilter === 'regrets' && r.attending) return false;

      if (guestSideFilter !== 'all') {
        const side = guestSides[r.id || r.guest_phone] || 'general';
        if (side !== guestSideFilter) return false;
      }

      return true;
    });
  }, [rsvps, guestSearch, guestFilter, guestSideFilter, guestSides]);

  // Quick Action Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppBroadcast = () => {
    const text = `👑 *SHAHI VIVAH NIMANTRAN* 👑\n\nDear Friends & Family,\n\nYou are cordially invited to grace the wedding celebration of *${groomName} & ${brideName}*.\n\n📅 *Date:* ${weddingDateStr}\n📍 *Digital Kankotri & RSVP:* ${canonicalUrl}\n\nPlease click to view events, venue GPS directions & confirm your blessings!\n\n॥ श्री गणेशाय नमः ॥`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendSingleReminder = (guest: RsvpRecord) => {
    const text = `Namaste ${guest.guest_name} ji 🙏,\n\nWe are eagerly looking forward to celebrating the wedding of *${groomName} & ${brideName}* with you!\n\nHere is your private digital invitation & event schedule:\n${canonicalUrl}\n\nWarm regards,\n${groomName} & ${brideName} Family`;
    window.open(`https://api.whatsapp.com/send?phone=${guest.guest_phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Expense Handlers
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.item_name.trim()) return;

    const saved = await saveWeddingExpense(siteId, newExpense, user?.uid);
    setExpenses(prev => [saved, ...prev.filter(x => x.id !== saved.id)]);
    setIsAddExpenseOpen(false);
    setNewExpense({
      category: 'venue',
      item_name: '',
      estimated_cost: 0,
      actual_cost: 0,
      is_paid: false,
      vendor_name: '',
      vendor_phone: '',
      notes: ''
    });
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Delete this expense record?')) {
      await deleteWeddingExpense(siteId, id, user?.uid);
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // Checklist Handlers
  const handleToggleTask = async (id: string) => {
    const updated = await toggleChecklistItem(siteId, id, user?.uid);
    setChecklist(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
  };

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    const added = await addCustomChecklistItem(siteId, newChecklistTitle.trim(), 'custom', user?.uid);
    setChecklist(prev => [...prev, added]);
    setNewChecklistTitle('');
  };

  const handleDeleteTask = async (id: string) => {
    await deleteChecklistItem(siteId, id);
    setChecklist(prev => prev.filter(t => t.id !== id));
  };

  // Guest Side Assignment Handler
  const handleSideCategoryChange = (guestKey: string, cat: any) => {
    const updated = updateGuestSideCategory(siteId, guestKey, cat);
    setGuestSides({ ...updated });
  };

  return (
    <div className="min-h-screen bg-[#120306] text-[#F8F2E5] font-manrope selection:bg-[#C9A227]/30 pb-24">
      {/* 👑 Top Royal Command Center Header */}
      <header className="border-b border-[#C9A227]/30 bg-[#24060B]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Multi-Wedding Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToProfile}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C9A227]/30 text-[#E8D5AD] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#6E1020] border border-[#C9A227] flex items-center justify-center text-[#C9A227] shadow-md shrink-0">
              <RoyalCrestIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C9A227] uppercase font-bold">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Command Sync
                </span>
              </div>

              {/* Multi-Wedding Switcher Dropdown */}
              {allUserSites.length > 1 && onSelectSite ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <select
                    value={siteId}
                    onChange={(e) => {
                      const target = allUserSites.find(s => (s.id || s.siteId) === e.target.value);
                      if (target) onSelectSite(target);
                    }}
                    className="bg-[#140306] border border-[#C9A227]/40 rounded-lg text-xs font-cormorant font-bold text-[#F8F2E5] px-2 py-0.5 cursor-pointer outline-none"
                  >
                    {allUserSites.map((s) => {
                      const id = s.id || s.siteId;
                      const g = s.content?.couple?.groomEn || 'Groom';
                      const b = s.content?.couple?.brideEn || 'Bride';
                      return (
                        <option key={id} value={id}>
                          {g} &amp; {b} ({s.templates?.name || 'Kankotri'})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <h1 className="font-cormorant font-bold text-lg sm:text-xl text-[#FFFDF8] leading-tight">
                  {groomName} &amp; {brideName} · Command Center
                </h1>
              )}
            </div>
          </div>

          {/* Quick Action Toolbelt */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Live Day Mode Switcher */}
            <button
              type="button"
              onClick={() => setIsLiveDayMode(!isLiveDayMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isLiveDayMode
                  ? 'bg-[#C9A227] text-[#120306] border-[#C9A227] font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-[#E8D5AD] border-[#C9A227]/30'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveDayMode ? 'animate-pulse text-[#6E1020]' : 'text-[#C9A227]'}`} />
              <span>{isLiveDayMode ? 'Live Day Active' : 'Shubh Vivah Live'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C9A227]/30 text-[#E8D5AD] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C9A227]" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppBroadcast}
              className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenLiveInvitation) onOpenLiveInvitation(weddingSlug);
                else window.open(canonicalUrl, '_blank');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#6E1020] hover:bg-[#851628] border border-[#C9A227] text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Open Live</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Top Wedding Countdown Banner */}
      <section className="bg-gradient-to-r from-[#24060B] via-[#430914] to-[#24060B] border-b border-[#C9A227]/30 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-[#C9A227]/20 border border-[#C9A227] flex items-center justify-center text-[#C9A227] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#C9A227] uppercase tracking-wider block">
                Auspicious Wedding Muhurat
              </span>
              <h2 className="font-cormorant font-bold text-base sm:text-lg text-[#FFFDF8]">
                {weddingDateStr} · {state.couple?.venueName || 'Royal Palace Ground'}
              </h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#120306]/80 px-4 py-2 rounded-2xl border border-[#C9A227]/30 shadow-inner">
            <div className="text-center min-w-[45px]">
              <span className="font-cormorant font-bold text-xl sm:text-2xl text-[#C9A227] block leading-none">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-mono text-[#E8D5AD]/70 uppercase">Days</span>
            </div>
            <span className="text-[#C9A227] font-bold pb-2">:</span>
            <div className="text-center min-w-[45px]">
              <span className="font-cormorant font-bold text-xl sm:text-2xl text-[#C9A227] block leading-none">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-mono text-[#E8D5AD]/70 uppercase">Hours</span>
            </div>
            <span className="text-[#C9A227] font-bold pb-2">:</span>
            <div className="text-center min-w-[45px]">
              <span className="font-cormorant font-bold text-xl sm:text-2xl text-[#C9A227] block leading-none">
                {String(countdown.mins).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-mono text-[#E8D5AD]/70 uppercase">Mins</span>
            </div>
            <span className="text-[#C9A227] font-bold pb-2">:</span>
            <div className="text-center min-w-[45px]">
              <span className="font-cormorant font-bold text-xl sm:text-2xl text-[#C9A227] block leading-none">
                {String(countdown.secs).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-mono text-[#E8D5AD]/70 uppercase">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 SHUBH VIVAH LIVE DAY-OF DASHBOARD (When Activated) */}
      {isLiveDayMode && (
        <section className="max-w-7xl mx-auto px-4 mt-6 animate-fadeIn">
          <div className="rounded-3xl bg-gradient-to-br from-[#430914] via-[#6E1020] to-[#24060B] border-2 border-[#C9A227] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#C9A227]/40 pb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#C9A227] animate-bounce" />
                <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                  Shubh Vivah · Live Day-of-Wedding Control
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#C9A227] text-[#120306] px-3 py-1 rounded-full uppercase">
                Active Celebration Mode
              </span>
            </div>

            {/* Live Day Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Today's Primary Event */}
              <div className="p-5 rounded-2xl bg-[#120306]/70 border border-[#C9A227]/40 space-y-2">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">
                  Current Celebration Rasam
                </span>
                <h4 className="font-cormorant font-bold text-xl text-[#FFFDF8]">
                  {state.events?.[0]?.name || '💍 Shubh Vivah Muhurat'}
                </h4>
                <p className="text-xs text-[#E8D5AD]/80">
                  Time: {state.events?.[0]?.time || '06:30 PM'}
                </p>
                <div className="pt-2">
                  <a
                    href={state.events?.[0]?.mapUrl || state.couple?.mapUrl || 'https://maps.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-[#C9A227] hover:bg-[#D8AF4B] text-[#120306] text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open Venue GPS</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Headcount on Ground */}
              <div className="p-5 rounded-2xl bg-[#120306]/70 border border-[#C9A227]/40 space-y-2">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">
                  Expected Headcount on Ground
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-cormorant font-bold text-4xl text-[#C9A227]">
                    {metrics.totalHeadcount || 250}
                  </span>
                  <span className="text-xs text-[#E8D5AD]/70">Attending Guests</span>
                </div>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{metrics.confirmedAttending} RSVP Confirmations</span>
                </p>
              </div>

              {/* Card 3: Baraat & Family Quick Dial */}
              <div className="p-5 rounded-2xl bg-[#120306]/70 border border-[#C9A227]/40 space-y-2">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">
                  Family Helpdesk &amp; Coordinator
                </span>
                <h4 className="font-cormorant font-bold text-lg text-[#FFFDF8]">
                  {state.family?.rsvp1Name || 'Family Coordinator'}
                </h4>
                <p className="text-xs text-[#E8D5AD]/80">
                  {state.family?.rsvp1Phone || '+91 9409360336'}
                </p>
                <div className="pt-2">
                  <a
                    href={`tel:${(state.family?.rsvp1Phone || '+91 9409360336').replace(/\s+/g, '')}`}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Coordinator</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🧭 Command Center Module Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#C9A227]/20">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: Award },
            { id: 'timeline', label: 'Rasam Timeline', icon: Calendar },
            { id: 'guests', label: `Guest Intelligence (${rsvps.length})`, icon: Users },
            { id: 'budget', label: 'Wedding Ledger', icon: DollarSign },
            { id: 'checklist', label: `Checklist (${metrics.completedTasksCount}/${metrics.totalTasksCount})`, icon: CheckSquare },
            { id: 'qr', label: 'Royal QR Card', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[#6E1020] border-[#C9A227] text-[#FFFDF8] font-bold shadow-lg ring-1 ring-[#C9A227]/50'
                    : 'bg-[#1D0509] border-[#C9A227]/20 text-[#E8D5AD]/70 hover:text-[#FFFDF8] hover:bg-[#2A080E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A227]' : 'text-[#C9A227]/70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 🏰 MAIN COMMAND CENTER CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & LIVE WEDDING METRICS                                     */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-[#1D0509] border border-[#C9A227]/30 space-y-1">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">Total Responses</span>
                <span className="font-cormorant font-bold text-3xl text-[#FFFDF8]">{metrics.totalResponses}</span>
                <span className="text-[10px] text-[#E8D5AD]/60 block">Recorded in Cloud</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D0509] border border-emerald-500/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Attending</span>
                <span className="font-cormorant font-bold text-3xl text-emerald-300">{metrics.confirmedAttending}</span>
                <span className="text-[10px] text-emerald-400/70 block">Confirmed Blessings</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D0509] border border-[#C9A227] space-y-1">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">Total Headcount</span>
                <span className="font-cormorant font-bold text-3xl text-[#C9A227]">{metrics.totalHeadcount}</span>
                <span className="text-[10px] text-[#E8D5AD]/60 block">Expected Guests</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D0509] border border-rose-500/40 space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">Declined</span>
                <span className="font-cormorant font-bold text-3xl text-rose-300">{metrics.declinedCount}</span>
                <span className="text-[10px] text-rose-400/70 block">Regrets Received</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D0509] border border-[#C9A227]/30 space-y-1">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">Rasams / Events</span>
                <span className="font-cormorant font-bold text-3xl text-[#FFFDF8]">{metrics.eventsCount}</span>
                <span className="text-[10px] text-[#E8D5AD]/60 block">Ceremonies</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D0509] border border-[#C9A227]/30 space-y-1">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">Tasks Done</span>
                <span className="font-cormorant font-bold text-3xl text-[#FFFDF8]">
                  {metrics.completedTasksCount}/{metrics.totalTasksCount}
                </span>
                <span className="text-[10px] text-[#E8D5AD]/60 block">Checklist Progress</span>
              </div>
            </div>

            {/* Sub-Intelligence: Dietary & Family Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dietary Intelligence */}
              <div className="p-6 rounded-3xl bg-[#1D0509] border border-[#C9A227]/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#C9A227]" />
                    <h3 className="font-cormorant font-bold text-lg text-[#FFFDF8]">
                      Catering &amp; Dietary Intelligence
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#C9A227]">
                    Total Headcount: {metrics.totalHeadcount}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Jain Vegetarian</span>
                    <span className="font-cormorant font-bold text-2xl text-[#C9A227]">
                      {metrics.dietaryBreakdown.jain}
                    </span>
                    <span className="text-[10px] text-[#E8D5AD]/60 block">Guests</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Vegetarian</span>
                    <span className="font-cormorant font-bold text-2xl text-emerald-400">
                      {metrics.dietaryBreakdown.vegetarian}
                    </span>
                    <span className="text-[10px] text-[#E8D5AD]/60 block">Guests</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Special / Other</span>
                    <span className="font-cormorant font-bold text-2xl text-amber-400">
                      {metrics.dietaryBreakdown.other}
                    </span>
                    <span className="text-[10px] text-[#E8D5AD]/60 block">Guests</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Standard</span>
                    <span className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                      {metrics.dietaryBreakdown.notSpecified}
                    </span>
                    <span className="text-[10px] text-[#E8D5AD]/60 block">Guests</span>
                  </div>
                </div>
              </div>

              {/* Side & Family Intelligence */}
              <div className="p-6 rounded-3xl bg-[#1D0509] border border-[#C9A227]/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#C9A227]" />
                    <h3 className="font-cormorant font-bold text-lg text-[#FFFDF8]">
                      Family &amp; Guest Side Intelligence
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guests')}
                    className="text-xs text-[#C9A227] hover:underline"
                  >
                    Manage Sides →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Bride Side</span>
                    <span className="font-cormorant font-bold text-2xl text-[#C9A227]">
                      {metrics.sideBreakdown.brideSide}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Groom Side</span>
                    <span className="font-cormorant font-bold text-2xl text-[#C9A227]">
                      {metrics.sideBreakdown.groomSide}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">VIP Dignitaries</span>
                    <span className="font-cormorant font-bold text-2xl text-amber-300">
                      {metrics.sideBreakdown.vip}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Close Family</span>
                    <span className="font-cormorant font-bold text-2xl text-emerald-400">
                      {metrics.sideBreakdown.family}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">Friends &amp; Peers</span>
                    <span className="font-cormorant font-bold text-2xl text-sky-400">
                      {metrics.sideBreakdown.friends}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#120306] border border-[#C9A227]/20 text-center">
                    <span className="text-xs font-bold text-[#E8D5AD] block">General</span>
                    <span className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                      {metrics.sideBreakdown.general}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ROYAL WEDDING TIMELINE & EVENT COMMAND ROOMS                       */}
        {/* ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-4">
              <div>
                <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                  Ceremonial Rasam Timeline
                </h3>
                <p className="text-xs text-[#E8D5AD]/70">
                  Click any event to open its dedicated Event Command Room &amp; manage guests
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToStudio}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C9A227]/30 text-xs text-[#E8D5AD] font-semibold"
              >
                Edit Rasams in Studio
              </button>
            </div>

            {/* Timeline Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(state.events || []).map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  onClick={() => setSelectedEvent(ev)}
                  className="rounded-3xl bg-[#1D0509] border-2 border-[#C9A227]/30 hover:border-[#C9A227] p-5 space-y-4 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#6E1020] text-[#C9A227] px-2.5 py-1 rounded-full border border-[#C9A227]/40">
                      Rasam #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#C9A227] font-bold">
                      {ev.time}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-cormorant font-bold text-xl text-[#FFFDF8] group-hover:text-[#C9A227] transition-colors">
                      {ev.name}
                    </h4>
                    <p className="text-xs text-[#E8D5AD]/80 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>{ev.date}</span>
                    </p>
                    <p className="text-xs text-[#E8D5AD]/80 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span className="truncate">{ev.venue}</span>
                    </p>
                  </div>

                  {ev.dressCode && (
                    <div className="pt-2 border-t border-[#C9A227]/20 text-[11px] text-[#C9A227]">
                      <span className="font-semibold">Attire:</span> {ev.dressCode}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-[#C9A227] font-bold">
                    <span>Open Event Room</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GUEST INTELLIGENCE & ADVANCED RSVP MANAGEMENT                      */}
        {/* ========================================================================= */}
        {activeTab === 'guests' && (
          <div className="space-y-6 animate-fadeIn">
            <GuestManagementView
              state={state}
              weddingSiteId={siteId}
              userId={user?.uid || 'user_command_center'}
              weddingSlug={weddingSlug}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ROYAL WEDDING LEDGER (BUDGET MODULE)                              */}
        {/* ========================================================================= */}
        {activeTab === 'budget' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-4">
              <div>
                <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                  Royal Wedding Ledger &amp; Expenses
                </h3>
                <p className="text-xs text-[#E8D5AD]/70">
                  Private planning ledger for budgeting venue, catering, decor &amp; vendors
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D8AF4B] text-[#120306] text-xs font-bold uppercase flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#120306]" />
                <span>Add Expense</span>
              </button>
            </div>

            {/* Budget KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-[#1D0509] border border-[#C9A227]/40 space-y-1">
                <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold block">
                  Total Planned Budget
                </span>
                <span className="font-cormorant font-bold text-3xl sm:text-4xl text-[#FFFDF8]">
                  ₹{metrics.totalBudgetPlanned.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#E8D5AD]/60 block">Estimated Costs</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#1D0509] border border-amber-500/40 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                  Total Amount Paid / Spent
                </span>
                <span className="font-cormorant font-bold text-3xl sm:text-4xl text-amber-300">
                  ₹{metrics.totalBudgetSpent.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-400/70 block">Disbursed to Vendors</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#1D0509] border border-emerald-500/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                  Remaining Budget
                </span>
                <span className="font-cormorant font-bold text-3xl sm:text-4xl text-emerald-300">
                  ₹{metrics.remainingBudget.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400/70 block">Balance Available</span>
              </div>
            </div>

            {/* Expenses List */}
            <div className="rounded-3xl bg-[#1D0509] border border-[#C9A227]/30 overflow-hidden shadow-xl">
              {expenses.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <DollarSign className="w-12 h-12 mx-auto text-[#C9A227]/40" />
                  <h4 className="font-cormorant font-bold text-xl text-[#FFFDF8]">
                    Your wedding ledger is ready.
                  </h4>
                  <p className="text-xs text-[#E8D5AD]/70 max-w-sm mx-auto">
                    Track vendor advances, palace venue bookings, and catering expenses privately.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#6E1020] border border-[#C9A227] text-xs font-bold text-white uppercase"
                  >
                    Add First Expense
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#24060B] border-b border-[#C9A227]/30 text-[#C9A227] uppercase font-mono font-bold text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Expense Item</th>
                        <th className="py-3.5 px-4">Vendor</th>
                        <th className="py-3.5 px-4">Estimated (₹)</th>
                        <th className="py-3.5 px-4">Actual (₹)</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/10">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 capitalize text-[#C9A227] font-semibold">
                            {exp.category}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#FFFDF8]">
                            {exp.item_name}
                          </td>
                          <td className="py-3.5 px-4 text-[#E8D5AD]/80">
                            {exp.vendor_name || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#E8D5AD]">
                            ₹{Number(exp.estimated_cost).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C9A227]">
                            ₹{Number(exp.actual_cost).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            {exp.is_paid ? (
                              <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Paid Full
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PRIVATE WEDDING CHECKLIST                                          */}
        {/* ========================================================================= */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-4">
              <div>
                <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                  Royal Wedding Checklist
                </h3>
                <p className="text-xs text-[#E8D5AD]/70">
                  {metrics.completedTasksCount} of {metrics.totalTasksCount} tasks completed
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="w-32 bg-[#120306] h-2 rounded-full overflow-hidden border border-[#C9A227]/30">
                  <div
                    className="bg-[#C9A227] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((metrics.completedTasksCount / Math.max(1, metrics.totalTasksCount)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[#C9A227] font-bold">
                  {Math.round((metrics.completedTasksCount / Math.max(1, metrics.totalTasksCount)) * 100)}%
                </span>
              </div>
            </div>

            {/* Add Custom Task Form */}
            <form onSubmit={handleAddCustomTask} className="flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add custom task (e.g. Baraat Safa Coordinator, Panditji Muhurat Samagri)…"
                className="flex-1 bg-[#1D0509] border border-[#C9A227]/30 rounded-2xl px-4 py-2.5 text-xs text-[#FFFDF8] placeholder-[#E8D5AD]/40 outline-none focus:border-[#C9A227]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-[#6E1020] hover:bg-[#851628] border border-[#C9A227] text-xs font-bold text-white uppercase flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4 text-[#C9A227]" />
                <span>Add Task</span>
              </button>
            </form>

            {/* Checklist Items Stack */}
            <div className="space-y-3">
              {checklist.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    task.is_completed
                      ? 'bg-[#140306]/60 border-emerald-500/40 text-[#E8D5AD]/60'
                      : 'bg-[#1D0509] border-[#C9A227]/30 text-[#FFFDF8] hover:border-[#C9A227]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                      task.is_completed
                        ? 'bg-emerald-700 text-white border-emerald-500'
                        : 'bg-[#120306] text-transparent border-[#C9A227]/50'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold ${task.is_completed ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      {task.is_system && (
                        <span className="ml-2 text-[9px] font-mono bg-[#6E1020] text-[#C9A227] px-2 py-0.5 rounded-md uppercase">
                          System Auto-Sync
                        </span>
                      )}
                    </div>
                  </div>

                  {!task.is_system && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1 text-[#E8D5AD]/40 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ROYAL QR INVITATION & LINK CENTER                                  */}
        {/* ========================================================================= */}
        {activeTab === 'qr' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto text-center">
            <div className="space-y-2 border-b border-[#C9A227]/30 pb-4">
              <h3 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#FFFDF8]">
                Royal QR Invitation Card
              </h3>
              <p className="text-xs text-[#E8D5AD]/70">
                Display this ceremonial QR code at wedding entry points or print on physical welcome stationery
              </p>
            </div>

            {/* Ceremonial Royal QR Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#24060B] via-[#430914] to-[#24060B] border-2 border-[#C9A227] p-8 shadow-2xl space-y-5 text-center relative overflow-hidden">
              <span className="text-xs font-serif text-[#C9A227] tracking-widest uppercase block font-semibold">
                ॥ श्री गणेशाय नमः ॥
              </span>

              <div>
                <h4 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#FFFDF8]">
                  {groomName} &amp; {brideName}
                </h4>
                <p className="text-xs font-mono text-[#C9A227] mt-1">
                  {weddingDateStr} · {state.couple?.venueName || 'Royal Vivah'}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl w-52 h-52 mx-auto flex items-center justify-center shadow-2xl border-4 border-[#C9A227]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(canonicalUrl)}`}
                  alt={`${groomName} & ${brideName} Wedding QR`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#E8D5AD] block uppercase tracking-wider">
                  Scan to Open Digital Kankotri
                </span>
                <span className="text-[11px] font-mono text-[#C9A227] block">
                  {canonicalUrl}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C9A227]/40 text-xs font-bold text-[#FFFDF8] flex items-center gap-1.5 transition-all cursor-pointer shadow"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C9A227]" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Kankotri Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppBroadcast}
                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-[#120306] text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EVENT COMMAND ROOM DETAILS & GPS MODAL                           */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-3xl bg-[#24060B] border-2 border-[#C9A227] p-6 max-w-lg w-full shadow-2xl space-y-5 text-[#F8F2E5]">
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                  {selectedEvent.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#140306] border border-[#C9A227]/20 flex items-center justify-between">
                <span className="text-[#E8D5AD]/70">Date &amp; Muhurat Time</span>
                <span className="font-bold text-[#C9A227]">{selectedEvent.date} · {selectedEvent.time}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#140306] border border-[#C9A227]/20 space-y-1">
                <span className="text-[#E8D5AD]/70 block">Ceremonial Venue</span>
                <span className="font-bold text-[#FFFDF8] block">{selectedEvent.venue}</span>
              </div>

              {selectedEvent.dressCode && (
                <div className="p-3 rounded-2xl bg-[#140306] border border-[#C9A227]/20 flex items-center justify-between">
                  <span className="text-[#E8D5AD]/70">Attire / Dress Code</span>
                  <span className="font-bold text-[#C9A227]">{selectedEvent.dressCode}</span>
                </div>
              )}
            </div>

            {/* Action Buttons inside Event Room */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <a
                href={selectedEvent.mapUrl || state.couple?.mapUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D8AF4B] text-[#120306] text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <Compass className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const evText = `👑 *${selectedEvent.name}*\n\nWedding of *${groomName} & ${brideName}*\n📅 *Date:* ${selectedEvent.date} at ${selectedEvent.time}\n📍 *Venue:* ${selectedEvent.venue}\n📍 *Directions:* ${selectedEvent.mapUrl || canonicalUrl}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(evText)}`, '_blank');
                }}
                className="py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-[#120306] text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EXPENSE MODAL                                                */}
      {/* ========================================================================= */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddExpenseSubmit} className="rounded-3xl bg-[#24060B] border-2 border-[#C9A227] p-6 max-w-lg w-full shadow-2xl space-y-4 text-[#F8F2E5]">
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
              <h3 className="font-cormorant font-bold text-2xl text-[#FFFDF8]">
                Add Wedding Expense
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#E8D5AD] font-semibold mb-1">Expense Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                >
                  {DEFAULT_BUDGET_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#E8D5AD] font-semibold mb-1">Item / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palace Mandap Floral Decor Advance"
                  value={newExpense.item_name}
                  onChange={(e) => setNewExpense({ ...newExpense, item_name: e.target.value })}
                  className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E8D5AD] font-semibold mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newExpense.estimated_cost || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, estimated_cost: Number(e.target.value) })}
                    className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E8D5AD] font-semibold mb-1">Actual / Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newExpense.actual_cost || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, actual_cost: Number(e.target.value) })}
                    className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E8D5AD] font-semibold mb-1">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Decorators"
                    value={newExpense.vendor_name}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor_name: e.target.value })}
                    className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E8D5AD] font-semibold mb-1">Payment Status</label>
                  <select
                    value={newExpense.is_paid ? 'true' : 'false'}
                    onChange={(e) => setNewExpense({ ...newExpense, is_paid: e.target.value === 'true' })}
                    className="w-full bg-[#140306] border border-[#C9A227]/30 rounded-xl px-3 py-2 text-xs text-[#FFFDF8] outline-none"
                  >
                    <option value="false">Pending Payment</option>
                    <option value="true">Paid in Full</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-[#E8D5AD]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D8AF4B] text-[#120306] text-xs font-bold uppercase"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default WeddingCommandCenter;
