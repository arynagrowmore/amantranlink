/**
 * 👑 SHAHI VIVAH — GUEST & RSVP TYPE DEFINITIONS
 * Authoritative types for Guest Management, Token Links, & Advanced RSVP Experience.
 */

export type GuestCategory = 'Family' | 'Friend' | 'Relative' | 'VIP' | 'Business' | 'Other';

export type GuestInvitationStatus = 'draft' | 'sent' | 'delivered' | 'viewed';

export type AttendanceStatus = 'Pending' | 'Attending' | 'Not Attending' | 'Maybe';

export type MealPreference = 'Standard' | 'Pure Jain' | 'Gujarati Traditional' | 'Continental' | 'Vegan' | 'Other';

export interface GuestRecord {
  id: string;
  wedding_site_id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  family_name?: string | null;
  relationship: GuestCategory;
  number_of_members: number;
  guest_type: GuestCategory;
  personal_invitation_token: string;
  invitation_status: GuestInvitationStatus;
  viewed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined RSVP data if available
  rsvp?: {
    id: string;
    attendance_status: AttendanceStatus;
    attending_member_count: number;
    meal_preference?: MealPreference | string;
    special_note?: string;
    wishes?: string;
    responded_at?: string;
  } | null;
}

export interface GuestSummaryMetrics {
  totalGuests: number;
  totalMembersCount: number;
  confirmedAttendingCount: number;
  confirmedAttendingMembers: number;
  pendingCount: number;
  notAttendingCount: number;
  maybeCount: number;
  viewedInvitationsCount: number;
  responseRatePercent: number;
}

export interface CreateGuestInput {
  wedding_site_id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  family_name?: string;
  relationship?: GuestCategory;
  number_of_members?: number;
}

export interface UpdateGuestInput {
  full_name?: string;
  phone?: string;
  email?: string;
  family_name?: string;
  relationship?: GuestCategory;
  number_of_members?: number;
  invitation_status?: GuestInvitationStatus;
}

export interface AdvancedRsvpSubmission {
  wedding_site_id: string;
  wedding_slug?: string;
  guest_token?: string;
  guest_id?: string;
  guest_name: string;
  guest_phone: string;
  attendance_status: AttendanceStatus;
  attending_member_count: number;
  meal_preference?: MealPreference | string;
  special_note?: string;
  wishes?: string;
}

export interface ImportGuestRow {
  rowNumber: number;
  name: string;
  phone: string;
  email?: string;
  family?: string;
  members: number;
  category: GuestCategory;
  isValid: boolean;
  errors: string[];
}
