import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RsvpRecord {
  id: string;
  wedding_site_id?: string;
  wedding_slug: string;
  guest_name: string;
  guest_phone: string;
  attendees_count: number;
  wishes?: string;
  attending: boolean;
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
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(weddingSlugOrSiteId);
      
      let query = supabase.from('rsvps').select('*');
      if (isValidUUID) {
        query = query.or(`wedding_site_id.eq.${weddingSlugOrSiteId},wedding_slug.eq.${weddingSlugOrSiteId}`);
      } else {
        query = query.eq('wedding_slug', weddingSlugOrSiteId);
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

  // Zero empty state if no DB rows
  return {
    totalRsvps: 0,
    totalAttendingCount: 0,
    totalRegretsCount: 0,
    rsvps: [],
  };
};

// 2. Submit Guest RSVP (With strict validation and zero fake success)
export const submitGuestRsvp = async (
  weddingSlug: string,
  guestName: string,
  guestPhone: string,
  attendeesCount: number,
  wishes: string,
  attending: boolean = true,
  weddingSiteId?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const cleanName = (guestName || '').trim();
  const cleanPhone = (guestPhone || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter a valid guest name.' };
  }

  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 7) {
    return { success: false, error: 'Please enter a valid mobile number.' };
  }

  const isValidUUID = (str?: string) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const payload: any = {
    wedding_slug: weddingSlug || 'general',
    guest_name: cleanName,
    guest_phone: cleanPhone,
    attendees_count: attending ? Math.max(1, Number(attendeesCount) || 1) : 0,
    wishes: (wishes || '').trim(),
    attending: attending !== false,
  };

  if (weddingSiteId && isValidUUID(weddingSiteId)) {
    payload.wedding_site_id = weddingSiteId;
  }

  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('rsvps').insert(payload);
      if (error) throw error;
      return { success: true, message: 'RSVP submitted successfully!' };
    }
    throw new Error('Supabase database is not configured.');
  } catch (err: any) {
    console.error('RSVP Submission Error:', err);
    return { success: false, error: err.message || 'Unable to submit RSVP. Please try again.' };
  }
};

// 3. 1-Click Export to CSV / Excel
export const exportRsvpsToCSV = (rsvps: RsvpRecord[], weddingTitle = 'Shahi_Vivah') => {
  const headers = ['Sr No', 'Guest Name', 'Phone Number', 'Status', 'Attendees Count', 'Wishes / Message', 'Submission Date'];
  const rows = rsvps.map((r, idx) => [
    idx + 1,
    `"${r.guest_name.replace(/"/g, '""')}"`,
    `"${r.guest_phone}"`,
    r.attending ? 'Attending' : 'Not Attending',
    r.attending ? r.attendees_count : 0,
    `"${(r.wishes || '').replace(/"/g, '""')}"`,
    `"${new Date(r.created_at).toLocaleString('en-IN')}"`,
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
