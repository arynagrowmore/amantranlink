-- =========================================================================
-- ✉️ AMANTRANLINK EMAIL NOTIFICATION & TEMPLATE ENGINE (PHASE 15)
-- =========================================================================

-- 1. Create Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    category TEXT NOT NULL DEFAULT 'invitation' CHECK (category IN ('invitation', 'rsvp', 'finance', 'system', 'custom')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed System Email Templates
INSERT INTO public.email_templates (template_key, name, description, subject_template, html_template, category, is_system_template)
VALUES
(
  'wedding_invitation',
  'Royal Wedding Invitation',
  'Official personalized wedding invitation email with deep link',
  'Royal Wedding Invitation: {couple_names}',
  '<div style="font-family: serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #E8DFD1; background: #FFFDF8;">
    <h1 style="color: #540D1E; text-align: center;">Shahi Vivah Nimantran</h1>
    <p>Dear <strong>{guest_name}</strong> &amp; Family,</p>
    <p>With immense joy, we invite you to celebrate the wedding of <strong>{couple_names}</strong>.</p>
    <p><strong>📅 Date:</strong> {wedding_date}<br/><strong>📍 Venue:</strong> {venue_name}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{invitation_link}" style="background: #540D1E; color: #FFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Royal Invitation &rarr;</a>
    </div>
  </div>',
  'invitation',
  TRUE
),
(
  'rsvp_confirmation_guest',
  'RSVP Confirmation (Guest)',
  'Confirmation email sent to guest upon RSVP submission',
  'RSVP Confirmed — {couple_names} Wedding',
  '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #E8DFD1; background: #FFF;">
    <h2 style="color: #0F766E;">Your RSVP Has Been Received</h2>
    <p>Dear {guest_name},</p>
    <p>Thank you for submitting your RSVP for the wedding of <strong>{couple_names}</strong>.</p>
    <ul>
      <li><strong>Status:</strong> {rsvp_status}</li>
      <li><strong>Attending Guests:</strong> {attending_members}</li>
      <li><strong>Meal Preference:</strong> {meal_preference}</li>
    </ul>
    <p>We look forward to celebrating together!</p>
  </div>',
  'rsvp',
  TRUE
),
(
  'rsvp_notification_couple',
  'New RSVP Alert (Couple)',
  'Instant alert to the couple when a guest responds to RSVP',
  'New RSVP: {guest_name} ({rsvp_status})',
  '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #E8DFD1; background: #FFF;">
    <h2 style="color: #540D1E;">New RSVP Response Received</h2>
    <p><strong>Guest:</strong> {guest_name} ({family_name})</p>
    <p><strong>Response:</strong> {rsvp_status}</p>
    <p><strong>Headcount:</strong> {attending_members} guests</p>
    <p><strong>Meal Preference:</strong> {meal_preference}</p>
  </div>',
  'rsvp',
  TRUE
),
(
  'invoice_generated',
  'Client GST Invoice',
  'Official invoice sent to studio client with payment link',
  'Invoice {invoice_number} from {studio_name}',
  '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #E8DFD1; background: #FFF;">
    <h2 style="color: #11161B;">Invoice Generated — {invoice_number}</h2>
    <p>Dear Client,</p>
    <p>Your wedding design invoice from <strong>{studio_name}</strong> is ready.</p>
    <p><strong>Amount Due:</strong> {payment_amount}</p>
    <div style="margin: 25px 0;">
      <a href="{invitation_link}" style="background: #0F766E; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Pay Invoice Securely &rarr;</a>
    </div>
  </div>',
  'finance',
  TRUE
)
ON CONFLICT (template_key) DO NOTHING;

-- 2. Create Email Campaigns Table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT,
    studio_id UUID,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    total_recipients INTEGER NOT NULL DEFAULT 0,
    queued_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Email Messages Table
CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    recipient_user_id UUID,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_key TEXT,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    provider TEXT NOT NULL DEFAULT 'unconfigured',
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'opened', 'failed', 'cancelled')),
    error_code TEXT,
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Email Webhook Events Table
CREATE TABLE IF NOT EXISTS public.email_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_event_id TEXT,
    provider_message_id TEXT,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_webhook_events ENABLE ROW LEVEL SECURITY;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON public.email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user ON public.email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_wedding ON public.email_campaigns(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_campaign ON public.email_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_guest ON public.email_messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_provider_id ON public.email_messages(provider_message_id);

-- 7. RLS Policies
CREATE POLICY "Authenticated users view active templates"
    ON public.email_templates
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE OR created_by = auth.uid() OR auth.jwt()->>'email' = 'admin@amantranlink.com');

CREATE POLICY "Users manage own email campaigns"
    ON public.email_campaigns
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id OR auth.jwt()->>'email' = 'admin@amantranlink.com')
    WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'email' = 'admin@amantranlink.com');

CREATE POLICY "Users manage own email messages"
    ON public.email_messages
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.email_campaigns c
        WHERE c.id = email_messages.campaign_id
        AND c.user_id = auth.uid()
    ) OR recipient_user_id = auth.uid() OR auth.jwt()->>'email' = 'admin@amantranlink.com');

CREATE POLICY "Server & Admin manage email webhook events"
    ON public.email_webhook_events
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'email' = 'admin@amantranlink.com');
