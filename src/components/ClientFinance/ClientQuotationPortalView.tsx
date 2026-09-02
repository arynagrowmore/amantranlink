import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, FileText, Download, ShieldCheck, 
  Send, Sparkles, AlertCircle, Building2, Phone, Mail, Check, X 
} from 'lucide-react';
import { Quotation, StudioBusinessProfile } from '../../types/studioFinance';
import { StudioBranding } from '../../types/studioBranding';
import { 
  resolveQuotationToken, 
  acceptQuotation, 
  rejectQuotation, 
  fetchStudioBusinessProfile 
} from '../../services/studioFinanceService';
import { fetchStudioBranding, DEFAULT_STUDIO_BRANDING } from '../../services/studioBrandingService';
import { generateQuotationPdf } from '../../services/studioFinancePdfService';

interface ClientQuotationPortalViewProps {
  quoteToken: string;
  onBackToApp?: () => void;
}

export const ClientQuotationPortalView: React.FC<ClientQuotationPortalViewProps> = ({
  quoteToken,
  onBackToApp,
}) => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [profile, setProfile] = useState<StudioBusinessProfile | null>(null);
  const [branding, setBranding] = useState<StudioBranding>(DEFAULT_STUDIO_BRANDING);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Acceptance / Rejection Modal
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [clientSignName, setClientSignName] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const loadQuote = async () => {
    setLoading(true);
    const res = await resolveQuotationToken(quoteToken);
    if (res.success && res.quotation) {
      setQuotation(res.quotation);
      setClientSignName(res.quotation.client_name);
      const [prof, brand] = await Promise.all([
        fetchStudioBusinessProfile(res.quotation.studio_id),
        fetchStudioBranding(res.quotation.studio_id),
      ]);
      setProfile(prof);
      setBranding(brand);
    } else {
      setErrorMessage(res.error || 'Quotation not found or link has expired.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuote();
  }, [quoteToken]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    setProcessing(true);
    const res = await acceptQuotation(quotation.id, quotation.studio_id, clientSignName);
    setProcessing(false);
    if (res.success) {
      setQuotation({ ...quotation, status: 'accepted', accepted_by_name: clientSignName, accepted_at: new Date().toISOString() });
      setIsAcceptModalOpen(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    setProcessing(true);
    const res = await rejectQuotation(quotation.id, quotation.studio_id, rejectReason);
    setProcessing(false);
    if (res.success) {
      setQuotation({ ...quotation, status: 'rejected', rejection_reason: rejectReason });
      setIsRejectModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#736567]">Opening official quotation portal...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !quotation || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope p-4">
        <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F0D5D5] text-[#8C4A4A] flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-cormorant text-2xl font-bold text-[#350811]">Quotation Link Inactive</h2>
          <p className="text-xs text-[#736567] leading-relaxed">
            {errorMessage || 'This quotation link is invalid, expired, or has already been converted.'}
          </p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-4 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const primaryColor = branding.white_label_enabled ? branding.primary_color : '#540D1E';
  const studioName = branding.white_label_enabled ? branding.studio_name : profile.display_business_name;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope flex flex-col justify-between py-6 px-4 sm:px-8">
      
      <div className="w-full max-w-4xl mx-auto space-y-6">
        
        {/* White-Label Header */}
        <div 
          className="p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {branding.white_label_enabled && branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
                👑
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#F4D06F] font-bold block">
                {studioName} · Official Quotation
              </span>
              <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-white">
                {quotation.quotation_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateQuotationPdf(quotation, profile, branding)}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F4D06F]" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {quotation.status === 'accepted' && (
          <div className="p-4 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs text-[#136A4E] flex items-center justify-between gap-3 animate-scaleUp">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#167A5A] shrink-0" />
              <div>
                <strong>Quotation Formally Accepted by {quotation.accepted_by_name}</strong>
                <div className="text-[11px] text-[#247559]">
                  Recorded on {new Date(quotation.accepted_at || Date.now()).toLocaleDateString('en-IN')}. Studio is preparing your project invoice!
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#167A5A] text-white">
              Accepted
            </span>
          </div>
        )}

        {/* Main Quotation Document Card */}
        <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          
          {/* Top Coordinates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#F2ECE1] pb-6 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#736567] font-bold block">Issued By</span>
              <strong className="text-sm text-[#20181A] block">{profile.legal_business_name}</strong>
              <div className="text-[#736567]">{profile.business_address}</div>
              <div className="text-[#736567]">{profile.city}, {profile.state} - {profile.pin_code}</div>
              {profile.gst_registered && profile.gstin && (
                <div className="font-mono text-[11px] text-[#540D1E] font-bold">GSTIN: {profile.gstin}</div>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-mono uppercase text-[#736567] font-bold block">Prepared For</span>
              <strong className="text-sm text-[#20181A] block">{quotation.client_name}</strong>
              <div className="text-[#736567]">{quotation.client_phone}</div>
              <div className="text-[#736567]">{quotation.client_email}</div>
              <div className="text-[#736567]">Valid Until: <strong className="text-[#20181A]">{quotation.expiry_date}</strong></div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              Included Services &amp; Packages
            </h3>

            <div className="divide-y divide-[#F2ECE1] border border-[#E8DFD1] rounded-2xl overflow-hidden text-xs">
              <div className="p-3 bg-[#FAF8F5] grid grid-cols-12 font-mono text-[10px] uppercase text-[#736567] font-bold">
                <div className="col-span-8">Service</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {quotation.line_items.map((item) => (
                <div key={item.id} className="p-3.5 grid grid-cols-12 items-center hover:bg-[#FAF6EF]/50">
                  <div className="col-span-8">
                    <span className="font-bold text-[#20181A] block">{item.name}</span>
                    {item.description && <span className="text-[11px] text-[#736567] block">{item.description}</span>}
                  </div>
                  <div className="col-span-2 text-center font-bold text-[#736567]">{item.quantity}</div>
                  <div className="col-span-2 text-right font-bold text-[#20181A]">
                    ₹{(item.line_subtotal_paise / 100).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Tax Breakup */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="max-w-xs text-xs space-y-1">
              <span className="font-bold text-[#4A3E40] block">Terms &amp; Payment Conditions:</span>
              <p className="text-[11px] text-[#736567] leading-relaxed">
                {quotation.terms_and_conditions || profile.default_payment_terms}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DFD1]">
              <div className="flex justify-between text-[#736567]">
                <span>Subtotal:</span>
                <span className="font-bold text-[#20181A]">₹{(quotation.subtotal_paise / 100).toLocaleString('en-IN')}</span>
              </div>

              {quotation.discount_paise > 0 && (
                <div className="flex justify-between text-[#8C4A4A]">
                  <span>Discount:</span>
                  <span>- ₹{(quotation.discount_paise / 100).toLocaleString('en-IN')}</span>
                </div>
              )}

              {quotation.total_tax_paise > 0 && (
                <>
                  {quotation.cgst_paise > 0 ? (
                    <>
                      <div className="flex justify-between text-[#736567]">
                        <span>CGST (9%):</span>
                        <span>₹{(quotation.cgst_paise / 100).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[#736567]">
                        <span>SGST (9%):</span>
                        <span>₹{(quotation.sgst_paise / 100).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-[#736567]">
                      <span>IGST (18%):</span>
                      <span>₹{(quotation.igst_paise / 100).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-[#E8DFD1] flex justify-between font-bold text-sm text-[#540D1E]">
                <span>Grand Total:</span>
                <span>₹{(quotation.total_amount_paise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Client Acceptance CTA Bar */}
          {quotation.status !== 'accepted' && quotation.status !== 'converted' && (
            <div className="pt-4 border-t border-[#F2ECE1] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#736567]">
                Ready to proceed with this wedding design package?
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#E8DFD1] bg-white text-xs font-semibold text-[#736567] hover:text-[#8C4A4A]"
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#136A4E] hover:bg-[#1B7F5F] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>Accept Quotation</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Accept Modal */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#EDF7F2] border border-[#BCE3D1] flex items-center justify-center text-[#167A5A] mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#350811]">Accept Quotation</h3>
              <p className="text-xs text-[#736567]">
                Confirm your approval for {quotation.quotation_number} (Total: ₹{(quotation.total_amount_paise / 100).toLocaleString('en-IN')}).
              </p>
            </div>

            <form onSubmit={handleAccept} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Your Full Name (Electronic Signature)</label>
                <input
                  type="text"
                  required
                  value={clientSignName}
                  onChange={(e) => setClientSignName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-xl bg-[#136A4E] hover:bg-[#1B7F5F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>{processing ? 'Accepting...' : 'Confirm Acceptance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">Request Revisions</h3>
            <p className="text-xs text-[#736567]">
              Let {studioName} know what modifications or custom adjustments you need on this quotation.
            </p>

            <form onSubmit={handleReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please add the Video Invitation addon and update the billing address..."
                className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs resize-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold"
                >
                  {processing ? 'Submitting...' : 'Send Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientQuotationPortalView;
