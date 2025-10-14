// types/mocktest.ts
// Chuẩn hoá type theo base.ts (UUID, Timestamp, Json)
// 1:1 với cấu trúc trong DBML, không thể sửa đổi ở nguồn chân lý này.

import type { UUID, Timestamp, Json } from './base';

/**
 * Bảng: Exam_Types
 * Lưu các loại bài thi (HSK, HSKK, TOCFL, v.v.).
 */
export interface ExamType {
  id: UUID;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Exam_Levels
 * Lưu cấp độ của loại thi (ví dụ: HSK1-6, HSKK Sơ/Trung/Cao cấp).
 */
export interface ExamLevel {
  id: UUID;
  exam_type_id: UUID;
  name: string;
  order?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Exams
 * Lưu bài thi cụ thể.
 */
export interface Exam {
  id: UUID;
  exam_type_id: UUID;
  exam_level_id: UUID;
  name: string;
  description?: Json; // json từ RTE
  instructions?: string;
  total_time_minutes?: number;
  total_questions?: number;
  passing_score_total?: number;
  is_published?: boolean;
  created_by: UUID;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Sections
 * Phần lớn trong bài thi (Nghe, Đọc, Viết...).
 */
export interface Section {
  id: UUID;
  exam_id: UUID;
  name: string;
  order?: number;
  time_minutes?: number;
  passing_score?: number;
  description?: Json;
  audio_url?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Subsections
 * Phần con trong section (ví dụ: Phần 1-4 trong Nghe HSK1).
 */
export interface Subsection {
  id: UUID;
  section_id: UUID;
  name: string;
  order?: number;
  description?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Prompts
 * Đề chung cho nhóm câu hỏi.
 */
export interface Prompt {
  id: UUID;
  subsection_id: UUID;
  content?: Json;
  image?: Json;
  // - Ví dụ cho lưu nhiều ảnh tại Prompt: [{ "type": "image", "url": "A.png", "label": "A" }, { "type": "image", "url": "B.png", "label": "B" },... - 5 đáp án]
  audio_url?: string;
  order?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Question_Types
 * Định nghĩa các loại câu hỏi.
 */
export interface QuestionType {
  id: UUID;
  name: string;
  description?: string;
  num_options?: number;
  has_prompt?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Questions
 * Lưu câu hỏi cá nhân.
 */
export interface Question {
  id: UUID;
  subsection_id: UUID;
  question_type_id: UUID;
  order?: number;
  content?: string;
  image_url?: string;
  audio_url?: string;
  correct_answer?: string;
  points?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Prompt_Questions
 * Quan hệ N-N giữa prompts và questions.
 */
export interface PromptQuestion {
  prompt_id: UUID;
  question_id: UUID;
}

/**
 * Bảng: Options
 * Lưu đáp án cho câu hỏi.
 * 
 * - Với loại câu hỏi Sắp xếp từ (arrange_words) Questions.content: Có thể là phần dẫn hoặc null Options: mỗi thẻ là một từ (hoặc cụm từ nhỏ). order = thứ tự hiển thị ngẫu nhiên khi render. correct_order = thứ tự đúng để chấm điểm. User_Answers.user_response: lưu danh sách từ người dùng sắp xếp, ví dụ: ["我", "喜欢", "喝", "茶"] → Khi chấm điểm: so sánh mảng này với danh sách Options sắp theo correct_order. - Sắp xếp câu (arrange_sentences) Questions.content: có thể có phần dẫn “Sắp xếp các câu sau thành đoạn hoàn chỉnh” hoặc null Options: mỗi dòng là một câu A, B, C... label = "A", "B", "C" content = nội dung câu correct_order = 1, 2, 3 (thứ tự đúng) User_Answers.user_response: lưu chuỗi các label user chọn theo thứ tự: ["B", "A", "C"] → Khi chấm: kiểm tra label có khớp với thứ tự correct_order. 
 * 
 * */
export interface Option {
  id: UUID;
  question_id: UUID;
  label?: string;
  content?: string;
  image_url?: string;
  audio_url?: string;
  is_correct?: boolean;
  order?: number;
  correct_order?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Explanations
 * Lưu giải thích cho câu hỏi.
 */
export interface Explanation {
  id: UUID;
  question_id: UUID;
  content: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}