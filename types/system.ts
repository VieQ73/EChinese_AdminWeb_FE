
import type { UUID, Timestamp, Json, User, RawPost, Comment } from './index';

export interface AdminLog {
  id: UUID;
  user_id: UUID;
  action_type: string;
  target_id?: UUID;
  description: string;
  created_at: Timestamp;
  // For frontend convenience
  adminName?: string;
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
  content: Json; //Rich text editor
  related_type?: string | null;
  related_id?: UUID | null;
  data?: Json | null;
  redirect_url?: string | null;
  read_at?: Timestamp | null;
  is_push_sent: boolean;
  created_at: Timestamp;
  expires_at?: Timestamp | null;
  priority: number;
  from_system: boolean;
}

export interface Report {
  id: UUID;
  reporter_id?: UUID | null;
  target_type: 'post' | 'comment' | 'user' | 'bug' | 'other';
  target_id: UUID;
  reason: string;
  details?: string | null;
  attachments?: Json | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  resolution?: string | null;
  resolved_by?: UUID | null;
  resolved_at?: Timestamp | null;
  related_violation_id?: UUID | null;
  auto_flagged: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;

  // Thuộc tính làm giàu cho Frontend
  reporter?: Partial<User> | null;
  targetContent?: Partial<User & RawPost & Comment> | null;
}

// 🧱 Quy tắc cộng đồng
export interface CommunityRule {
  id: UUID;
  title: string; // Ví dụ: "Công kích cá nhân"
  description: string; // Mô tả chi tiết hành vi vi phạm
  severity_default: 'low' | 'medium' | 'high';
  is_active: boolean; // Cho phép bật/tắt quy tắc
  created_at: Timestamp;
  updated_at?: Timestamp | null;
}

// 🧩 Liên kết giữa vi phạm và quy tắc (many-to-many)
export interface ViolationRule {
  id: UUID;
  violation_id: UUID; // FK đến Violations
  rule_id: UUID; // FK đến CommunityRules

  // Làm giàu dữ liệu (optional)
  rule?: Partial<CommunityRule>;
  violation?: Partial<Violation>;
}

// ⚠️ Vi phạm
export interface Violation {
  id: UUID;
  user_id: UUID;
  // Cho phép vi phạm ở cấp post, comment, hoặc user (vd: cấm tài khoản)
  target_type: 'post' | 'comment' | 'user';
  target_id: UUID;
  severity: 'low' | 'medium' | 'high';
  detected_by: 'admin' | 'super admin' | 'auto_ai';
  handled: boolean;
  created_at: Timestamp;
  resolved_at?: Timestamp | null;
  resolution?: string | null;

  // === Làm giàu dữ liệu cho frontend ===
  user?: Partial<User>; // Người vi phạm
  // Nội dung mục tiêu vi phạm (bài viết, bình luận, hoặc người dùng)
  targetContent?: Partial<RawPost & Comment & User> | null;
  // Các quy tắc liên quan (từ bảng ViolationRules)
  rules?: Partial<CommunityRule>[];
}

export interface Appeal {
  id: UUID;
  violation_id: UUID;
  user_id: UUID;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Timestamp;
  resolved_at?: Timestamp | null;
  resolved_by?: UUID | null;
  notes?: string | null;
  violation_snapshot?: Violation | null;

  // Thuộc tính làm giàu cho Frontend
  user?: Partial<User>;
  violation?: Violation;
}
