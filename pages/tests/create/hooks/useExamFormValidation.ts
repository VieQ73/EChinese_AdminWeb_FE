// pages/tests/create/hooks/useExamFormValidation.ts
import { useCallback, useMemo } from 'react';
import { calculateQuestionNumber } from '../../../../utils/numbering';
import type { FormExam } from './examFormTypes';

/**
 * Hook tùy chỉnh để quản lý logic xác thực của form bài thi.
 * @param {FormExam} exam - State hiện tại của bài thi.
 * @returns {{ getValidationError: () => string | null, isFormValid: boolean }} - Hàm lấy lỗi và trạng thái hợp lệ.
 */
export const useExamFormValidation = (exam: FormExam) => {
    /**
     * Kiểm tra toàn bộ form và trả về thông báo lỗi đầu tiên tìm thấy.
     * @returns {string | null} - Chuỗi thông báo lỗi hoặc null nếu không có lỗi.
     */
    const getValidationError = useCallback((): string | null => {
        if (!exam.name || !exam.exam_type_id || !exam.exam_level_id || !exam.total_time_minutes) {
            return 'Vui lòng điền đầy đủ các trường thông tin cơ bản bắt buộc (Tên, Loại, Cấp độ, Thời gian).';
        }

        for (const [sectionIndex, section] of exam.sections.entries()) {
            for (const [subsectionIndex, subsection] of section.subsections.entries()) {
                for (const [questionIndex, question] of subsection.questions.entries()) {
                    
                    const qNum = calculateQuestionNumber(exam.sections, sectionIndex, subsectionIndex, questionIndex);

                    if (!question.explanation?.content?.replace(/<[^>]*>/g, '').trim()) {
                        return `Câu hỏi số ${qNum} thiếu phần giải thích.`;
                    }

                    const isSelectionType = question.question_type_id.includes('multiple_choice') || question.question_type_id.includes('true_false');
                    const isArrangeType = question.question_type_id.includes('arrange');

                    if (isSelectionType) {
                        if (!question.options.some(opt => opt.is_correct)) {
                            return `Câu hỏi số ${qNum} chưa được chọn đáp án đúng.`;
                        }
                    } else if (isArrangeType) {
                        if (question.options.length < 2) {
                            return `Câu hỏi sắp xếp số ${qNum} cần có ít nhất 2 phương án.`;
                        }
                    }
                }
            }
        }

        return null; // Không có lỗi
    }, [exam]);

    /**
     * Trạng thái boolean cho biết form có hợp lệ hay không.
     */
    const isFormValid = useMemo(() => getValidationError() === null, [getValidationError]);

    return { getValidationError, isFormValid };
};
