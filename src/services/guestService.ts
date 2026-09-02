/**
 * 👑 SHAHI VIVAH — GUEST MANAGEMENT & INVITATION TOKEN SERVICE
 * Unified service managing guests, secure personalized links, CSV import/export, and WhatsApp dispatch.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  GuestRecord, 
  GuestSummaryMetrics, 
  CreateGuestInput, 
  UpdateGuestInput, 
  ImportGuestRow, 
  GuestCategory,
  AttendanceStatus
} from '../types/guest';

// 🔑 1. Generate Secure Random Token
export const generateSecureGuestToken = (): string => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = 'gst_';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length; i++) {
      token += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 12; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return token;
};

// UUID Validator helper
export const isValidUUID = (str?: string | null): boolean => 
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// 💾 LocalStorage fallback key helper
const getGuestStorageKey = (weddingSiteIdOrSlug: string) => `SHAHI_GUESTS_${weddingSiteIdOrSlug}`;

// 📊 2. Calculate Real-Time Guest & RSVP Metrics
export const calculateGuestMetrics = (guests: GuestRecord[]): GuestSummaryMetrics => {
  let totalMembersCount = 0;
  let confirmedAttendingCount = 0;
  let confirmedAttendingMembers = 0;
  let pendingCount = 0;
  let notAttendingCount = 0;
  let maybeCount = 0;
  let viewedCount = 0;

  guests.forEach((g) => {
    const totalHeadcount = Math.max(1, Number(g.number_of_members) || 1);
    totalMembersCount += totalHeadcount;

    if (g.invitation_status === 'viewed') {
      viewedCount++;
    }

    const rsvpStatus = g.rsvp?.attendance_status || 'Pending';

    if (rsvpStatus === 'Attending') {
      confirmedAttendingCount++;
      confirmedAttendingMembers += Math.max(1, Number(g.rsvp?.attending_member_count) || totalHeadcount);
    } else if (rsvpStatus === 'Not Attending') {
      notAttendingCount++;
    } else if (rsvpStatus === 'Maybe') {
      maybeCount++;
    } else {
      pendingCount++;
    }
  });

  const totalResponded = confirmedAttendingCount + notAttendingCount + maybeCount;
  const responseRate = guests.length > 0 ? Math.round((totalResponded / guests.length) * 100) : 0;

  return {
    totalGuests: guests.length,
    totalMembersCount,
    confirmedAttendingCount,
    confirmedAttendingMembers,
    pendingCount,
    notAttendingCount,
    maybeCount,
    viewedInvitationsCount: viewedCount,
    responseRatePercent: responseRate,
  };
};

// 📥 3. Fetch All Guests for a Wedding Site (with joined RSVP records)
export const fetchWeddingGuests = async (weddingSiteIdOrSlug: string): Promise<GuestRecord[]> => {
  if (!weddingSiteIdOrSlug) return [];

  // Try Supabase first
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('guests').select('*, rsvps(*)');
      if (isValidUUID(weddingSiteIdOrSlug)) {
        query = query.or(`wedding_site_id.eq.${weddingSiteIdOrSlug},wedding_slug.eq.${weddingSiteIdOrSlug}`);
      } else {
        query = query.or(`wedding_slug.eq.${weddingSiteIdOrSlug},wedding_site_id.eq.${weddingSiteIdOrSlug}`);
      }

      const { data: guestsData, error: guestErr } = await query.order('created_at', { ascending: false });

      if (!guestErr && Array.isArray(guestsData)) {
        return guestsData.map((row: any) => {
          // Sort joined RSVPs descending to take the latest RSVP if multiple exist
          let rsvpsList = Array.isArray(row.rsvps) ? [...row.rsvps] : (row.rsvps ? [row.rsvps] : []);
          rsvpsList.sort((a, b) => new Date(b.responded_at || b.created_at || 0).getTime() - new Date(a.responded_at || a.created_at || 0).getTime());
          const rsvpObj = rsvpsList.length > 0 ? rsvpsList[0] : null;

          return {
            ...row,
            rsvp: rsvpObj ? {
              id: rsvpObj.id,
              attendance_status: (rsvpObj.attendance_status || (rsvpObj.attending ? 'Attending' : 'Not Attending')) as AttendanceStatus,
              attending_member_count: Number(rsvpObj.attendees_count) || Number(row.number_of_members) || 1,
              meal_preference: rsvpObj.meal_preference || 'Standard',
              special_note: rsvpObj.special_note || '',
              wishes: rsvpObj.wishes || '',
              responded_at: rsvpObj.responded_at || rsvpObj.created_at,
            } : null,
          };
        });
      }
    } catch (err) {
      console.warn('[GuestService] Supabase fetch error, checking local cache:', err);
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(getGuestStorageKey(weddingSiteIdOrSlug));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return [];
};

// 🔍 4. Fetch Guest by Secure Token (For personalized invitation rendering)
export const fetchGuestByToken = async (
  token: string,
  expectedWeddingSlugOrSiteId?: string
): Promise<GuestRecord | null> => {
  if (!token || !token.trim()) return null;
  const cleanToken = token.trim();

  // 1. Supabase Query
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('guests')
        .select('*, rsvps(*)')
        .eq('personal_invitation_token', cleanToken);

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        // Enforce strict cross-wedding isolation:
        if (expectedWeddingSlugOrSiteId) {
          const target = expectedWeddingSlugOrSiteId.trim().toLowerCase();
          const matchSlug = data.wedding_slug && data.wedding_slug.toLowerCase() === target;
          const matchSite = data.wedding_site_id && data.wedding_site_id === target;
          if (!matchSlug && !matchSite) {
            console.warn('[GuestService] Token rejected: does not belong to requested wedding site.');
            return null;
          }
        }

        // Mark invitation as viewed asynchronously
        if (data.invitation_status !== 'viewed') {
          supabase
            .from('guests')
            .update({ invitation_status: 'viewed', viewed_at: new Date().toISOString() })
            .eq('id', data.id)
            .then(() => {});
        }

        let rsvpsList = Array.isArray(data.rsvps) ? [...data.rsvps] : (data.rsvps ? [data.rsvps] : []);
        rsvpsList.sort((a, b) => new Date(b.responded_at || b.created_at || 0).getTime() - new Date(a.responded_at || a.created_at || 0).getTime());
        const rsvpObj = rsvpsList.length > 0 ? rsvpsList[0] : null;

        return {
          ...data,
          invitation_status: 'viewed',
          viewed_at: data.viewed_at || new Date().toISOString(),
          rsvp: rsvpObj ? {
            id: rsvpObj.id,
            attendance_status: (rsvpObj.attendance_status || (rsvpObj.attending ? 'Attending' : 'Not Attending')) as AttendanceStatus,
            attending_member_count: Number(rsvpObj.attendees_count) || Number(data.number_of_members) || 1,
            meal_preference: rsvpObj.meal_preference || 'Standard',
            special_note: rsvpObj.special_note || '',
            wishes: rsvpObj.wishes || '',
            responded_at: rsvpObj.responded_at || rsvpObj.created_at,
          } : null,
        };
      }
    } catch (e) {
      console.warn('[GuestService] Token lookup note:', e);
    }
  }

  // 2. Scan LocalStorage for matching guest token
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('SHAHI_GUESTS_')) {
          const listStr = localStorage.getItem(key);
          if (listStr) {
            const list: GuestRecord[] = JSON.parse(listStr);
            const found = list.find(g => g.personal_invitation_token === cleanToken);
            if (found) {
              found.invitation_status = 'viewed';
              found.viewed_at = new Date().toISOString();
              localStorage.setItem(key, JSON.stringify(list));
              return found;
            }
          }
        }
      }
    } catch (e) {}
  }

  return null;
};

// ➕ 5. Create Single Guest
export const createGuest = async (
  input: CreateGuestInput,
  weddingSlug?: string
): Promise<{ success: boolean; guest?: GuestRecord; error?: string }> => {
  const cleanName = (input.full_name || '').trim();
  const cleanPhone = (input.phone || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter a valid guest name (at least 2 characters).' };
  }

  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 7) {
    return { success: false, error: 'Please enter a valid mobile number.' };
  }

  const token = generateSecureGuestToken();
  const now = new Date().toISOString();

  const newGuest: GuestRecord = {
    id: `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    wedding_site_id: input.wedding_site_id,
    user_id: input.user_id,
    full_name: cleanName,
    phone: cleanPhone,
    email: input.email ? input.email.trim() : null,
    family_name: input.family_name ? input.family_name.trim() : null,
    relationship: (input.relationship || 'Family') as GuestCategory,
    number_of_members: Math.max(1, Number(input.number_of_members) || 1),
    guest_type: (input.relationship || 'Family') as GuestCategory,
    personal_invitation_token: token,
    invitation_status: 'draft',
    created_at: now,
    updated_at: now,
    rsvp: null,
  };

  // 1. Supabase Insertion
  if (isSupabaseConfigured) {
    try {
      const insertRow: any = {
        full_name: newGuest.full_name,
        phone: newGuest.phone,
        email: newGuest.email,
        family_name: newGuest.family_name,
        relationship: newGuest.relationship,
        number_of_members: newGuest.number_of_members,
        guest_type: newGuest.guest_type,
        personal_invitation_token: newGuest.personal_invitation_token,
        invitation_status: newGuest.invitation_status,
      };

      if (isValidUUID(input.wedding_site_id)) {
        insertRow.wedding_site_id = input.wedding_site_id;
      }
      if (weddingSlug) {
        insertRow.wedding_slug = weddingSlug;
      }
      if (isValidUUID(input.user_id)) {
        insertRow.user_id = input.user_id;
      }

      const { data, error } = await supabase
        .from('guests')
        .insert([insertRow])
        .select()
        .single();

      if (!error && data) {
        newGuest.id = data.id;
      }
    } catch (e) {
      console.warn('[GuestService] Supabase insert warning:', e);
    }
  }

  // 2. Sync to LocalStorage cache
  try {
    const key = getGuestStorageKey(input.wedding_site_id);
    const existing = await fetchWeddingGuests(input.wedding_site_id);
    const updated = [newGuest, ...existing.filter(g => g.id !== newGuest.id)];
    localStorage.setItem(key, JSON.stringify(updated));
    if (weddingSlug && weddingSlug !== input.wedding_site_id) {
      localStorage.setItem(getGuestStorageKey(weddingSlug), JSON.stringify(updated));
    }
  } catch (e) {}

  return { success: true, guest: newGuest };
};

// ✏️ 6. Update Guest Details
export const updateGuest = async (
  weddingSiteId: string,
  guestId: string,
  input: UpdateGuestInput
): Promise<{ success: boolean; guest?: GuestRecord; error?: string }> => {
  if (!guestId) return { success: false, error: 'Guest ID is required.' };

  const now = new Date().toISOString();
  const updatePayload: any = { updated_at: now };

  if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
  if (input.phone !== undefined) updatePayload.phone = input.phone.trim();
  if (input.email !== undefined) updatePayload.email = input.email ? input.email.trim() : null;
  if (input.family_name !== undefined) updatePayload.family_name = input.family_name ? input.family_name.trim() : null;
  if (input.relationship !== undefined) {
    updatePayload.relationship = input.relationship;
    updatePayload.guest_type = input.relationship;
  }
  if (input.number_of_members !== undefined) updatePayload.number_of_members = Math.max(1, Number(input.number_of_members) || 1);
  if (input.invitation_status !== undefined) updatePayload.invitation_status = input.invitation_status;

  if (isSupabaseConfigured && isValidUUID(guestId)) {
    try {
      await supabase.from('guests').update(updatePayload).eq('id', guestId);
    } catch (e) {
      console.warn('[GuestService] Update note:', e);
    }
  }

  // Update LocalStorage
  let updatedGuest: GuestRecord | undefined;
  try {
    const key = getGuestStorageKey(weddingSiteId);
    const existing = await fetchWeddingGuests(weddingSiteId);
    const updated = existing.map((g) => {
      if (g.id === guestId) {
        updatedGuest = { ...g, ...updatePayload };
        return updatedGuest;
      }
      return g;
    });
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {}

  return { success: true, guest: updatedGuest };
};

// 🗑️ 7. Delete Guest
export const deleteGuest = async (
  weddingSiteId: string,
  guestId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!guestId) return { success: false, error: 'Guest ID is required.' };

  if (isSupabaseConfigured && isValidUUID(guestId)) {
    try {
      await supabase.from('guests').delete().eq('id', guestId);
      await supabase.from('rsvps').delete().eq('guest_id', guestId);
    } catch (e) {
      console.warn('[GuestService] Delete note:', e);
    }
  }

  try {
    const key = getGuestStorageKey(weddingSiteId);
    const existing = await fetchWeddingGuests(weddingSiteId);
    const updated = existing.filter(g => g.id !== guestId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {}

  return { success: true };
};

// 📦 8. Bulk Import Guests (Batch with validations)
export const bulkImportGuests = async (
  weddingSiteId: string,
  userId: string,
  rows: ImportGuestRow[],
  weddingSlug?: string
): Promise<{ success: boolean; importedCount: number; errors: string[] }> => {
  const validRows = rows.filter(r => r.isValid);
  if (validRows.length === 0) {
    return { success: false, importedCount: 0, errors: ['No valid guest rows found to import.'] };
  }

  const now = new Date().toISOString();
  const newGuests: GuestRecord[] = validRows.map((r, idx) => ({
    id: `gst_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
    wedding_site_id: weddingSiteId,
    user_id: userId,
    full_name: r.name.trim(),
    phone: r.phone.trim(),
    email: r.email ? r.email.trim() : null,
    family_name: r.family ? r.family.trim() : null,
    relationship: r.category || 'Family',
    number_of_members: Math.max(1, Number(r.members) || 1),
    guest_type: r.category || 'Family',
    personal_invitation_token: generateSecureGuestToken(),
    invitation_status: 'draft',
    created_at: now,
    updated_at: now,
    rsvp: null,
  }));

  if (isSupabaseConfigured) {
    try {
      const insertPayload = newGuests.map(g => {
        const row: any = {
          full_name: g.full_name,
          phone: g.phone,
          email: g.email,
          family_name: g.family_name,
          relationship: g.relationship,
          number_of_members: g.number_of_members,
          guest_type: g.guest_type,
          personal_invitation_token: g.personal_invitation_token,
          invitation_status: g.invitation_status,
        };
        if (isValidUUID(g.wedding_site_id)) row.wedding_site_id = g.wedding_site_id;
        if (weddingSlug) row.wedding_slug = weddingSlug;
        if (isValidUUID(g.user_id)) row.user_id = g.user_id;
        return row;
      });

      const { data, error } = await supabase.from('guests').insert(insertPayload).select();
      if (!error && Array.isArray(data)) {
        data.forEach((d, idx) => {
          if (newGuests[idx]) newGuests[idx].id = d.id;
        });
      }
    } catch (e) {
      console.warn('[GuestService] Bulk insert warning:', e);
    }
  }

  // Update local storage
  try {
    const key = getGuestStorageKey(weddingSiteId);
    const existing = await fetchWeddingGuests(weddingSiteId);
    const merged = [...newGuests, ...existing];
    localStorage.setItem(key, JSON.stringify(merged));
    if (weddingSlug && weddingSlug !== weddingSiteId) {
      localStorage.setItem(getGuestStorageKey(weddingSlug), JSON.stringify(merged));
    }
  } catch (e) {}

  return { success: true, importedCount: newGuests.length, errors: [] };
};

// 📊 9. Export Guests to CSV
export const exportGuestsToCSV = (guests: GuestRecord[], weddingSlug: string, originUrl: string = 'https://shahistudio.com') => {
  if (!guests || guests.length === 0) return;

  const headers = [
    'Guest Name',
    'Mobile Phone',
    'Email',
    'Family Name',
    'Relationship / Category',
    'Total Members',
    'Invitation Status',
    'RSVP Attendance',
    'Attending Headcount',
    'Meal Preference',
    'Special Message / Wishes',
    'Personalized Invitation Link',
    'Created Date'
  ];

  const rows = guests.map((g) => {
    const personalUrl = `${originUrl}/i/${weddingSlug}?guest=${g.personal_invitation_token}`;
    const rsvpStatus = g.rsvp?.attendance_status || 'Pending';
    const rsvpHeadcount = g.rsvp ? g.rsvp.attending_member_count : (rsvpStatus === 'Attending' ? g.number_of_members : 0);
    const meal = g.rsvp?.meal_preference || '-';
    const wishes = g.rsvp?.wishes || g.rsvp?.special_note || '-';

    return [
      `"${(g.full_name || '').replace(/"/g, '""')}"`,
      `"${(g.phone || '').replace(/"/g, '""')}"`,
      `"${(g.email || '').replace(/"/g, '""')}"`,
      `"${(g.family_name || '').replace(/"/g, '""')}"`,
      `"${g.relationship}"`,
      g.number_of_members,
      `"${g.invitation_status}"`,
      `"${rsvpStatus}"`,
      rsvpHeadcount,
      `"${meal.replace(/"/g, '""')}"`,
      `"${wishes.replace(/"/g, '""')}"`,
      `"${personalUrl}"`,
      `"${new Date(g.created_at).toLocaleDateString('en-IN')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AmantranLink_Guests_${weddingSlug}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
