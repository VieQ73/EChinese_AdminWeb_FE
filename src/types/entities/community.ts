/**
 * Community domain entities - Quản lý cộng đồng, bài viết và tương tác
 */

import type { UUID, Timestamp, Json } from './base';

// --- Post Content Structure ---
export interface PostContent {
  html?: string;
  text?: string;
  ops?: unknown[]; // QuillJS operations
  images?: string[]; // Array of image URLs
}

// --- Community ---
export interface Post {
  id: UUID;
  user_id: UUID;
  title: string;
  content: any; // Rich text JSON
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

  // Moderation
  status: 'draft' | 'published' | 'hidden' | 'removed' | 'archived';
  is_approved: boolean;
  auto_flagged: boolean;
  is_pinned: boolean;

  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by?: UUID | null;
}


// Basic Comment interface - dành cho database compatibility
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

// Enhanced Comment interface - dành cho Frontend display (include user info)
export interface CommentWithUser {
  id: UUID;
  post_id: UUID;
  content: Json; // Rich text JSON
  parent_comment_id?: UUID | null;
  created_at: Timestamp;
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by: UUID | null;
  
  // User information - được join từ Users table
  user: {
    id: UUID;
    name: string;
    username: string;
    avatar_url?: string | null;
    badge_level: number;
    role: 'user' | 'admin' | 'super admin';
    is_active: boolean;
  };
  
  // Badge information - được join từ BadgeLevel
  badge: {
    level: number;
    name: string;
    icon?: string;
  };
  
  // Nested replies for hierarchical display
  replies?: CommentWithUser[];
  
  // Metadata
  reply_count?: number;
  depth?: number; // Độ sâu lồng nhau (0 = root comment)
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
