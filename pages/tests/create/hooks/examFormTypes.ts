// pages/tests/create/hooks/examFormTypes.ts
import type { Exam, Section, Subsection, Prompt, Question, Option, Explanation, UUID, CorrectAnswer } from '../../../../types';

export type { CorrectAnswer };

/**
 * Định nghĩa kiểu dữ liệu cho hình ảnh trong một prompt.
 */
export interface PromptImage {
    type: 'image';
    label: string;
    url: string | File;
}

/**
 * Kiểu cho một ảnh đơn.
 */
export interface SingleImage {
    type: 'single_image';
    url: string | File;
}

/**
 * Kiểu cho một danh sách ảnh.
 */
export interface ImageList {
    type: 'image_list';
    images: PromptImage[];
}

/**
 * Các kiểu dữ liệu mở rộng cho form, đảm bảo tất cả các thuộc tính mảng đều tồn tại.
 */
export interface FormOption extends Option {}
export interface FormExplanation extends Explanation {}
export interface FormPrompt extends Prompt {
    image_json?: SingleImage | ImageList;
}
export interface FormQuestion extends Question {
    options: FormOption[];
    explanation?: FormExplanation | null;
    prompt_id?: UUID;
    correct_answers?: CorrectAnswer[]; // Thêm mảng cho các đáp án đúng phức tạp
}
export interface FormSubsection extends Subsection {
    prompts: FormPrompt[];
    questions: FormQuestion[];
}
export interface FormSection extends Section {
    subsections: FormSubsection[];
}
export interface FormExam extends Exam {
    sections: FormSection[];
}
