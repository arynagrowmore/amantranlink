/**
 * 👑 AMANTRANLINK — WEDDING MEMORIES & LIVE DIGITAL GUESTBOOK TYPES
 */

export type MemoryStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type MemoryMediaType = 'photo' | 'text';

export interface WeddingMemory {
  id: string;
  wedding_site_id?: string | null;
  wedding_slug: string;
  guest_id?: string | null;
  guest_name: string;
  family_name?: string | null;
  message?: string | null;
  media_url?: string | null;
  media_type: MemoryMediaType;
  status: MemoryStatus;
  is_featured: boolean;
  submitted_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MemorySettings {
  autoApprovePhotos: boolean;
  autoApproveWishes: boolean;
  allowPublicUploads: boolean;
  maxPhotoSizeMb: number;
}

export interface MemorySummaryMetrics {
  totalSubmissions: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalPhotosCount: number;
  totalWishesCount: number;
  featuredCount: number;
}

export interface SubmitMemoryInput {
  wedding_slug: string;
  wedding_site_id?: string | null;
  guest_id?: string | null;
  guest_name: string;
  family_name?: string | null;
  message?: string | null;
  media_file?: File | null;
  media_data_url?: string | null;
}
