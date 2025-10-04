/**
 * Vocabulary domain entities - Quản lý từ vựng và sổ tay
 */

import type { UUID, Timestamp, Json } from './base';

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