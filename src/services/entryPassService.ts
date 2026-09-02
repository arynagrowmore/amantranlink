import { createClient } from '@supabase/supabase-js';
import { 
  GuestEntryPass, 
  CheckInResult, 
  LiveVenueAttendanceMetrics, 
  generateSecureEntryToken, 
  isGuestEligibleForEntryPass 
} from '../types/entryPass';
import { GuestRecord } from '../types/guest';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory / localStorage fallback cache for venue check-ins when remote table migration is pending
const CHECKIN_CACHE_KEY = 'amantranlink_venue_checkins_';

function getLocalCheckInRecords(weddingSlug: string): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKIN_CACHE_KEY + weddingSlug.toLowerCase());
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalCheckInRecord(weddingSlug: string, token: string, record: any) {
  if (typeof window === 'undefined') return;
  try {
    const all = getLocalCheckInRecords(weddingSlug);
    all[token] = record;
    localStorage.setItem(CHECKIN_CACHE_KEY + weddingSlug.toLowerCase(), JSON.stringify(all));
  } catch (e) {}
}

/**
 * 🎫 Issue or Retrieve existing active QR Entry Pass for a guest
 */
export async function issueOrFetchEntryPass(
  guest: GuestRecord,
  weddingSlug: string,
  weddingSiteId?: string
): Promise<{ success: boolean; pass?: GuestEntryPass; error?: string }> {
  try {
    // 1. Verify eligibility
    if (!isGuestEligibleForEntryPass(guest)) {
      return {
        success: false,
        error: 'Guest must confirm attendance (Attending) to be eligible for a Wedding QR Entry Pass.',
      };
    }

    const cleanSlug = (weddingSlug || '').trim().toLowerCase();
    const confirmedMembers = guest.rsvp?.attending_member_count || guest.number_of_members || 1;

    // 2. Try querying dedicated guest_entry_passes table
    const { data: existingPass, error: fetchErr } = await supabase
      .from('guest_entry_passes')
      .select('*')
      .eq('guest_id', guest.id)
      .maybeSingle();

    if (!fetchErr && existingPass) {
      if (existingPass.allowed_members_count !== confirmedMembers) {
        await supabase
          .from('guest_entry_passes')
          .update({ allowed_members_count: confirmedMembers, updated_at: new Date().toISOString() })
          .eq('id', existingPass.id);
        existingPass.allowed_members_count = confirmedMembers;
      }

      return {
        success: true,
        pass: {
          ...existingPass,
          guest_name: guest.full_name,
          family_name: guest.family_name,
          phone: guest.phone,
          relationship: guest.relationship,
          meal_preference: guest.rsvp?.meal_preference,
        },
      };
    }

    // If table exists but no pass found, insert one
    if (!fetchErr) {
      const entryToken = generateSecureEntryToken();
      const passPayload: any = {
        guest_id: guest.id,
        wedding_slug: cleanSlug,
        entry_token: entryToken,
        status: 'active',
        allowed_members_count: confirmedMembers,
        issued_at: new Date().toISOString(),
        check_in_count: 0,
      };

      if (weddingSiteId) {
        passPayload.wedding_site_id = weddingSiteId;
      }

      const { data: newPass, error: insertErr } = await supabase
        .from('guest_entry_passes')
        .insert([passPayload])
        .select()
        .single();

      if (!insertErr && newPass) {
        return {
          success: true,
          pass: {
            ...newPass,
            guest_name: guest.full_name,
            family_name: guest.family_name,
            phone: guest.phone,
            relationship: guest.relationship,
            meal_preference: guest.rsvp?.meal_preference,
          },
        };
      }
    }

    // 3. Resilient Fallback: Derive deterministic secure QR pass token from guest record
    const derivedToken = `ent_${guest.personal_invitation_token.replace('gst_', '')}`;
    const localRecords = getLocalCheckInRecords(cleanSlug);
    const localCheckIn = localRecords[derivedToken];

    const fallbackPass: GuestEntryPass = {
      id: `pass_${guest.id}`,
      guest_id: guest.id,
      wedding_site_id: weddingSiteId,
      wedding_slug: cleanSlug,
      entry_token: derivedToken,
      status: localCheckIn ? 'used' : 'active',
      allowed_members_count: confirmedMembers,
      issued_at: guest.created_at || new Date().toISOString(),
      checked_in_at: localCheckIn?.checked_in_at || null,
      checked_in_by: localCheckIn?.checked_in_by || null,
      check_in_count: localCheckIn ? 1 : 0,
      guest_name: guest.full_name,
      family_name: guest.family_name,
      phone: guest.phone,
      relationship: guest.relationship,
      meal_preference: guest.rsvp?.meal_preference,
    };

    return {
      success: true,
      pass: fallbackPass,
    };
  } catch (err: any) {
    console.error('issueOrFetchEntryPass exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 🔍 Resolve an Entry Pass by Token (Public / Guest / Venue scan)
 */
export async function resolveEntryPass(
  token: string,
  expectedWeddingSlug?: string
): Promise<{ success: boolean; pass?: GuestEntryPass; error?: string }> {
  try {
    if (!token || !token.startsWith('ent_')) {
      return { success: false, error: 'Invalid entry pass token format.' };
    }

    const cleanToken = token.trim();
    const cleanSlug = expectedWeddingSlug ? expectedWeddingSlug.trim().toLowerCase() : '';

    // 1. Try dedicated table
    const { data: pass, error: pErr } = await supabase
      .from('guest_entry_passes')
      .select(`
        *,
        guests:guest_id (
          id, full_name, family_name, phone, relationship, wedding_slug
        )
      `)
      .eq('entry_token', cleanToken)
      .maybeSingle();

    if (!pErr && pass) {
      if (cleanSlug && pass.wedding_slug && pass.wedding_slug.toLowerCase() !== cleanSlug) {
        return { success: false, error: 'This pass belongs to a different wedding event.' };
      }

      let mealPreference = null;
      if (pass.guest_id) {
        const { data: rsvp } = await supabase
          .from('rsvps')
          .select('meal_preference')
          .eq('guest_id', pass.guest_id)
          .maybeSingle();
        if (rsvp) mealPreference = rsvp.meal_preference;
      }

      const guestObj = pass.guests as any;
      return {
        success: true,
        pass: {
          ...pass,
          guest_name: guestObj?.full_name || 'Valued Guest',
          family_name: guestObj?.family_name || null,
          phone: guestObj?.phone || '',
          relationship: guestObj?.relationship || 'Guest',
          meal_preference: mealPreference,
        },
      };
    }

    // 2. Resilient Fallback: Resolve against public.guests using mapped token
    const guestToken = `gst_${cleanToken.replace('ent_', '')}`;
    const { data: guest, error: gErr } = await supabase
      .from('guests')
      .select('id, full_name, family_name, phone, relationship, number_of_members, wedding_slug, wedding_site_id, created_at')
      .eq('personal_invitation_token', guestToken)
      .maybeSingle();

    if (gErr || !guest) {
      return { success: false, error: 'Entry pass not found or invalid.' };
    }

    if (cleanSlug && guest.wedding_slug && guest.wedding_slug.toLowerCase() !== cleanSlug) {
      return { success: false, error: 'This pass belongs to a different wedding event.' };
    }

    // Fetch RSVP to verify attendance
    const { data: rsvp } = await supabase
      .from('rsvps')
      .select('attendance_status, attending_member_count, meal_preference')
      .eq('guest_id', guest.id)
      .maybeSingle();

    if (!rsvp || rsvp.attendance_status !== 'Attending') {
      return { success: false, error: 'RSVP confirmation is required before an entry pass can be validated.' };
    }

    const localRecords = getLocalCheckInRecords(guest.wedding_slug);
    const localCheckIn = localRecords[cleanToken];

    const confirmedHeadcount = rsvp.attending_member_count || guest.number_of_members || 1;

    return {
      success: true,
      pass: {
        id: `pass_${guest.id}`,
        guest_id: guest.id,
        wedding_site_id: guest.wedding_site_id,
        wedding_slug: guest.wedding_slug,
        entry_token: cleanToken,
        status: localCheckIn ? 'used' : 'active',
        allowed_members_count: confirmedHeadcount,
        issued_at: guest.created_at || new Date().toISOString(),
        checked_in_at: localCheckIn?.checked_in_at || null,
        checked_in_by: localCheckIn?.checked_in_by || null,
        check_in_count: localCheckIn ? 1 : 0,
        guest_name: guest.full_name,
        family_name: guest.family_name,
        phone: guest.phone,
        relationship: guest.relationship,
        meal_preference: rsvp.meal_preference,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * ⚡ Check In Guest (Authoritative backend verification + Duplicate scan protection)
 */
export async function checkInGuest(
  token: string,
  weddingSlug: string,
  checkedInBy?: string
): Promise<CheckInResult> {
  try {
    const cleanToken = (token || '').trim();
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    if (!cleanToken) {
      return {
        success: false,
        status: 'INVALID_TOKEN',
        message: 'No QR entry token provided.',
      };
    }

    // 1. Resolve pass
    const { success, pass, error } = await resolveEntryPass(cleanToken, cleanSlug);

    if (!success || !pass) {
      return {
        success: false,
        status: 'INVALID_TOKEN',
        message: error || 'Invalid or unrecognized QR entry token.',
      };
    }

    // 2. Cross-wedding verification
    if (pass.wedding_slug && pass.wedding_slug.toLowerCase() !== cleanSlug) {
      return {
        success: false,
        status: 'WRONG_WEDDING',
        message: 'This pass is issued for a different wedding event.',
      };
    }

    // 3. Duplicate Check-in Protection
    if (pass.status === 'used' || pass.check_in_count > 0) {
      const formattedTime = pass.checked_in_at 
        ? new Date(pass.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'Earlier today';

      return {
        success: false,
        status: 'ALREADY_CHECKED_IN',
        message: `${pass.guest_name} ${pass.family_name ? `(${pass.family_name})` : ''} was already checked in at ${formattedTime}.`,
        pass,
        first_checked_in_at: pass.checked_in_at || undefined,
        checked_in_members_count: pass.allowed_members_count,
      };
    }

    // 4. Update Database or Resilient Fallback Record
    const nowIso = new Date().toISOString();
    
    // Try updating dedicated table
    await supabase
      .from('guest_entry_passes')
      .update({
        status: 'used',
        checked_in_at: nowIso,
        checked_in_by: checkedInBy || null,
        check_in_count: 1,
        updated_at: nowIso,
      })
      .eq('id', pass.id);

    // Persist in local check-in registry
    saveLocalCheckInRecord(cleanSlug, cleanToken, {
      checked_in_at: nowIso,
      checked_in_by: checkedInBy || null,
      guest_id: pass.guest_id,
      guest_name: pass.guest_name,
      family_name: pass.family_name,
      allowed_members_count: pass.allowed_members_count,
      meal_preference: pass.meal_preference,
    });

    pass.status = 'used';
    pass.checked_in_at = nowIso;
    pass.check_in_count = 1;

    return {
      success: true,
      status: 'CHECKED_IN',
      message: `Welcome ${pass.guest_name}! Checked in for ${pass.allowed_members_count} members.`,
      pass,
      checked_in_at: nowIso,
      checked_in_members_count: pass.allowed_members_count,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'INVALID_TOKEN',
      message: 'Check-in error: ' + err.message,
    };
  }
}

/**
 * 📊 Fetch Live Venue Attendance Stats
 */
export async function fetchLiveVenueStats(weddingSlug: string): Promise<LiveVenueAttendanceMetrics> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    // 1. Total Confirmed Expected Members from RSVPs
    const { data: attendingRsvps } = await supabase
      .from('rsvps')
      .select('attending_member_count, attendees_count, number_of_members, guests:guest_id(number_of_members)')
      .eq('wedding_slug', cleanSlug)
      .eq('attendance_status', 'Attending');

    let totalExpected = 0;
    if (attendingRsvps) {
      attendingRsvps.forEach((r: any) => {
        const count = r.attending_member_count || r.attendees_count || r.guests?.number_of_members || 1;
        totalExpected += count;
      });
    }

    // 2. Passes Checked In
    let checkedIn = 0;
    let totalPassesIssued = 0;
    let usedPasses = 0;

    const { data: passes } = await supabase
      .from('guest_entry_passes')
      .select('id, status, allowed_members_count, check_in_count')
      .eq('wedding_slug', cleanSlug);

    if (passes && passes.length > 0) {
      totalPassesIssued = passes.length;
      passes.forEach((p) => {
        if (p.status === 'used' || p.check_in_count > 0) {
          checkedIn += p.allowed_members_count || 1;
          usedPasses++;
        }
      });
    } else {
      // Fallback from local registry
      const localRecords = getLocalCheckInRecords(cleanSlug);
      const keys = Object.keys(localRecords);
      totalPassesIssued = attendingRsvps ? attendingRsvps.length : 0;
      usedPasses = keys.length;
      keys.forEach((k) => {
        checkedIn += localRecords[k].allowed_members_count || 1;
      });
    }

    const remaining = Math.max(0, totalExpected - checkedIn);
    const rate = totalExpected > 0 ? Math.round((checkedIn / totalExpected) * 100) : 0;

    return {
      totalExpectedMembers: totalExpected,
      checkedInMembers: checkedIn,
      remainingMembers: remaining,
      checkInRatePercent: Math.min(100, rate),
      totalPassesIssued,
      usedPassesCount: usedPasses,
    };
  } catch (err) {
    console.error('fetchLiveVenueStats error:', err);
    return {
      totalExpectedMembers: 0,
      checkedInMembers: 0,
      remainingMembers: 0,
      checkInRatePercent: 0,
      totalPassesIssued: 0,
      usedPassesCount: 0,
    };
  }
}

/**
 * 🕒 Fetch Recent Live Venue Check-Ins
 */
export async function fetchRecentCheckIns(weddingSlug: string): Promise<GuestEntryPass[]> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    const { data, error } = await supabase
      .from('guest_entry_passes')
      .select(`
        *,
        guests:guest_id (
          full_name, family_name, phone, relationship
        )
      `)
      .eq('wedding_slug', cleanSlug)
      .eq('status', 'used')
      .order('checked_in_at', { ascending: false })
      .limit(15);

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        ...p,
        guest_name: p.guests?.full_name || 'Guest',
        family_name: p.guests?.family_name || null,
        phone: p.guests?.phone || '',
        relationship: p.guests?.relationship || 'Guest',
      }));
    }

    // Fallback: Local check-in records
    const localRecords = getLocalCheckInRecords(cleanSlug);
    return Object.keys(localRecords).map((token) => {
      const rec = localRecords[token];
      return {
        id: `pass_${rec.guest_id || token}`,
        guest_id: rec.guest_id,
        wedding_slug: cleanSlug,
        entry_token: token,
        status: 'used' as const,
        allowed_members_count: rec.allowed_members_count || 1,
        issued_at: rec.checked_in_at,
        checked_in_at: rec.checked_in_at,
        checked_in_by: rec.checked_in_by,
        check_in_count: 1,
        guest_name: rec.guest_name || 'Valued Guest',
        family_name: rec.family_name || null,
        meal_preference: rec.meal_preference,
      };
    }).reverse().slice(0, 15);
  } catch (err) {
    console.error('fetchRecentCheckIns error:', err);
    return [];
  }
}
