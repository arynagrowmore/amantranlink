import React from 'react';
import { 
  Users, CheckCircle2, ShieldCheck, ArrowRight, 
  MessageSquare, Calendar, Phone, Heart, Sparkles, ExternalLink 
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';

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

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>{isEngagement ? 'STEP 07 · GUEST RSVP' : 'STEP 07 · LIVE RSVP CONFIGURATION'}</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          Guest RSVP &amp; Attendance Settings
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          {isEngagement 
            ? 'Configure how your guests respond, submit headcount, and send warm engagement blessings.'
            : 'Configure how your guests respond, submit headcount, and send auspicious family blessings.'}
        </p>
      </div>

      {/* Enable / Disable RSVP Toggle Card */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-4 shadow-xs">
        <div className="space-y-0.5">
          <h4 className="font-cormorant font-bold text-lg text-[#430914]">
            Enable Live Guest RSVP Form
          </h4>
          <p className="text-xs text-[#75675C]">
            Allows guests to submit attendance directly on your invitation.
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

          {/* Family Contact Helpdesk Numbers */}
          <div className="space-y-3 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD]">
            <h4 className="font-cormorant font-bold text-base text-[#430914] uppercase tracking-wider">
              Family Contact Helpdesk Numbers
            </h4>
            <p className="text-xs text-[#75675C]">
              Displayed in the invitation so guests can contact your family organizers directly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#430914]">Organizer 1 Name</label>
                <input
                  type="text"
                  value={family.rsvp1Name || ''}
                  onChange={(e) => onChangeFamily({ rsvp1Name: e.target.value })}
                  placeholder="e.g. Nalinkumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] text-xs font-medium text-[#241A17] outline-none focus:border-[#C49A35]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#430914]">Organizer 1 Phone</label>
                <input
                  type="tel"
                  value={family.rsvp1Phone || ''}
                  onChange={(e) => onChangeFamily({ rsvp1Phone: e.target.value })}
                  placeholder="+91 9409360336"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD] text-xs font-medium text-[#241A17] outline-none focus:border-[#C49A35] font-mono"
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
