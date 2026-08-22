import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WeddingProjectState, WeddingSite, ThemeId } from '../types/wedding';

export interface PublishSiteParams {
  userId: string;
  themeId: ThemeId;
  state: WeddingProjectState;
  customSlug?: string;
}

// 🚀 Publish Wedding Site into Supabase (status = 'published', is_locked = true, editing_status = 'locked')
export const publishWeddingSite = async (params: PublishSiteParams): Promise<{ success: boolean; site?: WeddingSite; error?: string }> => {
  const { userId, themeId, state, customSlug } = params;
  const slug = customSlug || `${(state.couple.groomEn || 'groom').toLowerCase().replace(/[^a-z0-9]/g, '')}-${(state.couple.brideEn || 'bride').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const publishedUrl = `/i/${slug}`;
  const now = new Date().toISOString();

  let siteUuid = `${themeId}-${Date.now().toString(36)}`;

  try {
    if (isSupabaseConfigured && userId) {
      // 1. Fetch template UUID from templates table
      const { data: tpl } = await supabase
        .from('templates')
        .select('id')
        .eq('slug', themeId)
        .single();

      const templateUuid = tpl?.id;

      if (templateUuid) {
        // 2. Check if user already has a site for this template
        const { data: existingSite } = await supabase
          .from('wedding_sites')
          .select('id')
          .eq('user_id', userId)
          .eq('template_id', templateUuid)
          .maybeSingle();

        if (existingSite?.id) {
          siteUuid = existingSite.id;
          await supabase
            .from('wedding_sites')
            .update({
              slug: slug,
              status: 'published',
              is_locked: true, // 🔒 Mandatory automatic re-lock on publish
              editing_status: 'locked',
              publication_status: 'published',
              payment_status: 'paid',
              content: state, // Live version for guests
              draft_content: state,
              published_url: publishedUrl,
              published_at: now,
              updated_at: now,
            })
            .eq('id', existingSite.id);
        } else {
          const { data: newSite, error: insErr } = await supabase
            .from('wedding_sites')
            .insert({
              user_id: userId,
              template_id: templateUuid,
              slug: slug,
              status: 'published',
              is_locked: true, // 🔒 Mandatory automatic re-lock on publish
              editing_status: 'locked',
              publication_status: 'published',
              payment_status: 'paid',
              content: state, // Live version for guests
              draft_content: state,
              published_url: publishedUrl,
              published_at: now,
              updated_at: now,
            })
            .select()
            .single();

          if (!insErr && newSite?.id) {
            siteUuid = newSite.id;
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('Error during Supabase publish sync:', err);
  }

  const siteRecord: WeddingSite = {
    id: siteUuid,
    siteId: siteUuid,
    uid: userId,
    templateId: themeId,
    slug,
    status: 'published',
    publicationStatus: 'published',
    isLocked: true, // 🔒 Mandatory automatic re-lock on publish
    editingStatus: 'locked',
    paymentStatus: 'paid',
    content: state,
    draftContent: state,
    publishedUrl,
    publishedAt: now,
    updatedAt: now,
  };

  // Also sync to local cache for instant UI availability
  try {
    const raw = localStorage.getItem('SHAHI_USER_SITES');
    const all = raw ? JSON.parse(raw) : {};
    if (!all[userId]) all[userId] = {};
    all[userId][themeId] = siteRecord;
    localStorage.setItem('SHAHI_USER_SITES', JSON.stringify(all));
  } catch (e) {}

  return {
    success: true,
    site: siteRecord,
  };
};

// 💾 Auto-save Wedding Site Draft to Supabase (wedding_sites.content)
export const saveWeddingSiteDraft = async (
  userId: string,
  themeId: ThemeId,
  state: WeddingProjectState
): Promise<{ success: boolean; siteId?: string; error?: string }> => {
  if (!userId) return { success: false, error: 'No user logged in' };

  try {
    if (isSupabaseConfigured) {
      const { data: tpl } = await supabase
        .from('templates')
        .select('id')
        .eq('slug', themeId)
        .single();

      const templateUuid = tpl?.id;
      const now = new Date().toISOString();

      if (templateUuid) {
        const { data: existingSite } = await supabase
          .from('wedding_sites')
          .select('id')
          .eq('user_id', userId)
          .eq('template_id', templateUuid)
          .maybeSingle();

        if (existingSite?.id) {
          await supabase
            .from('wedding_sites')
            .update({
              content: state,
              updated_at: now,
            })
            .eq('id', existingSite.id);
          return { success: true, siteId: existingSite.id };
        } else {
          const { data: newSite } = await supabase
            .from('wedding_sites')
            .insert({
              user_id: userId,
              template_id: templateUuid,
              status: 'draft',
              is_locked: false,
              content: state,
              updated_at: now,
            })
            .select()
            .single();

          return { success: true, siteId: newSite?.id };
        }
      }
    }
  } catch (err: any) {
    console.warn('Draft sync warning:', err);
  }

  return { success: true };
};

// 📖 Fetch Saved Wedding Site from Supabase
export const fetchUserWeddingSite = async (
  userId: string,
  themeId?: ThemeId
): Promise<{ success: boolean; site?: any; content?: WeddingProjectState; siteId?: string; error?: string }> => {
  if (!userId || !isSupabaseConfigured) return { success: false };

  try {
    let query = supabase
      .from('wedding_sites')
      .select('*, templates(slug)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (themeId) {
      const { data: tpl } = await supabase
        .from('templates')
        .select('id')
        .eq('slug', themeId)
        .single();

      if (tpl?.id) {
        query = query.eq('template_id', tpl.id);
      }
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (!error && data && data.content) {
      return {
        success: true,
        site: data,
        siteId: data.id,
        content: data.content as WeddingProjectState,
      };
    }
  } catch (e: any) {
    console.warn('Error fetching user wedding site:', e);
  }

  return { success: false };
};

export default {
  publishWeddingSite,
  saveWeddingSiteDraft,
  fetchUserWeddingSite,
};
