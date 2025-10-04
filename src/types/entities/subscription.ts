/**
 * Subscription domain entities - Quản lý gói đăng ký và thanh toán
 */

import type { UUID, Timestamp, Json } from './base';

// --- Subscriptions ---
export interface Subscription {
  id: UUID;
  name: string;
  daily_quota_ai_lesson: number;
  daily_quota_translate: number;
  price: number; // decimal(10,2)
  duration_months?: number | null; // NULL cho Vĩnh Viễn
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// --- Payments ---
export interface Payment {
  id: UUID;
  user_id: UUID;
  subscription_id: UUID;
  amount: number;
  currency: 'VND' | 'USD';
  status: 'pending' | 'successful' | 'failed' | 'refunded' | 'manual_confirmed';
  payment_method: string; // 'momo', 'vnpay', 'bank_transfer', etc.
  gateway_transaction_id: string;
  transaction_date: Timestamp;
  gateway_response?: Json;
  processed_by_admin?: UUID;
  notes?: string;
}