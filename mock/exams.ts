// mock_exams.ts
import { ExamFull } from '../types/mocktest_extended'
import type { UUID, Timestamp } from '../types/base'

const now: Timestamp = new Date().toISOString() as Timestamp

export const MOCK_EXAMS: ExamFull[] = [
  {
    id: 'exam-hsk1-2025' as UUID,
    exam_type_id: 'hsk' as UUID,
    exam_level_id: 'hsk1' as UUID,
    name: 'Đề thi thử HSK 1 - 2025',
    description: '<p>Đề thi mô phỏng cấu trúc mới nhất của kỳ thi HSK 1.</p>',
    instructions: '<p>Hoàn thành tất cả các phần thi trong thời gian quy định.</p>',
    total_time_minutes: 40,
    total_questions: 60,
    passing_score_total: 120,
    is_published: true,
    created_by: 'admin-user' as UUID,
    created_at: now,
    is_deleted: false,
    sections: [
      { id: 'sec-hsk1-1' as UUID, exam_id: 'exam-hsk1-2025' as UUID, name: 'Nghe hiểu', order: 1, time_minutes: 20, is_deleted: false },
      { id: 'sec-hsk1-2' as UUID, exam_id: 'exam-hsk1-2025' as UUID, name: 'Đọc hiểu', order: 2, time_minutes: 20, is_deleted: false },
    ],
  },
  {
    id: 'exam-tocfl-a' as UUID,
    exam_type_id: 'tocfl' as UUID,
    exam_level_id: 'tocfl_band_a' as UUID,
    name: 'TOCFL Band A - Đề mẫu 2025',
    description: '<p>Đề thi thử năng lực Hoa ngữ TOCFL cấp độ Band A.</p>',
    instructions: '<p>Hãy đọc kỹ hướng dẫn trước khi bắt đầu.</p>',
    total_time_minutes: 60,
    total_questions: 80,
    passing_score_total: 180,
    is_published: false,
    created_by: 'admin-user' as UUID,
    created_at: now,
    is_deleted: false,
    sections: [
      { id: 'sec-tocfl-a-1' as UUID, exam_id: 'exam-tocfl-a' as UUID, name: 'Nghe hiểu', order: 1, time_minutes: 30, is_deleted: false },
      { id: 'sec-tocfl-a-2' as UUID, exam_id: 'exam-tocfl-a' as UUID, name: 'Đọc hiểu', order: 2, time_minutes: 30, is_deleted: false },
    ],
  },
  {
    id: 'exam-hskk-basic' as UUID,
    exam_type_id: 'hskk' as UUID,
    exam_level_id: 'hskk_basic' as UUID,
    name: 'HSKK Sơ cấp - Đề mẫu 2025',
    description: '<p>Bài thi thử HSKK sơ cấp gồm 3 phần: Nghe, Nói và Ghi âm.</p>',
    instructions: '<p>Chuẩn bị tai nghe và micro trước khi làm bài.</p>',
    total_time_minutes: 25,
    total_questions: 30,
    is_published: true,
    created_by: 'admin-user' as UUID,
    created_at: now,
    is_deleted: false,
    sections: [
      { id: 'sec-hskk-basic-1' as UUID, exam_id: 'exam-hskk-basic' as UUID, name: 'Nghe và lặp lại', order: 1, time_minutes: 10, is_deleted: false },
      { id: 'sec-hskk-basic-2' as UUID, exam_id: 'exam-hskk-basic' as UUID, name: 'Trả lời câu hỏi', order: 2, time_minutes: 10, is_deleted: false },
      { id: 'sec-hskk-basic-3' as UUID, exam_id: 'exam-hskk-basic' as UUID, name: 'Nói tự do', order: 3, time_minutes: 5, is_deleted: false },
    ],
  },
]
