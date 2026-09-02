import React, { useState } from 'react';
import { Upload, Music, Image as ImageIcon, Sparkles, Download, Check, RefreshCw, Eye, Wand2, Trash2, ArrowRight, Loader2, UploadCloud, AlertTriangle, X } from 'lucide-react';
import { WeddingProjectState, PhotoFilterType, ThemeId } from '../types/wedding';
import { ImageCropperModal } from './ImageCropperModal';
import { useAuth } from '../context/AuthContext';
import { uploadWeddingPhoto, uploadWeddingMusic, deleteWeddingPhoto } from '../services/storageService';

interface MediaUploaderProps {
  theme?: ThemeId;
  invitationType?: 'wedding' | 'engagement';
  media: WeddingProjectState['media'];
  onChange: (updated: Partial<WeddingProjectState['media']>) => void;
  onSaveAndExport: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  theme = 'rajmahal', 
  invitationType,
  media, 
  onChange, 
  onSaveAndExport 
}) => {
  const { user } = useAuth();
  const isEngagement = invitationType === 'engagement';
  const [activeCropSlotId, setActiveCropSlotId] = useState<string | null>(null);
  const [tempCropImageUrl, setTempCropImageUrl] = useState<string>('');
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [confirmDeleteSlotId, setConfirmDeleteSlotId] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');
  const [uploadingAudio, setUploadingAudio] = useState<boolean>(false);

  const slots = media.photoSlots || {};

  const getSlot = (id: string) => {
    return slots[id] || 
      (id === 'hero' ? (slots.couple_main || slots.couple) : undefined) ||
      (id === 'groom' ? slots.groom_portrait : undefined) ||
      (id === 'bride' ? slots.bride_portrait : undefined) ||
      (id === 'gallery1' ? slots.gallery_1 : undefined) ||
      (id === 'gallery2' ? slots.gallery_2 : undefined) ||
      (id === 'gallery3' ? slots.gallery_3 : undefined) ||
      (id === 'gallery4' ? (slots.gallery_4 || slots.family_photo) : undefined) ||
      (id === 'gallery5' ? slots.gallery_5 : undefined) ||
      (id === 'gallery6' ? slots.gallery_6 : undefined);
  };

  const handleReorderGallery = (slotIdA: string, slotIdB: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const slotA = getSlot(slotIdA);
    const slotB = getSlot(slotIdB);
    if (!slotA && !slotB) return;

    const updatedSlots = {
      ...slots,
      [slotIdA]: {
        id: slotIdA,
        title: slotIdA,
        description: '',
        icon: '📸',
        url: slotB?.url || '',
        storagePath: slotB?.storagePath || '',
        file: slotB?.file || null,
        filter: slotB?.filter || ('none' as PhotoFilterType),
      },
      [slotIdB]: {
        id: slotIdB,
        title: slotIdB,
        description: '',
        icon: '📸',
        url: slotA?.url || '',
        storagePath: slotA?.storagePath || '',
        file: slotA?.file || null,
        filter: slotA?.filter || ('none' as PhotoFilterType),
      },
    };
    onChange({ photoSlots: updatedSlots });
  };

  const handleSlotFileSelect = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setActiveCropSlotId(slotId);
    setTempCropImageUrl(objectUrl);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string, file: File, filter: PhotoFilterType) => {
    if (!activeCropSlotId) return;

    const currentSlot = activeCropSlotId;
    const oldSlotData = getSlot(currentSlot);
    const oldStorageTarget = oldSlotData?.storagePath || oldSlotData?.url;

    setActiveCropSlotId(null);
    setTempCropImageUrl('');

    const updatedSlots = {
      ...slots,
      [currentSlot]: {
        id: currentSlot,
        title: currentSlot,
        description: '',
        icon: '📸',
        url: croppedDataUrl,
        storagePath: '',
        file: file,
        filter: filter,
      },
    };
    onChange({ photoSlots: updatedSlots });

    const uploadUserId = user?.uid || 'studio_user';
    setUploadingSlotId(currentSlot);
    try {
      const { url: cloudUrl, path: cloudPath } = await uploadWeddingPhoto(file, uploadUserId, currentSlot);
      if (cloudUrl) {
        onChange({
          photoSlots: {
            ...updatedSlots,
            [currentSlot]: {
              ...updatedSlots[currentSlot],
              url: cloudUrl,
              storagePath: cloudPath || '',
            },
          },
        });

        if (oldStorageTarget && oldStorageTarget !== cloudUrl && oldStorageTarget !== cloudPath) {
          deleteWeddingPhoto(oldStorageTarget).catch((err) => {
            console.warn('Old photo cleanup note:', err);
          });
        }
      }
    } catch (e) {
      console.warn('Storage upload error:', e);
    } finally {
      setUploadingSlotId(null);
    }
  };

  const handleOpenExistingCrop = (slotId: string) => {
    const currentUrl = getSlot(slotId)?.url;
    if (!currentUrl) return;
    setActiveCropSlotId(slotId);
    setTempCropImageUrl(currentUrl);
  };

  const handlePromptDelete = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteErrorMsg('');
    setConfirmDeleteSlotId(slotId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteSlotId) return;

    const slotId = confirmDeleteSlotId;
    setDeletingSlotId(slotId);
    setDeleteErrorMsg('');

    try {
      const currentSlotData = getSlot(slotId);
      const targetUrlOrPath = currentSlotData?.storagePath || currentSlotData?.url;

      if (targetUrlOrPath) {
        const delResult = await deleteWeddingPhoto(targetUrlOrPath);
        if (!delResult.success) {
          setDeleteErrorMsg(delResult.error || 'Unable to delete photo from storage. Please try again.');
          setDeletingSlotId(null);
          return;
        }
      }

      const updatedSlots = {
        ...slots,
        [slotId]: {
          id: slotId,
          title: slotId,
          description: '',
          icon: '📸',
          url: '',
          storagePath: '',
          file: null,
          filter: 'none' as PhotoFilterType,
        },
      };

      onChange({ photoSlots: updatedSlots });
      setConfirmDeleteSlotId(null);
    } catch (err: any) {
      console.error('Delete photo error:', err);
      setDeleteErrorMsg(err?.message || 'Failed to delete photo. Please try again.');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange({
      audioName: file.name,
      audioBlob: file,
    });

    const uploadUserId = user?.uid || 'studio_user';
    setUploadingAudio(true);
    try {
      const { url: cloudAudioUrl } = await uploadWeddingMusic(file, uploadUserId);
      if (cloudAudioUrl) {
        onChange({
          audioUrl: cloudAudioUrl,
        });
      }
    } catch (err) {
      console.warn('Audio cloud sync error:', err);
    } finally {
      setUploadingAudio(false);
    }
  };

  const portraitSlots = isEngagement ? [
    { id: 'hero', label: '1. Couple Hero (The Royal Ring)', req: 'Cover & Centerpiece Portrait' },
    { id: 'groom', label: '2. Person 1 Portrait', req: 'Partner 1 Story Card' },
    { id: 'bride', label: '3. Person 2 Portrait', req: 'Partner 2 Story Card' },
  ] : [
    { id: 'hero', label: '1. Palace Grand Reveal (Couple)', req: 'Cover & Main Reveal Portrait' },
    { id: 'groom', label: '2. Maharaja Dulha Portrait', req: 'Groom Story Card' },
    { id: 'bride', label: '3. Maharani Dulhan Portrait', req: 'Bride Story Card' },
  ];

  const gallerySlots = isEngagement ? [
    { id: 'gallery1', label: 'Ring Ceremony Moment', req: 'Dual Rings Exchange' },
    { id: 'gallery2', label: 'Family Blessings', req: 'Family Joy & Blessings' },
    { id: 'gallery3', label: 'Moments Gallery Photo 1', req: 'First Meeting / Proposal' },
    { id: 'gallery4', label: 'Moments Gallery Photo 2', req: 'Coffee & Long Talks' },
    { id: 'gallery5', label: 'Moments Gallery Photo 3', req: 'Two Families Unite' },
    { id: 'gallery6', label: 'Moments Gallery Photo 4', req: 'Lifetime Memories' },
  ] : [
    { id: 'gallery1', label: 'Gallery Photo 1', req: 'First Meeting / Sangeet' },
    { id: 'gallery2', label: 'Gallery Photo 2', req: 'Under The Mandap / Haldi' },
    { id: 'gallery3', label: 'Gallery Photo 3', req: 'Sacred Vows / Pheras' },
    { id: 'gallery4', label: 'Gallery Photo 4', req: 'Family Blessings' },
    { id: 'gallery5', label: 'Gallery Photo 5', req: 'Reception Elegance' },
    { id: 'gallery6', label: 'Gallery Photo 6', req: 'Lifetime Memories' },
  ];

  const totalUploaded = Object.values(slots).filter((s) => Boolean(s?.url)).length;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces font-bold text-base text-[#6B1420] flex items-center gap-1.5">
            <span>{isEngagement ? '5. Couple & Moments Studio' : '5. Chhavi & Sangeet Studio'}</span>
          </h3>
          <p className="text-[10px] font-hanken text-[#6B5A4A]">
            {isEngagement 
              ? 'Portraits & Dynamic 6-Photo Moments Gallery · High Definition Canvas'
              : 'Portraits & Dynamic 6-Photo Gallery · Supabase Storage CDN · Background Music'}
          </p>
        </div>
        <span className="stamped-label text-[#6B1420] bg-[#EDE0C8] border border-[#D8C7AA] px-2 py-0.5 rounded font-mono text-[10px]">
          {totalUploaded}/9 Active
        </span>
      </div>

      <div className="p-4 rounded-2xl shahi-card-flat space-y-2.5 bg-[#F7F0DD]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B1420] flex items-center gap-1.5 font-fraunces">
            <Music className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>Background Shehnai / Sangeet Music (MP3)</span>
          </span>
          {uploadingAudio && (
            <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading to CDN...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-[#D8C7AA] text-xs font-fraunces font-bold text-[#6B1420] cursor-pointer flex items-center gap-2 shadow-xs transition-all">
            <UploadCloud className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>{media.audioName ? 'Change Track' : 'Choose Audio File'}</span>
            <input
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a"
              className="hidden"
              onChange={handleAudioUpload}
            />
          </label>

          <span className="text-[11px] font-mono text-[#6B5A4A] truncate max-w-[220px]">
            {media.audioName || 'Default Royal Shehnai Ensemble active'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B1420] font-fraunces flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>Sacred Portraits (Couple &amp; Solos)</span>
          </span>
          <span className="text-[10px] font-mono text-[#A67C3D] font-bold">
            {portraitSlots.filter((s) => Boolean(getSlot(s.id)?.url)).length} of 3 Uploaded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {portraitSlots.map((slot) => {
            const current = getSlot(slot.id);
            const hasPhoto = Boolean(current?.url);
            const isUploadingThis = uploadingSlotId === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (hasPhoto) handleOpenExistingCrop(slot.id);
                }}
                className={`p-3 rounded-2xl border transition-all relative flex flex-col gap-2.5 ${
                  hasPhoto
                    ? 'bg-[#F7F0DD] border-[#A67C3D] shadow-xs cursor-pointer'
                    : 'bg-[#FAF6EE] border-[#D8C7AA] border-dashed hover:border-[#A67C3D]'
                }`}
              >
                <div className="w-full h-32 rounded-xl bg-neutral-900 overflow-hidden relative shrink-0 border border-[#D8C7AA] flex items-center justify-center">
                  {hasPhoto ? (
                    <>
                      <img
                        src={current.url}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[#A67C3D] hover:bg-neutral-800 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-[9px] font-mono mt-1">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSlotFileSelect(slot.id, e)}
                      />
                    </label>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-fraunces font-bold text-xs text-[#6B1420] truncate">
                    {slot.label}
                  </h4>
                  <p className="text-[9px] text-[#6B5A4A] truncate">{slot.req}</p>

                  <div className="mt-2 flex items-center justify-between">
                    {hasPhoto ? (
                      <>
                        <label className="text-[10px] text-[#A67C3D] hover:underline flex items-center gap-0.5 cursor-pointer font-bold font-fraunces">
                          <RefreshCw className="w-2.5 h-2.5" /> Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSlotFileSelect(slot.id, e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handlePromptDelete(slot.id, e)}
                          className="text-[10px] text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove
                        </button>
                      </>
                    ) : (
                      <label className="text-[10px] font-fraunces font-bold text-[#A67C3D] hover:underline cursor-pointer">
                        Select Photo ➜
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSlotFileSelect(slot.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#6B1420] font-fraunces flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#A67C3D]" />
              <span>Royal Moments Gallery (Dynamic 6 Photos)</span>
            </span>
            <p className="text-[9px] text-[#8B7358]">
              Upload couple photos to automatically replace template demo images across all sections.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#A67C3D] font-bold">
            {gallerySlots.filter((s) => Boolean(getSlot(s.id)?.url)).length} of 6 Uploaded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallerySlots.map((slot, index) => {
            const current = getSlot(slot.id);
            const hasPhoto = Boolean(current?.url);
            const isUploadingThis = uploadingSlotId === slot.id;
            const prevSlot = index > 0 ? gallerySlots[index - 1].id : null;
            const nextSlot = index < gallerySlots.length - 1 ? gallerySlots[index + 1].id : null;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (hasPhoto) handleOpenExistingCrop(slot.id);
                }}
                className={`p-2.5 rounded-2xl border transition-all relative flex flex-col gap-2 ${
                  hasPhoto
                    ? 'bg-[#F7F0DD] border-[#A67C3D] shadow-xs cursor-pointer'
                    : 'bg-[#FAF6EE] border-[#D8C7AA] border-dashed hover:border-[#A67C3D]'
                }`}
              >
                <div className="w-full h-24 rounded-xl bg-neutral-900 overflow-hidden relative shrink-0 border border-[#D8C7AA] flex items-center justify-center">
                  {hasPhoto ? (
                    <>
                      <img
                        src={current.url}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[#A67C3D] hover:bg-neutral-800 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-[8px] font-mono mt-0.5">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSlotFileSelect(slot.id, e)}
                      />
                    </label>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-fraunces font-bold text-[11px] text-[#6B1420] truncate">
                      {slot.label}
                    </h4>
                    {hasPhoto && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {prevSlot && (
                          <button
                            type="button"
                            title="Move Left / Earlier"
                            onClick={(e) => handleReorderGallery(slot.id, prevSlot, e)}
                            className="p-0.5 rounded text-[#8B7358] hover:text-[#6B1420] hover:bg-[#EDE0C8] text-[9px] font-mono"
                          >
                            ◀
                          </button>
                        )}
                        {nextSlot && (
                          <button
                            type="button"
                            title="Move Right / Later"
                            onClick={(e) => handleReorderGallery(slot.id, nextSlot, e)}
                            className="p-0.5 rounded text-[#8B7358] hover:text-[#6B1420] hover:bg-[#EDE0C8] text-[9px] font-mono"
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] text-[#6B5A4A] truncate">{slot.req}</p>

                  <div className="mt-1.5 flex items-center justify-between">
                    {hasPhoto ? (
                      <>
                        <label className="text-[9px] text-[#A67C3D] hover:underline flex items-center gap-0.5 cursor-pointer font-bold">
                          <RefreshCw className="w-2.5 h-2.5" /> Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSlotFileSelect(slot.id, e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handlePromptDelete(slot.id, e)}
                          className="text-[9px] text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove
                        </button>
                      </>
                    ) : (
                      <label className="text-[9px] font-fraunces font-bold text-[#A67C3D] hover:underline cursor-pointer">
                        + Add Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSlotFileSelect(slot.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#EDE0C8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#D8C7AA] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={onSaveAndExport}
          className="w-full py-3.5 rounded-xl btn-vermillion text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#F7F0DD]" />
          <span>Save Studio Customization &amp; Review Kankotri</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {confirmDeleteSlotId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFDF9] w-full max-w-sm rounded-3xl border-2 border-[#D8C7AA] shadow-2xl p-6 space-y-4 text-center relative">
            <button
              type="button"
              onClick={() => {
                if (!deletingSlotId) {
                  setConfirmDeleteSlotId(null);
                  setDeleteErrorMsg('');
                }
              }}
              disabled={Boolean(deletingSlotId)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8B7358] hover:text-[#6B1420] hover:bg-[#F7F0DD] transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-fraunces font-bold text-base text-[#6B1420]">
                Remove this photo?
              </h4>
              <p className="text-xs text-[#8B7358]">
                This will permanently remove the photo from your wedding invitation storage and revert to the default theme portrait.
              </p>
            </div>

            {deleteErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteSlotId(null);
                  setDeleteErrorMsg('');
                }}
                disabled={Boolean(deletingSlotId)}
                className="flex-1 py-2.5 rounded-xl bg-[#F7F0DD] hover:bg-[#EDE0C8] border border-[#D8C7AA] text-[#6B1420] text-xs font-fraunces font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingSlotId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-fraunces font-bold flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingSlotId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cropper */}
      {activeCropSlotId && tempCropImageUrl && (
        <ImageCropperModal
          imageUrl={tempCropImageUrl}
          onSave={handleCropComplete}
          onClose={() => {
            setActiveCropSlotId(null);
            setTempCropImageUrl('');
          }}
        />
      )}
    </div>
  );
};

export default MediaUploader;
