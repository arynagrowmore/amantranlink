import React from 'react';
import { Sparkles, CheckCircle2, Send, Users } from 'lucide-react';
import { GuestRecord } from '../../types/guest';

interface PersonalizedGuestBannerProps {
  guest: GuestRecord;
  onOpenRsvp: () => void;
}

export const PersonalizedGuestBanner: React.FC<PersonalizedGuestBannerProps> = ({
  guest,
  onOpenRsvp,
}) => {
  const isResponded = Boolean(guest.rsvp);
  const isAttending = guest.rsvp?.attendance_status === 'Attending';
  const displayName = guest.family_name 
    ? `${guest.full_name} & ${guest.family_name}` 
    : guest.full_name;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-fadeInDown">
      <div className="px-4 py-2.5 rounded-2xl bg-[#140508]/90 backdrop-blur-md border border-[#C59B4B]/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 text-[#F7E7C4] font-hanken">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#C59B4B]/15 border border-[#C59B4B]/50 flex items-center justify-center text-[#F4D06F] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-wider text-[#C59B4B] uppercase font-bold">
                Personalized Invitation
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-stone-300 font-mono">
                {guest.relationship}
              </span>
            </div>
            <p className="text-xs font-bold text-[#FFFDF8] truncate">
              Dear {displayName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRsvp}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
            isResponded
              ? isAttending
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-stone-900/80 border-stone-600 text-stone-300 hover:bg-stone-800'
              : 'bg-linear-to-r from-[#C59B4B] to-[#9C772F] text-[#140508] border-[#C59B4B] hover:shadow-[#C59B4B]/30 hover:scale-105'
          }`}
        >
          {isResponded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAttending ? 'RSVP Confirmed' : 'Response Sent'}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>RSVP Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PersonalizedGuestBanner;
