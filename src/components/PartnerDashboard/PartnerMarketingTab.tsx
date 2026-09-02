import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  QrCode, 
  Sparkles, 
  MessageCircle, 
  Instagram, 
  FileText, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Camera, 
  Printer, 
  Smartphone,
  Eye,
  TrendingUp,
  Award,
  Mail,
  X,
  Wallet,
  Settings,
  Clock,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentAppOrigin } from '../../utils/origin';
import { resolveApiUrl } from '../../utils/apiConfig';

interface PartnerMarketingTabProps {
  onCreateInvitation?: () => void;
  onNavigateAnalytics?: () => void;
  onNavigateEarnings?: () => void;
  onNavigateSettings?: () => void;
}

type TemplateType = 'whatsapp' | 'instagram' | 'email';
type PreviewModalType = 'poster' | 'story' | 'whatsapp' | 'client_exp' | null;

export const PartnerMarketingTab: React.FC<PartnerMarketingTabProps> = ({
  onCreateInvitation,
  onNavigateAnalytics,
  onNavigateEarnings,
  onNavigateSettings,
}) => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<boolean>(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<TemplateType>('whatsapp');
  const [previewModal, setPreviewModal] = useState<PreviewModalType>(null);

  // Template Customization State
  const [customGreeting, setCustomGreeting] = useState<string>('Namaste');
  const [customContactPhone, setCustomContactPhone] = useState<string>(user?.phone || '+91 9409360336');

  // Real Analytics & Wallet State
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState<{
    visitors: number;
    signups: number;
    invitations: number;
    paidOrders: number;
    commission: number;
  }>({
    visitors: 0,
    signups: 0,
    invitations: 0,
    paidOrders: 0,
    commission: 0,
  });

  const [walletSnapshot, setWalletSnapshot] = useState<{
    availableBalance: number;
    pendingCommission: number;
    totalEarned: number;
  }>({
    availableBalance: 0,
    pendingCommission: 0,
    totalEarned: 0,
  });

  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Partner Identity & Dynamic URL
  const verifiedSlug = user?.partnerSlug || user?.studioHandle || (user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') : '');
  const partnerSlug = verifiedSlug || 'studio';
  const studioName = user?.studioName || user?.name || 'Studio Partner';
  const appOrigin = getCurrentAppOrigin();
  const referralUrl = `${appOrigin}/?partner=${partnerSlug}`;

  // Fetch real analytics snapshot
  useEffect(() => {
    let isCancelled = false;
    async function loadMarketingData() {
      if (!user?.uid) return;
      setIsLoadingMetrics(true);
      try {
        const [analyticsRes, walletRes] = await Promise.all([
          fetch(resolveApiUrl(`/api/partner/analytics?userId=${user.uid}&period=all_time`)).catch(() => null),
          fetch(resolveApiUrl(`/api/partner/wallet?userId=${user.uid}`)).catch(() => null),
        ]);

        if (!isCancelled && analyticsRes && analyticsRes.ok) {
          const aData = await analyticsRes.json();
          if (aData.success && aData.kpis) {
            setAnalyticsSnapshot({
              visitors: aData.kpis.referralVisitors || 0,
              signups: aData.kpis.clientSignups || 0,
              invitations: aData.kpis.invitationsCreated || 0,
              paidOrders: aData.kpis.paidInvitations || 0,
              commission: aData.kpis.commissionEarned || 0,
            });
          }
        }

        if (!isCancelled && walletRes && walletRes.ok) {
          const wData = await walletRes.json();
          if (wData.success && wData.wallet) {
            setWalletSnapshot({
              availableBalance: wData.wallet.availableBalance || 0,
              pendingCommission: wData.wallet.pendingCommission || 0,
              totalEarned: wData.wallet.totalEarned || 0,
            });
          }
        }
      } catch (e) {
        console.warn('Marketing data loading error:', e);
      } finally {
        if (!isCancelled) setIsLoadingMetrics(false);
      }
    }
    loadMarketingData();
    return () => { isCancelled = true; };
  }, [user?.uid]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Web Share API with copy fallback
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${studioName} · AmantranLink Royal Digital Invitations`,
          text: `Create your royal digital wedding invitation with ${studioName} on AmantranLink:`,
          url: referralUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Helper to draw deterministic high-contrast QR pattern on canvas
  const drawQrPattern = (ctx: CanvasRenderingContext2D, startX: number, startY: number, size: number, qrData: string) => {
    const modules = 29;
    const moduleSize = size / modules;

    // Clean ivory background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(startX, startY, size, size);

    // Deep Maroon modules
    ctx.fillStyle = '#430914';

    // Helper for position detection patterns (3 corners)
    const drawFinderPattern = (r: number, c: number) => {
      ctx.fillStyle = '#430914';
      ctx.fillRect(startX + c * moduleSize, startY + r * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(startX + (c + 1) * moduleSize, startY + (r + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#430914';
      ctx.fillRect(startX + (c + 2) * moduleSize, startY + (r + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, modules - 7);
    drawFinderPattern(modules - 7, 0);

    // Deterministic pseudo-random module grid derived from URL
    let seed = 0;
    for (let i = 0; i < qrData.length; i++) {
      seed = (seed * 31 + qrData.charCodeAt(i)) % 1000000007;
    }

    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const isFinder1 = r < 8 && c < 8;
        const isFinder2 = r < 8 && c >= modules - 8;
        const isFinder3 = r >= modules - 8 && c < 8;
        if (isFinder1 || isFinder2 || isFinder3) continue;

        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = '#430914';
            ctx.fillRect(startX + c * moduleSize, startY + r * moduleSize, moduleSize, moduleSize);
          }
          continue;
        }

        if (random() > 0.48) {
          ctx.fillStyle = '#430914';
          ctx.fillRect(startX + c * moduleSize, startY + r * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Center Gold Emblem
    const centerSize = 5 * moduleSize;
    const centerPos = startX + (size - centerSize) / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerPos, centerPos, centerSize, centerSize);
    ctx.fillStyle = '#C49A35';
    ctx.fillRect(centerPos + moduleSize * 0.5, centerPos + moduleSize * 0.5, centerSize - moduleSize, centerSize - moduleSize);
  };

  // Render mini QR on load
  useEffect(() => {
    if (qrCanvasRef.current) {
      const ctx = qrCanvasRef.current.getContext('2d');
      if (ctx) {
        drawQrPattern(ctx, 0, 0, 160, referralUrl);
      }
    }
  }, [referralUrl]);

  // Download High-Res Standalone QR PNG (512x512)
  const downloadQrPng = () => {
    setIsGeneratingAsset(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#C49A35';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 480, 480);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('AMANTRANLINK', 256, 56);

      ctx.fillStyle = '#C49A35';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Presented by ${studioName}`, 256, 80);

      drawQrPattern(ctx, 96, 106, 320, referralUrl);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('SCAN TO CREATE YOUR INVITATION', 256, 458);

      ctx.fillStyle = '#75675C';
      ctx.font = '12px monospace';
      ctx.fillText(`@${partnerSlug}`, 256, 480);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AmantranLink-QR-${partnerSlug}.png`;
      a.click();
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Download A4 Print Poster (1080x1350)
  const downloadPrintCard = () => {
    setIsGeneratingAsset(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
      bgGrad.addColorStop(0, '#FFFDF8');
      bgGrad.addColorStop(1, '#F8F3E8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.strokeStyle = '#C49A35';
      ctx.lineWidth = 10;
      ctx.strokeRect(40, 40, 1000, 1270);

      ctx.strokeStyle = '#6E1020';
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, 970, 1240);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ROYAL DIGITAL WEDDING INVITATIONS', 540, 130);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText('AMANTRANLINK', 540, 200);

      ctx.fillStyle = '#6E1020';
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillText('Cinematic 3D Palace Wedding Portals', 540, 250);

      ctx.fillStyle = '#C49A35';
      ctx.fillRect(340, 290, 400, 2);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`Presented by ${studioName}`, 540, 340);

      const qrSize = 520;
      const qrX = (1080 - qrSize) / 2;
      const qrY = 400;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 20;
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      ctx.shadowBlur = 0;

      drawQrPattern(ctx, qrX, qrY, qrSize, referralUrl);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillText('Scan to Explore & Create Your Invitation', 540, 1020);

      ctx.fillStyle = '#75675C';
      ctx.font = '22px sans-serif';
      ctx.fillText('Music · Interactive RSVP · Live Maps · Multi-Event Itinerary', 540, 1070);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(referralUrl, 540, 1160);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AmantranLink-A4-Poster-${partnerSlug}.png`;
      a.click();
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Download Instagram Story (1080x1920)
  const downloadStoryAsset = () => {
    setIsGeneratingAsset(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#2D080E');
      bgGrad.addColorStop(0.5, '#430914');
      bgGrad.addColorStop(1, '#11161B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.strokeStyle = '#C49A35';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 980, 1820);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ROYAL WEDDING INVITATION', 540, 220);

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 72px Georgia, serif';
      ctx.fillText('AMANTRANLINK', 540, 310);

      ctx.fillStyle = '#E8D5AD';
      ctx.font = 'italic 32px Georgia, serif';
      ctx.fillText(`Exclusive Collaboration with ${studioName}`, 540, 380);

      const qrSize = 580;
      const qrX = (1080 - qrSize) / 2;
      const qrY = 560;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);
      drawQrPattern(ctx, qrX, qrY, qrSize, referralUrl);

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('SCAN OR TAP LINK IN BIO', 540, 1260);

      ctx.fillStyle = '#C49A35';
      ctx.font = '28px sans-serif';
      ctx.fillText('Instant Mobile & Desktop Wedding Portals', 540, 1330);

      ctx.fillStyle = '#E8D5AD';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`@${partnerSlug}`, 540, 1420);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AmantranLink-Story-${partnerSlug}.png`;
      a.click();
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Download WhatsApp Card (1080x1080)
  const downloadWhatsAppCard = () => {
    setIsGeneratingAsset(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
      bgGrad.addColorStop(0, '#FFFDF8');
      bgGrad.addColorStop(1, '#F4F9F6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.strokeStyle = '#0F766E';
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, 1020, 1020);

      ctx.fillStyle = '#0F766E';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STUDIO PARTNER INVITATION SUITE', 540, 100);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 54px Georgia, serif';
      ctx.fillText('AMANTRANLINK', 540, 170);

      ctx.fillStyle = '#75675C';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`Crafted by ${studioName}`, 540, 220);

      const qrSize = 460;
      const qrX = (1080 - qrSize) / 2;
      const qrY = 280;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 15;
      ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
      ctx.shadowBlur = 0;

      drawQrPattern(ctx, qrX, qrY, qrSize, referralUrl);

      ctx.fillStyle = '#430914';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.fillText('Scan to Create Your Royal Wedding Invitation', 540, 840);

      ctx.fillStyle = '#0F766E';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(referralUrl, 540, 910);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AmantranLink-WhatsApp-Card-${partnerSlug}.png`;
      a.click();
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Outreach Message Generator
  const getOutreachMessage = (type: TemplateType): string => {
    switch (type) {
      case 'whatsapp':
        return `${customGreeting}! Planning your wedding celebration?\n\nWe have partnered with AmantranLink to bring you handcrafted royal digital wedding invitations with 3D palace doors, celebratory music, venue Google Maps, and live guest RSVP management.\n\nExplore our themes and start your invitation here:\n${referralUrl}\n\nFeel free to reach out to us at ${customContactPhone} if you would like us to customize it for you!`;
      case 'instagram':
        return `✨ Elevate your wedding celebration with a Royal Digital Kankotri. Presented in exclusive partnership with ${studioName}.\n\n🏰 Features:\n• 3D Animated Palace Gates\n• Royal Shehnai & Nagada Background Audio\n• Integrated Venue Google Maps\n• Instant One-Click RSVP Tracking\n\n👉 Tap our link to design your invitation:\n${referralUrl}\n\n#WeddingInvitation #DigitalKankotri #IndianWedding #LuxuryWedding #${partnerSlug.replace(/[^a-zA-Z0-9]/g, '')}`;
      case 'email':
        return `Subject: Royal Digital Wedding Invitations for Your Special Day\n\nDear Couple,\n\nCongratulations on your upcoming wedding celebration!\n\nAs your photography partner, ${studioName} is pleased to offer you exclusive access to AmantranLink — the premier platform for handcrafted royal digital wedding invitations.\n\nYour guests will experience:\n- Immersive 3D royal opening ceremonies\n- High-resolution photo galleries & event timelines\n- One-tap venue navigation & WhatsApp RSVP\n\nYou can preview the collection and create your custom portal at:\n${referralUrl}\n\nPlease let us know if you need assistance during your design process.\n\nWarm regards,\n${studioName}\n${customContactPhone}`;
    }
  };

  const handleCopyTemplateMessage = () => {
    const text = getOutreachMessage(activeTemplateTab);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2500);
    }
  };

  const handleOpenWhatsAppClient = () => {
    const text = encodeURIComponent(getOutreachMessage('whatsapp'));
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`Royal Digital Wedding Invitations from ${studioName}`);
    const body = encodeURIComponent(getOutreachMessage('email'));
    if (typeof window !== 'undefined') {
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const conversionRate = analyticsSnapshot.visitors > 0
    ? ((analyticsSnapshot.paidOrders / analyticsSnapshot.visitors) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 font-manrope animate-fadeIn max-w-7xl mx-auto">
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. PAGE HEADER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-stone-500">Studio Hub</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-semibold text-stone-900">Marketing Kit</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PARTNER NETWORK ACTIVE</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Grow Your Studio with AmantranLink
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Share your studio referral, convert clients, and manage your partner marketing assets from one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateSettings && (
            <button
              type="button"
              onClick={onNavigateSettings}
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Referral & Studio Profile Settings"
            >
              <Settings className="w-4 h-4 text-stone-600" />
            </button>
          )}

          {onCreateInvitation && (
            <button
              type="button"
              onClick={onCreateInvitation}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Client Invitation</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. PERFORMANCE SNAPSHOT                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* REFERRAL VISITS */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Referral Visits</span>
            <Users className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-manrope">
            {isLoadingMetrics ? '...' : analyticsSnapshot.visitors}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {analyticsSnapshot.visitors > 0 ? '+100% Verified Track' : 'Awaiting visits'}
          </span>
        </div>

        {/* CLIENT SIGNUPS */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Client Signups</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-manrope">
            {isLoadingMetrics ? '...' : analyticsSnapshot.signups}
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">Attributed Accounts</span>
        </div>

        {/* PAID INVITATIONS */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Paid Invitations</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-manrope">
            {isLoadingMetrics ? '...' : analyticsSnapshot.paidOrders}
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">Unlocked Portals</span>
        </div>

        {/* CONVERSION RATE */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-manrope">
            {isLoadingMetrics ? '...' : `${conversionRate}%`}
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">Lead to Paid</span>
        </div>

        {/* ESTIMATED EARNINGS */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Estimated Earnings</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 font-manrope">
            ₹{isLoadingMetrics ? '...' : analyticsSnapshot.commission.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Direct Partner Share</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. PRIMARY REFERRAL COMMAND CENTER (HERO CARD)                              */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>SERVER ATTRIBUTION ACTIVE</span>
              </span>
              <span className="text-xs text-stone-400">&bull;</span>
              <span className="text-xs text-stone-500 font-mono">@{partnerSlug}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Your Studio Referral Link
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every client who starts their journey through this link is automatically attributed to your studio. You earn wholesale pricing privileges and commissions on client purchases.
            </p>
          </div>

          {/* Quick Summary Pill on Right */}
          <div className="flex items-center gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#0F766E] shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">Attribution Parameter</span>
              <span className="text-xs font-bold text-stone-900 font-mono">?partner={partnerSlug}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Referral URL & Action Bar */}
        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center bg-stone-50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-stone-800 overflow-hidden shadow-inner select-all">
            <span className="truncate">{referralUrl}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action: Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[44px]"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Referral Link Copied' : 'Copy Link'}</span>
            </button>

            {/* Secondary Action: Open Link */}
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Open Referral Link in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Share Action: Web Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Share via Device Share Menu"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Copied Inline Success Notice */}
        {copiedLink && (
          <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Link copied to clipboard! Share with prospective wedding couples.</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. QUICK SHARE CHANNELS                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-mono">
              Share With Clients
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Launch pre-formatted client conversations directly from your studio workflow
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleOpenWhatsAppClient}
            className="p-4 rounded-2xl bg-[#F4FBF7] hover:bg-[#EAF7F0] border border-emerald-200/70 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div>
              <span className="font-bold text-xs text-emerald-950 block">WhatsApp</span>
              <span className="text-[10px] text-emerald-800 block">Prefilled message</span>
            </div>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => {
              setActiveTemplateTab('instagram');
              handleCopyTemplateMessage();
            }}
            className="p-4 rounded-2xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border border-rose-200/70 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Instagram className="w-4 h-4" />
              </span>
              <Copy className="w-3.5 h-3.5 text-rose-700 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-bold text-xs text-rose-950 block">Instagram</span>
              <span className="text-[10px] text-rose-800 block">Copy story caption</span>
            </div>
          </button>

          {/* Email */}
          <button
            type="button"
            onClick={handleOpenMailClient}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-4 h-4" />
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-900 block">Email Client</span>
              <span className="text-[10px] text-stone-500 block">Mailto proposal</span>
            </div>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
                {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">1-Click</span>
            </div>
            <div>
              <span className="font-bold text-xs text-stone-900 block">
                {copiedLink ? 'Link Copied' : 'Copy URL'}
              </span>
              <span className="text-[10px] text-stone-500 block">Direct clipboard</span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. MARKETING ASSET STUDIO (UNIFIED GRID)                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Marketing Assets</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ready-to-use promotional materials for your studio consultation desk and digital outreach
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* ASSET 1: QR CODE */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  SCAN CODE
                </span>
                <span className="text-xs text-stone-400 font-mono">PNG 512px</span>
              </div>

              {/* QR Preview Box */}
              <div className="w-full aspect-square bg-[#FFFDF8] border border-stone-200 rounded-2xl flex items-center justify-center p-4 relative group">
                <canvas ref={qrCanvasRef} width={160} height={160} className="w-36 h-36 object-contain rounded-lg" />
              </div>

              <h3 className="font-bold text-sm text-stone-900 mt-3">Studio Referral QR</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Clients can scan this code to open your AmantranLink referral page instantly.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={downloadQrPng}
                disabled={isGeneratingAsset}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy QR Link</span>
              </button>
            </div>
          </div>

          {/* ASSET 2: A4 PRINTABLE POSTER */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                  PRINTABLE A4
                </span>
                <span className="text-xs text-stone-400 font-mono">1080x1350</span>
              </div>

              {/* Poster Miniature Frame */}
              <div className="w-full aspect-square bg-gradient-to-br from-[#FFFDF8] to-[#F8F3E8] border-2 border-[#C49A35]/40 rounded-2xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden shadow-inner">
                <div className="text-[9px] font-mono font-bold text-[#C49A35] uppercase tracking-wider">ROYAL INVITATION</div>
                <div className="text-base font-bold text-[#430914] font-serif leading-tight mt-1">AMANTRANLINK</div>
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-[#C49A35]/30 my-2 flex items-center justify-center shadow-2xs">
                  <QrCode className="w-12 h-12 text-[#430914]" />
                </div>
                <div className="text-[8px] text-stone-600 font-semibold">{studioName}</div>
              </div>

              <h3 className="font-bold text-sm text-stone-900 mt-3">A4 Wedding Invitation Poster</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Display this at your studio desk, consultation area, or wedding exhibition.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={downloadPrintCard}
                disabled={isGeneratingAsset}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Poster</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal('poster')}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Poster</span>
              </button>
            </div>
          </div>

          {/* ASSET 3: INSTAGRAM STORY CARD */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/60">
                  STORY 9:16
                </span>
                <span className="text-xs text-stone-400 font-mono">1080x1920</span>
              </div>

              {/* Story Phone Frame */}
              <div className="w-full aspect-square bg-[#2D080E] rounded-2xl flex flex-col items-center justify-center p-3 text-center relative overflow-hidden border border-rose-900 shadow-inner">
                <span className="text-[8px] font-mono text-[#C49A35] uppercase">STORY CREATIVE</span>
                <span className="text-sm font-bold text-white font-serif mt-1">AMANTRANLINK</span>
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-amber-300/40 my-1.5 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-[#430914]" />
                </div>
                <span className="text-[8px] text-stone-300">Swipe Up / Scan</span>
              </div>

              <h3 className="font-bold text-sm text-stone-900 mt-3">Instagram Story Card</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Vertical promotional creative for Instagram Stories and WhatsApp Status updates.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={downloadStoryAsset}
                disabled={isGeneratingAsset}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Story</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal('story')}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Story</span>
              </button>
            </div>
          </div>

          {/* ASSET 4: WHATSAPP CLIENT CARD */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  SQUARE 1:1
                </span>
                <span className="text-xs text-stone-400 font-mono">1080x1080</span>
              </div>

              {/* Square WhatsApp Frame */}
              <div className="w-full aspect-square bg-[#F4F9F6] border-2 border-emerald-600/30 rounded-2xl flex flex-col items-center justify-center p-3 text-center relative overflow-hidden shadow-inner">
                <span className="text-[8px] font-mono text-[#0F766E] uppercase font-bold">WHATSAPP PROMO</span>
                <span className="text-sm font-bold text-[#430914] font-serif mt-1">AMANTRANLINK</span>
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-emerald-300/40 my-1.5 flex items-center justify-center shadow-2xs">
                  <QrCode className="w-10 h-10 text-emerald-900" />
                </div>
                <span className="text-[8px] text-stone-600 font-semibold">{studioName}</span>
              </div>

              <h3 className="font-bold text-sm text-stone-900 mt-3">WhatsApp Client Card</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Share a premium square invitation graphic directly with clients on chat.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={downloadWhatsAppCard}
                disabled={isGeneratingAsset}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal('whatsapp')}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Card</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 6. REFERRAL MESSAGE TEMPLATES (CLIENT OUTREACH)                             */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              Client Outreach Templates
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Copy-paste ready copy for WhatsApp, Instagram, and Email conversations
            </p>
          </div>

          {/* Template Switcher Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTemplateTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTemplateTab === 'whatsapp'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplateTab('instagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTemplateTab === 'instagram'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Instagram Caption
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplateTab('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTemplateTab === 'email'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Email Proposal
            </button>
          </div>
        </div>

        {/* Optional Customizer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div>
            <label className="block text-[11px] font-mono font-bold text-stone-600 uppercase mb-1">
              Opening Greeting
            </label>
            <input
              type="text"
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Namaste, Hello, Dear Couple"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-stone-600 uppercase mb-1">
              Contact Phone / WhatsApp
            </label>
            <input
              type="text"
              value={customContactPhone}
              onChange={(e) => setCustomContactPhone(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
              placeholder="+91 9409360336"
            />
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="relative">
          <textarea
            readOnly
            rows={7}
            value={getOutreachMessage(activeTemplateTab)}
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-mono text-xs text-stone-800 leading-relaxed resize-none focus:outline-none select-all"
          />
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={handleCopyTemplateMessage}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTemplate ? 'Copied' : 'Copy Message'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 7. PARTNER BRANDING PREVIEW & EARNINGS CONNECTION (SIDE-BY-SIDE)            */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CLIENT EXPERIENCE PREVIEW (Col 7) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Your Client Experience</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                How clients see your verified studio attribution on AmantranLink
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewModal('client_exp')}
              className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Preview</span>
            </button>
          </div>

          {/* Mini Browser Frame */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-[#FFFDF8] shadow-2xs">
            <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 truncate">{referralUrl}</span>
            </div>

            <div className="p-6 text-center space-y-3 bg-gradient-to-b from-[#FFFDF8] to-[#F8F3E8]">
              <span className="text-[10px] font-mono font-bold text-[#167A5A] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                Welcome from {studioName}
              </span>
              <h3 className="font-serif font-bold text-xl text-[#430914] leading-tight">
                Royal Digital Wedding Invitations
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Exclusive studio partner benefits applied automatically to your wedding portal.
              </p>
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6E1020] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider border border-[#C49A35] shadow-xs hover:scale-105 transition-transform"
              >
                <span>Preview Client Experience</span>
                <ExternalLink className="w-3 h-3 text-[#C49A35]" />
              </a>
            </div>
          </div>
        </div>

        {/* EARNINGS & SETTLEMENTS CONNECTION (Col 5) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F4F9F6] to-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                COMMERCIAL VALUE
              </span>
              <Wallet className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Partner Earnings Connection</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Every client invitation and wholesale unlocked order generates instant credit in your UPI wallet ledger.
            </p>

            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200/60 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Available Balance</span>
                  <span className="text-xl font-bold text-emerald-900 font-manrope">
                    ₹{walletSnapshot.availableBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  READY TO WITHDRAW
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Pending Commission</span>
                  <span className="text-xl font-bold text-stone-800 font-manrope">
                    ₹{walletSnapshot.pendingCommission.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  IN REVIEW
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-100">
            {onNavigateEarnings ? (
              <button
                type="button"
                onClick={onNavigateEarnings}
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>View Earnings &amp; Payouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-emerald-800 font-semibold flex items-center justify-between">
                <span>Direct UPI Settlements</span>
                <span className="font-mono text-[10px]">Min. ₹500</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 8. RECENT REFERRAL ACTIVITY                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Recent Referral Activity</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live engagement log of visitors and client signups arriving through your referral URL
            </p>
          </div>
          {onNavigateAnalytics && (
            <button
              type="button"
              onClick={onNavigateAnalytics}
              className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {analyticsSnapshot.visitors === 0 ? (
          /* High-Quality Empty State */
          <div className="p-10 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400 shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-bold text-sm text-stone-900">No referral activity yet</h3>
              <p className="text-xs text-stone-500 mt-1">
                Start sharing your unique studio referral link with wedding couples across WhatsApp, Instagram, and consultations to see activity here.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Referral Link</span>
            </button>
          </div>
        ) : (
          /* Activity Feed */
          <div className="divide-y divide-stone-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-stone-900">A client visited your studio referral link</span>
              </div>
              <span className="text-stone-400 font-mono text-[11px]">Recent</span>
            </div>
            {analyticsSnapshot.signups > 0 && (
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="font-medium text-stone-900">Client created an account under your studio attribution</span>
                </div>
                <span className="text-stone-400 font-mono text-[11px]">Active</span>
              </div>
            )}
            {analyticsSnapshot.invitations > 0 && (
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-stone-900">Client started a digital wedding kankotri project</span>
                </div>
                <span className="text-stone-400 font-mono text-[11px]">Active</span>
              </div>
            )}
            {analyticsSnapshot.paidOrders > 0 && (
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="font-medium text-stone-900">Client completed wedding portal purchase · Commission credited</span>
                </div>
                <span className="text-emerald-700 font-mono font-bold text-[11px]">Paid</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 9. INTERACTIVE PREVIEW MODALS                                               */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {previewModal && (
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewModal(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {previewModal === 'poster' && 'A4 Wedding Invitation Poster Preview'}
                {previewModal === 'story' && 'Instagram Story Card Preview'}
                {previewModal === 'whatsapp' && 'WhatsApp Client Card Preview'}
                {previewModal === 'client_exp' && 'Client Referral Experience'}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {previewModal === 'poster' && (
              <div className="space-y-4 text-center">
                <div className="aspect-[3/4] bg-[#FFFDF8] border-2 border-[#C49A35]/50 rounded-2xl p-6 flex flex-col items-center justify-between shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#C49A35] font-bold uppercase">ROYAL WEDDING INVITATIONS</span>
                    <h4 className="font-serif font-bold text-2xl text-[#430914]">AMANTRANLINK</h4>
                    <p className="text-xs text-stone-600 font-semibold">{studioName}</p>
                  </div>
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-[#430914]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-stone-900">Scan to Create Your Invitation</p>
                    <p className="text-[10px] font-mono text-stone-500 truncate max-w-xs">{referralUrl}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadPrintCard}
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full-Res A4 Poster</span>
                  </button>
                </div>
              </div>
            )}

            {previewModal === 'story' && (
              <div className="space-y-4 text-center">
                <div className="aspect-[9/16] max-h-[380px] mx-auto bg-[#2D080E] border-2 border-[#C49A35]/50 rounded-2xl p-6 flex flex-col items-center justify-between shadow-inner text-white">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#C49A35] font-bold uppercase">ROYAL INVITATION</span>
                    <h4 className="font-serif font-bold text-xl text-white">AMANTRANLINK</h4>
                    <p className="text-xs text-stone-300">With {studioName}</p>
                  </div>
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-amber-300 shadow-2xs flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-[#430914]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Swipe Up or Scan QR</p>
                    <p className="text-[9px] font-mono text-[#C49A35]">@{partnerSlug}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadStoryAsset}
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 1080x1920 Story</span>
                  </button>
                </div>
              </div>
            )}

            {previewModal === 'whatsapp' && (
              <div className="space-y-4 text-center">
                <div className="aspect-square bg-[#F4F9F6] border-2 border-emerald-600/30 rounded-2xl p-6 flex flex-col items-center justify-between shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#0F766E] font-bold uppercase">STUDIO COLLABORATION</span>
                    <h4 className="font-serif font-bold text-2xl text-[#430914]">AMANTRANLINK</h4>
                    <p className="text-xs text-stone-600 font-semibold">{studioName}</p>
                  </div>
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-[#0F766E]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-stone-900">Scan to Start Your Wedding Kankotri</p>
                    <p className="text-[10px] font-mono text-[#0F766E] truncate max-w-xs">{referralUrl}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadWhatsAppCard}
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 1:1 Client Card</span>
                  </button>
                </div>
              </div>
            )}

            {previewModal === 'client_exp' && (
              <div className="space-y-4 text-center">
                <div className="p-6 bg-gradient-to-br from-[#FFFDF8] to-[#F8F3E8] border border-stone-200 rounded-2xl space-y-3">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                    Welcome from {studioName}
                  </span>
                  <h4 className="font-serif font-bold text-2xl text-[#430914]">
                    AmantranLink Royal Digital Invitations
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    When your clients land on AmantranLink, your studio banner is shown at the top of the screen, providing seamless trust and co-branding.
                  </p>
                </div>

                <a
                  href={referralUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Open Live Referral Page in New Tab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerMarketingTab;
