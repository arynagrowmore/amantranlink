import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Heart, Sparkles, Send, 
  CheckCircle2, X, AlertCircle, MessageSquare, Maximize2, 
  RefreshCw, User, Users, Play, Pause, ChevronRight, Share2, Eye
} from 'lucide-react';
import { WeddingMemory } from '../../types/memories';
import { 
  submitWeddingMemory, 
  fetchPublicApprovedMemories 
} from '../../services/memoryService';
import { LiveWishesWallModal } from './LiveWishesWallModal';

interface PublicMemoryDropViewProps {
  weddingSlug: string;
  weddingSiteId?: string | null;
  coupleNames?: string;
  guestNamePrefill?: string;
  familyNamePrefill?: string;
  guestId?: string | null;
  onBackToInvite?: () => void;
}

export const PublicMemoryDropView: React.FC<PublicMemoryDropViewProps> = ({
  weddingSlug,
  weddingSiteId,
  coupleNames = 'Dhruv & Shreya',
  guestNamePrefill = '',
  familyNamePrefill = '',
  guestId = null,
  onBackToInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'wall'>('upload');
  const [guestName, setGuestName] = useState<string>(guestNamePrefill);
  const [familyName, setFamilyName] = useState<string>(familyNamePrefill);
  const [message, setMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gallery state
  const [approvedMemories, setApprovedMemories] = useState<WeddingMemory[]>([]);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(false);
  const [zoomedMemory, setZoomedMemory] = useState<WeddingMemory | null>(null);
  const [isProjectorWallOpen, setIsProjectorWallOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadGallery = async () => {
    setLoadingGallery(true);
    const data = await fetchPublicApprovedMemories(weddingSlug);
    setApprovedMemories(data);
    setLoadingGallery(false);
  };

  useEffect(() => {
    loadGallery();
  }, [weddingSlug]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Please upload a standard image file (JPEG, PNG, or WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Selected image is larger than 10MB.');
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClearPhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (!selectedFile && !message.trim()) {
      setErrorMessage('Please attach a photo or write your blessing message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitWeddingMemory({
      wedding_slug: weddingSlug,
      wedding_site_id: weddingSiteId,
      guest_id: guestId,
      guest_name: guestName.trim(),
      family_name: familyName.trim() || null,
      message: message.trim() || null,
      media_file: selectedFile,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      setMessage('');
      handleClearPhoto();
    } else {
      setErrorMessage(res.error || 'Failed to submit your memory. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope flex flex-col justify-between py-6 px-4 sm:px-6">
      
      <div className="w-full max-w-3xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & NAVIGATION                                                */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
                AmantranLink · Wedding Memories &amp; Guestbook
              </span>
            </div>
            <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#350811] mt-0.5">
              {coupleNames}
            </h1>
            <p className="text-xs text-[#6C5D60] mt-0.5">
              Capture a moment. Share a blessing. Become part of their wedding story.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToInvite && (
              <button
                type="button"
                onClick={onBackToInvite}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40] hover:bg-[#FAF6EF] transition-colors cursor-pointer"
              >
                ← Back to Invitation
              </button>
            )}

            {/* Sub-tab Navigation */}
            <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-white text-[#540D1E] shadow-2xs' : 'text-[#6C5D60] hover:text-[#20181A]'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#9C772F]" />
                <span>Drop Photo &amp; Wish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('wall');
                  loadGallery();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'wall' ? 'bg-white text-[#540D1E] shadow-2xs' : 'text-[#6C5D60] hover:text-[#20181A]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Wishes Wall ({approvedMemories.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB 1: PHOTO DROP & BLESSINGS FORM                                     */}
        {/* ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="max-w-xl mx-auto bg-white border border-[#E8DFD1] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Top Gold Accent */}
            <div className="-mt-8 -mx-8 h-1.5 bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F]" />

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4 animate-scaleUp">
                <div className="w-14 h-14 rounded-full bg-[#EDF7F2] border-2 border-[#167A5A] flex items-center justify-center text-[#167A5A] mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-cormorant text-3xl font-bold text-[#350811]">
                  Thank You for Your Blessings!
                </h3>
                <p className="text-xs sm:text-sm text-[#6C5D60] max-w-sm mx-auto leading-relaxed">
                  Your wedding memory has been safely received. It will appear on the Live Wishes Wall once reviewed by the wedding hosts.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-semibold text-[#4A3E40] transition-colors cursor-pointer"
                  >
                    + Share Another Memory
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('wall');
                      loadGallery();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    View Wishes Wall →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C772F] font-bold">
                    Digital Guestbook &amp; Photo Drop
                  </span>
                  <h2 className="font-cormorant text-2xl font-bold text-[#20181A]">
                    Share a Moment with the Couple
                  </h2>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-[#FDF2F2] border border-[#F0D5D5] rounded-xl text-xs text-[#8C4A4A] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Photo Drop Area */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                    Photo Attachment (Optional)
                  </label>

                  {previewUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#E8DFD1] bg-[#FAF8F5] aspect-4/3 flex items-center justify-center">
                      <img src={previewUrl} alt="Upload preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={handleClearPhoto}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E8DFD1] hover:border-[#9C772F] rounded-2xl p-6 text-center bg-[#FAF8F5] hover:bg-[#FAF4E8] transition-colors cursor-pointer space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto shadow-2xs">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#540D1E]">Click to take photo or choose from library</span>
                        <p className="text-[10px] text-[#736567] mt-0.5">Supports JPEG, PNG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Blessing Message */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase font-bold text-[#736567]">
                    Your Wedding Wishes &amp; Blessings
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your heartfelt congratulations, memories, or blessings for the couple..."
                    className="w-full p-3 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Identity Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                      Your Full Name <span className="text-[#8C4A4A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Mukeshbhai Patel"
                      className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                      Family / Group Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="e.g. Patel Parivar, Ahmedabad"
                      className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#540D1E] hover:bg-[#681025] active:bg-[#430914] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 text-[#F4D06F] ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Uploading & Submitting...' : 'Share Memory & Blessings'}</span>
                </button>

                <p className="text-[10px] text-center text-[#736567]">
                  🛡️ Submissions are moderated to ensure a family-friendly wedding memories album.
                </p>

              </form>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB 2: PUBLIC WISHES WALL & APPROVED MEMORIES GALLERY                  */}
        {/* ========================================================================= */}
        {activeTab === 'wall' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Gallery Control Bar */}
            <div className="p-3 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#350811]">{approvedMemories.length} Approved Wishes &amp; Photos</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadGallery}
                  disabled={loadingGallery}
                  className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#F2ECE1] text-[#736567] border border-[#E8DFD1] text-xs transition-colors cursor-pointer"
                  title="Refresh Gallery"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGallery ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsProjectorWallOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Launch Fullscreen Projector Wishes Wall"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>Live Projector Mode</span>
                </button>
              </div>
            </div>

            {/* Approved Memories Grid */}
            {loadingGallery ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#736567]">Loading approved wedding blessings...</p>
              </div>
            ) : approvedMemories.length === 0 ? (
              <div className="py-16 text-center bg-white border border-[#E8DFD1] rounded-3xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                  No Memories Displayed Yet
                </h3>
                <p className="text-xs text-[#736567] max-w-sm mx-auto">
                  Be the first guest to drop a wedding photo or write your warm blessings for {coupleNames}!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer"
                >
                  + Share First Memory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedMemories.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-white border rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                      m.is_featured ? 'border-[#F4D06F] ring-2 ring-[#F4D06F]/40' : 'border-[#E8DFD1]'
                    }`}
                  >
                    {/* Media Photo if attached */}
                    {m.media_url && (
                      <div 
                        onClick={() => setZoomedMemory(m)}
                        className="relative aspect-4/3 bg-[#FAF8F5] overflow-hidden cursor-pointer group"
                      >
                        <img 
                          src={m.media_url} 
                          alt="Wedding memory" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-6 h-6 drop-shadow-md" />
                        </div>
                        {m.is_featured && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#350811]/85 text-[#F4D06F] text-[9px] font-bold tracking-wider uppercase border border-[#F4D06F]/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content Body */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      {m.message && (
                        <p className="text-xs text-[#2A171B] leading-relaxed italic">
                          "{m.message}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-[10px] text-[#736567]">
                        <div>
                          <div className="font-bold text-[#20181A] text-xs">{m.guest_name}</div>
                          {m.family_name && <div className="text-[10px] text-[#8C7A7C]">{m.family_name}</div>}
                        </div>
                        <span>
                          {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* 🔍 Zoomed Memory Modal */}
      {zoomedMemory && (
        <div 
          onClick={() => setZoomedMemory(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4 border border-[#E8DFD1]"
          >
            {zoomedMemory.media_url && (
              <div className="max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img src={zoomedMemory.media_url} alt="Memory zoom" className="max-h-[70vh] w-auto object-contain" />
              </div>
            )}
            <div className="p-2 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#20181A]">{zoomedMemory.guest_name}</h4>
                {zoomedMemory.family_name && <p className="text-xs text-[#736567]">{zoomedMemory.family_name}</p>}
                {zoomedMemory.message && <p className="text-xs italic text-[#4A3E40] mt-1">"{zoomedMemory.message}"</p>}
              </div>
              <button
                type="button"
                onClick={() => setZoomedMemory(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F2ECE1] text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📽️ Live Projector Wishes Wall Modal */}
      <LiveWishesWallModal
        isOpen={isProjectorWallOpen}
        onClose={() => setIsProjectorWallOpen(false)}
        weddingSlug={weddingSlug}
        coupleNames={coupleNames}
      />

    </div>
  );
};

export default PublicMemoryDropView;
