import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Share2, Bell, Check, ChevronDown, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InAppNotification } from '../../services/partnerService';
import { StudioAccountMenu } from './StudioAccountMenu';
import { StudioWorkspaceTab } from './PartnerDashboard';

interface StudioMainHeaderProps {
  partnerSlug: string;
  onCopyReferral: () => void;
  copiedReferral: boolean;
  notifications: InAppNotification[];
  onCreateInvitation: () => void;
  onSelectTab: (tab: StudioWorkspaceTab) => void;
  onViewPublicSite: () => void;
  onOpenMobileMenu?: () => void;
  activeTab?: StudioWorkspaceTab;
}

export const StudioMainHeader: React.FC<StudioMainHeaderProps> = ({
  partnerSlug,
  onCopyReferral,
  copiedReferral,
  notifications,
  onCreateInvitation,
  onSelectTab,
  onViewPublicSite,
  onOpenMobileMenu,
  activeTab = 'dashboard',
}) => {
  const { user } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.readAt);

  const studioName = user?.studioName || user?.name || 'AmantranLink Studio';
  const studioInitials = studioName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AP';

  const tabTitles: Record<StudioWorkspaceTab, string> = {
    dashboard: 'Dashboard',
    invitations: 'My Invitations',
    finance: 'Finance & Billing',
    automation: 'Workflow Automations',
    clients: 'Clients CRM',
    commissions: 'Earnings & Payouts',
    analytics: 'Studio Analytics',
    marketing: 'Marketing Kit',
    profile: 'Studio Profile',
    branding: 'Studio Branding',
    domains: 'Custom Domains',
    team: 'Team Members',
    settings: 'Referral Settings',
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#101C2B] border-b border-stone-800 px-4 sm:px-8 flex items-center justify-between shrink-0 z-30 select-none">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* LEFT: BREADCRUMB & CURRENT WORKSPACE VIEW TITLE                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Mobile Drawer Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Clean Contextual Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium hidden sm:inline">Workspace</span>
          <span className="text-stone-600 hidden sm:inline">/</span>
          <span className="text-white font-semibold text-sm">
            {tabTitles[activeTab] || 'Dashboard'}
          </span>
        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* RIGHT: CLEAN UTILITY ACTIONS + DOMINANT PRIMARY CTA                */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* 1. Share Referral Link */}
        <button
          type="button"
          onClick={onCopyReferral}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          title="Copy referral link to clipboard"
        >
          {copiedReferral ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-stone-400" />
          )}
          <span>{copiedReferral ? 'Copied' : 'Share Link'}</span>
        </button>

        {/* 2. Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-white transition-colors cursor-pointer relative"
            aria-label="Activity Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#101C2B] text-stone-200 rounded-2xl shadow-2xl border border-stone-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-manrope">
              <div className="px-4 py-2 border-b border-stone-800 flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-stone-400">{notifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-stone-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs">No activity notifications yet</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className={`p-3 hover:bg-stone-800/50 transition-colors ${!n.readAt ? 'bg-emerald-950/20' : ''}`}>
                      <div className="font-semibold text-white text-xs">{n.title}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Studio Account Dropdown */}
        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 transition-colors cursor-pointer"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={studioName}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {studioInitials}
              </div>
            )}

            <span className="hidden sm:inline font-semibold text-xs text-white max-w-[120px] truncate">
              {studioName}
            </span>

            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`} />
          </button>

          <StudioAccountMenu
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
            onSelectTab={onSelectTab}
            onViewPublicSite={onViewPublicSite}
            partnerSlug={partnerSlug}
          />
        </div>

        {/* 4. DOMINANT PRIMARY CTA: + CREATE CLIENT INVITATION */}
        <button
          type="button"
          onClick={onCreateInvitation}
          className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">+ Create Client Invitation</span>
          <span className="sm:hidden">+ Create</span>
        </button>

      </div>

    </header>
  );
};
