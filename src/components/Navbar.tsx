import React from 'react';
import { 
  Monitor, Smartphone, Tablet, RotateCw, ZoomIn, ZoomOut, 
  Share2, Home, Users, CheckCircle2, Clock, Cloud, CloudOff, ArrowLeft 
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
}) => {
  const { user, requireAuth } = useAuth();

  return (
    <header className="h-16 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#E8D5AD] px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-[0_4px_20px_-4px_rgba(67,9,20,0.04)] font-manrope">
      
      {/* LEFT: Royal Brand Identity & Home Back */}
      <div className="flex items-center gap-3 select-none">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-9 h-9 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] text-[#430914] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#C49A35]" />
          </button>
        )}

        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Shahi Studio Atelier"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6E1020] border border-[#C49A35] shadow-xs flex items-center justify-center text-[#C49A35] group-hover:scale-105 transition-transform">
            <RoyalCrestIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-cormorant font-bold text-lg sm:text-xl tracking-wider text-[#430914] leading-tight">
              Shahi Studio
            </h1>
            <span className="text-[9px] font-manrope uppercase tracking-widest text-[#C49A35] font-bold block leading-none">
              Kankotri Studio
            </span>
          </div>
        </div>

        {/* Real-time Save Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[11px] text-[#430914] ml-2">
          {saveStatus === 'saving' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-amber-800 font-semibold">Saving…</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-800 font-medium">Saved just now</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-[#75675C]">Changes saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-rose-700 font-semibold">Offline / Retry</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Controls, Devices, Zoom, Profile & Primary CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* RSVP Management Shortcut */}
        {onNavigateDashboard && (
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] text-[#430914] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open RSVP Dashboard"
          >
            <Users className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>RSVP Center</span>
          </button>
        )}

        {/* Trilingual Language Selector */}
        <div className="flex items-center gap-0.5 bg-[#F8F3E8] p-1 rounded-xl border border-[#E8D5AD] text-xs font-mono font-semibold shadow-xs">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              state.language === 'en'
                ? 'bg-[#6E1020] text-[#FFFDF8] font-bold shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              state.language === 'hi'
                ? 'bg-[#6E1020] text-[#FFFDF8] font-bold shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="हिन्दी"
          >
            HI
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('gu')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              state.language === 'gu'
                ? 'bg-[#6E1020] text-[#FFFDF8] font-bold shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="ગુજરાતી"
          >
            GU
          </button>
        </div>

        {/* Device Switcher (Desktop, Tablet, Mobile) */}
        <div className="hidden lg:flex items-center gap-0.5 bg-[#F8F3E8] p-1 rounded-xl border border-[#E8D5AD] shadow-xs">
          <button
            type="button"
            onClick={() => onViewChange('desktop')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              state.viewMode === 'desktop'
                ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Desktop Browser View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('tablet')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              state.viewMode === 'tablet'
                ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('mobile')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              state.viewMode === 'mobile'
                ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
            title="Smartphone View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center gap-1 bg-[#F8F3E8] p-1 rounded-xl border border-[#E8D5AD] shadow-xs">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, (state.previewZoom || 1) - 0.1))}
            className="p-1 rounded-lg text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-[#430914] px-1 min-w-[34px] text-center">
            {Math.round((state.previewZoom || 1) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, (state.previewZoom || 1) + 0.1))}
            className="p-1 rounded-lg text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas Refresh */}
        <button
          type="button"
          onClick={onRefreshPreview}
          className="p-2 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] text-[#75675C] hover:text-[#430914] shadow-xs transition-colors cursor-pointer"
          title="Reload Live Canvas"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* User Profile / Account Dropdown */}
        {user ? (
          <UserAccountDropdown
            onNavigateProfile={(tab) => {
              if (onNavigateProfile) onNavigateProfile(tab);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onNavigateLogin) {
                onNavigateLogin();
              } else {
                requireAuth('Log in to save and unlock your Kankotri');
              }
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] text-[#430914] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Log In</span>
          </button>
        )}

        {/* Primary CTA: Publish & Share */}
        {onOpenPublish && (
          <button
            type="button"
            onClick={onOpenPublish}
            className="px-4 sm:px-5 py-2 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-105"
            title="Generate Shareable Kankotri Link"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Publish &amp; Share</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;
