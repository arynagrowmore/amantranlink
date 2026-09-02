import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Copy, Check, ExternalLink, ShieldCheck, 
  Users, Calendar, MapPin, Sparkles, Send, Download, CheckCircle2, AlertCircle
} from 'lucide-react';
import { GuestRecord } from '../../types/guest';
import { GuestEntryPass, isGuestEligibleForEntryPass } from '../../types/entryPass';
import { issueOrFetchEntryPass } from '../../services/entryPassService';
import { WeddingProjectState } from '../../types/wedding';
import { QRCodeDisplay } from '../QR/QRCodeDisplay';

interface DigitalEntryPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestRecord | null;
  state: WeddingProjectState;
  weddingSlug: string;
  weddingSiteId?: string;
}

export const DigitalEntryPassModal: React.FC<DigitalEntryPassModalProps> = ({
  isOpen,
  onClose,
  guest,
  state,
  weddingSlug,
  weddingSiteId,
}) => {
  const [pass, setPass] = useState<GuestEntryPass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const coupleNames = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;
  const weddingDate = state.couple.weddingDate || '10 December 2026';
  const venueName = state.couple.venueName || 'The Milestone, Himmatnagar';

  useEffect(() => {
    if (isOpen && guest) {
      setLoading(true);
      setError(null);
      issueOrFetchEntryPass(guest, weddingSlug, weddingSiteId)
        .then((res) => {
          if (res.success && res.pass) {
            setPass(res.pass);
          } else {
            setError(res.error || 'Guest is not eligible for a QR Entry Pass.');
          }
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else {
      setPass(null);
    }
  }, [isOpen, guest, weddingSlug, weddingSiteId]);

  if (!isOpen || !guest) return null;

  const passUrl = pass ? `${originUrl}/pass/${pass.entry_token}?slug=${weddingSlug}` : '';
  const isEligible = isGuestEligibleForEntryPass(guest);
  const confirmedMembers = pass?.allowed_members_count || guest.rsvp?.attending_member_count || guest.number_of_members || 1;

  const handleCopyLink = () => {
    if (!passUrl) return;
    navigator.clipboard.writeText(passUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenPreview = () => {
    if (!passUrl) return;
    window.open(passUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#20181A] flex flex-col max-h-[90vh]">
        
        {/* Subtle Top Gold Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-center">
          
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#736567]">Generating secure QR Entry Pass...</p>
            </div>
          ) : !isEligible || error ? (
            <div className="py-8 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                Entry Pass Not Available
              </h3>
              <p className="text-xs text-[#6C5D60] max-w-xs mx-auto leading-relaxed">
                {error || 'QR Entry Passes are only issued to guests with confirmed attendance (RSVP Attending).'}
              </p>
            </div>
          ) : pass ? (
            <div className="space-y-4">
              
              {/* Pass Eyebrow */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
                  Auspicious Wedding Entry Pass
                </span>
                <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                  {guest.full_name}
                </h3>
                {guest.family_name && (
                  <p className="text-xs text-[#736567] font-medium">{guest.family_name}</p>
                )}
              </div>

              {/* High Contrast Scannable QR Code */}
              <div className="py-1">
                <QRCodeDisplay 
                  value={passUrl}
                  size={190}
                  className="mx-auto"
                />
                <p className="text-[10px] font-mono text-[#736567] mt-1.5">
                  Scan at venue entrance · Token: <span className="text-[#540D1E] font-bold">{pass.entry_token}</span>
                </p>
              </div>

              {/* Pass Highlights Pill Box */}
              <div className="p-3 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] text-xs grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Authorized Entry</span>
                  <span className="font-bold text-[#136A4E] text-xs">{confirmedMembers} Confirmed {confirmedMembers === 1 ? 'Guest' : 'Members'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Status</span>
                  <span className={`font-bold text-xs capitalize ${pass.status === 'used' ? 'text-[#136A4E]' : 'text-[#976008]'}`}>
                    {pass.status === 'used' ? '✓ Checked In' : '● Active Pass'}
                  </span>
                </div>
              </div>

              {/* Event Context */}
              <div className="text-[11px] text-[#6C5D60] space-y-1 text-left bg-white p-3 rounded-xl border border-[#F0EAE1]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9C772F] shrink-0" />
                  <span className="font-semibold text-[#20181A]">{coupleNames}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-[#8C7A7C] shrink-0" />
                  <span>{weddingDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <MapPin className="w-3.5 h-3.5 text-[#8C7A7C] shrink-0" />
                  <span className="truncate">{venueName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#9C772F]" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Pass Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="flex-1 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Pass</span>
                </button>
              </div>

            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default DigitalEntryPassModal;
