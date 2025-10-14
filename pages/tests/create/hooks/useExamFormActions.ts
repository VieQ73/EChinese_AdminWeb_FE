// pages/tests/create/hooks/useExamFormActions.ts
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UUID } from '../../../../types';
import type { FormExam, FormSection, FormSubsection, FormPrompt, FormQuestion } from './examFormTypes';

/**
 * Hook tùy chỉnh chứa tất cả các hàm hành động để cập nhật state của form bài thi.
 * @param setExam - Hàm `setState` từ `useState` của form chính.
 * @param examId - ID của bài thi đang được chỉnh sửa.
 * @returns {object} - Một đối tượng chứa tất cả các hàm hành động đã được memoized.
 */
export const useExamFormActions = (
    setExam: React.Dispatch<React.SetStateAction<FormExam>>,
    examId: UUID
) => {
    const updateExamDetails = useCallback((payload: Partial<FormExam>) => {
        setExam(prev => ({ ...prev, ...payload }));
    }, [setExam]);

    // SECTION handlers
    const addSection = useCallback(() => {
        const newSection: FormSection = { id: uuidv4(), exam_id: examId, name: `Phần mới`, subsections: [] };
        setExam(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    }, [examId, setExam]);

    const updateSection = useCallback((sectionId: UUID, payload: Partial<FormSection>) => {
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => (s.id === sectionId ? { ...s, ...payload } : s)) }));
    }, [setExam]);

    const removeSection = useCallback((sectionId: UUID) => {
        setExam(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }));
    }, [setExam]);

    // SUBSECTION handlers
    const addSubsection = useCallback((sectionId: UUID) => {
        const newSub: FormSubsection = { id: uuidv4(), section_id: sectionId, name: 'Phần con mới', prompts: [], questions: [] };
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: [...s.subsections, newSub] } : s) }));
    }, [setExam]);
    
    const updateSubsection = useCallback((sectionId: UUID, subId: UUID, payload: Partial<FormSubsection>) => {
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, ...payload } : sub) } : s) }));
    }, [setExam]);

    const removeSubsection = useCallback((sectionId: UUID, subId: UUID) => {
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.filter(sub => sub.id !== subId) } : s) }));
    }, [setExam]);

    // PROMPT handlers
    const addPrompt = useCallback((sectionId: UUID, subId: UUID) => {
        const newPrompt: FormPrompt = { id: uuidv4(), subsection_id: subId, content: { html: '' }, image_json: undefined };
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, prompts: [...sub.prompts, newPrompt] } : sub) } : s) }));
    }, [setExam]);

    const updatePrompt = useCallback((sectionId: UUID, subId: UUID, promptId: UUID, payload: Partial<FormPrompt>) => {
         setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, prompts: sub.prompts.map(p => p.id === promptId ? { ...p, ...payload } : p) } : sub) } : s) }));
    }, [setExam]);

    const removePrompt = useCallback((sectionId: UUID, subId: UUID, promptId: UUID) => {
         setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, prompts: sub.prompts.filter(p => p.id !== promptId), questions: sub.questions.filter(q => q.prompt_id !== promptId) } : sub) } : s) }));
    }, [setExam]);

    // QUESTION handlers
    const addQuestion = useCallback((sectionId: UUID, subId: UUID, promptId?: UUID) => {
        const newQ: FormQuestion = { id: uuidv4(), subsection_id: subId, question_type_id: '', content: '', points: 1, options: [], prompt_id: promptId, explanation: null };
         setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, questions: [...sub.questions, newQ] } : sub) } : s) }));
    }, [setExam]);

    const updateQuestion = useCallback((sectionId: UUID, subId: UUID, qId: UUID, payload: Partial<FormQuestion>) => {
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, questions: sub.questions.map(q => q.id === qId ? { ...q, ...payload } : q) } : sub) } : s) }));
    }, [setExam]);

    const removeQuestion = useCallback((sectionId: UUID, subId: UUID, qId: UUID) => {
        setExam(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subId ? { ...sub, questions: sub.questions.filter(q => q.id !== qId) } : sub) } : s) }));
    }, [setExam]);

    return {
        updateExamDetails,
        addSection, updateSection, removeSection,
        addSubsection, updateSubsection, removeSubsection,
        addPrompt, updatePrompt, removePrompt,
        addQuestion, updateQuestion, removeQuestion,
    };
};
