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
  audio_url?: string; // Audio xuyên suốt phần nghe nếu không chọn cách up từng file nghe cho từng câu.
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
  audio_url?: string; // Audio phục vụ phần con bên trong section nghe, giới thiệu từng phần con nếu có.
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
  image?: Json; // Ví dụ: [{ "type": "image", "url": "A.png", "label": "A" }, ...]
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
 * [MỚI] Quy tắc xác định đáp án đúng khi chấm bài:
 * 1. Ưu tiên kiểm tra `correct_answer`. Nếu có giá trị, dùng nó để so sánh.
 * 2. Nếu `correct_answer` là null, kiểm tra bảng `Correct_Answers` cho các đáp án dạng text phức tạp.
 * 3. Nếu là câu trắc nghiệm/sắp xếp, kiểm tra logic trong `Option` (`is_correct` hoặc `correct_order`).
 */
export interface Question {
  id: UUID;
  subsection_id: UUID;
  question_type_id: UUID;
  order?: number;
  content?: string;
  image_url?: string;
  audio_url?: string;
  /** correct_anser: Dùng cho câu hỏi có 1 đáp án đúng dạng text (điền từ, trả lời ngắn).
   * Sẽ là `null` nếu câu hỏi có nhiều đáp án đúng (lưu ở `CorrectAnswer`)
   * hoặc là dạng trắc nghiệm (xác định bằng `Option.is_correct`).
   */
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
 * Lưu các lựa chọn hoặc các thành phần được hiển thị cho người dùng.
 *
 * - Với câu hỏi Sắp xếp từ/câu:
 * + Bảng này cung cấp các "mảnh ghép" (từ, câu) để người dùng thao tác.
 * + Nếu chỉ có MỘT đáp án đúng, dùng `correct_order` để định nghĩa thứ tự.
 * + Nếu có NHIỀU đáp án đúng, `correct_order` sẽ là `null`.
 * Việc chấm điểm sẽ dựa trên việc so sánh kết quả người dùng ghép lại với các đáp án trong `CorrectAnswer`.
 */
export interface Option {
  id: UUID;
  question_id: UUID;
  label?: string;
  content?: string;
  image_url?: string;
  audio_url?: string;
  is_correct?: boolean; // Dùng cho câu trắc nghiệm chỉ có 1 lựa chọn đúng. 
  order?: number;
  correct_order?: number; // Thứ tự đúng cho bài sắp xếp chỉ có MỘT đáp án đúng. */
  created_at?: Timestamp;
  updated_at?: Timestamp;
  is_deleted?: boolean;
}

/**
 * Bảng: Correct_Answers
 * Lưu các đáp án đúng được chấp nhận cho một câu hỏi.
 * Dùng cho các dạng bài có nhiều phương án trả lời đúng (ví dụ: sắp xếp câu).
 */
export interface CorrectAnswer {
  id: UUID;
  question_id: UUID;
  answer: string;
  explanation?: string;
  created_at?: Timestamp;
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