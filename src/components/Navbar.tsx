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
    <header className="h-14 bg-white border-b border-[#E8DCC8] px-2 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans shadow-[0_1px_4px_rgba(67,9,20,0.02)] max-w-full overflow-hidden">
      
      {/* LEFT: Royal Brand Identity & Home Back */}
      <div className="flex items-center gap-1.5 sm:gap-3 select-none shrink-0 min-w-0">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#FAF6EE] border border-transparent hover:border-[#E8DCC8] text-[#430914] flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#75675C] hover:text-[#430914]" aria-hidden="true" />
          </button>
        )}

        <button 
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 select-none bg-transparent border-0 p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] rounded-lg"
          title="AmantranLink · Royal Digital Invitations"
          aria-label="AmantranLink Royal Digital Invitations Home"
        >
          <img 
            src="/amantranlink.png" 
            alt="AmantranLink Logo" 
            width={36}
            height={36}
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
        </button>

        {/* Quiet Studio Save Status */}
        <div aria-live="polite" className="hidden md:flex items-center gap-1.5 text-[11px] text-[#75675C] font-manrope pl-4 border-l border-[#E8D5AD]/60 ml-2">
          {saveStatus === 'saving' && (
            <span className="text-[#A67C3D] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49A35] animate-pulse" aria-hidden="true" />
              <span>Saving changes…</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[#55695C] flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5 text-[#167A5A]" aria-hidden="true" />
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-transparent hover:bg-[#F4F9F6] border border-[#167A5A]/30 text-[#167A5A] text-xs font-semibold font-manrope transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167A5A]"
            title="Return to Studio Partner Workspace"
            aria-label="Return to Studio Partner Workspace"
          >
            <Camera className="w-3 h-3 text-[#167A5A]" aria-hidden="true" />
            <span>Studio Hub</span>
          </button>
        )}

        {/* Guest & RSVP Shortcut */}
        {onNavigateDashboard && !isPartner && (
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-[#E8D5AD]/80 text-[#430914] text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
            title="Open Wedding Guest Management & RSVP Dashboard"
            aria-label="Open Wedding Guest Management and RSVP Dashboard"
          >
            <Users className="w-3.5 h-3.5 text-[#C49A35]" aria-hidden="true" />
            <span>Guests &amp; RSVP</span>
          </button>
        )}

        {/* Trilingual Language Selector */}
        <div role="group" aria-label="Language selection" className="flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.language === 'en'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="English"
            aria-label="Select English language"
            aria-pressed={state.language === 'en'}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.language === 'hi'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="हिन्दी"
            aria-label="Select Hindi language"
            aria-pressed={state.language === 'hi'}
          >
            HI
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('gu')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.language === 'gu'
                ? 'bg-[#FFFDF8] text-[#430914] font-bold shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="ગુજરાતી"
            aria-label="Select Gujarati language"
            aria-pressed={state.language === 'gu'}
          >
            GU
          </button>
        </div>

        {/* Device Switcher (Desktop, Tablet, Mobile) */}
        <div role="group" aria-label="Device viewport switcher" className="hidden lg:flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60">
          <button
            type="button"
            onClick={() => onViewChange('desktop')}
            className={`p-1.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.viewMode === 'desktop'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Desktop Browser View"
            aria-label="Desktop browser view"
            aria-pressed={state.viewMode === 'desktop'}
          >
            <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('tablet')}
            className={`p-1.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.viewMode === 'tablet'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Tablet View"
            aria-label="Tablet view"
            aria-pressed={state.viewMode === 'tablet'}
          >
            <Tablet className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('mobile')}
            className={`p-1.5 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35] ${
              state.viewMode === 'mobile'
                ? 'bg-[#FFFDF8] text-[#430914] shadow-2xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Smartphone View"
            aria-label="Smartphone view"
            aria-pressed={state.viewMode === 'mobile'}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div role="group" aria-label="Canvas zoom controls" className="hidden xl:flex items-center bg-[#F8F3E8] p-0.5 rounded-lg border border-[#E8D5AD]/60">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, (state.previewZoom || 1) - 0.1))}
            className="p-1 rounded text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" aria-hidden="true" />
          </button>
          <span className="text-[10px] font-mono font-medium text-[#430914] px-1 min-w-[32px] text-center tabular-nums">
            {Math.round((state.previewZoom || 1) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, (state.previewZoom || 1) + 0.1))}
            className="p-1 rounded text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>

        {/* Canvas Refresh */}
        <button
          type="button"
          onClick={onRefreshPreview}
          className="p-1.5 rounded-lg bg-transparent hover:bg-[#F8F3E8] text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
          title="Refresh Preview"
          aria-label="Refresh live preview"
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
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
            className="px-3 py-1 rounded-lg bg-transparent hover:bg-[#F8F3E8] border border-[#E8D5AD] text-[#430914] text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
          >
            <span>Log In</span>
          </button>
        )}

        {/* Primary CTA: Publish & Share */}
        {onOpenPublish && (
          <button
            type="button"
            onClick={onOpenPublish}
            className="px-2.5 sm:px-4 py-1.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(110,16,32,0.22)] whitespace-nowrap shrink-0 border border-[#C49A35]/50 hover:border-[#C49A35] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
            title="Generate Shareable Kankotri Link"
            aria-label="Publish and Share your invitation"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C49A35] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Publish &amp; Share</span>
            <span className="sm:hidden">Publish</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;

