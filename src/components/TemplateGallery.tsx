import React, { useState, useEffect } from 'react';
import { 
  Check, Lock, Unlock, Sparkles, ArrowRight, Loader2, Eye, 
  ExternalLink, Heart, ShieldCheck, Filter, ChevronRight, CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { ThemeId, WeddingTheme } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RoyalCrestIcon, PalaceGateIcon } from './ShahiIcons';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP, calculatePaymentDetails } from '../config/pricing';
import { getUserPurchases } from '../services/razorpayClient';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface TemplateGalleryProps {
  selectedTheme?: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onContinueEditing?: (themeId: ThemeId) => void;
  onUnlockTheme?: (themeId: ThemeId) => void;
  onOpenLiveInvitation?: (slug: string) => void;
}

export interface RoyalTemplateItem {
  id: ThemeId;
  slug: ThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  previewImg: string;
  category: 'heritage' | 'traditional' | 'royal' | 'modern' | 'engagement';
  categoryLabel: string;
  badge?: string;
  packageType: 'silver' | 'gold';
  priceInr: number;
  imagePosition?: string;
  features: string[];
  isFeatured?: boolean;
}

export const ROYAL_7_TEMPLATES: RoyalTemplateItem[] = [
  {
    id: 'rajmahal',
    slug: 'rajmahal',
    name: 'The Rajmahal',
    subtitle: 'शाही राजमहल व 3D द्वार',
    tagline: '3D Palace Gateway & Royal Court',
    description: '3D palace gates part open smoothly upon scroll with ceremonial elephant procession and royal darbar elegance.',
    previewImg: '/previews/theme-rajmahal.webp',
    imagePosition: 'object-top',
    category: 'heritage',
    categoryLabel: 'Palace Heritage',
    badge: '✦ 3D ROYAL FLAGSHIP',
    packageType: 'gold',
    priceInr: 2299,
    features: ['3D Royal Gate Opening Animation', 'Elephant Procession Scroll Parallax', 'Trilingual Vedic Shloka Mantras'],
    isFeatured: true,
  },
  {
    id: 'royaldawn',
    slug: 'royaldawn',
    name: 'The Royal Dawn',
    subtitle: 'उदयपुर पैलेस व स्वर्ण भोर',
    tagline: 'Udaipur Lakefront & Scratch Reveal',
    description: 'Udaipur lakefront palace grandeur with interactive gold scratch-heart blessing and 4-pillar auspicious countdown timer.',
    previewImg: '/previews/theme-royaldawn.webp',
    imagePosition: 'object-center',
    category: 'royal',
    categoryLabel: 'Royal Lakefront',
    badge: '✦ UDAIPUR LAKEFRONT',
    packageType: 'gold',
    priceInr: 2299,
    features: ['Interactive Gold Scratch Blessing', 'Lakefront Sunburst Aesthetics', 'Auspicious 4-Pillar Countdown'],
    isFeatured: true,
  },
  {
    id: 'jharokha',
    slug: 'jharokha',
    name: 'The Jharokha',
    subtitle: 'पारंपरिक झरोखा व संगमरमर मेहराब',
    tagline: 'Rajasthani Marble Arch Filigree',
    description: 'Intricate Rajasthani marble arches, gold filigree motifs, and animated peacock feather accents.',
    previewImg: '/previews/theme-jharokha.webp',
    imagePosition: 'object-[center_35%]',
    category: 'traditional',
    categoryLabel: 'Sacred Tradition',
    badge: '✦ RAJASTHANI ARCH',
    packageType: 'silver',
    priceInr: 1299,
    features: ['Intricate Marble Jharokha Arch', 'Gold Filigree Border Motifs', 'Ornate Vivah Mandap Scroll'],
  },
  {
    id: 'mayura',
    slug: 'mayura',
    name: 'The Mayura',
    subtitle: 'मयूर पंख व पन्ना वैभव',
    tagline: 'Peacock Teal Plumage & Shehnai',
    description: 'Deep emerald teal tones with majestic dancing peacock feather animations and gold calligraphy.',
    previewImg: '/previews/theme-mayura.webp',
    imagePosition: 'object-center',
    category: 'traditional',
    categoryLabel: 'Sacred Tradition',
    badge: '✦ EMERALD TEAL',
    packageType: 'silver',
    priceInr: 1299,
    features: ['Dancing Peacock Plumes Animation', 'Emerald Teal & Gold Foil Luxury', 'Gold-Inlaid Royal Typography'],
  },
  {
    id: 'jodi',
    slug: 'jodi',
    name: 'The Jodi',
    subtitle: 'शुभ विवाह व स्वर्ण थाली',
    tagline: 'Festive Gold Thaali & Phere',
    description: 'Sacred 24K brass gold thaali with marigolds and illustrated couple caricature.',
    previewImg: '/previews/theme-jodi.webp',
    imagePosition: 'object-center',
    category: 'traditional',
    categoryLabel: 'Sacred Tradition',
    badge: '✦ SACRED FESTIVITY',
    packageType: 'silver',
    priceInr: 1299,
    features: ['Sacred Gold Thaali Plate Rotation', 'Custom Illustrated Couple Portrait', 'Traditional Vivah Rasam Icons'],
  },
  {
    id: 'dak',
    slug: 'dak',
    name: 'The Shahi Dâk',
    subtitle: 'शाही डाक व राजसी पत्र',
    tagline: 'Vintage Royal Postal Telegram',
    description: 'Vintage royal telegram postal envelope with handcrafted gold embossing and aged letterpress.',
    previewImg: '/previews/theme-dak.webp',
    imagePosition: 'object-center',
    category: 'heritage',
    categoryLabel: 'Palace Heritage',
    badge: '✦ VINTAGE TELEGRAM',
    packageType: 'silver',
    priceInr: 1299,
    features: ['Gold Embossed Royal Letter', 'Vintage Postal Envelope Slide', 'Handcrafted Letterpress Texture'],
  },
  {
    id: 'ivory',
    slug: 'ivory',
    name: 'The Ivory',
    subtitle: 'मॉडर्न मिनिमलिस्ट व वोग',
    tagline: 'Refined Modern Editorial',
    description: 'High-fashion editorial magazine aesthetic with crisp serif typography and warm alabaster.',
    previewImg: '/previews/theme-ivory.webp',
    imagePosition: 'object-top',
    category: 'modern',
    categoryLabel: 'Modern Couture',
    badge: '✦ VOGUE EDITORIAL',
    packageType: 'silver',
    priceInr: 1299,
    features: ['Vogue Editorial Layout & Grids', 'High-Fashion Split Serif Titles', 'Subtle Minimalist Parallax Scroll'],
  },
];

// 🖼️ Standardized Template Card Component with Image Preload & Skeleton
export const StandardizedTemplateCard: React.FC<{
  template: RoyalTemplateItem;
  isSelected?: boolean;
  isUnlocked?: boolean;
  isLive?: boolean;
  liveUrl?: string;
  onPreview: (id: ThemeId) => void;
  onSelect: (id: ThemeId) => void;
}> = ({
  template,
  isSelected = false,
  isUnlocked = false,
  isLive = false,
  liveUrl,
  onPreview,
  onSelect,
}) => {
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isPartner = Boolean(user && (user.role === 'partner' || user.role === 'photographer_partner' || user.role === 'photographer' || user.role === 'studio'));
  const priceInfo = calculatePaymentDetails(null, template.slug, user?.role);

  return (
    <div 
      className={`group rounded-3xl bg-[#FFFDF8] border transition-all duration-300 overflow-hidden flex flex-col h-full shadow-[0_4px_20px_-4px_rgba(67,9,20,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(67,9,20,0.12)] hover:-translate-y-1 ${
        isSelected 
          ? 'border-[#C49A35] ring-2 ring-[#C49A35]/40 shadow-md' 
          : 'border-[#E8D5AD] hover:border-[#C49A35]'
      }`}
    >
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* A. STANDARDIZED PREVIEW IMAGE CONTAINER (16:10 FIXED RATIO)       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#160408] shrink-0 border-b border-[#E8D5AD]/60">
        {/* Skeleton Shimmer Loader */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#24060B] via-[#3B0710] to-[#24060B] animate-pulse flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#C49A35]/40 animate-spin" />
          </div>
        )}

        {/* Graceful Fallback if image fails */}
        {imageError ? (
          <div className="absolute inset-0 bg-[#24060B] flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="w-8 h-8 text-[#C49A35]/60 mb-2" />
            <span className="font-cormorant text-base font-bold text-[#FFFDF8]">{template.name}</span>
            <span className="text-[10px] font-mono text-[#E8D5AD]/70 mt-0.5">Preview Rendering</span>
          </div>
        ) : (
          <img
            src={template.previewImg}
            alt={template.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover ${template.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Left: Featured / Architectural Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          {template.badge && (
            <span className="text-[8.5px] font-mono font-bold tracking-wider uppercase bg-[#6E1020]/90 backdrop-blur-md text-[#FFFDF8] px-2.5 py-0.5 rounded-full border border-[#C49A35]/50 shadow-xs">
              {template.badge}
            </span>
          )}
        </div>

        {/* Top Right: Status / Package Tier Badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          {isLive ? (
            <span className="text-[8.5px] font-mono font-bold tracking-wider bg-[#167A5A] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20">
              <Check className="w-3 h-3" /> LIVE
            </span>
          ) : isUnlocked ? (
            <span className="text-[8.5px] font-mono font-bold tracking-wider bg-[#167A5A] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20">
              <Unlock className="w-3 h-3" /> UNLOCKED
            </span>
          ) : (
            <span className="text-[8.5px] font-mono font-bold tracking-wider bg-black/75 backdrop-blur-md text-[#E8D5AD] px-2.5 py-0.5 rounded-full border border-[#C49A35]/40 shadow-xs uppercase">
              {template.packageType === 'gold' ? 'ALL THEMES INCLUDED' : 'SINGLE THEME ACCESS'}
            </span>
          )}
        </div>

        {/* Centered Hover Quick-Preview Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#160408]/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => onPreview(template.slug)}
            className="px-4 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#F8F3E8] text-[#6E1020] font-manrope font-bold text-xs flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform cursor-pointer border border-[#C49A35]"
          >
            <Eye className="w-4 h-4 text-[#C49A35]" />
            <span>Interactive 3D Preview</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* B–F. CARD CONTENT AREA (STANDARDIZED METADATA & HIERARCHY)        */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Header & Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="text-[#8E6725] tracking-widest block">
              {template.categoryLabel}
            </span>
            <span className="text-[#75675C] font-semibold">
              {template.packageType === 'gold' ? 'ROYAL GOLD' : 'ROYAL SILVER'}
            </span>
          </div>

          <div>
            <h3 className="font-cormorant font-bold text-2xl sm:text-[26px] text-[#6E1020] leading-tight">
              {template.name}
            </h3>

            <p className="text-xs text-[#C49A35] font-serif italic mt-0.5">
              {template.subtitle}
            </p>
          </div>

          <p className="text-xs text-[#4A3E39] font-normal leading-relaxed line-clamp-2 min-h-[34px] pt-0.5">
            {template.description}
          </p>
        </div>

        {/* 3 Architectural Feature Highlights */}
        <div className="space-y-1.5 pt-3 border-t border-[#E8D5AD]/60 text-xs text-[#241A17]/85">
          {template.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A] shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* G–H. CARD FOOTER: PRICING STRIP & DUAL ACTION BUTTONS (mt-auto)   */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 pt-0 mt-auto space-y-3.5">
        {/* Pricing Area */}
        <div className="p-3 bg-[#F8F3E8]/70 border border-[#E8D5AD]/70 rounded-2xl flex items-center justify-between">
          {isPartner ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#167A5A]">
                  ₹{priceInfo.finalAmountInr.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-mono text-[#75675C] line-through">
                  ₹{priceInfo.retailPriceInr.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#167A5A] uppercase tracking-wider block mt-0.5">
                PARTNER RATE
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#6E1020]">
                  ₹{template.priceInr.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#75675C]">
                  / wedding
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#75675C] block mt-0.5">
                All-Inclusive · Lifetime Hosting
              </span>
            </div>
          )}

          <span className="text-[9px] font-mono text-[#8E6725] bg-[#FFFDF8] border border-[#E8D5AD] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider shadow-2xs">
            {template.packageType === 'gold' ? 'GOLD BUNDLE' : 'SILVER ACCESS'}
          </span>
        </div>

        {/* Dual Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(template.slug)}
            className="py-3 px-3.5 sm:px-4 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#6E1020] border border-[#E8D5AD] hover:border-[#C49A35] font-manrope font-semibold text-xs transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            title={`Live 3D Preview ${template.name}`}
          >
            <Eye className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>LIVE PREVIEW</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(template.slug)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#6E1020] hover:bg-[#5C0D1A] text-[#FFFDF8] font-manrope font-bold text-xs uppercase tracking-wider shadow-xs border border-[#C49A35]/80 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn"
          >
            <span>{isLive ? 'VIEW KANKOTRI' : isUnlocked ? 'EDIT INVITATION' : 'SELECT THEME'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C49A35] group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTheme = 'rajmahal',
  onSelectTheme,
  onContinueEditing,
  onUnlockTheme,
  onOpenLiveInvitation,
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId | null>(null);
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<Set<ThemeId>>(new Set());
  const [publishedSitesMap, setPublishedSitesMap] = useState<Record<string, { isPublished: boolean; url?: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Sync unlocked purchases and published states from Supabase and Local Cache
  useEffect(() => {
    let isMounted = true;

    async function loadEntitlements() {
      if (!user?.uid) {
        // Fallback to local cache for instant preview
        const localPurchases = getUserPurchases();
        const unlocked = new Set<ThemeId>();
        Object.keys(localPurchases).forEach((k) => {
          const p = localPurchases[k];
          if (p.status === 'unlocked' || p.paymentStatus === 'PAID' || p.paymentStatus === 'SUCCESS') {
            unlocked.add(k as ThemeId);
          }
        });
        if (isMounted) {
          setUnlockedThemeIds(unlocked);
          setLoading(false);
        }
        return;
      }

      try {
        if (isSupabaseConfigured) {
          // 1. Fetch user purchases
          const { data: dbPurchases } = await supabase
            .from('purchases')
            .select('template_id, templates(slug)')
            .eq('user_id', user.uid)
            .eq('status', 'unlocked');

          const unlocked = new Set<ThemeId>();
          if (dbPurchases) {
            dbPurchases.forEach((p: any) => {
              if (p.templates?.slug) unlocked.add(p.templates.slug as ThemeId);
            });
          }

          // 2. Fetch user wedding sites
          const { data: dbSites } = await supabase
            .from('wedding_sites')
            .select('id, status, is_locked, published_url, templates(slug)')
            .eq('user_id', user.uid);

          const pubMap: Record<string, { isPublished: boolean; url?: string }> = {};
          if (dbSites) {
            dbSites.forEach((s: any) => {
              const slug = s.templates?.slug;
              if (slug) {
                pubMap[slug] = {
                  isPublished: s.status === 'published',
                  url: s.published_url,
                };
              }
            });
          }

          if (isMounted) {
            setUnlockedThemeIds(unlocked);
            setPublishedSitesMap(pubMap);
          }
        }
      } catch (e) {
        console.warn('Error loading template entitlements:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEntitlements();
    return () => { isMounted = false; };
  }, [user?.uid]);

  const categories = [
    { id: 'all', label: 'All Themes (7)' },
    { id: 'heritage', label: 'Palace Heritage' },
    { id: 'traditional', label: 'Sacred Tradition' },
    { id: 'royal', label: 'Royal Lakefront' },
    { id: 'modern', label: 'Modern Couture' },
    { id: 'engagement', label: '💍 Royal Engagement' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? ROYAL_7_TEMPLATES
    : ROYAL_7_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-10 font-manrope">
      {/* 🏰 Royal Collection Introduction */}
      <section className="text-center space-y-3 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-mono font-bold uppercase tracking-widest shadow-xs">
          <RoyalCrestIcon className="w-4 h-4 text-[#C49A35]" />
          <span>AUTHENTIC HERITAGE MOTIFS</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          THE ROYAL THEME COLLECTION
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Seven distinctive expressions of Indian wedding grandeur. Every design is crafted with 3D animated gates, live RSVP, and trilingual Vedic mantras.
        </p>
      </section>

      {/* 🏷️ Filter Categories */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-manrope font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#6E1020] text-[#FFFDF8] shadow-md border border-[#C49A35]'
                  : 'bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] text-[#241A17]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 🎨 7 Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6">
        {filteredTemplates.map((tpl) => {
          const isSelected = selectedTheme === tpl.slug;
          const isUnlocked = unlockedThemeIds.has(tpl.slug);
          const publishedInfo = publishedSitesMap[tpl.slug];
          const isLive = publishedInfo?.isPublished;

          return (
            <StandardizedTemplateCard
              key={tpl.slug}
              template={tpl}
              isSelected={isSelected}
              isUnlocked={isUnlocked}
              isLive={isLive}
              liveUrl={publishedInfo?.url}
              onPreview={(slug) => setPreviewThemeId(slug)}
              onSelect={(slug) => {
                onSelectTheme(slug);
                if (isLive && publishedInfo?.url && onOpenLiveInvitation) {
                  onOpenLiveInvitation(publishedInfo.url);
                } else if (isUnlocked && onContinueEditing) {
                  onContinueEditing(slug);
                } else if (onUnlockTheme) {
                  onUnlockTheme(slug);
                }
              }}
            />
          );
        })}
      </div>

      {/* Full-Screen Interactive Preview Modal */}
      <TemplatePreviewModal
        themeId={previewThemeId}
        isOpen={Boolean(previewThemeId)}
        onClose={() => setPreviewThemeId(null)}
        onSelectAndCustomize={(themeId) => {
          onSelectTheme(themeId);
          if (onUnlockTheme) onUnlockTheme(themeId);
        }}
      />
    </div>
  );
};

export default TemplateGallery;
