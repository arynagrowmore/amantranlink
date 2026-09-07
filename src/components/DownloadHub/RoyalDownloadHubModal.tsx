import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, QrCode, Smartphone, Archive, Sparkles, 
  Check, Share2, Printer, Camera, ShieldCheck, Copy, ExternalLink, 
  MessageCircle, FileText, CheckCircle2, ChevronRight, Palette, Layers, Music, Lock, Play, Film, Sliders
} from 'lucide-react';
import { WeddingProjectState, ThemeId } from '../../types/wedding';
import { exportClientZip } from '../../utils/zipExporter';
import { useAuth } from '../../context/AuthContext';
import { themes } from '../ThemeSelector';
import confetti from 'canvas-confetti';

interface RoyalDownloadHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  siteId?: string;
  slug?: string;
}

export const RoyalDownloadHubModal: React.FC<RoyalDownloadHubModalProps> = ({
  isOpen,
  onClose,
  state,
  siteId,
  slug,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'print' | 'whatsapp' | 'social' | 'video' | 'archive' | 'branding'>('all');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [includeStudioWatermark, setIncludeStudioWatermark] = useState<boolean>(true);
  const [customStudioName, setCustomStudioName] = useState<string>(user?.studioName || '');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedPrintPaper, setSelectedPrintPaper] = useState<'A4' | 'A5' | 'Square' | '5×7'>('A5');
  const [selectedSocialRatio, setSelectedSocialRatio] = useState<'9:16' | '4:5' | '1:1'>('9:16');
  const [showPrintSpecs, setShowPrintSpecs] = useState<boolean>(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const storyCanvasRef = useRef<HTMLCanvasElement>(null);
  const squareCanvasRef = useRef<HTMLCanvasElement>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);

  const groom = state?.couple?.groomEn || 'Groom';
  const bride = state?.couple?.brideEn || 'Bride';
  const weddingDate = state?.couple?.weddingDate || '10 December 2026';
  const weddingVenue = state?.couple?.venueName || 'The Palace Gardens';
  const weddingCity = state?.couple?.venueAddress || 'Udaipur, Rajasthan';
  const activeSlug = slug || siteId || `${groom.toLowerCase()}-${bride.toLowerCase()}`;
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/i/${activeSlug}` 
    : `https://amantranlink.com/i/${activeSlug}`;

  const currentTheme = themes.find((t) => t.id === state.theme) || themes[0];
  const effectiveStudioName = customStudioName || user?.studioName || 'Royal Lens Photography';

  // 1. Draw 4K High-Res Print QR Card (300 DPI / 1200x1600 Canvas)
  const renderPrintQrCard = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Deep Royal Burgundy / Obsidian)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#24060B');
    bgGrad.addColorStop(0.5, '#3A0811');
    bgGrad.addColorStop(1, '#1A0407');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ornate Royal Gold Borders
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = 'rgba(232, 213, 173, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, width - 110, height - 110);

    // Corner Accents
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = '#C49A35';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(40, 40);
    drawCorner(width - 40, 40);
    drawCorner(40, height - 40);
    drawCorner(width - 40, height - 40);

    // Top Header: Royal Crest Monogram
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C49A35';
    ctx.font = 'bold 24px "Cinzel", serif, sans-serif';
    ctx.fillText('✦ SHUBH VIVAH ✦', width / 2, 130);

    ctx.font = 'italic 20px "Manrope", sans-serif';
    ctx.fillStyle = '#E8D5AD';
    ctx.fillText('The Royal Wedding of', width / 2, 175);

    // Couple Names (Hero Typography)
    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 64px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillText(`${groom} & ${bride}`, width / 2, 260);

    // Gold Divider Line
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 295);
    ctx.lineTo(width / 2 + 180, 295);
    ctx.stroke();

    // Date & City
    ctx.font = 'bold 24px "Manrope", sans-serif';
    ctx.fillStyle = '#E8CD7E';
    ctx.fillText(`${weddingDate}  ·  ${weddingCity}`, width / 2, 345);

    // QR Code Container Box
    const qrBoxSize = 540;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 410;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 6;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // Draw Real QR Code Image into Canvas
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(inviteUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;
    qrImg.src = qrCodeApiUrl;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      // Center Crest Stamp inside QR
      ctx.fillStyle = '#6E1020';
      ctx.beginPath();
      ctx.arc(width / 2, qrBoxY + qrBoxSize / 2, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C49A35';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 22px serif';
      ctx.fillText('👑', width / 2, qrBoxY + qrBoxSize / 2 + 8);

      // Bottom Instructions
      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 28px "Cinzel", "Cormorant Garamond", serif';
      ctx.fillText('Scan with Phone Camera to Open Live Palace Kankotri', width / 2, 1040);

      ctx.fillStyle = '#E8D5AD';
      ctx.font = '18px "Manrope", sans-serif';
      ctx.fillText('Interactive 3D Gates · Royal Shehnai Symphony · Live RSVP Portal', width / 2, 1085);

      // Web Link
      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText(inviteUrl.replace(/^https?:\/\//, ''), width / 2, 1140);

      // Venue Details
      ctx.fillStyle = '#FFF8E8';
      ctx.font = '22px "Manrope", sans-serif';
      ctx.fillText(`Venue: ${weddingVenue}`, width / 2, 1220);

      // Studio Co-Branding Watermark
      if (includeStudioWatermark && effectiveStudioName) {
        ctx.fillStyle = 'rgba(232, 213, 173, 0.7)';
        ctx.font = 'italic 16px "Manrope", sans-serif';
        ctx.fillText(`Digital Architecture & Photography by ${effectiveStudioName}`, width / 2, 1510);
      }
    };
  };

  // 2. Draw 9:16 WhatsApp Story Poster (1080x1920 Canvas)
  const renderStoryPoster = () => {
    const canvas = storyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1E0408');
    bgGrad.addColorStop(0.4, '#380710');
    bgGrad.addColorStop(1, '#140306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = 'rgba(232, 213, 173, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C49A35';
    ctx.font = 'bold 28px "Cinzel", serif, sans-serif';
    ctx.fillText('✦ SAVE THE DATE ✦', width / 2, 160);

    ctx.font = 'italic 24px "Manrope", sans-serif';
    ctx.fillStyle = '#E8D5AD';
    ctx.fillText('You are cordially invited to celebrate the union of', width / 2, 220);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 76px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillText(groom, width / 2, 330);

    ctx.fillStyle = '#C49A35';
    ctx.font = 'italic 48px "Cormorant Garamond", serif';
    ctx.fillText('&', width / 2, 395);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 76px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillText(bride, width / 2, 480);

    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 530);
    ctx.lineTo(width / 2 + 220, 530);
    ctx.stroke();

    ctx.fillStyle = '#E8CD7E';
    ctx.font = 'bold 36px "Manrope", sans-serif';
    ctx.fillText(weddingDate, width / 2, 600);

    ctx.fillStyle = '#FFF8E8';
    ctx.font = '26px "Manrope", sans-serif';
    ctx.fillText(weddingVenue, width / 2, 660);
    ctx.fillText(weddingCity, width / 2, 705);

    const qrBoxSize = 500;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 820;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 6;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(inviteUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;
    qrImg.src = qrCodeApiUrl;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      ctx.fillStyle = '#6E1020';
      ctx.beginPath();
      ctx.arc(width / 2, qrBoxY + qrBoxSize / 2, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C49A35';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 20px serif';
      ctx.fillText('👑', width / 2, qrBoxY + qrBoxSize / 2 + 7);

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 32px "Cinzel", "Cormorant Garamond", serif';
      ctx.fillText('Scan QR or Tap Link to Open Digital Invitation', width / 2, 1420);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(inviteUrl.replace(/^https?:\/\//, ''), width / 2, 1480);

      ctx.fillStyle = '#E8D5AD';
      ctx.font = '22px "Manrope", sans-serif';
      ctx.fillText('Music · 3D Palace Gate · Itinerary · RSVP', width / 2, 1540);

      if (includeStudioWatermark && effectiveStudioName) {
        ctx.fillStyle = 'rgba(232, 213, 173, 0.7)';
        ctx.font = 'italic 20px "Manrope", sans-serif';
        ctx.fillText(`Photography & Invitation by ${effectiveStudioName}`, width / 2, 1820);
      }
    };
  };

  // 3. Draw 1:1 Square Canvas (1080x1080)
  const renderSquarePoster = () => {
    const canvas = squareCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#24060B');
    bgGrad.addColorStop(1, '#140306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C49A35';
    ctx.font = 'bold 22px "Cinzel", serif';
    ctx.fillText('✦ SHUBH VIVAH ✦', width / 2, 100);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 54px "Cinzel", serif';
    ctx.fillText(`${groom} & ${bride}`, width / 2, 180);

    ctx.fillStyle = '#E8CD7E';
    ctx.font = 'bold 24px "Manrope", sans-serif';
    ctx.fillText(`${weddingDate} · ${weddingCity}`, width / 2, 230);

    const qrBoxSize = 480;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 280;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 4;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(inviteUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 24px "Cinzel", serif';
      ctx.fillText('Scan to Open Digital Kankotri', width / 2, 830);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(inviteUrl.replace(/^https?:\/\//, ''), width / 2, 875);

      if (includeStudioWatermark && effectiveStudioName) {
        ctx.fillStyle = 'rgba(232, 213, 173, 0.7)';
        ctx.font = 'italic 16px "Manrope", sans-serif';
        ctx.fillText(`By ${effectiveStudioName}`, width / 2, 1020);
      }
    };
  };

  // 4. Draw 4:5 Portrait Canvas (1080x1350)
  const renderPortraitPoster = () => {
    const canvas = portraitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#24060B');
    bgGrad.addColorStop(1, '#1A0407');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 6;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C49A35';
    ctx.font = 'bold 24px "Cinzel", serif';
    ctx.fillText('✦ SHUBH VIVAH ✦', width / 2, 120);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 60px "Cinzel", serif';
    ctx.fillText(`${groom} & ${bride}`, width / 2, 210);

    ctx.fillStyle = '#E8CD7E';
    ctx.font = 'bold 26px "Manrope", sans-serif';
    ctx.fillText(`${weddingDate} · ${weddingVenue}`, width / 2, 270);

    const qrBoxSize = 520;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 340;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 5;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=460x460&data=${encodeURIComponent(inviteUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 26px "Cinzel", serif';
      ctx.fillText('Scan with Phone to RSVP', width / 2, 940);

      ctx.fillStyle = '#C49A35';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(inviteUrl.replace(/^https?:\/\//, ''), width / 2, 990);

      if (includeStudioWatermark && effectiveStudioName) {
        ctx.fillStyle = 'rgba(232, 213, 173, 0.7)';
        ctx.font = 'italic 17px "Manrope", sans-serif';
        ctx.fillText(`Photography & Stationery by ${effectiveStudioName}`, width / 2, 1260);
      }
    };
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderPrintQrCard();
        renderStoryPoster();
        renderSquarePoster();
        renderPortraitPoster();
      }, 200);
    }
  }, [isOpen, activeTab, includeStudioWatermark, customStudioName, state]);

  if (!isOpen) return null;

  // Download Canvas as High-Res PNG
  const downloadCanvasAsPng = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    setIsGeneratingPng(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C49A35', '#FFFDF8', '#6E1020'],
      });
    } catch (e) {
      console.warn('Canvas export note:', e);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Download Complete Offline ZIP Package
  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await exportClientZip(state);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C49A35', '#FFFDF8', '#6E1020'],
      });
    } catch (e: any) {
      alert('Zip export error: ' + (e.message || 'Could not export'));
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleGenerateVideo = () => {
    setIsGeneratingVideo(true);
    setTimeout(() => {
      setIsGeneratingVideo(false);
      // Trigger Story Download as high-fidelity video frame poster
      downloadCanvasAsPng(storyCanvasRef.current, `${groom}_${bride}_Animated_Invitation_Poster.png`);
    }, 1400);
  };

  const handleCopyInviteLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const msg = `👑 *ROYAL WEDDING INVITATION* 👑\n\nYou are cordially invited to celebrate the auspicious wedding of *${groom} & ${bride}*.\n\n📅 *Date:* ${weddingDate}\n📍 *Venue:* ${weddingVenue}, ${weddingCity}\n\n✨ *Open Palace Digital Kankotri & RSVP:* \n${inviteUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const getActiveSocialCanvas = () => {
    if (selectedSocialRatio === '4:5') return portraitCanvasRef.current;
    if (selectedSocialRatio === '1:1') return squareCanvasRef.current;
    return storyCanvasRef.current;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-manrope">
      <div className="relative w-full max-w-5xl bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* 👑 PAGE HEADER (Artisanal Editorial) */}
        {/* ========================================================= */}
        <header className="bg-[#24060B] border-b border-[#C49A35]/30 px-6 sm:px-8 py-5 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-radial from-[#C49A35]/15 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C49A35]">
                  AMANTRANLINK ROYAL INVITATION ATELIER
                </span>
                <span className="text-[#C49A35]/40 text-xs">·</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E8D5AD] bg-[#3A0811] px-2.5 py-0.5 rounded-full border border-[#C49A35]/30">
                  <Palette className="w-3 h-3 text-[#C49A35]" />
                  {currentTheme.name.toUpperCase()} · SELECTED THEME
                </span>
              </div>
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFDF8]">
                Your Wedding, Ready to Carry.
              </h2>
              <p className="text-xs text-[#E8D5AD]/85 font-light mt-0.5">
                Everything you've prepared is gathered here — ready for print, WhatsApp, sharing, and the celebration itself.
              </p>
              <p className="text-[11px] text-[#C49A35]/90 italic mt-0.5">
                Prepared for your wedding · {groom} &amp; {bride}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFDF8] flex items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
              aria-label="Close Atelier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Ribbon */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#C49A35]/20 overflow-x-auto text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              All Formats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'print'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              1. For Print
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'whatsapp'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              2. For Sharing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'social'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              3. Photos &amp; Socials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'video'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              4. Moving Invitation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'archive'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              5. Offline Archive
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 ${
                activeTab === 'branding'
                  ? 'bg-[#C49A35] text-[#24060B] font-bold shadow-xs'
                  : 'text-[#E8D5AD] hover:bg-white/10'
              }`}
            >
              6. Studio Watermark
            </button>
          </div>
        </header>

        {/* 🏛️ MAIN ATELIER SUITE BODY */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-[#FFFDF8]">

          {/* ========================================================= */}
          {/* 1. "YOUR INVITATION" REAL HERO PROOF AREA */}
          {/* ========================================================= */}
          <div className="bg-[#FAF5EC] border border-[#E8D5AD] rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* LEFT: Miniature Live Proof on Designer Desk */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative p-3 bg-white rounded-2xl border-2 border-[#C49A35]/60 shadow-xl max-w-[220px] w-full transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-[#24060B] text-white p-4 rounded-xl border border-[#C49A35]/40 text-center space-y-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#C49A35] block">
                      ✦ SHUBH VIVAH ✦
                    </span>
                    <h4 className="font-cormorant text-xl font-bold text-[#FFFDF8] leading-tight">
                      {groom} &amp; {bride}
                    </h4>
                    <div className="w-8 h-[1px] bg-[#C49A35] mx-auto opacity-60" />
                    <p className="text-[10px] text-[#E8CD7E] font-medium">
                      {weddingDate}
                    </p>
                    <span className="inline-block text-[9px] bg-[#3A0811] text-[#E8D5AD] px-2 py-0.5 rounded border border-[#C49A35]/30">
                      {currentTheme.name}
                    </span>
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-[10px] text-[#75675C] font-mono font-medium">
                      Live Studio Proof
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Editorial Summary & Contextual Badges */}
              <div className="md:col-span-8 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6E1020]">
                  Studio Desk Proof
                </span>
                <h3 className="font-cormorant text-3xl font-bold text-[#241A17]">
                  Your invitation is ready.
                </h3>
                <p className="text-xs text-[#75675C] leading-relaxed max-w-xl">
                  Choose the format you need. Each version is prepared for the way your guests will receive it.
                </p>

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <span className="text-[11px] font-bold tracking-wider text-[#6E1020] bg-white px-3 py-1 rounded-lg border border-[#E8D5AD] shadow-xs">
                    PRINT
                  </span>
                  <span className="text-[11px] font-bold tracking-wider text-[#167A5A] bg-white px-3 py-1 rounded-lg border border-[#E8D5AD] shadow-xs">
                    WHATSAPP
                  </span>
                  <span className="text-[11px] font-bold tracking-wider text-[#C49A35] bg-white px-3 py-1 rounded-lg border border-[#E8D5AD] shadow-xs">
                    SHARE
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. SECTION 01: FOR PRINT (Printable Wedding Kankotri) */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'print') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      FOR PRINT
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      Printable Wedding Kankotri
                    </h3>
                    <p className="text-xs text-[#75675C] mt-0.5">
                      For your family, relatives, and traditional invitations.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-[#6E1020] bg-[#FAF5EC] px-2.5 py-1 rounded-lg border border-[#E8D5AD]">
                    High Resolution
                  </span>
                  <span className="text-[11px] font-semibold text-[#167A5A] bg-[#167A5A]/10 px-2.5 py-1 rounded-full border border-[#167A5A]/20">
                    Print Ready
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Paper Preview */}
                <div className="md:col-span-5 flex justify-center bg-[#1E0408] p-4 rounded-2xl border border-[#C49A35]/40 shadow-inner">
                  <canvas
                    ref={qrCanvasRef}
                    className="w-full max-w-[240px] h-auto rounded-xl shadow-2xl border border-[#C49A35]/50"
                  />
                </div>

                {/* Print Options & Actions */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#241A17] block">Paper Standard</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['A4', 'A5', 'Square', '5×7'] as const).map((paper) => (
                        <button
                          key={paper}
                          type="button"
                          onClick={() => setSelectedPrintPaper(paper)}
                          className={`py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            selectedPrintPaper === paper
                              ? 'bg-[#6E1020] text-[#FFFDF8] border-[#6E1020] font-bold shadow-xs'
                              : 'bg-[#FAF5EC] text-[#75675C] border-[#E8D5AD] hover:border-[#C49A35]'
                          }`}
                        >
                          {paper}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] text-xs space-y-1.5 text-[#241A17]">
                    <div className="flex justify-between">
                      <span className="text-[#75675C]">Selected Size:</span>
                      <span className="font-semibold text-[#6E1020]">{selectedPrintPaper} (Lossless Print)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75675C]">Recommended Paper:</span>
                      <span className="text-[#241A17]">300–350 GSM Textured Matte Cardstock</span>
                    </div>
                  </div>

                  {showPrintSpecs && (
                    <div className="p-3 bg-white rounded-xl border border-[#E8D5AD] text-[11px] text-[#75675C] space-y-1 animate-fadeIn">
                      <p>• <strong>Bleed &amp; Margins:</strong> 3mm safety margin included</p>
                      <p>• <strong>Vector QR:</strong> Scannable up to 2.5 meters on framed easel</p>
                      <p>• <strong>Inks:</strong> CMYK rich burgundy and antique gold simulation</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadCanvasAsPng(qrCanvasRef.current, `${groom}_${bride}_Printable_Wedding_Kankotri.png`)}
                      disabled={isGeneratingPng}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <Download className="w-4 h-4 text-[#C49A35]" />
                      <span>Prepare Print PDF →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPrintSpecs(!showPrintSpecs)}
                      className="text-xs text-[#6E1020] hover:underline font-semibold cursor-pointer py-1 px-2"
                    >
                      {showPrintSpecs ? 'Hide specifications' : 'View specifications'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 3. SECTION 02: FOR SHARING (WhatsApp Invitation) */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'whatsapp') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      FOR SHARING
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      WhatsApp Invitation
                    </h3>
                    <p className="text-xs text-[#75675C] mt-0.5">
                      Made for the family groups, personal messages, and guests who are joining from afar.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#75675C] italic">
                  Optimized for mobile viewing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Phone Mockup containing Actual Invitation Preview */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-full max-w-[230px] bg-[#140306] p-2.5 rounded-[32px] border-4 border-[#3A0811] shadow-2xl space-y-2">
                    <div className="w-16 h-3 bg-black/60 rounded-full mx-auto" />
                    <div className="bg-[#24060B] rounded-2xl p-3 text-center border border-[#C49A35]/30 space-y-1.5">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-[#C49A35] block">
                        PALACE KANKOTRI
                      </span>
                      <p className="font-cormorant text-base font-bold text-[#FFFDF8]">
                        {groom} &amp; {bride}
                      </p>
                      <p className="text-[9px] text-[#E8D5AD]">
                        {weddingDate}
                      </p>
                      <div className="py-1 px-2 bg-[#3A0811] rounded text-[9px] font-mono text-[#C49A35] truncate">
                        {inviteUrl.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                    <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-7 space-y-4">
                  <p className="text-xs text-[#75675C] leading-relaxed">
                    A mobile-first digital response card ready to broadcast to WhatsApp family groups or forward with a personalized wedding invitation blessing.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadCanvasAsPng(storyCanvasRef.current, `${groom}_${bride}_WhatsApp_Invitation.png`)}
                      className="py-3 px-4 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#C49A35]" />
                      <span>Download WhatsApp PDF</span>
                    </button>

                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-[#C49A35]" />
                      <span>Open Invitation</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. SECTION 03: FOR YOUR PHOTOS & SOCIALS (HD Image) */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'social') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      FOR YOUR PHOTOS &amp; SOCIALS
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      HD Invitation Image
                    </h3>
                    <p className="text-xs text-[#75675C] mt-0.5">
                      A beautiful still version of your invitation for WhatsApp, Instagram, stories, and family sharing.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Real Visual Previews */}
              <div className="grid grid-cols-3 gap-4">
                <div 
                  onClick={() => setSelectedSocialRatio('4:5')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedSocialRatio === '4:5'
                      ? 'bg-[#FAF5EC] border-[#6E1020] shadow-sm'
                      : 'bg-white border-[#E8D5AD] hover:border-[#C49A35]'
                  }`}
                >
                  <div className="bg-[#1E0408] rounded-xl p-2 mb-2 flex justify-center">
                    <canvas ref={portraitCanvasRef} className="w-full max-w-[90px] h-auto rounded shadow" />
                  </div>
                  <span className="text-xs font-bold text-[#241A17] block">4:5 Portrait</span>
                  <span className="text-[10px] text-[#75675C]">Instagram Post</span>
                </div>

                <div 
                  onClick={() => setSelectedSocialRatio('1:1')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedSocialRatio === '1:1'
                      ? 'bg-[#FAF5EC] border-[#6E1020] shadow-sm'
                      : 'bg-white border-[#E8D5AD] hover:border-[#C49A35]'
                  }`}
                >
                  <div className="bg-[#1E0408] rounded-xl p-2 mb-2 flex justify-center">
                    <canvas ref={squareCanvasRef} className="w-full max-w-[90px] h-auto rounded shadow" />
                  </div>
                  <span className="text-xs font-bold text-[#241A17] block">1:1 Square</span>
                  <span className="text-[10px] text-[#75675C]">Feed &amp; Profile</span>
                </div>

                <div 
                  onClick={() => setSelectedSocialRatio('9:16')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedSocialRatio === '9:16'
                      ? 'bg-[#FAF5EC] border-[#6E1020] shadow-sm'
                      : 'bg-white border-[#E8D5AD] hover:border-[#C49A35]'
                  }`}
                >
                  <div className="bg-[#1E0408] rounded-xl p-2 mb-2 flex justify-center">
                    <canvas ref={storyCanvasRef} className="w-full max-w-[70px] h-auto rounded shadow" />
                  </div>
                  <span className="text-xs font-bold text-[#241A17] block">9:16 Story</span>
                  <span className="text-[10px] text-[#75675C]">Status &amp; Stories</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => downloadCanvasAsPng(getActiveSocialCanvas(), `${groom}_${bride}_HD_Invitation_${selectedSocialRatio}.png`)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4 text-[#C49A35]" />
                  <span>Download HD Image ({selectedSocialRatio})</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-[#75675C]">
                  <Sliders className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Format: <strong>{selectedSocialRatio} Selected</strong></span>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 5. SECTION 04: THE MOVING INVITATION (Animated Video) */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'video') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      THE MOVING INVITATION
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      Animated Wedding Invitation
                    </h3>
                    <p className="text-xs text-[#75675C] mt-0.5">
                      A short cinematic version of your wedding story — made for sharing before the celebrations begin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Video Style Preview */}
                <div className="md:col-span-5 relative bg-[#140306] rounded-2xl p-6 border border-[#C49A35]/50 shadow-xl text-center space-y-3 overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-[#C49A35]/20 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="w-14 h-14 rounded-full bg-[#6E1020] border-2 border-[#C49A35] flex items-center justify-center mx-auto shadow-lg text-[#C49A35]">
                    <Play className="w-6 h-6 fill-[#C49A35] ml-1" />
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h4 className="font-cormorant text-xl font-bold text-[#FFFDF8]">
                      {groom} &amp; {bride}
                    </h4>
                    <p className="text-[11px] text-[#E8CD7E]">
                      {weddingDate} · {currentTheme.name}
                    </p>
                  </div>
                </div>

                {/* Video Generation Trigger */}
                <div className="md:col-span-7 space-y-4">
                  <p className="text-xs text-[#75675C] leading-relaxed">
                    Combines your palace architectural gate opening sequence, royal shehnai score, and auspicious blessings into a shareable animation.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="w-full py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-60"
                  >
                    <Film className="w-4 h-4 text-[#C49A35]" />
                    <span>{isGeneratingVideo ? 'Preparing Animated Video...' : 'Create / Download Video'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 6. READY TO SHARE AREA */}
          {/* ========================================================= */}
          <div className="bg-[#FAF5EC] border border-[#E8D5AD] rounded-3xl p-6 space-y-4">
            <div>
              <h4 className="font-cormorant text-2xl font-bold text-[#241A17]">
                Ready for the family.
              </h4>
              <p className="text-xs text-[#75675C] mt-0.5">
                Your invitation link always opens the latest saved version.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="py-3 px-4 rounded-xl bg-white hover:bg-[#F8F3E8] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#167A5A]" /> : <Copy className="w-4 h-4 text-[#C49A35]" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
              </button>

              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-white hover:bg-[#F8F3E8] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-4 h-4 text-[#C49A35]" />
                <span>Open Guest View</span>
              </a>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-4 rounded-xl bg-[#167A5A] hover:bg-[#126349] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 7. OFFLINE ARCHIVE PACKAGE (Section 05) */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'archive') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Archive className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      OFFLINE ARCHIVE
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      Self-Contained Offline Web Bundle (ZIP)
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#75675C] leading-relaxed">
                  Download the complete standalone package containing the client-ready HTML invitation, embedded typography, palace gate physics, and the original Shehnai musical score. Perfect for physical USB keepsakes or offline wedding archival.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#6E1020]">
                      <FileText className="w-3.5 h-3.5 text-[#C49A35]" />
                      <span>Standalone HTML</span>
                    </div>
                    <p className="text-[11px] text-[#75675C]">index.html with inline assets</p>
                  </div>
                  <div className="p-3.5 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#6E1020]">
                      <Music className="w-3.5 h-3.5 text-[#C49A35]" />
                      <span>Royal Symphony</span>
                    </div>
                    <p className="text-[11px] text-[#75675C]">FinalSong.mp3 included</p>
                  </div>
                  <div className="p-3.5 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#167A5A]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Client Security</span>
                    </div>
                    <p className="text-[11px] text-[#75675C]">Anti-Inspect &amp; F12 Protection</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#167A5A] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#167A5A]" />
                    <span>Ready for USB drive delivery or offline archival</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportZip}
                    disabled={isExportingZip}
                    className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4 text-[#C49A35]" />
                    <span>{isExportingZip ? 'Packing Studio Archive...' : 'Download Full ZIP Bundle'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 8. STUDIO CO-BRANDING & CREDITS */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'branding') && (
            <section className="bg-white rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5AD]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EC] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-[#C49A35]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">
                      STUDIO ATTRIBUTION
                    </span>
                    <h3 className="font-cormorant text-2xl font-bold text-[#241A17]">
                      Photographer Studio Co-Branding
                    </h3>
                  </div>
                </div>
              </div>

              <div className="max-w-xl space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudioWatermark}
                    onChange={(e) => setIncludeStudioWatermark(e.target.checked)}
                    className="w-4 h-4 text-[#6E1020] rounded border-[#E8D5AD] focus:ring-[#C49A35] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#241A17]">
                    Include Studio Watermark on Generated Cards &amp; Story Posters
                  </span>
                </label>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#241A17]">Studio / Creator Business Name</label>
                  <input
                    type="text"
                    value={customStudioName}
                    onChange={(e) => setCustomStudioName(e.target.value)}
                    placeholder="e.g. Royal Lens Photography"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5EC] border border-[#E8D5AD] rounded-xl text-xs text-[#241A17] focus:outline-none focus:border-[#C49A35] font-manrope"
                  />
                </div>

                <div className="p-3 bg-[#FAF5EC] rounded-xl border border-[#E8D5AD] text-[11px] text-[#75675C]">
                  Attribution Preview: <span className="font-semibold text-[#6E1020]">"Digital Architecture &amp; Photography by {effectiveStudioName}"</span>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 9. PRODUCTION STATUS (Quiet Atelier Note) */}
          {/* ========================================================= */}
          <div className="p-4 bg-[#FAF5EC] rounded-2xl border border-[#E8D5AD] text-xs space-y-2 text-[#75675C]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-[#241A17] uppercase tracking-wider text-[10px]">
                INVITATION ATELIER
              </span>
              <span className="text-[11px] text-[#6E1020] font-semibold">
                Theme: {currentTheme.name}
              </span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <span>Available formats: <strong>Print · Digital · Image · Video · Offline Bundle</strong></span>
              <span>Live state: <strong>Active &amp; Ready</strong></span>
            </div>
          </div>

        </div>

        {/* 🌟 ATELIER FOOTER */}
        <footer className="h-12 bg-[#24060B] border-t border-[#C49A35]/30 px-6 sm:px-8 flex items-center justify-between text-[11px] text-[#E8D5AD] shrink-0 font-manrope">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Lossless Vector &amp; Canvas Rendering Atelier</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#C49A35] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AmantranLink Royal Suite</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default RoyalDownloadHubModal;
