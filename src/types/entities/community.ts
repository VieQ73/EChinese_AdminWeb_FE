/**
 * Community domain entities - Quản lý cộng đồng, bài viết và tương tác
 */

import type { UUID, Timestamp, Json } from './base';

// --- Community ---
export interface Post {
  id: UUID;
  user_id: UUID;
  title: string;
  content: Json; // Rich text JSON
  topic:
    | 'Cơ khí'
    | 'CNTT'
    | 'Dịch'
    | 'Du học'
    | 'Du lịch'
    | 'Góc chia sẻ'
    | 'Tìm bạn học chung'
    | 'Học tiếng Trung'
    | 'Tìm gia sư'
    | 'Việc làm'
    | 'Văn hóa'
    | 'Thể thao'
    | 'Xây dựng'
    | 'Y tế'
    | 'Tâm sự'
    | 'Khác';
  likes: number;
  views: number;
  created_at: Timestamp;
  is_approved: boolean;
  is_pinned: boolean;
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by: UUID | null;
}

export interface Comment {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  content: Json; // Rich text JSON
  parent_comment_id?: UUID | null;
  created_at: Timestamp;
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by: UUID | null;
}

// Interface: PostLikes
export interface PostLike {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  created_at: Timestamp;
}

// Interface: PostViews
export interface PostView {
  id: UUID;
  post_id: UUID;
  user_id?: UUID | null; // NULL nếu khách
  viewed_at: Timestamp;
}

export interface PostMediaMap {
  id: string;
  post_id: string;
  media_id: string;
  order_no: number;        // 0,1,2 (thứ tự ảnh)
}

// ModerationLogs
export interface ModerationLog {
  id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  action: 'gỡ' | 'khôi phục' | 'xóa vĩnh viễn';
  reason?: string;
  performed_by: string;    // UUID
  created_at: string;
}

export interface Report {
  id: string; // UUID
  reporter_id: string; // UUID

  // Enum inline
  target_type: 'post' | 'comment' | 'user' | 'bug' | 'notebook' | 'vocab'|'other';
  target_id?: string; // UUID, optional nếu là bug/other

  reason: string;
  details?: string;

  // Attachment list
  attachments?: {
    url: string;
    mime?: string;
    name?: string;
  }[];

  status: 'pending' | 'resolved' | 'dismissed';
  assigned_to?: string;   // admin id
  resolved_by?: string;   // admin id
  resolved_at?: string;   // ISO timestamp
  created_at: string;     // ISO timestamp
  updated_at?: string;
}