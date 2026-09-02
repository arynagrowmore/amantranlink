-- =========================================================================
-- 📊 AMANTRANLINK PRODUCTION OBSERVABILITY & DISASTER RECOVERY (PHASE 17)
-- =========================================================================

-- 1. System Health Checks Table
CREATE TABLE IF NOT EXISTS public.system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'unknown', 'not_configured')),
    response_time_ms INTEGER,
    message TEXT,
    metadata JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Application Errors Table
CREATE TABLE IF NOT EXISTS public.application_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('backend', 'frontend', 'webhook', 'worker')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    error_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    route TEXT,
    request_id TEXT,
    user_id UUID,
    studio_id UUID,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
    wedding_slug TEXT,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    occurrence_count INTEGER NOT NULL DEFAULT 1,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- 3. Integration Health Table
CREATE TABLE IF NOT EXISTS public.integration_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_name TEXT UNIQUE NOT NULL,
    provider TEXT,
    status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy', 'degraded', 'down', 'unknown', 'not_configured')),
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    last_error TEXT,
    failure_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Integration Health Records
INSERT INTO public.integration_health (integration_name, provider, status)
VALUES
('database_supabase', 'Supabase PostgreSQL', 'healthy'),
('payments_razorpay', 'Razorpay India', 'healthy'),
('whatsapp_campaigns', 'Meta WhatsApp Cloud', 'not_configured'),
('email_notifications', 'Resend / SendGrid', 'not_configured'),
('custom_domains', 'Cloudflare DNS', 'healthy'),
('automation_engine', 'AmantranLink Worker', 'healthy')
ON CONFLICT (integration_name) DO NOTHING;

-- 4. System Incidents Table
CREATE TABLE IF NOT EXISTS public.system_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    affected_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_by UUID,
    resolved_by UUID,
    metadata JSONB
);

-- 5. Backup Verifications Table
CREATE TABLE IF NOT EXISTS public.backup_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type TEXT NOT NULL,
    provider TEXT NOT NULL,
    backup_reference TEXT,
    status TEXT NOT NULL DEFAULT 'not_configured' CHECK (status IN ('backup_configured', 'backup_detected', 'backup_verified', 'restore_tested', 'not_configured', 'failed')),
    verified_at TIMESTAMPTZ,
    last_backup_at TIMESTAMPTZ,
    restore_tested_at TIMESTAMPTZ,
    restore_test_status TEXT CHECK (restore_test_status IN ('passed', 'failed', NULL)),
    failure_reason TEXT,
    metadata JSONB
);

-- Seed Initial Backup Verification
INSERT INTO public.backup_verifications (backup_type, provider, status, metadata)
VALUES
('supabase_automated', 'Supabase Managed WalG & PITR', 'backup_configured', '{"rto_hours": 4, "rpo_hours": 24}'::jsonb)
ON CONFLICT DO NOTHING;

-- 6. Deployment Events Table
CREATE TABLE IF NOT EXISTS public.deployment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment TEXT NOT NULL DEFAULT 'production',
    version TEXT,
    commit_hash TEXT,
    deployment_provider TEXT,
    status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('deploying', 'healthy', 'degraded', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_events ENABLE ROW LEVEL SECURITY;

-- 8. Indexes for Fast Observability Queries
CREATE INDEX IF NOT EXISTS idx_system_health_service ON public.system_health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_application_errors_severity ON public.application_errors(severity);
CREATE INDEX IF NOT EXISTS idx_application_errors_status ON public.application_errors(status);
CREATE INDEX IF NOT EXISTS idx_application_errors_first_seen ON public.application_errors(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_system_incidents_status ON public.system_incidents(status);
CREATE INDEX IF NOT EXISTS idx_deployment_events_env ON public.deployment_events(environment);

-- 9. Admin-Only RLS Policies
CREATE POLICY "Admin full access to health checks"
    ON public.system_health_checks
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin full access to application errors"
    ON public.application_errors
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin full access to integration health"
    ON public.integration_health
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin full access to system incidents"
    ON public.system_incidents
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin full access to backup verifications"
    ON public.backup_verifications
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admin full access to deployment events"
    ON public.deployment_events
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');
