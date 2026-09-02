// =========================================================================
// 🏢 STUDIO BUSINESS FINANCE & BILLING ERP TYPES (PHASE 9)
// =========================================================================

export type QuotationStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected' 
  | 'expired' 
  | 'converted';

export type InvoiceStatus = 
  | 'draft' 
  | 'issued' 
  | 'partially_paid' 
  | 'paid' 
  | 'overdue' 
  | 'cancelled';

export type PaymentMethod = 
  | 'razorpay' 
  | 'upi' 
  | 'bank_transfer' 
  | 'cash' 
  | 'card' 
  | 'cheque';

export type PaymentRecordStatus = 
  | 'pending' 
  | 'verified' 
  | 'failed' 
  | 'refunded';

export type DiscountType = 'flat' | 'percentage';

export type ServiceCategory = 
  | 'invitation' 
  | 'video' 
  | 'guest_mgmt' 
  | 'domain' 
  | 'photography' 
  | 'addon' 
  | 'custom';

// =========================================================================
// 1. STUDIO BUSINESS & BILLING PROFILE
// =========================================================================

export interface StudioBusinessProfile {
  id: string;
  studio_id: string;
  legal_business_name: string;
  display_business_name: string;
  gstin: string | null;
  pan: string | null;
  gst_registered: boolean;
  default_gst_rate: number; // e.g. 0, 5, 12, 18, 28
  business_address: string;
  city: string;
  state: string; // Used for place of supply (CGST+SGST vs IGST)
  country: string;
  pin_code: string;
  billing_email: string;
  billing_phone: string;
  invoice_prefix: string; // e.g. "AL-INV-"
  quotation_prefix: string; // e.g. "AL-QUO-"
  default_payment_terms: string; // e.g. "Net 15 days", "50% Advance, 50% on Delivery"
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  bank_name?: string | null;
  upi_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// 2. REUSABLE SERVICE CATALOG & PACKAGES
// =========================================================================

export interface StudioService {
  id: string;
  studio_id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price_paise: number; // Stored in Paise (integer) to avoid float rounding errors
  gst_rate: number; // 0, 5, 12, 18, 28
  hsn_sac?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServicePackageItem {
  service_id?: string;
  name: string;
  description: string;
  quantity: number;
  unit_price_paise: number;
  gst_rate: number;
}

export interface StudioServicePackage {
  id: string;
  studio_id: string;
  package_name: string;
  description: string;
  total_price_paise: number;
  items_snapshot: ServicePackageItem[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// 3. QUOTATION SYSTEM
// =========================================================================

export interface QuotationLineItem {
  id: string;
  service_id?: string | null;
  name: string;
  description?: string;
  hsn_sac?: string | null;
  quantity: number;
  unit_price_paise: number;
  discount_type?: DiscountType;
  discount_value?: number; // percentage or flat amount in paise
  tax_rate: number; // percentage
  line_subtotal_paise: number;
  line_tax_paise: number;
  line_total_paise: number;
}

export interface Quotation {
  id: string;
  studio_id: string;
  wedding_slug?: string | null;
  wedding_site_id?: string | null;
  quotation_number: string; // e.g. "AL-QUO-0001"
  secure_token: string; // "quo_..."
  issue_date: string;
  expiry_date: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address?: string;
  client_state?: string; // Used to evaluate CGST/SGST vs IGST
  client_gstin?: string | null;
  line_items: QuotationLineItem[];
  subtotal_paise: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_paise: number;
  taxable_amount_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  total_tax_paise: number;
  total_amount_paise: number;
  notes?: string;
  terms_and_conditions?: string;
  status: QuotationStatus;
  accepted_at?: string | null;
  accepted_by_name?: string | null;
  rejection_reason?: string | null;
  converted_invoice_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// 4. INVOICE SYSTEM
// =========================================================================

export interface InvoiceLineItem {
  id: string;
  service_id?: string | null;
  name: string;
  description?: string;
  hsn_sac?: string | null;
  quantity: number;
  unit_price_paise: number;
  tax_rate: number;
  line_subtotal_paise: number;
  line_tax_paise: number;
  line_total_paise: number;
}

export interface Invoice {
  id: string;
  studio_id: string;
  quotation_id?: string | null;
  wedding_slug?: string | null;
  wedding_site_id?: string | null;
  invoice_number: string; // e.g. "AL-INV-0001"
  secure_token: string; // "inv_..."
  issue_date: string;
  due_date: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address?: string;
  client_state?: string;
  client_gstin?: string | null;
  line_items: InvoiceLineItem[];
  subtotal_paise: number;
  discount_paise: number;
  taxable_amount_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  total_tax_paise: number;
  total_amount_paise: number;
  total_paid_paise: number;
  remaining_balance_paise: number;
  payment_status: InvoiceStatus;
  notes?: string;
  terms_and_conditions?: string;
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// 5. CLIENT PAYMENT RECORDS & RECEIPTS
// =========================================================================

export interface InvoicePayment {
  id: string;
  studio_id: string;
  invoice_id: string;
  amount_paise: number;
  payment_method: PaymentMethod;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  reference_number?: string | null;
  status: PaymentRecordStatus;
  notes?: string;
  receipt_number: string; // e.g. "RCP-0001"
  verified_at?: string | null;
  created_at: string;
}

export interface PaymentReceipt {
  id: string;
  studio_id: string;
  invoice_id: string;
  payment_id: string;
  receipt_number: string;
  amount_paid_paise: number;
  remaining_balance_paise: number;
  payment_date: string;
  payment_method: PaymentMethod;
  studio_details_snapshot: Record<string, any>;
  client_details_snapshot: Record<string, any>;
  created_at: string;
}

// =========================================================================
// 6. REVENUE ANALYTICS & METRICS
// =========================================================================

export interface StudioFinanceOverviewStats {
  total_revenue_paise: number;
  total_collected_paise: number;
  total_outstanding_paise: number;
  total_overdue_paise: number;
  total_invoices_count: number;
  paid_invoices_count: number;
  partially_paid_count: number;
  overdue_invoices_count: number;
  pending_quotations_count: number;
  quotation_conversion_rate: number; // e.g. 75.5%
  monthly_revenue_chart: Array<{
    month: string;
    collected_paise: number;
    invoiced_paise: number;
  }>;
}

export interface FinancialAuditLog {
  id: string;
  studio_id: string;
  entity_type: 'quotation' | 'invoice' | 'payment' | 'receipt' | 'profile';
  entity_id: string;
  action: string;
  metadata?: Record<string, any>;
  actor_name?: string;
  created_at: string;
}
