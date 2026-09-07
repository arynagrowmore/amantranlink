import React from 'react';
import { Lock, Sparkles, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { ThemeId, WeddingProjectState } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP } from '../config/pricing';
import { themes } from './ThemeSelector';
import { TEMPLATES_CATALOG, isUserVipAdmin } from '../services/razorpayClient';

export const TEMPLATE_DISPLAY_NAMES: Record<ThemeId, string> = {
  jharokha: 'The Jharokha',
  rajmahal: 'The Rajmahal',
  royaldawn: 'The Royal Dawn',
  royalring: 'The Royal Ring',
  mayura: 'The Mayura',
  jodi: 'The Jodi',
  dak: 'The Shahi Dāk',
  ivory: 'The Ivory Minimalist',
};

export const getTemplateDisplayName = (themeId?: ThemeId): string => {
  if (!themeId) return '';
  if (TEMPLATE_DISPLAY_NAMES[themeId]) return TEMPLATE_DISPLAY_NAMES[themeId];
  const themeObj = themes.find((t) => t.id === themeId);
  if (themeObj?.name) return themeObj.name;
  const catalogObj = TEMPLATES_CATALOG[themeId];
  if (catalogObj?.name) return catalogObj.name;
  return '';
};

interface LockedEditorBannerProps {
  templateId: ThemeId;
  reason: 'not_purchased' | 'published' | 'not_logged_in' | 'none';
  state: WeddingProjectState;
  slug?: string;
  onOpenPaymentModal: () => void;
}

export const LockedEditorBanner: React.FC<LockedEditorBannerProps> = ({
  templateId,
  reason,
  state,
  slug,
  onOpenPaymentModal,
}) => {
  const { user } = useAuth();
  if (reason === 'none') return null;
  if (isUserVipAdmin(user?.uid, user?.email)) return null;

  const effectiveTemplateId = templateId || state?.theme;
  const templateName = getTemplateDisplayName(effectiveTemplateId);
  const coupleSlug = slug || `${(state.couple.groomEn || 'dhruv').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'shreya').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const publicUrl = `/i/${coupleSlug}`;
  const themePkg = THEME_PACKAGE_MAP[effectiveTemplateId] || 'gold';
  const pkgPrice = OFFICIAL_PACKAGES[themePkg]?.priceInr || 2299;

  return (
    <div className="bg-[#350811] text-[#FFFDF8] px-4 sm:px-8 py-3.5 border-b border-[#C49A35]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn shrink-0 z-20 font-manrope shadow-md relative overflow-hidden">
      {/* Subtle Palace Silhouette / Architectural Background */}
      <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none select-none text-7xl font-serif text-[#C49A35]">
        🏰
      </div>

      {/* Left Column: Collection Title, Status & Invitation Subtitle */}
      <div className="flex flex-col text-left space-y-1 z-10 max-w-xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h4 className="font-cormorant font-bold text-lg sm:text-xl tracking-wider uppercase text-[#F4D06F]">
            {templateName ? templateName.toUpperCase() : 'THE RAJMAHAL'} · ROYAL COLLECTION
          </h4>
          <span className="text-[9px] font-mono uppercase bg-[#1A0409] text-[#E8D5AD] border border-[#C49A35]/40 px-2 py-0.5 rounded tracking-widest font-semibold flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-[#C49A35]" />
            <span>EDITING LOCKED</span>
          </span>
          {reason === 'published' && (
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
              ✓ LIVE
            </span>
          )}
        </div>

        <p className="text-xs sm:text-[13px] text-[#F7F0DD]/90 font-manrope leading-relaxed">
          Unlock the full royal studio to customize names, auspicious timings, music, photos &amp; RSVP passes.
        </p>
      </div>

      {/* Right Column: Editorial Quote & High-End Unlock Button */}
      <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end z-10">
        <div className="hidden lg:flex flex-col text-right">
          <span className="font-cormorant italic text-xs sm:text-sm text-[#F4D06F]/90 leading-tight">
            “More than an invitation, a feeling of home.”
          </span>
          <span className="text-[9px] font-mono text-[#E8D5AD]/60 uppercase tracking-widest mt-0.5">
            AmantranLink Royal Collection
          </span>
        </div>

        <div className="flex items-center gap-2">
          {reason === 'published' && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Public</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="px-4 py-2 rounded-lg bg-[#C49A35] hover:bg-[#D4AC4B] active:scale-[0.98] text-[#350811] text-xs font-bold font-manrope tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
          >
            <span>Pay ₹{pkgPrice.toLocaleString('en-IN')} &amp; Unlock Editing</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#350811]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedEditorBanner;

