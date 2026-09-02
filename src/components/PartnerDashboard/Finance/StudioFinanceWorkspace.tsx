import React, { useState, useEffect } from 'react';
import { 
  DollarSign, FileText, Receipt, Plus, Download, Copy, 
  Check, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, 
  TrendingUp, Clock, Filter, Eye, Send, ArrowUpRight, 
  SlidersHorizontal, Building2, Package, Tag, MessageSquare, ChevronRight, X
} from 'lucide-react';
import { 
  Quotation, 
  Invoice, 
  StudioService, 
  StudioBusinessProfile, 
  StudioFinanceOverviewStats, 
  QuotationStatus, 
  InvoiceStatus,
  StudioServicePackage
} from '../../../types/studioFinance';
import { 
  fetchStudioBusinessProfile, 
  saveStudioBusinessProfile,
  fetchStudioServices, 
  saveStudioService, 
  deleteStudioService,
  fetchServicePackages,
  fetchQuotations, 
  createQuotation,
  fetchInvoices, 
  convertQuotationToInvoice,
  recordInvoicePayment,
  calculateFinanceOverviewStats,
  DEFAULT_BUSINESS_PROFILE
} from '../../../services/studioFinanceService';
import { 
  generateQuotationPdf, 
  generateInvoicePdf, 
  generateReceiptPdf 
} from '../../../services/studioFinancePdfService';
import { fetchStudioBranding } from '../../../services/studioBrandingService';

interface StudioFinanceWorkspaceProps {
  studioId: string;
}

type FinanceSubTab = 'overview' | 'quotations' | 'invoices' | 'services' | 'settings';

export const StudioFinanceWorkspace: React.FC<StudioFinanceWorkspaceProps> = ({ studioId }) => {
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Data States
  const [stats, setStats] = useState<StudioFinanceOverviewStats | null>(null);
  const [profile, setProfile] = useState<StudioBusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<StudioService[]>([]);
  const [packages, setPackages] = useState<StudioServicePackage[]>([]);
  
  // UI Actions
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentAmountINR, setPaymentAmountINR] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'bank_transfer' | 'cash'>('upi');
  const [isRecordingPayment, setIsRecordingPayment] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // New Quote Form State
  const [newQuoteClient, setNewQuoteClient] = useState({
    name: 'Dhruv & Shreya',
    email: 'client@example.com',
    phone: '+91 98765 43210',
    state: 'Rajasthan',
  });
  const [selectedServicesForQuote, setSelectedServicesForQuote] = useState<string[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');

  // Business Profile Form State
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const loadAllFinanceData = async () => {
    setLoading(true);
    const [prof, servList, pkgList, quotes, invs, ovStats] = await Promise.all([
      fetchStudioBusinessProfile(studioId),
      fetchStudioServices(studioId),
      fetchServicePackages(studioId),
      fetchQuotations(studioId),
      fetchInvoices(studioId),
      calculateFinanceOverviewStats(studioId),
    ]);

    setProfile(prof);
    setServices(servList);
    setPackages(pkgList);
    setQuotations(quotes);
    setInvoices(invs);
    setStats(ovStats);
    setLoading(false);
  };

  useEffect(() => {
    loadAllFinanceData();
  }, [studioId]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Convert Quote To Invoice
  const handleConvertToInvoice = async (quote: Quotation) => {
    const res = await convertQuotationToInvoice(quote);
    if (res.success && res.invoice) {
      showToast(`Quotation ${quote.quotation_number} converted to Invoice ${res.invoice.invoice_number}!`);
      loadAllFinanceData();
    }
  };

  // Create & Send Quote
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = selectedServicesForQuote
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is StudioService => Boolean(s))
      .map((s, idx) => ({
        id: `item_${idx + 1}`,
        service_id: s.id,
        name: s.name,
        description: s.description,
        quantity: 1,
        unit_price_paise: s.price_paise,
        tax_rate: s.gst_rate,
        line_subtotal_paise: s.price_paise,
        line_tax_paise: Math.round((s.price_paise * s.gst_rate) / 100),
        line_total_paise: s.price_paise + Math.round((s.price_paise * s.gst_rate) / 100),
      }));

    if (items.length === 0) {
      showToast('Please select at least one service from catalog.', 'warning');
      return;
    }

    const res = await createQuotation(studioId, {
      client_name: newQuoteClient.name,
      client_email: newQuoteClient.email,
      client_phone: newQuoteClient.phone,
      client_state: newQuoteClient.state,
      line_items: items,
      discount_type: discountType,
      discount_value: discountValue,
      status: 'sent',
    });

    if (res.success) {
      showToast('Quotation created & sent successfully!', 'success');
      setIsNewQuoteOpen(false);
      setSelectedServicesForQuote([]);
      loadAllFinanceData();
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const amountPaise = Math.round(parseFloat(paymentAmountINR || '0') * 100);
    if (amountPaise <= 0) return;

    setIsRecordingPayment(true);
    const res = await recordInvoicePayment(
      selectedInvoiceForPayment,
      amountPaise,
      paymentMethod,
      { notes: `Recorded manually via Studio Finance Portal` }
    );
    setIsRecordingPayment(false);

    if (res.success) {
      showToast(`Payment of ₹${amountPaise / 100} recorded! Receipt generated.`, 'success');
      setIsPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentAmountINR('');
      loadAllFinanceData();
    } else {
      showToast(res.error || 'Failed to record payment.', 'error');
    }
  };

  // Save Business Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await saveStudioBusinessProfile(profile);
    setSavingProfile(false);
    if (res.success) {
      showToast('Business & Billing settings saved cleanly!', 'success');
    } else {
      showToast(res.error || 'Failed to save business settings.', 'error');
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 font-manrope">
        <div className="w-8 h-8 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#736567]">Loading Studio Finance Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-manrope text-[#20181A]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
            Studio ERP Lite &amp; Client Billing (Flow B)
          </span>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5">
            Business Finance &amp; Invoices
          </h2>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            Issue quotations, GST tax invoices, track partial payments, generate payment links &amp; receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewQuoteOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#F4D06F]" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E8DFD1] pb-px overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { id: 'overview', label: 'Financial Overview', icon: TrendingUp },
          { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileText },
          { id: 'invoices', label: `Invoices (${invoices.length})`, icon: Receipt },
          { id: 'services', label: `Service Catalog (${services.length})`, icon: Package },
          { id: 'settings', label: 'Business & GST Settings', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as FinanceSubTab)}
              className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 border-b-2 ${
                isActive
                  ? 'border-[#540D1E] text-[#540D1E] bg-white font-bold'
                  : 'border-transparent text-[#736567] hover:text-[#20181A] hover:bg-[#FAF6EE]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. FINANCIAL OVERVIEW TAB                                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && stats && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Total Invoiced</span>
              <div className="text-xl sm:text-2xl font-bold text-[#20181A]">
                ₹{(stats.total_revenue_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#736567]">{stats.total_invoices_count} total issued</div>
            </div>

            <div className="p-4 bg-white border border-[#BCE3D1] bg-[#F7FCF9] rounded-2xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#136A4E]">Total Collected</span>
              <div className="text-xl sm:text-2xl font-bold text-[#136A4E]">
                ₹{(stats.total_collected_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#247559]">{stats.paid_invoices_count} fully settled</div>
            </div>

            <div className="p-4 bg-white border border-[#F2DEB0] bg-[#FFFDF9] rounded-2xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#976008]">Outstanding</span>
              <div className="text-xl sm:text-2xl font-bold text-[#976008]">
                ₹{(stats.total_outstanding_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#976008]">{stats.partially_paid_count} partial payments</div>
            </div>

            <div className="p-4 bg-white border border-[#F0D5D5] bg-[#FDF8F8] rounded-2xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C4A4A]">Quote Conversion</span>
              <div className="text-xl sm:text-2xl font-bold text-[#8C4A4A]">
                {stats.quotation_conversion_rate}%
              </div>
              <div className="text-[10px] text-[#8C4A4A]">{stats.pending_quotations_count} quotes pending</div>
            </div>

          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Outstanding Receivables List */}
            <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                  Outstanding Invoices
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('invoices')}
                  className="text-xs text-[#540D1E] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {invoices.filter(i => i.remaining_balance_paise > 0).length === 0 ? (
                <div className="p-6 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-[#167A5A] mx-auto" />
                  <p className="text-xs font-bold text-[#20181A]">All Invoices Settled!</p>
                  <p className="text-[11px] text-[#736567]">No pending or overdue balances from clients.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {invoices.filter(i => i.remaining_balance_paise > 0).slice(0, 4).map((inv) => (
                    <div key={inv.id} className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[#20181A] block">{inv.client_name}</span>
                        <span className="text-[10px] text-[#736567]">{inv.invoice_number} · Due: {inv.due_date}</span>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-[#976008]">
                          ₹{(inv.remaining_balance_paise / 100).toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentAmountINR((inv.remaining_balance_paise / 100).toString());
                            setIsPaymentModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-[#540D1E] hover:underline cursor-pointer"
                        >
                          + Record Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Trend Visualizer */}
            <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold block">
                3-Month Revenue Velocity
              </span>

              <div className="space-y-4 pt-2">
                {stats.monthly_revenue_chart.map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#20181A]">{m.month} 2026</span>
                      <span className="font-mono text-[11px] text-[#136A4E] font-bold">
                        Collected: ₹{(m.collected_paise / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#FAF6EE] rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#136A4E] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (m.collected_paise / (m.invoiced_paise || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUOTATIONS TAB                                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              Client Quotations ({quotations.length})
            </h3>

            <button
              type="button"
              onClick={() => setIsNewQuoteOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#540D1E] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#F4D06F]" />
              <span>New Quotation</span>
            </button>
          </div>

          {quotations.length === 0 ? (
            <div className="p-8 bg-white border border-[#E8DFD1] rounded-3xl text-center space-y-2">
              <FileText className="w-8 h-8 text-[#9C8C8E] mx-auto opacity-70" />
              <h4 className="font-cormorant text-lg font-bold text-[#20181A]">No Quotations Issued Yet</h4>
              <p className="text-xs text-[#736567] max-w-sm mx-auto">
                Create a professional quotation for your wedding client with services, taxes &amp; terms.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase tracking-wider text-[#736567]">
                    <tr>
                      <th className="p-3.5">Quotation #</th>
                      <th className="p-3.5">Client Details</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Valid Until</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {quotations.map((q) => {
                      const quoteUrl = `${originUrl}/quote/${q.secure_token}`;
                      return (
                        <tr key={q.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                          <td className="p-3.5 font-bold font-mono text-[#540D1E]">{q.quotation_number}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-[#20181A] block">{q.client_name}</span>
                            <span className="text-[10px] text-[#736567]">{q.client_phone || q.client_email}</span>
                          </td>
                          <td className="p-3.5 font-bold text-[#20181A]">
                            ₹{(q.total_amount_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-[#736567]">{q.expiry_date}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                              q.status === 'accepted' || q.status === 'converted'
                                ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                                : q.status === 'rejected'
                                ? 'bg-[#FDF2F2] text-[#8C4A4A] border border-[#F0D5D5]'
                                : 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(quoteUrl, q.id)}
                              className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] transition-colors cursor-pointer"
                              title="Copy Client Link"
                            >
                              {copiedLink === q.id ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => generateQuotationPdf(q, profile)}
                              className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {q.status !== 'converted' && (
                              <button
                                type="button"
                                onClick={() => handleConvertToInvoice(q)}
                                className="px-2.5 py-1 rounded-lg bg-[#540D1E] hover:bg-[#681025] text-white text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Convert to Invoice
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INVOICES TAB                                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              Client Invoices ({invoices.length})
            </h3>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 bg-white border border-[#E8DFD1] rounded-3xl text-center space-y-2">
              <Receipt className="w-8 h-8 text-[#9C8C8E] mx-auto opacity-70" />
              <h4 className="font-cormorant text-lg font-bold text-[#20181A]">No Invoices Issued Yet</h4>
              <p className="text-xs text-[#736567] max-w-sm mx-auto">
                Convert an accepted quotation to automatically generate a GST-compliant invoice.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase tracking-wider text-[#736567]">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Paid</th>
                      <th className="p-3.5">Balance</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {invoices.map((inv) => {
                      const payUrl = `${originUrl}/pay/${inv.secure_token}`;
                      return (
                        <tr key={inv.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                          <td className="p-3.5 font-bold font-mono text-[#540D1E]">{inv.invoice_number}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-[#20181A] block">{inv.client_name}</span>
                            <span className="text-[10px] text-[#736567]">Due: {inv.due_date}</span>
                          </td>
                          <td className="p-3.5 font-bold text-[#20181A]">
                            ₹{(inv.total_amount_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-[#136A4E] font-bold">
                            ₹{(inv.total_paid_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 font-bold text-[#976008]">
                            ₹{(inv.remaining_balance_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                              inv.payment_status === 'paid'
                                ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                                : inv.payment_status === 'partially_paid'
                                ? 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                                : 'bg-[#FDF2F2] text-[#8C4A4A] border border-[#F0D5D5]'
                            }`}>
                              {inv.payment_status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payUrl, inv.id)}
                              className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] transition-colors cursor-pointer"
                              title="Copy Payment Portal Link"
                            >
                              {copiedLink === inv.id ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => generateInvoicePdf(inv, profile)}
                              className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {inv.remaining_balance_paise > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setPaymentAmountINR((inv.remaining_balance_paise / 100).toString());
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#136A4E] hover:bg-[#1B7F5F] text-white text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Record Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SERVICE CATALOG TAB                                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
              Studio Service Catalog &amp; Reusable Items
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#8C6D2E] font-bold">
                      {srv.category}
                    </span>
                    <span className="text-xs font-bold text-[#540D1E]">
                      ₹{(srv.price_paise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#20181A]">{srv.name}</h4>
                  <p className="text-[11px] text-[#736567] leading-relaxed">{srv.description}</p>
                </div>

                <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-[10px] text-[#8C7A7C]">
                  <span>GST: {srv.gst_rate}%</span>
                  {srv.hsn_sac && <span>SAC: {srv.hsn_sac}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BUSINESS & GST SETTINGS TAB                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="border-b border-[#F2ECE1] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C772F] font-bold">
              Legal Business Identity &amp; Tax Configuration
            </span>
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Billing Coordinates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Legal Business Name</label>
              <input
                type="text"
                required
                value={profile.legal_business_name}
                onChange={(e) => setProfile({ ...profile, legal_business_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Display Studio Name</label>
              <input
                type="text"
                required
                value={profile.display_business_name}
                onChange={(e) => setProfile({ ...profile, display_business_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">GSTIN (15 Digits)</label>
              <input
                type="text"
                value={profile.gstin || ''}
                onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                placeholder="08AAAAA0000A1Z5"
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Supplier State (Place of Supply)</label>
              <input
                type="text"
                required
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Business Address</label>
              <input
                type="text"
                required
                value={profile.business_address}
                onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">UPI ID for Client Payments</label>
              <input
                type="text"
                value={profile.upi_id || ''}
                onChange={(e) => setProfile({ ...profile, upi_id: e.target.value })}
                placeholder="studio@upi"
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Bank Account Number</label>
              <input
                type="text"
                value={profile.bank_account_number || ''}
                onChange={(e) => setProfile({ ...profile, bank_account_number: e.target.value })}
                placeholder="1234567890"
                className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F2ECE1] flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
              <span>{savingProfile ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 👑 NEW QUOTATION MODAL                                                    */}
      {/* ========================================================================= */}
      {isNewQuoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-xl w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
                  Studio Billing
                </span>
                <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                  Create Client Quotation
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsNewQuoteOpen(false)}
                className="p-1 rounded-full text-[#736567] hover:bg-[#FAF6EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              
              {/* Client Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Client / Couple Name</label>
                  <input
                    type="text"
                    required
                    value={newQuoteClient.name}
                    onChange={(e) => setNewQuoteClient({ ...newQuoteClient, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Client Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={newQuoteClient.phone}
                    onChange={(e) => setNewQuoteClient({ ...newQuoteClient, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#4A3E40]">Select Services to Include</label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {services.map((srv) => {
                    const isChecked = selectedServicesForQuote.includes(srv.id);
                    return (
                      <label key={srv.id} className="p-2.5 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#FAF4E8]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServicesForQuote([...selectedServicesForQuote, srv.id]);
                              } else {
                                setSelectedServicesForQuote(selectedServicesForQuote.filter(id => id !== srv.id));
                              }
                            }}
                            className="rounded border-[#E8DFD1] text-[#540D1E]"
                          />
                          <span className="font-bold text-[#20181A]">{srv.name}</span>
                        </div>
                        <span className="font-mono text-[#540D1E] font-bold">
                          ₹{(srv.price_paise / 100).toLocaleString('en-IN')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>Issue &amp; Send Quotation</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💳 RECORD PAYMENT MODAL                                                   */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#136A4E] font-bold block">
                  Payment Collection
                </span>
                <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                  Record Client Payment
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-full text-[#736567] hover:bg-[#FAF6EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              
              <div className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#736567]">Invoice:</span>
                  <strong className="text-[#20181A]">{selectedInvoiceForPayment.invoice_number}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#736567]">Client:</span>
                  <strong className="text-[#20181A]">{selectedInvoiceForPayment.client_name}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#736567]">Remaining Balance:</span>
                  <strong className="text-[#976008]">₹{(selectedInvoiceForPayment.remaining_balance_paise / 100).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Amount to Record (INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={(selectedInvoiceForPayment.remaining_balance_paise / 100).toString()}
                  value={paymentAmountINR}
                  onChange={(e) => setPaymentAmountINR(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-mono font-bold text-[#136A4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-semibold"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="razorpay">Razorpay Online Link</option>
                  <option value="cash">Cash Settlement</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="px-5 py-2 rounded-xl bg-[#136A4E] hover:bg-[#1B7F5F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>{isRecordingPayment ? 'Recording...' : 'Confirm Payment'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🔔 Luxury Studio Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold flex items-center gap-2.5 ${
            toastNotification.type === 'error'
              ? 'bg-[#2A080E] text-rose-200 border-rose-500/60'
              : toastNotification.type === 'warning'
              ? 'bg-[#2A1D08] text-amber-200 border-amber-500/60'
              : 'bg-[#082A1A] text-emerald-200 border-emerald-500/60'
          }`}>
            {toastNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudioFinanceWorkspace;
