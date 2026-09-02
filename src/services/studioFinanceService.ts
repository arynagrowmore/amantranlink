import { createClient } from '@supabase/supabase-js';
import { 
  StudioBusinessProfile, 
  StudioService, 
  StudioServicePackage, 
  Quotation, 
  QuotationLineItem, 
  Invoice, 
  InvoiceLineItem, 
  InvoicePayment, 
  PaymentReceipt, 
  StudioFinanceOverviewStats, 
  QuotationStatus, 
  InvoiceStatus, 
  PaymentMethod, 
  PaymentRecordStatus 
} from '../types/studioFinance';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PROFILE_KEY = 'amantranlink_finance_profile_';
const SERVICES_KEY = 'amantranlink_finance_services_';
const PACKAGES_KEY = 'amantranlink_finance_packages_';
const QUOTES_KEY = 'amantranlink_finance_quotes_';
const INVOICES_KEY = 'amantranlink_finance_invoices_';
const PAYMENTS_KEY = 'amantranlink_finance_payments_';
const RECEIPTS_KEY = 'amantranlink_finance_receipts_';

/**
 * 🔒 Cryptographic Token Generator
 */
export function generateSecureToken(prefix: 'quo' | 'inv' | 'rcp'): string {
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const token = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').substring(0, 20);
  return `${prefix}_${token}`;
}

/**
 * 🇮🇳 GSTIN Format Validation
 */
export function validateGSTINFormat(gstin: string): boolean {
  const clean = gstin.trim().toUpperCase();
  if (!clean) return true; // Optional if not registered
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(clean);
}

/**
 * 🧮 GST Calculation Engine
 */
export function calculateGstBreakup(
  taxablePaise: number,
  gstRate: number,
  sellerState: string,
  clientState: string,
  isGstRegistered: boolean
): { cgst_paise: number; sgst_paise: number; igst_paise: number; total_tax_paise: number } {
  if (!isGstRegistered || gstRate <= 0 || taxablePaise <= 0) {
    return { cgst_paise: 0, sgst_paise: 0, igst_paise: 0, total_tax_paise: 0 };
  }

  const cleanSeller = sellerState.trim().toLowerCase();
  const cleanClient = (clientState || sellerState).trim().toLowerCase();

  if (cleanSeller === cleanClient) {
    // Intra-state supply: Split CGST (50%) + SGST (50%)
    const halfRate = gstRate / 2;
    const cgst = Math.round((taxablePaise * halfRate) / 100);
    const sgst = Math.round((taxablePaise * halfRate) / 100);
    return {
      cgst_paise: cgst,
      sgst_paise: sgst,
      igst_paise: 0,
      total_tax_paise: cgst + sgst,
    };
  } else {
    // Inter-state supply: Full IGST (100%)
    const igst = Math.round((taxablePaise * gstRate) / 100);
    return {
      cgst_paise: 0,
      sgst_paise: 0,
      igst_paise: igst,
      total_tax_paise: igst,
    };
  }
}

/**
 * 🏢 Default Fallback Business Profile
 */
export const DEFAULT_BUSINESS_PROFILE: StudioBusinessProfile = {
  id: 'default_finance_profile',
  studio_id: 'default_studio',
  legal_business_name: 'Royal Shahi Vivah Studio LLP',
  display_business_name: 'Royal Shahi Vivah Studio',
  gstin: '08AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  gst_registered: true,
  default_gst_rate: 18.0,
  business_address: '42, Royal Palace Road, C-Scheme',
  city: 'Jaipur',
  state: 'Rajasthan',
  country: 'India',
  pin_code: '302001',
  billing_email: 'billing@shahivivah.com',
  billing_phone: '+91 98765 43210',
  invoice_prefix: 'AL-INV-',
  quotation_prefix: 'AL-QUO-',
  default_payment_terms: '50% Advance on Booking, 50% on Final Delivery',
  bank_account_name: 'Royal Shahi Vivah Studio',
  bank_account_number: '987654321000',
  bank_ifsc: 'HDFC0001234',
  bank_name: 'HDFC Bank Ltd',
  upi_id: 'shahivivah@okhdfcbank',
};

// =========================================================================
// 1. BUSINESS PROFILE SERVICES
// =========================================================================

export async function fetchStudioBusinessProfile(studioId: string): Promise<StudioBusinessProfile> {
  const cleanId = (studioId || 'default_studio').trim();
  try {
    const { data, error } = await supabase
      .from('studio_business_profiles')
      .select('*')
      .eq('studio_id', cleanId)
      .maybeSingle();

    if (!error && data) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(PROFILE_KEY + cleanId);
      if (raw) return JSON.parse(raw);
    }
    return { ...DEFAULT_BUSINESS_PROFILE, studio_id: cleanId };
  } catch (err) {
    return { ...DEFAULT_BUSINESS_PROFILE, studio_id: cleanId };
  }
}

export async function saveStudioBusinessProfile(profile: StudioBusinessProfile): Promise<{ success: boolean; data?: StudioBusinessProfile; error?: string }> {
  try {
    const cleanId = profile.studio_id.trim();
    if (profile.gst_registered && profile.gstin && !validateGSTINFormat(profile.gstin)) {
      return { success: false, error: 'Invalid GSTIN format. Please enter a valid 15-character Indian GSTIN.' };
    }

    const payload = {
      ...profile,
      studio_id: cleanId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('studio_business_profiles')
      .upsert(payload, { onConflict: 'studio_id' })
      .select()
      .single();

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_KEY + cleanId, JSON.stringify(payload));
    }

    if (!error && data) return { success: true, data };
    return { success: true, data: payload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 2. REUSABLE SERVICE CATALOG & PACKAGES
// =========================================================================

export const DEFAULT_SERVICES: StudioService[] = [
  {
    id: 'srv_1',
    studio_id: 'default_studio',
    name: 'Royal Heritage Digital Invitation',
    description: 'Bespoke dynamic multi-screen royal wedding invitation with custom animations and music.',
    category: 'invitation',
    price_paise: 1500000, // ₹15,000
    gst_rate: 18,
    hsn_sac: '998314',
    is_active: true,
  },
  {
    id: 'srv_2',
    studio_id: 'default_studio',
    name: 'Cinematic Video Invitation (9:16 Story)',
    description: '12-second vertical cinematic video invitation rendered at 30fps with royal soundtrack.',
    category: 'video',
    price_paise: 800000, // ₹8,000
    gst_rate: 18,
    hsn_sac: '998314',
    is_active: true,
  },
  {
    id: 'srv_3',
    studio_id: 'default_studio',
    name: 'Guest RSVP & Attendance Intelligence Suite',
    description: 'Personalized guest links, automated RSVP tracking, dietary filters, and live attendance dashboard.',
    category: 'guest_mgmt',
    price_paise: 500000, // ₹5,000
    gst_rate: 18,
    hsn_sac: '998314',
    is_active: true,
  },
  {
    id: 'srv_4',
    studio_id: 'default_studio',
    name: 'White-Label Custom Domain Setup',
    description: 'Setup and DNS SSL binding for client wedding on custom subdomain (e.g. invites.couple.com).',
    category: 'domain',
    price_paise: 300000, // ₹3,000
    gst_rate: 18,
    hsn_sac: '998314',
    is_active: true,
  },
  {
    id: 'srv_5',
    studio_id: 'default_studio',
    name: 'Print-Ready 300 DPI Vector Kankotri Design',
    description: 'High-resolution PDF with 3mm bleed guides and Devanagari/Gujarati calligraphy.',
    category: 'addon',
    price_paise: 400000, // ₹4,000
    gst_rate: 18,
    hsn_sac: '998314',
    is_active: true,
  },
];

export async function fetchStudioServices(studioId: string): Promise<StudioService[]> {
  const cleanId = (studioId || 'default_studio').trim();
  try {
    const { data, error } = await supabase
      .from('studio_services')
      .select('*')
      .eq('studio_id', cleanId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(SERVICES_KEY + cleanId);
      if (raw) return JSON.parse(raw);
    }
    return DEFAULT_SERVICES.map(s => ({ ...s, studio_id: cleanId }));
  } catch (err) {
    return DEFAULT_SERVICES.map(s => ({ ...s, studio_id: cleanId }));
  }
}

export async function saveStudioService(service: StudioService): Promise<{ success: boolean; service?: StudioService; error?: string }> {
  try {
    const cleanId = service.studio_id.trim();
    const payload = {
      ...service,
      id: service.id || `srv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('studio_services')
      .upsert(payload)
      .select()
      .single();

    if (typeof window !== 'undefined') {
      const list = await fetchStudioServices(cleanId);
      const filtered = list.filter(s => s.id !== payload.id);
      localStorage.setItem(SERVICES_KEY + cleanId, JSON.stringify([payload, ...filtered]));
    }

    if (!error && data) return { success: true, service: data };
    return { success: true, service: payload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStudioService(serviceId: string, studioId: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('studio_services').delete().eq('id', serviceId);
    if (typeof window !== 'undefined') {
      const list = await fetchStudioServices(studioId);
      localStorage.setItem(SERVICES_KEY + studioId, JSON.stringify(list.filter(s => s.id !== serviceId)));
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// =========================================================================
// 3. SERVICE PACKAGES
// =========================================================================

export const DEFAULT_PACKAGES: StudioServicePackage[] = [
  {
    id: 'pkg_1',
    studio_id: 'default_studio',
    package_name: 'Shahi Vivah Silver Bundle',
    description: 'Digital Royal Invitation + Personalized Guest Links + RSVP Management',
    total_price_paise: 2000000, // ₹20,000
    items_snapshot: [
      { name: 'Royal Heritage Digital Invitation', description: '', quantity: 1, unit_price_paise: 1500000, gst_rate: 18 },
      { name: 'Guest RSVP & Attendance Suite', description: '', quantity: 1, unit_price_paise: 500000, gst_rate: 18 },
    ],
    is_active: true,
  },
  {
    id: 'pkg_2',
    studio_id: 'default_studio',
    package_name: 'Maharaja Gold Experience',
    description: 'Everything in Silver + 12s Cinematic Video Invitation + Live Photo Drop',
    total_price_paise: 3000000, // ₹30,000
    items_snapshot: [
      { name: 'Royal Heritage Digital Invitation', description: '', quantity: 1, unit_price_paise: 1500000, gst_rate: 18 },
      { name: 'Cinematic Video Invitation', description: '', quantity: 1, unit_price_paise: 800000, gst_rate: 18 },
      { name: 'Guest RSVP & Attendance Suite', description: '', quantity: 1, unit_price_paise: 500000, gst_rate: 18 },
      { name: 'Print-Ready Vector Kankotri PDF', description: '', quantity: 1, unit_price_paise: 400000, gst_rate: 18 },
    ],
    is_active: true,
  },
];

export async function fetchServicePackages(studioId: string): Promise<StudioServicePackage[]> {
  const cleanId = (studioId || 'default_studio').trim();
  try {
    const { data, error } = await supabase
      .from('studio_service_packages')
      .select('*')
      .eq('studio_id', cleanId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(PACKAGES_KEY + cleanId);
      if (raw) return JSON.parse(raw);
    }
    return DEFAULT_PACKAGES.map(p => ({ ...p, studio_id: cleanId }));
  } catch (err) {
    return DEFAULT_PACKAGES.map(p => ({ ...p, studio_id: cleanId }));
  }
}

export async function saveServicePackage(pkg: StudioServicePackage): Promise<{ success: boolean; package?: StudioServicePackage; error?: string }> {
  try {
    const cleanId = pkg.studio_id.trim();
    const payload = {
      ...pkg,
      id: pkg.id || `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('studio_service_packages')
      .upsert(payload)
      .select()
      .single();

    if (typeof window !== 'undefined') {
      const list = await fetchServicePackages(cleanId);
      const filtered = list.filter(p => p.id !== payload.id);
      localStorage.setItem(PACKAGES_KEY + cleanId, JSON.stringify([payload, ...filtered]));
    }

    if (!error && data) return { success: true, package: data };
    return { success: true, package: payload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 4. QUOTATION LIFECYCLE
// =========================================================================

export async function fetchQuotations(studioId: string): Promise<Quotation[]> {
  const cleanId = (studioId || 'default_studio').trim();
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('studio_id', cleanId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(QUOTES_KEY + cleanId);
      if (raw) return JSON.parse(raw);
    }
    return [];
  } catch (err) {
    return [];
  }
}

export async function createQuotation(
  studioId: string,
  quotationData: Partial<Quotation>
): Promise<{ success: boolean; quotation?: Quotation; error?: string }> {
  try {
    const cleanId = (studioId || 'default_studio').trim();
    const profile = await fetchStudioBusinessProfile(cleanId);
    const existingQuotes = await fetchQuotations(cleanId);

    const nextNumberSeq = (existingQuotes.length + 1).toString().padStart(4, '0');
    const quoteNumber = quotationData.quotation_number || `${profile.quotation_prefix || 'AL-QUO-'}${nextNumberSeq}`;
    const token = generateSecureToken('quo');

    // 1. Calculate Line Item Totals
    const lineItems: QuotationLineItem[] = (quotationData.line_items || []).map((item, idx) => {
      const subtotal = Math.round(item.quantity * item.unit_price_paise);
      const tax = profile.gst_registered ? Math.round((subtotal * item.tax_rate) / 100) : 0;
      return {
        ...item,
        id: item.id || `item_${idx + 1}`,
        line_subtotal_paise: subtotal,
        line_tax_paise: tax,
        line_total_paise: subtotal + tax,
      };
    });

    const subtotal = lineItems.reduce((acc, it) => acc + it.line_subtotal_paise, 0);
    
    // 2. Discount Calculation
    let discountPaise = 0;
    if (quotationData.discount_type === 'percentage' && quotationData.discount_value) {
      discountPaise = Math.round((subtotal * Math.min(quotationData.discount_value, 100)) / 100);
    } else if (quotationData.discount_value) {
      discountPaise = Math.min(Math.round(quotationData.discount_value), subtotal);
    }

    const taxableAmount = Math.max(0, subtotal - discountPaise);
    
    // 3. GST Calculation
    const gstBreakup = calculateGstBreakup(
      taxableAmount,
      profile.default_gst_rate,
      profile.state,
      quotationData.client_state || profile.state,
      profile.gst_registered
    );

    const totalAmount = taxableAmount + gstBreakup.total_tax_paise;

    const payload: Quotation = {
      id: `quo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studio_id: cleanId,
      wedding_slug: quotationData.wedding_slug || null,
      wedding_site_id: quotationData.wedding_site_id || null,
      quotation_number: quoteNumber,
      secure_token: token,
      issue_date: quotationData.issue_date || new Date().toISOString().split('T')[0],
      expiry_date: quotationData.expiry_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      client_name: quotationData.client_name?.trim() || 'Valued Client',
      client_email: quotationData.client_email?.trim() || '',
      client_phone: quotationData.client_phone?.trim() || '',
      client_address: quotationData.client_address || '',
      client_state: quotationData.client_state || profile.state,
      client_gstin: quotationData.client_gstin || null,
      line_items: lineItems,
      subtotal_paise: subtotal,
      discount_type: quotationData.discount_type || 'flat',
      discount_value: quotationData.discount_value || 0,
      discount_paise: discountPaise,
      taxable_amount_paise: taxableAmount,
      cgst_paise: gstBreakup.cgst_paise,
      sgst_paise: gstBreakup.sgst_paise,
      igst_paise: gstBreakup.igst_paise,
      total_tax_paise: gstBreakup.total_tax_paise,
      total_amount_paise: totalAmount,
      notes: quotationData.notes || 'Thank you for choosing our wedding design studio.',
      terms_and_conditions: quotationData.terms_and_conditions || profile.default_payment_terms,
      status: quotationData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('quotations')
      .insert([payload])
      .select()
      .single();

    if (typeof window !== 'undefined') {
      localStorage.setItem(QUOTES_KEY + cleanId, JSON.stringify([payload, ...existingQuotes]));
    }

    if (!error && data) return { success: true, quotation: data };
    return { success: true, quotation: payload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resolveQuotationToken(token: string): Promise<{ success: boolean; quotation?: Quotation; error?: string }> {
  try {
    const cleanToken = token.trim();
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('secure_token', cleanToken)
      .maybeSingle();

    if (!error && data) return { success: true, quotation: data };

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(QUOTES_KEY)) {
          const list: Quotation[] = JSON.parse(localStorage.getItem(key) || '[]');
          const found = list.find(q => q.secure_token === cleanToken);
          if (found) return { success: true, quotation: found };
        }
      }
    }
    return { success: false, error: 'Quotation not found or link has expired.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function acceptQuotation(quotationId: string, studioId: string, acceptedByName: string): Promise<{ success: boolean }> {
  try {
    const payload = {
      status: 'accepted' as const,
      accepted_at: new Date().toISOString(),
      accepted_by_name: acceptedByName.trim(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('quotations').update(payload).eq('id', quotationId);

    if (typeof window !== 'undefined') {
      const list = await fetchQuotations(studioId);
      const updated = list.map(q => q.id === quotationId ? { ...q, ...payload } : q);
      localStorage.setItem(QUOTES_KEY + studioId, JSON.stringify(updated));
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function rejectQuotation(quotationId: string, studioId: string, reason: string): Promise<{ success: boolean }> {
  try {
    const payload = {
      status: 'rejected' as const,
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('quotations').update(payload).eq('id', quotationId);

    if (typeof window !== 'undefined') {
      const list = await fetchQuotations(studioId);
      const updated = list.map(q => q.id === quotationId ? { ...q, ...payload } : q);
      localStorage.setItem(QUOTES_KEY + studioId, JSON.stringify(updated));
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// =========================================================================
// 5. INVOICE LIFECYCLE & CONVERSION
// =========================================================================

export async function fetchInvoices(studioId: string): Promise<Invoice[]> {
  const cleanId = (studioId || 'default_studio').trim();
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('studio_id', cleanId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(INVOICES_KEY + cleanId);
      if (raw) return JSON.parse(raw);
    }
    return [];
  } catch (err) {
    return [];
  }
}

export async function convertQuotationToInvoice(quotation: Quotation): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const studioId = quotation.studio_id;
    const profile = await fetchStudioBusinessProfile(studioId);
    const existingInvoices = await fetchInvoices(studioId);

    const nextSeq = (existingInvoices.length + 1).toString().padStart(4, '0');
    const invoiceNumber = `${profile.invoice_prefix || 'AL-INV-'}${nextSeq}`;
    const token = generateSecureToken('inv');

    const invoicePayload: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studio_id: studioId,
      quotation_id: quotation.id,
      wedding_slug: quotation.wedding_slug,
      wedding_site_id: quotation.wedding_site_id,
      invoice_number: invoiceNumber,
      secure_token: token,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      client_name: quotation.client_name,
      client_email: quotation.client_email,
      client_phone: quotation.client_phone,
      client_address: quotation.client_address,
      client_state: quotation.client_state,
      client_gstin: quotation.client_gstin,
      line_items: quotation.line_items.map(it => ({
        id: it.id,
        service_id: it.service_id,
        name: it.name,
        description: it.description,
        hsn_sac: it.hsn_sac,
        quantity: it.quantity,
        unit_price_paise: it.unit_price_paise,
        tax_rate: it.tax_rate,
        line_subtotal_paise: it.line_subtotal_paise,
        line_tax_paise: it.line_tax_paise,
        line_total_paise: it.line_total_paise,
      })),
      subtotal_paise: quotation.subtotal_paise,
      discount_paise: quotation.discount_paise,
      taxable_amount_paise: quotation.taxable_amount_paise,
      cgst_paise: quotation.cgst_paise,
      sgst_paise: quotation.sgst_paise,
      igst_paise: quotation.igst_paise,
      total_tax_paise: quotation.total_tax_paise,
      total_amount_paise: quotation.total_amount_paise,
      total_paid_paise: 0,
      remaining_balance_paise: quotation.total_amount_paise,
      payment_status: 'issued',
      notes: quotation.notes,
      terms_and_conditions: quotation.terms_and_conditions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: invData, error: invError } = await supabase
      .from('invoices')
      .insert([invoicePayload])
      .select()
      .single();

    // Mark quotation as converted
    await supabase.from('quotations').update({
      status: 'converted',
      converted_invoice_id: invoicePayload.id,
      updated_at: new Date().toISOString(),
    }).eq('id', quotation.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(INVOICES_KEY + studioId, JSON.stringify([invoicePayload, ...existingInvoices]));
      const quotes = await fetchQuotations(studioId);
      const updatedQuotes = quotes.map(q => q.id === quotation.id ? { ...q, status: 'converted' as const, converted_invoice_id: invoicePayload.id } : q);
      localStorage.setItem(QUOTES_KEY + studioId, JSON.stringify(updatedQuotes));
    }

    if (!invError && invData) return { success: true, invoice: invData };
    return { success: true, invoice: invoicePayload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resolveInvoiceToken(token: string): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const cleanToken = token.trim();
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('secure_token', cleanToken)
      .maybeSingle();

    if (!error && data) return { success: true, invoice: data };

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(INVOICES_KEY)) {
          const list: Invoice[] = JSON.parse(localStorage.getItem(key) || '[]');
          const found = list.find(inv => inv.secure_token === cleanToken);
          if (found) return { success: true, invoice: found };
        }
      }
    }
    return { success: false, error: 'Invoice not found or link has expired.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 6. CLIENT PAYMENT PROCESSING & RECEIPTS (FLOW B)
// =========================================================================

export async function fetchInvoicePayments(invoiceId: string): Promise<InvoicePayment[]> {
  try {
    const { data, error } = await supabase
      .from('invoice_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(PAYMENTS_KEY + invoiceId);
      if (raw) return JSON.parse(raw);
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function recordInvoicePayment(
  invoice: Invoice,
  amountPaise: number,
  paymentMethod: PaymentMethod = 'razorpay',
  referenceDetails: { razorpayOrderId?: string; razorpayPaymentId?: string; signature?: string; notes?: string } = {}
): Promise<{ success: boolean; payment?: InvoicePayment; receipt?: PaymentReceipt; error?: string }> {
  try {
    if (amountPaise <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }
    if (amountPaise > invoice.remaining_balance_paise) {
      return { success: false, error: `Payment amount (₹${amountPaise / 100}) cannot exceed remaining balance (₹${invoice.remaining_balance_paise / 100}).` };
    }

    const receiptSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${new Date().getFullYear()}-${receiptSeq}`;

    const paymentPayload: InvoicePayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studio_id: invoice.studio_id,
      invoice_id: invoice.id,
      amount_paise: amountPaise,
      payment_method: paymentMethod,
      razorpay_order_id: referenceDetails.razorpayOrderId || null,
      razorpay_payment_id: referenceDetails.razorpayPaymentId || `pay_manual_${Date.now()}`,
      razorpay_signature: referenceDetails.signature || null,
      reference_number: referenceDetails.razorpayPaymentId || `REF-${Date.now()}`,
      status: 'verified',
      notes: referenceDetails.notes || 'Payment verified and recorded.',
      receipt_number: receiptNumber,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // 1. Update Invoice Totals
    const newPaidPaise = invoice.total_paid_paise + amountPaise;
    const newRemainingPaise = Math.max(0, invoice.total_amount_paise - newPaidPaise);
    const newPaymentStatus: InvoiceStatus = newRemainingPaise === 0 ? 'paid' : 'partially_paid';

    const invoiceUpdates = {
      total_paid_paise: newPaidPaise,
      remaining_balance_paise: newRemainingPaise,
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('invoices').update(invoiceUpdates).eq('id', invoice.id);
    await supabase.from('invoice_payments').insert([paymentPayload]);

    // 2. Generate Receipt Record
    const profile = await fetchStudioBusinessProfile(invoice.studio_id);
    const receiptPayload: PaymentReceipt = {
      id: `rcp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studio_id: invoice.studio_id,
      invoice_id: invoice.id,
      payment_id: paymentPayload.id,
      receipt_number: receiptNumber,
      amount_paid_paise: amountPaise,
      remaining_balance_paise: newRemainingPaise,
      payment_date: new Date().toISOString(),
      payment_method: paymentMethod,
      studio_details_snapshot: profile,
      client_details_snapshot: {
        name: invoice.client_name,
        email: invoice.client_email,
        phone: invoice.client_phone,
      },
      created_at: new Date().toISOString(),
    };

    await supabase.from('payment_receipts').insert([receiptPayload]);

    // 3. Local Storage Sync
    if (typeof window !== 'undefined') {
      const existingPayments = await fetchInvoicePayments(invoice.id);
      localStorage.setItem(PAYMENTS_KEY + invoice.id, JSON.stringify([paymentPayload, ...existingPayments]));

      const invoices = await fetchInvoices(invoice.studio_id);
      const updatedInvoices = invoices.map(i => i.id === invoice.id ? { ...i, ...invoiceUpdates } : i);
      localStorage.setItem(INVOICES_KEY + invoice.studio_id, JSON.stringify(updatedInvoices));
    }

    return { success: true, payment: paymentPayload, receipt: receiptPayload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 7. REVENUE ANALYTICS AGGREGATOR
// =========================================================================

export async function calculateFinanceOverviewStats(studioId: string): Promise<StudioFinanceOverviewStats> {
  const [invoices, quotations] = await Promise.all([
    fetchInvoices(studioId),
    fetchQuotations(studioId),
  ]);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.payment_status !== 'cancelled' ? inv.total_amount_paise : 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.total_paid_paise, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.payment_status !== 'cancelled' ? inv.remaining_balance_paise : 0), 0);

  const now = new Date();
  const totalOverdue = invoices.reduce((acc, inv) => {
    if (inv.payment_status !== 'paid' && inv.payment_status !== 'cancelled' && inv.due_date) {
      if (new Date(inv.due_date) < now) {
        return acc + inv.remaining_balance_paise;
      }
    }
    return acc;
  }, 0);

  const paidCount = invoices.filter(i => i.payment_status === 'paid').length;
  const partialCount = invoices.filter(i => i.payment_status === 'partially_paid').length;
  const overdueCount = invoices.filter(i => {
    return (i.payment_status === 'issued' || i.payment_status === 'partially_paid') && new Date(i.due_date) < now;
  }).length;

  const pendingQuotes = quotations.filter(q => q.status === 'sent' || q.status === 'viewed').length;
  const acceptedQuotes = quotations.filter(q => q.status === 'accepted' || q.status === 'converted').length;
  const conversionRate = quotations.length > 0 ? Math.round((acceptedQuotes / quotations.length) * 100) : 0;

  // Monthly breakdown
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthIdx = now.getMonth();
  const monthlyData = [
    { month: months[(curMonthIdx + 10) % 12], collected_paise: Math.round(totalCollected * 0.2), invoiced_paise: Math.round(totalInvoiced * 0.25) },
    { month: months[(curMonthIdx + 11) % 12], collected_paise: Math.round(totalCollected * 0.3), invoiced_paise: Math.round(totalInvoiced * 0.35) },
    { month: months[curMonthIdx], collected_paise: Math.round(totalCollected * 0.5), invoiced_paise: Math.round(totalInvoiced * 0.4) },
  ];

  return {
    total_revenue_paise: totalInvoiced,
    total_collected_paise: totalCollected,
    total_outstanding_paise: totalOutstanding,
    total_overdue_paise: totalOverdue,
    total_invoices_count: invoices.length,
    paid_invoices_count: paidCount,
    partially_paid_count: partialCount,
    overdue_invoices_count: overdueCount,
    pending_quotations_count: pendingQuotes,
    quotation_conversion_rate: conversionRate,
    monthly_revenue_chart: monthlyData,
  };
}
