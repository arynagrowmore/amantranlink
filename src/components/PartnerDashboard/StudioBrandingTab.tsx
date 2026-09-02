import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Check, RotateCcw, ExternalLink, Eye, 
  Palette, ShieldCheck, CheckCircle2, ArrowRight,
  Sliders, Wand2, Info
} from 'lucide-react';

export interface StudioBrandingData {
  studioName: string;
  accentColor: string;
  welcomeNote: string;
}

interface StudioBrandingTabProps {
  initialStudioName?: string;
  initialAccentColor?: string;
  initialWelcomeNote?: string;
  partnerSlug?: string;
  onSave?: (data: StudioBrandingData) => Promise<boolean | void> | boolean | void;
  onOpenPreviewClientExperience?: () => void;
}

// 🎨 5 Curated Color Options + Custom Picker
const CURATED_ACCENTS = [
  {
    id: 'amantan-teal',
    name: 'Amantran Teal',
    hex: '#2D7A74',
    bgClass: 'bg-[#2D7A74]',
    description: 'Modern Studio Signature',
  },
  {
    id: 'royal-burgundy',
    name: 'Royal Burgundy',
    hex: '#7B1620',
    bgClass: 'bg-[#7B1620]',
    description: 'Heritage & Darbar Grandeur',
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    hex: '#B58A2A',
    bgClass: 'bg-[#B58A2A]',
    description: 'Auspicious Shahi Radiance',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    hex: '#1C1917',
    bgClass: 'bg-[#1C1917]',
    description: 'Editorial Monochrome',
  },
];

const DEFAULT_WELCOME = 'Exclusive royal wedding invitations curated by our studio team.';

export const StudioBrandingTab: React.FC<StudioBrandingTabProps> = ({
  initialStudioName = 'Amantranlink',
  initialAccentColor = '#2D7A74',
  initialWelcomeNote = DEFAULT_WELCOME,
  partnerSlug = 'studio',
  onSave,
  onOpenPreviewClientExperience,
}) => {
  // Last saved baseline for change tracking & reset
  const [savedBaseline, setSavedBaseline] = useState<StudioBrandingData>(() => {
    // Try restoring from localStorage if available
    try {
      const stored = localStorage.getItem('AMANTRANLINK_STUDIO_BRANDING');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          studioName: parsed.studioName || initialStudioName || 'Amantranlink',
          accentColor: parsed.accentColor || initialAccentColor || '#2D7A74',
          welcomeNote: parsed.welcomeNote || initialWelcomeNote || DEFAULT_WELCOME,
        };
      }
    } catch (e) {}

    return {
      studioName: initialStudioName || 'Amantranlink',
      accentColor: initialAccentColor || '#2D7A74',
      welcomeNote: initialWelcomeNote || DEFAULT_WELCOME,
    };
  });

  // Current interactive draft state
  const [studioName, setStudioName] = useState<string>(savedBaseline.studioName);
  const [accentColor, setAccentColor] = useState<string>(savedBaseline.accentColor);
  const [welcomeNote, setWelcomeNote] = useState<string>(savedBaseline.welcomeNote);
  const [customHexInput, setCustomHexInput] = useState<string>(savedBaseline.accentColor);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [activePreviewDevice, setActivePreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Check if current form differs from saved baseline
  const isDirty = 
    studioName.trim() !== savedBaseline.studioName.trim() ||
    accentColor.toLowerCase() !== savedBaseline.accentColor.toLowerCase() ||
    welcomeNote.trim() !== savedBaseline.welcomeNote.trim();

  // Character counter for welcome note (recommended ~140-180 chars)
  const charCount = welcomeNote.length;
  const maxChars = 160;

  // Handle Curated Accent Select
  const handleSelectCuratedAccent = (hex: string) => {
    setAccentColor(hex);
    setCustomHexInput(hex);
  };

  // Handle Custom Hex Input
  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#') && val.length > 0) {
      val = `#${val}`;
    }
    setCustomHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setAccentColor(val);
    }
  };

  // Reset to last saved baseline
  const handleReset = () => {
    setStudioName(savedBaseline.studioName);
    setAccentColor(savedBaseline.accentColor);
    setWelcomeNote(savedBaseline.welcomeNote);
    setCustomHexInput(savedBaseline.accentColor);
    setSaveSuccessMsg('');
  };

  // Save branding preferences
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    const newBrandData: StudioBrandingData = {
      studioName: studioName.trim() || 'Studio Partner',
      accentColor: accentColor,
      welcomeNote: welcomeNote.trim() || DEFAULT_WELCOME,
    };

    try {
      if (onSave) {
        await onSave(newBrandData);
      }
      try {
        localStorage.setItem('AMANTRANLINK_STUDIO_BRANDING', JSON.stringify(newBrandData));
      } catch (e) {}

      setSavedBaseline(newBrandData);
      setSaveSuccessMsg('Branding preferences saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[StudioBrandingTab] Error saving branding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isCuratedSelected = CURATED_ACCENTS.some(
    (c) => c.hex.toLowerCase() === accentColor.toLowerCase()
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12 font-manrope">
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. PAGE HEADER                                                     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D6] pb-6">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#2B2522] tracking-tight">
            Studio Branding
          </h1>
          <p className="text-xs sm:text-sm text-[#756E67] mt-1 font-normal">
            Customize how your studio appears across client-facing AmantranLink experiences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onOpenPreviewClientExperience) {
                onOpenPreviewClientExperience();
              } else {
                const url = `/?partner=${partnerSlug}`;
                window.open(url, '_blank');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E0D6] bg-white hover:bg-[#F7F5F0] text-[#2B2522] hover:text-[#2D7A74] text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer group"
          >
            <Eye className="w-3.5 h-3.5 text-[#756E67] group-hover:text-[#2D7A74] transition-colors" />
            <span>Preview Client Experience</span>
            <ExternalLink className="w-3 h-3 text-[#756E67] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN 2-COLUMN BALANCED WORKSPACE                                */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ───────────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: BRAND IDENTITY SETTINGS (58% ~ col-span-7)       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-[#E5E0D6] p-6 sm:p-7 shadow-xs">
            {/* Surface Header */}
            <div className="border-b border-[#F0EBE1] pb-5 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#B58A2A] uppercase">
                  BRAND IDENTITY
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#2B2522] mt-0.5">
                Make every client invitation feel consistent with your studio.
              </h2>
            </div>

            {/* Form Settings */}
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* A. STUDIO DISPLAY NAME */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="studio-name" className="text-xs font-bold text-[#2B2522] uppercase tracking-wider">
                    Studio Display Name
                  </label>
                  <span className="text-[10px] text-[#756E67] font-mono">Visible to Clients</span>
                </div>
                <input
                  id="studio-name"
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. Amantranlink or Aryan Patel Photography"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D6] bg-[#FCFBF8] text-sm text-[#2B2522] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D7A74] focus:bg-white transition-all"
                  maxLength={60}
                />
                <p className="text-[11px] text-[#756E67] leading-relaxed">
                  This name appears on client-facing invitations, review links, and co-branded headers.
                </p>
              </div>

              {/* B. STUDIO ACCENT */}
              <div className="space-y-3 pt-4 border-t border-[#F0EBE1]">
                <div>
                  <label className="text-xs font-bold text-[#2B2522] uppercase tracking-wider block">
                    Studio Accent
                  </label>
                  <p className="text-[11px] text-[#756E67] mt-0.5">
                    Choose the primary accent used across your client experience, buttons, and badges.
                  </p>
                </div>

                {/* 5 Curated Color Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CURATED_ACCENTS.map((item) => {
                    const isSelected = accentColor.toLowerCase() === item.hex.toLowerCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCuratedAccent(item.hex)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'border-[#2D7A74] bg-[#2D7A74]/5 ring-1 ring-[#2D7A74]'
                            : 'border-[#E5E0D6] bg-white hover:border-stone-300 hover:bg-[#FCFBF8]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: item.hex }}
                          />
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#2D7A74] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-xs text-[#2B2522] block leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#756E67] mt-0.5 block">
                            {isSelected ? 'ACTIVE' : item.hex}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* 5. Custom Color Tile */}
                  <div
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 relative ${
                      !isCuratedSelected
                        ? 'border-[#2D7A74] bg-[#2D7A74]/5 ring-1 ring-[#2D7A74]'
                        : 'border-[#E5E0D6] bg-white hover:border-stone-300 hover:bg-[#FCFBF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => {
                            setAccentColor(e.target.value);
                            setCustomHexInput(e.target.value);
                          }}
                          className="w-6 h-6 rounded-full opacity-0 absolute inset-0 cursor-pointer z-10"
                          title="Pick custom color"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Palette className="w-2.5 h-2.5 text-white mix-blend-difference" />
                        </div>
                      </div>
                      {!isCuratedSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#2D7A74] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-xs text-[#2B2522] block leading-tight">
                        Custom Color
                      </span>
                      <div className="mt-1">
                        <input
                          type="text"
                          value={customHexInput}
                          onChange={handleCustomHexChange}
                          placeholder="#2D7A74"
                          className="w-full px-2 py-0.5 rounded border border-[#E5E0D6] bg-white text-[10px] font-mono font-semibold text-[#2B2522] uppercase focus:outline-none focus:border-[#2D7A74]"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. CLIENT WELCOME MESSAGE */}
              <div className="space-y-1.5 pt-4 border-t border-[#F0EBE1]">
                <div className="flex items-center justify-between">
                  <label htmlFor="welcome-msg" className="text-xs font-bold text-[#2B2522] uppercase tracking-wider">
                    Client Welcome Message
                  </label>
                  <span className={`text-[10px] font-mono ${charCount > maxChars ? 'text-amber-600 font-bold' : 'text-[#756E67]'}`}>
                    {charCount} / {maxChars}
                  </span>
                </div>
                <textarea
                  id="welcome-msg"
                  rows={3}
                  value={welcomeNote}
                  onChange={(e) => setWelcomeNote(e.target.value)}
                  placeholder="Exclusive royal wedding invitations curated by our studio team."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D6] bg-[#FCFBF8] text-xs leading-relaxed text-[#2B2522] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D7A74] focus:bg-white transition-all resize-none"
                  maxLength={maxChars + 30}
                />
                <p className="text-[11px] text-[#756E67] leading-relaxed">
                  Shown to clients when they open an invitation created by your studio or arrive through your referral link.
                </p>
              </div>

              {/* D. ACTION FOOTER */}
              <div className="pt-5 border-t border-[#E5E0D6] flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Change Status Indicator */}
                <div className="flex items-center gap-2 text-xs">
                  {saveSuccessMsg ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  ) : isDirty ? (
                    <div className="flex items-center gap-1.5 text-amber-700 font-medium animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Unsaved changes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#756E67]">
                      <span className="w-2 h-2 rounded-full bg-stone-300" />
                      <span>All changes saved</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer border flex items-center gap-1.5 ${
                      isDirty && !isSaving
                        ? 'border-[#E5E0D6] text-[#756E67] hover:bg-[#F7F5F0] hover:text-[#2B2522]'
                        : 'border-transparent text-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                      isDirty && !isSaving
                        ? 'bg-[#2D7A74] hover:bg-[#23605B] text-white hover:shadow'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isSaving ? 'Saving...' : 'SAVE BRANDING'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Value Proposition Note */}
          <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E5E0D6] flex items-start gap-3 text-xs text-[#756E67]">
            <Info className="w-4 h-4 text-[#B58A2A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#2B2522] font-semibold">Studio Co-Branding Promise:</strong> AmantranLink never obscures your studio identity. Clients who open your links will clearly see your studio branding as the verified creative curator.
            </p>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: LIVE CLIENT PREVIEW (42% ~ col-span-5)          */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-widest text-[#756E67] uppercase">
                LIVE CLIENT PREVIEW
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[11px] text-[#756E67] font-mono">Instant Synchronous</span>
          </div>

          {/* Simulated Browser Device Window */}
          <div className="bg-[#1C1917] p-2 sm:p-2.5 rounded-2xl shadow-md border border-stone-800">
            
            {/* Top Browser URL Bar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-stone-900/80 rounded-xl mb-2 text-stone-400 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block" />
              </div>
              <div className="flex-1 bg-stone-800 px-2 py-0.5 rounded text-center truncate text-stone-300 text-[9px]">
                https://amantranlink.com/?partner={partnerSlug || 'studio'}
              </div>
            </div>

            {/* Preview Card Canvas */}
            <div className="bg-[#FFFDF8] rounded-xl p-6 sm:p-8 border border-[#E5E0D6] text-center space-y-5 relative overflow-hidden shadow-inner min-h-[380px] flex flex-col justify-between">
              
              {/* Subtle Decorative Indian Arch Lines */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 border-b border-[#B58A2A]/30 rounded-b-full pointer-events-none" />

              {/* Dynamic Studio Badge */}
              <div className="pt-2">
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border transition-colors shadow-2xs"
                  style={{
                    backgroundColor: `${accentColor}12`,
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>PRESENTED BY {studioName.trim().toUpperCase() || 'STUDIO PARTNER'}</span>
                </div>
              </div>

              {/* Main Heading & Dynamic Welcome */}
              <div className="space-y-3 px-2">
                <div className="text-[10px] font-mono tracking-widest text-[#B58A2A] uppercase">
                  ✦ SHAHI DIGITAL KANKOTRI ✦
                </div>
                <h3 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#2B2522] tracking-tight leading-tight">
                  A Royal Celebration Awaits
                </h3>
                <div className="w-12 h-0.5 bg-[#B58A2A]/40 mx-auto rounded-full" />
                <p className="text-xs text-[#756E67] leading-relaxed max-w-xs mx-auto italic font-cormorant sm:text-sm">
                  "{welcomeNote || DEFAULT_WELCOME}"
                </p>
              </div>

              {/* Dynamic Call to Action Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs tracking-wider uppercase shadow-xs transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Invitation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#756E67]/80 font-mono">
                  <ShieldCheck className="w-3 h-3 text-[#B58A2A]" />
                  <span>Verified Studio Partner Experience</span>
                </div>
              </div>

              {/* Bottom Subtle Watermark */}
              <div className="text-[9px] text-[#756E67]/50 font-mono tracking-wider">
                AmantranLink · Modasa, Gujarat
              </div>

            </div>

          </div>

          {/* Quick Context Card */}
          <div className="p-3.5 rounded-xl border border-[#E5E0D6] bg-white text-xs text-[#756E67] space-y-1">
            <span className="font-bold text-[#2B2522] block text-[11px]">
              How this renders for your clients:
            </span>
            <p className="text-[11px] leading-relaxed">
              When wedding couples open your invitations, this co-branded badge and welcome note establish immediate trust and direct attribution to your photography studio.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
