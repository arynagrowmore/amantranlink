import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, QrCode, Smartphone, Archive, Sparkles, 
  Check, Share2, Printer, Camera, ShieldCheck, Copy, ExternalLink, 
  Layers, RefreshCw, CheckCircle2, MessageCircle, FileText
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
  const [activeTab, setActiveTab] = useState<'qr-card' | 'story-poster' | 'offline-zip' | 'branding'>('qr-card');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);
  const [includeStudioWatermark, setIncludeStudioWatermark] = useState<boolean>(true);
  const [customStudioName, setCustomStudioName] = useState<string>(user?.studioName || '');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const storyCanvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.letterSpacing = '6px';
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

    // Background Gradient (Deep Royal Palace Night)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1E0408');
    bgGrad.addColorStop(0.4, '#380710');
    bgGrad.addColorStop(1, '#140306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Gold Arched Border
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = 'rgba(232, 213, 173, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // Top Header: SAVE THE DATE
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C49A35';
    ctx.font = 'bold 28px "Cinzel", serif, sans-serif';
    ctx.fillText('✦ SAVE THE DATE ✦', width / 2, 160);

    ctx.font = 'italic 24px "Manrope", sans-serif';
    ctx.fillStyle = '#E8D5AD';
    ctx.fillText('You are cordially invited to celebrate the union of', width / 2, 220);

    // Couple Names
    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 76px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillText(groom, width / 2, 330);

    ctx.fillStyle = '#C49A35';
    ctx.font = 'italic 48px "Cormorant Garamond", serif';
    ctx.fillText('&', width / 2, 395);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 76px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillText(bride, width / 2, 480);

    // Gold Accent Ribbon
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 530);
    ctx.lineTo(width / 2 + 220, 530);
    ctx.stroke();

    // Wedding Date & Venue
    ctx.fillStyle = '#E8CD7E';
    ctx.font = 'bold 36px "Manrope", sans-serif';
    ctx.fillText(weddingDate, width / 2, 600);

    ctx.fillStyle = '#FFF8E8';
    ctx.font = '26px "Manrope", sans-serif';
    ctx.fillText(weddingVenue, width / 2, 660);
    ctx.fillText(weddingCity, width / 2, 705);

    // QR Code Container Box
    const qrBoxSize = 500;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 820;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    ctx.strokeStyle = '#C49A35';
    ctx.lineWidth = 6;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // Draw QR into Story Canvas
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(inviteUrl)}&color=43-9-20&bgcolor=255-253-248&margin=2`;
    qrImg.src = qrCodeApiUrl;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      // Center Crest Stamp
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

      // Bottom Message
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderPrintQrCard();
        renderStoryPoster();
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
        particleCount: 100,
        spread: 70,
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
    } catch (e: any) {
      alert('Zip export error: ' + (e.message || 'Could not export'));
    } finally {
      setIsExportingZip(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-manrope">
      <div className="relative w-full max-w-4xl bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 👑 Top Executive Modal Header */}
        <header className="h-18 bg-[#24060B] border-b border-[#C49A35]/40 px-5 sm:px-8 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6E1020] text-[#C49A35] flex items-center justify-center border border-[#C49A35] shadow-xs">
              <Download className="w-5 h-5 text-[#C49A35]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#FFFDF8]">
                  Royal Asset &amp; Download Center
                </h3>
                <span className="text-[10px] font-mono font-bold bg-[#C49A35] text-[#24060B] px-2 py-0.5 rounded-full uppercase">
                  4K ASSETS
                </span>
              </div>
              <p className="text-[11px] text-[#E8D5AD]">
                {groom} &amp; {bride} · {currentTheme.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* 🧭 Tabs Toolbar */}
        <div className="bg-[#F8F3E8] border-b border-[#E8D5AD] px-5 sm:px-8 flex items-center gap-2 overflow-x-auto shrink-0 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('qr-card')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'qr-card'
                ? 'bg-[#6E1020] text-white shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>4K Print QR Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('story-poster')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'story-poster'
                ? 'bg-[#6E1020] text-white shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>9:16 WhatsApp Story</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline-zip')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'offline-zip'
                ? 'bg-[#6E1020] text-white shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Offline ZIP Package</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-[#6E1020] text-white shadow-xs'
                : 'text-[#75675C] hover:text-[#430914]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Studio Co-Branding</span>
          </button>
        </div>

        {/* 🎨 Main Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 4K PRINT QR CARD */}
          {activeTab === 'qr-card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Canvas Preview Container */}
              <div className="flex justify-center bg-[#140306] p-4 rounded-3xl border border-[#C49A35]/40 shadow-inner">
                <canvas
                  ref={qrCanvasRef}
                  className="w-full max-w-[280px] h-auto rounded-xl shadow-2xl border border-[#C49A35]/60"
                />
              </div>

              {/* Controls & Specs */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-[#167A5A]/10 text-[#167A5A] px-2 py-0.5 rounded-full uppercase">
                    300 DPI Physical Print Ready
                  </span>
                  <h4 className="font-cormorant font-bold text-2xl text-[#430914] mt-1">
                    Ornate Royal Print QR Card
                  </h4>
                  <p className="text-xs text-[#75675C] leading-relaxed">
                    Designed with 300 DPI high-density gold borders, couple monogram, and a scannable QR code ready to be printed on wedding cards, gift hampers, or framed at the entrance.
                  </p>
                </div>

                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD] text-xs space-y-1.5 text-[#430914]">
                  <div className="flex justify-between">
                    <span className="text-[#75675C]">Resolution:</span>
                    <span className="font-mono font-bold">1200 × 1600 px (4K Ultra-HD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75675C]">Format:</span>
                    <span className="font-mono font-bold">Lossless PNG &amp; Vector QR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75675C]">Target URL:</span>
                    <span className="font-mono text-[#6E1020] truncate max-w-[180px]">/i/{activeSlug}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => downloadCanvasAsPng(qrCanvasRef.current, `${groom}_${bride}_Print_QR_Card.png`)}
                    disabled={isGeneratingPng}
                    className="w-full py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4 text-[#C49A35]" />
                    <span>Download 300 DPI Print PNG</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8D5AD] hover:border-[#C49A35] text-[#430914] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#C49A35]" />}
                      <span>{copiedLink ? 'Copied URL!' : 'Copy Direct URL'}</span>
                    </button>

                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white border border-[#E8D5AD] hover:border-[#C49A35] text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
                      title="Test Invitation URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 9:16 WHATSAPP STORY POSTER */}
          {activeTab === 'story-poster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Canvas Preview Container */}
              <div className="flex justify-center bg-[#140306] p-4 rounded-3xl border border-[#C49A35]/40 shadow-inner">
                <canvas
                  ref={storyCanvasRef}
                  className="w-full max-w-[240px] h-auto rounded-2xl shadow-2xl border border-[#C49A35]/60"
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-[#167A5A]/10 text-[#167A5A] px-2 py-0.5 rounded-full uppercase">
                    1080 × 1920 (9:16 Vertical Story)
                  </span>
                  <h4 className="font-cormorant font-bold text-2xl text-[#430914] mt-1">
                    WhatsApp &amp; Instagram Story Poster
                  </h4>
                  <p className="text-xs text-[#75675C] leading-relaxed">
                    Formatted specifically for mobile phone screens and status updates. Perfect for sharing directly on WhatsApp Status, Instagram Stories, and family groups.
                  </p>
                </div>

                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD] text-xs space-y-1.5 text-[#430914]">
                  <div className="flex justify-between">
                    <span className="text-[#75675C]">Story Aspect:</span>
                    <span className="font-mono font-bold">9:16 Full Screen Vertical</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75675C]">Optimized For:</span>
                    <span className="font-semibold text-[#167A5A]">WhatsApp, Instagram, Snapchat</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => downloadCanvasAsPng(storyCanvasRef.current, `${groom}_${bride}_WhatsApp_Story.png`)}
                    className="w-full py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4 text-[#C49A35]" />
                    <span>Download 1080 × 1920 Story PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-2.5 rounded-xl bg-[#167A5A] hover:bg-[#126349] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp with Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE ZIP PACKAGE */}
          {activeTab === 'offline-zip' && (
            <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6E1020] text-[#C49A35] flex items-center justify-center shrink-0 shadow-xs border border-[#C49A35]">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-cormorant font-bold text-2xl text-[#430914]">
                    Standalone Offline Bundle (ZIP)
                  </h4>
                  <p className="text-xs text-[#75675C] leading-relaxed mt-1">
                    Download a self-contained, fully offline HTML package of this digital wedding invitation. Includes all fonts, royal background music, interactive gate animations, and client security protection.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60">
                  <span className="text-[10px] text-[#75675C] uppercase font-bold block">Standalone HTML</span>
                  <span className="font-semibold text-[#430914] mt-1 block">index.html (Self-Contained)</span>
                </div>
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60">
                  <span className="text-[10px] text-[#75675C] uppercase font-bold block">Royal Symphony</span>
                  <span className="font-semibold text-[#430914] mt-1 block">FinalSong.mp3 Included</span>
                </div>
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60">
                  <span className="text-[10px] text-[#75675C] uppercase font-bold block">Security Shield</span>
                  <span className="font-semibold text-[#167A5A] mt-1 block">Anti-Inspect &amp; F12 Lock</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8D5AD]/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#167A5A] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#167A5A]" />
                  <span>Ready for USB drive delivery or offline archival</span>
                </div>

                <button
                  type="button"
                  onClick={handleExportZip}
                  disabled={isExportingZip}
                  className="px-6 py-3 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
                >
                  <Archive className="w-4 h-4 text-[#C49A35]" />
                  <span>{isExportingZip ? 'Packing Bundle...' : 'Download Full ZIP Bundle'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO CO-BRANDING */}
          {activeTab === 'branding' && (
            <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] space-y-4 max-w-xl">
              <div>
                <h4 className="font-cormorant font-bold text-2xl text-[#430914]">
                  Photographer Studio Co-Branding
                </h4>
                <p className="text-xs text-[#75675C]">
                  Automatically embed your photography studio credit on all downloaded 4K QR cards, Story posters, and live invitation footers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudioWatermark}
                    onChange={(e) => setIncludeStudioWatermark(e.target.checked)}
                    className="w-4 h-4 text-[#6E1020] rounded border-[#E8D5AD] focus:ring-[#C49A35]"
                  />
                  <span className="text-xs font-semibold text-[#430914]">
                    Include Studio Watermark on Generated Cards &amp; Posters
                  </span>
                </label>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#430914]">Custom Studio / Business Name</label>
                  <input
                    type="text"
                    value={customStudioName}
                    onChange={(e) => setCustomStudioName(e.target.value)}
                    placeholder="e.g. Royal Lens Photography"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8D5AD] rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35]"
                  />
                </div>

                <div className="p-3 bg-[#F8F3E8] rounded-xl border border-[#E8D5AD]/60 text-[11px] text-[#75675C]">
                  Preview text: <span className="font-semibold text-[#430914]">"Digital Architecture &amp; Photography by {effectiveStudioName}"</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 Footer Trust Ribbon */}
        <footer className="h-11 bg-[#24060B] border-t border-[#C49A35]/30 px-5 sm:px-8 flex items-center justify-between text-[11px] text-[#E8D5AD]/80 shrink-0 font-manrope">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>Lossless 300 DPI Vector &amp; Canvas Rendering</span>
          </div>
          <div className="flex items-center gap-1 text-[#C49A35] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AmantranLink Royal Digital Suite</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RoyalDownloadHubModal;
