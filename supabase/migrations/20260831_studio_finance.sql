-- =========================================================================
-- 🏢 SHAHI VIVAH STUDIO FINANCE & BILLING ERP (PHASE 9)
-- Multi-Tenant Database Architecture for Quotations, Invoices, GST, & Payments
-- =========================================================================

-- 1. Studio Business & Billing Profile
CREATE TABLE IF NOT EXISTS public.studio_business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL UNIQUE,
    legal_business_name TEXT NOT NULL,
    display_business_name TEXT NOT NULL,
    gstin TEXT,
    pan TEXT,
    gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
    default_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    business_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    pin_code TEXT NOT NULL,
    billing_email TEXT NOT NULL,
    billing_phone TEXT NOT NULL,
    invoice_prefix TEXT NOT NULL DEFAULT 'AL-INV-',
    quotation_prefix TEXT NOT NULL DEFAULT 'AL-QUO-',
    default_payment_terms TEXT DEFAULT '50% Advance, 50% on Final Delivery',
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Studio Reusable Service Catalog
CREATE TABLE IF NOT EXISTS public.studio_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'invitation' CHECK (category IN ('invitation', 'video', 'guest_mgmt', 'domain', 'photography', 'addon', 'custom')),
    price_paise BIGINT NOT NULL DEFAULT 0,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    hsn_sac TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Studio Service Packages
CREATE TABLE IF NOT EXISTS public.studio_service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    package_name TEXT NOT NULL,
    description TEXT,
    total_price_paise BIGINT NOT NULL DEFAULT 0,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Studio Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    wedding_slug TEXT,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
    quotation_number TEXT NOT NULL,
    secure_token TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_address TEXT,
    client_state TEXT,
    client_gstin TEXT,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_paise BIGINT NOT NULL DEFAULT 0,
    discount_type TEXT NOT NULL DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_paise BIGINT NOT NULL DEFAULT 0,
    taxable_amount_paise BIGINT NOT NULL DEFAULT 0,
    cgst_paise BIGINT NOT NULL DEFAULT 0,
    sgst_paise BIGINT NOT NULL DEFAULT 0,
    igst_paise BIGINT NOT NULL DEFAULT 0,
    total_tax_paise BIGINT NOT NULL DEFAULT 0,
    total_amount_paise BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    terms_and_conditions TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted')),
    accepted_at TIMESTAMPTZ,
    accepted_by_name TEXT,
    rejection_reason TEXT,
    converted_invoice_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_studio_quotation_number UNIQUE (studio_id, quotation_number)
);

-- 5. Studio Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    wedding_slug TEXT,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    secure_token TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_address TEXT,
    client_state TEXT,
    client_gstin TEXT,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_paise BIGINT NOT NULL DEFAULT 0,
    discount_paise BIGINT NOT NULL DEFAULT 0,
    taxable_amount_paise BIGINT NOT NULL DEFAULT 0,
    cgst_paise BIGINT NOT NULL DEFAULT 0,
    sgst_paise BIGINT NOT NULL DEFAULT 0,
    igst_paise BIGINT NOT NULL DEFAULT 0,
    total_tax_paise BIGINT NOT NULL DEFAULT 0,
    total_amount_paise BIGINT NOT NULL DEFAULT 0,
    total_paid_paise BIGINT NOT NULL DEFAULT 0,
    remaining_balance_paise BIGINT NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'draft' CHECK (payment_status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    terms_and_conditions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_studio_invoice_number UNIQUE (studio_id, invoice_number)
);

-- 6. Studio Invoice Payments (Flow B - Client payments to Studio)
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay', 'upi', 'bank_transfer', 'cash', 'card', 'cheque')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
    notes TEXT,
    receipt_number TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Payment Receipts
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.invoice_payments(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL UNIQUE,
    amount_paid_paise BIGINT NOT NULL,
    remaining_balance_paise BIGINT NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method TEXT NOT NULL,
    studio_details_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    client_details_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Financial Audit Logs
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('quotation', 'invoice', 'payment', 'receipt', 'profile')),
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    actor_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast multi-tenant performance
CREATE INDEX IF NOT EXISTS idx_studio_business_profiles_studio_id ON public.studio_business_profiles(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_services_studio_id ON public.studio_services(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_service_packages_studio_id ON public.studio_service_packages(studio_id);
CREATE INDEX IF NOT EXISTS idx_quotations_studio_id ON public.quotations(studio_id);
CREATE INDEX IF NOT EXISTS idx_quotations_secure_token ON public.quotations(secure_token);
CREATE INDEX IF NOT EXISTS idx_invoices_studio_id ON public.invoices(studio_id);
CREATE INDEX IF NOT EXISTS idx_invoices_secure_token ON public.invoices(secure_token);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_studio_id ON public.invoice_payments(studio_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_invoice_id ON public.payment_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_studio_id ON public.financial_audit_logs(studio_id);
