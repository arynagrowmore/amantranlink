import React from 'react';
import { MapPin, ExternalLink, ArrowRight, Check, Compass, Navigation } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';

interface VenueManagerProps {
  couple: WeddingProjectState['couple'];
  onChange: (updated: Partial<WeddingProjectState['couple']>) => void;
  onSaveAndNext: () => void;
  theme?: WeddingProjectState['theme'];
  invitationType?: WeddingProjectState['invitation_type'];
}

export const VenueManager: React.FC<VenueManagerProps> = ({
  couple,
  onChange,
  onSaveAndNext,
  theme,
  invitationType,
}) => {
  const isEngagement = invitationType === 'engagement';

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>{isEngagement ? 'STEP 04 · VENUE & LOCATION' : 'STEP 04 · VENUE & NAVIGATION'}</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          {isEngagement ? 'Engagement Venue & Google Maps' : 'Wedding Venue & Google Maps'}
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          {isEngagement 
            ? 'Provide your guests with exact celebration venue details and one-tap GPS navigation.'
            : 'Provide your guests with exact venue details and one-tap GPS navigation.'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* Venue Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#430914]">
            {isEngagement ? 'Main Celebration / Venue Name' : 'Main Palace / Venue Name'} <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={couple.venueName || ''}
            onChange={(e) => onChange({ venueName: e.target.value })}
            placeholder={isEngagement ? 'e.g. The Grand Palace, Udaipur' : 'e.g. The Milestone Palace & Resort'}
            className="w-full px-4 py-3 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] focus:border-[#C49A35] text-[#241A17] text-xs font-medium focus:ring-1 focus:ring-[#C49A35] outline-none shadow-xs transition-all"
          />
        </div>

        {/* Detailed Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#430914]">
            Full Street Address / Location <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            value={couple.venueAddress || ''}
            onChange={(e) => onChange({ venueAddress: e.target.value })}
            placeholder={isEngagement ? 'e.g. Near Lake Pichola, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001' : 'e.g. Near Malpur Road, Bypass Highway, Modasa, Gujarat 383315'}
            className="w-full px-4 py-3 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] focus:border-[#C49A35] text-[#241A17] text-xs font-medium focus:ring-1 focus:ring-[#C49A35] outline-none shadow-xs transition-all resize-none"
          />
        </div>

        {/* Google Maps URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#430914]">
              Google Maps Location Link
            </label>
            {couple.mapUrl && (
              <a
                href={couple.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[#6E1020] hover:text-[#C49A35] inline-flex items-center gap-1 transition-colors"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="relative">
            <input
              type="url"
              value={couple.mapUrl || ''}
              onChange={(e) => onChange({ mapUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-4 py-3 pl-9 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] focus:border-[#C49A35] text-[#241A17] text-xs font-medium focus:ring-1 focus:ring-[#C49A35] outline-none shadow-xs transition-all font-mono"
            />
            <Navigation className="w-4 h-4 text-[#C49A35] absolute left-3 top-3.5" />
          </div>
          <p className="text-[11px] text-[#75675C]">
            Guests can tap this button in your live invitation to open directions directly in Google Maps.
          </p>
        </div>

      </div>

      {/* Live Preview of Venue Card */}
      <div className="p-4 rounded-2xl bg-[#F8F3E8] border border-[#E8D5AD] space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C49A35] block">
          Live Guest View Preview
        </span>
        <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD]/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-cormorant font-bold text-base text-[#430914] truncate">
              {couple.venueName || 'Your Venue Name'}
            </h4>
            <p className="text-[11px] text-[#75675C] line-clamp-2">
              {couple.venueAddress || 'Your full venue address will appear here'}
            </p>
          </div>
          {couple.mapUrl && (
            <a
              href={couple.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#6E1020] text-[#FFFDF8] text-[10px] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1"
            >
              <span>GPS</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Save & Next CTA */}
      <div className="pt-4 border-t border-[#E8D5AD]/60 flex justify-end">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-semibold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <span>Save &amp; Continue to Photos</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default VenueManager;
