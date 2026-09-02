import React, { useEffect, useMemo, useState } from 'react';
import { 
  X, Copy, Check, ExternalLink, Edit2, Trash2, 
  Users, Phone, Mail, Calendar, Clock, CheckCircle2, XCircle, 
  Utensils, Heart, Sparkles, ShieldCheck, Tag, ArrowUpRight,
  AlertCircle, Info, MoreVertical
} from 'lucide-react';
import { GuestRecord, AttendanceStatus } from '../../types/guest';
import { WeddingProjectState } from '../../types/wedding';

interface GuestDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestRecord | null;
  state: WeddingProjectState;
  weddingSlug: string;
  onEditGuest: (guest: GuestRecord) => void;
  onDeleteGuest: (guestId: string) => void;
  onOpenEntryPass?: (guest: GuestRecord) => void;
}

export const GuestDetailDrawer: React.FC<GuestDetailDrawerProps> = ({
  isOpen,
  onClose,
  guest,
  state,
  weddingSlug,
  onEditGuest,
  onDeleteGuest,
  onOpenEntryPass,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset menu on guest change
  useEffect(() => {
    setIsMoreActionsOpen(false);
  }, [guest]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const personalizedLink = guest ? `${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}` : '';

  const handleCopyLink = () => {
    if (!personalizedLink) return;
    navigator.clipboard.writeText(personalizedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenPreview = () => {
    if (!personalizedLink) return;
    window.open(personalizedLink, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = () => {
    if (!guest) return;
    if (window.confirm(`Are you sure you want to remove ${guest.full_name} and all associated RSVP data?`)) {
      onDeleteGuest(guest.id);
      onClose();
    }
  };

  // Deterministic Status Insight calculation
  const statusInsight = useMemo(() => {
    if (!guest) return '';
    const rsvpStatus = guest.rsvp?.attendance_status || 'Pending';
    const isViewed = guest.invitation_status === 'viewed';

    if (rsvpStatus === 'Attending') {
      const count = guest.rsvp?.attending_member_count || guest.number_of_members || 1;
      const meal = guest.rsvp?.meal_preference ? ` (${guest.rsvp.meal_preference})` : '';
      return `RSVP Confirmed for ${count} ${count === 1 ? 'member' : 'members'}${meal}.`;
    }

    if (rsvpStatus === 'Not Attending') {
      return 'Guest has politely sent regrets and is unable to attend.';
    }

    if (rsvpStatus === 'Maybe') {
      return 'Guest response is tentative / awaiting travel confirmation.';
    }

    if (isViewed) {
      if (guest.viewed_at) {
        const viewedDate = new Date(guest.viewed_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        });
        return `Waiting for RSVP — invitation was viewed on ${viewedDate}.`;
      }
      return 'Waiting for RSVP — guest has opened their personalized invitation.';
    }

    return 'Guest has not yet opened their personalized wedding invitation.';
  }, [guest]);

  // Deterministic Journey Timeline derived from real database timestamps
  const journeyTimeline = useMemo(() => {
    if (!guest) return [];

    const timeline: Array<{
      id: string;
      title: string;
      description: string;
      timestamp?: string | null;
      status: 'completed' | 'current' | 'upcoming';
      icon: 'created' | 'sent' | 'viewed' | 'rsvp';
    }> = [];

    // 1. Guest Created
    timeline.push({
      id: 'created',
      title: 'Guest Registered',
      description: 'Personalized invitation token generated',
      timestamp: guest.created_at ? new Date(guest.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : null,
      status: 'completed',
      icon: 'created',
    });

    // 2. Invitation Sent / Delivered
    if (guest.invitation_status === 'sent' || guest.invitation_status === 'delivered' || guest.invitation_status === 'viewed' || guest.rsvp) {
      timeline.push({
        id: 'sent',
        title: 'Invitation Dispatched',
        description: 'Generated personalized guest token link',
        timestamp: null, // Only show timestamp if dedicated event log exists
        status: 'completed',
        icon: 'sent',
      });
    }

    // 3. Invitation Viewed
    if (guest.invitation_status === 'viewed' || guest.viewed_at || guest.rsvp) {
      timeline.push({
        id: 'viewed',
        title: 'Invitation Opened & Viewed',
        description: 'Guest visited personalized royal invitation link',
        timestamp: guest.viewed_at ? new Date(guest.viewed_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : 'Verified viewed',
        status: 'completed',
        icon: 'viewed',
      });
    } else {
      timeline.push({
        id: 'viewed',
        title: 'Invitation Not Opened Yet',
        description: 'Awaiting guest link access',
        timestamp: null,
        status: 'upcoming',
        icon: 'viewed',
      });
    }

    // 4. RSVP Submitted
    if (guest.rsvp) {
      const rsvpDate = guest.rsvp.responded_at || null;
      const isAttending = guest.rsvp.attendance_status === 'Attending';
      const headcount = guest.rsvp.attending_member_count || guest.number_of_members || 1;

      timeline.push({
        id: 'rsvp',
        title: isAttending ? 'RSVP Confirmed (Attending)' : guest.rsvp.attendance_status === 'Maybe' ? 'RSVP Tentative (Maybe)' : 'RSVP Declined (Regrets)',
        description: isAttending 
          ? `Confirmed attendance for ${headcount} ${headcount === 1 ? 'member' : 'members'} · ${guest.rsvp.meal_preference || 'Standard'}`
          : guest.rsvp.attendance_status === 'Maybe'
          ? 'Tentative response received'
          : 'Politely declined attendance',
        timestamp: rsvpDate ? new Date(rsvpDate).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : 'Recorded in Cloud',
        status: 'completed',
        icon: 'rsvp',
      });
    } else {
      timeline.push({
        id: 'rsvp',
        title: 'RSVP Response Pending',
        description: 'Waiting for confirmed attendance & catering choices',
        timestamp: null,
        status: 'upcoming',
        icon: 'rsvp',
      });
    }

    return timeline;
  }, [guest]);

  if (!isOpen || !guest) return null;

  const initials = guest.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  const rsvpStatus = guest.rsvp?.attendance_status || 'Pending';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-manrope">
      
      {/* Subtle Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
      />

      {/* Drawer Container (Desktop: Right slide-in / Mobile: Full-screen sheet) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-10 pointer-events-none">
        <div className="w-screen max-w-lg lg:max-w-xl bg-white border-l border-[#E8DFD1] shadow-2xl pointer-events-auto flex flex-col h-full animate-slideInRight text-[#20181A]">
          
          {/* Top Decorative Gold Accent Line */}
          <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

          {/* ========================================================================= */}
          {/* 1. DRAWER HEADER                                                          */}
          {/* ========================================================================= */}
          <div className="p-5 sm:p-6 border-b border-[#E8DFD1] bg-[#FAF6EE] shrink-0">
            <div className="flex items-start justify-between gap-3">
              
              {/* Avatar + Guest Name + Category */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-base shrink-0 shadow-xs ${
                  guest.relationship === 'VIP'
                    ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#E8D5AD]'
                    : 'bg-[#F4EFE6] text-[#540D1E] border-[#E8DFD1]'
                }`}>
                  {initials || 'G'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-cormorant text-xl sm:text-2xl font-bold text-[#350811] truncate leading-tight">
                      {guest.full_name}
                    </h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 ${
                      guest.relationship === 'VIP' 
                        ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#E8D5AD]'
                        : guest.relationship === 'Family'
                        ? 'bg-[#F4EFE6] text-[#540D1E] border-[#E8DFD1]'
                        : 'bg-[#F7F4F0] text-[#5C5052] border-[#E5DDD9]'
                    }`}>
                      {guest.relationship}
                    </span>
                  </div>

                  {guest.family_name && (
                    <div className="text-xs text-[#736567] font-medium mt-0.5 truncate">
                      {guest.family_name}
                    </div>
                  )}

                  <div className="text-[11px] text-[#9C772F] font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#167A5A]" />
                    <span>Personal Invitation Active · {guest.invitation_status === 'viewed' ? 'Viewed' : 'Created'} · {rsvpStatus}</span>
                  </div>
                </div>
              </div>

              {/* Right Controls: More Actions Menu & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                
                {/* 3-Dot More Actions Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                    className="p-1.5 rounded-xl hover:bg-[#EAE2D5] text-[#5C5052] transition-colors cursor-pointer"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMoreActionsOpen && (
                    <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-[#E8DFD1] shadow-xl text-xs z-30 py-1 font-medium animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreActionsOpen(false);
                          onEditGuest(guest);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#FAF6EF] flex items-center gap-2 text-[#4A3E40] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#9C772F]" />
                        <span>Edit Guest Details</span>
                      </button>

                      <div className="h-px bg-[#F0EAE1] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreActionsOpen(false);
                          handleDelete();
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#FDF2F2] flex items-center gap-2 text-[#8C4A4A] cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Guest</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-[#EAE2D5] text-[#736567] transition-colors cursor-pointer"
                  title="Close Drawer (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN SCROLLABLE CONTENT BODY                                              */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* 2. PRIMARY STATUS SUMMARY (3 Compact Information Blocks) */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Block 1: Invitation Status */}
              <div className="p-3 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#736567]">
                  Invitation
                </span>
                <div className="mt-1.5">
                  <div className="text-xs font-bold text-[#2A171B] capitalize flex items-center gap-1">
                    {guest.invitation_status === 'viewed' && <span className="w-2 h-2 rounded-full bg-[#167A5A]" />}
                    <span>{guest.invitation_status}</span>
                  </div>
                  <p className="text-[10px] text-[#736567] mt-0.5 truncate">
                    {guest.viewed_at ? new Date(guest.viewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Via Link'}
                  </p>
                </div>
              </div>

              {/* Block 2: RSVP Status */}
              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                rsvpStatus === 'Attending' 
                  ? 'bg-[#EDF7F2] border-[#BCE3D1]' 
                  : rsvpStatus === 'Not Attending'
                  ? 'bg-[#FDF2F2] border-[#F0D5D5]'
                  : 'bg-[#FAF6EF] border-[#E8DFD1]'
              }`}>
                <span className={`text-[10px] font-mono uppercase font-bold ${
                  rsvpStatus === 'Attending' ? 'text-[#136A4E]' : rsvpStatus === 'Not Attending' ? 'text-[#8C4A4A]' : 'text-[#736567]'
                }`}>
                  RSVP Status
                </span>
                <div className="mt-1.5">
                  <div className={`text-xs font-bold ${
                    rsvpStatus === 'Attending' ? 'text-[#136A4E]' : rsvpStatus === 'Not Attending' ? 'text-[#8C4A4A]' : 'text-[#2A171B]'
                  }`}>
                    {rsvpStatus}
                  </div>
                  <p className="text-[10px] text-[#736567] mt-0.5 truncate">
                    {rsvpStatus === 'Attending' ? `${guest.rsvp?.attending_member_count || guest.number_of_members} Members` : 'Recorded'}
                  </p>
                </div>
              </div>

              {/* Block 3: Expected Group */}
              <div className="p-3 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#736567]">
                  Category
                </span>
                <div className="mt-1.5">
                  <div className="text-xs font-bold text-[#2A171B] truncate">
                    {guest.relationship}
                  </div>
                  <p className="text-[10px] text-[#736567] mt-0.5">
                    {guest.number_of_members || 1} {guest.number_of_members === 1 ? 'Guest' : 'Members'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. QUICK ACTIONS ROW */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Open Live Invitation Action */}
              <a
                href={`${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer min-w-[140px]"
              >
                <ExternalLink className="w-4 h-4 text-[#F4D06F]" />
                <span>Open Invitation</span>
              </a>

              {/* QR Entry Pass Action (if Attending) */}
              {rsvpStatus === 'Attending' && onOpenEntryPass && (
                <button
                  type="button"
                  onClick={() => onOpenEntryPass(guest)}
                  className="py-2 px-3 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="View Digital QR Entry Pass"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>QR Pass</span>
                </button>
              )}

              {/* Copy Link Action */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Copy Personalized Guest Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#167A5A]" /> : <Copy className="w-4 h-4 text-[#9C772F]" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {/* Edit Details Action */}
              <button
                type="button"
                onClick={() => onEditGuest(guest)}
                className="py-2 px-3 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Edit Guest"
              >
                <Edit2 className="w-4 h-4 text-[#9C772F]" />
                <span>Edit</span>
              </button>
            </div>

            {/* 4. CURRENT STATUS INSIGHT CARD */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD1] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#9C772F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] block">
                  Status Insight
                </span>
                <p className="text-xs text-[#4A3E40] font-medium mt-0.5 leading-relaxed">
                  {statusInsight}
                </p>
              </div>
            </div>

            {/* 5. GUEST DETAILS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-[#736567] tracking-wider">
                  Guest Details
                </span>
                <button
                  type="button"
                  onClick={() => onEditGuest(guest)}
                  className="text-[11px] font-semibold text-[#9C772F] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                
                {/* Full Name */}
                <div>
                  <span className="text-[#8C7A7C] text-[10px] block font-medium">Full Name</span>
                  <span className="font-semibold text-[#20181A]">{guest.full_name}</span>
                </div>

                {/* Phone */}
                <div>
                  <span className="text-[#8C7A7C] text-[10px] block font-medium">Phone Number</span>
                  <span className="font-mono font-semibold text-[#20181A]">{guest.phone}</span>
                </div>

                {/* Family Name (Only if present) */}
                {guest.family_name && (
                  <div>
                    <span className="text-[#8C7A7C] text-[10px] block font-medium">Family Parivar</span>
                    <span className="font-semibold text-[#20181A]">{guest.family_name}</span>
                  </div>
                )}

                {/* Email (Only if present) */}
                {guest.email && (
                  <div>
                    <span className="text-[#8C7A7C] text-[10px] block font-medium">Email Address</span>
                    <span className="text-[#20181A] truncate block" title={guest.email}>{guest.email}</span>
                  </div>
                )}

                {/* Category */}
                <div>
                  <span className="text-[#8C7A7C] text-[10px] block font-medium">Category</span>
                  <span className="font-semibold text-[#540D1E]">{guest.relationship}</span>
                </div>

                {/* Expected Members */}
                <div>
                  <span className="text-[#8C7A7C] text-[10px] block font-medium">Expected Headcount</span>
                  <span className="font-bold text-[#350811]">{guest.number_of_members || 1} Members</span>
                </div>
              </div>
            </div>

            {/* 6. RSVP DETAILS SECTION */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#E8DFD1] pb-2">
                RSVP Response &amp; Catering
              </span>

              {guest.rsvp ? (
                <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] space-y-3 shadow-2xs">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#8C7A7C] text-[10px] block font-medium">Response</span>
                      <span className={`font-bold inline-flex items-center gap-1 ${
                        rsvpStatus === 'Attending' ? 'text-[#136A4E]' : rsvpStatus === 'Not Attending' ? 'text-[#8C4A4A]' : 'text-[#8C6D2E]'
                      }`}>
                        {rsvpStatus === 'Attending' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A]" /> : <XCircle className="w-3.5 h-3.5" />}
                        {rsvpStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#8C7A7C] text-[10px] block font-medium">Confirmed Attendees</span>
                      <span className="font-bold text-[#350811]">
                        {guest.rsvp.attending_member_count || guest.number_of_members || 1} Members
                      </span>
                    </div>

                    <div>
                      <span className="text-[#8C7A7C] text-[10px] block font-medium">Meal Preference</span>
                      <span className="font-semibold text-[#20181A] flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-[#9C772F]" />
                        {guest.rsvp.meal_preference || 'Standard Veg'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#8C7A7C] text-[10px] block font-medium">Responded On</span>
                      <span className="text-[#736567]">
                        {guest.rsvp.responded_at ? new Date(guest.rsvp.responded_at).toLocaleDateString('en-IN') : 'Cloud Record'}
                      </span>
                    </div>
                  </div>

                  {/* Special Note / Wishes */}
                  {(guest.rsvp.wishes || guest.rsvp.special_note) && (
                    <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1] text-xs space-y-1">
                      <span className="text-[10px] font-semibold text-[#9C772F] uppercase font-mono block">
                        Family Wishes &amp; Special Note
                      </span>
                      <p className="text-[#350811] italic leading-relaxed">
                        "{guest.rsvp.wishes || guest.rsvp.special_note}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Refined Pending State */
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD1] text-center space-y-2.5">
                  <p className="text-xs text-[#736567] max-w-xs mx-auto">
                    RSVP not received yet. This guest has not submitted an attendance response.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#8C6D2E] border border-[#E8DFD1] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#9C772F]" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. PERSONAL INVITATION LINK */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#E8DFD1] pb-2">
                Personal Invitation Link
              </span>

              <div className="p-2.5 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 font-mono text-[11px] text-[#540D1E] truncate">
                  {personalizedLink}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5EFE4] text-[#4A3E40] border border-[#E8DFD1] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-[#167A5A]" /> : <Copy className="w-3 h-3 text-[#9C772F]" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5EFE4] text-[#540D1E] border border-[#E8DFD1] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Open Invitation in New Tab"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Open Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 8. GUEST JOURNEY TIMELINE */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#E8DFD1] pb-2">
                Guest Journey Timeline
              </span>

              <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFD1]">
                {journeyTimeline.map((step) => (
                  <div key={step.id} className="relative pl-3">
                    {/* Status Dot */}
                    <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 bg-white ${
                      step.status === 'completed' 
                        ? 'border-[#167A5A] bg-[#167A5A]' 
                        : 'border-[#D6C7B2] bg-white'
                    }`} />

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${
                          step.status === 'completed' ? 'text-[#20181A]' : 'text-[#8C7A7C]'
                        }`}>
                          {step.title}
                        </span>
                        {step.timestamp && (
                          <span className="text-[10px] font-mono text-[#8C7A7C] shrink-0">
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6C5D60] mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailDrawer;
