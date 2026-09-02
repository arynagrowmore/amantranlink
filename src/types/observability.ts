export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown' | 'not_configured';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export type BackupVerificationStatus = 
  | 'backup_configured'
  | 'backup_detected'
  | 'backup_verified'
  | 'restore_tested'
  | 'not_configured'
  | 'failed';

export interface SystemHealthCheck {
  id: string;
  service_name: string;
  service_type: 'backend_api' | 'database' | 'supabase' | 'razorpay' | 'whatsapp_provider' | 'email_provider' | 'domain_provider' | 'file_storage' | 'automation_engine';
  status: HealthStatus;
  response_time_ms?: number | null;
  message?: string | null;
  metadata?: Record<string, any> | null;
  checked_at: string;
}

export interface ApplicationErrorRecord {
  id: string;
  source: 'backend' | 'frontend' | 'webhook' | 'worker';
  severity: ErrorSeverity;
  error_name: string;
  error_message: string;
  stack_trace?: string | null;
  route?: string | null;
  request_id?: string | null;
  user_id?: string | null;
  studio_id?: string | null;
  wedding_site_id?: string | null;
  wedding_slug?: string | null;
  metadata?: Record<string, any> | null;
  status: 'open' | 'resolved' | 'ignored';
  first_seen_at: string;
  last_seen_at: string;
  occurrence_count: number;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface IntegrationHealth {
  id: string;
  integration_name: string;
  provider?: string | null;
  status: HealthStatus;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  last_error?: string | null;
  failure_count: number;
  metadata?: Record<string, any> | null;
  updated_at: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  description?: string | null;
  severity: ErrorSeverity;
  status: IncidentStatus;
  affected_services: string[];
  started_at: string;
  detected_at: string;
  resolved_at?: string | null;
  created_by?: string | null;
  resolved_by?: string | null;
  metadata?: Record<string, any> | null;
}

export interface BackupVerification {
  id: string;
  backup_type: 'supabase_automated' | 'pg_dump_snapshot' | 'storage_replication';
  provider: string;
  backup_reference?: string | null;
  status: BackupVerificationStatus;
  verified_at?: string | null;
  last_backup_at?: string | null;
  restore_tested_at?: string | null;
  restore_test_status?: 'passed' | 'failed' | null;
  failure_reason?: string | null;
  metadata?: Record<string, any> | null;
}

export interface DeploymentEvent {
  id: string;
  environment: 'production' | 'staging' | 'development';
  version?: string | null;
  commit_hash?: string | null;
  deployment_provider?: string | null;
  status: 'deploying' | 'healthy' | 'degraded' | 'failed';
  started_at: string;
  completed_at?: string | null;
  metadata?: Record<string, any> | null;
}

export interface DisasterRecoveryStatus {
  rtoTargetHours: number;
  rpoTargetHours: number;
  databaseRecoveryStatus: string;
  envRecoveryStatus: string;
  domainRecoveryStatus: string;
  overallReadiness: 'VERIFIED WORKING' | 'PARTIALLY VERIFIED' | 'NOT CONFIGURED' | 'NOT VERIFIED';
}
