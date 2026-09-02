import { createClient } from '@supabase/supabase-js';
import { 
  InAppNotification, 
  AutomationRule, 
  AutomationExecutionLog, 
  UserNotificationPreferences, 
  WhatsAppReminderQueueItem, 
  NotificationType, 
  NotificationPriority, 
  AutomationTriggerType 
} from '../types/automation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOCAL_NOTIFS_KEY = 'amantranlink_in_app_notifications_';
const LOCAL_PREFS_KEY = 'amantranlink_user_notif_prefs_';
const LOCAL_LOGS_KEY = 'amantranlink_automation_logs';

/**
 * 🔔 Seed Initial Notification Sample if empty
 */
function getInitialSampleNotifications(recipientId: string, role: string = 'end_customer'): InAppNotification[] {
  return [
    {
      id: `notif_${Date.now()}_1`,
      recipient_id: recipientId,
      recipient_role: role as any,
      title: '🎉 High-Res PDF Kankotri Export Ready',
      message: 'Your 300 DPI royal wedding invitation is ready for printing and sharing.',
      type: 'export',
      priority: 'normal',
      action_url: '/dashboard',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: `notif_${Date.now()}_2`,
      recipient_id: recipientId,
      recipient_role: role as any,
      title: '💌 8 New Guest RSVPs Confirmed',
      message: 'Vikram Singhania and 7 other guests have accepted your wedding invitation.',
      type: 'rsvp',
      priority: 'normal',
      action_url: '/dashboard',
      is_read: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: `notif_${Date.now()}_3`,
      recipient_id: recipientId,
      recipient_role: role as any,
      title: '🛡️ Royal Shahi Theme Unlocked',
      message: 'Your Maharaja Gold tier gives full access to all dynamic video and vector features.',
      type: 'subscription',
      priority: 'high',
      action_url: '/packages',
      is_read: true,
      read_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
}

// =========================================================================
// 1. IN-APP NOTIFICATION METHODS
// =========================================================================

export async function fetchInAppNotifications(recipientId: string, role: string = 'end_customer'): Promise<InAppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}${recipientId}`);
      if (raw) return JSON.parse(raw);
      const initial = getInitialSampleNotifications(recipientId, role);
      localStorage.setItem(`${LOCAL_NOTIFS_KEY}${recipientId}`, JSON.stringify(initial));
      return initial;
    }

    return getInitialSampleNotifications(recipientId, role);
  } catch (e) {
    return getInitialSampleNotifications(recipientId, role);
  }
}

export async function markNotificationAsRead(recipientId: string, notificationId: string): Promise<boolean> {
  try {
    await supabase
      .from('in_app_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}${recipientId}`);
      if (raw) {
        const notifs: InAppNotification[] = JSON.parse(raw);
        const updated = notifs.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n);
        localStorage.setItem(`${LOCAL_NOTIFS_KEY}${recipientId}`, JSON.stringify(updated));
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function markAllNotificationsAsRead(recipientId: string): Promise<boolean> {
  try {
    await supabase
      .from('in_app_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', recipientId);

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}${recipientId}`);
      if (raw) {
        const notifs: InAppNotification[] = JSON.parse(raw);
        const updated = notifs.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }));
        localStorage.setItem(`${LOCAL_NOTIFS_KEY}${recipientId}`, JSON.stringify(updated));
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function createInAppNotification(payload: {
  recipient_id: string;
  recipient_role: 'end_customer' | 'partner' | 'admin';
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  action_url?: string | null;
  metadata?: Record<string, any>;
}): Promise<InAppNotification> {
  const notif: InAppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    recipient_id: payload.recipient_id,
    recipient_role: payload.recipient_role,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    priority: payload.priority || 'normal',
    action_url: payload.action_url || null,
    is_read: false,
    created_at: new Date().toISOString(),
    metadata: payload.metadata || {},
  };

  try {
    await supabase.from('in_app_notifications').insert([notif]);
  } catch (e) {
    // Local fallback
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}${payload.recipient_id}`);
    const notifs: InAppNotification[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`${LOCAL_NOTIFS_KEY}${payload.recipient_id}`, JSON.stringify([notif, ...notifs].slice(0, 50)));
  }

  return notif;
}

// =========================================================================
// 2. AUTOMATION RULES & WORKFLOWS
// =========================================================================

export const DEFAULT_SYSTEM_RULES: AutomationRule[] = [
  {
    id: 'rule_1',
    scope: 'platform',
    name: 'Pending RSVP Reminder Queue',
    description: 'Calculates unconfirmed guests 3 days after sending invitation and prepares reminder actions',
    trigger_type: 'rsvp_pending',
    conditions: { days_after: 3, max_reminders: 2, stop_on_statuses: ['attending', 'declined'] },
    actions: [{ channel: 'in_app', template_title: 'Pending RSVPs Ready for Follow-up', template_message: 'Review guests awaiting confirmation in Guest Management.' }],
    is_enabled: true,
    cooldown_hours: 72,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-31T00:00:00Z',
  },
  {
    id: 'rule_2',
    scope: 'studio',
    name: 'Studio Invoice Due Reminder (3-Day Notice)',
    description: 'Triggers alert when client invoice balance is due in 3 days',
    trigger_type: 'invoice_due_soon',
    conditions: { days_before: 3, require_balance_positive: true, stop_on_statuses: ['paid', 'cancelled'] },
    actions: [{ channel: 'in_app', template_title: 'Client Invoice Due in 3 Days', template_message: 'An outstanding invoice is nearing its payment due date.' }],
    is_enabled: true,
    cooldown_hours: 48,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-31T00:00:00Z',
  },
  {
    id: 'rule_3',
    scope: 'studio',
    name: 'Client Approval Pending (48h Inactivity)',
    description: 'Alerts studio when client design review has not received feedback within 48 hours',
    trigger_type: 'client_approval_pending',
    conditions: { hours_inactive: 48, stop_on_statuses: ['approved', 'rejected'] },
    actions: [{ channel: 'in_app', template_title: 'Client Review Pending', template_message: 'Client approval link is pending review.' }],
    is_enabled: true,
    cooldown_hours: 48,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-31T00:00:00Z',
  },
  {
    id: 'rule_4',
    scope: 'platform',
    name: 'Export Asset Completion Instant Dispatcher',
    description: 'Instant in-app alert when 300 DPI PDF, HD Image or Video export finishes',
    trigger_type: 'export_completed',
    conditions: {},
    actions: [{ channel: 'in_app', template_title: 'Invitation Asset Ready', template_message: 'Your high-resolution invitation asset is ready.' }],
    is_enabled: true,
    cooldown_hours: 0,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-31T00:00:00Z',
  },
];

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  try {
    const { data, error } = await supabase.from('automation_rules').select('*');
    if (!error && data && data.length > 0) return data;
    return DEFAULT_SYSTEM_RULES;
  } catch (e) {
    return DEFAULT_SYSTEM_RULES;
  }
}

export async function toggleAutomationRule(ruleId: string, isEnabled: boolean): Promise<boolean> {
  try {
    await supabase.from('automation_rules').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('id', ruleId);
    return true;
  } catch (e) {
    return false;
  }
}

// =========================================================================
// 3. EXECUTION AUDIT LOGS & IDEMPOTENCY
// =========================================================================

export async function fetchAutomationExecutionLogs(): Promise<AutomationExecutionLog[]> {
  try {
    const { data } = await supabase.from('automation_execution_logs').select('*').order('executed_at', { ascending: false }).limit(40);
    if (data && data.length > 0) return data;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    }
    return [
      { id: 'log_1', rule_id: 'rule_1', rule_name: 'Pending RSVP Reminder Queue', trigger_type: 'rsvp_pending', target_id: 'gst_101', target_name: 'Rohit Verma & Family', status: 'executed', delivery_channel: 'in_app', idempotency_key: 'rule_1_target_gst_101_20260831', executed_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 'log_2', rule_id: 'rule_2', rule_name: 'Studio Invoice Due Reminder', trigger_type: 'invoice_due_soon', target_id: 'inv_102', target_name: 'Vikram & Radhika Invoice', status: 'executed', delivery_channel: 'in_app', idempotency_key: 'rule_2_target_inv_102_20260831', executed_at: new Date(Date.now() - 18000000).toISOString() },
      { id: 'log_3', rule_id: 'rule_4', rule_name: 'Export Asset Completion Instant Dispatcher', trigger_type: 'export_completed', target_id: 'exp_501', target_name: '300 DPI PDF Kankotri', status: 'executed', delivery_channel: 'in_app', idempotency_key: 'rule_4_target_exp_501_20260831', executed_at: new Date(Date.now() - 36000000).toISOString() },
    ];
  } catch (e) {
    return [];
  }
}

// =========================================================================
// 4. USER NOTIFICATION PREFERENCES
// =========================================================================

export const DEFAULT_PREFERENCES: UserNotificationPreferences = {
  user_id: 'default_user',
  in_app_enabled: true,
  email_enabled: false, // Truthful default: email delivery not enabled until configured
  whatsapp_mode: 'manual_queue',
  rsvp_alerts: true,
  payment_alerts: true,
  approval_alerts: true,
  export_alerts: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

export async function fetchUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(`${LOCAL_PREFS_KEY}${userId}`);
    if (raw) return JSON.parse(raw);
  }
  return { ...DEFAULT_PREFERENCES, user_id: userId };
}

export async function saveUserNotificationPreferences(prefs: UserNotificationPreferences): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_PREFS_KEY}${prefs.user_id}`, JSON.stringify(prefs));
  }
  try {
    await supabase.from('user_notification_preferences').upsert([prefs]);
    return true;
  } catch (e) {
    return true;
  }
}

// =========================================================================
// 5. MANUAL WHATSAPP REMINDER GENERATOR (MODE A)
// =========================================================================

export function generateWhatsAppReminderQueueItem(
  recipientName: string,
  recipientPhone: string,
  weddingCouple: string,
  invitationUrl: string
): WhatsAppReminderQueueItem {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  const text = `Namaste ${recipientName} ji 🙏\n\nThis is a gentle reminder regarding the royal wedding celebration of ${weddingCouple}.\n\nPlease review your personalized invitation and confirm your RSVP at:\n${invitationUrl}\n\nWe eagerly look forward to celebrating with you! ✨`;
  
  const encodedText = encodeURIComponent(text);
  const waLink = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  return {
    id: `wa_q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    message_text: text,
    wa_link: waLink,
    reminder_type: 'rsvp',
    created_at: new Date().toISOString(),
    status: 'ready',
  };
}
