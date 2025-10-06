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
  id: UUID;
  recipient_id?: UUID | null;
  audience: 'user' | 'admin' | 'all';
  type:
    | 'system'
    | 'report'
    | 'violation'
    | 'appeal'
    | 'subscription'
    | 'community'
    | 'achievement'
    | 'reminder'
    | 'feedback';
  
  title: string;
  content: string;
  related_type?: string | null;
  related_id?: UUID | null;
  data?: Record<string, any> | null;
  redirect_url?: string | null;
  
  read_at?: Timestamp | null;
  is_push_sent: boolean;
  created_at: Timestamp;
  expires_at?: Timestamp | null;
  
  priority: number; // Độ ưu tiên hiển thị: 0=thường, 1=quan trọng
  from_system: boolean;
}

export interface Report {
  id: UUID;
  reporter_id?: UUID | null; // Null nếu AI tự tạo
  target_type: 'post' | 'comment' | 'user' | 'bug' | 'other';
  target_id?: UUID | null;
  reason: string;
  details?: string | null;
  attachments?: { url: string; mime: string; name?: string }[] | null;

  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  resolution?: string | null;
  assigned_to?: UUID | null;
  resolved_by?: UUID | null;
  resolved_at?: Timestamp | null;
  related_violation_id?: UUID | null;
  auto_flagged: boolean;

  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Violation {
  id: UUID;
  user_id: UUID;
  target_type: 'post' | 'comment';
  target_id: UUID;
  rule: string;
  severity: 'low' | 'medium' | 'high';
  detected_by: 'admin' | 'auto_ai';
  handled: boolean;
  created_at: Timestamp;
  resolved_at?: Timestamp | null;
  resolution?: string | null;
}


export interface Appeal {
  id: UUID;
  violation_id: UUID;
  user_id: UUID;
  reason: string; // Lý do khiếu nại do người dùng nhập
  status: 'pending' | 'accepted' | 'rejected'; // Trạng thái xử lý
  created_at: Timestamp;
  resolved_at?: Timestamp | null;
  resolved_by?: UUID | null;
  notes?: string | null; // Ghi chú của admin
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