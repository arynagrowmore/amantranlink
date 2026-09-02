-- =========================================================================
-- ✉️ AMANTRANLINK PROMPT 19: EMAIL PROVIDER ABSTRACTION & DELIVERY EVENT SCHEMA
-- =========================================================================

-- 1. Create Email Events Table (Idempotent Webhook & Audit Event Store)
CREATE TABLE IF NOT EXISTS public.email_events (
    id TEXT PRIMARY KEY,
    email_message_id TEXT REFERENCES public.email_messages(id) ON DELETE SET NULL,
    campaign_id TEXT REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'resend', 'gmail_smtp', etc.
    provider_event_id TEXT,
    provider_message_id TEXT,
    event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'bounced', 'complained', 'failed'
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_event_reference JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on provider + provider_event_id for idempotent webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_provider_event 
    ON public.email_events (provider, provider_event_id) 
    WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_events_message ON public.email_events(email_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON public.email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON public.email_events(event_timestamp);

-- 2. Create Email Suppressions Table (Hard Bounces, Spam Complaints, Opt-Outs)
CREATE TABLE IF NOT EXISTS public.email_suppressions (
    id TEXT PRIMARY KEY,
    email_normalized TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL, -- 'hard_bounce', 'complaint', 'manual', 'unsubscribe'
    source TEXT NOT NULL, -- 'resend_webhook', 'smtp_error', 'admin_action'
    provider TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON public.email_suppressions(email_normalized);
CREATE INDEX IF NOT EXISTS idx_email_suppressions_reason ON public.email_suppressions(reason);

-- 3. Enhance Email Messages Table with Provider & Delivery Tracking Columns
ALTER TABLE public.email_messages 
    ADD COLUMN IF NOT EXISTS tracking_token TEXT,
    ADD COLUMN IF NOT EXISTS delivery_status TEXT,
    ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS complained_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS smtp_response TEXT;

CREATE INDEX IF NOT EXISTS idx_email_messages_tracking_token ON public.email_messages(tracking_token);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users view own campaign events"
    ON public.email_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.email_campaigns c
            WHERE c.id = email_events.campaign_id
            AND (c.user_id = auth.uid() OR auth.jwt()->>'email' = 'admin@amantranlink.com')
        )
    );

CREATE POLICY "Admins manage suppressions"
    ON public.email_suppressions
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@amantranlink.com' OR auth.jwt()->>'role' = 'service_role');
