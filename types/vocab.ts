
import type { UUID, Timestamp, Json } from './base';

export interface Vocabulary {
  id: UUID;
  hanzi: string;
  pinyin: string;
  meaning: string;
  notes?: string;
  level: string[];
  image_url?: string;
  word_types: string[];
}

export interface WordType {
  code: string; //Danh từ, Đại từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Trợ từ, Thán từ, Số từ, Lượng từ, Thành phần câu, Cụm từ
}

export interface VocabularyWordType {
  vocab_id: UUID;
  word_type: string;
}

export interface Notebook {
  id: UUID;
  user_id?: UUID | null;
  name: string;
  vocab_count: number;
  created_at: Timestamp;
  options: Json;
  is_premium: boolean;
  status: 'published' | 'draft';
}

export interface NotebookVocabItem {
  notebook_id: UUID;
  vocab_id: UUID;
  status: 'đã thuộc' | 'chưa thuộc' | 'yêu thích' | 'không chắc';
  added_at: Timestamp;
}
