import React, { useState } from 'react';
import { 
  Users, CheckCircle2, ShieldCheck, ArrowRight, 
  MessageSquare, Calendar, Phone, Heart, Sparkles, ExternalLink, RefreshCw 
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { fetchOnlineTransliteration } from '../utils/autoTranslator';

interface RsvpSettingsManagerProps {
  theme?: WeddingProjectState['theme'];
  invitationType?: WeddingProjectState['invitation_type'];
  family: WeddingProjectState['family'];
  rsvpConfig?: WeddingProjectState['rsvpConfig'];
  onChangeFamily: (updated: Partial<WeddingProjectState['family']>) => void;
  onChangeConfig: (updated: Partial<NonNullable<WeddingProjectState['rsvpConfig']>>) => void;
  onSaveAndNext: () => void;
  onOpenRsvpDashboard?: () => void;
}

export const RsvpSettingsManager: React.FC<RsvpSettingsManagerProps> = ({
  theme,
  invitationType,
  family,
  rsvpConfig = {
    enabled: true,
    collectPhone: true,
    collectGuestsCount: true,
    collectMealPreference: false,
    collectWishes: true,
    deadline: '',
    note: '',
  },
  onChangeFamily,
  onChangeConfig,
  onSaveAndNext,
  onOpenRsvpDashboard,
}) => {
  const isEngagement = invitationType === 'engagement';
  const [isTranslatingGroom, setIsTranslatingGroom] = useState<boolean>(false);
  const [isTranslatingBride, setIsTranslatingBride] = useState<boolean>(false);

  // Real-time Groom's Parents Auto-Transliteration
  const handleGroomParentsEnChange = async (val: string) => {
    onChangeFamily({ groomParentsEn: val });
    if (val.trim()) {
      setIsTranslatingGroom(true);
      try {
        const { hi, gu } = await fetchOnlineTransliteration(val);
        onChangeFamily({
          groomParentsEn: val,
          groomParentsHi: hi,
          groomParentsGu: gu,
        });
      } finally {
        setIsTranslatingGroom(false);
      }
    }
  };

  // Real-time Bride's Parents Auto-Transliteration
  const handleBrideParentsEnChange = async (val: string) => {
    onChangeFamily({ brideParentsEn: val });
    if (val.trim()) {
      setIsTranslatingBride(true);
      try {
        const { hi, gu } = await fetchOnlineTransliteration(val);
        onChangeFamily({
          brideParentsEn: val,
          brideParentsHi: hi,
          brideParentsGu: gu,
        });
      } finally {
        setIsTranslatingBride(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>{isEngagement ? 'STEP 09 · FAMILY & GUEST HOSPITALITY' : 'STEP 09 · FAMILY, PARENTS & RSVP'}</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          Kutumb Pariwar, Parents &amp; Guest Hospitality
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          Customize Groom &amp; Bride Parents' names, family blessings, and guest helpline contacts displayed on all templates.
        </p>
      </div>

      {/* 👨‍👩‍👧‍👦 1. FAMILY & PARENTS BLESSINGS CARD */}
      <div className="space-y-4 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2.5">
          <h4 className="font-cormorant font-bold text-lg text-[#430914] flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span>
            <span>Parents &amp; Family Details (माता-पिता व कुटुंब)</span>
          </h4>
          <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#167A5A]" /> Trilingual Auto-Fill
          </span>
        </div>

        {/* Groom's Parents */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8D5AD]/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#6E1020] flex items-center gap-1.5">
              <span>Groom's Parents (वर पक्ष माता-पिता)</span>
            </label>
            {isTranslatingGroom && (
              <span className="text-[9.5px] font-mono text-[#C49A35] flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Translating...
              </span>
            )}
          </div>
          <input
            type="text"
            value={family.groomParentsEn || ''}
            onChange={(e) => handleGroomParentsEnChange(e.target.value)}
            placeholder="e.g. Mr. Nalinkumar & Mrs. Kalpuben"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] outline-none focus:border-[#C49A35] shadow-2xs"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              value={family.groomParentsHi || ''}
              onChange={(e) => onChangeFamily({ groomParentsHi: e.target.value })}
              placeholder="हिन्दी: श्री नलिनकुमार एवं श्रीमती कल्पूबेन"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8D5AD] text-[11px] text-[#241A17] outline-none focus:border-[#C49A35]"
            />
            <input
              type="text"
              value={family.groomParentsGu || ''}
              onChange={(e) => onChangeFamily({ groomParentsGu: e.target.value })}
              placeholder="ગુજરાતી: શ્રી નલિનકુમાર અને શ્રીમતી કલ્પૂબેન"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8D5AD] text-[11px] text-[#241A17] outline-none focus:border-[#C49A35]"
            />
          </div>
        </div>

        {/* Bride's Parents */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8D5AD]/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#6E1020] flex items-center gap-1.5">
              <span>Bride's Parents (वधू पक्ष माता-पिता)</span>
            </label>
            {isTranslatingBride && (
              <span className="text-[9.5px] font-mono text-[#C49A35] flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Translating...
              </span>
            )}
          </div>
          <input
            type="text"
            value={family.brideParentsEn || ''}
            onChange={(e) => handleBrideParentsEnChange(e.target.value)}
            placeholder="e.g. Mr. Vikram & Mrs. Ishani Kapoor"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] outline-none focus:border-[#C49A35] shadow-2xs"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              value={family.brideParentsHi || ''}
              onChange={(e) => onChangeFamily({ brideParentsHi: e.target.value })}
              placeholder="हिन्दी: श्री विक्रम एवं श्रीमती ईशानी कपूर"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8D5AD] text-[11px] text-[#241A17] outline-none focus:border-[#C49A35]"
            />
            <input
              type="text"
              value={family.brideParentsGu || ''}
              onChange={(e) => onChangeFamily({ brideParentsGu: e.target.value })}
              placeholder="ગુજરાતી: શ્રી વિક્રમ અને શ્રીમતી ઈશાની કપૂર"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8D5AD] text-[11px] text-[#241A17] outline-none focus:border-[#C49A35]"
            />
          </div>
        </div>

        {/* Grandparents & Elders Note */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#430914]">
            Elders &amp; Grandparents Blessing Note (दादा-दादी व बुजुर्गों का आशीर्वाद)
          </label>
          <input
            type="text"
            value={family.customNote || ''}
            onChange={(e) => onChangeFamily({ customNote: e.target.value })}
            placeholder="With divine blessings of Grandparents &amp; Elders"
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8D5AD] text-xs text-[#241A17] outline-none focus:border-[#C49A35]"
          />
        </div>
      </div>

      {/* 📞 2. FAMILY CONTACT HELPDESK NUMBERS */}
      <div className="space-y-3 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs">
        <h4 className="font-cormorant font-bold text-base text-[#430914] uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-[#C49A35]" />
          <span>Family Helpline &amp; Guest Contacts</span>
        </h4>
        <p className="text-xs text-[#75675C]">
          Displayed in the template footer &amp; RSVP card so guests can call your organizers directly for directions or assistance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Organizer 1 */}
          <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8D5AD]/60 space-y-2">
            <span className="text-[11px] font-bold text-[#6E1020] block">Organizer 1 (Primary Helpline)</span>
            <input
              type="text"
              value={family.rsvp1Name || ''}
              onChange={(e) => onChangeFamily({ rsvp1Name: e.target.value })}
              placeholder="Name (e.g. Nalinkumar)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] outline-none focus:border-[#C49A35]"
            />
            <input
              type="tel"
              value={family.rsvp1Phone || ''}
              onChange={(e) => onChangeFamily({ rsvp1Phone: e.target.value })}
              placeholder="Phone (e.g. +91 9409360336)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8D5AD] text-xs font-mono font-bold text-[#241A17] outline-none focus:border-[#C49A35]"
            />
          </div>

          {/* Organizer 2 */}
          <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8D5AD]/60 space-y-2">
            <span className="text-[11px] font-bold text-[#6E1020] block">Organizer 2 (Secondary Helpline)</span>
            <input
              type="text"
              value={family.rsvp2Name || ''}
              onChange={(e) => onChangeFamily({ rsvp2Name: e.target.value })}
              placeholder="Name (e.g. Family Helpdesk)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] outline-none focus:border-[#C49A35]"
            />
            <input
              type="tel"
              value={family.rsvp2Phone || ''}
              onChange={(e) => onChangeFamily({ rsvp2Phone: e.target.value })}
              placeholder="Phone (e.g. +91 9898234567)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8D5AD] text-xs font-mono font-bold text-[#241A17] outline-none focus:border-[#C49A35]"
            />
          </div>
        </div>
      </div>

      {/* 📋 3. LIVE GUEST RSVP FORM TOGGLE */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-4 shadow-xs">
        <div className="space-y-0.5">
          <h4 className="font-cormorant font-bold text-lg text-[#430914]">
            Enable Live Guest RSVP Form
          </h4>
          <p className="text-xs text-[#75675C]">
            Allows guests to submit attendance &amp; headcounts directly on your invitation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChangeConfig({ enabled: !rsvpConfig.enabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            rsvpConfig.enabled ? 'bg-[#6E1020]' : 'bg-[#E8D5AD]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#FFFDF8] shadow ring-0 transition duration-200 ease-in-out ${
              rsvpConfig.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Guest Response Fields Toggles */}
      {rsvpConfig.enabled && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-3 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD]">
            <h4 className="font-cormorant font-bold text-base text-[#430914] uppercase tracking-wider">
              Information Collected From Guests
            </h4>

            <div className="space-y-2.5 text-xs text-[#241A17]">
              {/* Guest Name */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/60">
                <span className="font-semibold">Guest Full Name</span>
                <span className="text-[10px] font-mono text-[#167A5A] font-bold">Required (Always On)</span>
              </div>

              {/* Attendance */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/60">
                <span className="font-semibold">Attendance (Attending / Regrets)</span>
                <span className="text-[10px] font-mono text-[#167A5A] font-bold">Required (Always On)</span>
              </div>

              {/* Guest Count Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/60">
                <span>Number of Family Members (Headcount)</span>
                <input
                  type="checkbox"
                  checked={rsvpConfig.collectGuestsCount}
                  onChange={(e) => onChangeConfig({ collectGuestsCount: e.target.checked })}
                  className="w-4 h-4 text-[#6E1020] accent-[#6E1020] rounded cursor-pointer"
                />
              </div>

              {/* Phone Number Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/60">
                <span>Guest Phone Number / WhatsApp</span>
                <input
                  type="checkbox"
                  checked={rsvpConfig.collectPhone}
                  onChange={(e) => onChangeConfig({ collectPhone: e.target.checked })}
                  className="w-4 h-4 text-[#6E1020] accent-[#6E1020] rounded cursor-pointer"
                />
              </div>

              {/* Wishes & Blessings Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/60">
                <span>Personal Wishes / Blessings Message</span>
                <input
                  type="checkbox"
                  checked={rsvpConfig.collectWishes}
                  onChange={(e) => onChangeConfig({ collectWishes: e.target.checked })}
                  className="w-4 h-4 text-[#6E1020] accent-[#6E1020] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>


          {/* Dedicated RSVP Isolation Notice */}
          <div className="p-4 rounded-2xl bg-[#F8F3E8] border border-[#C49A35]/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#167A5A] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#430914] block">
                100% Isolated Kankotri RSVP Database
              </span>
              <p className="text-[#75675C] leading-relaxed">
                Every RSVP submitted belongs exclusively to this wedding invitation. Responses are never mixed across different weddings.
              </p>
              {onOpenRsvpDashboard && (
                <button
                  type="button"
                  onClick={onOpenRsvpDashboard}
                  className="text-xs text-[#6E1020] hover:text-[#C49A35] font-semibold inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <span>Open RSVP Management Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save & Next CTA */}
      <div className="pt-4 border-t border-[#E8D5AD]/60 flex justify-end">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-semibold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <span>Save &amp; Continue to Review</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default RsvpSettingsManager;
