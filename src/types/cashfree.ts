import { ThemeId } from './wedding';

export type CashfreeEnvironment = 'sandbox' | 'production';

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CashfreeCreateOrderPayload {
  order_id: string;
  order_amount: number;
  order_currency: 'INR';
  customer_details: CashfreeCustomerDetails;
  order_meta?: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: string;
  };
  order_tags?: {
    templateId: ThemeId;
    userId: string;
    environment: CashfreeEnvironment;
  };
  order_note?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED';
  payment_session_id: string;
  order_expiry_time: string;
  order_note?: string;
  created_at: string;
  customer_details: CashfreeCustomerDetails;
}

export interface CashfreePaymentEntity {
  payment_status: 'SUCCESS' | 'NOT_ATTEMPTED' | 'FAILED' | 'USER_DROPPED' | 'CANCELLED';
  payment_amount: number;
  payment_currency: string;
  payment_message: string;
  payment_time: string;
  cf_payment_id: number;
  payment_method: any;
}

export interface CashfreeWebhookPayload {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags?: {
        templateId: ThemeId;
        userId: string;
      };
    };
    payment: {
      cf_payment_id: number;
      payment_status: 'SUCCESS' | 'FAILED' | 'USER_DROPPED';
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string;
    };
    customer_details: CashfreeCustomerDetails;
  };
  event_time: string;
  type: string;
}
