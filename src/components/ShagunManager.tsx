import React, { useState } from 'react';
import { QrCode, Gift, Check, Copy, Sparkles, Upload, Eye, ShieldCheck, Heart, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { WeddingProjectState, DigitalShagun } from '../types/wedding';

interface ShagunManagerProps {
  state: WeddingProjectState;
  onChangeShagun: (shagun: DigitalShagun) => void;
  onSaveAndNext: () => void;
}

export const ShagunManager: React.FC<ShagunManagerProps> = ({
  state,
  onChangeShagun,
  onSaveAndNext,
}) => {
  const currentShagun: DigitalShagun = state.shagun || {
    enabled: true,
    recipientName: (state.couple.groomEn && state.couple.brideEn) ? `${state.couple.groomEn} & ${state.couple.brideEn}` : 'Groom & Bride',
    upiId: '',
    upiNumber: state.family.rsvp1Phone ? state.family.rsvp1Phone.replace(/\D/g, '') : '',
    customMessage: 'Your gracious presence and heartfelt blessings are our greatest treasure. For digital shagun & tokens of love:',
  };

  const [copied, setCopied] = useState<boolean>(false);

  const updateField = (field: keyof DigitalShagun, value: any) => {
    onChangeShagun({
      ...currentShagun,
      [field]: value,
    });
  };

  const cleanUpi = currentShagun.upiId ? currentShagun.upiId.trim() : '';
  const qrUrl = currentShagun.qrImageUrl || (cleanUpi
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(currentShagun.recipientName || 'Wedding Shagun')}&cu=INR`)}`
    : '');

  const handleCopyUpi = () => {
    if (!cleanUpi) return;
    navigator.clipboard.writeText(cleanUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateField('qrImageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 font-sans">
      
      {/* 👑 Atelier Header Banner (Luminous Royal Light Theme) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE1] p-6 sm:p-7 border border-[#E8DCC8] shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-5 pointer-events-none text-[#6E1020]">
          <Gift size={180} />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DCC8] text-[10px] font-mono uppercase font-bold tracking-wider text-[#6E1020]">
              <Gift className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Step 08 · Digital Hospitality</span>
            </span>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/30">
              Optional Feature (ऐच्छिक)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1715]">
            डिजिटल शगुन एवं शुभाशीर्वाद (Digital Shagun &amp; UPI)
          </h2>
          <p className="text-xs sm:text-sm text-[#75675C] max-w-2xl leading-relaxed">
            Allow guests attending near or far to send auspicious shagun tokens and heartfelt blessings directly to your bank account via UPI. Placed right at the bottom of your invitation.
          </p>
        </div>
      </div>

      {/* 🔘 Optional Master Toggle Card */}
      <div className="p-5 bg-white rounded-3xl border-2 border-[#E8DCC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
            currentShagun.enabled 
              ? 'bg-[#FAF6EE] border-[#C49A35]/50 text-[#6E1020]' 
              : 'bg-gray-100 border-gray-200 text-gray-400'
          }`}>
            <QrCode className="w-5 h-5 text-[#C49A35]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-[#1A1715] text-base">
                Enable Digital Shagun Card at Bottom of Invitation
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#6E1020] border border-[#E8DCC8] font-bold">
                Optional
              </span>
            </div>
            <p className="text-xs text-[#75675C] mt-0.5">
              {currentShagun.enabled 
                ? 'Active — Guests will see the Shagun card with UPI QR code right before the footer.' 
                : 'Turned Off — No Shagun or payment section will appear on your invitation.'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={currentShagun.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-13 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#167A5A]"></div>
        </label>
      </div>

      {/* When Disabled: Informative Light Callout */}
      {!currentShagun.enabled && (
        <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#E8DCC8] text-center space-y-2">
          <p className="text-xs font-semibold text-[#6E1020]">
            Digital Shagun is currently disabled
          </p>
          <p className="text-xs text-[#75675C] max-w-md mx-auto leading-relaxed">
            Your invitation will only display your wedding ceremonies, moments gallery, venue maps, and RSVP. You can re-enable the Shagun UPI card anytime using the toggle above.
          </p>
        </div>
      )}

      {/* When Enabled: Full Form & Live Preview */}
      {currentShagun.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Form: Inputs */}
          <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-3xl border border-[#E8DCC8] shadow-xs">
            
            {/* Payee Name */}
            <div>
              <label className="block text-xs font-bold text-[#1A1715] uppercase tracking-wider mb-1.5">
                Payee / Couple Name (खाताधारक का नाम)
              </label>
              <input
                type="text"
                value={currentShagun.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
                placeholder="e.g. Rudra & Ishani"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF8F5] text-[#1A1715] focus:ring-2 focus:ring-[#C49A35]/30 focus:border-[#C49A35] outline-none transition-all"
              />
              <p className="text-[11px] text-[#75675C] mt-1">
                Name of the account holder displayed on the UPI payment screen.
              </p>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-bold text-[#1A1715] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>UPI ID / VPA (GooglePay, PhonePe, Paytm, BHIM)</span>
                <span className="text-[10px] font-mono text-[#167A5A] uppercase font-bold">100% Direct Settlement</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentShagun.upiId}
                  onChange={(e) => updateField('upiId', e.target.value)}
                  placeholder="e.g. rudra@okhdfcbank or 9409360336@paytm"
                  className="w-full text-xs sm:text-sm p-3 pr-24 font-mono rounded-xl border border-[#E8DCC8] bg-[#FAF8F5] text-[#1A1715] focus:ring-2 focus:ring-[#C49A35]/30 focus:border-[#C49A35] outline-none transition-all"
                />
                {cleanUpi && (
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-[#E8DCC8] hover:border-[#C49A35] text-xs font-semibold rounded-lg flex items-center gap-1 text-[#6E1020] cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#C49A35]" />}
                    <span>{copied ? 'Copied' : 'Test Copy'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#75675C] mt-1.5">
                Funds go directly to your personal bank account. AmantranLink charges ₹0 commission.
              </p>
            </div>

            {/* Custom Shagun Message */}
            <div>
              <label className="block text-xs font-bold text-[#1A1715] uppercase tracking-wider mb-1.5">
                Auspicious Blessing &amp; Shagun Note (आशीर्वाद संदेश)
              </label>
              <textarea
                rows={3}
                value={currentShagun.customMessage}
                onChange={(e) => updateField('customMessage', e.target.value)}
                placeholder="Your presence and heartfelt blessings are our greatest treasure..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF8F5] text-[#1A1715] focus:ring-2 focus:ring-[#C49A35]/30 focus:border-[#C49A35] outline-none resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Custom QR Image Upload Option */}
            <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-dashed border-[#C49A35]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1715] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#C49A35]" />
                  <span>Upload Custom Bank QR (Optional)</span>
                </span>
                {currentShagun.qrImageUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('qrImageUrl', '')}
                    className="text-[11px] text-[#6E1020] font-semibold underline hover:text-[#430914] cursor-pointer"
                  >
                    Use Auto-Generated QR
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#75675C] leading-relaxed">
                If you prefer uploading your official printed bank standee QR code image instead of auto-generating from UPI ID:
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-[#75675C] file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#6E1020] file:text-[#FFFDF8] hover:file:bg-[#430914] cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Live Shagun Card Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 space-y-3">
              <div className="text-xs font-bold text-[#75675C] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Live Card Preview</span>
                </span>
                <span className="text-[10px] font-mono text-[#6E1020] font-bold">
                  Appears at Bottom
                </span>
              </div>

              {/* Royal Shagun Card Mockup */}
              <div className="rounded-3xl bg-gradient-to-br from-[#250910] via-[#430914] to-[#1C0509] p-6 text-center text-[#FFFDF8] border-2 border-[#C49A35]/60 shadow-xl relative overflow-hidden space-y-3">
                <div className="text-2xl">🌸 🪙 🌸</div>
                <h4 className="font-serif text-lg font-bold text-[#E8CD7E] tracking-wide">
                  ॥ शगुन एवं शुभाशीर्वाद ॥
                </h4>
                <p className="text-xs text-[#E8D5AD] italic font-serif leading-relaxed px-2">
                  "{currentShagun.customMessage || 'Your presence is our greatest treasure.'}"
                </p>

                {/* QR Box */}
                <div className="my-2 p-3 bg-white rounded-2xl shadow-md inline-block border-2 border-[#C49A35]">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Shagun QR"
                      className="w-36 h-36 object-contain rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-36 h-36 flex flex-col items-center justify-center bg-gray-50 rounded-lg text-gray-400 p-2">
                      <QrCode className="w-8 h-8 mb-1 text-gray-400" />
                      <span className="text-[10px] text-center font-sans">Enter UPI ID to generate QR</span>
                    </div>
                  )}
                </div>

                {/* UPI display */}
                {cleanUpi ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#C49A35]/20 border border-[#C49A35]/40 text-xs font-mono text-[#FFFDF8]">
                    <span>{cleanUpi}</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#E8D5AD]/60 italic font-mono">UPI ID: wedding@upi</div>
                )}

                <div className="pt-3 border-t border-[#C49A35]/20 flex items-center justify-center gap-1.5 text-[11px] text-[#E8D5AD]/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C49A35]" />
                  <span>Direct 100% Secure Account Settlement</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E8DCC8] flex items-center gap-2 text-[11px] text-[#75675C]">
                <Info className="w-4 h-4 text-[#C49A35] shrink-0" />
                <span>
                  Synchronized in real-time across all royal wedding themes right before the footer.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save and Continue Button */}
      <div className="flex justify-end pt-4 border-t border-[#E8DCC8]">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#6E1020] via-[#851829] to-[#6E1020] hover:from-[#5A0B18] hover:to-[#5A0B18] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md border border-[#C49A35] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <span>Save Shagun Settings &amp; Continue</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>

    </div>
  );
};

export default ShagunManager;
