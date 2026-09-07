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
  const weddingDate = state.events?.[0]?.date || 'Auspicious Date';
  const venueLocation = state.events?.[0]?.venue || 'Royal Palace Venue';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FFFDF8] border border-[#E8DFD1] shadow-2xl text-[#241A17] flex flex-col max-h-[90vh]">
        
        {/* Top Gold Ornament Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#C49A35] via-[#F4D06F] to-[#C49A35] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#736567] transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="p-8 sm:p-10 text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EDF7F2] border border-[#BCE3D1] flex items-center justify-center text-[#167A5A] shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="font-serif italic text-xs text-[#C49A35] block">
                ॥ शुभ विवाह आमंत्रण स्वीकृति ॥
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
                {attendance === 'Attending' ? 'We Look Forward to Celebrating With You!' : 'Thank You for Your Wishes'}
              </h3>
              <p className="text-xs sm:text-sm text-[#736567] leading-relaxed max-w-sm mx-auto">
                {attendance === 'Attending'
                  ? `Thank you, ${guestName}! Your presence will grace our celebration.`
                  : `Thank you for letting us know, ${guestName}. Your warm blessings are treasured.`}
              </p>
            </div>

            {attendance === 'Attending' && (
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD1] flex items-center justify-around text-xs">
                <div>
                  <span className="text-[#736567] block text-[10px] uppercase font-mono">Attendance</span>
                  <span className="text-[#167A5A] font-bold">JOYFULLY ATTENDING</span>
                </div>
                <div className="h-6 w-px bg-[#E8DFD1]" />
                <div>
                  <span className="text-[#736567] block text-[10px] uppercase font-mono">Headcount</span>
                  <span className="text-[#241A17] font-bold">{memberCount} Guests</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#6E1020] hover:bg-[#540D1E] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
            >
              Continue to Wedding Invitation
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
            {/* Header */}
            <div className="text-center space-y-1 border-b border-[#FAF6EE] pb-4">
              <span className="font-serif italic text-xs text-[#C49A35] block">
                ॥ श्री गणेशाय नमः ॥
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
                {guest?.family_name || guest?.full_name ? `Will You Join Us, ${guest.family_name || guest.full_name}?` : 'Will You Join Us?'}
              </h2>
              <p className="text-xs text-[#736567] font-light">
                {coupleTitle} · {weddingDate} · {venueLocation}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] text-[#8C4A4A] text-xs text-center">
                {error}
              </div>
            )}

            {/* Attendance Choice Buttons */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#736567] block uppercase font-mono">
                Will you join us for the celebration?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendance('Attending')}
                  className={`p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Attending'
                      ? 'bg-[#EDF7F2] border-[#167A5A] text-[#167A5A] shadow-xs'
                      : 'bg-[#FAF6EE] border-[#E8DFD1] text-[#736567] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span className="text-base">🌸</span>
                  <span>Joyfully Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance('Not Attending')}
                  className={`p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Not Attending'
                      ? 'bg-[#FDF2F2] border-[#8C4A4A] text-[#8C4A4A] shadow-xs'
                      : 'bg-[#FAF6EE] border-[#E8DFD1] text-[#736567] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span className="text-base">🕊️</span>
                  <span>Unable to Attend</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance('Maybe')}
                  className={`p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    attendance === 'Maybe'
                      ? 'bg-[#FAF4E8] border-[#C49A35] text-[#9C772F] shadow-xs'
                      : 'bg-[#FAF6EE] border-[#E8DFD1] text-[#736567] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span className="text-base">⏳</span>
                  <span>Maybe</span>
                </button>
              </div>
            </div>

            {/* Guest Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#241A17] block mb-1">
                  Full Name <span className="text-[#8C4A4A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Mukeshbhai Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD1] text-[#241A17] placeholder:text-[#9C8C8E] text-xs focus:outline-none focus:border-[#C49A35]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#241A17] block mb-1">
                  WhatsApp Mobile <span className="text-[#8C4A4A]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. 9409360336"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD1] text-[#241A17] placeholder:text-[#9C8C8E] text-xs focus:outline-none focus:border-[#C49A35] font-mono"
                />
              </div>
            </div>

            {/* Headcount & Meal (if Attending) */}
            {attendance === 'Attending' && (
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD1] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#241A17] block">Number of Guests</span>
                    <span className="text-[10px] text-[#736567]">Attending family members</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-[#E8DFD1]">
                    <button
                      type="button"
                      onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                      className="w-7 h-7 rounded-lg bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#6E1020] font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-serif font-bold text-base text-[#241A17] min-w-6 text-center">
                      {memberCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMemberCount(Math.min(maxAllowed, memberCount + 1))}
                      className="w-7 h-7 rounded-lg bg-[#FAF6EE] hover:bg-[#F4EFE6] text-[#6E1020] font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dietary Preference */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#736567] flex items-center gap-1.5 uppercase font-mono">
                    <Utensils className="w-3.5 h-3.5 text-[#C49A35]" />
                    Meal / Catering Preference
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Standard', label: 'Traditional Feast', sub: 'Pure Veg Catering', icon: '🍛' },
                      { id: 'Pure Jain', label: 'Pure Jain', sub: 'No Root Veg / Garlic', icon: '🌱' },
                      { id: 'Gujarati Traditional', label: 'Gujarati Rasoi', sub: 'Authentic Sweets & Farsan', icon: '🥘' },
                      { id: 'Continental', label: 'Continental', sub: 'Fusion Counter', icon: '🍽️' },
                      { id: 'Vegan', label: 'Pure Vegan', sub: 'Plant-based', icon: '🥗' },
                    ].map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => setMealPreference(meal.id as MealPreference)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          mealPreference === meal.id
                            ? 'bg-white border-[#C49A35] text-[#241A17] shadow-2xs ring-1 ring-[#C49A35]/40'
                            : 'bg-white/60 border-[#E8DFD1] text-[#736567] hover:bg-white'
                        }`}
                      >
                        <span className="text-base shrink-0">{meal.icon}</span>
                        <div className="min-w-0">
                          <span className="font-semibold text-[11px] block leading-tight truncate text-[#241A17]">
                            {meal.label}
                          </span>
                          <span className="text-[9px] text-[#736567] block truncate">
                            {meal.sub}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Wishes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#241A17] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
                Blessings &amp; Message for the Couple
              </label>
              <textarea
                rows={2}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Write a heartfelt blessing for the auspicious couple..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD1] text-[#241A17] placeholder:text-[#9C8C8E] text-xs focus:outline-none focus:border-[#C49A35] resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#6E1020] hover:bg-[#540D1E] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Recording Your RSVP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send RSVP</span>
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
