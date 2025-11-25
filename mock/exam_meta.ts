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

// export const MOCK_QUESTION_TYPES: QuestionType[] = [
//   { id: '939e4911-855c-429e-be26-8b65496cbc5e', name: 'Đúng/Sai', description: 'Chọn Đúng hoặc Sai', num_options: 2, has_prompt: false },
//   { id: '63639b48-15cf-45e6-b751-8c2cb9c196d6', name: 'Trắc nghiệm (3 đáp án)', description: 'Chọn 1 trong 3 đáp án', num_options: 3, has_prompt: false },
//   { id: '2f9e02e6-ab9d-41dd-9b68-3ba00657cb97', name: 'Trắc nghiệm (4 đáp án)', description: 'Chọn 1 trong 4 đáp án', num_options: 4, has_prompt: false },
//   { id: 'aa36f5b2-4337-4f5a-9e47-c342bd20a635', name: 'Trắc nghiệm (5 đáp án - Nối)', description: 'Nối 1 trong 5 đáp án A–E', num_options: 5, has_prompt: true },
//   { id: '3219c39c-2721-450d-bd7c-b338a87e4903', name: 'Sắp xếp từ', description: 'Sắp xếp các từ thành câu hoàn chỉnh', num_options: 0, has_prompt: false },
//   { id: '241a3174-e38a-41aa-89f9-c0c467a67208', name: 'Sắp xếp câu', description: 'Sắp xếp các câu thành đoạn văn', num_options: 0, has_prompt: false },
//   { id: '740ed013-c97f-4a85-a4ab-ef942a4d1b92', name: 'Viết câu trả lời', description: 'Điền câu trả lời dạng văn bản', num_options: 0, has_prompt: false },
//   { id: 'c820bb0f-40c3-445a-b2c0-c0acb4027639', name: 'Trả lời bằng ghi âm', description: 'Ghi âm câu trả lời', num_options: 0, has_prompt: false },
// ];

export const MOCK_QUESTION_TYPES: QuestionType[] = [
  { id: '57f47e8d-1947-4f26-86fd-1a3c35380283', name: 'Đúng/Sai', description: 'Chọn Đúng hoặc Sai', num_options: 2, has_prompt: false },
  { id: 'e56ebe11-eb6f-484e-90ba-aa0b7cb25bb4', name: 'Trắc nghiệm (3 đáp án)', description: 'Chọn 1 trong 3 đáp án', num_options: 3, has_prompt: false },
  { id: '3a9ec88e-5da7-4ca6-9fab-90c03894f83f', name: 'Trắc nghiệm (4 đáp án)', description: 'Chọn 1 trong 4 đáp án', num_options: 4, has_prompt: false },
  { id: '516f77ac-ae0a-4651-9335-f7b77749fd44', name: 'Trắc nghiệm (5 đáp án - Nối)', description: 'Nối 1 trong 5 đáp án A–E', num_options: 5, has_prompt: true },
  { id: '55892476-5a6b-41e5-9e94-cec5eec6a666', name: 'Sắp xếp từ', description: 'Sắp xếp các từ thành câu hoàn chỉnh', num_options: 0, has_prompt: false },
  { id: '3294ccd6-9da4-4f80-81c4-3c00b2d833b3', name: 'Sắp xếp câu', description: 'Sắp xếp các câu thành đoạn văn', num_options: 0, has_prompt: false },
  { id: '67eb73d4-d2f2-41b0-8594-8285718e3ed6', name: 'Viết câu trả lời', description: 'Điền câu trả lời dạng văn bản', num_options: 0, has_prompt: false },
  { id: '04fe8595-6e7f-481a-82fd-1f4a008fae29', name: 'Trả lời bằng ghi âm', description: 'Ghi âm câu trả lời', num_options: 0, has_prompt: false },
];