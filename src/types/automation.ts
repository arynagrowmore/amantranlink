// =========================================================================
// 🔔 AMANTRANLINK AUTOMATION & NOTIFICATION ENGINE TYPES (PHASE 11)
// =========================================================================

export type NotificationType = 
  | 'rsvp' 
  | 'payment' 
  | 'approval' 
  | 'export' 
  | 'subscription' 
  | 'system' 
  | 'security';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export type AutomationTriggerType = 
  | 'rsvp_pending' 
  | 'invoice_due_soon' 
  | 'invoice_overdue' 
  | 'payment_received' 
  | 'client_approval_pending' 
  | 'export_completed' 
  | 'export_failed' 
  | 'subscription_expiring_soon' 
  | 'subscription_expired' 
  | 'wedding_countdown';

export type AutomationDeliveryChannel = 'in_app' | 'manual_whatsapp' | 'automated_whatsapp' | 'email';

export type AutomationExecutionStatus = 'queued' | 'executed' | 'skipped' | 'failed';

// =========================================================================
// 1. IN-APP NOTIFICATIONS
// =========================================================================

export interface InAppNotification {
  id: string;
  recipient_id: string; // user UUID or studio UUID
  recipient_role: 'end_customer' | 'partner' | 'admin';
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

// =========================================================================
// 2. AUTOMATION RULES & WORKFLOWS
// =========================================================================

export interface AutomationRule {
  id: string;
  scope: 'platform' | 'studio' | 'wedding';
  owner_id?: string | null;
  wedding_site_id?: string | null;
  name: string;
  description: string;
  trigger_type: AutomationTriggerType;
  conditions: {
    days_before?: number;
    days_after?: number;
    hours_inactive?: number;
    max_reminders?: number;
    require_balance_positive?: boolean;
    stop_on_statuses?: string[];
  };
  actions: Array<{
    channel: AutomationDeliveryChannel;
    template_title: string;
    template_message: string;
    action_url?: string;
  }>;
  is_enabled: boolean;
  cooldown_hours: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// =========================================================================
// 3. EXECUTION AUDIT LOGS
// =========================================================================

export interface AutomationExecutionLog {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_type: AutomationTriggerType;
  target_id: string; // guest_id, invoice_id, review_link_id, etc.
  target_name?: string | null;
  status: AutomationExecutionStatus;
  delivery_channel: AutomationDeliveryChannel;
  idempotency_key: string;
  details?: string | null;
  executed_at: string;
}

// =========================================================================
// 4. USER NOTIFICATION PREFERENCES
// =========================================================================

export interface UserNotificationPreferences {
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  whatsapp_mode: 'manual_queue' | 'disabled';
  rsvp_alerts: boolean;
  payment_alerts: boolean;
  approval_alerts: boolean;
  export_alerts: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // "22:00"
  quiet_hours_end?: string;   // "08:00"
}

// =========================================================================
// 5. MANUAL WHATSAPP REMINDER QUEUE
// =========================================================================

export interface WhatsAppReminderQueueItem {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  message_text: string;
  wa_link: string;
  reminder_type: 'rsvp' | 'invoice' | 'approval' | 'invitation';
  created_at: string;
  status: 'ready' | 'copied' | 'opened';
}
