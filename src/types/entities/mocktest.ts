/**
 * Mock Test domain entities - Quản lý đề thi thử và kết quả
 */

import type { UUID, Timestamp } from './base';

// --- Content & Testing ---
export interface MockTest {
  id: UUID;
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  level: string; // ví dụ: 'HSK3', 'HSK6', '7-9', 'TOCFL B2'
  title: string;
  total_time_limit: number; // phút
  total_max_score: number;
  instructions?: string | null;
  is_active: boolean;
  created_by?: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at?: Timestamp | null;
}

// Section trong đề (Listening, Reading...)
export interface MockTestSection {
  id: UUID;
  test_id: UUID;
  name: string; // ví dụ 'Listening', 'Reading'
  order_no: number;
  time_limit?: number | null; // phút, có thể null nếu không giới hạn riêng
  max_score: number;
  total_questions: number;
}

// Câu hỏi trong section
export interface MockTestQuestion {
  id: UUID;
  section_id: UUID;
  order_no: number;
  type: 'mcq' | 'fill' | 'write' | 'repeat' | 'describe' | 'answer';
  text?: string | null; // Nội dung câu hỏi
  options?: string[] | null; // Cho MCQ
  correct_answer?: string | null; // Index MCQ hoặc text
  explanation?: string | null; // Giải thích khi review
  media_id?: UUID | null; // Tham chiếu Media (audio/image)
  start_time?: number | null; // giây
  end_time?: number | null;   // giây
  is_visual: boolean;
}

// Điểm cao nhất của user cho 1 đề
export interface UserTestScore {
  id: UUID;
  user_id: UUID;
  test_id: UUID;
  highest_total_score: number;
  created_at: Timestamp;
}

// Lần thi cụ thể (attempt)
export interface UserTestAttempt {
  id: UUID;
  user_id: UUID;
  test_id: UUID;
  started_at: Timestamp;
  submitted_at?: Timestamp | null;
  total_score?: number | null;
  section_scores?: {
    section_id: UUID;
    score: number;
    completed_questions: number;
    total_questions: number;
  }[]; // JSON
}

// Câu trả lời chi tiết trong 1 attempt
export interface UserTestAnswer {
  id: UUID;
  attempt_id: UUID;
  question_id: UUID;
  selected_answer?: string | null;
  is_correct: boolean;
  time_spent?: number | null; // giây
  reviewed: boolean; // user đã xem lại giải thích chưa
}