// Định nghĩa kiểu dữ liệu cơ bản cho hệ thống (Type-safe Frontend)

// --- Utility Types ---
export type UUID = string; // Postgres UUID
export type Timestamp = string; // ISO 8601 string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any; // Sử dụng 'any' cho các trường JSON/JSONB phức tạp

// --- 1. Users ---
export interface User {
  id: UUID;
  username: string; // Bắt buộc, không null
  password_hash?: string;
  name?: string | null; // Có thể null theo DB Note
  avatar_url?: string | null;
  email?: string | null;
  provider?: 'google' | 'apple' | 'local';
  provider_id?: string;
  role: 'user' | 'admin' | 'super admin';
  is_active: boolean;
  isVerify: boolean;
  community_points: number;
  subscription_id: UUID; // Bắt buộc, không null
  subscription_expiry?: Timestamp | null;
  level: '1' | '2' | '3' | '4' | '5' | '6' | '7-9';
  badge_level: number;
  language: 'Tiếng Việt' | 'Tiếng Anh';
  created_at: Timestamp;
  last_login?: Timestamp | null;
  achievements?: Json; // Array of achievement objects
}


// --- 2. Subscriptions ---
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

// --- 3. Payments ---
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

// --- 4. Content & Testing ---
export interface MockTest {
  id: UUID;
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  level: string;
  title: string;
  total_time_limit: number; // minutes
  total_max_score: number;
  sections: Json; // Chi tiết cấu trúc đề thi
  instructions?: string;
  is_active: boolean;
  created_by?: UUID;
  deleted_at?: Timestamp;
}

export interface UserTestScore {
    id: UUID;
    user_id: UUID;
    test_id: UUID;
    highest_total_score: number;
    attempts: Json; // Array of attempt objects
    explanations_viewed: Json; // Track viewed explanations
}

export interface Vocabulary {
  id: UUID;
  hanzi: string;
  pinyin: string;
  meaning: string;
  notes?: string;
  level: string[]; // ví dụ: ['HSK1', 'HSK2']
  image_url?: string;
  deleted_at?: Timestamp;
  word_types: string[]; // ['Danh từ', 'Động từ']
}

export interface WordType {
  code: string; // 'Danh từ', 'Động từ', ...
}

export interface VocabularyWordType {
  vocab_id: UUID;
  word_type: string; // tham chiếu WordType.code
}

export interface Notebook {
    id: UUID;
    user_id?: UUID | null; // NULL cho sổ tay mặc định/hệ thống
    name: string;
    vocab_count: number;
    created_at: Timestamp;
    options: Json; // {show_hanzi: bool, ...}
    is_premium: boolean;
}

export interface NotebookVocabItem {
    notebook_id: UUID;
    vocab_id: UUID;
    status: 'đã thuộc' | 'chưa thuộc' | 'yêu thích' | 'không chắc';
    added_at: Timestamp;
}

export interface Tip {
  id: UUID;
  order: number;
  topic: string; // 'Tất cả', 'Văn hóa', 'Ngữ pháp', ...
  level: string; // 'Sơ cấp', 'Trung cấp', 'Cao cấp'
  content: string;
  answer?: string;
  created_by?: UUID;
}

export interface AILesson {
    id: UUID;
    user_id: UUID;
    theme: string;
    level: string; // 'Cơ bản', 'Trung cấp', 'Cao cấp'
    created_at: Timestamp;
    content: Json; // Chi tiết bài học
}

// --- 5. Community ---
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
  deleted_by: UUID;
}

export interface Comment {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  content: Json; // Rich text JSON
  likes: number;
  parent_comment_id?: UUID | null;
  created_at: Timestamp;
  deleted_at?: Timestamp | null;
  deleted_reason?: string | null;
  deleted_by: UUID;
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


// --- 6. System & Usage ---
export interface AdminLog {
  id: UUID;
  user_id: UUID; 
  action_type: string;
  target_id?: UUID;
  description?: string;
  created_at: Timestamp;
}

export interface TranslationHistory {
    id: UUID;
    user_id: UUID;
    original_text: string;
    original_lang: 'vi' | 'zh';
    translated_text: string;
    translated_lang: 'vi' | 'zh';
    is_ai: boolean;
    created_at: Timestamp;
}

export interface UserUsage {
    id: UUID;
    user_id: UUID;
    feature: 'ai_lesson' | 'ai_translate';
    daily_count: number;
    last_reset: Timestamp;
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

export interface RefreshToken {
    id: UUID;
    user_id: UUID;
    token: string;
    created_at: Timestamp;
    expires_at: Timestamp;
}

export interface BadgeLevel {
  level: number;
  name: string;
  /** Optional icon (emoji or URL) to display next to user names */
  icon?: string;
}
