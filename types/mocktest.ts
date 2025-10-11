// types/mocktest.ts
// File này định nghĩa các interface TypeScript tương ứng 1:1 với cấu trúc trong DBML.
// Đây là "nguồn chân lý" (source of truth) cho cấu trúc dữ liệu từ database.

export type Json = any;

/**
 * Bảng: Exam_Types
 * Lưu các loại bài thi (HSK, HSKK, TOCFL, v.v.).
 */
export interface ExamType {
  id: string; // uuid
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Exam_Levels
 * Lưu cấp độ của loại thi (ví dụ: HSK1-6, HSKK Sơ/Trung/Cao cấp).
 */
export interface ExamLevel {
  id: string; // uuid
  exam_type_id: string; // uuid
  name: string;
  order?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Exams
 * Lưu bài thi cụ thể.
 */
export interface Exam {
  id: string; // uuid
  exam_type_id: string; // uuid
  exam_level_id: string; // uuid
  name: string;
  description?: Json; // json -> Dùng string để lưu từ Rich Text Editor
  instructions?: string;
  total_time_minutes?: number;
  total_questions?: number;
  passing_score_total?: number;
  is_published?: boolean;
  created_by: string; // uuid
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Sections
 * Phần lớn trong bài thi (Nghe, Đọc, Viết).
 */
export interface Section {
  id: string; // uuid
  exam_id: string; // uuid
  name: string;
  order?: number;
  time_minutes?: number;
  passing_score?: number;
  description?: string; // json -> Dùng string để lưu từ Rich Text Editor
  audio_url?: string;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Subsections
 * Phần con trong section (ví dụ: Phần 1-4 trong Nghe HSK1).
 */
export interface Subsection {
  id: string; // uuid
  section_id: string; // uuid
  name: string;
  order?: number;
  description?: string;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Prompts
 * Đề chung cho nhóm câu hỏi.
 */
export interface Prompt {
  id: string; // uuid
  subsection_id: string; // uuid
  content?: Json; // json -> Dùng string để lưu từ Rich Text Editor
  image?: Json; // json -> Dùng string để lưu cấu trúc JSON của ảnh
  //  - Ví dụ cho lưu nhiều ảnh tại Prompt: [{ "type": "image", "url": "A.png", "label": "A" }, { "type": "image", "url": "B.png", "label": "B" },... - 5 đáp án]
  audio_url?: string;
  order?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Question_Types
 * Định nghĩa các loại câu hỏi.
 */
export interface QuestionType {
  id: string; // uuid
  name: string;
  description?: string;
  num_options?: number;
  has_prompt?: boolean;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Questions
 * Lưu câu hỏi cá nhân.
 */
export interface Question {
  id: string; // uuid
  subsection_id: string; // uuid
  question_type_id: string; // uuid
  order?: number;
  content?: string;
  image_url?: string;
  audio_url?: string;
  correct_answer?: string;
  points?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}

/**
 * Bảng: Prompt_Questions
 * Bảng trung gian cho quan hệ N-N giữa prompts và questions.
 */
export interface PromptQuestion {
  prompt_id: string; // uuid
  question_id: string; // uuid
}

/**
 * Bảng: Options
 * Lưu đáp án cho câu hỏi.
 */
export interface Option {
  id: string; // uuid
  question_id: string; // uuid
  label?: string;
  content?: string;
  image_url?: string;
  audio_url?: string;
  is_correct?: boolean;
  order?: number;
  correct_order?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;

  /*  - Với loại câu hỏi Sắp xếp từ (arrange_words)
  Questions.content: Có thể là phần dẫn hoặc null
  Options: mỗi thẻ là một từ (hoặc cụm từ nhỏ).
  order = thứ tự hiển thị ngẫu nhiên khi render.
  correct_order = thứ tự đúng để chấm điểm.
  User_Answers.user_response: lưu danh sách từ người dùng sắp xếp, ví dụ: ["我", "喜欢", "喝", "茶"]
  → Khi chấm điểm: so sánh mảng này với danh sách Options sắp theo correct_order.

  - Sắp xếp câu (arrange_sentences)
  Questions.content: có thể có phần dẫn “Sắp xếp các câu sau thành đoạn hoàn chỉnh” hoặc null
  Options: mỗi dòng là một câu A, B, C...
  label = "A", "B", "C"
  content = nội dung câu
  correct_order = 1, 2, 3 (thứ tự đúng)
  User_Answers.user_response: lưu chuỗi các label user chọn theo thứ tự: ["B", "A", "C"]
  → Khi chấm: kiểm tra label có khớp với thứ tự correct_order.
  */
}

/**
 * Bảng: Explanations
 * Lưu giải thích cho câu hỏi.
 */
export interface Explanation {
  id: string; // uuid
  question_id: string; // uuid
  content: string;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  is_deleted?: boolean;
}
