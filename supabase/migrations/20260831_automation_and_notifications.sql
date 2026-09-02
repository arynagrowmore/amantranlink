-- =========================================================================
-- 🔔 AMANTRANLINK AUTOMATION & NOTIFICATION ENGINE SCHEMA (PHASE 11)
-- =========================================================================

-- 1. In-App Notifications
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    recipient_role TEXT NOT NULL DEFAULT 'end_customer' CHECK (recipient_role IN ('end_customer', 'partner', 'admin')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('rsvp', 'payment', 'approval', 'export', 'subscription', 'system', 'security')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 2. Automation Rules
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL DEFAULT 'platform' CHECK (scope IN ('platform', 'studio', 'wedding')),
    owner_id UUID,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
      'rsvp_pending', 'invoice_due_soon', 'invoice_overdue', 'payment_received',
      'client_approval_pending', 'export_completed', 'export_failed',
      'subscription_expiring_soon', 'subscription_expired', 'wedding_countdown'
    )),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    cooldown_hours INT NOT NULL DEFAULT 72,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Automation Execution Logs & Idempotency Store
CREATE TABLE IF NOT EXISTS public.automation_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_name TEXT,
    status TEXT NOT NULL DEFAULT 'executed' CHECK (status IN ('queued', 'executed', 'skipped', 'failed')),
    delivery_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'manual_whatsapp', 'automated_whatsapp', 'email')),
    idempotency_key TEXT NOT NULL UNIQUE,
    details TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Notification Preferences
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_mode TEXT NOT NULL DEFAULT 'manual_queue' CHECK (whatsapp_mode IN ('manual_queue', 'disabled')),
    rsvp_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    payment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    approval_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    export_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '08:00',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Essential System Automation Rules
INSERT INTO public.automation_rules (id, scope, name, description, trigger_type, conditions, actions, is_enabled, cooldown_hours)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'platform',
    'Pending RSVP Follow-up (7-Day Cooldown)',
    'Notifies couple of guests who have not responded to wedding invitation',
    'rsvp_pending',
    '{"days_after": 3, "max_reminders": 2, "stop_on_statuses": ["attending", "declined"]}'::jsonb,
    '[{"channel": "in_app", "template_title": "RSVP Follow-up Ready", "template_message": "Follow up with pending guests before the headcount deadline.", "action_url": "/dashboard"}]'::jsonb,
    TRUE,
    72
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'platform',
    'Studio Invoice Due Soon (3-Day Alert)',
    'Notifies studio partner when a client invoice balance is due within 3 days',
    'invoice_due_soon',
    '{"days_before": 3, "require_balance_positive": true, "stop_on_statuses": ["paid", "cancelled"]}'::jsonb,
    '[{"channel": "in_app", "template_title": "Invoice Due in 3 Days", "template_message": "Client invoice balance is approaching its payment due date.", "action_url": "/?view=partner"}]'::jsonb,
    TRUE,
    48
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'platform',
    'Client Approval Reminder (48h Inactivity)',
    'Alerts studio partner when design review link remains pending response',
    'client_approval_pending',
    '{"hours_inactive": 48, "stop_on_statuses": ["approved", "rejected"]}'::jsonb,
    '[{"channel": "in_app", "template_title": "Client Review Pending", "template_message": "Design review link has been pending for over 48 hours.", "action_url": "/?view=partner"}]'::jsonb,
    TRUE,
    48
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'platform',
    'High-Res Export Ready Alert',
    'Delivers instant in-app notification when 300 DPI PDF or Video render finishes',
    'export_completed',
    '{}'::jsonb,
    '[{"channel": "in_app", "template_title": "Royal Export Ready", "template_message": "Your high-resolution invitation asset is ready for download.", "action_url": "/dashboard"}]'::jsonb,
    TRUE,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_recipient ON public.in_app_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created ON public.in_app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON public.automation_rules(trigger_type, is_enabled);
CREATE INDEX IF NOT EXISTS idx_automation_execution_idempotency ON public.automation_execution_logs(idempotency_key);
