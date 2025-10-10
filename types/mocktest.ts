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
  
  // Template và trạng thái hoàn thành
  template_id?: string; // ID template được sử dụng
  completion_status: 'draft' | 'incomplete' | 'completed' | 'reviewed'; // Trạng thái hoàn thành
  completion_percentage: number; // Phần trăm hoàn thành (0-100)
  
  // Quản lý hiển thị
  is_active: boolean; // Có hoạt động không (kiểm soát mobile users)
  
  // Chi tiết sections và questions
  sections?: MockTestDetailSection[];
  
  created_by?: string; // ID admin tạo đề
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Chi tiết section trong đề thi thực tế
export interface MockTestDetailSection {
  id: string;
  test_id: string;
  template_section_id: string; // Liên kết với template section
  name: string;
  order_no: number;
  time_limit: number;
  max_score: number;
  total_questions: number;
  description?: string;
  audio_url?: string; // File âm thanh cho phần nghe (chung cho cả section)
  parts: MockTestDetailPart[];
  completion_status: 'not_started' | 'in_progress' | 'completed';
}

// Chi tiết part trong section
export interface MockTestDetailPart {
  id: string;
  section_id: string;
  template_part: TemplateQuestionPart; // Thông tin từ template
  questions: MockTestDetailQuestion[];
  completion_status: 'not_started' | 'in_progress' | 'completed';
}

// Chi tiết câu hỏi trong đề thi
export interface MockTestDetailQuestion {
  id: string;
  part_id: string;
  order_no: number;
  
  // Nội dung câu hỏi
  question_text?: string; // Văn bản câu hỏi
  audio_url?: string; // File âm thanh
  images?: string[]; // Danh sách hình ảnh
  
  // Các lựa chọn (cho câu trắc nghiệm)
  options?: MockTestQuestionOption[];
  
  // Đáp án đúng
  correct_answer: string | string[]; // String cho 1 đáp án, array cho nhiều đáp án
  
  // Giải thích
  explanation?: string;
  explanation_audio?: string;
  
  // Trạng thái
  is_completed: boolean; // Đã điền đầy đủ thông tin chưa
  
  created_at: string;
  updated_at: string;
}

// Lựa chọn trong câu hỏi trắc nghiệm
export interface MockTestQuestionOption {
  id: string;
  label: string; // A, B, C, D
  text?: string; // Nội dung text
  image_url?: string; // URL hình ảnh (nếu có)
  audio_url?: string; // URL âm thanh (nếu có)
  is_correct: boolean; // Có phải đáp án đúng không
}

// Template structure types
export interface TemplateQuestionPart {
  /** Số thứ tự phần trong section */
  part_no: number;
  
  /** Tiêu đề phần */
  title: string;
  
  /** Loại câu hỏi: mcq_text (trắc nghiệm text), mcq_image (trắc nghiệm hình), true_false, match_image, pair */
  question_type: 'mcq_text' | 'mcq_image' | 'true_false' | 'match_image' | 'pair' | 'fill_blank' | 'essay';
  
  /** Số lượng câu hỏi trong phần này */
  question_count: number;
  
  /** Số lựa chọn cho mỗi câu (với câu trắc nghiệm) */
  options_count: number;
  
  /** Loại input cần thiết: audio, text, image, hoặc kết hợp */
  input_type: 'audio' | 'text' | 'image' | 'audio + text' | 'audio + image' | 'text + image' | 'audio + text + image';
  
  /** Các trường được phép nhập cho từng câu hỏi */
  allowed_fields: {
    text: boolean;      // Cho phép nhập text câu hỏi
    audio: boolean;     // Cho phép upload file âm thanh
    images: boolean;    // Cho phép upload hình ảnh
    explanation: boolean; // Cho phép nhập giải thích
  };
  
  /** Ghi chú hướng dẫn cho admin */
  notes?: string;
}

export interface TemplateSection {
  /** ID section */
  id: string;
  
  /** Tên section */
  name: string;
  
  /** Thứ tự section */
  order_no: number;
  
  /** Thời gian giới hạn cho section (phút) */
  time_limit: number;
  
  /** Điểm tối đa của section */
  max_score: number;
  
  /** Tổng số câu hỏi trong section */
  total_questions: number;
  
  /** Mô tả section */
  description?: string;
  
  /** Các phần con trong section */
  parts: TemplateQuestionPart[];
}

export interface TemplateStructure {
  /** Tổng thời gian làm bài (phút) */
  total_time_limit: number;
  
  /** Tổng điểm tối đa */
  total_max_score: number;
  
  /** Các section của đề thi */
  sections: TemplateSection[];
}

export interface MockTestTemplate {
  /** ID duy nhất của template. */
  id: string; // uuid
  
  /** Loại đề thi: 'HSK', 'TOCFL', 'D4', 'HSKK' */
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  
  /** Cấp độ đề thi: 'HSK1', 'HSK3', 'BandA', v.v. */
  level: string;
  
  /** Tên mô tả duy nhất của template, ví dụ: 'HSK3 chuẩn'. */
  name: string;
  
  /** Mô tả chi tiết về template. */
  description: string;
  
  /** Trạng thái hoạt động của template. */
  is_active: boolean;
  
  /** Thời điểm tạo. */
  created_at: string;
  
  /** Thời điểm cập nhật cuối cùng. */
  updated_at: string;
  
  /** Cấu trúc chi tiết của template */
  structure: TemplateStructure;
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
