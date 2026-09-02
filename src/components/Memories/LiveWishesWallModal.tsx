import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Maximize2, Minimize2, Sparkles, 
  Heart, RefreshCw, ChevronLeft, ChevronRight, QrCode
} from 'lucide-react';
import { WeddingMemory } from '../../types/memories';
import { fetchPublicApprovedMemories } from '../../services/memoryService';
import { QRCodeDisplay } from '../QR/QRCodeDisplay';

interface LiveWishesWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingSlug: string;
  coupleNames?: string;
}

export const LiveWishesWallModal: React.FC<LiveWishesWallModalProps> = ({
  isOpen,
  onClose,
  weddingSlug,
  coupleNames = 'Dhruv & Shreya',
}) => {
  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const memoryDropUrl = `${originUrl}/memories?slug=${weddingSlug}`;

  const loadMemories = async () => {
    setLoading(true);
    const data = await fetchPublicApprovedMemories(weddingSlug);
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen, weddingSlug]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isOpen || !isPlaying || memories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, memories.length]);

  if (!isOpen) return null;

  const current = memories[currentIndex] || null;

  return (
    <div className="fixed inset-0 z-50 bg-[#120306] text-[#FFFDF8] font-manrope flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
      
      {/* Top Projector Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#540D1E] border border-[#F4D06F] flex items-center justify-center text-[#F4D06F] font-serif text-lg font-bold shadow-lg">
            👑
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F4D06F] font-bold block">
              Live Wedding Wishes &amp; Memory Wall
            </span>
            <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-white">
              {coupleNames}
            </h2>
          </div>
        </div>

        {/* Projector Controls */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C59B4B]/30">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#F4D06F] transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={loadMemories}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Refresh Live Submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#E8DFD1] transition-colors cursor-pointer"
            title="Close Projector Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage */}
      <div className="flex-1 flex items-center justify-center p-4 my-4 relative">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-3 border-[#F4D06F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#D9C8CB]">Connecting to live wedding feed...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center max-w-md space-y-4 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <Sparkles className="w-10 h-10 text-[#F4D06F] mx-auto animate-pulse" />
            <h3 className="font-cormorant text-3xl font-bold text-white">
              Scan to Drop the First Blessing!
            </h3>
            <p className="text-xs text-[#D9C8CB] leading-relaxed">
              Guests can scan the QR code below to drop photos and wishes directly onto this screen.
            </p>
          </div>
        ) : current ? (
          <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 bg-white/5 border border-[#C59B4B]/30 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl animate-scaleUp">
            
            {/* Image display if photo memory */}
            {current.media_url ? (
              <div className="w-full md:w-1/2 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
                <img src={current.media_url} alt="Memory" className="w-full h-full object-cover" />
              </div>
            ) : null}

            {/* Wishes Text & Guest Attribution */}
            <div className={`space-y-4 text-left ${current.media_url ? 'w-full md:w-1/2' : 'w-full text-center max-w-2xl mx-auto'}`}>
              
              {current.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4D06F]/20 text-[#F4D06F] text-xs font-mono font-bold tracking-wider uppercase border border-[#F4D06F]/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Blessing
                </span>
              )}

              {current.message && (
                <blockquote className="font-cormorant text-2xl sm:text-4xl font-semibold leading-snug text-[#FAF6EE] italic">
                  "{current.message}"
                </blockquote>
              )}

              <div className="pt-3 border-t border-white/10 space-y-0.5">
                <h4 className="font-bold text-lg text-[#F4D06F]">{current.guest_name}</h4>
                {current.family_name && (
                  <p className="text-xs text-[#D9C8CB]">{current.family_name}</p>
                )}
              </div>
            </div>

          </div>
        ) : null}
      </div>

      {/* Bottom Bar: Live QR Scan Prompt & Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 border-t border-white/10 pt-4">
        
        {/* Memory Counter */}
        <div className="text-xs text-[#D9C8CB] font-mono">
          {memories.length > 0 ? `Showing ${currentIndex + 1} of ${memories.length} Memories` : 'Live Feed Ready'}
        </div>

        {/* Mini QR Drop Overlay */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-md">
          <QRCodeDisplay 
            value={memoryDropUrl} 
            size={48} 
            darkColor="#120306" 
            lightColor="#FFFFFF"
            className="p-1 rounded-lg"
          />
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase font-bold text-[#F4D06F] block">
              Scan to Drop Photo &amp; Wish
            </span>
            <p className="text-[11px] text-white font-medium">Join the live wedding memory wall</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LiveWishesWallModal;
