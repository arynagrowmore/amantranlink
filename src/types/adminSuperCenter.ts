// =========================================================================
// 👑 AMANTRANLINK SUPER CONTROL CENTER TYPES (PHASE 10)
// =========================================================================

export type TimeRangeFilter = 'today' | '7d' | '30d' | 'month' | 'quarter' | 'year' | 'all';

export type UserAccountStatus = 'active' | 'suspended' | 'disabled' | 'pending';
export type UserRole = 'end_customer' | 'partner' | 'admin';

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

// =========================================================================
// 1. EXECUTIVE OVERVIEW METRICS
// =========================================================================

export interface PlatformOverviewMetrics {
  totalRegisteredUsers: number;
  totalCouples: number;
  totalStudioPartners: number;
  activeStudioPartners: number;
  totalWeddings: number;
  publishedWeddings: number;
  activeSubscriptions: number;
  grossPlatformRevenuePaise: number; // Flow A revenue (INR paise)
  totalPlatformTransactions: number;
  paymentSuccessRate: number; // e.g. 98.4%
  periodNewUsers: number;
  periodNewWeddings: number;
  periodNewRevenuePaise: number;
}

// =========================================================================
// 2. USER MANAGEMENT
// =========================================================================

export interface AdminUserManagementItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  account_status: UserAccountStatus;
  studio_name?: string | null;
  partner_slug?: string | null;
  weddings_count: number;
  active_subscription_plan?: string | null;
  subscription_status?: string | null;
  created_at: string;
  last_activity_at?: string | null;
}

// =========================================================================
// 3. WEDDING PROJECT MONITORING
// =========================================================================

export interface AdminWeddingProjectItem {
  id: string;
  slug: string;
  couple_names: string;
  wedding_date?: string | null;
  theme: string;
  language: string;
  status: 'draft' | 'published' | 'expired' | 'archived';
  is_locked: boolean;
  is_suspended: boolean;
  partner_id?: string | null;
  partner_name?: string | null;
  owner_email?: string | null;
  guest_count: number;
  rsvp_count: number;
  photos_count: number;
  plan_tier: string;
  created_at: string;
  updated_at: string;
}

// =========================================================================
// 4. STUDIO PARTNER GOVERNANCE
// =========================================================================

export interface AdminStudioPartnerItem {
  id: string;
  studio_name: string;
  owner_name: string;
  email: string;
  phone?: string | null;
  partner_slug: string;
  total_client_projects: number;
  active_client_projects: number;
  white_label_enabled: boolean;
  custom_domain?: string | null;
  domain_status?: string | null;
  platform_revenue_paid_paise: number; // Money Studio paid to AmantranLink
  account_status: UserAccountStatus;
  created_at: string;
}

// =========================================================================
// 5. SUBSCRIPTIONS & PLATFORM REVENUE (FLOW A)
// =========================================================================

export interface PlatformSubscriptionItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  plan_name: string;
  amount_paise: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'cancelled' | 'payment_failed';
  starts_at: string;
  expires_at: string;
  payment_method: string;
  created_at: string;
}

export interface PlatformRevenueAnalytics {
  gross_revenue_paise: number;
  successful_payments_count: number;
  failed_payments_count: number;
  refunded_amount_paise: number;
  net_revenue_paise: number;
  revenue_by_plan: Array<{
    plan: string;
    amount_paise: number;
    count: number;
  }>;
  revenue_by_customer_type: {
    couples_paise: number;
    studios_paise: number;
  };
  revenue_timeline: Array<{
    date: string;
    revenue_paise: number;
    orders_count: number;
  }>;
}

// =========================================================================
// 6. PRODUCT USAGE & FEATURE ADOPTION
// =========================================================================

export interface FeatureAdoptionMetric {
  feature_key: string;
  feature_name: string;
  unique_projects_using: number;
  total_usage_count: number;
  adoption_rate_pct: number; // Unique projects using / Total active projects
  category: 'core' | 'rsvp' | 'media' | 'export' | 'b2b';
}

export interface PlatformFunnelStep {
  step_number: number;
  stage_name: string;
  count: number;
  conversion_rate_pct: number;
  dropoff_rate_pct: number;
}

// =========================================================================
// 7. SYSTEM HEALTH, SIGNALS & FEATURE FLAGS
// =========================================================================

export interface SystemHealthIndicator {
  service_key: string;
  service_name: string;
  status: HealthStatus;
  latency_ms?: number;
  last_checked_at: string;
  details?: string;
}

export interface OperationalSignal {
  id: string;
  signal_type: 'failed_payment' | 'failed_export' | 'failed_domain' | 'high_traffic' | 'error_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  entity_id?: string | null;
  entity_type?: string | null;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
}

export interface FeatureFlagConfig {
  id: string;
  flag_key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  scope: 'global' | 'studio' | 'user';
  target_id?: string | null;
  updated_at: string;
}

export interface PlatformGlobalConfig {
  platform_name: string;
  support_email: string;
  support_phone: string;
  default_invitation_domain: string;
  maintenance_mode: boolean;
  max_guests_per_free_wedding: number;
  supported_languages: string[];
}

export interface AdminSecurityAuditRecord {
  id: string;
  actor_user_id?: string | null;
  actor_email: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  reason?: string | null;
  previous_value?: any;
  new_value?: any;
  created_at: string;
}
