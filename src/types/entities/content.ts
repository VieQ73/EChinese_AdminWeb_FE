/**
 * Content domain entities - Quản lý nội dung học tập và tips
 */

import type { UUID, Timestamp, Json } from './base';

export interface Tip {
  id: UUID;
  topic: string; // 'Tất cả', 'Câu đố', 'HSK', 'Câu nói hay', 'Giao tiếp', 'Ngữ pháp', 'Văn hóa', 'Từ vựng', 'Viết', 'HSKK', 'Phát âm', 'Khẩu ngữ', 'Ngôn ngữ mạng', 'Du học', 'Hướng dẫn sử dụng', 'Truyện cười'
  level: string; // 'Sơ cấp', 'Trung cấp', 'Cao cấp'
  content: Json; // Rich text JSON
  answer?: string;
  is_pinned?: boolean; // Xác định mẹo có được ghim lên đầu danh sách (Pin) hay không.
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