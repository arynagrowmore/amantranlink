/**
 * 📸 AMANTRANLINK PHOTOGRAPHER PARTNER CLIENT SERVICE (PHASE 8 - PHASE 12)
 * Complete partner ecosystem service: attribution, client review tokens, approvals,
 * change requests, safe duplication, lead funnels, notifications & studio teams.
 */

import { supabase } from '../lib/supabase';
import { resolveApiUrl } from '../utils/apiConfig';
import { PartnerProfile, PartnerDashboardStats, CommissionRecord } from '../types/wedding';

const STORAGE_PARTNER_KEY = 'AMANTRANLINK_PARTNER_ATTRIBUTION';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Persist partner attribution in localStorage and sessionStorage so it survives
 * navigation, refresh, login, signup, template selection, and checkout.
 */
export const storePartnerAttribution = (partnerSlug: string) => {
  if (!partnerSlug || typeof window === 'undefined') return;
  const cleanSlug = partnerSlug.trim().toLowerCase();
  try {
    localStorage.setItem(STORAGE_PARTNER_KEY, cleanSlug);
    sessionStorage.setItem(STORAGE_PARTNER_KEY, cleanSlug);
  } catch (e) {}
};

/**
 * Retrieve active partner attribution from storage or URL parameters.
 */
export const getStoredPartnerAttribution = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Priority: URL search param
  const urlParams = new URLSearchParams(window.location.search);
  const urlPartner = urlParams.get('partner') || urlParams.get('ref') || urlParams.get('studio');
  if (urlPartner) {
    storePartnerAttribution(urlPartner);
    return urlPartner.trim().toLowerCase();
  }

  // 2. Storage fallback
  try {
    return localStorage.getItem(STORAGE_PARTNER_KEY) || sessionStorage.getItem(STORAGE_PARTNER_KEY) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Clear partner attribution upon explicit request
 */
export const clearPartnerAttribution = () => {
  try {
    localStorage.removeItem(STORAGE_PARTNER_KEY);
    sessionStorage.removeItem(STORAGE_PARTNER_KEY);
  } catch (e) {}
};

/**
 * Resolve partner details by slug via Supabase / backend API.
 */
export const resolvePartnerBySlug = async (slug: string): Promise<PartnerProfile | null> => {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, studio_name, partner_slug, payout_upi, role, created_at')
      .eq('partner_slug', cleanSlug)
      .maybeSingle();

    if (error || !data) {
      if (cleanSlug.includes('studio') || cleanSlug.includes('photo')) {
        return {
          partnerId: `mock_${cleanSlug}`,
          studioName: cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          partnerSlug: cleanSlug,
          payoutUpi: 'studio@upi',
          status: 'active',
        };
      }
      return null;
    }

    return {
      partnerId: data.id,
      studioName: data.studio_name || data.name,
      partnerSlug: data.partner_slug || cleanSlug,
      payoutUpi: data.payout_upi || '',
      email: data.email,
      phone: data.phone,
      status: 'active',
      createdAt: data.created_at,
    };
  } catch (e) {
    console.warn('[PartnerService] resolvePartnerBySlug error:', e);
    return null;
  }
};

/**
 * Check if a studio handle / referral slug is available and valid
 */
export const checkStudioHandleAvailability = async (
  slug: string, 
  currentUserId?: string
): Promise<{ available: boolean; reason?: string }> => {
  if (!slug) return { available: false, reason: 'Handle cannot be empty' };
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  if (cleanSlug.length < 3) {
    return { available: false, reason: 'Handle must be at least 3 characters long' };
  }
  if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
    return { available: false, reason: 'Handle must only contain letters, numbers, and hyphens' };
  }

  // Reserved handles
  const RESERVED_SLUGS = ['admin', 'api', 'app', 'studio', 'partner', 'dashboard', 'settings', 'auth', 'login', 'signup', 'checkout', 'terms'];
  if (RESERVED_SLUGS.includes(cleanSlug)) {
    return { available: false, reason: 'This handle is reserved. Please pick another.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, partner_slug')
      .eq('partner_slug', cleanSlug);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { available: true };
    }

    if (currentUserId && data.length === 1 && data[0].id === currentUserId) {
      return { available: true };
    }

    return { available: false, reason: 'This studio handle is already taken' };
  } catch (e) {
    // If table query fails, fallback to API check or local validity
    try {
      const endpoint = `/api/partner/check-handle?handle=${encodeURIComponent(cleanSlug)}${currentUserId ? `&userId=${currentUserId}` : ''}`;
      const res = await fetch(resolveApiUrl(endpoint));
      if (res.ok) {
        const json = await res.json();
        return { available: json.available, reason: json.reason };
      }
    } catch (_) {}
    return { available: true };
  }
};

/**
 * Fetch Partner Dashboard metrics and commission ledger
 */
export const fetchPartnerDashboardStats = async (partnerId: string): Promise<PartnerDashboardStats> => {
  if (!partnerId || !UUID_REGEX.test(partnerId)) {
    return {
      totalWeddings: 0,
      draftWeddings: 0,
      liveWeddings: 0,
      totalGmv: 0,
      totalCommission: 0,
      pendingCommission: 0,
      availableCredit: 0,
      recentCommissions: [],
    };
  }

  try {
    // 1. Fetch wedding sites created by or attributed to this partner
    const { data: sites } = await supabase
      .from('wedding_sites')
      .select('id, status, is_locked, content, updated_at')
      .or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`);

    const allSites = sites || [];
    const totalWeddings = allSites.length;
    const liveWeddings = allSites.filter((s) => s.status === 'published').length;
    const draftWeddings = allSites.filter((s) => s.status === 'draft' || !s.status).length;

    // 2. Fetch commission records
    const { data: commissions } = await supabase
      .from('commissions_ledger')
      .select('id, partner_id, wedding_site_id, order_id, payment_id, retail_price, commission_amount, status, created_at')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    const allCommissions: CommissionRecord[] = (commissions || []).map((c) => ({
      id: c.id,
      partnerId: c.partner_id,
      weddingSiteId: c.wedding_site_id,
      orderId: c.order_id,
      paymentId: c.payment_id,
      retailPrice: c.retail_price,
      commissionAmount: c.commission_amount,
      status: c.status,
      createdAt: c.created_at,
    }));

    const totalGmv = allCommissions.reduce((sum, c) => sum + (c.retailPrice || 0), 0);
    const totalCommission = allCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    const pendingCommission = allCommissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
    const availableCredit = allCommissions.filter((c) => c.status === 'credited').reduce((sum, c) => sum + c.commissionAmount, 0);

    return {
      totalWeddings,
      draftWeddings,
      liveWeddings,
      totalGmv,
      totalCommission,
      pendingCommission,
      availableCredit,
      recentCommissions: allCommissions,
    };
  } catch (e) {
    console.warn('[PartnerService] fetchPartnerDashboardStats error:', e);
    return {
      totalWeddings: 0,
      draftWeddings: 0,
      liveWeddings: 0,
      totalGmv: 0,
      totalCommission: 0,
      pendingCommission: 0,
      availableCredit: 0,
      recentCommissions: [],
    };
  }
};

/**
 * Update Partner Profile (Studio Name, Partner Slug, Payout UPI)
 */
export const updatePartnerProfile = async (
  partnerId: string,
  data: { studioName?: string; partnerSlug?: string; payoutUpi?: string }
): Promise<boolean> => {
  if (!partnerId || !UUID_REGEX.test(partnerId)) return false;

  try {
    const payload: Record<string, any> = {
      role: 'partner',
      updated_at: new Date().toISOString(),
    };
    if (data.studioName) payload.studio_name = data.studioName.trim();
    if (data.partnerSlug) payload.partner_slug = data.partnerSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (data.payoutUpi) payload.payout_upi = data.payoutUpi.trim();

    const { error } = await supabase.from('profiles').update(payload).eq('id', partnerId);
    return !error;
  } catch (e) {
    console.warn('[PartnerService] updatePartnerProfile error:', e);
    return false;
  }
};

// ══════════════════════════════════════════════════════════════════════════
// 🤝 PHASE 9: CLIENT REVIEW & APPROVAL ACCESS TOKEN SERVICES
// ══════════════════════════════════════════════════════════════════════════

/**
 * Generate a secure, revocable Client Review Token for an invitation
 */
export const generateClientReviewToken = async (
  weddingSiteId: string,
  partnerId: string
): Promise<{ token: string; reviewUrl: string }> => {
  if (!weddingSiteId || !partnerId) throw new Error('Invalid wedding site or partner identifier.');

  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const token = `rev_${Date.now().toString(36)}_${randomPart}`;

  try {
    // 1. Insert into client_review_tokens table if available
    await supabase.from('client_review_tokens').insert({
      wedding_site_id: weddingSiteId,
      partner_id: partnerId,
      token,
      is_revoked: false,
      created_at: new Date().toISOString(),
    });

    // 2. Update wedding_sites record with review_token and workflow_status
    await supabase.from('wedding_sites').update({
      review_token: token,
      workflow_status: 'SENT_FOR_REVIEW',
      updated_at: new Date().toISOString(),
    }).eq('id', weddingSiteId);
  } catch (e) {
    console.warn('Client review token database note:', e);
  }

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://amantranlink.com';
  const reviewUrl = `${appOrigin}/review/${token}`;

  return { token, reviewUrl };
};

/**
 * Revoke an active Client Review Token
 */
export const revokeClientReviewToken = async (token: string, partnerId: string): Promise<boolean> => {
  if (!token || !partnerId) return false;
  try {
    await supabase
      .from('client_review_tokens')
      .update({ is_revoked: true })
      .eq('token', token)
      .eq('partner_id', partnerId);

    await supabase
      .from('wedding_sites')
      .update({ review_token: null, workflow_status: 'DRAFT' })
      .eq('review_token', token)
      .eq('partner_id', partnerId);

    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a Client Review Token and fetch the sandboxed invitation
 */
export const validateClientReviewToken = async (
  token: string
): Promise<{ valid: boolean; site?: any; partner?: any; error?: string }> => {
  if (!token) return { valid: false, error: 'Review token is required.' };

  try {
    // 1. Check client_review_tokens table
    const { data: tokenRow } = await supabase
      .from('client_review_tokens')
      .select('*, wedding_sites(*)')
      .eq('token', token)
      .eq('is_revoked', false)
      .maybeSingle();

    if (tokenRow && tokenRow.wedding_sites) {
      const site = tokenRow.wedding_sites;
      // Strip private financial data
      delete site.quoted_amount;
      delete site.partner_notes;

      return {
        valid: true,
        site,
        partner: {
          studioName: site.studio_badge || 'Partner Studio',
        },
      };
    }

    // 2. Fallback check directly in wedding_sites
    const { data: site } = await supabase
      .from('wedding_sites')
      .select('id, slug, published_url, status, is_locked, workflow_status, content, studio_badge, partner_id, created_at')
      .eq('review_token', token)
      .maybeSingle();

    if (site) {
      delete (site as any).quoted_amount;
      delete (site as any).partner_notes;

      return {
        valid: true,
        site,
        partner: {
          studioName: site.studio_badge || 'Partner Studio',
        },
      };
    }

    return { valid: false, error: 'Review token is invalid, expired, or has been revoked by the studio.' };
  } catch (e: any) {
    return { valid: false, error: e.message || 'Unable to validate review token.' };
  }
};

/**
 * Client Approves Invitation
 */
export const submitClientApproval = async (
  token: string,
  clientName?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token) return { success: false, error: 'Token missing' };

  try {
    const { data: site, error: findError } = await supabase
      .from('wedding_sites')
      .select('id, partner_id, content')
      .eq('review_token', token)
      .maybeSingle();

    if (findError || !site) return { success: false, error: 'Invitation not found or token invalid' };

    const couple = `${site.content?.couple?.groomEn || 'Groom'} & ${site.content?.couple?.brideEn || 'Bride'}`;

    await supabase.from('wedding_sites').update({
      workflow_status: 'CLIENT_APPROVED',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', site.id);

    // Notify Partner
    if (site.partner_id) {
      await createNotification(
        site.partner_id,
        'CLIENT_APPROVED',
        `🎉 ${couple} Approved Invitation Design!`,
        `Client ${clientName || 'Couple'} has officially approved their royal wedding invitation. Ready to unlock & publish.`,
        { siteId: site.id, token }
      );
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Approval submission failed' };
  }
};

/**
 * Client Submits Structured Change Request
 */
export const submitClientChangeRequest = async (
  token: string,
  clientName: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token || !message.trim()) return { success: false, error: 'Please enter change request details.' };

  try {
    const { data: site } = await supabase
      .from('wedding_sites')
      .select('id, partner_id, content')
      .eq('review_token', token)
      .maybeSingle();

    if (!site) return { success: false, error: 'Invitation not found' };

    const couple = `${site.content?.couple?.groomEn || 'Groom'} & ${site.content?.couple?.brideEn || 'Bride'}`;

    // 1. Insert structured change request
    await supabase.from('change_requests').insert({
      wedding_site_id: site.id,
      partner_id: site.partner_id,
      client_name: clientName.trim() || 'Client',
      message: message.trim(),
      status: 'OPEN',
      created_at: new Date().toISOString(),
    });

    // 2. Update wedding_sites status
    await supabase.from('wedding_sites').update({
      workflow_status: 'CHANGES_REQUESTED',
      client_feedback: message.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', site.id);

    // 3. Notify Partner
    if (site.partner_id) {
      await createNotification(
        site.partner_id,
        'CHANGES_REQUESTED',
        `📝 Changes Requested for ${couple}`,
        `"${message.trim().slice(0, 100)}..." from ${clientName || 'Client'}.`,
        { siteId: site.id, message }
      );
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to submit change request' };
  }
};

// ══════════════════════════════════════════════════════════════════════════
// 🔄 PHASE 10: SAFE INVITATION DUPLICATION & CLIENT PAYMENT TRACKING
// ══════════════════════════════════════════════════════════════════════════

/**
 * Duplicate an invitation safely without copying payment, RSVP, or order records
 */
export const duplicatePartnerInvitation = async (
  sourceSiteId: string,
  partnerId: string,
  newGroom?: string,
  newBride?: string
): Promise<{ success: boolean; newSite?: any; error?: string }> => {
  if (!sourceSiteId || !partnerId || !UUID_REGEX.test(partnerId)) {
    return { success: false, error: 'Invalid invitation or partner identifier.' };
  }

  try {
    // 1. Fetch source invitation
    const { data: sourceSite, error: fetchErr } = await supabase
      .from('wedding_sites')
      .select('*')
      .eq('id', sourceSiteId)
      .maybeSingle();

    if (fetchErr || !sourceSite) {
      return { success: false, error: 'Source wedding invitation not found.' };
    }

    // Verify tenant authorization
    if (sourceSite.partner_id !== partnerId && sourceSite.user_id !== partnerId) {
      return { success: false, error: 'Unauthorized to duplicate this invitation.' };
    }

    const groomName = newGroom || sourceSite.content?.couple?.groomEn || 'Groom';
    const brideName = newBride || sourceSite.content?.couple?.brideEn || 'Bride';
    const cleanGroom = groomName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanBride = brideName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newSlug = `${cleanGroom}-${cleanBride}-copy-${Date.now().toString(36).slice(-4)}`;

    // 2. Clone content JSONB with clean reset
    const duplicatedContent = JSON.parse(JSON.stringify(sourceSite.content || {}));
    if (newGroom) {
      duplicatedContent.couple = duplicatedContent.couple || {};
      duplicatedContent.couple.groomEn = newGroom;
      duplicatedContent.couple.groomHi = newGroom;
      duplicatedContent.couple.groomGu = newGroom;
    }
    if (newBride) {
      duplicatedContent.couple = duplicatedContent.couple || {};
      duplicatedContent.couple.brideEn = newBride;
      duplicatedContent.couple.brideHi = newBride;
      duplicatedContent.couple.brideGu = newBride;
    }

    // Explicitly reset review tokens, payment metadata, and feedback
    delete duplicatedContent.payment_id;
    delete duplicatedContent.order_id;
    delete duplicatedContent.review_token;
    delete duplicatedContent.client_feedback;

    // 3. Insert fresh independent record
    const insertPayload: any = {
      user_id: partnerId,
      partner_id: partnerId,
      status: 'draft',
      is_locked: false,
      workflow_status: 'DRAFT',
      lifecycle_status: 'DRAFT',
      client_payment_status: 'NOT_TRACKED',
      content: duplicatedContent,
      published_url: newSlug,
      studio_badge: sourceSite.studio_badge || 'Studio Partner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (sourceSite.template_id && UUID_REGEX.test(sourceSite.template_id)) {
      insertPayload.template_id = sourceSite.template_id;
    }

    const { data: newSite, error: insertErr } = await supabase
      .from('wedding_sites')
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) throw insertErr;

    return { success: true, newSite };
  } catch (e: any) {
    console.error('Duplication error:', e);
    return { success: false, error: e.message || 'Failed to duplicate invitation.' };
  }
};

/**
 * Update Studio-to-Client Payment Tracking
 */
export const updateClientPaymentTracking = async (
  siteId: string,
  partnerId: string,
  status: 'NOT_TRACKED' | 'PENDING' | 'PARTIAL' | 'PAID',
  quotedAmount?: number
): Promise<boolean> => {
  if (!siteId || !partnerId) return false;
  try {
    const payload: any = {
      client_payment_status: status,
      updated_at: new Date().toISOString(),
    };
    if (quotedAmount !== undefined) payload.quoted_amount = quotedAmount;

    const { error } = await supabase
      .from('wedding_sites')
      .update(payload)
      .eq('id', siteId)
      .or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`);

    return !error;
  } catch (e) {
    return false;
  }
};

// ══════════════════════════════════════════════════════════════════════════
// 🔔 PHASE 11: DATABASE NOTIFICATIONS & LEAD FUNNELS
// ══════════════════════════════════════════════════════════════════════════

export interface InAppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  readAt?: string | null;
  createdAt: string;
}

/**
 * Create an In-App Notification
 */
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata: any = {}
): Promise<boolean> => {
  if (!userId || !UUID_REGEX.test(userId)) return false;
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      metadata,
      created_at: new Date().toISOString(),
    });
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * Fetch Notifications for a User
 */
export const fetchUserNotifications = async (userId: string): Promise<InAppNotification[]> => {
  if (!userId || !UUID_REGEX.test(userId)) return [];
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Mark a Notification as Read
 */
export const markNotificationRead = async (notificationId: string, userId: string): Promise<boolean> => {
  if (!notificationId || !userId) return false;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * Track Partner Analytics Event
 */
export const trackPartnerEvent = async (
  partnerSlug: string,
  eventType: 'REFERRAL_VISIT' | 'SIGNUP' | 'INVITATION_CREATED' | 'PREVIEW_SENT' | 'CLIENT_APPROVED' | 'PAYMENT_COMPLETED' | 'PUBLISHED',
  metadata: Record<string, any> = {},
  weddingSiteId?: string
) => {
  if (!partnerSlug) return;
  try {
    await fetch(resolveApiUrl('/api/partner/track-event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerSlug,
        eventType,
        metadata,
        weddingSiteId
      })
    });
  } catch (e) {}
};

export interface CreateClientInvitationParams {
  partnerId: string;
  studioBadge?: string;
  groomName: string;
  brideName: string;
  clientPhone?: string;
  clientEmail?: string;
  partnerNotes?: string;
  selectedTheme: string;
  weddingDate?: string;
  initialProjectState: any;
  publishedSlug?: string;
}

export interface CreateClientInvitationResult {
  success: boolean;
  site?: any;
  error?: string;
  technicalError?: any;
}

/**
 * 👑 Authoritative & Bulletproof Studio Partner Client Invitation Creation
 * 
 * 1. Resolves template UUID from public.templates by theme slug.
 * 2. Normalizes client contact info into both first-class columns and JSONB content.
 * 3. Handles PostgREST schema cache misses automatically with adaptive column retries.
 * 4. Ensures atomic record creation with clean diagnostic logging and user-friendly error messages.
 */
export const createPartnerClientInvitation = async (
  params: CreateClientInvitationParams
): Promise<CreateClientInvitationResult> => {
  const {
    partnerId,
    studioBadge,
    clientPhone,
    clientEmail,
    partnerNotes,
    selectedTheme,
    initialProjectState,
    publishedSlug,
  } = params;

  if (!partnerId) {
    return { 
      success: false, 
      error: 'Partner authentication required. Please sign in to create invitations.' 
    };
  }

  // 1. Resolve Template UUID from `public.templates`
  let templateUuid: string | null = null;
  try {
    const { data: tpl } = await supabase
      .from('templates')
      .select('id, slug')
      .eq('slug', selectedTheme)
      .maybeSingle();

    if (tpl?.id) {
      templateUuid = tpl.id;
    } else {
      // Fallback to rajmahal or first available template
      const { data: fallbackTpl } = await supabase
        .from('templates')
        .select('id, slug')
        .limit(1)
        .maybeSingle();
      if (fallbackTpl?.id) {
        templateUuid = fallbackTpl.id;
      }
    }
  } catch (err) {
    console.warn('[PartnerService] Could not resolve template UUID from database:', err);
  }

  // Ensure content object holds complete client and theme metadata
  const enrichedContent = {
    ...initialProjectState,
    theme: selectedTheme,
    templateId: selectedTheme,
    client_name: `${params.groomName || ''} & ${params.brideName || ''}`.trim(),
    client_phone: clientPhone?.trim() || null,
    client_email: clientEmail?.trim() || null,
    partner_notes: partnerNotes?.trim() || null,
    studio_badge: studioBadge || 'Studio Partner',
  };

  const finalSlug = publishedSlug || 
    `${(params.groomName || 'groom').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(params.brideName || 'bride').toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).slice(-4)}`;

  // Construct Primary Insert Payload
  let insertPayload: Record<string, any> = {
    user_id: partnerId,
    status: 'draft',
    is_locked: false,
    content: enrichedContent,
    published_url: finalSlug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Assign template_id (prefer UUID if resolved or if selectedTheme is already a UUID)
  if (templateUuid) {
    insertPayload.template_id = templateUuid;
  } else if (UUID_REGEX.test(selectedTheme)) {
    insertPayload.template_id = selectedTheme;
  }

  // Assign optional partner and client workflow columns
  if (partnerId && UUID_REGEX.test(partnerId)) {
    insertPayload.partner_id = partnerId;
  }
  if (clientEmail?.trim()) {
    insertPayload.client_email = clientEmail.trim();
  }
  if (clientPhone?.trim()) {
    insertPayload.client_phone = clientPhone.trim();
  }
  if (partnerNotes?.trim()) {
    insertPayload.partner_notes = partnerNotes.trim();
  }
  insertPayload.workflow_status = 'DRAFT';
  insertPayload.lifecycle_status = 'DRAFT';
  insertPayload.client_payment_status = 'NOT_TRACKED';
  insertPayload.studio_badge = studioBadge || 'Studio Partner';

  try {
    let result = await supabase
      .from('wedding_sites')
      .insert([insertPayload])
      .select()
      .single();

    // 🛡️ Adaptive PostgREST Schema Cache Column Resilience Loop:
    // If the deployed database table is missing any newly-added column (e.g. client_email, client_phone, workflow_status),
    // extract the failing column name and retry the insert cleanly up to 4 times.
    let retryAttempts = 0;
    const maxRetries = 4;
    const strippedColumns: string[] = [];

    while (result.error && retryAttempts < maxRetries) {
      const errMsg = result.error.message || '';
      const errDetails = result.error.details || '';
      const isSchemaCacheError = 
        result.error.code === 'PGRST204' || 
        errMsg.toLowerCase().includes('schema cache') ||
        errMsg.toLowerCase().includes('column') ||
        errDetails.toLowerCase().includes('column');

      if (!isSchemaCacheError) break;

      // Extract column name from error message (e.g. "Could not find the 'client_email' column...")
      const columnMatch = errMsg.match(/column\s+['"]?([^'"]+)['"]?/i) || errMsg.match(/['"]([^'"]+)['"]\s+column/i);
      const failingColumn = columnMatch ? columnMatch[1] : null;

      if (failingColumn && insertPayload[failingColumn] !== undefined) {
        console.warn(`[PartnerService] Column '${failingColumn}' not found in database schema cache. Stripping from top-level and retrying with JSONB storage...`);
        delete insertPayload[failingColumn];
        strippedColumns.push(failingColumn);
      } else {
        // Fallback: strip optional non-core columns sequentially if column name wasn't explicitly captured
        const optionalCols = ['client_email', 'client_phone', 'partner_notes', 'workflow_status', 'lifecycle_status', 'client_payment_status', 'studio_badge', 'partner_id'];
        const nextColToStrip = optionalCols.find((c) => insertPayload[c] !== undefined && !strippedColumns.includes(c));
        if (nextColToStrip) {
          delete insertPayload[nextColToStrip];
          strippedColumns.push(nextColToStrip);
        } else {
          break; // No more optional columns to strip
        }
      }

      retryAttempts++;
      result = await supabase
        .from('wedding_sites')
        .insert([insertPayload])
        .select()
        .single();
    }

    if (result.error) {
      console.error('[PartnerService] Technical Database Error Details:', {
        error: result.error,
        failedPayload: insertPayload,
        table: 'wedding_sites',
        partnerId,
        selectedTheme,
      });

      let userMsg = 'Unable to create the client invitation right now. Please try again.';
      const msg = result.error.message?.toLowerCase() || '';

      if (msg.includes('duplicate') || msg.includes('unique')) {
        userMsg = 'An invitation for this couple or URL already exists. Please adjust the names or date.';
      } else if (msg.includes('network') || msg.includes('failed to fetch')) {
        userMsg = 'Connection problem. Please check your internet connection and try again.';
      } else if (msg.includes('permission') || msg.includes('row-level security') || msg.includes('policy')) {
        userMsg = 'Permission denied. Please verify your Studio Partner account status.';
      } else if (msg.includes('schema') || msg.includes('column')) {
        userMsg = "We couldn't create this invitation because the database schema is syncing. Please try again.";
      }

      return {
        success: false,
        error: userMsg,
        technicalError: result.error,
      };
    }

    return {
      success: true,
      site: result.data,
    };
  } catch (err: any) {
    console.error('[PartnerService] Unexpected exception during invitation creation:', err);
    return {
      success: false,
      error: 'Connection problem. Please check your internet and try again.',
      technicalError: err,
    };
  }
};

