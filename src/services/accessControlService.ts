import { ThemeId, WeddingProjectState, WeddingSite, InvitationEditingStatus, InvitationPublicationStatus, InvitationPaymentStatus } from '../types/wedding';
import { getUserActiveSite, saveWeddingSite, getUserPurchases } from './razorpayClient';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP } from '../config/pricing';

export interface InvitationAccessState {
  paymentStatus: InvitationPaymentStatus;
  editingStatus: InvitationEditingStatus;
  publicationStatus: InvitationPublicationStatus;
  isEditingAllowed: boolean;
  isPublicLive: boolean;
  publishedUrl?: string;
  slug?: string;
  siteId?: string;
  lockReason: 'unpaid' | 'published_locked' | 'none';
}

const ACCESS_CONTROL_STORAGE_KEY = 'SHAHI_INVITATION_ACCESS_STATES';

// 🔍 Helper to read access cache
const getCachedAccessStates = (): Record<string, Record<string, InvitationAccessState>> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACCESS_CONTROL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// 💾 Helper to write access cache
const setCachedAccessState = (uid: string, templateId: ThemeId, state: InvitationAccessState) => {
  if (typeof window === 'undefined') return;
  try {
    const all = getCachedAccessStates();
    if (!all[uid]) all[uid] = {};
    all[uid][templateId] = state;
    localStorage.setItem(ACCESS_CONTROL_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
};

/**
 * 🔒 Single Source of Truth for Invitation Access State
 * Computes exact state based on purchases, wedding site records, and published status
 */
export const getInvitationAccessState = (
  uid?: string | null,
  templateId?: ThemeId | null,
  providedSite?: WeddingSite | null
): InvitationAccessState => {
  if (!uid || !templateId) {
    return {
      paymentStatus: 'unpaid',
      editingStatus: 'locked',
      publicationStatus: 'draft',
      isEditingAllowed: false,
      isPublicLive: false,
      lockReason: 'unpaid',
    };
  }

  // 1. Check cached access state
  const cached = getCachedAccessStates()[uid]?.[templateId];

  // 2. Fetch site record
  const site = providedSite || getUserActiveSite(uid, templateId);

  // 3. Fetch purchase history
  const purchases = getUserPurchases(uid);
  const purchase = purchases[templateId];

  const hasPaid = Boolean(purchase && (purchase.paymentStatus === 'PAID' || purchase.paymentStatus === 'SUCCESS' || purchase.status === 'unlocked'));
  const isPublished = Boolean(site && (site.status === 'published' || site.publicationStatus === 'published'));
  
  // If site has explicit editingStatus, prioritize it
  let editingStatus: InvitationEditingStatus = 'locked';
  if (site?.editingStatus) {
    editingStatus = site.editingStatus;
  } else if (cached?.editingStatus) {
    editingStatus = cached.editingStatus;
  } else if (isPublished) {
    // If published and not explicitly unlocked, it is locked!
    editingStatus = 'locked';
  } else if (hasPaid) {
    // Paid and not yet published = unlocked for editing
    editingStatus = 'unlocked';
  } else {
    // Not paid = locked
    editingStatus = 'locked';
  }

  const publicationStatus: InvitationPublicationStatus = isPublished ? 'published' : 'draft';
  const paymentStatus: InvitationPaymentStatus = hasPaid ? 'paid' : 'unpaid';
  const isEditingAllowed = editingStatus === 'unlocked';
  const isPublicLive = isPublished;

  let lockReason: 'unpaid' | 'published_locked' | 'none' = 'none';
  if (!isEditingAllowed) {
    lockReason = isPublished ? 'published_locked' : 'unpaid';
  }

  const computedState: InvitationAccessState = {
    paymentStatus,
    editingStatus,
    publicationStatus,
    isEditingAllowed,
    isPublicLive,
    publishedUrl: site?.publishedUrl,
    slug: site?.slug,
    siteId: site?.siteId || site?.id,
    lockReason,
  };

  // Sync cache
  setCachedAccessState(uid, templateId, computedState);

  return computedState;
};

/**
 * 🔓 Unlock Invitation for Editing (Called after verified payment)
 */
export const unlockInvitationForEditing = (
  uid: string,
  templateId: ThemeId,
  siteId?: string
): InvitationAccessState => {
  const existingSite = getUserActiveSite(uid, templateId);
  const now = new Date().toISOString();

  const updatedSite: WeddingSite = existingSite
    ? {
        ...existingSite,
        isLocked: false,
        editingStatus: 'unlocked',
        paymentStatus: 'paid',
        unlockedAt: now,
        updatedAt: now,
      }
    : {
        siteId: siteId || `site_${uid}_${templateId}_${Date.now()}`,
        uid,
        templateId,
        status: 'draft',
        isLocked: false,
        editingStatus: 'unlocked',
        publicationStatus: 'draft',
        paymentStatus: 'paid',
        content: {} as any,
        unlockedAt: now,
        updatedAt: now,
      };

  saveWeddingSite(updatedSite);

  const newState: InvitationAccessState = {
    paymentStatus: 'paid',
    editingStatus: 'unlocked',
    publicationStatus: updatedSite.status === 'published' ? 'published' : 'draft',
    isEditingAllowed: true,
    isPublicLive: updatedSite.status === 'published',
    publishedUrl: updatedSite.publishedUrl,
    slug: updatedSite.slug,
    siteId: updatedSite.siteId,
    lockReason: 'none',
  };

  setCachedAccessState(uid, templateId, newState);

  // Sync to Supabase in background
  if (isSupabaseConfigured && uid) {
    try {
      supabase
        .from('wedding_sites')
        .update({
          is_locked: false,
          editing_status: 'unlocked',
          payment_status: 'paid',
          unlocked_at: now,
          updated_at: now,
        })
        .eq('user_id', uid)
        .then(() => {});
    } catch (e) {}
  }

  return newState;
};

/**
 * 🔒 Lock Invitation on Publish (Mandatory automatic re-lock)
 */
export const lockInvitationOnPublish = (
  uid: string,
  templateId: ThemeId,
  publishedState: WeddingProjectState,
  slug: string
): { site: WeddingSite; accessState: InvitationAccessState } => {
  const now = new Date().toISOString();
  const existingSite = getUserActiveSite(uid, templateId);
  const siteId = existingSite?.siteId || `site_${uid}_${templateId}_${Date.now()}`;
  const publishedUrl = `/i/${slug}`;

  const publishedSite: WeddingSite = {
    ...(existingSite || {}),
    id: existingSite?.id || siteId,
    siteId,
    uid,
    templateId,
    slug,
    status: 'published',
    publicationStatus: 'published',
    isLocked: true, // 🔒 Mandatory re-lock!
    editingStatus: 'locked', // 🔒 Mandatory re-lock!
    paymentStatus: 'paid',
    content: publishedState, // Published version is now live
    draftContent: publishedState,
    publishedUrl,
    publishedAt: existingSite?.publishedAt || now,
    updatedAt: now,
  };

  saveWeddingSite(publishedSite);

  const accessState: InvitationAccessState = {
    paymentStatus: 'paid',
    editingStatus: 'locked',
    publicationStatus: 'published',
    isEditingAllowed: false,
    isPublicLive: true,
    publishedUrl,
    slug,
    siteId,
    lockReason: 'published_locked',
  };

  setCachedAccessState(uid, templateId, accessState);

  return { site: publishedSite, accessState };
};
