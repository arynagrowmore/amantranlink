import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Receipt, Download, ShieldCheck, 
  CreditCard, Sparkles, Building2, Phone, Mail, Check, 
  Copy, ExternalLink, QrCode, AlertCircle 
} from 'lucide-react';
import { Invoice, StudioBusinessProfile, InvoicePayment } from '../../types/studioFinance';
import { StudioBranding } from '../../types/studioBranding';
import { 
  resolveInvoiceToken, 
  recordInvoicePayment, 
  fetchStudioBusinessProfile 
} from '../../services/studioFinanceService';
import { fetchStudioBranding, DEFAULT_STUDIO_BRANDING } from '../../services/studioBrandingService';
import { generateInvoicePdf, generateReceiptPdf } from '../../services/studioFinancePdfService';

interface ClientInvoicePaymentPortalViewProps {
  invoiceToken: string;
  onBackToApp?: () => void;
}

export const ClientInvoicePaymentPortalView: React.FC<ClientInvoicePaymentPortalViewProps> = ({
  invoiceToken,
  onBackToApp,
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<StudioBusinessProfile | null>(null);
  const [branding, setBranding] = useState<StudioBranding>(DEFAULT_STUDIO_BRANDING);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment Selection
  const [selectedPayMode, setSelectedPayMode] = useState<'full' | 'half' | 'custom'>('full');
  const [customAmountINR, setCustomAmountINR] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [latestReceipt, setLatestReceipt] = useState<any | null>(null);

  const loadInvoice = async () => {
    setLoading(true);
    const res = await resolveInvoiceToken(invoiceToken);
    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      const [prof, brand] = await Promise.all([
        fetchStudioBusinessProfile(res.invoice.studio_id),
        fetchStudioBranding(res.invoice.studio_id),
      ]);
      setProfile(prof);
      setBranding(brand);
    } else {
      setErrorMessage(res.error || 'Invoice not found or link has expired.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceToken]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const getPayableAmountPaise = (): number => {
    if (!invoice) return 0;
    if (selectedPayMode === 'full') return invoice.remaining_balance_paise;
    if (selectedPayMode === 'half') return Math.round(invoice.remaining_balance_paise / 2);
    return Math.min(Math.round(parseFloat(customAmountINR || '0') * 100), invoice.remaining_balance_paise);
  };

  // Simulate / Execute Razorpay Checkout for Flow B
  const handlePayOnline = async () => {
    if (!invoice || !profile) return;
    const amountPaise = getPayableAmountPaise();
    if (amountPaise <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    setProcessingPayment(true);
    
    // Simulate instantaneous verified checkout session
    setTimeout(async () => {
      const res = await recordInvoicePayment(
        invoice,
        amountPaise,
        'razorpay',
        {
          razorpayPaymentId: `pay_flowb_${Date.now()}`,
          notes: 'Client online checkout payment',
        }
      );
      setProcessingPayment(false);

      if (res.success && res.receipt) {
        setLatestReceipt(res.receipt);
        loadInvoice();
      } else {
        alert(res.error || 'Payment failed.');
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#736567]">Opening secure invoice payment portal...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !invoice || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope p-4">
        <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F0D5D5] text-[#8C4A4A] flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-cormorant text-2xl font-bold text-[#350811]">Invoice Link Inactive</h2>
          <p className="text-xs text-[#736567] leading-relaxed">
            {errorMessage || 'This invoice payment link is invalid or expired.'}
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
                {studioName} · Invoice Payment Portal
              </span>
              <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-white">
                {invoice.invoice_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateInvoicePdf(invoice, profile, branding)}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F4D06F]" />
              <span>Download Invoice PDF</span>
            </button>
          </div>
        </div>

        {/* Payment Success Alert & Receipt */}
        {latestReceipt && (
          <div className="p-4 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs text-[#136A4E] flex items-center justify-between gap-3 animate-scaleUp">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#167A5A] shrink-0" />
              <div>
                <strong>Payment of ₹{(latestReceipt.amount_paid_paise / 100).toLocaleString('en-IN')} Received!</strong>
                <div className="text-[11px] text-[#247559]">
                  Receipt #{latestReceipt.receipt_number} generated. Remaining Balance: ₹{(latestReceipt.remaining_balance_paise / 100).toLocaleString('en-IN')}.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => generateReceiptPdf(latestReceipt, profile)}
              className="px-3 py-1.5 rounded-xl bg-[#167A5A] text-white font-bold flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Receipt PDF</span>
            </button>
          </div>
        )}

        {/* Invoice Summary & Payment Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Invoice Details (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                Invoice Breakdown
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                invoice.payment_status === 'paid'
                  ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                  : invoice.payment_status === 'partially_paid'
                  ? 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                  : 'bg-[#FDF2F2] text-[#8C4A4A] border border-[#F0D5D5]'
              }`}>
                {invoice.payment_status}
              </span>
            </div>

            <div className="space-y-2">
              {invoice.line_items.map((item) => (
                <div key={item.id} className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#20181A] block">{item.name}</span>
                    <span className="text-[10px] text-[#736567]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#20181A]">
                    ₹{(item.line_total_paise / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F2ECE1] space-y-1.5 text-xs bg-[#FAF6EE] p-4 rounded-2xl">
              <div className="flex justify-between text-[#736567]">
                <span>Invoice Total:</span>
                <span className="font-bold text-[#20181A]">₹{(invoice.total_amount_paise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#136A4E]">
                <span>Amount Paid:</span>
                <span className="font-bold">₹{(invoice.total_paid_paise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-[#E8DFD1] flex justify-between font-bold text-sm text-[#540D1E]">
                <span>Remaining Balance Due:</span>
                <span>₹{(invoice.remaining_balance_paise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Direct Payment Options (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {invoice.remaining_balance_paise > 0 ? (
              <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold block">
                  Select Payment Amount
                </span>

                {/* Amount Options */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayMode('full')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPayMode === 'full'
                        ? 'border-[#540D1E] bg-[#FAF4E8] ring-1 ring-[#540D1E]'
                        : 'border-[#E8DFD1] bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-[10px] text-[#736567] block">Full Balance</span>
                    <strong className="text-xs text-[#20181A]">₹{(invoice.remaining_balance_paise / 100).toLocaleString('en-IN')}</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayMode('half')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPayMode === 'half'
                        ? 'border-[#540D1E] bg-[#FAF4E8] ring-1 ring-[#540D1E]'
                        : 'border-[#E8DFD1] bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-[10px] text-[#736567] block">50% Installment</span>
                    <strong className="text-xs text-[#20181A]">₹{(Math.round(invoice.remaining_balance_paise / 2) / 100).toLocaleString('en-IN')}</strong>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePayOnline}
                  disabled={processingPayment}
                  className="w-full py-3 rounded-2xl bg-[#136A4E] hover:bg-[#1B7F5F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-[#F4D06F]" />
                  <span>
                    {processingPayment 
                      ? 'Processing Secure Checkout...' 
                      : `Pay ₹${(getPayableAmountPaise() / 100).toLocaleString('en-IN')} Online`}
                  </span>
                </button>

                {/* Direct UPI / Bank Coordinates */}
                {profile.upi_id && (
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono uppercase text-[#736567] font-bold block">
                      Direct UPI VPA Payment
                    </span>
                    <div className="flex items-center justify-between font-mono bg-white p-2 rounded-xl border border-[#E8DFD1]">
                      <span className="text-xs text-[#540D1E] font-bold">{profile.upi_id}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(profile.upi_id!, 'upi')}
                        className="text-[#736567] hover:text-[#20181A]"
                      >
                        {copiedText === 'upi' ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-[#BCE3D1] bg-[#F7FCF9] rounded-3xl p-6 text-center space-y-2 shadow-2xs">
                <CheckCircle2 className="w-10 h-10 text-[#167A5A] mx-auto" />
                <h3 className="font-cormorant text-xl font-bold text-[#136A4E]">
                  Invoice Fully Settled!
                </h3>
                <p className="text-xs text-[#247559]">
                  Thank you! No remaining balance due on this wedding project invoice.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ClientInvoicePaymentPortalView;
