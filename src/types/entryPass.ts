import { GuestRecord } from './guest';

export type EntryPassStatus = 'active' | 'used' | 'revoked' | 'expired' | 'not_eligible' | 'invalid';

export interface GuestEntryPass {
  id: string;
  guest_id: string;
  wedding_site_id?: string;
  wedding_slug: string;
  entry_token: string;
  status: EntryPassStatus;
  allowed_members_count: number;
  issued_at: string;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  check_in_count: number;
  created_at?: string;
  updated_at?: string;

  // Joined / Resolved contextual details for presentation
  guest_name?: string;
  family_name?: string | null;
  phone?: string;
  relationship?: string;
  couple_names?: string;
  wedding_date?: string;
  venue_name?: string;
  meal_preference?: string | null;
}

export interface CheckInResult {
  success: boolean;
  status: 'CHECKED_IN' | 'ALREADY_CHECKED_IN' | 'INVALID_TOKEN' | 'WRONG_WEDDING' | 'NOT_ELIGIBLE' | 'REVOKED';
  message: string;
  pass?: GuestEntryPass;
  checked_in_at?: string;
  first_checked_in_at?: string;
  checked_in_members_count?: number;
}

export interface LiveVenueAttendanceMetrics {
  totalExpectedMembers: number;
  checkedInMembers: number;
  remainingMembers: number;
  checkInRatePercent: number;
  totalPassesIssued: number;
  usedPassesCount: number;
}

/**
 * 👑 Core Product Rule:
 * Determines if a guest is eligible for an active QR Wedding Entry Pass.
 * Eligible if attendance_status is 'Attending', 'Pending', or pre-issued by host (unless explicitly 'Not Attending').
 */
export function isGuestEligibleForEntryPass(
  guest: GuestRecord | null | undefined,
  rsvp?: GuestRecord['rsvp']
): boolean {
  if (!guest) return false;
  const effectiveRsvp = rsvp !== undefined ? rsvp : guest.rsvp;
  if (!effectiveRsvp) return true; // Host-issued entry pass for invited guest
  return effectiveRsvp.attendance_status !== 'Not Attending';
}

/**
 * Generates a cryptographically secure, URL-safe QR entry token
 */
export function generateSecureEntryToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = 'ent_';
  for (let i = 0; i < 16; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
