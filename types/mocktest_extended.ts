// types/mocktest_extended.ts
// Bộ interface mở rộng cho tầng domain / API / UI
// Dựa trên types trong mocktest.ts (map 1:1 DB)

import {
  ExamType,
  ExamLevel,
  Exam,
  Section,
  Subsection,
  Prompt,
  QuestionType,
  Question,
  PromptQuestion,
  Option,
  Explanation,
  CorrectAnswer, 
} from './mocktest';

export type { Option, Explanation, CorrectAnswer };

export interface PromptImage {
  type: 'image';
  label: string;
  url: string | File;
}

/**
 * ================================
 * EXAM DETAIL STRUCTURE (FULL)
 * ================================
 */

// Toàn bộ bài thi (Exam) bao gồm loại thi, cấp độ, và các section
export interface ExamFull extends Exam {
  exam_type?: ExamType;
  exam_level?: ExamLevel;
  sections?: SectionFull[];
}

// Section gồm các subsection (phần con)
export interface SectionFull extends Section {
  subsections?: SubsectionFull[];
}

// Subsection có thể chứa prompt (đề chung) và câu hỏi
export interface SubsectionFull extends Subsection {
  prompts?: Prompt[];
  questions?: QuestionFull[];
}

// Câu hỏi có type, options, explanation, và danh sách các đáp án đúng
export interface QuestionFull extends Question {
  question_type?: QuestionType;
  options?: Option[];
  explanation?: Explanation | null;
  prompts?: Prompt[]; // nếu question thuộc prompt (qua bảng Prompt_Questions)
  /**
   * Mảng chứa tất cả các đáp án đúng được chấp nhận cho câu hỏi này.
   * Dữ liệu được lấy từ bảng `Correct_Answers`.
   * Rất quan trọng cho việc hiển thị đáp án hoặc cho admin chỉnh sửa.
   */
  correct_answers?: CorrectAnswer[];
}

/**
 * ================================
 * HELPER TYPES (cho UI hoặc logic)
 * ================================
 */

// Dữ liệu nhẹ hơn (dùng cho danh sách / bảng)
export interface ExamSummary extends Exam {
  exam_type_name?: string;
  exam_level_name?: string;
  section_count?: number;
  question_count?: number;
  total_questions?: number; // Alias for question_count from API
  sections?: Section[];
}

// Dữ liệu cho trình chỉnh sửa (admin)
export interface ExamEditorState extends ExamFull {
  isEditing?: boolean;

  expandedSectionIds?: string[];
  expandedSubsectionIds?: string[];
  expandedPromptIds?: string[];
  expandedQuestionIds?: string[];
}