import type { FormSection } from '../pages/tests/create/hooks/useExamForm';

/**
 * Loại bỏ các thẻ HTML và rút gọn văn bản.
 * @param html - Chuỗi HTML đầu vào.
 * @param length - Độ dài tối đa của chuỗi trả về.
 * @returns Chuỗi văn bản đã được xử lý.
 */
export const stripHtmlAndTruncate = (html: string | undefined, length: number = 50): string => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>?/gm, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Tính toán số thứ tự tuyệt đối của một câu hỏi trong toàn bộ bài thi.
 * @param sections - Mảng các phần của bài thi.
 * @param currentSectionIndex - Index của phần hiện tại.
 * @param currentSubsectionIndex - Index của phần con hiện tại.
 * @param currentQuestionIndex - Index của câu hỏi hiện tại trong mảng questions của phần con.
 * @returns Số thứ tự tuyệt đối của câu hỏi.
 */
export const calculateQuestionNumber = (
    sections: FormSection[],
    currentSectionIndex: number,
    currentSubsectionIndex: number,
    currentQuestionIndex: number
): number => {
    let questionCount = 0;
    // Đếm câu hỏi trong các section trước
    for (let i = 0; i < currentSectionIndex; i++) {
        const section = sections[i];
        if (section.subsections) {
            for (const subsection of section.subsections) {
                questionCount += subsection.questions?.length || 0;
            }
        }
    }

    // Đếm câu hỏi trong các subsection trước trong section hiện tại
    const currentSection = sections[currentSectionIndex];
    if (currentSection && currentSection.subsections) {
        for (let j = 0; j < currentSubsectionIndex; j++) {
            const subsection = currentSection.subsections[j];
            questionCount += subsection.questions?.length || 0;
        }
    }
    
    // Cộng với index của câu hỏi hiện tại
    questionCount += currentQuestionIndex + 1;

    return questionCount;
};
