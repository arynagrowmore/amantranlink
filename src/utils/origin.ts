/**
 * 🏰 AmantranLink Dynamic Application Origin Resolver
 * 
 * Priority:
 * 1. VITE_PUBLIC_APP_URL environment variable (if configured)
 * 2. window.location.origin (current runtime origin)
 * 3. Fallback to production domain
 */

export const getCurrentAppOrigin = (): string => {
  // 1. Check Vite environment variable
  try {
    const viteEnvUrl = (import.meta as any)?.env?.VITE_PUBLIC_APP_URL;
    if (viteEnvUrl && typeof viteEnvUrl === 'string' && viteEnvUrl.trim()) {
      return viteEnvUrl.trim().replace(/\/+$/, '');
    }
  } catch {}

  // 2. Runtime browser origin (works on localhost, Netlify, custom domains)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 3. Process environment variable fallback
  try {
    if (typeof process !== 'undefined') {
      const procUrl = process.env?.VITE_PUBLIC_APP_URL || process.env?.VITE_APP_URL;
      if (procUrl && typeof procUrl === 'string' && procUrl.trim()) {
        return procUrl.trim().replace(/\/+$/, '');
      }
    }
  } catch {}

  return 'https://amantranlink.in';
};

export const getAppOrigin = getCurrentAppOrigin;

export const getAuthCallbackUrl = (): string => {
  const base = getCurrentAppOrigin();
  // Return standard auth callback route
  return `${base}/auth/callback`;
};

export const getPasswordResetUrl = (): string => {
  return `${getCurrentAppOrigin()}/reset-password`;
};

export default getCurrentAppOrigin;
