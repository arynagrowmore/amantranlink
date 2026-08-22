import { WeddingProjectState } from '../types/wedding';

// 🔒 Safe UTF-8 Base64 Encoder/Decoder for Unicode (Hindi, Gujarati, Emojis)
export const encodeInvitationData = (state: WeddingProjectState): string => {
  try {
    const minified = {
      t: state.theme,
      l: state.language,
      c: state.couple,
      e: state.events,
      f: state.family,
      m: {
        audioName: state.media.audioName,
        // Exclude raw blob to keep URL lightweight, include photo urls
        photoSlots: state.media.photoSlots,
      }
    };
    const jsonStr = JSON.stringify(minified);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    console.error('Failed to encode invitation state:', e);
    return '';
  }
};

export const decodeInvitationData = (encodedStr: string): Partial<WeddingProjectState> | null => {
  try {
    if (!encodedStr || !encodedStr.trim()) return null;
    const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
    const parsed = JSON.parse(jsonStr);
    return {
      theme: parsed.t,
      language: parsed.l,
      couple: parsed.c,
      events: parsed.e,
      family: parsed.f,
      media: {
        audioName: parsed.m?.audioName || 'FinalSong.mp3 (Default)',
        audioBlob: null,
        photoSlots: parsed.m?.photoSlots || {},
      },
    };
  } catch (e) {
    console.error('Failed to decode invitation state from URL:', e);
    return null;
  }
};

// 💾 Save Invitation to Registry & LocalStorage
export const savePublishedInvitation = (slug: string, state: WeddingProjectState) => {
  try {
    if (typeof window === 'undefined') return;
    const key = `SHAHI_INVITE_${slug.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.setItem('WEDDING_STUDIO_STATE', JSON.stringify(state));
    
    // Save to all-invitations index
    const indexStr = localStorage.getItem('SHAHI_INVITATIONS_INDEX') || '{}';
    const index = JSON.parse(indexStr);
    index[slug.toLowerCase()] = {
      theme: state.theme,
      couple: `${state.couple.groomEn} & ${state.couple.brideEn}`,
      date: state.couple.weddingDate,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('SHAHI_INVITATIONS_INDEX', JSON.stringify(index));
  } catch (e) {
    console.error('Failed to save published invitation:', e);
  }
};

// 📖 Resolve Invitation State with 100% Reliability
export const resolveInvitationState = (
  slug?: string,
  initialFallback?: WeddingProjectState
): WeddingProjectState | null => {
  if (typeof window === 'undefined') return initialFallback || null;

  try {
    // 1. Check URL query parameters: ?d=... or ?data=...
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('d') || urlParams.get('data');
    if (encodedData) {
      const decoded = decodeInvitationData(encodedData);
      if (decoded && decoded.couple) {
        return {
          viewMode: 'desktop',
          previewZoom: 1,
          ...initialFallback,
          ...decoded,
        } as WeddingProjectState;
      }
    }

    // 2. Check Specific Registered Slug (e.g. ?invite=dhruv-shreya or /#dhruv-shreya or /dhruv-shreya)
    const hashSlug = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : '';
    const cleanHash = (hashSlug && !['themes', 'features', 'workflow', 'pricing', 'testimonials', 'faq'].includes(hashSlug)) ? hashSlug : '';
    const pathSlug = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+|\/+$/g, '') : '';
    const cleanPath = (pathSlug && pathSlug !== 'index.html') ? pathSlug : '';

    const activeSlug = slug || urlParams.get('invite') || cleanHash || cleanPath;
    if (activeSlug) {
      const savedBySlug = localStorage.getItem(`SHAHI_INVITE_${activeSlug.toLowerCase()}`);
      if (savedBySlug) {
        return JSON.parse(savedBySlug);
      }
    }

    // 3. Check Current Studio State in LocalStorage
    const currentStudio = localStorage.getItem('WEDDING_STUDIO_STATE');
    if (currentStudio) {
      return JSON.parse(currentStudio);
    }
  } catch (e) {
    console.error('Error resolving invitation state:', e);
  }

  return initialFallback || null;
};
