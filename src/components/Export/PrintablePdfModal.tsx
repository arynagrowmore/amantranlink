import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, Download, Eye, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, FileText, Check, Layout, Settings
} from 'lucide-react';
import { WeddingProjectState, Language } from '../../types/wedding';
import { PrintablePdfConfig, PaperFormat, PrintLayout } from '../../types/export';
import { 
  renderHighResKankotriCanvas, 
  generateDigitalPdfBlob, 
  PAPER_DIMENSIONS 
} from '../../services/exportService';

interface PrintablePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  weddingSlug: string;
}

export const PrintablePdfModal: React.FC<PrintablePdfModalProps> = ({
  isOpen,
  onClose,
  state,
  weddingSlug,
}) => {
  const [config, setConfig] = useState<PrintablePdfConfig>({
    paperFormat: 'a4',
    layout: 'single_page',
    includeBleedMarks: true,
    bleedMm: 3,
    language: state.language || 'en',
    dpi: 300,
  });

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const updatePreview = async () => {
    setRendering(true);
    try {
      const canvas = await renderHighResKankotriCanvas(state, config);
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    } catch (e) {
      console.error('Error rendering preview canvas:', e);
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePreview();
    }
  }, [isOpen, config.paperFormat, config.includeBleedMarks, config.language, state]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { blob, fileName } = await generateDigitalPdfBlob(state, config);
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

  const currentDims = PAPER_DIMENSIONS[config.paperFormat];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Gold Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF6EE] shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              High-Res Print Studio
            </span>
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              Printable PDF Kankotri Generator
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

        {/* Modal Body: Settings (Left) + High-Res Canvas Preview (Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Print Configurations (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Paper Size */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                Paper Format (300 DPI)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'a4', label: 'A4 Standard', desc: '210 × 297 mm' },
                    { id: 'a5', label: 'A5 Compact', desc: '148 × 210 mm' },
                    { id: 'square', label: 'Square Card', desc: '8 × 8 inches' },
                    { id: '5x7', label: '5 × 7" Royal', desc: '127 × 178 mm' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setConfig({ ...config, paperFormat: fmt.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.paperFormat === fmt.id
                        ? 'border-[#540D1E] bg-[#FAF4E8] ring-1 ring-[#540D1E]'
                        : 'border-[#E8DFD1] bg-white hover:bg-[#FAF6EF]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#20181A] block">{fmt.label}</span>
                    <span className="text-[10px] text-[#736567]">{fmt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                Script &amp; Language
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
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      config.language === l.id
                        ? 'border-[#540D1E] bg-[#540D1E] text-white'
                        : 'border-[#E8DFD1] bg-white text-[#4A3E40] hover:bg-[#FAF6EF]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bleed & Trim Marks */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8DFD1] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#20181A] block">Printer Bleed &amp; Trim Guides</span>
                  <span className="text-[10px] text-[#736567]">Include 3mm safe margin boundary for cutting</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeBleedMarks}
                  onChange={(e) => setConfig({ ...config, includeBleedMarks: e.target.checked })}
                  className="w-4 h-4 accent-[#540D1E] cursor-pointer"
                />
              </div>
            </div>

            {/* Print Dimensions Callout */}
            <div className="p-3.5 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs space-y-1 text-[#136A4E]">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>300 DPI Vector Print-Ready</span>
              </div>
              <p className="text-[11px] text-[#247559]">
                Output resolution: {currentDims.width} × {currentDims.height} pixels. Preserves crisp Unicode glyphs and colors.
              </p>
            </div>

          </div>

          {/* Right Column: Live Render Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-[#FAF6EE] rounded-2xl border border-[#E8DFD1] min-h-[380px] relative overflow-hidden">
            
            {rendering ? (
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#736567]">Rendering high-res print artwork...</p>
              </div>
            ) : previewDataUrl ? (
              <div className="relative max-h-[460px] w-auto shadow-2xl rounded-lg overflow-hidden border border-[#C59B4B]/40 animate-scaleUp">
                <img 
                  src={previewDataUrl} 
                  alt="Print Preview" 
                  className="max-h-[460px] w-auto object-contain"
                />
              </div>
            ) : null}

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#E8DFD1] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#736567]">
            Format: <strong className="text-[#350811]">{currentDims.label}</strong>
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
              <span>{downloading ? 'Exporting Artwork...' : downloadSuccess ? 'Downloaded!' : 'Download Print PDF Kankotri'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintablePdfModal;
