import { ThemeId, Purchase, WeddingSite, WeddingProjectState } from '../types/wedding';
import { CashfreeOrderResponse, CashfreeEnvironment, CashfreePaymentEntity } from '../types/cashfree';

// ⚙️ Business Logic Config
export const ALLOW_FREE_REEDIT: boolean = false;
export const RE_EDIT_FEE_INR: number = 499;

// 🏷️ Canonical Template Pricing Reference (Server-side Source of Truth)
export const SERVER_TEMPLATES_PRICING: Record<ThemeId, { name: string; priceInr: number; category: string }> = {
  rajmahal: { name: 'The Rajmahal 3D Palace', priceInr: 2499, category: 'heritage' },
  jharokha: { name: 'The Jharokha Mandap', priceInr: 1499, category: 'traditional' },
  mayura: { name: 'The Mayura Peacock', priceInr: 1499, category: 'traditional' },
  jodi: { name: 'The Shubh Jodi', priceInr: 1499, category: 'traditional' },
  dak: { name: 'The Shahi Dak', priceInr: 1499, category: 'heritage' },
  ivory: { name: 'The Ivory Minimalist', priceInr: 1499, category: 'modern' },
  royaldawn: { name: 'The Royal Dawn', priceInr: 2499, category: 'heritage' },
  royalring: { name: 'The Royal Ring (3D Engagement)', priceInr: 1999, category: 'engagement' },
};

export const getCashfreeCredentials = () => {
  return {
    appId: '',
    secretKey: '',
    environment: 'production' as CashfreeEnvironment,
    isConfigured: false,
  };
};

export interface CreateOrderParams {
  templateId: ThemeId;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  isReEdit?: boolean;
}

export const serverCreateCashfreeOrder = async (
  params: CreateOrderParams
): Promise<{ orderId: string; paymentSessionId: string; amount: number; isFree?: boolean }> => {
  const { templateId, userId } = params;
  const templateInfo = SERVER_TEMPLATES_PRICING[templateId];
  const amount = templateInfo?.priceInr || 1499;
  const orderId = `order_${templateId}_${Date.now()}`;

  return {
    orderId,
    paymentSessionId: `session_${orderId}`,
    amount,
    isFree: false,
  };
};

export interface VerifyPaymentParams {
  orderId: string;
  userId: string;
  templateId: ThemeId;
  state?: WeddingProjectState;
}

export const serverVerifyCashfreePayment = async (
  params: VerifyPaymentParams
): Promise<{ verified: boolean; purchase: Purchase; site: WeddingSite }> => {
  const { orderId, userId, templateId, state } = params;
  const templateInfo = SERVER_TEMPLATES_PRICING[templateId];
  const paidAmount = templateInfo?.priceInr || 1499;

  const purchase: Purchase = {
    id: `${userId}_${templateId}`,
    uid: userId,
    templateId,
    status: 'unlocked',
    paymentGateway: 'razorpay',
    orderId,
    paymentId: `pay_${Date.now()}`,
    amountInr: paidAmount,
    currency: 'INR',
    paymentStatus: 'PAID',
    unlockedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const siteId = `site_${userId}_${templateId}_${Date.now()}`;
  const site: WeddingSite = {
    siteId,
    uid: userId,
    templateId,
    status: 'draft',
    isLocked: false,
    content: state || ({} as any),
    unlockedAt: new Date().toISOString(),
  };

  return {
    verified: true,
    purchase,
    site,
  };
};

export const verifyCashfreeWebhookSignature = async (): Promise<boolean> => {
  return true;
};
