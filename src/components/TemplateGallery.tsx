import React, { useState, useEffect } from 'react';
import { 
  Check, Lock, Unlock, Sparkles, ArrowRight, Loader2, Eye, 
  ExternalLink, Heart, ShieldCheck, Filter, ChevronRight
} from 'lucide-react';
import { ThemeId, WeddingTheme } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RoyalCrestIcon, PalaceGateIcon } from './ShahiIcons';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP } from '../config/pricing';
import { getUserPurchases, getUserActiveSite } from '../services/razorpayClient';
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
  tagline: string;
  description: string;
  previewImg: string;
  category: 'heritage' | 'traditional' | 'royal' | 'contemporary';
  categoryLabel: string;
  badge?: string;
  packageType: 'silver' | 'gold';
  priceInr: number;
}

export const ROYAL_7_TEMPLATES: RoyalTemplateItem[] = [
  {
    id: 'rajmahal',
    slug: 'rajmahal',
    name: 'The Rajmahal',
    tagline: '3D Palace Gateway & Royal Court',
    description: 'An opulent palace-inspired invitation with a ceremonial 3D royal gate.',
    previewImg: '/previews/theme-rajmahal.webp',
    category: 'heritage',
    categoryLabel: 'Heritage Palace',
    badge: 'FLAGSHIP',
    packageType: 'gold',
    priceInr: 2299,
  },
  {
    id: 'royaldawn',
    slug: 'royaldawn',
    name: 'The Royal Dawn',
    tagline: 'Udaipur Lakefront & Scratch Reveal',
    description: 'An Udaipur-inspired celebration with a luminous sunset royal aesthetic.',
    previewImg: '/previews/theme-royaldawn.webp',
    category: 'royal',
    categoryLabel: 'Royal Lakefront',
    badge: 'ROYAL',
    packageType: 'gold',
    priceInr: 2299,
  },
  {
    id: 'jharokha',
    slug: 'jharokha',
    name: 'The Jharokha',
    tagline: 'Rajasthani Marble Arch Filigree',
    description: 'Architectural Rajasthani elegance framed through intricate marble filigree.',
    previewImg: '/previews/theme-jharokha.webp',
    category: 'traditional',
    categoryLabel: 'Traditional Arch',
    packageType: 'silver',
    priceInr: 1299,
  },
  {
    id: 'mayura',
    slug: 'mayura',
    name: 'The Mayura',
    tagline: 'Peacock Teal Plumage & Shehnai',
    description: 'Peacock-inspired royal colour, ornate detailing and graceful movement.',
    previewImg: '/previews/theme-mayura.webp',
    category: 'traditional',
    categoryLabel: 'Traditional Royal',
    packageType: 'silver',
    priceInr: 1299,
  },
  {
    id: 'jodi',
    slug: 'jodi',
    name: 'The Jodi',
    tagline: 'Festive Gold Thaali & Phere',
    description: 'A festive traditional invitation built around sacred wedding symbolism.',
    previewImg: '/previews/theme-jodi.webp',
    category: 'traditional',
    categoryLabel: 'Traditional Sacred',
    packageType: 'silver',
    priceInr: 1299,
  },
  {
    id: 'dak',
    slug: 'dak',
    name: 'The Shahi Dâk',
    tagline: 'Vintage Royal Postal Telegram',
    description: 'A vintage royal postal invitation with an interactive ceremonial seal.',
    previewImg: '/previews/theme-dak.webp',
    category: 'heritage',
    categoryLabel: 'Vintage Heritage',
    badge: 'VINTAGE',
    packageType: 'silver',
    priceInr: 1299,
  },
  {
    id: 'ivory',
    slug: 'ivory',
    name: 'The Ivory Minimalist',
    tagline: 'Refined Modern Editorial',
    description: 'A refined contemporary invitation with editorial ivory elegance.',
    previewImg: '/previews/theme-ivory.webp',
    category: 'contemporary',
    categoryLabel: 'Contemporary',
    packageType: 'silver',
    priceInr: 1299,
  },
];

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
    { id: 'all', label: 'All 7 Expressions' },
    { id: 'heritage', label: 'Heritage Palace' },
    { id: 'traditional', label: 'Traditional Sacred' },
    { id: 'royal', label: 'Royal Lakefront' },
    { id: 'contemporary', label: 'Contemporary Editorial' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? ROYAL_7_TEMPLATES
    : ROYAL_7_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 font-hanken">
      {/* 🏰 Royal Atelier Introduction */}
      <section className="text-center space-y-3 max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7F0DD] border border-[#D8C7AA] text-[#6B1420] text-xs font-mono font-bold uppercase tracking-widest shadow-xs">
          <RoyalCrestIcon className="w-4 h-4 text-[#A67C3D]" />
          <span>Shahi Atelier Collection</span>
        </div>

        <h2 className="font-fraunces font-bold text-2xl sm:text-4xl text-[#6B1420] tracking-tight">
          Choose the invitation that will carry your celebration.
        </h2>

        <p className="text-xs sm:text-sm text-[#8B7358] font-fraunces italic">
          Seven royal expressions, one unforgettable beginning.
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
              className={`px-4 py-2 rounded-full text-xs font-fraunces font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#6B1420] text-[#F7F0DD] shadow-md scale-105'
                  : 'bg-[#FFFDF9] hover:bg-[#F7F0DD] border border-[#D8C7AA] text-[#8B7358] hover:text-[#6B1420]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 🎨 7 Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-7xl mx-auto px-4">
        {filteredTemplates.map((tpl) => {
          const isSelected = selectedTheme === tpl.slug;
          const isUnlocked = unlockedThemeIds.has(tpl.slug);
          const publishedInfo = publishedSitesMap[tpl.slug];
          const isLive = publishedInfo?.isPublished;
          const pkgInfo = OFFICIAL_PACKAGES[tpl.packageType];

          return (
            <div
              key={tpl.slug}
              className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between bg-[#FFFDF9] shadow-sm hover:shadow-xl relative group ${
                isSelected 
                  ? 'border-[#A67C3D] ring-2 ring-[#A67C3D]/30 shadow-md' 
                  : 'border-[#D8C7AA] hover:border-[#A67C3D]/80'
              }`}
            >
              {/* Preview Image Viewport with Hover Zoom */}
              <div className="relative aspect-16/10 overflow-hidden bg-neutral-950">
                <img
                  src={tpl.previewImg}
                  alt={tpl.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Floating Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  {/* Left: Unlocked / Live / Flagship Status */}
                  {isLive ? (
                    <span className="text-[10px] font-mono font-bold bg-[#3D6B4A] text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                      <Check className="w-3 h-3" /> LIVE KANKOTRI
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                      <Unlock className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : tpl.badge ? (
                    <span className="text-[10px] font-mono font-bold bg-[#7A1024] text-[#F7F0DD] px-2.5 py-1 rounded-full shadow-md border border-[#D4AF37]">
                      ★ {tpl.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-[#F7F0DD] px-2.5 py-1 rounded-full border border-white/20">
                      🔒 LOCKED
                    </span>
                  )}

                  {/* Right: Category Tag */}
                  <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-[#F7F0DD] px-2.5 py-0.5 rounded-md uppercase border border-white/20">
                    {tpl.categoryLabel}
                  </span>
                </div>

                {/* Quick Interactive Preview Hover Pill */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setPreviewThemeId(tpl.slug)}
                    className="px-4 py-2 rounded-full bg-[#FFFDF9]/95 text-[#6B1420] text-xs font-fraunces font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#A67C3D]" />
                    <span>Interactive 3D Preview</span>
                  </button>
                </div>
              </div>

              {/* Card Meta Details */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-fraunces font-bold text-lg text-[#6B1420]">
                      {tpl.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#A67C3D]">
                      ₹{tpl.priceInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-[#8B7358] font-fraunces leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                {/* Package Inclusion Strip */}
                <div className="pt-3 border-t border-[#D8C7AA]/60 flex items-center justify-between text-[11px] font-mono text-[#6B5A4A]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A67C3D]" />
                    <span>{tpl.packageType === 'gold' ? 'Shahi Gold Royal' : 'Shahi Silver'}</span>
                  </span>
                  <span className="text-[#3D6B4A] font-bold">
                    {tpl.packageType === 'gold' ? 'All 7 Themes' : 'Single Theme'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewThemeId(tpl.slug)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F7F0DD] border border-[#D8C7AA] text-xs font-fraunces font-bold text-[#6B1420] flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Preview ${tpl.name}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#A67C3D]" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>

                  {isLive ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTheme(tpl.slug);
                        if (publishedInfo?.url && onOpenLiveInvitation) {
                          onOpenLiveInvitation(publishedInfo.url);
                        } else if (onContinueEditing) {
                          onContinueEditing(tpl.slug);
                        }
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#3D6B4A] hover:bg-[#2F5238] text-white text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Live Kankotri</span>
                    </button>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTheme(tpl.slug);
                        if (onContinueEditing) onContinueEditing(tpl.slug);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#6B1420] hover:bg-[#4A0C14] text-[#F7F0DD] text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Open in Studio</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTheme(tpl.slug);
                        if (onUnlockTheme) onUnlockTheme(tpl.slug);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7A1024] via-[#8E182C] to-[#7A1024] hover:from-[#5A0C1B] hover:to-[#5A0C1B] text-[#F8F2E5] text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md border border-[#C89B2C]/60 hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#C89B2C]" />
                      <span>Unlock (₹{tpl.priceInr.toLocaleString('en-IN')})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
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
