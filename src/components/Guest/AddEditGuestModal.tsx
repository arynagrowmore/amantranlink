import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Phone, Mail, Tag, AlertCircle, Loader2, Heart, Crown, CheckCircle2 } from 'lucide-react';
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

const CATEGORIES: { id: GuestCategory; label: string }[] = [
  { id: 'Family', label: 'Family Circle' },
  { id: 'Relative', label: 'Relatives' },
  { id: 'Friend', label: 'Friends' },
  { id: 'VIP', label: 'VIP Dignitary' },
  { id: 'Business', label: 'Business' },
];

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
  const [membersCount, setMembersCount] = useState<number>(2);
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
      setMembersCount(editingGuest.number_of_members || 2);
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setFamilyName('');
      setRelationship('Family');
      setMembersCount(2);
    }
    setError(null);
  }, [editingGuest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide the primary family member or contact name.');
      return;
    }

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setError('Please provide a valid mobile number for WhatsApp invitation delivery.');
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
        setError(res.error || 'Failed to update family details.');
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
        setError(res.error || 'Failed to welcome family to your guest book.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#241A17] max-h-[92vh] flex flex-col">
        
        {/* Top Gold Ornament Line */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#C49A35] via-[#F4D06F] to-[#C49A35] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#736567] transition-colors cursor-pointer z-10"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 pb-3 space-y-1 shrink-0 border-b border-[#FAF6EE]">
            <span className="font-serif italic text-xs text-[#C49A35] block">
              ॥ शुभ विवाह आमंत्रण · Guest Book Entry ॥
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
              {editingGuest ? 'Edit Family Details' : 'Welcome a Family to Your Wedding'}
            </h2>
            <p className="text-xs text-[#736567] font-light">
              A private, personalized invitation link will be created automatically.
            </p>
          </div>

          {/* Scrollable Form Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {error && (
              <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] text-xs text-[#8C4A4A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Family & Primary Contact Details */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C49A35] block">
                1. Family &amp; Primary Guest
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Family Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#241A17] mb-1">
                    Family / Parivar Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. Sharma Family or Patel Parivar"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#C49A35] rounded-xl text-xs text-[#241A17] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                  />
                </div>

                {/* Primary Guest Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#241A17] mb-1">
                    Primary Contact Name <span className="text-[#8C4A4A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#C49A35] rounded-xl text-xs text-[#241A17] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#241A17] mb-1">
                    WhatsApp Mobile Number <span className="text-[#8C4A4A]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9825145678"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#C49A35] rounded-xl text-xs text-[#241A17] placeholder:text-[#9C8C8E] focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241A17] mb-1">
                    Email Address <span className="text-[#9C8C8E] font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@sharma.in"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] hover:bg-[#F5EFE4] focus:bg-white border border-[#E8DFD1] focus:border-[#C49A35] rounded-xl text-xs text-[#241A17] placeholder:text-[#9C8C8E] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Circle / Relationship Category */}
            <div className="space-y-2 pt-2 border-t border-[#FAF6EE]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C49A35] block">
                2. Guest Circle &amp; Honour
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setRelationship(cat.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left flex items-center justify-between ${
                      relationship === cat.id
                        ? 'bg-[#6E1020] text-[#FFFDF8] border-[#6E1020] shadow-2xs'
                        : 'bg-[#FAF6EE] text-[#736567] border-[#E8DFD1] hover:bg-[#F4EFE6] hover:text-[#241A17]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {relationship === cat.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#F4D06F]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Expected Headcount */}
            <div className="space-y-2 pt-2 border-t border-[#FAF6EE]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C49A35] block">
                3. Total Expected Family Members
              </span>

              <div className="flex items-center gap-4 pt-1 bg-[#FAF6EE] p-3 rounded-2xl border border-[#E8DFD1]">
                <button
                  type="button"
                  onClick={() => setMembersCount(Math.max(1, membersCount - 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E8DFD1] text-lg font-bold text-[#6E1020] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  −
                </button>
                
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-[#241A17]">
                    {membersCount}
                  </div>
                  <span className="text-[10px] text-[#736567] block">
                    {membersCount === 1 ? 'Guest (Individual)' : 'Family Members'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMembersCount(Math.min(30, membersCount + 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E8DFD1] text-lg font-bold text-[#6E1020] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  +
                </button>
                
                <div className="text-xs text-[#736567] font-light pl-2">
                  They will be able to confirm exact headcount upon RSVP.
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 px-6 flex items-center justify-between border-t border-[#E8DFD1] bg-[#FAF6EE] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#736567] hover:text-[#241A17] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] active:bg-[#430914] text-[#FFFDF8] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingGuest ? 'Update Family' : 'Add to Guest Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGuestModal;
