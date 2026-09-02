import React, { useState, useEffect } from 'react';
import { 
  X, Image as ImageIcon, Download, Check, RefreshCw, 
  Sparkles, Layers, Share2 
} from 'lucide-react';
import { WeddingProjectState } from '../../types/wedding';
import { HdImageConfig, ImageRatio } from '../../types/export';
import { generateHdImageBlob } from '../../services/exportService';

interface HdImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  weddingSlug: string;
}

export const HdImageExportModal: React.FC<HdImageExportModalProps> = ({
  isOpen,
  onClose,
  state,
  weddingSlug,
}) => {
  const [config, setConfig] = useState<HdImageConfig>({
    format: 'png',
    ratio: 'portrait',
    quality: 0.95,
    language: state.language || 'en',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const updatePreview = async () => {
    setRendering(true);
    try {
      const { dataUrl } = await generateHdImageBlob(state, config);
      setPreviewUrl(dataUrl);
    } catch (e) {
      console.error('Image preview error:', e);
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePreview();
    }
  }, [isOpen, config.format, config.ratio, config.language, state]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { blob, fileName } = await generateHdImageBlob(state, config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Gold Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF6EE] shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              Social Media &amp; Sharing
            </span>
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              HD Invitation Image Generator
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Settings Left Column */}
          <div className="space-y-4">
            
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'portrait', label: 'Portrait (4:5)', desc: 'Instagram / Feed' },
                    { id: 'square', label: 'Square (1:1)', desc: 'WhatsApp DP' },
                    { id: 'story', label: 'Story (9:16)', desc: 'Reels / Status' },
                    { id: 'original', label: 'Standard (3:4)', desc: 'Printable Card' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setConfig({ ...config, ratio: r.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.ratio === r.id
                        ? 'border-[#540D1E] bg-[#FAF4E8] ring-1 ring-[#540D1E]'
                        : 'border-[#E8DFD1] bg-white hover:bg-[#FAF6EF]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#20181A] block">{r.label}</span>
                    <span className="text-[10px] text-[#736567]">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                File Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, format: 'png' })}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    config.format === 'png'
                      ? 'border-[#540D1E] bg-[#540D1E] text-white'
                      : 'border-[#E8DFD1] bg-white text-[#4A3E40] hover:bg-[#FAF6EF]'
                  }`}
                >
                  PNG (Lossless Crystal)
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, format: 'jpeg' })}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    config.format === 'jpeg'
                      ? 'border-[#540D1E] bg-[#540D1E] text-white'
                      : 'border-[#E8DFD1] bg-white text-[#4A3E40] hover:bg-[#FAF6EF]'
                  }`}
                >
                  JPG (Lightweight)
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                Language Script
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'हिन्दी' },
                    { id: 'gu', label: 'ગુજરાતી' },
                  ] as const
                ).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setConfig({ ...config, language: l.id })}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      config.language === l.id
                        ? 'border-[#540D1E] bg-[#FAF4E8] text-[#540D1E]'
                        : 'border-[#E8DFD1] bg-white text-[#4A3E40]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Render Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#FAF6EE] rounded-2xl border border-[#E8DFD1] min-h-[300px]">
            {rendering ? (
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#736567]">Rendering HD invitation...</p>
              </div>
            ) : previewUrl ? (
              <div className="relative max-h-[360px] w-auto shadow-xl rounded-lg overflow-hidden border border-[#C59B4B]/30 animate-scaleUp">
                <img 
                  src={previewUrl} 
                  alt="HD Preview" 
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>
            ) : null}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8DFD1] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#736567]">
            Format: <strong className="text-[#350811] uppercase">{config.format} · {config.ratio}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40] hover:bg-[#FAF6EF] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#F4D06F]" />
              )}
              <span>{downloading ? 'Exporting Image...' : downloadSuccess ? 'Downloaded!' : 'Download HD Image'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HdImageExportModal;
