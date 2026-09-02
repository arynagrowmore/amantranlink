-- =========================================================================
-- 👑 AMANTRANLINK SUPER CONTROL CENTER DATABASE ARCHITECTURE (PHASE 10)
-- Multi-Tenant Governance, Platform Feature Flags, Health & Audit Logs
-- =========================================================================

-- 1. Admin Feature Flags
CREATE TABLE IF NOT EXISTS public.admin_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'studio', 'user', 'wedding')),
    target_id TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Essential Platform Feature Flags
INSERT INTO public.admin_feature_flags (flag_key, name, description, is_enabled, scope)
VALUES 
  ('video_export', 'Cinematic Video Invitation Exporter', 'Allows users and studios to render 12s 9:16 vertical video invitations', TRUE, 'global'),
  ('custom_domains', 'Custom Domain DNS & SSL Routing', 'Allows studios to connect custom domain hostnames', TRUE, 'global'),
  ('studio_white_label', 'Agency White-Label Branding', 'Enables studios to brand client portals with custom logos & colors', TRUE, 'global'),
  ('guest_qr', 'Dynamic QR Entry Pass & Venue Scanner', 'Enables venue check-in and QR passes for wedding guests', TRUE, 'global'),
  ('photo_drop', 'Live Photo Drop & Digital Guestbook', 'Allows wedding guests to upload photos to public memory wall', TRUE, 'global'),
  ('studio_finance', 'Studio ERP Lite & Client Billing', 'Enables quotations, GST invoices, and partial payment tracking', TRUE, 'global'),
  ('maintenance_mode', 'Platform Maintenance Mode', 'Temporarily restricts normal public modifications while allowing admin access', FALSE, 'global')
ON CONFLICT (flag_key) DO NOTHING;

-- 2. Platform Global Settings
CREATE TABLE IF NOT EXISTS public.admin_platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.admin_platform_settings (setting_key, setting_value, is_secret, description)
VALUES 
  ('global_config', '{
    "platform_name": "AmantranLink (Shahi Vivah SaaS)",
    "support_email": "support@amantranlink.com",
    "support_phone": "+91 98765 43210",
    "default_invitation_domain": "amantranlink.com",
    "maintenance_mode": false,
    "max_guests_per_free_wedding": 100,
    "supported_languages": ["en", "hi", "gu"]
  }'::jsonb, FALSE, 'Global platform governance coordinates')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. Operational Signals & Alert System
CREATE TABLE IF NOT EXISTS public.admin_operational_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_type TEXT NOT NULL CHECK (signal_type IN ('failed_payment', 'failed_export', 'failed_domain', 'high_traffic', 'error_spike')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id TEXT,
    entity_type TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 4. Centralized Admin Security Audit Logs (Append-Only)
CREATE TABLE IF NOT EXISTS public.admin_security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL DEFAULT 'admin',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    reason TEXT,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast multi-tenant governance
CREATE INDEX IF NOT EXISTS idx_admin_feature_flags_key ON public.admin_feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_admin_platform_settings_key ON public.admin_platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_operational_signals_status ON public.admin_operational_signals(status);
CREATE INDEX IF NOT EXISTS idx_admin_security_audit_logs_action ON public.admin_security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_security_audit_logs_created ON public.admin_security_audit_logs(created_at DESC);
