import React, { useState, useRef, useEffect } from 'react';
import { User, ShoppingBag, CreditCard, Heart, LogOut, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserAccountDropdownProps {
  onNavigateProfile: (initialTab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => void;
  className?: string;
}

export const UserAccountDropdown: React.FC<UserAccountDropdownProps> = ({
  onNavigateProfile,
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const handleAction = (tab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => {
    setIsOpen(false);
    onNavigateProfile(tab);
  };

  const showAvatarImg = Boolean(user.avatar_url && !imgError);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button - Refined Compact Luxury Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer group"
        title="Open My Account Menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar / Initials */}
        {showAvatarImg ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-6 h-6 rounded-full object-cover border border-[#C49A35]"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-[10px] font-manrope font-bold border border-[#C49A35]">
            {initials}
          </div>
        )}

        <div className="text-left hidden sm:block max-w-[120px]">
          <span className="block text-xs font-manrope font-semibold text-[#430914] truncate leading-tight">
            {user.name || 'Member'}
          </span>
          <span className="block text-[9px] font-manrope uppercase tracking-widest text-[#C49A35] font-bold leading-none">
            Member
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#C49A35] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#430914]' : ''
          }`}
        />
      </button>

      {/* Royal Luxury Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-[0_15px_40px_-10px_rgba(67,9,20,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-manrope">
          {/* Header Info */}
          <div className="p-3.5 bg-gradient-to-br from-[#F8F3E8] to-[#FFFDF8] border-b border-[#E8D5AD]">
            <div className="flex items-center gap-2.5">
              {showAvatarImg ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-full object-cover border border-[#C49A35] shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs font-bold border border-[#C49A35] shadow-xs">
                  {initials}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="font-cormorant font-bold text-base text-[#430914] truncate leading-tight">
                  {user.name}
                </h4>
                <p className="text-[10px] font-manrope text-[#75675C] truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-manrope text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/20 px-2 py-0.5 rounded-md font-semibold">
              <ShieldCheck className="w-3 h-3 text-[#167A5A]" />
              <span>Verified Couple Account</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleAction('profile')}
              className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer"
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
              className="w-full px-3 py-2 rounded-xl text-left text-[#241A17] hover:bg-[#F8F3E8] hover:text-[#6E1020] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C49A35]" />
              <div className="flex-1">
                <span className="font-semibold block">My Kankotri RSVPs</span>
                <span className="text-[10px] text-[#75675C] block">Guest responses &amp; headcount</span>
              </div>
            </button>
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
              <span>Sign Out / Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountDropdown;
