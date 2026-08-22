import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, X, Sparkles, Filter } from 'lucide-react';
import { PhotoFilterType } from '../types/wedding';

interface ImageCropperModalProps {
  imageUrl: string;
  initialFilter?: PhotoFilterType;
  onSave: (croppedDataUrl: string, file: File, filter: PhotoFilterType) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageUrl,
  initialFilter = 'none',
  onSave,
  onClose,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [aspect, setAspect] = useState<'4:5' | '1:1' | '16:9' | 'free'>('4:5');
  const [activeFilter, setActiveFilter] = useState<PhotoFilterType>(initialFilter);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      redrawCanvas();
    };
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [rotation, zoom, aspect, activeFilter]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on aspect ratio
    let targetWidth = 800;
    let targetHeight = 1000;

    if (aspect === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (aspect === '16:9') {
      targetWidth = 960;
      targetHeight = 540;
    } else if (aspect === 'free') {
      targetWidth = img.width || 800;
      targetHeight = img.height || 1000;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply Filter Canvas Effects
    if (activeFilter === 'gold-glow') {
      ctx.filter = 'sepia(35%) saturate(140%) brightness(105%) contrast(105%)';
    } else if (activeFilter === 'vintage') {
      ctx.filter = 'sepia(60%) contrast(110%) brightness(95%) saturate(90%)';
    } else if (activeFilter === 'rose-blush') {
      ctx.filter = 'saturate(120%) brightness(105%) hue-rotate(-10deg) contrast(102%)';
    } else if (activeFilter === 'monochrome') {
      ctx.filter = 'grayscale(100%) contrast(120%) brightness(100%)';
    } else {
      ctx.filter = 'none';
    }

    // Translate & Rotate around center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw Image
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (-img.width * ratio) / 2;
    const centerShiftY = (-img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );

    ctx.restore();
  };

  const handleApplySave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], `shahi_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const croppedUrl = URL.createObjectURL(croppedFile);
        onSave(croppedUrl, croppedFile, activeFilter);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6EE] border border-brand-gold rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-brand-light border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold-dark" />
            <h3 className="font-cinzel font-bold text-sm text-brand-maroon">
              Photo Studio · Filters &amp; Crop
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-brand-maroon transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-black/90 p-4 flex items-center justify-center overflow-hidden min-h-[300px]">
          <canvas
            ref={canvasRef}
            className="max-h-[380px] max-w-full object-contain rounded-xl shadow-2xl border border-white/20"
          />
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-white border-t border-brand-border space-y-4">
          {/* Aspect Presets & Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-brand-maroon">Aspect Ratio:</span>
              <div className="flex items-center gap-1.5">
                {(['4:5', '1:1', '16:9', 'free'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspect(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      aspect === r
                        ? 'bg-brand-maroon text-white shadow-sm'
                        : 'bg-brand-light text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Royal Filters */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono font-bold text-brand-maroon flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Royal Filter:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'gold-glow', label: '👑 Gold Glow' },
                  { id: 'vintage', label: '📜 Vintage' },
                  { id: 'rose-blush', label: '🌸 Rose Blush' },
                  { id: 'monochrome', label: '🤍 Vogue B&W' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id as PhotoFilterType)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                      activeFilter === f.id
                        ? 'bg-brand-gold-dark text-white shadow'
                        : 'bg-brand-light text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rotate & Zoom Controls */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Rotation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRotation((prev) => prev - 90)}
                className="p-2 rounded-xl bg-brand-light hover:bg-brand-border text-brand-maroon border border-brand-border flex items-center gap-1 text-xs font-bold font-mono"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-4 h-4" />
                <span>-90°</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => prev + 90)}
                className="p-2 rounded-xl bg-brand-light hover:bg-brand-border text-brand-maroon border border-brand-border flex items-center gap-1 text-xs font-bold font-mono"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-4 h-4" />
                <span>+90°</span>
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <ZoomOut className="w-4 h-4 text-brand-muted shrink-0" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-brand-maroon cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-brand-muted shrink-0" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-brand-light hover:bg-brand-border text-brand-maroon font-bold text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySave}
                className="px-4 py-2 rounded-xl bg-brand-maroon hover:bg-brand-crimson text-brand-gold-light font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 text-brand-gold" />
                <span>Apply &amp; Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
