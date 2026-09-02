import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Heart, Users, Sparkles, Utensils, 
  MessageSquare, X, Send, Clock, ShieldCheck 
} from 'lucide-react';
import { submitAdvancedGuestRsvp } from '../../services/rsvpService';
import { GuestRecord, AttendanceStatus, MealPreference } from '../../types/guest';
import { WeddingProjectState } from '../../types/wedding';

interface AdvancedRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  guest?: GuestRecord | null;
  weddingSiteId?: string;
  weddingSlug?: string;
  onSuccess?: () => void;
}

export const AdvancedRsvpModal: React.FC<AdvancedRsvpModalProps> = ({
  isOpen,
  onClose,
  state,
  guest,
  weddingSiteId,
  weddingSlug,
  onSuccess,
}) => {
  const [attendance, setAttendance] = useState<AttendanceStatus>('Attending');
  const [guestName, setGuestName] = useState<string>(guest?.full_name || '');
  const [guestPhone, setGuestPhone] = useState<string>(guest?.phone || '');
  const [memberCount, setMemberCount] = useState<number>(guest?.number_of_members || 2);
  const [mealPreference, setMealPreference] = useState<MealPreference>('Standard');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [wishes, setWishes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (guest) {
      setGuestName(guest.full_name || '');
      setGuestPhone(guest.phone || '');
      setMemberCount(guest.number_of_members || 2);
      if (guest.rsvp) {
        setAttendance(guest.rsvp.attendance_status || 'Attending');
        setMemberCount(guest.rsvp.attending_member_count || guest.number_of_members || 2);
        if (guest.rsvp.meal_preference) setMealPreference(guest.rsvp.meal_preference as MealPreference);
        if (guest.rsvp.special_note) setSpecialNote(guest.rsvp.special_note);
        if (guest.rsvp.wishes) setWishes(guest.rsvp.wishes);
      }
    }
  }, [guest, isOpen]);

  if (!isOpen) return null;

  const maxAllowed = guest?.number_of_members ? Math.max(guest.number_of_members, 10) : 10;
  const coupleTitle = `${state.couple.groomEn || 'Groom'} & ${state.couple.brideEn || 'Bride'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await submitAdvancedGuestRsvp({
      wedding_site_id: weddingSiteId || '',
      wedding_slug: weddingSlug || '',
      guest_token: guest?.personal_invitation_token,
      guest_id: guest?.id,
      guest_name: guestName,
      guest_phone: guestPhone,
      attendance_status: attendance,
      attending_member_count: attendance === 'Attending' ? memberCount : 0,
      meal_preference: mealPreference,
      special_note: specialNote,
      wishes,
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Unable to submit RSVP. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0204]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-linear-to-b from-[#1C050B] to-[#120306] border-2 border-[#C59B4B]/40 shadow-[0_20px_70px_rgba(0,0,0,0.8)] text-[#F7E7C4] font-hanken">
        {/* Top Gold Ornament Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#E2B968] transition-all cursor-pointer border border-[#C59B4B]/20"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* 🎉 Success State */
          <div className="p-8 sm:p-10 text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#C59B4B]/15 border-2 border-[#C59B4B] flex items-center justify-center text-[#F4D06F] shadow-[0_0_30px_rgba(197,155,75,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C59B4B] font-bold">
                ॥ श्री गणेशाय नमः ॥
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-[#FFFDF8]">
                {attendance === 'Attending' ? 'RSVP Confirmed!' : 'Response Recorded'}
              </h3>
              <p className="text-xs sm:text-sm text-[#D1BFA5] leading-relaxed max-w-sm mx-auto">
                {attendance === 'Attending'
                  ? `Thank you, ${guestName}! We joyfully look forward to celebrating with you.`
                  : `Thank you for letting us know, ${guestName}. Your warm wishes are treasured.`}
              </p>
            </div>

            {attendance === 'Attending' && (
              <div className="p-4 rounded-2xl bg-white/5 border border-[#C59B4B]/30 flex items-center justify-around text-xs font-mono">
                <div>
                  <span className="text-[#A8957F] block text-[10px] uppercase">Attendance</span>
                  <span className="text-emerald-400 font-bold">JOYFULLY ATTENDING</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-[#A8957F] block text-[10px] uppercase">Headcount</span>
                  <span className="text-[#F4D06F] font-bold">{memberCount} Guests</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-[#C59B4B] to-[#9C772F] text-[#140508] font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#C59B4B]/30 transition-all cursor-pointer"
            >
              Continue to Royal Invitation
            </button>
          </div>
        ) : (
          /* 📝 Form State */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C59B4B] font-bold">
                Royal Guest Response
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFFDF8]">
                {guest?.full_name ? `Welcome, ${guest.full_name}` : 'Confirm Your Presence'}
              </h2>
              <p className="text-xs text-[#D1BFA5]">
                {coupleTitle}’s Auspicious Wedding Celebration
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center">
                {error}
              </div>
            )}

            {/* Attendance Choice Buttons */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-[#A8957F] uppercase font-mono">
                Will you join us for the celebration?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendance('Attending')}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Attending'
                      ? 'bg-[#C59B4B]/20 border-[#F4D06F] text-[#F4D06F] shadow-[0_0_15px_rgba(197,155,75,0.2)]'
                      : 'bg-white/5 border-white/10 text-[#A8957F] hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">🌸</span>
                  <span className="text-[11px]">Attending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance('Not Attending')}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Not Attending'
                      ? 'bg-red-950/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-white/5 border-white/10 text-[#A8957F] hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">🕊️</span>
                  <span className="text-[11px]">Cannot Attend</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance('Maybe')}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Maybe'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 text-[#A8957F] hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">⏳</span>
                  <span className="text-[11px]">Maybe</span>
                </button>
              </div>
            </div>

            {/* Guest Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#A8957F] block mb-1 uppercase font-mono">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Mukeshbhai Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#C59B4B]/30 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-[#F4D06F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A8957F] block mb-1 uppercase font-mono">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +91 9409360336"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#C59B4B]/30 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-[#F4D06F]"
                />
              </div>
            </div>

            {/* Attending Details: Headcount & Meal */}
            {attendance === 'Attending' && (
              <div className="p-4 rounded-2xl bg-white/5 border border-[#C59B4B]/20 space-y-4 animate-fadeIn">
                {/* Number of Members Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#F7E7C4] block">Number of Guests</span>
                    <span className="text-[10px] text-[#A8957F]">Attending family members</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#140508] p-1.5 rounded-xl border border-[#C59B4B]/30">
                    <button
                      type="button"
                      onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-[#E2B968] font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm text-[#FFFDF8] min-w-6 text-center">
                      {memberCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMemberCount(Math.min(maxAllowed, memberCount + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-[#E2B968] font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dietary / Meal Preference Visual Badges */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#A8957F] flex items-center gap-1.5 uppercase font-mono">
                    <Utensils className="w-3.5 h-3.5 text-[#C59B4B]" />
                    Meal / Catering Preference
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Standard', label: 'Shahi Feast', sub: 'Traditional Veg', icon: '🍛' },
                      { id: 'Pure Jain', label: 'Pure Jain', sub: 'No Onion / Garlic', icon: '🌱' },
                      { id: 'Gujarati Traditional', label: 'Gujarati / Kathiyawadi', sub: 'Special Rasoi', icon: '🥘' },
                      { id: 'Continental', label: 'Continental', sub: 'Fusion Catering', icon: '🍽️' },
                      { id: 'Vegan', label: 'Pure Vegan', sub: 'Plant Based', icon: '🥗' },
                    ].map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => setMealPreference(meal.id as MealPreference)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          mealPreference === meal.id
                            ? 'bg-[#C59B4B]/20 border-[#F4D06F] text-[#FFFDF8] shadow-sm ring-1 ring-[#F4D06F]/50'
                            : 'bg-white/5 border-white/10 text-[#D1BFA5] hover:bg-white/10 hover:border-[#C59B4B]/40'
                        }`}
                      >
                        <span className="text-base shrink-0">{meal.icon}</span>
                        <div className="min-w-0">
                          <span className="font-semibold text-[11px] block leading-tight truncate text-[#FFFDF8]">
                            {meal.label}
                          </span>
                          <span className="text-[9px] text-[#A8957F] block truncate">
                            {meal.sub}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Wishes / Special Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#A8957F] flex items-center gap-1.5 uppercase font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-[#C59B4B]" />
                Blessings & Message for Couple
              </label>
              <textarea
                rows={2}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Write a heartfelt blessing for the auspicious couple..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#C59B4B]/30 text-white placeholder:text-stone-600 text-xs focus:outline-none focus:border-[#F4D06F] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-[#C59B4B] to-[#9C772F] text-[#140508] font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#C59B4B]/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Recording Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm RSVP</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdvancedRsvpModal;
