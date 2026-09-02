import React, { useState } from 'react';
import { 
  X, Video, Play, Download, RefreshCw, Check, Sparkles, 
  Film, Clock, Layers, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { WeddingProjectState } from '../../types/wedding';
import { VideoInvitationConfig } from '../../types/export';
import { generateAnimatedVideoInvitation } from '../../services/exportService';

interface VideoInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  weddingSlug: string;
}

export const VideoInvitationModal: React.FC<VideoInvitationModalProps> = ({
  isOpen,
  onClose,
  state,
  weddingSlug,
}) => {
  const [config, setConfig] = useState<VideoInvitationConfig>({
    resolution: '720p',
    durationSeconds: 12,
    includeAudio: false,
    themeId: state.theme,
    language: state.language || 'en',
  });

  const [rendering, setRendering] = useState<boolean>(false);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateVideo = async () => {
    setRendering(true);
    setError(null);
    setProgressLabel('Initializing Video Engine');

    try {
      const { fileName, videoUrl: outputUrl } = await generateAnimatedVideoInvitation(
        state,
        config,
        (progress) => setProgressLabel(progress)
      );

      setVideoUrl(outputUrl);
      setDownloadFileName(fileName);
      setProgressLabel('Video Generated Successfully!');
    } catch (e: any) {
      console.error('Video generation error:', e);
      setError(e.message || 'Video rendering could not be completed. Please try again.');
    } finally {
      setRendering(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = downloadFileName || 'Royal_Wedding_Video_Invitation.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-manrope animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#120306] border border-[#C59B4B]/40 text-[#FFFDF8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Gold Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#540D1E] border border-[#F4D06F] flex items-center justify-center text-[#F4D06F]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#F4D06F] font-bold block">
                Cinematic Motion Engine
              </span>
              <h3 className="font-cormorant text-2xl font-bold text-white">
                Animated Video Invitation Studio
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Settings Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Storyboard Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4D06F] font-bold block">
                Cinematic Sequence (12s Story)
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-[#F4D06F] font-bold shrink-0">0-3s</span>
                  <div>
                    <div className="font-bold text-white">Auspicious Invocation</div>
                    <p className="text-[11px] text-[#D9C8CB]">Shree Ganesh blessings &amp; family invitation</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-[#F4D06F] font-bold shrink-0">3-6s</span>
                  <div>
                    <div className="font-bold text-white">Royal Couple Reveal</div>
                    <p className="text-[11px] text-[#D9C8CB]">
                      {state.couple.groomEn || 'Dhruv'} weds {state.couple.brideEn || 'Shreya'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-[#F4D06F] font-bold shrink-0">6-9s</span>
                  <div>
                    <div className="font-bold text-white">Date &amp; Muhurat</div>
                    <p className="text-[11px] text-[#D9C8CB]">
                      {state.couple.weddingDate || '10 December 2026'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-[#F4D06F] font-bold shrink-0">9-12s</span>
                  <div>
                    <div className="font-bold text-white">Royal Venue &amp; Welcome</div>
                    <p className="text-[11px] text-[#D9C8CB]">
                      {state.couple.venueName || 'The Milestone'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#F4D06F]">
                Video Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: '720p', label: '720p HD (Vertical)', desc: 'Fast & WhatsApp Ready' },
                    { id: '1080p', label: '1080p Full HD', desc: 'Crystal 9:16 Story' },
                  ] as const
                ).map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setConfig({ ...config, resolution: res.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.resolution === res.id
                        ? 'border-[#F4D06F] bg-[#F4D06F]/20 text-white'
                        : 'border-white/10 bg-white/5 text-[#D9C8CB] hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold block">{res.label}</span>
                    <span className="text-[10px] text-white/60">{res.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Video Preview Right Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/10 min-h-[380px] relative">
            
            {rendering ? (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-3 border-[#F4D06F] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="font-cormorant text-xl font-bold text-white">{progressLabel}</div>
                <p className="text-xs text-[#D9C8CB]">Rendering frame-by-frame 30 FPS video...</p>
              </div>
            ) : videoUrl ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="max-h-[360px] aspect-9/16 rounded-2xl overflow-hidden shadow-2xl border border-[#F4D06F]/40 bg-black">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-[#F4D06F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Video Ready for Download
                </span>
              </div>
            ) : (
              <div className="text-center max-w-xs space-y-3">
                <Film className="w-10 h-10 text-[#F4D06F] mx-auto opacity-70" />
                <h4 className="font-cormorant text-xl font-bold text-white">
                  Generate Motion Invitation
                </h4>
                <p className="text-xs text-[#D9C8CB] leading-relaxed">
                  Click below to render an animated vertical video invitation using your real couple names, wedding date, and venue.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  className="px-5 py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white border border-[#F4D06F]/40 text-xs font-bold transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>Start Video Render</span>
                </button>
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-900/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#D9C8CB]">
            Duration: <strong>12 Seconds</strong> · Format: <strong>9:16 Vertical Story</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              Close
            </button>

            {videoUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2 rounded-xl bg-[#F4D06F] hover:bg-[#E5BF5E] text-[#120306] text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video File</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoInvitationModal;
