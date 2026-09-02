/**
 * 👑 AMANTRANLINK — STUDIO WHITE-LABEL BRANDING & CLIENT REVIEW TYPES
 */

export type ProjectWorkflowStatus = 
  | 'draft' 
  | 'ready_for_review' 
  | 'changes_requested' 
  | 'revision_in_progress' 
  | 'approved' 
  | 'published';

export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type DomainStatus = 'pending' | 'verifying' | 'verified' | 'failed' | 'disconnected';

export interface StudioBranding {
  id: string;
  studio_id: string;
  studio_name: string;
  studio_tagline?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  business_email?: string | null;
  business_phone?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  business_address?: string | null;
  white_label_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomDomain {
  id: string;
  studio_id: string;
  domain: string;
  domain_type: 'studio' | 'wedding';
  status: DomainStatus;
  ssl_status: 'pending' | 'active' | 'failed';
  cname_target: string;
  verification_token: string;
  verified_at?: string | null;
  last_checked_at?: string | null;
  created_at: string;
}

export interface ProjectReviewLink {
  id: string;
  wedding_site_id?: string | null;
  wedding_slug: string;
  studio_id: string;
  review_token: string;
  status: 'active' | 'revoked' | 'expired';
  allow_comments: boolean;
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProjectReviewComment {
  id: string;
  review_link_id: string;
  wedding_slug: string;
  section_id: string;
  section_title: string;
  author_name: string;
  author_role: 'client' | 'studio' | 'guest';
  comment: string;
  status: FeedbackStatus;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface ProjectApprovalEvent {
  id: string;
  wedding_slug: string;
  studio_id?: string | null;
  approved_by_name: string;
  approved_by_email?: string | null;
  approval_note?: string | null;
  workflow_status: ProjectWorkflowStatus;
  client_ip?: string | null;
  user_agent?: string | null;
  created_at: string;
}
