import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Phone, Mail, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { createGuest, updateGuest } from '../../services/guestService';
import { GuestRecord, GuestCategory } from '../../types/guest';

interface AddEditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingSiteId: string;
  weddingSlug?: string;
  userId: string;
  editingGuest?: GuestRecord | null;
  onSaved: (guest: GuestRecord) => void;
}

const CATEGORIES: GuestCategory[] = ['Family', 'Friend', 'Relative', 'VIP', 'Business'];

export const AddEditGuestModal: React.FC<AddEditGuestModalProps> = ({
  isOpen,
  onClose,
  weddingSiteId,
  weddingSlug,
  userId,
  editingGuest,
  onSaved,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const [relationship, setRelationship] = useState<GuestCategory>('Family');
  const [membersCount, setMembersCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (editingGuest) {
      setFullName(editingGuest.full_name || '');
      setPhone(editingGuest.phone || '');
      setEmail(editingGuest.email || '');
      setFamilyName(editingGuest.family_name || '');
      setRelationship(editingGuest.relationship || 'Family');
      setMembersCount(editingGuest.number_of_members || 1);
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setFamilyName('');
      setRelationship('Family');
      setMembersCount(1);
    }
    setError(null);
  }, [editingGuest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide the guest full name.');
      return;
    }

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setError('Please provide a valid mobile number for WhatsApp invitations.');
      return;
    }

    setLoading(true);

    if (editingGuest) {
      const res = await updateGuest(weddingSiteId, editingGuest.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        family_name: familyName.trim() || null,
        relationship,
        number_of_members: Math.max(1, membersCount),
      });
      setLoading(false);
      if (res.success && res.guest) {
        onSaved(res.guest);
        onClose();
      } else {
        setError(res.error || 'Failed to update guest details.');
      }
    } else {
      const res = await createGuest({
        wedding_site_id: weddingSiteId,
        user_id: userId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        family_name: familyName.trim() || undefined,
        relationship,
        number_of_members: Math.max(1, membersCount),
      }, weddingSlug);
      setLoading(false);
      if (res.success && res.guest) {
        onSaved(res.guest);
        onClose();
      } else {
        setError(res.error || 'Failed to add guest to your list.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#20181A] max-h-[90vh] flex flex-col">
        
        {/* Subtle Top Accent Line */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer z-10"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 pb-2 space-y-0.5 shrink-0">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              {editingGuest ? 'Update Guest Profile' : 'Guest Registration'}
            </span>
            <h2 className="font-cormorant text-2xl font-bold text-[#350811]">
              {editingGuest ? 'Edit Guest' : 'Add Wedding Guest'}
            </h2>
            <p className="text-xs text-[#6C5D60]">
              Personalized invitation link will be auto-generated with cryptographic scoping.
            </p>
          </div>

          {/* Scrollable Form Content */}
          <div className="p-6 pt-2 space-y-4 overflow-y-auto flex-1">
            
            {error && (
              <div className="p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] text-xs text-[#8C4A4A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1 — GUEST DETAILS */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#F0EAE1] pb-1">
                1. Contact &amp; Identity
              </span>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] uppercase tracking-wider mb-1">
                  Full Name <span className="text-[#8C4A4A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mukeshbhai Patel"
                  className="w-full px-3 py-2 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] uppercase tracking-wider mb-1">
                  Phone (WhatsApp) <span className="text-[#8C4A4A]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9409360336"
                  className="w-full px-3 py-2 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none transition-colors font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] uppercase tracking-wider mb-1">
                  Email Address <span className="text-[#8C7A7C] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mukesh@example.com"
                  className="w-full px-3 py-2 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                />
              </div>

              {/* Family Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] uppercase tracking-wider mb-1">
                  Family / Parivar Group <span className="text-[#8C7A7C] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Patel Parivar or College Batchmates"
                  className="w-full px-3 py-2 bg-[#FAF6EF] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* SECTION 2 — GUEST CATEGORY */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#F0EAE1] pb-1">
                2. Guest Category
              </span>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRelationship(cat)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      relationship === cat
                        ? 'bg-[#540D1E] text-white border-[#540D1E] shadow-2xs'
                        : 'bg-[#FAF6EF] text-[#6C5D60] border-[#E8DFD1] hover:bg-[#F5EFE4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3 — FAMILY SIZE */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] tracking-wider block border-b border-[#F0EAE1] pb-1">
                3. Expected Family Members
              </span>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMembersCount(Math.max(1, membersCount - 1))}
                  className="w-9 h-9 rounded-xl bg-[#FAF6EF] hover:bg-[#F4EFE6] border border-[#E8DFD1] text-base font-bold text-[#540D1E] flex items-center justify-center transition-colors cursor-pointer"
                >
                  −
                </button>
                
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={membersCount}
                  onChange={(e) => setMembersCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 text-center font-bold text-base text-[#350811] bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl py-1 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setMembersCount(Math.min(30, membersCount + 1))}
                  className="w-9 h-9 rounded-xl bg-[#FAF6EF] hover:bg-[#F4EFE6] border border-[#E8DFD1] text-base font-bold text-[#540D1E] flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
                
                <span className="text-[11px] text-[#736567]">
                  {membersCount === 1 ? 'Individual Member' : 'Total Members Allowed'}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Actions (Always Visible) */}
          <div className="p-4 px-6 flex items-center justify-between border-t border-[#F0EAE1] bg-[#FCFAF7] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6C5D60] hover:text-[#20181A] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] active:bg-[#430914] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingGuest ? 'Save Changes' : '+ Add Guest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGuestModal;
