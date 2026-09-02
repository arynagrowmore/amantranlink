-- =========================================================================
-- 📱 AMANTRANLINK WHATSAPP BUSINESS CLOUD & BULK CAMPAIGN ENGINE (PHASE 14)
-- =========================================================================

-- 1. Create WhatsApp Campaigns Table
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT,
    user_id UUID NOT NULL,
    created_by UUID,
    name TEXT NOT NULL,
    message_template TEXT NOT NULL,
    campaign_type TEXT NOT NULL DEFAULT 'invitation' CHECK (campaign_type IN ('invitation', 'reminder', 'save_the_date', 'custom')),
    sending_mode TEXT NOT NULL DEFAULT 'manual_mode_a' CHECK (sending_mode IN ('manual_mode_a', 'meta_cloud_api_mode_b')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    total_recipients INTEGER NOT NULL DEFAULT 0,
    queued_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    read_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT,
    recipient_phone TEXT NOT NULL,
    recipient_name TEXT,
    family_name TEXT,
    message_body TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN ('manual', 'meta_cloud_api')),
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
      'queued', 'processing', 'sent', 'delivered', 'read', 'failed', 'cancelled',
      'not_started', 'opened_in_whatsapp', 'manually_marked_sent'
    )),
    error_code TEXT,
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create WhatsApp Webhook Events Store
CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id TEXT,
    provider_message_id TEXT,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

-- 5. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_wa_campaigns_user ON public.whatsapp_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_wa_campaigns_wedding ON public.whatsapp_campaigns(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_wa_campaigns_status ON public.whatsapp_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_wa_messages_campaign ON public.whatsapp_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_guest ON public.whatsapp_messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_wa_messages_provider_id ON public.whatsapp_messages(provider_message_id);

CREATE INDEX IF NOT EXISTS idx_wa_webhooks_msg_id ON public.whatsapp_webhook_events(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_wa_webhooks_processed ON public.whatsapp_webhook_events(processed);

-- 6. RLS Policies for Tenant Isolation

-- Campaigns: Users can read and manage their own campaigns or assigned wedding projects
CREATE POLICY "Users manage own campaigns"
    ON public.whatsapp_campaigns
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = created_by)
    WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

-- Messages: Users can read and manage messages belonging to their campaigns
CREATE POLICY "Users manage own campaign messages"
    ON public.whatsapp_messages
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.whatsapp_campaigns c
        WHERE c.id = whatsapp_messages.campaign_id
        AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
    ));

-- Webhooks: Webhook store is server-only (restricted to service role / backend)
CREATE POLICY "Admin & Server manage webhook events"
    ON public.whatsapp_webhook_events
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'email' = 'admin@amantranlink.com');
