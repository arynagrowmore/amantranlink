import React from 'react';
import { 
  Monitor, Smartphone, Tablet, RotateCw, ZoomIn, ZoomOut, 
  Share2, Home, Users, CheckCircle2, Clock, Cloud, CloudOff, ArrowLeft,
  Camera, ShieldCheck, Check
} from 'lucide-react';
import { WeddingProjectState, ViewMode, Language } from '../types/wedding';
import { RoyalCrestIcon } from './ShahiIcons';
import { useAuth } from '../context/AuthContext';
import { UserAccountDropdown } from './UserAccountDropdown';

export type SaveStatus = 'saving' | 'saved' | 'idle' | 'error';

interface NavbarProps {
  state: WeddingProjectState;
  saveStatus?: SaveStatus;
  onViewChange: (mode: ViewMode) => void;
  onLanguageChange: (lang: Language) => void;
  onZoomChange: (zoom: number) => void;
  onRefreshPreview: () => void;
  onOpenPublish?: () => void;
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateProfile?: (tab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps') => void;
  onOpenPartnerModal?: () => void;
  onNavigatePartnerHub?: (tab?: 'dashboard' | 'invitations' | 'clients' | 'analytics' | 'marketing' | 'commissions' | 'profile' | 'branding' | 'team' | 'settings') => void;
  onNavigateAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  saveStatus = 'saved',
  onViewChange,
  onLanguageChange,
  onZoomChange,
  onRefreshPreview,
  onOpenPublish,
  onNavigateHome,
  onNavigateLogin,
  onNavigateDashboard,
  onNavigateProfile,
  onOpenPartnerModal,
  onNavigatePartnerHub,
  onNavigateAdmin,
}) => {
  const { user, requireAuth } = useAuth();
  const isPartner = user?.role === 'partner' || user?.role === 'photographer' || user?.role === 'studio_partner';

  return (
    <header className="h-14 bg-[#FFFDF8] border-b border-[#E8D5AD]/60 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 font-manrope selection:bg-[#C49A35]/20">
      
      {/* LEFT: Royal Brand Identity & Home Back */}
      <div className="flex items-center gap-3 select-none">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-transparent hover:border-[#E8D5AD] text-[#430914] flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#75675C] hover:text-[#430914]" />
          </button>
        )}

        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
          title="AmantranLink · Royal Digital Invitations"
        >
          <img 
            src="/amantranlink.png" 
            alt="AmantranLink Logo" 
            className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90 shrink-0" 
          />
          <div className="hidden sm:flex flex-col justify-center shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-cormorant font-bold text-lg sm:text-xl tracking-wider text-[#350811] block whitespace-nowrap leading-none">
                AMANTRAN<span className="text-[#C49A35]">LINK</span>
              </span>
              {isPartner && (
                <span className="text-[8.5px] font-mono font-medium bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/30 px-1 py-0.2 rounded uppercase">
                  Studio
                </span>
              )}
            </div>
            <span className="text-[8.5px] font-mono font-medium text-[#8C7A73] uppercase tracking-widest block whitespace-nowrap leading-none mt-1">
              {isPartner ? 'STUDIO ATELIER' : 'ROYAL DIGITAL INVITATIONS'}
            </span>
          </div>
        </div>

        {/* Quiet Studio Save Status */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#75675C] font-manrope pl-4 border-l border-[#E8D5AD]/60 ml-2">
          {saveStatus === 'saving' && (
            <span className="text-[#A67C3D] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35] animate-pulse" />
              <span>Saving changes…</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[#55695C] flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5 text-[#167A5A]" />
              <span>Saved just now</span>
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-[#8C7A73] flex items-center gap-1">
              <span>All changes saved</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[#8C4A4A] flex items-center gap-1 font-medium">
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Restrained Atelier Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Studio Partner Hub Shortcut */}
        {isPartner && onNavigatePartnerHub && (
          <button
            type="button"
            onClick={() => onNavigatePartnerHub('dashboard')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-transparent hover:bg-[#F4F9F6] border border-[#167A5A]/30 text-[#167A5A] text-xs font-semibold font-manrope transition-colors cursor-pointer"
            title="Return to Studio Partner Workspace"
          >
            <Camera className="w-3 h-3 text-[#167A5A]" />
            <span>Studio Hub</span>
          </button>
        )}

        {/* Guest & RSVP Shortcut */}
        {onNavigateDashboard && !isPartner && (
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-[#E8D5AD]/80 text-[#430914] text-xs font-medium transition-colors cursor-pointer"
            title="Open Wedding Guest Management & RSVP Dashboard"
          >
            <Users className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Guests &amp; RSVP</span>
          </button>
        )}

        {/* Trilingual Language Selector */}
        <div className="flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              state.language === 'en'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              state.language === 'hi'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="हिन्दी"
          >
            HI
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('gu')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              state.language === 'gu'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="ગુજરાતી"
          >
            GU
          </button>
        </div>

        {/* Device Switcher (Desktop, Tablet, Mobile) */}
        <div className="hidden lg:flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60">
          <button
            type="button"
            onClick={() => onViewChange('desktop')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              state.viewMode === 'desktop'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Desktop Browser View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('tablet')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              state.viewMode === 'tablet'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('mobile')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              state.viewMode === 'mobile'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Smartphone View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, (state.previewZoom || 1) - 0.1))}
            className="p-1 rounded text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono font-medium text-[#430914] px-1 min-w-[32px] text-center">
            {Math.round((state.previewZoom || 1) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, (state.previewZoom || 1) + 0.1))}
            className="p-1 rounded text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Canvas Refresh */}
        <button
          type="button"
          onClick={onRefreshPreview}
          className="p-1.5 rounded-lg bg-transparent hover:bg-[#F8F3E8] text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
          title="Refresh Preview"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* User Profile / Account Dropdown */}
        {user ? (
          <UserAccountDropdown
            onNavigateProfile={(tab) => {
              if (onNavigateProfile) onNavigateProfile(tab);
            }}
            onOpenPartnerModal={onOpenPartnerModal}
            onNavigatePartnerHub={onNavigatePartnerHub}
            onNavigateAdmin={onNavigateAdmin}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onNavigateLogin) {
                onNavigateLogin();
              } else {
                requireAuth('Sign in to save and unlock your Kankotri');
              }
            }}
            className="px-3 py-1 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-[#E8D5AD] text-[#430914] text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Log In</span>
          </button>
        )}

        {/* Primary CTA: Publish & Share */}
        {onOpenPublish && (
          <button
            type="button"
            onClick={onOpenPublish}
            className="px-3.5 py-1.5 rounded-lg bg-[#6E1020] hover:bg-[#520B17] text-[#FFFDF8] text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            title="Generate Shareable Kankotri Link"
          >
            <Share2 className="w-3 h-3 text-[#C49A35] shrink-0" />
            <span>Publish &amp; Share</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;

