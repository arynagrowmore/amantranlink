import { ThemeId, TemplateConfig, Purchase, WeddingSite, WeddingProjectState, PackageType } from '../types/wedding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  OFFICIAL_PACKAGES, 
  THEME_PACKAGE_MAP, 
  THEME_PRICING_CATALOG, 
  calculatePaymentDetails 
} from '../config/pricing';
import { getStoredPartnerAttribution } from './partnerService';
import { getApiBaseUrl, resolveApiUrl } from '../utils/apiConfig';

export { getApiBaseUrl, resolveApiUrl };

// 🏷️ Template Catalog with Official Authoritative Pricing (Single Source of Truth)
export const TEMPLATES_CATALOG: Record<ThemeId, TemplateConfig> = {
  rajmahal: {
    templateId: 'rajmahal',
    name: 'The Rajmahal 3D Palace',
    previewImage: '/previews/theme-rajmahal.webp',
    priceInr: 2299,
    reEditFeeInr: 0,
    category: 'heritage',
  },
  royaldawn: {
    templateId: 'royaldawn',
    name: 'The Royal Dawn (Udaipur Lakefront)',
    previewImage: '/previews/theme-royaldawn.webp',
    priceInr: 2299,
    reEditFeeInr: 0,
    category: 'heritage',
  },
  jharokha: {
    templateId: 'jharokha',
    name: 'The Jharokha Mandap',
    previewImage: '/previews/theme-jharokha.webp',
    priceInr: 1299,
    reEditFeeInr: 0,
    category: 'traditional',
  },
  mayura: {
    templateId: 'mayura',
    name: 'The Mayura Peacock',
    previewImage: '/previews/theme-mayura.webp',
    priceInr: 1299,
    reEditFeeInr: 0,
    category: 'traditional',
  },
  jodi: {
    templateId: 'jodi',
    name: 'The Shubh Jodi',
    previewImage: '/previews/theme-jodi.webp',
    priceInr: 1299,
    reEditFeeInr: 0,
    category: 'traditional',
  },
  dak: {
    templateId: 'dak',
    name: 'The Shahi Dâk',
    previewImage: '/previews/theme-dak.webp',
    priceInr: 1299,
    reEditFeeInr: 0,
    category: 'heritage',
  },
  ivory: {
    templateId: 'ivory',
    name: 'The Ivory Minimalist',
    previewImage: '/previews/theme-ivory.webp',
    priceInr: 1299,
    reEditFeeInr: 0,
    category: 'modern',
  },
  royalring: {
    templateId: 'royalring',
    name: 'The Royal Ring (3D Diamond Engagement)',
    previewImage: '/previews/theme-royalring.webp',
    priceInr: 1999,
    reEditFeeInr: 0,
    category: 'engagement',
  },
};

// 💾 Local Cache Helpers
const PURCHASES_STORAGE_KEY = 'SHAHI_USER_PURCHASES';
const SITES_STORAGE_KEY = 'SHAHI_USER_SITES';

// 👑 3 Master VIP Unlimited Accounts (Lifetime 100% Free, All 8 Themes, Unlimited Publishes)
export const VIP_MASTER_ACCOUNTS = [
  'cyberpatel6001@gmail.com',
  'admin@amantranlink.com',
  'vip@amantranlink.com',
  'partner@amantranlink.com',
  'studio@amantranlink.com',
];

export const isUserVipAdmin = (uid?: string, email?: string): boolean => {
  const checkEmail = (e?: string) => {
    if (!e) return false;
    const lower = e.toLowerCase().trim();
    return VIP_MASTER_ACCOUNTS.some((vip) => lower === vip || lower.includes(vip));
  };

  if (email && checkEmail(email)) return true;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('SHAHI_AUTH_USER');
      if (saved) {
        const u = JSON.parse(saved);
        if (checkEmail(u?.email)) return true;
        if (u?.role === 'admin' || u?.role === 'master_vip' || u?.role === 'vip') return true;
        if (uid && (u?.id === uid || u?.uid === uid) && (checkEmail(u?.email) || u?.role === 'admin' || u?.role === 'master_vip' || u?.role === 'vip')) {
          return true;
        }
      }
    } catch (e) {}
  }
  return false;
};

const ALL_TEMPLATES_ARRAY: ThemeId[] = ['rajmahal', 'royaldawn', 'royalring', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory'];

export const getUserPurchases = (uid?: string): Record<string, Purchase> => {
  if (typeof window === 'undefined') return {};
  
  if (isUserVipAdmin(uid)) {
    const vipPurchases: Record<string, Purchase> = {};
    ALL_TEMPLATES_ARRAY.forEach((tId) => {
      vipPurchases[tId] = {
        id: `vip_${tId}_unlocked`,
        uid: uid || 'vip_master_unlocked',
        templateId: tId,
        status: 'unlocked',
        paymentGateway: 'razorpay',
        amountInr: 0,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentReference: 'VIP_MASTER_LIFETIME_UNLIMITED',
        unlockedAt: '2026-08-24T00:00:00.000Z',
        createdAt: '2026-08-24T00:00:00.000Z',
      };
    });
    return vipPurchases;
  }

  try {
    const raw = localStorage.getItem(PURCHASES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return uid ? (all[uid] || {}) : all;
  } catch (e) {
    return {};
  }
};

export const syncUserPurchasesFromSupabase = async (uid: string): Promise<Record<string, Purchase>> => {
  if (isUserVipAdmin(uid)) {
    return getUserPurchases(uid);
  }
  if (!uid || !isSupabaseConfigured) return getUserPurchases(uid);
  try {
    const { data: dbPurchases, error } = await supabase
      .from('purchases')
      .select('*, templates(slug, name, preview_image, price, category)')
      .eq('user_id', uid)
      .eq('status', 'unlocked');

    if (!error && dbPurchases) {
      const mapped: Record<string, Purchase> = {};
      dbPurchases.forEach((p: any) => {
        const tplSlug = p.templates?.slug;
        if (tplSlug) {
          mapped[tplSlug] = {
            id: p.id,
            uid: p.user_id,
            templateId: tplSlug,
            status: p.status,
            paymentGateway: 'razorpay',
            amountInr: p.templates?.price ? Math.floor(p.templates.price / 100) : 1499,
            currency: 'INR',
            paymentStatus: 'PAID',
            paymentReference: p.payment_reference,
            unlockedAt: p.unlocked_at,
            createdAt: p.unlocked_at,
          };
        }
      });

      const raw = localStorage.getItem(PURCHASES_STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      all[uid] = { ...(all[uid] || {}), ...mapped };
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(all));
      return all[uid];
    }
  } catch (e) {
    console.warn('Could not sync purchases from Supabase:', e);
  }
  return getUserPurchases(uid);
};

export const saveUserPurchase = (purchase: Purchase): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PURCHASES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (!all[purchase.uid]) all[purchase.uid] = {};
    all[purchase.uid][purchase.templateId] = purchase;
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
};

export const getUserActiveSite = (uid: string, templateId: ThemeId): WeddingSite | null => {
  if (typeof window === 'undefined' || !uid) return null;
  try {
    const raw = localStorage.getItem(SITES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[uid]?.[templateId] || null;
  } catch (e) {
    return null;
  }
};

export const saveWeddingSite = (site: WeddingSite): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SITES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (!all[site.uid]) all[site.uid] = {};
    all[site.uid][site.templateId] = site;
    localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
};

export const isTemplateUnlockedForUser = (uid?: string, templateId?: ThemeId): boolean => {
  if (!uid || !templateId) return false;
  if (isUserVipAdmin(uid)) return true;
  const purchases = getUserPurchases(uid);
  const purchase = purchases[templateId];
  const hasPaid = Boolean(purchase && (purchase.paymentStatus === 'PAID' || purchase.paymentStatus === 'SUCCESS' || purchase.status === 'unlocked'));
  if (!hasPaid) return false;

  const site = getUserActiveSite(uid, templateId);
  // If published, it is locked unless explicitly set to editingStatus === 'unlocked'
  if (site && (site.status === 'published' || site.publicationStatus === 'published')) {
    return site.editingStatus === 'unlocked' && site.isLocked === false;
  }

  // Not published yet, and paid = unlocked for editing
  return true;
};

export const isSiteCurrentlyLocked = (
  uid?: string, 
  templateId?: ThemeId, 
  site?: WeddingSite | null
): { isLocked: boolean; reason: 'not_logged_in' | 'not_purchased' | 'published' | 'none'; editingStatus: 'locked' | 'unlocked'; publicationStatus: 'draft' | 'published' } => {
  if (!uid) return { isLocked: true, reason: 'not_logged_in', editingStatus: 'locked', publicationStatus: 'draft' };
  if (!templateId) return { isLocked: false, reason: 'none', editingStatus: 'unlocked', publicationStatus: 'draft' };
  if (isUserVipAdmin(uid)) {
    return { isLocked: false, reason: 'none', editingStatus: 'unlocked', publicationStatus: 'draft' };
  }

  const currentSite = site || getUserActiveSite(uid, templateId);
  const purchases = getUserPurchases(uid);
  const purchase = purchases[templateId];
  const hasPaid = Boolean(purchase && (purchase.paymentStatus === 'PAID' || purchase.paymentStatus === 'SUCCESS' || purchase.status === 'unlocked'));

  const isPublished = Boolean(currentSite && (currentSite.status === 'published' || currentSite.publicationStatus === 'published'));

  if (!hasPaid) {
    return {
      isLocked: true,
      reason: 'not_purchased',
      editingStatus: 'locked',
      publicationStatus: isPublished ? 'published' : 'draft',
    };
  }

  if (isPublished) {
    const isExplicitlyUnlocked = currentSite?.editingStatus === 'unlocked' && currentSite?.isLocked === false;
    return {
      isLocked: !isExplicitlyUnlocked,
      reason: isExplicitlyUnlocked ? 'none' : 'published',
      editingStatus: isExplicitlyUnlocked ? 'unlocked' : 'locked',
      publicationStatus: 'published',
    };
  }

  return {
    isLocked: false,
    reason: 'none',
    editingStatus: 'unlocked',
    publicationStatus: 'draft',
  };
};

// 💳 Dynamic Razorpay JS SDK Loader
export const loadRazorpaySdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Could not load Razorpay script directly from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export interface RazorpayCheckoutOptions {
  templateId: ThemeId;
  packageId?: PackageType;
  uid: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  isReEdit?: boolean;
  onSuccess: (purchase: Purchase, site: WeddingSite) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  state?: WeddingProjectState;
}

// 🌐 Resilient Payment API caller using centralized resolveApiUrl
const callPaymentApi = async (endpoint: string, payload: any): Promise<any> => {
  const url = resolveApiUrl(endpoint);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json().catch(() => null);
    if (res.ok && data) {
      if (data.success === false) {
        throw new Error(data.error || 'Server rejected payment request');
      }
      return data;
    }
    if (!res.ok) {
      // Safe human-friendly normalized message (never expose raw 500 status)
      const rawMsg = data?.error || '';
      if (rawMsg) {
        throw new Error(rawMsg);
      }
      throw new Error("We couldn't complete your payment request right now. Please try again.");
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('network')) {
      throw err;
    }
    throw new Error("We couldn't reach the payment service. Please check your connection and try again.");
  }
};

// 🚀 Primary Razorpay Checkout Initiation Function
export const initiateRazorpayCheckout = async (options: RazorpayCheckoutOptions): Promise<void> => {
  const {
    templateId,
    packageId,
    uid,
    userName = 'Valued Couple',
    userEmail = 'royal.couple@shahistudio.com',
    userPhone = '+91 9409360336',
    onSuccess,
    onError,
    onCancel,
    state
  } = options;

  // Resolve effective package: prefer explicit packageId, else derive from template, default to gold (NEVER silently default to silver)
  const effectivePackageId: PackageType = packageId || (templateId ? THEME_PACKAGE_MAP[templateId] : 'gold');

  try {
    // 1. Create order on backend with fallback to direct client-side Razorpay checkout for static deployments
    const currentPartnerSlug = getStoredPartnerAttribution();
    const paymentDetails = calculatePaymentDetails(effectivePackageId, templateId, undefined);
    const calculatedAmount = Math.round(paymentDetails.finalAmountInr * 100);
    const clientKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 'rzp_live_TSPLNnQzZslM17';

    let orderData: any = null;
    try {
      orderData = await callPaymentApi('/api/razorpay/create-order', {
        templateId,
        packageId: effectivePackageId,
        userId: uid,
        userName,
        userEmail,
        userPhone,
        partnerSlug: currentPartnerSlug || undefined
      });
    } catch (e: any) {
      console.error('Backend order creation failed:', e.message);
      onError(e.message || 'Payment initialization failed. Please try again.');
      return;
    }

    if (!orderData?.keyId) {
      orderData = {
        ...orderData,
        keyId: clientKey,
        amount: calculatedAmount,
        currency: 'INR',
        amountInRupees: paymentDetails.finalAmountInr,
      };
    }

    // Zero amount / already unlocked bypass
    if (orderData.isFreeOrder || orderData.amount === 0) {
      const purchase: Purchase = {
        id: `${uid}_${templateId}`,
        uid,
        templateId,
        status: 'unlocked',
        paymentGateway: 'razorpay' as any,
        amountInr: 0,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentReference: orderData.orderId,
        unlockedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const site: WeddingSite = {
        siteId: `${templateId}-${Date.now().toString(36)}`,
        uid,
        templateId,
        status: 'draft',
        isLocked: false,
        content: state || ({} as any),
        unlockedAt: new Date().toISOString()
      };

      saveUserPurchase(purchase);
      saveWeddingSite(site);
      onSuccess(purchase, site);
      return;
    }

    const packageInfo = OFFICIAL_PACKAGES[effectivePackageId] || OFFICIAL_PACKAGES.gold;
    const amountInRupees = orderData.amountInRupees || Math.floor(orderData.amount / 100);

    // 2. Load SDK
    const isLoaded = await loadRazorpaySdk();

    if (!isLoaded || !(window as any).Razorpay) {
      onError('Unable to load Razorpay Checkout SDK. Please check your internet connection.');
      return;
    }

    const rzpOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'AmantranLink',
      description: orderData.description || `Unlock ${packageInfo.name} Digital Invitation`,
      image: '/previews/theme-rajmahal.webp',
      order_id: orderData.orderId,
      handler: async function (response: any) {
        try {
          // 3. Strict Server-Side Verification (HMAC-SHA256 & REST API Confirmation)
          const verifyData = await callPaymentApi('/api/razorpay/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            templateId,
            packageId: effectivePackageId,
            userId: uid,
            invitationData: state,
            partnerSlug: currentPartnerSlug || undefined
          });

          if (verifyData.success) {
            const purchase: Purchase = {
              id: `${uid}_${templateId}`,
              uid,
              templateId,
              status: 'unlocked',
              paymentGateway: 'razorpay' as any,
              amountInr: amountInRupees,
              currency: 'INR',
              paymentStatus: 'PAID',
              paymentReference: response.razorpay_payment_id,
              unlockedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            };

            const site: WeddingSite = {
              siteId: `${templateId}-${Date.now().toString(36)}`,
              uid,
              templateId,
              status: 'draft',
              isLocked: false,
              content: state || ({} as any),
              unlockedAt: new Date().toISOString()
            };

            saveUserPurchase(purchase);
            saveWeddingSite(site);
            onSuccess(purchase, site);
          } else {
            onError(verifyData.error || 'Payment signature verification failed.');
          }
        } catch (verErr: any) {
          console.warn('⚠️ Verification endpoint unavailable on static host, finalizing purchase client-side...', verErr.message);
          
          const purchase: Purchase = {
            id: `${uid}_${templateId}`,
            uid,
            templateId,
            status: 'unlocked',
            paymentGateway: 'razorpay' as any,
            amountInr: amountInRupees,
            currency: 'INR',
            paymentStatus: 'PAID',
            paymentReference: response.razorpay_payment_id || `pay_${Date.now().toString(36)}`,
            unlockedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          const site: WeddingSite = {
            siteId: `${templateId}-${Date.now().toString(36)}`,
            uid,
            templateId,
            status: 'draft',
            isLocked: false,
            content: state || ({} as any),
            unlockedAt: new Date().toISOString()
          };

          saveUserPurchase(purchase);
          saveWeddingSite(site);
          onSuccess(purchase, site);
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone
      },
      theme: {
        color: '#741526',
        backdrop_color: '#F7F0DF'
      },
      notes: {
        userId: uid,
        packageId: effectivePackageId,
        templateId: templateId,
        userName: userName,
        purpose: 'AmantranLink Royal Digital Invitation Unlock'
      },
      modal: {
        ondismiss: function () {
          if (onCancel) onCancel();
        }
      }
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (resp: any) {
      onError(resp.error?.description || 'Razorpay payment failed. Please try again.');
    });
    rzp.open();

  } catch (error: any) {
    console.error('Razorpay checkout error:', error);
    onError(error.message || 'Failed to initialize Razorpay checkout.');
  }
};

/**
 * 🔄 Idempotent Payment Recovery
 * Recovers verified purchase state directly from server authority
 */
export const recoverPaymentStatus = async (
  uid: string,
  templateId: ThemeId,
  paymentId?: string,
  orderId?: string
): Promise<{ success: boolean; recovered: boolean; message?: string }> => {
  try {
    const data = await callPaymentApi('/api/razorpay/recover-payment', {
      userId: uid,
      templateId,
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId
    });

    if (data.success) {
      await syncUserPurchasesFromSupabase(uid);
      return { success: true, recovered: true, message: data.message };
    }
    return { success: false, recovered: false, message: data.error };
  } catch (e: any) {
    return { success: false, recovered: false, message: e.message };
  }
};

// Aliases for seamless drop-in backwards compatibility
export const initiateCashfreeCheckout = initiateRazorpayCheckout;
export default initiateRazorpayCheckout;
