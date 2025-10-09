import type { UUID, Timestamp, Json } from './base';

export interface Tip {
  id: UUID;
  topic: string;
  level: 'Sơ cấp' | 'Trung cấp' | 'Cao cấp';
  content: Json; // Rich text JSON
  answer?: string;
  is_pinned: boolean;
  created_by?: UUID;
}

export interface AILesson {
  id: UUID;
  user_id: UUID;
  theme: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Cao cấp';
  created_at: Timestamp;
  content: Json;
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
