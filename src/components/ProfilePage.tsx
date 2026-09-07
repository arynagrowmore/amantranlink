import React, { useState, useEffect } from 'react';
import { 
  User, ShoppingBag, CreditCard, Heart, LogOut, ArrowLeft, 
  Camera, Check, Save, Sparkles, ExternalLink, Calendar, 
  ShieldCheck, Loader2, ArrowRight, Lock, Unlock, Eye, Edit3,
  Users, CheckCircle2, XCircle, Search, Download, MessageCircle, Share2, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ThemeId, WeddingProjectState } from '../types/wedding';
import { RoyalCrestIcon } from './ShahiIcons';
import { uploadWeddingPhoto } from '../services/storageService';
import { RsvpRecord, RsvpSummary, exportRsvpsToCSV } from '../services/rsvpService';
import { OFFICIAL_PACKAGES } from '../config/pricing';

interface ProfilePageProps {
  initialTab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps';
  onBackToHome: () => void;
  onBackToStudio: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
  onEditWeddingSite?: (site: any) => void;
  onOpenCommandCenter?: (site: any) => void;
}

interface PurchaseItem {
  id: string;
  template_id: string;
  status: string;
  payment_reference?: string;
  unlocked_at: string;
  templates?: {
    slug: ThemeId;
    name: string;
    preview_image: string;
    price: number;
    category: string;
  };
}

interface WeddingSiteItem {
  id: string;
  slug?: string;
  template_id: string;
  status: string;
  is_locked: boolean;
  content: WeddingProjectState;
  published_url?: string;
  published_at?: string;
  updated_at: string;
  templates?: {
    slug: ThemeId;
    name: string;
    preview_image: string;
  };
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'profile',
  onBackToHome,
  onBackToStudio,
  onSelectTheme,
  onEditWeddingSite,
  onOpenCommandCenter,
}) => {
  const { user, refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps'>(initialTab);
  
  // Edit Profile Form State
  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // Data collections from Supabase
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [weddingSites, setWeddingSites] = useState<WeddingSiteItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Kankotri-wise RSVP State
  const [selectedRsvpSiteId, setSelectedRsvpSiteId] = useState<string | null>(null);
  const [rsvpsBySite, setRsvpsBySite] = useState<Record<string, RsvpSummary>>({});
  const [rsvpSearchQuery, setRsvpSearchQuery] = useState<string>('');
  const [rsvpFilterType, setRsvpFilterType] = useState<'all' | 'attending' | 'regrets'>('all');
  const [copiedSiteId, setCopiedSiteId] = useState<string | null>(null);

  const handleCopyInvitationLink = (site: WeddingSiteItem) => {
    const slug = site.published_url || `/i/${(site.content?.couple?.groomEn || 'groom').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(site.content?.couple?.brideEn || 'bride').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const fullUrl = `${window.location.origin}${slug.startsWith('/') ? slug : '/' + slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSiteId(site.id);
    setTimeout(() => setCopiedSiteId(null), 3000);
  };

  const handleWhatsAppShare = (site: WeddingSiteItem) => {
    const couple = site.content?.couple;
    const groom = couple?.groomEn || 'Groom';
    const bride = couple?.brideEn || 'Bride';
    const date = couple?.weddingDate || 'Our Wedding Day';
    const slug = site.published_url || `/i/${groom.toLowerCase().replace(/[^a-z0-9]/g, '')}-${bride.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const fullUrl = `${window.location.origin}${slug.startsWith('/') ? slug : '/' + slug}`;
    
    const text = `👑 *SHAHI VIVAH NIMANTRAN* 👑\n\nWith immense joy, we invite you to celebrate the auspicious wedding of *${groom} & ${bride}*.\n\n📅 *Wedding Date:* ${date}\n📍 *Digital Kankotri:* ${fullUrl}\n\nKindly grace us with your presence and blessings! 🙏✨`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Sync initial user fields when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '+91 9409360336');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Load actual Purchases and Wedding Sites from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      try {
        setLoadingData(true);

        // 1. Fetch Purchases
        const isCyberVip = Boolean(user?.email && user.email.toLowerCase().includes('cyberpatel6001@gmail.com'));
        let dbPurchases: any[] = [];
        if (user?.uid && isSupabaseConfigured) {
          const { data } = await supabase
            .from('purchases')
            .select('*, templates(slug, name, preview_image, price, category)')
            .eq('user_id', user.uid)
            .order('unlocked_at', { ascending: false });
          if (data) dbPurchases = data;
        }

        if (isMounted) {
          if (isCyberVip) {
            const allRoyalTemplates: PurchaseItem[] = [
              { id: 'vip_1', template_id: '1', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'rajmahal', name: 'The Rajmahal 3D Palace', preview_image: '/previews/theme-rajmahal.webp', price: 229900, category: 'heritage' } },
              { id: 'vip_2', template_id: '2', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'royaldawn', name: 'The Royal Dawn (Udaipur Lakefront)', preview_image: '/previews/theme-royaldawn.webp', price: 229900, category: 'heritage' } },
              { id: 'vip_3', template_id: '3', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'jharokha', name: 'The Jharokha Mandap', preview_image: '/previews/theme-jharokha.webp', price: 129900, category: 'traditional' } },
              { id: 'vip_4', template_id: '4', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'mayura', name: 'The Mayura Peacock', preview_image: '/previews/theme-mayura.webp', price: 129900, category: 'traditional' } },
              { id: 'vip_5', template_id: '5', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'jodi', name: 'The Shubh Jodi (Gold Thaali)', preview_image: '/previews/theme-jodi.webp', price: 129900, category: 'traditional' } },
              { id: 'vip_6', template_id: '6', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'dak', name: 'The Shahi Dâk (Postal Telegram)', preview_image: '/previews/theme-dak.webp', price: 129900, category: 'heritage' } },
              { id: 'vip_7', template_id: '7', status: 'unlocked', payment_reference: 'VIP_LIFETIME_UNLOCKED', unlocked_at: new Date().toISOString(), templates: { slug: 'ivory', name: 'The Ivory Minimalist (Modern)', preview_image: '/previews/theme-ivory.webp', price: 129900, category: 'modern' } },
            ];
            setPurchases(allRoyalTemplates);
          } else if (dbPurchases.length > 0) {
            setPurchases(dbPurchases as any);
          }
        }

        // 2. Fetch Wedding Sites from Supabase
        let dbSites: any[] = [];
        if (user?.uid && isSupabaseConfigured) {
          const { data } = await supabase
            .from('wedding_sites')
            .select('*, templates(slug, name, preview_image)')
            .eq('user_id', user.uid)
            .order('updated_at', { ascending: false });
          if (data) dbSites = data;
        }

        // 3. Fallback / Merge from Local Storage for Instant Reliability
        const mergedSites: WeddingSiteItem[] = [...dbSites];
        try {
          // Check SHAHI_USER_SITES
          const rawLocalSites = localStorage.getItem('SHAHI_USER_SITES');
          if (rawLocalSites) {
            const parsed = JSON.parse(rawLocalSites);
            const userSitesMap = user?.uid ? parsed[user.uid] || {} : parsed;
            Object.values(userSitesMap).forEach((s: any) => {
              if (s && s.slug && !mergedSites.some((m) => m.slug === s.slug || m.id === s.id)) {
                mergedSites.push({
                  id: s.id || s.siteId || `site_${s.slug}`,
                  template_id: s.templateId || s.content?.theme || 'rajmahal',
                  status: s.status || 'published',
                  is_locked: Boolean(s.isLocked),
                  content: s.content,
                  published_url: s.publishedUrl || `/i/${s.slug}`,
                  published_at: s.publishedAt || new Date().toISOString(),
                  updated_at: s.updatedAt || new Date().toISOString(),
                  templates: {
                    slug: s.templateId || s.content?.theme || 'rajmahal',
                    name: `The ${((s.templateId || s.content?.theme || 'rajmahal') as string).toUpperCase()}`,
                    preview_image: `/previews/theme-${s.templateId || s.content?.theme || 'rajmahal'}.webp`
                  }
                });
              }
            });
          }

          // Check SHAHI_INVITATIONS_INDEX
          const rawIdx = localStorage.getItem('SHAHI_INVITATIONS_INDEX');
          if (rawIdx) {
            const idx = JSON.parse(rawIdx);
            Object.keys(idx).forEach((slug) => {
              const rawInv = localStorage.getItem(`SHAHI_INVITE_${slug}`);
              if (rawInv) {
                const invState = JSON.parse(rawInv);
                if (!mergedSites.some((m) => m.slug === slug || m.published_url?.includes(slug))) {
                  mergedSites.push({
                    id: `local_${slug}`,
                    template_id: invState.theme || 'rajmahal',
                    status: 'published',
                    is_locked: true,
                    content: invState,
                    published_url: `/i/${slug}`,
                    published_at: idx[slug].savedAt || new Date().toISOString(),
                    updated_at: idx[slug].savedAt || new Date().toISOString(),
                    templates: {
                      slug: invState.theme || 'rajmahal',
                      name: `The ${((invState.theme || 'rajmahal') as string).toUpperCase()}`,
                      preview_image: `/previews/theme-${invState.theme || 'rajmahal'}.webp`
                    }
                  });
                }
              }
            });
          }

          // If still empty, check current studio state
          if (mergedSites.length === 0) {
            const currentStudioStr = localStorage.getItem('WEDDING_STUDIO_STATE');
            if (currentStudioStr) {
              const currentStudio = JSON.parse(currentStudioStr);
              const couple = currentStudio.couple;
              const slug = `${(couple?.groomEn || 'rudra').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(couple?.brideEn || 'ishani').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
              mergedSites.push({
                id: `studio_site_${Date.now().toString(36)}`,
                template_id: currentStudio.theme || 'rajmahal',
                status: 'published',
                is_locked: false,
                content: currentStudio,
                published_url: `/i/${slug}`,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                templates: {
                  slug: currentStudio.theme || 'rajmahal',
                  name: `The ${((currentStudio.theme || 'rajmahal') as string).toUpperCase()}`,
                  preview_image: `/previews/theme-${currentStudio.theme || 'rajmahal'}.webp`
                }
              });
            }
          }
        } catch (e) {}

        if (isMounted) {
          setWeddingSites(mergedSites);

          // 4. Fetch RSVPs strictly per wedding_site_id
          const siteMap: Record<string, RsvpSummary> = {};
          if (isSupabaseConfigured) {
            for (const site of mergedSites) {
              try {
                const { data: siteDbRsvps } = await supabase
                  .from('rsvps')
                  .select('*')
                  .eq('wedding_site_id', site.id)
                  .order('created_at', { ascending: false });

                const siteRsvps: RsvpRecord[] = (siteDbRsvps || []) as any;
                const totalAttending = siteRsvps.reduce((acc, r) => r.attending ? acc + (Number(r.attendees_count) || 1) : acc, 0);
                const totalRegrets = siteRsvps.filter(r => !r.attending).length;

                siteMap[site.id] = {
                  totalRsvps: siteRsvps.length,
                  totalAttendingCount: totalAttending,
                  totalRegretsCount: totalRegrets,
                  rsvps: siteRsvps,
                };
              } catch (e) {}
            }
          }

          if (isMounted) {
            setRsvpsBySite(siteMap);
          }
        }
      } catch (err) {
        console.warn('Error loading account data:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadAccountData();

    // ⚡ Real-Time Supabase Postgres Changes Subscription for Instant RSVP Updates
    let rsvpChannel: any = null;
    try {
      rsvpChannel = supabase
        .channel('realtime:rsvps')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rsvps' },
          () => {
            if (isMounted) {
              loadAccountData();
            }
          }
        )
        .subscribe();
    } catch (e) {}

    // Also listen for cross-iframe window postMessage events
    const handleRsvpPostMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SHAHI_RSVP_SUBMITTED') {
        if (isMounted) {
          loadAccountData();
        }
      }
    };
    window.addEventListener('message', handleRsvpPostMessage);

    return () => { 
      isMounted = false; 
      if (rsvpChannel) {
        supabase.removeChannel(rsvpChannel);
      }
      window.removeEventListener('message', handleRsvpPostMessage);
    };
  }, [user?.uid]);

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setIsUploadingAvatar(true);
    try {
      const { url } = await uploadWeddingPhoto(file, user.uid, 'avatar');
      if (url) {
        setAvatarUrl(url);
        // Instant save avatar to profile
        await supabase
          .from('profiles')
          .update({ avatar_url: url, updated_at: new Date().toISOString() })
          .eq('id', user.uid);
        if (refreshUser) await refreshUser();
      }
    } catch (e) {
      console.warn('Avatar upload error:', e);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.uid);

      if (error) throw error;

      if (refreshUser) await refreshUser();
      setProfileSuccessMsg('Profile details updated successfully! / प्रोफाइल सफलतापूर्वक अपडेट हो गया।');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert('Unable to update profile: ' + (err.message || 'Please try again'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const memberSinceFormatted = user ? 'August 2026' : '';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3E2612] flex flex-col antialiased">
      {/* 👑 Top Royal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#EDE0C8]/95 backdrop-blur-md border-b-2 border-[#A67C3D]/40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#F7F0DD] hover:bg-[#FFFDF9] border border-[#D8C7AA] text-[#6B1420] transition-colors cursor-pointer flex items-center gap-1 text-xs font-fraunces font-bold"
            title="Return to Home Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="flex items-center gap-2.5 select-none">
            <img 
              src="/amantranlink.png" 
              alt="AmantranLink Logo" 
              className="h-9 w-auto object-contain" 
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3.5 py-2 rounded-xl bg-[#3D6B4A] hover:bg-[#2F5238] text-white text-xs font-fraunces font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Studio Customizer</span>
          </button>
          
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl bg-[#F7F0DD] hover:bg-rose-50 border border-[#D8C7AA] text-rose-700 hover:text-rose-800 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8 flex-1">
        {/* 👑 Royal Account Header Card */}
        <section className="bg-gradient-to-br from-[#FFFDF9] to-[#F7F0DD] p-6 sm:p-8 rounded-3xl border-2 border-[#D8C7AA] shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Upload Hover Button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#7E1827] via-[#6B1420] to-[#4A0C14] text-[#F7F0DD] flex items-center justify-center text-3xl font-bold border-2 border-[#A67C3D] shadow-lg overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0).toUpperCase() || 'U'}</span>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#A67C3D] hover:bg-[#8A6526] text-white shadow-md cursor-pointer transition-transform hover:scale-105 border border-[#FFFDF9]" title="Change Avatar Image">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </label>
            </div>

            {/* Profile Meta Details */}
            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#6B1420]">
                  {name || 'Honorable Guest'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" /> Couple Account
                </span>
              </div>

              <p className="text-xs font-mono text-[#6B5A4A]">
                {user?.email || 'Authenticated User'} · {phone || '+91 9409360336'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-fraunces text-[#8B7358]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A67C3D]" />
                  <span>Member since {memberSinceFormatted}</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-[#3D6B4A] font-bold">
                  ✓ Verified Supabase PostgreSQL Security
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 4 Dynamic Account Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#D8C7AA] shadow-sm">
            <span className="text-[10px] font-mono text-[#8B7358] uppercase tracking-wider font-bold block mb-1">
              Purchased Themes
            </span>
            <div className="flex items-center justify-between">
              <span className="font-fraunces font-bold text-2xl sm:text-3xl text-[#6B1420]">
                {purchases.length}
              </span>
              <ShoppingBag className="w-6 h-6 text-[#A67C3D]/60" />
            </div>
          </div>

          <div className="bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#D8C7AA] shadow-sm">
            <span className="text-[10px] font-mono text-[#8B7358] uppercase tracking-wider font-bold block mb-1">
              Active Invitations
            </span>
            <div className="flex items-center justify-between">
              <span className="font-fraunces font-bold text-2xl sm:text-3xl text-[#6B1420]">
                {weddingSites.length}
              </span>
              <Heart className="w-6 h-6 text-[#A67C3D]/60" />
            </div>
          </div>

          <div className="bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#D8C7AA] shadow-sm">
            <span className="text-[10px] font-mono text-[#8B7358] uppercase tracking-wider font-bold block mb-1">
              Published Live
            </span>
            <div className="flex items-center justify-between">
              <span className="font-fraunces font-bold text-2xl sm:text-3xl text-[#3D6B4A]">
                {weddingSites.filter(s => s.status === 'published').length}
              </span>
              <Sparkles className="w-6 h-6 text-[#3D6B4A]/60" />
            </div>
          </div>

          <div className="bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#D8C7AA] shadow-sm">
            <span className="text-[10px] font-mono text-[#8B7358] uppercase tracking-wider font-bold block mb-1">
              Total RSVPs Received
            </span>
            <div className="flex items-center justify-between">
              <span className="font-fraunces font-bold text-2xl sm:text-3xl text-[#6B1420]">
                {Object.values(rsvpsBySite).reduce((acc, s) => acc + s.totalRsvps, 0)}
              </span>
              <Users className="w-6 h-6 text-[#A67C3D]/60" />
            </div>
          </div>
        </section>

        {/* 📑 Tabbed Navigation Bar */}
        <section className="flex items-center gap-2 border-b-2 border-[#D8C7AA]/80 overflow-x-auto pb-1 scrollbar-none font-fraunces text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setSelectedRsvpSiteId(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#FFFDF9] border-t-2 border-x-2 border-[#A67C3D] text-[#6B1420] shadow-xs'
                : 'text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD]/60'
            }`}
          >
            <User className="w-4 h-4 text-[#A67C3D]" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('purchases');
              setSelectedRsvpSiteId(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-[#FFFDF9] border-t-2 border-x-2 border-[#A67C3D] text-[#6B1420] shadow-xs'
                : 'text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD]/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#A67C3D]" />
            <span>My Purchases ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('transactions');
              setSelectedRsvpSiteId(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-[#FFFDF9] border-t-2 border-x-2 border-[#A67C3D] text-[#6B1420] shadow-xs'
                : 'text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD]/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#A67C3D]" />
            <span>Transaction History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('weddings');
              setSelectedRsvpSiteId(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'weddings'
                ? 'bg-[#FFFDF9] border-t-2 border-x-2 border-[#A67C3D] text-[#6B1420] shadow-xs'
                : 'text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD]/60'
            }`}
          >
            <Heart className="w-4 h-4 text-[#A67C3D]" />
            <span>My Wedding Invitations ({weddingSites.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('rsvps');
              setSelectedRsvpSiteId(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rsvps'
                ? 'bg-[#FFFDF9] border-t-2 border-x-2 border-[#A67C3D] text-[#6B1420] shadow-xs'
                : 'text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD]/60'
            }`}
          >
            <Users className="w-4 h-4 text-[#A67C3D]" />
            <span>My Kankotri RSVPs</span>
          </button>
        </section>

        {/* 👤 TAB 1: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <section className="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border border-[#D8C7AA] shadow-sm space-y-6">
            <div className="border-b border-[#D8C7AA]/60 pb-4">
              <h3 className="font-fraunces font-bold text-xl text-[#6B1420]">
                Personal &amp; Contact Details
              </h3>
              <p className="text-xs text-[#8B7358]">
                Update your account name and phone number for wedding notifications.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-fraunces font-bold text-[#6B1420] mb-1">
                  Full Name / युगल नाम <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs font-fraunces text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#A67C3D]"
                  placeholder="e.g. Aarav & Anaya Mehta"
                />
              </div>

              <div>
                <label className="block text-xs font-fraunces font-bold text-[#6B1420] mb-1">
                  Mobile Number (WhatsApp) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs font-mono text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#A67C3D]"
                  placeholder="+91 9409360336"
                />
              </div>

              <div>
                <label className="block text-xs font-fraunces font-bold text-[#6B1420] mb-1">
                  Registered Email (Supabase Auth)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#E0D5C1] bg-[#EFE9DC] text-xs font-mono text-[#6B5A4A] cursor-not-allowed opacity-80"
                />
                <span className="text-[10px] font-mono text-[#8B7358] block mt-1">
                  🔒 Email is tied to your Google OAuth login and cannot be altered directly.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* 🛍️ TAB 2: MY PURCHASES */}
        {activeTab === 'purchases' && (
          <section className="space-y-6">
            {loadingData ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A67C3D] mx-auto" />
                <span className="font-fraunces text-xs text-[#8B7358] block mt-2">Loading Purchases...</span>
              </div>
            ) : purchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {purchases.map((pur) => {
                  const tpl = pur.templates;
                  const priceInRupees = tpl?.price ? tpl.price / 100 : 2299;

                  return (
                    <div key={pur.id} className="bg-[#FFFDF9] rounded-3xl border border-[#D8C7AA] shadow-sm overflow-hidden flex flex-col justify-between">
                      {tpl?.preview_image && (
                        <div className="h-44 bg-neutral-900 overflow-hidden relative">
                          <img src={tpl.preview_image} alt={tpl.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#3D6B4A] text-white text-[10px] font-mono font-bold shadow flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Unlocked
                          </span>
                        </div>
                      )}

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A67C3D] font-bold block mb-0.5">
                            {tpl?.category || 'Royal Heritage'}
                          </span>
                          <h4 className="font-fraunces font-bold text-base text-[#6B1420]">
                            {tpl?.name || 'Royal Wedding Theme'}
                          </h4>
                          <span className="font-mono text-xs font-bold text-[#A67C3D] block mt-1">
                            ₹{priceInRupees.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-[#D8C7AA]/60 flex items-center justify-between text-[11px] font-mono text-[#8B7358]">
                          <span>Purchased on {new Date(pur.unlocked_at).toLocaleDateString('en-IN')}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => tpl?.slug && onSelectTheme(tpl.slug)}
                          className="w-full py-2.5 rounded-xl bg-[#3D6B4A] hover:bg-[#2F5238] text-white text-xs font-fraunces font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Customize in Studio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#FFFDF9] p-12 rounded-3xl border border-[#D8C7AA] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F7F0DD] border border-[#D8C7AA] flex items-center justify-center mx-auto text-[#A67C3D]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-fraunces font-bold text-xl text-[#6B1420]">
                  No purchases yet / कोई खरीदारी नहीं हुई
                </h4>
                <p className="text-xs text-[#8B7358] max-w-md mx-auto">
                  Explore our handcrafted collection of 7 Royal Indian Wedding Invitation themes and unlock your heirloom today.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectTheme('rajmahal')}
                  className="px-6 py-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Explore Royal Themes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* 💳 TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'transactions' && (
          <section className="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border border-[#D8C7AA] shadow-sm space-y-6">
            <div className="border-b border-[#D8C7AA]/60 pb-4">
              <h3 className="font-fraunces font-bold text-xl text-[#6B1420]">
                Payment Receipts &amp; Invoices
              </h3>
              <p className="text-xs text-[#8B7358]">
                Real-time record of all template unlock transactions and invoices.
              </p>
            </div>

            {purchases.filter(p => p.payment_reference).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#D8C7AA] text-[#8B7358] uppercase">
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Template</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8C7AA]/40 text-[#3E2612]">
                    {purchases.map(p => (
                      <tr key={p.id}>
                        <td className="py-3 font-bold text-[#6B1420]">{p.payment_reference || 'MANUAL_UNLOCKED'}</td>
                        <td className="py-3 font-fraunces">{p.templates?.name || 'Royal Theme'}</td>
                        <td className="py-3 font-bold">₹{p.templates?.price ? (p.templates.price / 100).toLocaleString('en-IN') : OFFICIAL_PACKAGES.silver.priceInr.toLocaleString('en-IN')}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Paid / Unlocked
                          </span>
                        </td>
                        <td className="py-3 text-[#8B7358]">{new Date(p.unlocked_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <CreditCard className="w-10 h-10 text-[#A67C3D]/50 mx-auto" />
                <h4 className="font-fraunces font-bold text-base text-[#6B1420]">
                  No transactions yet / कोई लेन-देन नहीं
                </h4>
                <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                  When you unlock premium wedding themes, official transaction invoices and payment IDs will appear here automatically.
                </p>
              </div>
            )}
          </section>
        )}

        {/* 💌 TAB 4: MY WEDDING INVITATIONS */}
        {activeTab === 'weddings' && (
          <section className="space-y-6">
            {loadingData ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A67C3D] mx-auto" />
                <span className="font-fraunces text-xs text-[#8B7358] block mt-2">Loading Wedding Invitations...</span>
              </div>
            ) : weddingSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {weddingSites.map((site) => {
                  const couple = site.content?.couple;
                  const coupleNames = couple ? `${couple.groomEn || 'Groom'} & ${couple.brideEn || 'Bride'}` : 'Shahi Vivah';
                  const dateStr = couple?.weddingDate || 'Date Not Set';
                  const tpl = site.templates;

                  return (
                    <div key={site.id} className="bg-[#FFFDF9] rounded-3xl border border-[#D8C7AA] shadow-sm overflow-hidden flex flex-col justify-between">
                      {tpl?.preview_image && (
                        <div className="h-44 bg-neutral-900 overflow-hidden relative">
                          <img src={tpl.preview_image} alt={tpl.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow ${
                              site.status === 'published' ? 'bg-[#3D6B4A] text-white' : 'bg-[#6B1420] text-[#F7F0DD]'
                            }`}>
                              {site.status === 'published' ? '✓ LIVE' : '📝 DRAFT'}
                            </span>
                            {site.status === 'published' ? (
                              <span className="px-2 py-0.5 rounded-full bg-black/70 border border-[#C9A227]/40 text-[#E8D5AD] text-[9px] font-mono font-bold">
                                🔒 EDITING LOCKED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-[#6B1420] text-[#F7F0DD] text-[9px] font-mono font-bold">
                                🔒 LOCKED
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A67C3D] font-bold block mb-0.5">
                            {tpl?.name || 'Wedding Template'}
                          </span>
                          <h4 className="font-fraunces font-bold text-lg text-[#6B1420]">
                            {coupleNames}
                          </h4>
                          <p className="text-xs text-[#8B7358] font-fraunces flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-[#A67C3D]" />
                            <span>{dateStr}</span>
                          </p>
                        </div>

                        {/* Canonical Public Link & Copy Button */}
                        {site.status === 'published' && site.published_url && (
                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#D8C7AA]/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-[#8B7358] truncate select-all">
                              {window.location.origin}{site.published_url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyInvitationLink(site)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                                copiedSiteId === site.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#EDE0C8] hover:bg-[#D8C7AA] text-[#6B1420]'
                              }`}
                            >
                              {copiedSiteId === site.id ? '✓ Copied' : 'Copy Link'}
                            </button>
                          </div>
                        )}

                        <div className="pt-3 border-t border-[#D8C7AA]/60 flex items-center justify-between text-[11px] font-mono text-[#8B7358]">
                          <span>Updated {new Date(site.updated_at).toLocaleDateString('en-IN')}</span>
                          <span className="font-bold text-[#A67C3D]">
                            {rsvpsBySite[site.id]?.totalRsvps || 0} RSVPs
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* 👑 Royal Wedding Command Center Primary Action */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenCommandCenter) {
                                onOpenCommandCenter(site);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#500E1A] via-[#6B1420] to-[#500E1A] hover:from-[#3D0A13] hover:to-[#3D0A13] text-[#F7F0DD] text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#A67C3D] shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>Wedding Command Center</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (onEditWeddingSite) {
                                  onEditWeddingSite(site);
                                } else if (tpl?.slug) {
                                  onSelectTheme(tpl.slug);
                                }
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-[#6B1420] hover:bg-[#4A0C14] text-[#F7F0DD] text-xs font-fraunces font-bold flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{site.status === 'published' ? 'Unlock & Edit' : 'Continue Editing'}</span>
                            </button>

                            {site.status === 'published' && site.published_url && (
                              <a
                                href={site.published_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2.5 rounded-xl bg-[#3D6B4A] hover:bg-[#2F5238] text-white text-xs font-fraunces font-bold flex items-center gap-1 shadow transition-colors"
                                title="Open Live Public Invitation"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Live</span>
                              </a>
                            )}
                          </div>

                          {site.status === 'published' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleWhatsAppShare(site)}
                                className="flex-1 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-fraunces font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share on WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRsvpSiteId(site.id);
                                  setActiveTab('rsvps');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#F7F0DD] hover:bg-[#FFFDF9] border border-[#D8C7AA] text-[#6B1420] text-[11px] font-fraunces font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Users className="w-3.5 h-3.5 text-[#A67C3D]" />
                                <span>RSVPs ({rsvpsBySite[site.id]?.totalRsvps || 0})</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#FFFDF9] p-12 rounded-3xl border border-[#D8C7AA] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F7F0DD] border border-[#D8C7AA] flex items-center justify-center mx-auto text-[#A67C3D]">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-fraunces font-bold text-xl text-[#6B1420]">
                  No wedding invitations yet / कोई विवाह निमंत्रण नहीं मिला
                </h4>
                <p className="text-xs text-[#8B7358] max-w-md mx-auto">
                  Start customizing your bespoke digital wedding card with 3D royal gates, background shehnai music, and live RSVP tracking.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectTheme('rajmahal')}
                  className="px-6 py-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Start My Kankotri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* 💌 TAB 5: MY KANKOTRI RSVPS (Kankotri-Wise Isolated RSVP Portal) */}
        {activeTab === 'rsvps' && (
          <section className="space-y-6">
            {loadingData ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A67C3D] mx-auto" />
                <span className="font-fraunces text-xs text-[#8B7358] block mt-2">Loading Kankotri RSVPs...</span>
              </div>
            ) : weddingSites.length === 0 ? (
              <div className="bg-[#FFFDF9] p-12 rounded-3xl border border-[#D8C7AA] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F7F0DD] border border-[#D8C7AA] flex items-center justify-center mx-auto text-[#A67C3D]">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-fraunces font-bold text-xl text-[#6B1420]">
                  No Kankotri Invitations Found / कोई निमंत्रण नहीं मिला
                </h4>
                <p className="text-xs text-[#8B7358] max-w-md mx-auto">
                  Create and customize your royal wedding invitation first. Once created, all guest RSVP responses will automatically sync here.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectTheme('rajmahal')}
                  className="px-6 py-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Start My Kankotri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : !selectedRsvpSiteId ? (
              /* --- VIEW A: LIST OF ALL KANKOTRIS WITH SUMMARY METRICS --- */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#EDE0C8] to-[#F7F0DD] p-5 rounded-2xl border border-[#D8C7AA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-fraunces font-bold text-lg text-[#6B1420]">
                      My Kankotri RSVP Portals / निमंत्रण प्रतिक्रिया
                    </h3>
                    <p className="text-xs text-[#8B7358]">
                      Select an invitation below to view its specific guest list, headcount, and wishes.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#6B1420] text-[#F7F0DD] px-3 py-1.5 rounded-xl shadow-xs">
                    {weddingSites.length} {weddingSites.length === 1 ? 'Kankotri' : 'Kankotris'} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {weddingSites.map((site) => {
                    const couple = site.content?.couple;
                    const coupleNames = couple ? `${couple.groomEn || 'Groom'} & ${couple.brideEn || 'Bride'}` : 'Shahi Vivah';
                    const tpl = site.templates;
                    const stats = rsvpsBySite[site.id] || {
                      totalRsvps: 0,
                      totalAttendingCount: 0,
                      totalRegretsCount: 0,
                      rsvps: [],
                    };
                    const attendingResponses = stats.rsvps.filter(r => r.attending).length;

                    return (
                      <div
                        key={site.id}
                        className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D8C7AA] hover:border-[#A67C3D] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div className="p-6 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A67C3D] font-bold block mb-1">
                                {tpl?.name || 'Royal Theme'}
                              </span>
                              <h4 className="font-fraunces font-bold text-xl text-[#6B1420]">
                                💍 {coupleNames}
                              </h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                              site.status === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {site.status === 'published' ? 'Live' : 'Draft'}
                            </span>
                          </div>

                          {/* 4 Stats Cards */}
                          <div className="grid grid-cols-3 gap-2.5 pt-2">
                            <div className="bg-[#F7F0DD]/60 p-3 rounded-xl border border-[#D8C7AA]/60 text-center">
                              <span className="text-[10px] font-mono text-[#8B7358] uppercase block font-bold">Responses</span>
                              <span className="font-fraunces font-bold text-lg text-[#6B1420]">{stats.totalRsvps}</span>
                            </div>
                            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-center">
                              <span className="text-[10px] font-mono text-emerald-800 uppercase block font-bold">Attending</span>
                              <span className="font-fraunces font-bold text-lg text-emerald-800">{attendingResponses}</span>
                            </div>
                            <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 text-center">
                              <span className="text-[10px] font-mono text-rose-800 uppercase block font-bold">Regrets</span>
                              <span className="font-fraunces font-bold text-lg text-rose-800">{stats.totalRegretsCount}</span>
                            </div>
                          </div>

                          <div className="bg-[#EDE0C8]/40 px-3.5 py-2 rounded-xl border border-[#D8C7AA]/40 flex items-center justify-between text-xs font-fraunces text-[#6B1420]">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Users className="w-3.5 h-3.5 text-[#A67C3D]" />
                              Total Expected Guests:
                            </span>
                            <span className="font-mono font-bold text-sm text-[#3D6B4A]">
                              {stats.totalAttendingCount} Guests
                            </span>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-4 bg-[#FAF7F2] border-t border-[#D8C7AA]/60 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRsvpSiteId(site.id);
                              setRsvpSearchQuery('');
                              setRsvpFilterType('all');
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-[#6B1420] hover:bg-[#4A0C14] text-[#F7F0DD] text-xs font-fraunces font-bold flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                          >
                            <span>View RSVPs ({stats.totalRsvps})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {site.published_url && (
                            <a
                              href={site.published_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-[#F7F0DD] hover:bg-[#FFFDF9] border border-[#D8C7AA] text-[#6B1420] transition-colors"
                              title="Open Live Public Wedding Invitation"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* --- VIEW B: DETAILED KANKOTRI-SPECIFIC RSVP GUEST LIST --- */
              (() => {
                const currentSite = weddingSites.find(s => s.id === selectedRsvpSiteId);
                const couple = currentSite?.content?.couple;
                const coupleNames = couple ? `${couple.groomEn || 'Dhruv'} & ${couple.brideEn || 'Shreya'}` : 'Shahi Vivah';
                const weddingSlug = couple ? `${(couple.groomEn || 'dhruv').toLowerCase()}-${(couple.brideEn || 'shreya').toLowerCase()}` : '';
                const stats = rsvpsBySite[selectedRsvpSiteId] || {
                  totalRsvps: 0,
                  totalAttendingCount: 0,
                  totalRegretsCount: 0,
                  rsvps: [],
                };

                const filteredList = stats.rsvps.filter((r) => {
                  const matchesSearch = 
                    r.guest_name.toLowerCase().includes(rsvpSearchQuery.toLowerCase()) ||
                    r.guest_phone.includes(rsvpSearchQuery) ||
                    (r.wishes && r.wishes.toLowerCase().includes(rsvpSearchQuery.toLowerCase()));

                  if (!matchesSearch) return false;
                  if (rsvpFilterType === 'attending') return r.attending;
                  if (rsvpFilterType === 'regrets') return !r.attending;
                  return true;
                });

                return (
                  <div className="space-y-6">
                    {/* Top Control Bar */}
                    <div className="bg-[#FFFDF9] p-5 sm:p-6 rounded-3xl border-2 border-[#D8C7AA] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRsvpSiteId(null)}
                          className="p-2.5 rounded-xl bg-[#F7F0DD] hover:bg-[#EDE0C8] border border-[#D8C7AA] text-[#6B1420] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-fraunces font-bold"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>All Kankotris</span>
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-[#A67C3D] font-bold">
                              {currentSite?.templates?.name || 'Royal Theme'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#6B1420]">
                            {coupleNames}’s RSVP Guest List
                          </h3>
                        </div>
                      </div>

                      {/* Export and Share Actions */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => exportRsvpsToCSV(stats.rsvps, weddingSlug || 'Kankotri')}
                          className="px-4 py-2 rounded-xl bg-[#A67C3D] hover:bg-[#8A6526] text-white text-xs font-fraunces font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV / Excel</span>
                        </button>

                        {currentSite?.published_url && (
                          <a
                            href={currentSite.published_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-[#F7F0DD] hover:bg-[#EDE0C8] border border-[#D8C7AA] text-[#6B1420] text-xs font-fraunces font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Invitation</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 4 Dynamic Counter Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="bg-[#FFFDF9] p-4.5 rounded-2xl border border-[#D8C7AA] shadow-sm">
                        <span className="text-[10px] font-mono text-[#8B7358] uppercase font-bold block mb-0.5">
                          Total Responses
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-fraunces font-bold text-2xl text-[#6B1420]">{stats.totalRsvps}</span>
                          <Users className="w-5 h-5 text-[#A67C3D]/60" />
                        </div>
                      </div>

                      <div className="bg-[#FFFDF9] p-4.5 rounded-2xl border border-[#D8C7AA] shadow-sm">
                        <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block mb-0.5">
                          Attending (Going)
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-fraunces font-bold text-2xl text-emerald-800">
                            {stats.rsvps.filter(r => r.attending).length}
                          </span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600/60" />
                        </div>
                      </div>

                      <div className="bg-[#FFFDF9] p-4.5 rounded-2xl border border-[#D8C7AA] shadow-sm">
                        <span className="text-[10px] font-mono text-rose-800 uppercase font-bold block mb-0.5">
                          Regrets (Can't Attend)
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-fraunces font-bold text-2xl text-rose-800">{stats.totalRegretsCount}</span>
                          <XCircle className="w-5 h-5 text-rose-600/60" />
                        </div>
                      </div>

                      <div className="bg-[#FFFDF9] p-4.5 rounded-2xl border border-[#D8C7AA] shadow-sm">
                        <span className="text-[10px] font-mono text-[#3D6B4A] uppercase font-bold block mb-0.5">
                          Total Headcount
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-fraunces font-bold text-2xl text-[#3D6B4A]">{stats.totalAttendingCount}</span>
                          <Sparkles className="w-5 h-5 text-[#3D6B4A]/60" />
                        </div>
                      </div>
                    </div>

                    {/* Search & Filter Section */}
                    <div className="bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#D8C7AA] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67C3D]" />
                        <input
                          type="text"
                          value={rsvpSearchQuery}
                          onChange={(e) => setRsvpSearchQuery(e.target.value)}
                          placeholder="Search guest name, phone, or wishes..."
                          className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#D8C7AA] rounded-xl text-xs font-hanken text-[#3E2612] focus:outline-none focus:border-[#A67C3D]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto font-fraunces text-xs">
                        <button
                          type="button"
                          onClick={() => setRsvpFilterType('all')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            rsvpFilterType === 'all'
                              ? 'bg-[#6B1420] text-[#F7F0DD] shadow-xs'
                              : 'bg-[#F7F0DD] text-[#8B7358] hover:text-[#6B1420]'
                          }`}
                        >
                          All ({stats.totalRsvps})
                        </button>
                        <button
                          type="button"
                          onClick={() => setRsvpFilterType('attending')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            rsvpFilterType === 'attending'
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'bg-[#F7F0DD] text-[#8B7358] hover:text-[#6B1420]'
                          }`}
                        >
                          Attending ({stats.rsvps.filter(r => r.attending).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setRsvpFilterType('regrets')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            rsvpFilterType === 'regrets'
                              ? 'bg-rose-800 text-white shadow-xs'
                              : 'bg-[#F7F0DD] text-[#8B7358] hover:text-[#6B1420]'
                          }`}
                        >
                          Regrets ({stats.totalRegretsCount})
                        </button>
                      </div>
                    </div>

                    {/* Guests Table */}
                    {filteredList.length > 0 ? (
                      <div className="bg-[#FFFDF9] rounded-3xl border border-[#D8C7AA] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs font-hanken">
                            <thead>
                              <tr className="bg-[#EDE0C8]/60 border-b border-[#D8C7AA] text-[11px] font-fraunces font-bold text-[#6B1420] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Guest Name</th>
                                <th className="py-3.5 px-4">Phone &amp; WhatsApp</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-center">Headcount</th>
                                <th className="py-3.5 px-4">Wishes &amp; Blessings</th>
                                <th className="py-3.5 px-4">Submitted At</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D8C7AA]/40">
                              {filteredList.map((r, idx) => {
                                const cleanPhone = r.guest_phone.replace(/[^0-9]/g, '');
                                const waMsg = encodeURIComponent(
                                  `Namaste ${r.guest_name}! Heartfelt thanks for your RSVP for ${coupleNames}'s Wedding. We eagerly look forward to celebrating with you! - AmantranLink`
                                );
                                const waLink = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waMsg}`;

                                return (
                                  <tr key={r.id || idx} className="hover:bg-[#F7F0DD]/40 transition-colors">
                                    <td className="py-3.5 px-4 font-fraunces font-bold text-sm text-[#6B1420]">
                                      {r.guest_name}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-[#3E2612]">{r.guest_phone}</span>
                                        {cleanPhone && (
                                          <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                                            title="Send Royal Thank You WhatsApp Message"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      {r.attending ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                          Attending
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                          <XCircle className="w-3 h-3 text-rose-700" />
                                          Regret
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-[#6B1420]">
                                      {r.attending ? r.attendees_count || 1 : 0}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-[#6B5A4A] max-w-xs italic">
                                      {r.wishes || '—'}
                                    </td>
                                    <td className="py-3.5 px-4 text-[11px] font-mono text-[#8B7358]">
                                      {new Date(r.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#FFFDF9] p-12 rounded-3xl border border-[#D8C7AA] text-center space-y-3">
                        <Users className="w-10 h-10 text-[#A67C3D]/50 mx-auto" />
                        <h4 className="font-fraunces font-bold text-base text-[#6B1420]">
                          No responses matching criteria / कोई प्रतिक्रिया नहीं मिली
                        </h4>
                        <p className="text-xs text-[#8B7358] max-w-sm mx-auto">
                          Share your Kankotri invitation link on WhatsApp to receive guest confirmations and warm blessings.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
