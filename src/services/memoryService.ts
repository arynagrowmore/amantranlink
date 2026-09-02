import { createClient } from '@supabase/supabase-js';
import { 
  WeddingMemory, 
  MemoryStatus, 
  MemoryMediaType, 
  MemorySummaryMetrics, 
  SubmitMemoryInput 
} from '../types/memories';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MEMORIES_LOCAL_KEY = 'amantranlink_memories_';

// 📸 Client-side image compression
export async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<{ compressedBlob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ compressedBlob: blob, dataUrl });
            } else {
              resolve({ compressedBlob: file, dataUrl });
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getLocalMemories(weddingSlug: string): WeddingMemory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEMORIES_LOCAL_KEY + weddingSlug.toLowerCase());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalMemories(weddingSlug: string, memories: WeddingMemory[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORIES_LOCAL_KEY + weddingSlug.toLowerCase(), JSON.stringify(memories));
  } catch (e) {}
}

/**
 * 💌 Submit a new Guest Memory / Blessing / Photo Drop
 */
export async function submitWeddingMemory(
  input: SubmitMemoryInput
): Promise<{ success: boolean; memory?: WeddingMemory; error?: string }> {
  try {
    const cleanSlug = (input.wedding_slug || '').trim().toLowerCase();
    const guestName = (input.guest_name || '').trim();
    const message = (input.message || '').trim();

    if (!guestName) {
      return { success: false, error: 'Please provide your name.' };
    }

    if (!input.media_file && !input.media_data_url && !message) {
      return { success: false, error: 'Please upload a photo or write your blessing message.' };
    }

    let mediaUrl: string | null = null;
    let mediaType: MemoryMediaType = 'text';

    // Process photo if attached
    if (input.media_file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(input.media_file.type)) {
        return { success: false, error: 'Unsupported file type. Please upload JPEG, PNG, or WEBP images.' };
      }

      if (input.media_file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'Image file exceeds the 10MB limit.' };
      }

      mediaType = 'photo';

      try {
        const { compressedBlob, dataUrl } = await compressImage(input.media_file);

        // Upload to Supabase Storage if bucket is available
        const ext = input.media_file.name.split('.').pop() || 'jpg';
        const fileName = `${cleanSlug}/memories/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('wedding-memories')
          .upload(fileName, compressedBlob, {
            contentType: input.media_file.type,
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('wedding-memories')
            .getPublicUrl(fileName);
          mediaUrl = publicUrlData?.publicUrl || dataUrl;
        } else {
          // Fallback to optimized data URL
          mediaUrl = dataUrl;
        }
      } catch (imgErr) {
        console.warn('Image processing fallback:', imgErr);
        mediaUrl = input.media_data_url || null;
      }
    } else if (input.media_data_url) {
      mediaType = 'photo';
      mediaUrl = input.media_data_url;
    }

    const payload: any = {
      wedding_slug: cleanSlug,
      guest_name: guestName,
      family_name: input.family_name ? input.family_name.trim() : null,
      message: message || null,
      media_url: mediaUrl,
      media_type: mediaType,
      status: 'pending', // Default to pending moderation
      is_featured: false,
      submitted_at: new Date().toISOString(),
    };

    if (input.wedding_site_id) {
      payload.wedding_site_id = input.wedding_site_id;
    }
    if (input.guest_id) {
      payload.guest_id = input.guest_id;
    }

    // Try inserting into public.wedding_memories
    const { data: dbMemory, error: dbErr } = await supabase
      .from('wedding_memories')
      .insert([payload])
      .select()
      .single();

    if (!dbErr && dbMemory) {
      return { success: true, memory: dbMemory };
    }

    // Resilient local persistence fallback
    const localMemory: WeddingMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      wedding_slug: cleanSlug,
      wedding_site_id: input.wedding_site_id,
      guest_id: input.guest_id,
      guest_name: guestName,
      family_name: input.family_name,
      message: message || null,
      media_url: mediaUrl,
      media_type: mediaType,
      status: 'pending',
      is_featured: false,
      submitted_at: new Date().toISOString(),
    };

    const existing = getLocalMemories(cleanSlug);
    saveLocalMemories(cleanSlug, [localMemory, ...existing]);

    return { success: true, memory: localMemory };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error submitting memory' };
  }
}

/**
 * 🌟 Fetch Approved Memories for Public Gallery & Wishes Wall
 */
export async function fetchPublicApprovedMemories(weddingSlug: string): Promise<WeddingMemory[]> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    const { data, error } = await supabase
      .from('wedding_memories')
      .select('*')
      .eq('wedding_slug', cleanSlug)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('submitted_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    // Fallback to local approved memories
    const local = getLocalMemories(cleanSlug);
    return local
      .filter((m) => m.status === 'approved')
      .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  } catch (err) {
    console.error('fetchPublicApprovedMemories error:', err);
    return [];
  }
}

/**
 * 🛡️ Fetch Host Memories for Couple & Studio Moderation Dashboard
 */
export async function fetchHostMemories(
  weddingSlug: string,
  statusFilter?: 'all' | 'pending' | 'approved' | 'rejected' | 'hidden' | 'featured'
): Promise<WeddingMemory[]> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    let query = supabase
      .from('wedding_memories')
      .select('*')
      .eq('wedding_slug', cleanSlug);

    if (statusFilter && statusFilter !== 'all' && statusFilter !== 'featured') {
      query = query.eq('status', statusFilter);
    } else if (statusFilter === 'featured') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      return data;
    }

    // Fallback to local
    const local = getLocalMemories(cleanSlug);
    if (!statusFilter || statusFilter === 'all') return local;
    if (statusFilter === 'featured') return local.filter(m => m.is_featured);
    return local.filter(m => m.status === statusFilter);
  } catch (err) {
    console.error('fetchHostMemories error:', err);
    return [];
  }
}

/**
 * ⚡ Moderate a Single Memory (Approve / Reject / Hide / Feature)
 */
export async function updateMemoryStatus(
  memoryId: string,
  weddingSlug: string,
  status: MemoryStatus,
  isFeatured?: boolean,
  moderatorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();

    const updates: any = {
      status,
      updated_at: nowIso,
    };

    if (isFeatured !== undefined) {
      updates.is_featured = isFeatured;
    }

    if (status === 'approved') {
      updates.approved_at = nowIso;
      updates.approved_by = moderatorId || null;
    } else if (status === 'rejected' || status === 'hidden') {
      updates.rejected_at = nowIso;
      updates.rejected_by = moderatorId || null;
    }

    const { error: dbErr } = await supabase
      .from('wedding_memories')
      .update(updates)
      .eq('id', memoryId);

    // Sync in local fallback
    const local = getLocalMemories(cleanSlug);
    const updated = local.map((m) => {
      if (m.id === memoryId) {
        return {
          ...m,
          status,
          is_featured: isFeatured !== undefined ? isFeatured : m.is_featured,
          approved_at: status === 'approved' ? nowIso : m.approved_at,
          rejected_at: status === 'rejected' || status === 'hidden' ? nowIso : m.rejected_at,
        };
      }
      return m;
    });
    saveLocalMemories(cleanSlug, updated);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * ⚡ Bulk Moderate Memories
 */
export async function bulkUpdateMemoryStatus(
  memoryIds: string[],
  weddingSlug: string,
  status: MemoryStatus,
  moderatorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();

    const updates: any = {
      status,
      updated_at: nowIso,
    };

    if (status === 'approved') {
      updates.approved_at = nowIso;
      updates.approved_by = moderatorId || null;
    } else if (status === 'rejected' || status === 'hidden') {
      updates.rejected_at = nowIso;
      updates.rejected_by = moderatorId || null;
    }

    await supabase
      .from('wedding_memories')
      .update(updates)
      .in('id', memoryIds);

    const local = getLocalMemories(cleanSlug);
    const updated = local.map((m) => {
      if (memoryIds.includes(m.id)) {
        return {
          ...m,
          status,
          approved_at: status === 'approved' ? nowIso : m.approved_at,
          rejected_at: status === 'rejected' ? nowIso : m.rejected_at,
        };
      }
      return m;
    });
    saveLocalMemories(cleanSlug, updated);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 🗑️ Permanently Delete a Memory & Clean up storage object
 */
export async function deleteWeddingMemory(
  memoryId: string,
  weddingSlug: string,
  mediaUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    // 1. Delete from database
    await supabase
      .from('wedding_memories')
      .delete()
      .eq('id', memoryId);

    // 2. Remove file from Supabase storage if applicable
    if (mediaUrl && mediaUrl.includes('/wedding-memories/')) {
      const storagePath = mediaUrl.split('/wedding-memories/')[1];
      if (storagePath) {
        await supabase.storage.from('wedding-memories').remove([storagePath]);
      }
    }

    // 3. Clean up local fallback
    const local = getLocalMemories(cleanSlug);
    saveLocalMemories(cleanSlug, local.filter(m => m.id !== memoryId));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📊 Compute Memory Operational Metrics
 */
export function calculateMemoryMetrics(memories: WeddingMemory[]): MemorySummaryMetrics {
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let photos = 0;
  let wishes = 0;
  let featured = 0;

  memories.forEach((m) => {
    if (m.status === 'pending') pending++;
    else if (m.status === 'approved') approved++;
    else if (m.status === 'rejected' || m.status === 'hidden') rejected++;

    if (m.media_type === 'photo' || Boolean(m.media_url)) photos++;
    if (m.message && m.message.trim().length > 0) wishes++;
    if (m.is_featured) featured++;
  });

  return {
    totalSubmissions: memories.length,
    pendingCount: pending,
    approvedCount: approved,
    rejectedCount: rejected,
    totalPhotosCount: photos,
    totalWishesCount: wishes,
    featuredCount: featured,
  };
}
