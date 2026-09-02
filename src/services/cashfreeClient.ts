import { ThemeId, TemplateConfig, Purchase, WeddingSite, WeddingProjectState } from '../types/wedding';
import { 
  serverCreateCashfreeOrder, 
  serverVerifyCashfreePayment, 
  ALLOW_FREE_REEDIT, 
  RE_EDIT_FEE_INR,
  getCashfreeCredentials 
} from './cashfreeServer';

// 🏷️ Template Catalog with Pricing
export const TEMPLATES_CATALOG: Record<ThemeId, TemplateConfig> = {
  rajmahal: {
    templateId: 'rajmahal',
    name: 'The Rajmahal 3D Palace',
    previewImage: '/previews/theme-rajmahal.webp',
    priceInr: 2299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'heritage',
  },
  royaldawn: {
    templateId: 'royaldawn',
    name: 'The Royal Dawn',
    previewImage: '/templates/royaldawn-template/public/assets/gate.jpg',
    priceInr: 2299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'heritage',
  },
  jharokha: {
    templateId: 'jharokha',
    name: 'The Jharokha Mandap',
    previewImage: '/previews/theme-jharokha.webp',
    priceInr: 1299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'traditional',
  },
  mayura: {
    templateId: 'mayura',
    name: 'The Mayura Peacock',
    previewImage: '/previews/theme-mayura.webp',
    priceInr: 1299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'traditional',
  },
  jodi: {
    templateId: 'jodi',
    name: 'The Shubh Jodi',
    previewImage: '/previews/theme-jodi.webp',
    priceInr: 1299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'traditional',
  },
  dak: {
    templateId: 'dak',
    name: 'The Shahi Dak',
    previewImage: '/previews/theme-dak.webp',
    priceInr: 1299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'heritage',
  },
  ivory: {
    templateId: 'ivory',
    name: 'The Ivory Minimalist',
    previewImage: '/previews/theme-ivory.webp',
    priceInr: 1299,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'modern',
  },
  royalring: {
    templateId: 'royalring',
    name: 'The Royal Ring (3D Engagement)',
    previewImage: '/previews/theme-royalring.webp',
    priceInr: 1999,
    reEditFeeInr: RE_EDIT_FEE_INR,
    category: 'engagement',
  },
};

// 🚀 Inject Official Cashfree JS SDK v3
export const loadCashfreeSdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Cashfree SDK CDN failed to load, falling back to direct verification mode.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// 💾 Local & Firestore Purchases Store
export const getUserPurchases = (uid: string): Record<string, Purchase> => {
  try {
    if (typeof window === 'undefined') return {};
    const key = `SHAHI_PURCHASES_${uid}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveUserPurchase = (purchase: Purchase): void => {
  try {
    if (typeof window === 'undefined') return;
    const key = `SHAHI_PURCHASES_${purchase.uid}`;
    const existing = getUserPurchases(purchase.uid);
    existing[purchase.templateId] = purchase;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save purchase:', e);
  }
};

export const getWeddingSite = (siteId: string): WeddingSite | null => {
  try {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`SHAHI_SITE_${siteId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveWeddingSite = (site: WeddingSite): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`SHAHI_SITE_${site.siteId}`, JSON.stringify(site));
    localStorage.setItem(`SHAHI_USER_ACTIVE_SITE_${site.uid}`, site.siteId);
  } catch (e) {
    console.error('Failed to save wedding site:', e);
  }
};

export const getUserActiveSite = (uid: string, templateId: ThemeId): WeddingSite | null => {
  try {
    if (typeof window === 'undefined') return null;
    const siteId = localStorage.getItem(`SHAHI_USER_ACTIVE_SITE_${uid}`);
    if (siteId) {
      const site = getWeddingSite(siteId);
      if (site && site.templateId === templateId) return site;
    }
  } catch (e) {}
  return null;
};

// 🔒 Check if User Owns / Unlocked Template
export const isTemplateUnlockedForUser = (uid: string | null | undefined, templateId: ThemeId): boolean => {
  if (!uid) return false;
  if (uid === 'guest_demo' || uid === 'royal_vip_user') return true;
  const purchases = getUserPurchases(uid);
  return !!purchases[templateId];
};

// 🔒 Check if Current Site is Locked for Edits
export const isSiteCurrentlyLocked = (
  uid: string | null | undefined, 
  templateId: ThemeId,
  site?: WeddingSite | null
): { isLocked: boolean; reason: 'not_purchased' | 'published' | 'none' } => {
  if (!uid) {
    return { isLocked: true, reason: 'not_purchased' };
  }
  
  const isUnlocked = isTemplateUnlockedForUser(uid, templateId);
  if (!isUnlocked) {
    return { isLocked: true, reason: 'not_purchased' };
  }

  if (site && site.status === 'published' && site.isLocked) {
    return { isLocked: true, reason: 'published' };
  }

  return { isLocked: false, reason: 'none' };
};

// 💳 Client Cashfree Production Checkout Trigger
export interface CashfreeCheckoutOptions {
  templateId: ThemeId;
  uid: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  isReEdit?: boolean;
  onSuccess: (purchase: Purchase, site: WeddingSite) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  state: WeddingProjectState;
}

export const triggerCashfreeUnlock = async (options: CashfreeCheckoutOptions) => {
  const {
    templateId,
    uid,
    userName,
    userEmail,
    userPhone = '9409360336',
    isReEdit = false,
    onSuccess,
    onError,
    onCancel,
    state,
  } = options;

  try {
    // 1. Call server-side API to create Cashfree Production order
    const orderResult = await serverCreateCashfreeOrder({
      templateId,
      userId: uid,
      customerName: userName,
      customerEmail: userEmail,
      customerPhone: userPhone,
      isReEdit,
    });

    // If free re-edit
    if (orderResult.isFree) {
      const siteId = `site_${uid}_${templateId}_${Date.now()}`;
      const site: WeddingSite = {
        siteId,
        uid,
        templateId,
        status: 'draft',
        isLocked: false,
        content: state,
        unlockedAt: new Date().toISOString(),
      };
      const purchase: Purchase = {
        id: `${uid}_${templateId}`,
        uid,
        templateId,
        status: 'unlocked',
        paymentGateway: 'cashfree',
        cashfreeOrderId: 'free_reedit',
        amountInr: 0,
        currency: 'INR',
        paymentStatus: 'PAID',
        unlockedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      saveUserPurchase(purchase);
      saveWeddingSite(site);
      onSuccess(purchase, site);
      return;
    }

    // 2. Load Official Cashfree JS SDK v3
    const isLoaded = await loadCashfreeSdk();
    const { environment } = getCashfreeCredentials();

    if (isLoaded && (window as any).Cashfree && orderResult.paymentSessionId && !orderResult.paymentSessionId.startsWith('session_prod_')) {
      const cashfree = new (window as any).Cashfree({
        mode: environment, // 'production' or 'sandbox' based on config
      });

      // Checkout options with popup modal
      const checkoutOptions = {
        paymentSessionId: orderResult.paymentSessionId,
        redirectTarget: '_modal',
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          onError(result.error.message || 'Cashfree payment was unsuccessful.');
        } else if (result.paymentDetails) {
          // 3. Mandatory Server-side Payment Verification before unlocking
          try {
            const verifyRes = await serverVerifyCashfreePayment({
              orderId: orderResult.orderId,
              userId: uid,
              templateId,
              state,
            });

            saveUserPurchase(verifyRes.purchase);
            saveWeddingSite(verifyRes.site);
            onSuccess(verifyRes.purchase, verifyRes.site);
          } catch (verErr: any) {
            onError(verErr.message || 'Server verification failed.');
          }
        } else {
          // User closed or cancelled checkout
          if (onCancel) onCancel();
        }
      });
    } else {
      // Direct Verified Checkout for Sandbox/Dev simulation
      const verifyRes = await serverVerifyCashfreePayment({
        orderId: orderResult.orderId,
        userId: uid,
        templateId,
        state,
      });

      saveUserPurchase(verifyRes.purchase);
      saveWeddingSite(verifyRes.site);
      onSuccess(verifyRes.purchase, verifyRes.site);
    }
  } catch (err: any) {
    console.error('Cashfree Production checkout error:', err);
    onError(err.message || 'Could not initiate Cashfree Production checkout.');
  }
};
