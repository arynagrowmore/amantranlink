import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Volume2, VolumeX, Play, Pause, Upload, 
  Trash2, ArrowRight, Check, Sparkles, AlertCircle, Loader2 
} from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { useAuth } from '../context/AuthContext';
import { uploadWeddingMusic } from '../services/storageService';

interface MusicManagerProps {
  media: WeddingProjectState['media'];
  onChange: (updated: Partial<WeddingProjectState['media']>) => void;
  onSaveAndNext: () => void;
}

const PRESET_MELODIES = [
  { 
    id: 'shehnai-classic', 
    name: 'Lossless Vedic Shehnai & Nagada', 
    desc: 'Sacred classical Shehnai tune for royal entrance', 
    url: '/templates/rajmahal-template/FinalSong.mp3' 
  },
  { 
    id: 'flute-raag', 
    name: 'Divine Bansuri & Sitar Raag', 
    desc: 'Serene flute melody with traditional temple bells', 
    url: '/templates/rajmahal-template/FinalSong.mp3' 
  },
  { 
    id: 'royal-darbar', 
    name: 'Udaipur Palace Darbar Symphony', 
    desc: 'Grand instrumental symphony with subtle tabla rhythms', 
    url: '/templates/rajmahal-template/FinalSong.mp3' 
  },
];

export const MusicManager: React.FC<MusicManagerProps> = ({
  media,
  onChange,
  onSaveAndNext,
}) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeMelody, setActiveMelody] = useState<string>(media.bgMusicPreset || 'shehnai-classic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const isMusicEnabled = media.isMusicEnabled !== false;
  const currentAudioSrc = media.audioUrl || (media.audioBlob ? URL.createObjectURL(media.audioBlob) : '/templates/rajmahal-template/FinalSong.mp3');

  // Handle Play/Pause in Audio Preview Player
  const togglePlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav')) {
      alert('Please upload an audio file (MP3 or WAV).');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadWeddingMusic(file, user?.uid || 'guest_user');
      onChange({
        audioName: file.name,
        audioUrl: res.url,
        audioBlob: file,
        bgMusicPreset: 'custom',
        isMusicEnabled: true,
      });
      setActiveMelody('custom');
    } catch (err) {
      console.warn('Audio upload error, using local URL:', err);
      const objectUrl = URL.createObjectURL(file);
      onChange({
        audioName: file.name,
        audioUrl: objectUrl,
        audioBlob: file,
        bgMusicPreset: 'custom',
        isMusicEnabled: true,
      });
      setActiveMelody('custom');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCustomAudio = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    }
    onChange({
      audioName: 'FinalSong.mp3 (Default)',
      audioUrl: undefined,
      audioBlob: null,
      bgMusicPreset: 'shehnai-classic',
      isMusicEnabled: true,
    });
    setActiveMelody('shehnai-classic');
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-manrope">
      {/* Hidden Audio Player for Preview */}
      <audio
        ref={audioPreviewRef}
        src={currentAudioSrc}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header */}
      <div className="space-y-1 border-b border-[#E8D5AD]/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] text-[11px] font-semibold uppercase tracking-wider">
          <Music className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>STEP 06 · MUSIC &amp; AUDIO</span>
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
          Auspicious Wedding Music &amp; Shehnai
        </h3>
        <p className="text-xs text-[#75675C] leading-relaxed">
          Set the acoustic ambiance that plays when guests open your royal 3D invitation.
        </p>
      </div>

      {/* Music Master Enable/Disable Switch */}
      <div className="p-4 rounded-2xl bg-[#F8F3E8] border border-[#E8D5AD] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] flex items-center justify-center text-[#6E1020]">
            {isMusicEnabled ? <Volume2 className="w-4 h-4 text-[#C49A35]" /> : <VolumeX className="w-4 h-4 text-[#75675C]" />}
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[#430914]">
              Background Invitation Music
            </h4>
            <p className="text-[11px] text-[#75675C]">
              {isMusicEnabled ? 'Melody will play with floating music controller' : 'Invitation will open silently'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange({ isMusicEnabled: !isMusicEnabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isMusicEnabled ? 'bg-[#6E1020]' : 'bg-[#D8C7AA]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isMusicEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Preset Melodies Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#430914]">
            Choose Royal Heritage Melodies
          </label>
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1 text-xs text-[#6E1020] hover:text-[#430914] font-semibold cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#C49A35] fill-[#C49A35]" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#C49A35] fill-[#C49A35]" />
                <span>Listen Preview</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2.5">
          {PRESET_MELODIES.map((melody) => {
            const isSelected = !media.audioBlob && activeMelody === melody.id;
            return (
              <div
                key={melody.id}
                onClick={() => {
                  if (audioPreviewRef.current) {
                    audioPreviewRef.current.pause();
                    setIsPlaying(false);
                  }
                  setActiveMelody(melody.id);
                  onChange({
                    audioName: melody.name,
                    audioUrl: melody.url,
                    audioBlob: null,
                    bgMusicPreset: melody.id,
                    isMusicEnabled: true,
                  });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FFFDF8] border-[#C49A35] shadow-xs ring-1 ring-[#C49A35]/30'
                    : 'bg-[#F8F3E8] border-[#E8D5AD] hover:border-[#C49A35]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected ? 'bg-[#6E1020] text-[#FFFDF8] border-[#C49A35]' : 'bg-[#FFFDF8] text-[#6E1020] border-[#E8D5AD]'
                  }`}>
                    <Volume2 className="w-4 h-4 text-[#C49A35]" />
                  </div>
                  <div>
                    <h4 className="font-cormorant font-bold text-base text-[#430914]">
                      {melody.name}
                    </h4>
                    <p className="text-[11px] text-[#75675C]">
                      {melody.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#6E1020] text-[#FFFDF8] text-[10px] font-bold uppercase tracking-wider border border-[#C49A35]">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-[#75675C]">Select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Audio Upload Box */}
      <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#C49A35]" />
            <h4 className="font-cormorant font-bold text-lg text-[#430914]">
              Upload Custom Audio Track (MP3/WAV)
            </h4>
          </div>
          {media.audioBlob && (
            <button
              type="button"
              onClick={handleRemoveCustomAudio}
              className="text-xs text-rose-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          )}
        </div>

        {media.audioBlob ? (
          <div className="p-3 rounded-xl bg-[#F8F3E8] border border-[#C49A35]/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <Music className="w-4 h-4 text-[#6E1020] shrink-0" />
              <span className="font-medium text-[#430914] truncate">
                {media.audioName}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
              Custom Song Active
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#75675C] leading-relaxed">
            Have a special couple song, classical sitar recording, or custom family vocal track? Upload it directly to play in the background.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/mpeg"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] text-xs font-semibold text-[#430914] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 text-[#C49A35] animate-spin" />
              <span>Uploading to Shahi Cloud Storage…</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#C49A35]" />
              <span>{media.audioBlob ? 'Replace Audio File' : 'Select MP3/WAV File from Device'}</span>
            </>
          )}
        </button>
      </div>

      {/* Save & Continue */}
      <div className="pt-4 border-t border-[#E8D5AD]/60">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full py-3.5 rounded-full bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Check className="w-4 h-4 text-[#C49A35]" />
          <span>Save &amp; Continue to RSVP Configuration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MusicManager;
