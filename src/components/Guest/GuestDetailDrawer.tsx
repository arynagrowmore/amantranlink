import React, { useEffect, useMemo, useState } from 'react';
import { 
  X, Copy, Check, ExternalLink, Edit2, Trash2, 
  Users, Phone, Mail, Calendar, Clock, CheckCircle2, XCircle, 
  Utensils, Heart, Sparkles, Crown, Share2, ArrowUpRight,
  AlertCircle, BookOpen, QrCode
} from 'lucide-react';
import { GuestRecord, AttendanceStatus } from '../../types/guest';
import { WeddingProjectState } from '../../types/wedding';
import { formatWhatsAppWeddingMessage, openWhatsAppShare } from '../../utils/whatsappShare';

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

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const personalizedLink = guest ? `${originUrl}/i/${weddingSlug}?guest=${guest.personal_invitation_token}` : '';

  const handleCopyLink = () => {
    if (!personalizedLink) return;
    navigator.clipboard.writeText(personalizedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!guest) return;
    const text = formatWhatsAppWeddingMessage({
      state,
      language: state.language || 'en',
      guest,
      invitationUrl: personalizedLink,
    });
    openWhatsAppShare(text, guest.phone);
  };

  const handleDelete = () => {
    if (!guest) return;
    onDeleteGuest(guest.id);
  };

  if (!isOpen || !guest) return null;

  const familyTitle = guest.family_name || `${guest.full_name}'s Family`;
  const rsvp = guest.rsvp;
  const rsvpStatus = rsvp?.attendance_status || 'Pending';
  const headcount = rsvp?.attending_member_count || guest.number_of_members || 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-manrope">
      
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-10 pointer-events-none">
        <div className="w-screen max-w-lg bg-white border-l border-[#E8DFD1] shadow-2xl pointer-events-auto flex flex-col h-full animate-slideInRight text-[#241A17]">
          
          {/* Top Gold Accent */}
          <div className="h-1.5 w-full bg-linear-to-r from-[#C49A35] via-[#F4D06F] to-[#C49A35] shrink-0" />

          {/* Header */}
          <div className="p-6 border-b border-[#E8DFD1] bg-[#FAF6EE] shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-serif text-lg font-bold shrink-0 ${
                  guest.relationship === 'VIP'
                    ? 'bg-[#FAF4E8] text-[#C49A35] border-[#E8D5AD]'
                    : 'bg-white text-[#6E1020] border-[#E8DFD1]'
                }`}>
                  {familyTitle.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-2xl text-[#241A17] font-normal leading-tight">
                      {familyTitle}
                    </h2>
                    {guest.relationship === 'VIP' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-[#C49A35] bg-[#FAF4E8] border border-[#E8D5AD] px-2 py-0.5 rounded-md">
                        <Crown className="w-3 h-3 text-[#C49A35]" />
                        VIP Family
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#736567] mt-0.5 font-light">
                    Primary: {guest.full_name} · {guest.relationship} Circle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white text-[#736567] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. RSVP & Attendance Status Card */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              rsvpStatus === 'Attending'
                ? 'bg-[#EDF7F2] border-[#BCE3D1]'
                : rsvpStatus === 'Not Attending'
                ? 'bg-[#FDF2F2] border-[#F0D5D5]'
                : rsvpStatus === 'Maybe'
                ? 'bg-[#FAF4E8] border-[#F2DEB0]'
                : 'bg-[#FAF6EE] border-[#E8DFD1]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                  rsvpStatus === 'Attending' ? 'text-[#167A5A]' : rsvpStatus === 'Not Attending' ? 'text-[#8C4A4A]' : 'text-[#C49A35]'
                }`}>
                  RSVP Response
                </span>
                {rsvpStatus === 'Attending' && (
                  <span className="text-xs font-semibold text-[#167A5A] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Joyfully Attending
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <div className="font-serif text-3xl font-medium text-[#241A17]">
                  {rsvpStatus === 'Attending' ? `${headcount} Guests Confirmed` : `${guest.number_of_members || 1} Guests Expected`}
                </div>
              </div>

              {rsvp?.wishes && (
                <div className="pt-2 border-t border-black/5 text-xs text-[#241A17] italic">
                  &ldquo;{rsvp.wishes}&rdquo;
                </div>
              )}

              {rsvp?.meal_preference && (
                <div className="text-xs text-[#736567] flex items-center gap-1.5 pt-1">
                  <Utensils className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Meal preference: <strong className="text-[#241A17] font-medium">{rsvp.meal_preference}</strong></span>
                </div>
              )}
            </div>

            {/* 2. Personal Invitation Links & Actions */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C49A35] block">
                {familyTitle}&apos;s Invitation
              </span>

              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD1] space-y-3">
                <p className="text-xs text-[#736567] font-light">
                  This family has their own personalized wedding link with automatic name recognition and direct RSVP.
                </p>

                <div className="flex items-center gap-2">
                  <a
                    href={personalizedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#F4D06F]" />
                    <span>Preview Invitation</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-[#F4EFE6] text-[#241A17] border border-[#E8DFD1] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#C49A35]" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3.5 rounded-xl bg-[#EDF7F2] hover:bg-[#DCF0E6] text-[#167A5A] border border-[#BCE3D1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Contact & Member Information */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C49A35] block">
                Contact Details
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6EE]/50 border border-[#E8DFD1]/70">
                  <span className="text-[#736567]">Phone (WhatsApp):</span>
                  <span className="font-mono text-[#241A17] font-semibold">{guest.phone}</span>
                </div>

                {guest.email && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6EE]/50 border border-[#E8DFD1]/70">
                    <span className="text-[#736567]">Email Address:</span>
                    <span className="text-[#241A17]">{guest.email}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6EE]/50 border border-[#E8DFD1]/70">
                  <span className="text-[#736567]">Circle / Group:</span>
                  <span className="text-[#241A17] font-medium">{guest.relationship}</span>
                </div>
              </div>
            </div>

            {/* QR Pass (if Attending) */}
            {rsvpStatus === 'Attending' && onOpenEntryPass && (
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#C49A35]/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#241A17] block">Digital Venue Entry Pass</span>
                  <p className="text-[11px] text-[#736567]">Guest entry pass with venue check-in QR code</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenEntryPass(guest)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4EFE6] text-[#6E1020] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>View Pass</span>
                </button>
              </div>
            )}

            {/* Separator */}
            <div className="h-px bg-[#E8DFD1]" />

            {/* Secondary Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onEditGuest(guest);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#241A17] border border-[#E8DFD1] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Edit Family</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#8C4A4A] hover:bg-[#FDF2F2] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Family</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailDrawer;
