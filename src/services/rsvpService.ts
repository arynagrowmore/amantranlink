import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdvancedRsvpSubmission, AttendanceStatus } from '../types/guest';
import { fetchGuestByToken, isValidUUID } from './guestService';

export interface RsvpRecord {
  id: string;
  wedding_site_id?: string;
  wedding_slug: string;
  guest_id?: string | null;
  guest_name: string;
  guest_phone: string;
  attendees_count: number;
  attendance_status?: AttendanceStatus;
  meal_preference?: string;
  special_note?: string;
  dietary?: string;
  wishes?: string;
  attending: boolean;
  responded_at?: string;
  created_at: string;
}

export interface RsvpSummary {
  totalRsvps: number;
  totalAttendingCount: number;
  totalRegretsCount: number;
  rsvps: RsvpRecord[];
}

// 1. Fetch RSVPs for a Wedding (By weddingSiteId or weddingSlug)
export const fetchWeddingRsvps = async (weddingSlugOrSiteId: string): Promise<RsvpSummary> => {
  try {
    if (isSupabaseConfigured && weddingSlugOrSiteId) {
      let query = supabase.from('rsvps').select('*');
      if (isValidUUID(weddingSlugOrSiteId)) {
        query = query.or(`wedding_site_id.eq.${weddingSlugOrSiteId},wedding_slug.eq.${weddingSlugOrSiteId}`);
      } else {
        query = query.or(`wedding_slug.eq.${weddingSlugOrSiteId},wedding_site_id.eq.${weddingSlugOrSiteId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        const rsvps: RsvpRecord[] = data as any;
        const totalAttending = rsvps.reduce((acc, r) => r.attending ? acc + (Number(r.attendees_count) || 1) : acc, 0);
        const totalRegrets = rsvps.filter(r => !r.attending).length;

        return {
          totalRsvps: rsvps.length,
          totalAttendingCount: totalAttending,
          totalRegretsCount: totalRegrets,
          rsvps,
        };
      }
    }
  } catch (e) {
    console.warn('Error fetching RSVPs from Supabase:', e);
  }

  // Check local storage fallback
  try {
    const key = `SHAHI_RSVPS_${weddingSlugOrSiteId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const rsvps: RsvpRecord[] = JSON.parse(raw);
      const totalAttending = rsvps.reduce((acc, r) => r.attending ? acc + (Number(r.attendees_count) || 1) : acc, 0);
      const totalRegrets = rsvps.filter(r => !r.attending).length;
      return {
        totalRsvps: rsvps.length,
        totalAttendingCount: totalAttending,
        totalRegretsCount: totalRegrets,
        rsvps,
      };
    }
  } catch (e) {}

  // Zero empty state if no DB rows
  return {
    totalRsvps: 0,
    totalAttendingCount: 0,
    totalRegretsCount: 0,
    rsvps: [],
  };
};

// 2. Submit Legacy Guest RSVP (Backward compatibility)
export const submitGuestRsvp = async (
  weddingSlug: string,
  guestName: string,
  guestPhone: string,
  attendeesCount: number,
  wishes: string,
  attending: boolean = true,
  weddingSiteId?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  return submitAdvancedGuestRsvp({
    wedding_site_id: weddingSiteId || '',
    wedding_slug: weddingSlug,
    guest_name: guestName,
    guest_phone: guestPhone,
    attendance_status: attending ? 'Attending' : 'Not Attending',
    attending_member_count: attendeesCount,
    wishes,
  });
};

// 3. Submit Advanced Guest RSVP (With de-duplication, guest token link & meal preferences)
export const submitAdvancedGuestRsvp = async (
  submission: AdvancedRsvpSubmission
): Promise<{ success: boolean; message?: string; rsvpId?: string; error?: string }> => {
  const cleanName = (submission.guest_name || '').trim();
  const cleanPhone = (submission.guest_phone || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter a valid guest name (at least 2 characters).' };
  }

  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 7) {
    return { success: false, error: 'Please enter a valid mobile number.' };
  }

  const isAttending = submission.attendance_status === 'Attending';
  const now = new Date().toISOString();

  let resolvedGuestId = submission.guest_id;
  if (!resolvedGuestId && submission.guest_token) {
    try {
      const guest = await fetchGuestByToken(submission.guest_token);
      if (guest) {
        resolvedGuestId = guest.id;
      }
    } catch (e) {}
  }

  const payload: any = {
    wedding_slug: submission.wedding_slug || 'general',
    guest_name: cleanName,
    guest_phone: cleanPhone,
    attendance_status: submission.attendance_status || (isAttending ? 'Attending' : 'Not Attending'),
    attendees_count: isAttending ? Math.max(1, Number(submission.attending_member_count) || 1) : 0,
    attending: isAttending,
    meal_preference: submission.meal_preference || 'Standard',
    special_note: (submission.special_note || '').trim(),
    wishes: (submission.wishes || '').trim(),
    responded_at: now,
    created_at: now,
  };

  if (submission.wedding_site_id && isValidUUID(submission.wedding_site_id)) {
    payload.wedding_site_id = submission.wedding_site_id;
  }
  if (resolvedGuestId && isValidUUID(resolvedGuestId)) {
    payload.guest_id = resolvedGuestId;
  }

  try {
    if (isSupabaseConfigured) {
      let rsvpId = '';

      // De-duplication check: If guest_id exists, update existing RSVP row rather than inserting duplicates
      if (resolvedGuestId && isValidUUID(resolvedGuestId)) {
        const { data: existing } = await supabase
          .from('rsvps')
          .select('id')
          .eq('guest_id', resolvedGuestId)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateErr } = await supabase
            .from('rsvps')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .single();
          if (updateErr) throw updateErr;
          rsvpId = updated?.id || existing.id;
        }
      }

      if (!rsvpId) {
        const { data, error } = await supabase.from('rsvps').insert([payload]).select().single();
        if (error) throw error;
        rsvpId = data?.id;
      }

      return { 
        success: true, 
        message: isAttending 
          ? 'Shahi Vivah blessings received! Your RSVP is confirmed.' 
          : 'Thank you for letting us know your response.',
        rsvpId,
      };
    }
    
    // Offline local persistence with de-duplication
    const key = `SHAHI_RSVPS_${submission.wedding_site_id || submission.wedding_slug || 'general'}`;
    const existing: any[] = JSON.parse(localStorage.getItem(key) || '[]');
    let updatedList: any[];

    if (resolvedGuestId) {
      const idx = existing.findIndex(r => r.guest_id === resolvedGuestId);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...payload };
        updatedList = existing;
      } else {
        updatedList = [{ id: `rsvp_${Date.now()}`, ...payload }, ...existing];
      }
    } else {
      updatedList = [{ id: `rsvp_${Date.now()}`, ...payload }, ...existing];
    }

    localStorage.setItem(key, JSON.stringify(updatedList));

    return { 
      success: true, 
      message: isAttending 
        ? 'Shahi Vivah blessings received! Your RSVP is confirmed.' 
        : 'Thank you for letting us know your response.', 
      rsvpId: `rsvp_${Date.now()}` 
    };
  } catch (err: any) {
    console.error('RSVP Submission Error:', err);
    return { success: false, error: 'Unable to submit RSVP right now. Please try again.' };
  }
};

// 4. 1-Click Export to CSV / Excel
export const exportRsvpsToCSV = (rsvps: RsvpRecord[], weddingTitle = 'Shahi_Vivah') => {
  const headers = ['Sr No', 'Guest Name', 'Phone Number', 'Status', 'Attendance Status', 'Attendees Count', 'Meal Preference', 'Special Note / Wishes', 'Submission Date'];
  const rows = rsvps.map((r, idx) => [
    idx + 1,
    `"${r.guest_name.replace(/"/g, '""')}"`,
    `"${r.guest_phone}"`,
    r.attending ? 'Attending' : 'Not Attending',
    `"${r.attendance_status || (r.attending ? 'Attending' : 'Not Attending')}"`,
    r.attending ? r.attendees_count : 0,
    `"${(r.meal_preference || 'Standard').replace(/"/g, '""')}"`,
    `"${(r.wishes || r.special_note || '').replace(/"/g, '""')}"`,
    `"${new Date(r.responded_at || r.created_at).toLocaleString('en-IN')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${weddingTitle}_RSVP_Guest_List_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
