import { ExamType, ExamLevel, QuestionType } from '../types';

export const MOCK_EXAM_TYPES: ExamType[] = [
  { id: 'hsk', name: 'HSK' },
  { id: 'hskk', name: 'HSKK' },
  { id: 'tocfl', name: 'TOCFL' },
];

export const MOCK_EXAM_LEVELS: ExamLevel[] = [
  // HSK
  { id: 'hsk1', exam_type_id: 'hsk', name: 'HSK 1' },
  { id: 'hsk2', exam_type_id: 'hsk', name: 'HSK 2' },
  { id: 'hsk3', exam_type_id: 'hsk', name: 'HSK 3' },
  { id: 'hsk4', exam_type_id: 'hsk', name: 'HSK 4' },
  { id: 'hsk5', exam_type_id: 'hsk', name: 'HSK 5' },
  { id: 'hsk6', exam_type_id: 'hsk', name: 'HSK 6' },

  // HSKK
  { id: 'hskk_so_cap', exam_type_id: 'hskk', name: 'Sơ cấp' },
  { id: 'hskk_trung_cap', exam_type_id: 'hskk', name: 'Trung cấp' },
  { id: 'hskk_cao_cap', exam_type_id: 'hskk', name: 'Cao cấp' },

  // TOCFL
  { id: 'tocfl_novice', exam_type_id: 'tocfl', name: 'Novice' },
  { id: 'tocfl_band_a', exam_type_id: 'tocfl', name: 'Band A' },
  { id: 'tocfl_band_b', exam_type_id: 'tocfl', name: 'Band B' },
  { id: 'tocfl_band_c', exam_type_id: 'tocfl', name: 'Band C' },
];

export const MOCK_QUESTION_TYPES: QuestionType[] = [
  { id: 'true_false', name: 'Đúng/Sai', description: 'Chọn Đúng hoặc Sai', num_options: 2, has_prompt: false },
  { id: 'multiple_choice_3', name: 'Trắc nghiệm (3 đáp án)', description: 'Chọn 1 trong 3 đáp án', num_options: 3, has_prompt: false },
  { id: 'multiple_choice_4', name: 'Trắc nghiệm (4 đáp án)', description: 'Chọn 1 trong 4 đáp án', num_options: 4, has_prompt: false },
  { id: 'multiple_choice_5', name: 'Trắc nghiệm (5 đáp án - Nối)', description: 'Nối 1 trong 5 đáp án A–E', num_options: 5, has_prompt: true },
  { id: 'arrange_words', name: 'Sắp xếp từ', description: 'Sắp xếp các từ thành câu hoàn chỉnh', num_options: 0, has_prompt: false },
  { id: 'arrange_sentences', name: 'Sắp xếp câu', description: 'Sắp xếp các câu thành đoạn văn', num_options: 0, has_prompt: false },
  { id: 'write_text', name: 'Viết câu trả lời', description: 'Điền câu trả lời dạng văn bản', num_options: 0, has_prompt: false },
];
