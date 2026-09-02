import React, { useState, useRef, useEffect } from 'react';
import { 
  User, ShoppingBag, CreditCard, Heart, LogOut, ChevronDown, 
  Sparkles, ShieldCheck, Camera, Award, Users, BarChart3, Share2, Building2, Crown,
  LayoutDashboard, FileText, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserAccountDropdownProps {
  onNavigateProfile: (initialTab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => void;
  onOpenPartnerModal?: () => void;
  onNavigatePartnerHub?: (targetTab?: 'dashboard' | 'invitations' | 'clients' | 'analytics' | 'marketing' | 'commissions' | 'profile' | 'branding' | 'team' | 'settings') => void;
  onNavigateAdmin?: () => void;
  className?: string;
}

export const UserAccountDropdown: React.FC<UserAccountDropdownProps> = ({
  onNavigateProfile,
  onOpenPartnerModal,
  onNavigatePartnerHub,
  onNavigateAdmin,
  className = '',
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [imgError, setImgError] = useState<boolean>(false);

  // Reset imgError when avatar_url changes
  useEffect(() => {
    setImgError(false);
  }, [user?.avatar_url]);

  // Close dropdown on outside click and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!user) return null;

  const isPartner = user.role === 'partner' || user.role === 'photographer' || user.role === 'studio_partner';

  const initials = (user.studioName || user.name)
    ? (user.studioName || user.name)
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AP';

  const showAvatarImg = user.avatar_url && !imgError;

  const handleAction = (tab: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => {
    setIsOpen(false);
    onNavigateProfile(tab);
  };

  const handlePartnerAction = (tab: 'dashboard' | 'invitations' | 'clients' | 'analytics' | 'marketing' | 'commissions' | 'profile' | 'branding' | 'team' | 'settings') => {
    setIsOpen(false);
    if (onNavigatePartnerHub) {
      onNavigatePartnerHub(tab);
    }
  };

  return (
    <div className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      {/* Account Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User Account Menu"
        className={`flex items-center gap-2 p-1.5 pr-2.5 sm:pr-3 rounded-full text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer h-10 shrink-0 select-none ${
          isPartner
            ? 'bg-[#F4F9F6] hover:bg-[#EBF5F0] border border-[#167A5A]/30 text-stone-900'
            : 'bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] text-[#430914]'
        }`}
      >
        {showAvatarImg ? (
          <img
            src={user.avatar_url}
            alt={user.studioName || user.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-7 h-7 rounded-full object-cover shadow-2xs shrink-0 border ${
              isPartner ? 'border-[#167A5A]/60' : 'border-[#C49A35]'
            }`}
          />
        ) : (
          <div className={`w-7 h-7 rounded-full text-[#FFFDF8] flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0 border ${
            isPartner ? 'bg-[#0F766E] border-[#167A5A]/60' : 'bg-[#6E1020] border-[#C49A35]'
          }`}>
            {initials}
          </div>
        )}
        
        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="font-manrope font-semibold text-xs text-stone-900 max-w-[120px] truncate leading-tight">
            {user.studioName || user.name}
          </span>
          {isPartner && (
            <span className="text-[8.5px] font-mono font-bold text-[#167A5A] uppercase tracking-wider mt-0.5">
              STUDIO PARTNER
            </span>
          )}
        </div>

        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
          isPartner ? 'text-[#167A5A]/80' : 'text-[#C49A35]'
        } ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Royal Luxury / Studio Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-68 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_15px_40px_-10px_rgba(67,9,20,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-manrope">
          {/* Header Info */}
          <div className={`p-3.5 border-b ${
            isPartner 
              ? 'bg-gradient-to-br from-[#F4F9F6] to-[#FFFDF8] border-[#167A5A]/30' 
              : 'bg-gradient-to-br from-[#F8F3E8] to-[#FFFDF8] border-[#E8D5AD]'
          }`}>
            <div className="flex items-center gap-2.5">
              {showAvatarImg ? (
                <img
                  src={user.avatar_url}
                  alt={user.studioName || user.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`w-9 h-9 rounded-full object-cover shadow-xs border ${
                    isPartner ? 'border-[#167A5A]' : 'border-[#C49A35]'
                  }`}
                />
              ) : (
                <div className={`w-9 h-9 rounded-full text-[#FFFDF8] flex items-center justify-center text-xs font-bold shadow-xs border ${
                  isPartner ? 'bg-[#0F766E] border-[#167A5A]' : 'bg-[#6E1020] border-[#C49A35]'
                }`}>
                  {initials}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="font-cormorant font-bold text-base text-stone-900 truncate leading-tight">
                  {user.studioName || user.name}
                </h4>
                <p className="text-[10px] font-mono text-stone-500 truncate">
                  {user.partnerSlug ? `@${user.partnerSlug}` : user.email}
                </p>
              </div>
            </div>
            
            <div className={`mt-2 flex items-center gap-1 text-[9.5px] font-manrope px-2.5 py-0.5 rounded-md font-semibold ${
              isPartner 
                ? 'text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30' 
                : 'text-[#C49A35] bg-[#C49A35]/10 border border-[#C49A35]/30'
            }`}>
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>{isPartner ? 'Verified Studio Partner · Wholesale ₹899' : 'Verified Customer Account'}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5 text-xs">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigateAdmin) onNavigateAdmin();
                  else if (typeof window !== 'undefined') window.location.hash = '#admin';
                }}
                className="w-full mb-1.5 px-3 py-2 rounded-xl text-left bg-gradient-to-r from-red-950 to-[#2D080E] border border-red-500/40 text-white flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs min-h-[44px]"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <div className="flex-1">
                  <span className="font-bold block text-xs text-amber-300 flex items-center justify-between">
                    <span>Admin Control Center</span>
                    <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                      ADMIN
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-300 block truncate">
                    Platform CMS &amp; Governance
                  </span>
                </div>
              </button>
            )}

            {isPartner ? (
              // 📸 PHOTOGRAPHER PARTNER WORKSPACE MENU
              <>
                <button
                  type="button"
                  onClick={() => handlePartnerAction('dashboard')}
                  className="w-full px-3 py-2 rounded-xl text-left bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#167A5A]" />
                  <div className="flex-1">
                    <span className="font-bold block text-xs text-[#167A5A] flex items-center justify-between">
                      <span>Studio Dashboard</span>
                      <span className="text-[8px] bg-[#167A5A] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        HUB
                      </span>
                    </span>
                    <span className="text-[10px] text-emerald-800/80 block truncate">
                      Studio Overview &amp; Workspace
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerAction('invitations')}
                  className="w-full px-3 py-2 rounded-xl text-left text-stone-800 hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <FileText className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Client Invitations</span>
                    <span className="text-[10px] text-stone-500 block">Manage client portals</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerAction('clients')}
                  className="w-full px-3 py-2 rounded-xl text-left text-stone-800 hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Users className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Clients CRM</span>
                    <span className="text-[10px] text-stone-500 block">Workflow &amp; review tracking</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerAction('commissions')}
                  className="w-full px-3 py-2 rounded-xl text-left text-stone-800 hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Wallet className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Earnings &amp; Payouts</span>
                    <span className="text-[10px] text-stone-500 block">UPI wallet &amp; settlements</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerAction('marketing')}
                  className="w-full px-3 py-2 rounded-xl text-left text-stone-800 hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Share2 className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Marketing Kit</span>
                    <span className="text-[10px] text-stone-500 block">Social assets &amp; studio QR</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerAction('profile')}
                  className="w-full px-3 py-2 rounded-xl text-left text-stone-800 hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Building2 className="w-4 h-4 text-[#167A5A]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Studio Profile &amp; Settings</span>
                    <span className="text-[10px] text-stone-500 block">{user.studioName || `@${user.partnerSlug || 'studio'}`}</span>
                  </div>
                </button>
              </>
            ) : (
              // 👑 NORMAL END CUSTOMER MENU
              <>
                <button
                  type="button"
                  onClick={() => handleAction('profile')}
                  className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <User className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">My Profile</span>
                    <span className="text-[10px] text-[#75675C] block">Manage account details</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('purchases')}
                  className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">My Purchases</span>
                    <span className="text-[10px] text-[#75675C] block">Unlocked royal themes</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('transactions')}
                  className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <CreditCard className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">Transaction History</span>
                    <span className="text-[10px] text-[#75675C] block">Orders &amp; payment receipts</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('weddings')}
                  className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Heart className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">My Wedding Invitations</span>
                    <span className="text-[10px] text-[#75675C] block">Drafts &amp; published Kankotris</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('rsvps')}
                  className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-[#C49A35]" />
                  <div className="flex-1">
                    <span className="font-semibold block">My Kankotri RSVPs</span>
                    <span className="text-[10px] text-[#75675C] block">Guest responses &amp; headcount</span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Logout Action */}
          <div className="p-1.5 border-t border-[#E8D5AD] bg-[#F8F3E8]/50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold text-xs"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountDropdown;
