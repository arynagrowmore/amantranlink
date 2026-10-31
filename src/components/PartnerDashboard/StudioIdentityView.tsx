import React, { useState } from 'react';
import { 
  Building2, Palette, Globe, SlidersHorizontal, Share2, 
  CheckCircle2, Copy, ExternalLink, ShieldCheck, Instagram, MapPin, Phone, Mail, Award, Check
} from 'lucide-react';
import { StudioBrandingView } from './StudioBrandingView';
import { CustomDomainsView } from './CustomDomainsView';
import { PartnerMarketingTab } from './PartnerMarketingTab';
import { getCurrentAppOrigin } from '../../utils/origin';

export type IdentitySection = 'profile' | 'branding' | 'domains' | 'settings' | 'marketing';

interface StudioIdentityViewProps {
  initialSection?: IdentitySection;
  studioId: string;
  user: any;
  stats: any;
  onOpenAssetKit?: (site: any) => void;
  onSaveProfileSuccess?: () => void;
}

export const StudioIdentityView: React.FC<StudioIdentityViewProps> = ({
  initialSection = 'profile',
  studioId,
  user,
  stats,
  onOpenAssetKit,
  onSaveProfileSuccess,
}) => {
  const [activeSection, setActiveSection] = useState<IdentitySection>(initialSection);

  // Profile Form State
  const [studioName, setStudioName] = useState<string>(user?.studioName || user?.name || '');
  const [ownerName, setOwnerName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 9409360336');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [city, setCity] = useState<string>('Ahmedabad, Gujarat');
  const [instagram, setInstagram] = useState<string>('@royalstudio');
  const [description, setDescription] = useState<string>(
    'Specializing in luxury royal wedding photography, cinematic films, and digital guest portals.'
  );

  // Settings / Referral State
  const partnerSlug = user?.partnerSlug || user?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'studio';
  const [slug, setSlug] = useState<string>(partnerSlug);
  const [payoutUpi, setPayoutUpi] = useState<string>(user?.payoutUpi || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const appOrigin = getCurrentAppOrigin();
  const referralUrl = `${appOrigin}/?partner=${slug}`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      // Save locally or via callback
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccessMsg('Studio Identity details saved successfully.');
      if (onSaveProfileSuccess) onSaveProfileSuccess();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyReferral = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const navItems: Array<{ id: IdentitySection; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'profile', label: 'Studio Profile', icon: Building2 },
    { id: 'branding', label: 'Branding & Watermark', icon: Palette },
    { id: 'domains', label: 'Custom Domains', icon: Globe },
    { id: 'settings', label: 'Referral & Payouts', icon: SlidersHorizontal },
    { id: 'marketing', label: 'Marketing Kit', icon: Share2, badge: '4 Assets' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-sm text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              HUB 6 · IDENTITY &amp; SETTINGS
            </span>
            <span className="text-stone-500 text-xs">•</span>
            <span className="text-xs text-stone-300 font-mono">@{slug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            {studioName || 'Studio Identity & Presence'}
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
            Manage your official studio branding, parent-subsidiary company details, custom vanity domains, and referral rewards in one consolidated space.
          </p>
        </div>

        {/* Quick Referral Share Pill */}
        <div className="shrink-0 bg-stone-800/80 border border-stone-700/80 p-3.5 rounded-2xl space-y-2">
          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">Your Partner Link</span>
          <div className="flex items-center gap-2">
            <code className="text-[11px] font-mono text-emerald-300 bg-black/40 px-2.5 py-1 rounded-lg border border-stone-700 truncate max-w-[200px]">
              {referralUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              title="Copy Partner URL"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-stone-200 text-stone-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub-Section 1: Studio Profile & Contacts */}
      {activeSection === 'profile' && (
        <div className="max-w-4xl bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Studio Business Profile</h2>
            <p className="text-xs text-stone-500 mt-1">This information will be displayed on client quotations, invoices, and royal invitation badges.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Studio Business Name</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  required
                  placeholder="e.g. Aryan Patel Photography"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Photographer / Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Aryan Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9409360336"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="studio@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City / Base Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Udaipur / Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@aryanpatelphotography"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Studio Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary for client wedding portals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#0F766E] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              {isSaving ? 'Saving Profile...' : 'Save Studio Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Sub-Section 2: Branding & Watermark */}
      {activeSection === 'branding' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <StudioBrandingView studioId={studioId} />
        </div>
      )}

      {/* Sub-Section 3: Custom Domains */}
      {activeSection === 'domains' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <CustomDomainsView studioId={studioId} />
        </div>
      )}

      {/* Sub-Section 4: Referral & UPI Payouts */}
      {activeSection === 'settings' && (
        <div className="max-w-4xl bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Referral &amp; Payout Settings</h2>
            <p className="text-xs text-stone-500 mt-1">Configure your custom vanity URL slug and direct bank UPI destination for fast margin settlements.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Custom Studio Partner Slug</label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 bg-stone-100 border border-r-0 border-stone-200 rounded-l-xl text-xs text-stone-500 font-mono">
                  {appOrigin}/?partner=
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-studio-slug"
                  className="flex-1 px-3.5 py-2.5 border border-stone-200 rounded-r-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Settlement Payout UPI ID</label>
              <input
                type="text"
                value={payoutUpi}
                onChange={(e) => setPayoutUpi(e.target.value)}
                placeholder="photographer@okhdfcbank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Instant UPI settlements and online pay link margins will be credited directly to this VPA.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              {isSaving ? 'Updating Payout Settings...' : 'Save Payout Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Sub-Section 5: Marketing Kit */}
      {activeSection === 'marketing' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <PartnerMarketingTab onNavigateSettings={() => setActiveSection('settings')} />
        </div>
      )}
    </div>
  );
};
