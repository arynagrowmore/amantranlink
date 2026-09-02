import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Smartphone, Monitor, Tablet, ArrowRight, Volume2, ShieldCheck } from 'lucide-react';
import { ThemeId, ViewMode } from '../types/wedding';
import { themes } from './ThemeSelector';
import { useAuth } from '../context/AuthContext';
import { THEME_PACKAGE_MAP, OFFICIAL_PACKAGES, calculatePaymentDetails } from '../config/pricing';
import { stopAllIframesAudio } from '../services/audioCoordinator';

interface TemplatePreviewModalProps {
  themeId: ThemeId | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAndCustomize: (themeId: ThemeId) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  themeId,
  isOpen,
  onClose,
  onSelectAndCustomize,
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  // 🔇 Stop any background audio when modal opens, switches theme, or closes
  useEffect(() => {
    if (isOpen && themeId) {
      stopAllIframesAudio(modalIframeRef.current);
    }
    return () => {
      stopAllIframesAudio();
    };
  }, [isOpen, themeId]);

  if (!isOpen || !themeId) return null;

  const currentTheme = themes.find((t) => t.id === themeId) || themes[0];
  const pkgType = THEME_PACKAGE_MAP[themeId] || 'gold';
  const pkgInfo = OFFICIAL_PACKAGES[pkgType];
  const priceInfo = calculatePaymentDetails(null, themeId, user?.role);
  const isPartner = user?.role === 'partner';

  const handleClose = () => {
    stopAllIframesAudio();
    onClose();
  };

  const handleSelect = () => {
    stopAllIframesAudio();
    onSelectAndCustomize(themeId);
    onClose();
  };

  const getContainerWidth = () => {
    if (viewMode === 'mobile') return 'max-w-[410px] h-[85vh] rounded-[40px] border-[10px] border-neutral-900 shadow-2xl';
    if (viewMode === 'tablet') return 'max-w-[768px] h-[88vh] rounded-[28px] border-4 border-[#C49A35]/60 shadow-2xl';
    return 'w-full h-full rounded-2xl border border-[#E8D5AD] shadow-lg';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#140306]/90 backdrop-blur-xl animate-fadeIn">
      {/* 👑 Top Modal Header Toolbar */}
      <header className="h-16 bg-[#24060B] border-b border-[#C49A35]/40 px-4 sm:px-8 flex items-center justify-between shrink-0 text-[#FFFDF8] z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6E1020] border border-[#C49A35] flex items-center justify-center text-[#C49A35] font-bold shadow-xs">
            <span className="text-xl">{currentTheme.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cormorant font-bold text-lg sm:text-xl text-[#FFFDF8] tracking-wide">
                {currentTheme.name}
              </h3>
              <span className="text-[10px] font-manrope font-bold bg-[#C49A35] text-[#24060B] px-2 py-0.5 rounded-full uppercase">
                {currentTheme.badge}
              </span>
            </div>
            <div className="text-[11px] font-manrope text-[#E8D5AD] hidden sm:flex items-center gap-2">
              <span>{currentTheme.tagline}</span>
              <span>•</span>
              {isPartner ? (
                <span className="text-emerald-400 font-bold">
                  Studio Price ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')} (Retail ₹{priceInfo.retailPriceInr.toLocaleString('en-IN')})
                </span>
              ) : (
                <span>₹{pkgInfo.priceInr.toLocaleString('en-IN')} All-Inclusive</span>
              )}
            </div>
          </div>
        </div>

        {/* Device Viewport Switcher */}
        <div className="hidden md:flex items-center bg-[#140306] border border-[#C49A35]/40 rounded-full p-1 gap-1">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'desktop' ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs' : 'text-[#E8D5AD]/70 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tablet')}
            className={`px-3 py-1 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tablet' ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs' : 'text-[#E8D5AD]/70 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'mobile' ? 'bg-[#6E1020] text-[#FFFDF8] shadow-xs' : 'text-[#E8D5AD]/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelect}
            className="px-5 py-2 rounded-xl bg-[#C49A35] hover:bg-[#D8AF4B] text-[#24060B] font-manrope font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#24060B]" />
            <span className="hidden sm:inline">Select &amp; Customize</span>
            <span className="sm:hidden">Select</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 📱 Interactive Preview Frame Canvas */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden relative">
        <div className={`transition-all duration-300 overflow-hidden bg-white relative flex flex-col ${getContainerWidth()}`}>
          <iframe
            ref={modalIframeRef}
            key={`${themeId}-${viewMode}`}
            src={`${currentTheme.url}?preview=true&theme=${themeId}`}
            title={`Preview of ${currentTheme.name}`}
            className="w-full h-full border-0"
            allow="autoplay; clipboard-write"
          />
        </div>
      </main>

      {/* 🌟 Footer Trust & Feature Ribbon */}
      <footer className="h-10 bg-[#24060B] border-t border-[#C49A35]/30 px-4 sm:px-8 flex items-center justify-between text-[11px] font-manrope text-[#E8D5AD]/80 shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>Interactive Live Shehnai Audio &amp; 3D Gate Parallax Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#C49A35] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authentic Shahi Heirloom Digital Kankotri</span>
        </div>
      </footer>
    </div>
  );
};

export default TemplatePreviewModal;

