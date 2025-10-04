/**
 * Content domain entities - Quản lý nội dung học tập và tips
 */

import type { UUID, Timestamp, Json } from './base';

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