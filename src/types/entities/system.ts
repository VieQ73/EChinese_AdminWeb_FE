/**
 * System domain entities - Quản lý hệ thống, logs và thông báo
 */

import type { UUID, Timestamp } from './base';

// --- System & Usage ---
export interface AdminLog {
  id: UUID;
  user_id: UUID; 
  action_type: string;
  target_id?: UUID;
  description?: string;
  created_at: Timestamp;
}

export interface Notification {
  id: string; // UUID
  recipient_id?: string | null; // null => broadcast
  audience: 'user' | 'admin' | 'all';

  type: 'system' | 'report' | 'subscription' | 'community' | 'achievement' | 'reminder' | 'feedback';

  title: string;
  content: string;

  related_type?: 'post' | 'comment' | 'report' | 'subscription' | 'notebook' | string | null;
  related_id?: string | null;

  data?: Record<string, any> | null;
  redirect_url?: string | null;

  read_at?: string | null;    // ISO timestamp
  is_push_sent?: boolean;

  created_at: string;         // ISO timestamp
  expires_at?: string | null;
}

export interface Media {
  id: UUID;
  original_name: string;
  display_name?: string;
  s3_path: string;
  mime_type?: string;
  size_bytes?: number;
  uploaded_by?: UUID;
  usage_type: 'mocktest_audio' | 'vocab_image' | 'user_avatar' | 'system';
  created_at: Timestamp;
}