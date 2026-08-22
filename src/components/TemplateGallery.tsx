import React, { useState, useEffect } from 'react';
import { Check, Lock, Unlock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { ThemeId, WeddingTheme } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface TemplateGalleryProps {
  selectedTheme?: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onContinueEditing?: (themeId: ThemeId) => void;
  onUnlockTheme?: (themeId: ThemeId) => void;
}

interface TemplateRecord {
  id: string;
  slug: ThemeId;
  name: string;
  preview_image: string;
  price: number; // in paise
  category: string;
}

const fallbackTemplates: TemplateRecord[] = [
  { id: '1', slug: 'rajmahal', name: 'The Rajmahal (3D Palace Gateway)', preview_image: '/previews/theme-rajmahal.webp', price: 229900, category: 'heritage' },
  { id: '2', slug: 'royaldawn', name: 'The Royal Dawn (Udaipur Lakefront & Scratch Card)', preview_image: '/previews/theme-royaldawn.webp', price: 229900, category: 'heritage' },
  { id: '3', slug: 'jharokha', name: 'The Jharokha (Rajasthani Marble Arch)', preview_image: '/previews/theme-jharokha.webp', price: 129900, category: 'traditional' },
  { id: '4', slug: 'mayura', name: 'The Mayura (Peacock Teal Plumage)', preview_image: '/previews/theme-mayura.webp', price: 129900, category: 'traditional' },
  { id: '5', slug: 'jodi', name: 'The Jodi (Festive Gold Thaali)', preview_image: '/previews/theme-jodi.webp', price: 129900, category: 'traditional' },
  { id: '6', slug: 'dak', name: 'The Shahi Dâk (Vintage Royal Postal Telegram)', preview_image: '/previews/theme-dak.webp', price: 129900, category: 'heritage' },
  { id: '7', slug: 'ivory', name: 'The Ivory Minimalist (Modern Editorial)', preview_image: '/previews/theme-ivory.webp', price: 129900, category: 'modern' },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTheme = 'rajmahal',
  onSelectTheme,
  onContinueEditing,
  onUnlockTheme,
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateRecord[]>(fallbackTemplates);
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<Set<string>>(new Set(['rajmahal']));
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch Templates & Purchases from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Fetch public templates
        const { data: dbTemplates, error: tErr } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: true });

        if (!tErr && dbTemplates && dbTemplates.length > 0 && isMounted) {
          setTemplates(dbTemplates as any);
        }

        // Fetch purchases for current logged in user
        if (user?.uid) {
          const { data: dbPurchases, error: pErr } = await supabase
            .from('purchases')
            .select('template_id, templates(slug)')
            .eq('user_id', user.uid)
            .eq('status', 'unlocked');

          if (!pErr && dbPurchases && isMounted) {
            const unlockedSet = new Set<string>();
            dbPurchases.forEach((p: any) => {
              if (p.templates?.slug) unlockedSet.add(p.templates.slug);
            });
            // If user has unlocked any, update state
            if (unlockedSet.size > 0) setUnlockedThemeIds(unlockedSet);
          }
        }
      } catch (err) {
        console.warn('Supabase template gallery sync note:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // 2. Unlock Button Placeholder (Payment trigger placeholder)
  const handleUnlockTemplate = (template: TemplateRecord) => {
    // TODO: Cashfree payment yahan trigger hoga
    console.log('// TODO: Cashfree payment yahan trigger hoga for template:', template.slug, template.price);
    alert(`// TODO: Cashfree payment yahan trigger hoga for ${template.name} (₹${(template.price / 100).toLocaleString('en-IN')})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces font-bold text-lg sm:text-xl text-[#6B1420]">
            Royal Wedding Template Collection
          </h3>
          <p className="text-xs text-[#6B5A4A] font-hanken mt-0.5">
            Select an invitation theme to customize or unlock
          </p>
        </div>

        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#A67C3D]" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => {
          const isSelected = selectedTheme === tpl.slug;
          const isUnlocked = unlockedThemeIds.has(tpl.slug);
          const priceInRupees = Math.round(tpl.price / 100);

          return (
            <div
              key={tpl.id || tpl.slug}
              className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between bg-[#F7F0DD] shadow-sm hover:shadow-lg relative group ${
                isSelected ? 'border-[#6B1420] ring-2 ring-[#6B1420]/30 scale-[1.01]' : 'border-[#D8C7AA] hover:border-[#A67C3D]'
              }`}
            >
              {/* Preview Image Container */}
              <div className="relative aspect-16/10 overflow-hidden bg-neutral-900">
                <img
                  src={tpl.preview_image}
                  alt={tpl.name}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    !isUnlocked ? 'filter blur-[1.5px] opacity-85' : ''
                  }`}
                />

                {/* Top Floating Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-[#6B1420] text-[#F7F0DD] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-[#A67C3D]">
                      <Lock className="w-3 h-3 text-[#D4AF37]" /> Locked Template
                    </span>
                  )}

                  <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-[#F7F0DD] px-2 py-0.5 rounded-md uppercase border border-white/20">
                    {tpl.category}
                  </span>
                </div>

                {/* Locked Preview Watermark Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#6B1420]/90 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-lg mb-1">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="font-fraunces font-bold text-xs text-[#F7F0DD] drop-shadow-md">
                      Preview Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Body Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-fraunces font-bold text-sm sm:text-base text-[#6B1420] leading-snug">
                    {tpl.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-[#A67C3D] block mt-1">
                    ₹{priceInRupees.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#D8C7AA]/60 flex items-center gap-2">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTheme(tpl.slug);
                        if (onContinueEditing) onContinueEditing(tpl.slug);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#3D6B4A] hover:bg-[#2F5238] text-white text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Continue Editing</span>
                    </button>
                  ) : (
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectTheme(tpl.slug)}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-50 border border-[#D8C7AA] text-xs font-fraunces font-bold text-[#6B1420] cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTheme(tpl.slug);
                          if (onUnlockTheme) {
                            onUnlockTheme(tpl.slug);
                          }
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay to Unlock (₹{priceInRupees.toLocaleString('en-IN')})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateGallery;
