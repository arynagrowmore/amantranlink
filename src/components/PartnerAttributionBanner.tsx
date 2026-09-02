import React, { useEffect, useState } from 'react';
import { Camera, Sparkles, X, ShieldCheck } from 'lucide-react';
import { getStoredPartnerAttribution, resolvePartnerBySlug } from '../services/partnerService';
import { PartnerProfile } from '../types/wedding';

export const PartnerAttributionBanner: React.FC = () => {
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const slug = getStoredPartnerAttribution();
    if (slug) {
      resolvePartnerBySlug(slug).then((p) => {
        if (p) setPartner(p);
      });
    }
  }, []);

  if (!partner || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#24060B] via-[#430914] to-[#24060B] border-b border-[#C49A35]/50 px-4 py-2 text-[#FFFDF8] flex items-center justify-between text-xs font-manrope z-40 relative shadow-sm">
      <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center">
        <div className="inline-flex items-center gap-1 bg-[#C49A35]/20 border border-[#C49A35]/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#E8D5AD] uppercase tracking-wider">
          <Camera className="w-3 h-3 text-[#C49A35]" />
          <span>Partner Studio</span>
        </div>
        <span className="text-[11px] sm:text-xs font-medium text-[#FFFDF8]">
          Curated in official partnership with <strong className="text-[#C49A35] font-bold">{partner.studioName}</strong>. Exclusive Royal Masterpieces active.
        </span>
        <div className="hidden md:inline-flex items-center gap-1 text-[10px] text-[#167A5A] font-bold bg-[#167A5A]/20 px-2 py-0.5 rounded-md border border-[#167A5A]/30">
          <ShieldCheck className="w-3 h-3 text-[#167A5A]" />
          <span>VIP Royalty Verified</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[#E8D5AD]/60 hover:text-white transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default PartnerAttributionBanner;
