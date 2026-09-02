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
    <div className="bg-gradient-to-r from-[#6B1420] via-[#851C2C] to-[#6B1420] text-[#F7F0DD] px-4 sm:px-6 py-2.5 border-b-2 border-[#A67C3D] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shrink-0 z-20">
      <div className="flex flex-col text-left space-y-0.5 w-full sm:w-auto">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h4
            className="font-fraunces font-black text-sm sm:text-base tracking-wide uppercase text-[#D4AF37] drop-shadow-sm"
            style={{ color: '#D4AF37' }}
          >
            {templateName ? templateName.toUpperCase() : 'ROYAL INVITATION'}
          </h4>
          {reason === 'published' && (
            <span className="text-[9.5px] font-mono bg-[#3D6B4A] text-white px-2 py-0.5 rounded font-bold shadow-xs">
              ✓ LIVE
            </span>
          )}
          <span className="text-[9.5px] font-mono bg-[#F7F0DD] text-[#6B1420] border border-[#A67C3D] px-2.5 py-0.5 rounded font-bold uppercase shadow-xs flex items-center gap-1">
            <span>🔒</span>
            <span>EDITING LOCKED</span>
          </span>
        </div>
        <p className="text-[11px] sm:text-xs font-hanken text-[#FFF8E8] font-medium">
          {reason === 'published'
            ? 'Your royal kankotri is live. Editing is currently locked to safeguard your invitation.'
            : 'Pay to unlock this royal invitation and customize couple details, events, photos & music.'}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        {reason === 'published' && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FAF6EE]/20 hover:bg-[#FAF6EE]/30 text-[#FAF6EE] font-fraunces font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#FAF6EE]/40 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live Invitation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        <button
          type="button"
          onClick={onOpenPaymentModal}
          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#FAF6EE] text-[#6B1420] hover:bg-white font-fraunces font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer border border-[#A67C3D]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C4522A]" />
          <span>
            {reason === 'published'
              ? 'Unlock & Edit'
              : `Pay ₹${pkgPrice.toLocaleString('en-IN')} & Unlock Editing →`}
          </span>
        </button>
      </div>
    </div>
  );
};

export default LockedEditorBanner;

