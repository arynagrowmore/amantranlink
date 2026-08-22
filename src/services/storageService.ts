import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BUCKET_NAME = 'wedding-media';

// Helper to compress images client-side before upload for blazing-fast mobile performance
export const compressImage = async (file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve) => {
    // If SVG or GIF, don't recompress
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/webp',
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// 1. Helper to extract Storage path from a public Supabase URL or raw path
export const extractStoragePathFromUrl = (urlOrPath: string): string | null => {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  
  // If it's a data URL or blob URL, it is purely local
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

  // 1. Check for standard Supabase Public Object URL
  const publicMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const pubIdx = trimmed.indexOf(publicMarker);
  if (pubIdx !== -1) {
    return decodeURIComponent(trimmed.substring(pubIdx + publicMarker.length));
  }

  // 2. Check for Signed Object URL
  const signMarker = `/storage/v1/object/sign/${BUCKET_NAME}/`;
  const signIdx = trimmed.indexOf(signMarker);
  if (signIdx !== -1) {
    const raw = trimmed.substring(signIdx + signMarker.length).split('?')[0];
    return decodeURIComponent(raw);
  }

  // 3. If raw relative path was stored (e.g., "userId/photos/123.webp")
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return trimmed;
  }

  return null;
};

// 2. Upload Photo to Supabase Storage (WebP Compressed)
export const uploadWeddingPhoto = async (
  file: File,
  userId: string,
  folder = 'photos'
): Promise<{ url: string; path?: string; error?: string }> => {
  try {
    if (!isSupabaseConfigured) {
      // Local fallback for instant preview
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ url: e.target?.result as string });
        reader.readAsDataURL(file);
      });
    }

    // Compress image to WebP for high quality & small size
    const compressedBlob = await compressImage(file);
    const cleanExt = file.name.split('.').pop() || 'webp';
    const fileName = `${userId}/${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedBlob, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/webp',
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { 
      url: publicData.publicUrl,
      path: data.path 
    };
  } catch (err: any) {
    console.error('Photo Upload Error:', err);
    // Graceful fallback to local Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target?.result as string, error: err?.message });
      reader.readAsDataURL(file);
    });
  }
};

// 3. Delete Photo from Supabase Storage
export const deleteWeddingPhoto = async (
  pathOrUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!pathOrUrl) return { success: true };
    if (!isSupabaseConfigured) return { success: true };

    const storagePath = extractStoragePathFromUrl(pathOrUrl);
    if (!storagePath) {
      // Local data URI or template static asset, nothing to remove in cloud storage
      return { success: true };
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Supabase Storage File Deletion Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteWeddingPhoto Exception:', err);
    return { success: false, error: err?.message || 'Failed to delete file from storage' };
  }
};

// 4. Batch Delete Multiple Photos
export const deleteWeddingPhotos = async (
  pathsOrUrls: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!pathsOrUrls || pathsOrUrls.length === 0) return { success: true };
    if (!isSupabaseConfigured) return { success: true };

    const validPaths = pathsOrUrls
      .map(extractStoragePathFromUrl)
      .filter((p): p is string => Boolean(p));

    if (validPaths.length === 0) return { success: true };

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(validPaths);

    if (error) {
      console.error('Supabase Storage Batch Deletion Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteWeddingPhotos Exception:', err);
    return { success: false, error: err?.message || 'Failed to batch delete files from storage' };
  }
};

// 5. Upload Custom Wedding Audio/Music (Shehnai, Romantic MP3, etc.)
export const uploadWeddingMusic = async (
  file: File,
  userId: string
): Promise<{ url: string; path?: string; error?: string }> => {
  try {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ url: e.target?.result as string });
        reader.readAsDataURL(file);
      });
    }

    const cleanExt = file.name.split('.').pop() || 'mp3';
    const fileName = `${userId}/audio/${Date.now()}_music.${cleanExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'audio/mpeg',
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { 
      url: publicData.publicUrl,
      path: data.path 
    };
  } catch (err: any) {
    console.error('Audio Upload Error:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target?.result as string, error: err?.message });
      reader.readAsDataURL(file);
    });
  }
};

// 6. Delete Audio from Supabase Storage
export const deleteWeddingMusic = async (
  pathOrUrl: string
): Promise<{ success: boolean; error?: string }> => {
  return deleteWeddingPhoto(pathOrUrl);
};

