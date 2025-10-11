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
} from './mocktest';

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

// Câu hỏi có type, options, explanation
export interface QuestionFull extends Question {
  question_type?: QuestionType;
  options?: Option[];
  explanation?: Explanation | null;
  prompts?: Prompt[]; // nếu question thuộc prompt (qua bảng Prompt_Questions)
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
}

// Dữ liệu cho trình chỉnh sửa (admin)
export interface ExamEditorState extends ExamFull {
  isEditing?: boolean;
  expandedSectionIds?: string[];
  expandedSubsectionIds?: string[];
}
