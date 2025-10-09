import type { UUID, Timestamp, Json } from './base';

export interface MockTest {
  id: UUID;
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK'; // Loại kỳ thi
  level: string; // Ví dụ: HSK3, HSK7-9, TOCFL B2, D4-C1
  title: string; // Tên đề thi
  total_time_limit: number; // Tổng thời gian (phút)
  total_max_score: number; // Tổng điểm tối đa
  passing_score?: number; // Điểm đạt tổng (nếu áp dụng)
  instructions?: string; // Hướng dẫn làm bài
  scoring_policy?: {
    requires_section_pass?: boolean; // Có yêu cầu từng phần đạt tối thiểu?
    section_min?: number; // Điểm tối thiểu từng phần (VD: 60)
    total_min?: number; // Tổng điểm tối thiểu (VD: 180)
  };
  is_active: boolean;
  created_by?: string; // ID admin tạo đề
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface MockTestTemplate {
  /** ID duy nhất của template. */
  id: string; // uuid
  
  /** Loại đề thi: 'HSK', 'TOCFL', 'D4', 'HSKK' */
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK' | string;
  
  /** Cấp độ đề thi: 'HSK1', 'HSK3', 'BandA', v.v. */
  level: string;
  
  /** Tên mô tả duy nhất của template, ví dụ: 'HSK3 chuẩn'. */
  name: string;
  
  /** Mô tả chi tiết về template. */
  description: string | null;
  
  /** Trạng thái hoạt động của template. */
  is_active: boolean;
  
  /** Thời điểm tạo. */
  created_at: Date | string; // Sử dụng Date object trong JS/TS, hoặc string nếu nhận từ DB
  
  /** Thời điểm cập nhật cuối cùng. */
  updated_at: Date | string;
  
  /** JSON mô tả chi tiết cấu trúc các phần (sections) của đề thi. */
  structure: Json; 
}

export interface MockTestSection {
  id: UUID;
  test_id: string; // FK -> MockTests.id
  name: string; // Listening, Reading, Writing, Speaking...
  order_no: number;
  time_limit?: number; // Thời gian riêng cho section
  max_score: number;
  passing_score?: number; // Điểm đạt riêng phần này (VD: TOCFL >= 60)
  total_questions: number;
  weight: number; // Trọng số phần này khi tính tổng
}

export interface MockTestQuestion {
  id: UUID;
  section_id: string; // FK -> MockTestSections.id
  order_no: number;
  type: 'mcq' | 'fill' | 'write' | 'repeat' | 'describe' | 'answer'; // Loại câu hỏi
  text?: string; // Nội dung câu hỏi
  options?: string[]; // Cho câu hỏi trắc nghiệm
  correct_answer?: string;
  explanation?: string; // Giải thích hoặc đáp án mẫu
  media_id?: string; // Âm thanh / hình ảnh minh họa
  start_time?: number;
  end_time?: number;
  is_visual: boolean; // Có hiển thị hình không
}

export interface UserTestScore {
  id: UUID;
  user_id: string;
  test_id: string;
  highest_total_score: number;
  highest_section_scores?: Record<string, number>; // {listening: 90, reading: 85, writing: 70}
  passed: boolean; // Đạt hay không theo quy tắc
  created_at: string;
}

export interface UserTestAttempt {
  id: UUID;
  user_id: string;
  test_id: string;
  started_at: string;
  submitted_at?: string;
  total_score?: number;
  section_scores?: {
    section_id: string;
    score: number;
    completed_questions: number;
    total_questions: number;
  }[];
  passed: boolean;
  feedback?: string;
}

export interface UserTestAnswer {
  id: UUID;
  attempt_id: string; // FK -> UserTestAttempts.id
  question_id: string; // FK -> MockTestQuestions.id
  selected_answer?: string;
  is_correct?: boolean;
  score?: number; // Điểm từng câu
  time_spent?: number; // Thời gian trả lời (giây)
  reviewed: boolean; // Đã xem lại hay chưa
}
