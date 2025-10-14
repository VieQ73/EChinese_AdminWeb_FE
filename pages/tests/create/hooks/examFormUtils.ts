// pages/tests/create/hooks/examFormUtils.ts
import { v4 as uuidv4 } from 'uuid';
import type { ExamFull, SectionFull, SubsectionFull, QuestionFull } from '../../../../types/mocktest_extended';
import type { FormExam, FormSection, FormSubsection, FormQuestion, FormPrompt } from './examFormTypes';

/**
 * Tạo một đối tượng bài thi rỗng với các giá trị mặc định.
 * @returns {FormExam} - Một đối tượng bài thi mới.
 */
export const createNewExam = (): FormExam => ({
    id: uuidv4(),
    exam_type_id: '',
    exam_level_id: '',
    name: '',
    description: { html: '' },
    instructions: '',
    total_time_minutes: 0,
    created_by: 'admin-user-id', // Sẽ được thay thế bằng ID người dùng thực tế
    sections: [],
    is_published: false,
});

/**
 * Chuẩn hóa dữ liệu bài thi từ API để đảm bảo tất cả các mảng con (sections, subsections, etc.) đều tồn tại.
 * Điều này giúp tránh lỗi runtime khi truy cập các thuộc tính có thể là `undefined`.
 * @param {ExamFull} examData - Dữ liệu bài thi thô từ API.
 * @returns {FormExam} - Dữ liệu bài thi đã được chuẩn hóa.
 */
export const normalizeExamData = (examData: ExamFull): FormExam => {
    return {
        ...createNewExam(),
        ...examData,
        sections: (examData.sections || []).map((section: SectionFull) => ({
            ...section,
            subsections: (section.subsections || []).map((subsection: SubsectionFull) => ({
                ...subsection,
                prompts: (subsection.prompts || []) as FormPrompt[],
                questions: (subsection.questions || []).map((question: QuestionFull) => ({
                    ...question,
                    options: question.options || [],
                    explanation: question.explanation || null,
                })) as FormQuestion[],
            })) as FormSubsection[],
        })) as FormSection[],
    };
};
