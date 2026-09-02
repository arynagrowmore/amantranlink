/**
 * 👑 AMANTRANLINK CENTRALIZED API URL RESOLVER
 * Production-grade resolver for all backend API communications (Payments, Auth, Health).
 *
 * Priority Rules:
 * 1. import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL (normalized without trailing slash)
 * 2. In browser environments (production or reverse-proxy same-origin deployment), use relative same-origin path ("")
 * 3. Local development fallback: http://localhost:5000 ONLY when import.meta.env.DEV is true
 * 4. In production mode (!import.meta.env.DEV), NEVER silently fallback to localhost.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // In development mode (Vite dev server on port 3000), if backend is running on port 5000:
  const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV);
  if (isDev) {
    return 'http://localhost:5000';
  }

  // In production: Use same-origin relative path ("")
  return '';
};

/**
 * Resolves a full API URL for a given relative endpoint path.
 * Normalizes leading/trailing slashes to ensure no double slashes like `//api`.
 */
export const resolveApiUrl = (endpointPath: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  if (!base) {
    return cleanPath;
  }

  return `${base}${cleanPath}`;
};

/**
 * Checks whether production API backend is configured or running on same-origin.
 */
export const isProductionApiConfigured = (): boolean => {
  const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV);
  if (isDev) return true;

  const envUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL);

  // In production, either explicit backend URL is set, or running in browser window (same-origin)
  return Boolean(envUrl || typeof window !== 'undefined');
};
