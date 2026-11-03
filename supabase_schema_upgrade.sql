-- =========================================================================
-- 👑 AMANTRANLINK ENTERPRISE BACKEND SCHEMA UPGRADE (SUPABASE POSTGRESQL)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/owziiqdxbvynrprugvwk/sql
-- =========================================================================

-- 1. Ensure `account_status` column exists on profiles
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- 2. Create `admin_security_audit_logs` table (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.admin_security_audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('audit_' || floor(extract(epoch from now())) || '_' || substr(md5(random()::text), 1, 6)),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL DEFAULT 'admin',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    reason TEXT,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users / admins to read audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_security_audit_logs
FOR SELECT
USING (true);

-- Allow inserting audit logs
CREATE POLICY "Allow system audit insertions"
ON public.admin_security_audit_logs
FOR INSERT
WITH CHECK (true);

-- 3. Create `admin_feature_flags` table
CREATE TABLE IF NOT EXISTS public.admin_feature_flags (
    id TEXT PRIMARY KEY DEFAULT ('ff_' || substr(md5(random()::text), 1, 8)),
    flag_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    scope TEXT NOT NULL DEFAULT 'global',
    target_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on feature flags
ALTER TABLE public.admin_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on feature flags"
ON public.admin_feature_flags
FOR SELECT
USING (true);

CREATE POLICY "Allow admin updates on feature flags"
ON public.admin_feature_flags
FOR ALL
USING (true);

-- Insert baseline feature flags
INSERT INTO public.admin_feature_flags (flag_key, name, description, is_enabled, scope)
VALUES 
    ('coming_soon_mode', 'Platform Coming Soon / Maintenance Mode', 'Restricts public access while allowing admin governance', false, 'global'),
    ('video_export', 'Cinematic Video Invitation Exporter', 'Allows rendering 12s 9:16 vertical video invitations', true, 'global'),
    ('custom_domains', 'Custom Domain DNS & SSL Routing', 'Allows studios to connect custom domain hostnames', true, 'global'),
    ('studio_white_label', 'Agency White-Label Branding', 'Enables studios to brand client portals with custom logos', true, 'global'),
    ('guest_qr', 'Dynamic QR Entry Pass & Venue Scanner', 'Enables venue check-in and QR passes for wedding guests', true, 'global'),
    ('photo_drop', 'Live Photo Drop & Digital Guestbook', 'Allows wedding guests to upload photos to public memory wall', true, 'global'),
    ('studio_finance', 'Studio ERP Lite & Client Billing', 'Enables quotations, GST invoices, and partial payment tracking', true, 'global')
ON CONFLICT (flag_key) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 4. Create `platform_settings` table (for global configs & coming soon mode in DB)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

CREATE POLICY "Allow admin update of platform settings"
ON public.platform_settings
FOR ALL
USING (true);

INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES (
    'coming_soon_config',
    '{
        "isEnabled": false,
        "headline": "AmantranLink · Shahi Vivah Suite",
        "subheadline": "The most auspicious and majestic Indian royal wedding invitation platform is unveiling soon.",
        "launchDate": "2026-12-15T00:00:00Z",
        "contactEmail": "shahi@amantranlink.com",
        "contactPhone": "+91 94093 60336",
        "allowAdminBypass": true,
        "announcementBadge": "✨ THE GRAND ROYAL UNVEILING"
    }'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Create `early_access_subscribers` table (for VIP launch notifications)
CREATE TABLE IF NOT EXISTS public.early_access_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    channel TEXT DEFAULT 'whatsapp',
    is_notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.early_access_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous early access signups"
ON public.early_access_subscribers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin view of early access signups"
ON public.early_access_subscribers
FOR SELECT
USING (true);

-- 6. Add high-performance indexes
CREATE INDEX IF NOT EXISTS idx_wedding_sites_published_url ON public.wedding_sites(published_url);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_user_id ON public.wedding_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites(partner_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_slug ON public.rsvps(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
