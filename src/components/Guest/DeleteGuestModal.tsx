import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { GuestRecord } from '../../types/guest';

interface DeleteGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestRecord | null;
  onConfirmDelete: (guestId: string) => Promise<void> | void;
  loading?: boolean;
}

export const DeleteGuestModal: React.FC<DeleteGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onConfirmDelete,
  loading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#20181A] p-6 space-y-4">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F0D5D5] flex items-center justify-center text-[#8C4A4A]">
          <Trash2 className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
            Remove Guest?
          </h3>
          <p className="text-xs text-[#6C5D60] leading-relaxed">
            This will permanently remove <strong className="text-[#20181A] font-bold">{guest.full_name}</strong> {guest.family_name ? `(${guest.family_name})` : ''} and any associated RSVP attendance records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-[#6C5D60] hover:text-[#20181A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirmDelete(guest.id)}
            className="px-4.5 py-2 rounded-xl bg-[#8C4A4A] hover:bg-[#783E3E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Remove Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGuestModal;
