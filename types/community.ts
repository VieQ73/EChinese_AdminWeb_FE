
import type { UUID, Timestamp, BadgeLevel, User } from './index';

// Cấu trúc nội dung của một bài đăng
export interface PostContent {
  html?: string;
  text?: string;
  ops?: unknown[]; // Dành cho các trình soạn thảo như QuillJS
  images?: string[]; // Mảng các URL hình ảnh
}

// Bài viết trong cộng đồng (dữ liệu thô từ DB)
export interface RawPost {
  id: UUID;
  user_id: UUID;
  title: string;
  content: PostContent; // JSON cho nội dung rich text
  topic:
    | 'Cơ khí' | 'CNTT' | 'Dịch' | 'Du học' | 'Du lịch' | 'Góc chia sẻ' | 'Tìm bạn học chung'
    | 'Học tiếng Trung' | 'Tìm gia sư' | 'Việc làm' | 'Văn hóa' | 'Thể thao' | 'Xây dựng'
    | 'Y tế' | 'Tâm sự' | 'Khác';
  likes: number;
  views: number;
  created_at: Timestamp;

  // Thuộc tính kiểm duyệt
  status: 'draft' | 'published' | 'hidden' | 'removed' | 'archived';
  is_approved: boolean; //auto true khi mới tạo bài viết/sau khi khôi phục
  auto_flagged: boolean; // Bị hệ thống tự động đánh dấu
  is_pinned: boolean; // Được ghim

  // Thuộc tính xóa mềm
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by?: UUID | null;
}


// Bài viết trong cộng đồng (dữ liệu đã được làm giàu để hiển thị)
export interface Post extends RawPost {
  user: Pick<User, 'id' | 'name' | 'avatar_url' | 'badge_level' | 'role'>;
  badge: BadgeLevel;
  comment_count?: number;
  isLiked?: boolean;
  isViewed?: boolean;
  isCommented?: boolean;
}

// Bình luận (cơ bản, tương thích với DB)
export interface Comment {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  content: Pick<PostContent, 'text' | 'html'>;
  parent_comment_id?: UUID | null;
  created_at: Timestamp;
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by?: UUID | null;
}

// Bình luận (mở rộng, dùng cho hiển thị ở frontend)
export interface CommentWithUser extends Comment {
  user: User;
  badge: BadgeLevel;
  replies: CommentWithUser[]; // Các bình luận trả lời lồng nhau
}


// Lượt thích bài viết
export interface PostLike {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  created_at: Timestamp;
}

// Lượt xem bài viết
export interface PostView {
  id: UUID;
  post_id: UUID;
  user_id?: UUID | null; // Có thể là khách
  viewed_at: Timestamp;
}

// Liên kết bài viết và media
export interface PostMediaMap {
  id: UUID;
  post_id: UUID;
  media_id: UUID;
  order_no: number;
}

// Nhật ký kiểm duyệt
export interface ModerationLog {
  id: UUID;
  target_type: 'post' | 'comment' | 'user';
  target_id: UUID;
  action: 'remove' | 'restore';
  reason?: string;  // - Khác với deleted_by/deleted_reason trong Posts/Comments (chỉ lưu trạng thái cuối).
  performed_by: UUID;
  created_at: Timestamp;
}
