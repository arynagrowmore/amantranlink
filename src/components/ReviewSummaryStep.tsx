import React from 'react';
import { 
  CheckCircle2, Sparkles, ArrowRight, Eye, Layers, 
  Users, Calendar, MapPin, Music, Image as ImageIcon, Globe, MailCheck 
} from 'lucide-react';
import { WeddingProjectState, ThemeId } from '../types/wedding';
import { themes } from './ThemeSelector';

interface ReviewSummaryStepProps {
  state: WeddingProjectState;
  onOpenFullscreenPreview: () => void;
  onProceedToPublish: () => void;
  onJumpToStep: (stepId: string) => void;
}

export const ReviewSummaryStep: React.FC<ReviewSummaryStepProps> = ({
  state,
  onOpenFullscreenPreview,
  onProceedToPublish,
  onJumpToStep,
}) => {
  const isEngagement = state.invitation_type === 'engagement';
  const currentTheme = themes.find((t) => t.id === state.theme) || themes[0];
  const uploadedPhotosCount = Object.values(state.media.photoSlots).filter((s) => s.url).length;
  const isRsvpEnabled = state.rsvpConfig?.enabled !== false;
  const isMusicEnabled = state.media.isMusicEnabled !== false;

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A]" />
          <span>{isEngagement ? 'STEP 08 · REVIEW & PUBLISH' : 'STEP 08 · FINAL INVITATION REVIEW'}</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          {isEngagement ? 'Inspect Your Royal Engagement Invitation' : 'Inspect Your Royal Kankotri'}
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          {isEngagement 
            ? 'Verify all details before publishing and generating your permanent public engagement link.'
            : 'Verify all details before publishing and generating your permanent public invitation link.'}
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="space-y-3">
        
        {/* 1. Theme Summary */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center font-bold text-lg border border-[#C49A35]">
              {currentTheme.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">
                {isEngagement ? 'Selected Engagement Theme' : 'Selected Royal Theme'}
              </span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">{currentTheme.name}</h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('theme')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* 2. Couple Summary */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <Users className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">Couple Details</span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">
                {state.couple.groomEn || 'Partner 1'} &amp; {state.couple.brideEn || 'Partner 2'}
              </h4>
              <p className="text-[11px] text-[#75675C]">{state.couple.weddingDate || 'Date not set'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('couple')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 3. Events Summary */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <Calendar className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">
                {isEngagement ? 'Engagement Events' : 'Celebration Rasams'}
              </span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">
                {state.events.length} {isEngagement ? 'Events Added' : 'Wedding Events Added'}
              </h4>
              <p className="text-[11px] text-[#75675C]">
                {state.events.map((e) => e.name.replace(/^[^\w]+/, '')).slice(0, 3).join(', ')}
                {state.events.length > 3 ? '...' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('events')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 4. Venue & Map */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <MapPin className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">Venue &amp; Maps</span>
              <h4 className="font-cormorant font-bold text-base text-[#430914] truncate">
                {state.couple.venueName || 'Venue not configured'}
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('venue')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 5. Photos Gallery */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <ImageIcon className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">Moments Gallery</span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">
                {uploadedPhotosCount} High-Res Moments Uploaded
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('media')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 6. Background Music */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <Music className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">Background Music</span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">
                {isMusicEnabled ? (state.media.audioName || 'Lossless Vedic Shehnai & Nagada') : 'Music Muted'}
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('music')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 7. RSVP Configuration */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F3E8] text-[#6E1020] flex items-center justify-center border border-[#E8D5AD]">
              <MailCheck className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C49A35] uppercase font-bold block">Guest RSVP Center</span>
              <h4 className="font-cormorant font-bold text-base text-[#430914]">
                {isRsvpEnabled ? 'RSVP Active & Isolated' : 'RSVP Disabled'}
              </h4>
              <p className="text-[11px] text-[#75675C]">
                Helpdesk: {state.family.rsvp1Name || 'Family Contact'} ({state.family.rsvp1Phone || '+91 9409360336'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('rsvp')}
            className="text-xs font-semibold text-[#6E1020] hover:text-[#C49A35] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

      </div>

      {/* Validation Checklist Warning if Missing Fields */}
      {(!state.couple.groomEn || !state.couple.brideEn || !state.couple.weddingDate || !state.couple.venueName) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="text-base">⚠️</span>
            <span>Complete required sections before publishing:</span>
          </div>
          <ul className="text-xs list-disc list-inside space-y-1 text-amber-800">
            {(!state.couple.groomEn || !state.couple.brideEn) && (
              <li>
                Couple Names missing —{' '}
                <button type="button" onClick={() => onJumpToStep('couple')} className="font-bold underline hover:text-amber-950">
                  Fix in Couple Step →
                </button>
              </li>
            )}
            {!state.couple.weddingDate && (
              <li>
                {isEngagement ? 'Engagement Date not selected — ' : 'Wedding Date not selected — '}
                <button type="button" onClick={() => onJumpToStep('couple')} className="font-bold underline hover:text-amber-950">
                  Select Date →
                </button>
              </li>
            )}
            {!state.couple.venueName && (
              <li>
                Venue Location missing —{' '}
                <button type="button" onClick={() => onJumpToStep('venue')} className="font-bold underline hover:text-amber-950">
                  Add Venue →
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onProceedToPublish}
          disabled={!state.couple.groomEn || !state.couple.brideEn || !state.couple.weddingDate || !state.couple.venueName}
          className="w-full py-4 px-6 rounded-full bg-[#6E1020] hover:bg-[#430914] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFDF8] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md border border-[#C49A35] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <Globe className="w-4 h-4 text-[#C49A35]" />
          <span>PROCEED TO PUBLISH &amp; SHARE</span>
        </button>

        <button
          type="button"
          onClick={onOpenFullscreenPreview}
          className="w-full py-3 px-6 rounded-full bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#6E1020] font-semibold text-xs uppercase tracking-wider border border-[#E8D5AD] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#C49A35]" />
          <span>Open Fullscreen Live Preview</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewSummaryStep;
