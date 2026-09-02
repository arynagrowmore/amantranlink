import React from 'react';
import { 
  Building2, Palette, SlidersHorizontal, Settings, Globe, LogOut, 
  ShieldCheck, LayoutDashboard, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudioWorkspaceTab } from './PartnerDashboard';

interface StudioAccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: StudioWorkspaceTab) => void;
  onViewPublicSite: () => void;
  partnerSlug: string;
}

export const StudioAccountMenu: React.FC<StudioAccountMenuProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onViewPublicSite,
  partnerSlug,
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const studioName = user?.studioName || user?.name || 'Studio Partner';
  const ownerName = user?.name || 'Partner Account';
  const initials = studioName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AP';

  return (
    <div className="absolute right-0 mt-3 w-76 bg-[#101C2B] text-stone-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-stone-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-manrope">
      {/* Studio Identity Card Header */}
      <div className="p-4 border-b border-stone-800/80 bg-stone-900/80 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={studioName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#16263A] text-white flex items-center justify-center font-bold text-sm border border-emerald-500/40 shadow-md shrink-0">
              {initials}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate leading-tight">
              {studioName}
            </h4>
            <p className="text-[11px] font-mono text-stone-400 truncate mt-0.5">
              @{partnerSlug}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Partner Active</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>Verified Studio Partner · ₹899 Wholesale</span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="p-2 space-y-0.5 text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectTab('dashboard');
          }}
          className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-stone-800/80 text-stone-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
          <span>Studio Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectTab('profile');
          }}
          className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-stone-800/80 text-stone-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-stone-400" />
          <span>Studio Profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectTab('branding');
          }}
          className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-stone-800/80 text-stone-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
        >
          <Palette className="w-4 h-4 text-stone-400" />
          <span>Branding &amp; Co-Badge</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectTab('settings');
          }}
          className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-stone-800/80 text-stone-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-stone-400" />
          <span>Referral &amp; Payout Settings</span>
        </button>
      </div>

      {/* Footer Exit Options */}
      <div className="p-2 border-t border-stone-800/80 space-y-0.5 text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            onViewPublicSite();
          }}
          className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-800/80 text-stone-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-stone-400" />
          <span>View AmantranLink Website</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            onClose();
            if (logout) await logout();
            onViewPublicSite();
          }}
          className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 flex items-center gap-3 transition-colors cursor-pointer font-semibold"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
