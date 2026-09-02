import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Upload, X, Check, Globe, Mail, Phone, 
  Instagram, MapPin, Sparkles, RefreshCw, Eye, ShieldCheck, 
  CheckCircle2, AlertCircle, Palette 
} from 'lucide-react';
import { StudioBranding } from '../../types/studioBranding';
import { fetchStudioBranding, saveStudioBranding, DEFAULT_STUDIO_BRANDING } from '../../services/studioBrandingService';

interface StudioBrandingViewProps {
  studioId: string;
}

export const StudioBrandingView: React.FC<StudioBrandingViewProps> = ({ studioId }) => {
  const [branding, setBranding] = useState<StudioBranding>(DEFAULT_STUDIO_BRANDING);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchStudioBranding(studioId);
    setBranding(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [studioId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        setErrorMessage('Please upload a valid logo (PNG, JPG, SVG, or WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Logo size must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setBranding({
          ...branding,
          logo_url: uploadEvent.target?.result as string,
        });
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const res = await saveStudioBranding(branding);
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to save studio branding.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 font-manrope">
        <div className="w-8 h-8 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#736567]">Loading studio brand profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-manrope text-[#20181A]">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
            Agency Identity &amp; White-Label
          </span>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5">
            Studio Brand Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            Configure your creative studio identity, custom colors, logo, and client portal white-label experience.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-[#F4D06F]" />
          )}
          <span>{saving ? 'Saving...' : saveSuccess ? 'Saved Successfully!' : 'Save Brand Profile'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#FDF2F2] border border-[#F0D5D5] rounded-2xl text-xs text-[#8C4A4A] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Grid: Profile & Colors (Left 7 Cols) + Live Portal Preview (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Settings (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* White-Label Mode Toggle */}
          <div className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#20181A]">White-Label Client Experience</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6D2E] font-bold border border-[#F4D06F]/50">
                  Pro Feature
                </span>
              </div>
              <p className="text-[11px] text-[#736567] mt-0.5">
                When enabled, client approval portals and review links will display your studio's logo, colors, and business info instead of default platform branding.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={branding.white_label_enabled}
                onChange={(e) => setBranding({ ...branding, white_label_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E8DFD1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DFD1] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#540D1E]"></div>
            </label>
          </div>

          {/* Business Details Card */}
          <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              1. Studio Identity
            </h3>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#4A3E40]">Studio Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#E8DFD1] flex items-center justify-center overflow-hidden relative group">
                  {branding.logo_url ? (
                    <img src={branding.logo_url} alt="Studio Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#9C8C8E]" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-semibold text-[#4A3E40] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 inline mr-1 text-[#9C772F]" />
                      Upload Logo
                    </button>
                    {branding.logo_url && (
                      <button
                        type="button"
                        onClick={() => setBranding({ ...branding, logo_url: null })}
                        className="px-3 py-1.5 rounded-xl bg-[#FDF2F2] hover:bg-[#FBE5E5] text-[#8C4A4A] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#736567]">Recommended: Transparent PNG or SVG (min 200×200 px)</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Studio Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  Studio Name <span className="text-[#8C4A4A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branding.studio_name}
                  onChange={(e) => setBranding({ ...branding, studio_name: e.target.value })}
                  placeholder="e.g. Royal Vivah Studio"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  Studio Tagline
                </label>
                <input
                  type="text"
                  value={branding.studio_tagline || ''}
                  onChange={(e) => setBranding({ ...branding, studio_tagline: e.target.value })}
                  placeholder="e.g. Bespoke Wedding Invitations"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Business Email</label>
                <input
                  type="email"
                  value={branding.business_email || ''}
                  onChange={(e) => setBranding({ ...branding, business_email: e.target.value })}
                  placeholder="studio@example.com"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Business Phone / WhatsApp</label>
                <input
                  type="text"
                  value={branding.business_phone || ''}
                  onChange={(e) => setBranding({ ...branding, business_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>
            </div>

            {/* Website & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Website URL</label>
                <input
                  type="text"
                  value={branding.website_url || ''}
                  onChange={(e) => setBranding({ ...branding, website_url: e.target.value })}
                  placeholder="https://yourstudio.com"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={branding.instagram_url || ''}
                  onChange={(e) => setBranding({ ...branding, instagram_url: e.target.value })}
                  placeholder="@yourweddingstudio"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Brand Color Palette Card */}
          <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              2. Custom Brand Colors
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-[#E8DFD1] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={branding.primary_color}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="w-full px-2 py-1 bg-[#FAF6EF] border border-[#E8DFD1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-[#E8DFD1] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="w-full px-2 py-1 bg-[#FAF6EF] border border-[#E8DFD1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Accent Gold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accent_color}
                    onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-[#E8DFD1] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={branding.accent_color}
                    onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                    className="w-full px-2 py-1 bg-[#FAF6EF] border border-[#E8DFD1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

          </div>

        </form>

        {/* Right Column: Live Client Portal Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold block">
            Live Client Portal Preview
          </span>

          <div className="bg-[#FAF8F5] border border-[#E8DFD1] rounded-3xl p-5 shadow-inner space-y-4 sticky top-6">
            
            {/* Top Mock Header */}
            <div 
              className="p-4 rounded-2xl shadow-sm text-white flex items-center justify-between transition-colors"
              style={{ backgroundColor: branding.white_label_enabled ? branding.primary_color : '#540D1E' }}
            >
              <div className="flex items-center gap-2.5">
                {branding.white_label_enabled && branding.logo_url ? (
                  <img src={branding.logo_url} alt="Logo" className="w-7 h-7 rounded-md object-contain bg-white/10 p-0.5" />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center font-bold text-xs">
                    👑
                  </div>
                )}
                <div>
                  <div className="font-bold text-xs leading-tight">
                    {branding.white_label_enabled ? branding.studio_name : 'AmantranLink'}
                  </div>
                  <div className="text-[9px] opacity-80">Design Review Portal</div>
                </div>
              </div>

              <span 
                className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ backgroundColor: branding.accent_color, color: '#120306' }}
              >
                In Review
              </span>
            </div>

            {/* Mock Client Invitation Card */}
            <div className="bg-white border border-[#E8DFD1] rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="text-center space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#9C772F] font-bold">
                  Client Proofing
                </span>
                <h4 className="font-cormorant text-lg font-bold text-[#20181A]">
                  Dhruv &amp; Shreya's Royal Vivah
                </h4>
                <p className="text-[10px] text-[#736567]">10 Dec 2026 · The Milestone Highway</p>
              </div>

              <div className="h-28 bg-[#FAF6EE] rounded-xl border border-dashed border-[#E8DFD1] flex items-center justify-center text-center p-3">
                <span className="text-[10px] text-[#8C7A7C] italic">
                  [ Live Wedding Invitation Canvas Preview ]
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 py-1.5 rounded-xl text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: branding.white_label_enabled ? branding.primary_color : '#540D1E' }}
                >
                  ✓ Approve Design
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-[#E8DFD1] bg-[#FAF6EF] text-[10px] font-semibold text-[#4A3E40]"
                >
                  Request Changes
                </button>
              </div>
            </div>

            {/* Mock Footer */}
            <div className="text-center text-[10px] text-[#8C7A7C] space-y-0.5 pt-1">
              <div>
                {branding.white_label_enabled 
                  ? `Crafted exclusively by ${branding.studio_name}` 
                  : 'Powered by AmantranLink Studio'}
              </div>
              {branding.business_phone && (
                <div>Helpdesk: {branding.business_phone}</div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default StudioBrandingView;
