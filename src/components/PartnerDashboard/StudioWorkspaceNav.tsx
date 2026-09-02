import React from 'react';
import { 
  LayoutDashboard, FileText, Users, Wallet, BarChart3, 
  Share2, Building2, Palette, SlidersHorizontal, Globe, Receipt, Zap 
} from 'lucide-react';
import { StudioWorkspaceTab } from './PartnerDashboard';

interface StudioWorkspaceNavProps {
  activeTab: StudioWorkspaceTab;
  onSelectTab: (tab: StudioWorkspaceTab) => void;
  invitationsCount: number;
  availableCredit: number;
}

export const StudioWorkspaceNav: React.FC<StudioWorkspaceNavProps> = ({
  activeTab,
  onSelectTab,
  invitationsCount,
  availableCredit,
}) => {
  const navItems: Array<{
    id: StudioWorkspaceTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeType?: 'default' | 'emerald' | 'gold';
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'invitations',
      label: 'Invitations',
      icon: FileText,
      badge: invitationsCount > 0 ? invitationsCount : undefined,
      badgeType: 'default',
    },
    {
      id: 'finance',
      label: 'Finance & Billing',
      icon: Receipt,
    },
    {
      id: 'automation',
      label: 'Automations',
      icon: Zap,
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
    },
    {
      id: 'commissions',
      label: 'Earnings',
      icon: Wallet,
      badge: availableCredit > 0 ? `₹${availableCredit}` : undefined,
      badgeType: 'gold',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'marketing',
      label: 'Marketing Kit',
      icon: Share2,
      badge: '4 Assets',
      badgeType: 'emerald',
    },
    {
      id: 'profile',
      label: 'Studio Profile',
      icon: Building2,
    },
    {
      id: 'branding',
      label: 'Branding',
      icon: Palette,
    },
    {
      id: 'domains',
      label: 'Custom Domains',
      icon: Globe,
    },
    {
      id: 'settings',
      label: 'Referral Settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="h-[54px] bg-[#16263A] border-b border-stone-800/90 px-4 sm:px-8 flex items-center justify-between shrink-0 select-none overflow-x-auto scrollbar-none z-10">
      <div className="flex items-center gap-1 sm:gap-2 h-full min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative h-full flex items-center gap-2 px-3 sm:px-4 text-xs transition-all cursor-pointer ${
                isActive
                  ? 'text-white font-semibold bg-white/5'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-stone-400'
              }`} />
              <span>{item.label}</span>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  item.badgeType === 'emerald'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : item.badgeType === 'gold'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                    : 'bg-stone-800 text-stone-300'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active Underline Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-400 rounded-t-full shadow-[0_-2px_8px_rgba(52,211,153,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
