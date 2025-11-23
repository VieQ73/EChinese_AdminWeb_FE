import type { UUID, Timestamp, Json } from './base';
import { User, UserUsage } from './user';

export interface Subscription {
  id: UUID;
  name: string;
  description: Json; // JSON rich text (quyền lợi / nội dung hiển thị)
  daily_quota_ai_lesson: number;
  daily_quota_translate: number;
  price: number;
  duration_months?: number | null; // null = vĩnh viễn
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserSubscription {
  id: UUID;
  user_id: UUID;
  subscription_id: UUID;
  start_date: Timestamp;
  expiry_date?: Timestamp | null; // null = vĩnh viễn hoặc free
  is_active: boolean;
  auto_renew: boolean;
  last_payment_id?: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Kiểu dữ liệu mới để kết hợp thông tin cho tab "Gói của người dùng"
export interface EnrichedUserSubscription {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
    userSubscription?: UserSubscription; // Có thể không có nếu là user free chưa từng mua
    subscription?: Subscription; // Gói hiện tại (kể cả gói free)
  // Quotas có thể thiếu từ backend => đánh dấu optional + từng field optional
  quotas?: {
    ai_lesson?: UserUsage;
    ai_translate?: UserUsage;
  };
}

// Kiểu dữ liệu cho lịch sử các gói của một người dùng
export interface UserSubscriptionHistoryItem extends UserSubscription {
    subscriptionName: string;
}


export interface Payment {
  id: UUID;
  user_id: UUID;
  subscription_id: UUID;
  amount: number;
  currency: 'VND' | string;
  status: 'pending' | 'successful' | 'failed' | 'refunded' | 'manual_confirmed' | 'partially-refunded';
  payment_method: 'visa/mastercard' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | string;
  payment_channel: 'auto' | 'manual';
  gateway_transaction_id: string;
  manual_proof_url?: string | null; // biên lai nếu thanh toán thủ công
  transaction_date: Timestamp;
  gateway_response?: Record<string, any> | null;
  processed_by_admin?: UUID | null;
  notes?: string | null;

  // --- Enriched fields for frontend ---
  userName?: string;
  userEmail?: string;
  subscriptionName?: string;
  processedByAdminName?: string;
}

export interface Refund {
  id: UUID;
  payment_id: UUID;
  user_id: UUID;
  processed_by_admin?: UUID | null;
  refund_amount: number;
  refund_method: 'gateway' | 'manual_transfer';
  reason?: string | null;
  status: 'pending' | 'completed' | 'rejected';
  created_at: Timestamp;
  processed_at?: Timestamp | null;
  notes?: string;
  gateway_response?: Record<string, any> | null;

  // --- Enriched fields for frontend ---
  userName?: string;
  processedByAdminName?: string;
  payment?: Payment;
}