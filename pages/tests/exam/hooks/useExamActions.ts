import { useCallback } from 'react';
import { ExamSummary } from '../../../../types/mocktest_extended';
import { duplicateExam, trashExam, restoreExam, publishExam, unpublishExam, deleteExam } from '../../api';
import { ActionState, InfoModalContent } from './useExamState';

// Định nghĩa props cho hook
interface UseExamActionsProps {
    isCopying: boolean;
    setIsCopying: (isCopying: boolean) => void;
    setAllExams: React.Dispatch<React.SetStateAction<ExamSummary[]>>;
    setActionState: (state: ActionState | null) => void;
    setInfoModalContent: (content: InfoModalContent) => void;
    setIsInfoModalOpen: (isOpen: boolean) => void;
    actionState: ActionState | null;
}

/**
 * Hook tùy chỉnh quản lý tất cả các hành động liên quan đến bài thi.
 */
export const useExamActions = ({
    isCopying,
    setIsCopying,
    setAllExams,
    setActionState,
    setInfoModalContent,
    setIsInfoModalOpen,
    actionState,
}: UseExamActionsProps) => {

    // Logic sao chép bài thi
    const handleCopyExam = useCallback(async (examToCopy: ExamSummary) => {
        setIsCopying(true);
        try {
            // The logic for determining the new name should ideally be on the backend,
            // but we'll keep the frontend logic for mock API and as a fallback.
            const baseName = examToCopy.name.replace(/^\[Bản sao\]\s*/, '').replace(/\s*\[Bản sao\]\s*\(\d+\)$/, '').trim();
            const newName = `[Bản sao] ${baseName}`; // Simplified for real API

            const newExamSummary = await duplicateExam(examToCopy.id, newName);
            setAllExams(prev => [newExamSummary, ...prev]);
        } catch (error) {
            alert(`Sao chép thất bại: ${(error as Error).message}`);
        } finally {
            setIsCopying(false);
        }
    }, [setAllExams, setIsCopying]);

    // Hàm điều phối chính cho các hành động trên thẻ bài thi
    const handleAction = useCallback((action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => {
        if (isCopying) return;
        
        // For all actions that require confirmation, just set the state
        setActionState({ action, exam });

    }, [isCopying]);
    
    // Xử lý khi người dùng xác nhận hành động trong modal
    const handleConfirmAction = useCallback(async () => {
        if (!actionState) return;
        const { action, exam } = actionState;

        try {
            let updatedExam: ExamSummary | null = null;
            let shouldRemove = false;

            switch (action) {
                case 'delete':
                    updatedExam = await trashExam(exam.id);
                    break;
                case 'restore':
                    updatedExam = await restoreExam(exam.id);
                    break;
                case 'publish':
                    updatedExam = await publishExam(exam.id);
                    break;
                case 'unpublish':
                    updatedExam = await unpublishExam(exam.id);
                    break;
                case 'delete-permanently':
                    await deleteExam(exam.id);
                    shouldRemove = true;
                    break;
            }

            if (shouldRemove) {
                setAllExams(prev => prev.filter(e => e.id !== exam.id));
            } else if (updatedExam) {
                // Merge the updated fields into the existing exam object
                setAllExams(prev => prev.map(e => e.id === updatedExam!.id ? { ...e, ...updatedExam } : e));
            }

        } catch (error) {
            setInfoModalContent({
                title: 'Thao tác thất bại',
                message: `Đã có lỗi xảy ra: ${(error as Error).message}`,
            });
            setIsInfoModalOpen(true);
        } finally {
            setActionState(null);
        }
    }, [actionState, setAllExams, setActionState, setInfoModalContent, setIsInfoModalOpen]);

    // Lấy nội dung cho modal xác nhận dựa trên hành động
    const getConfirmModalContent = useCallback(() => {
        if (!actionState) return { title: '', content: '', confirmText: '' };
        const { action, exam } = actionState;
        switch(action) {
            case 'delete':
                return { 
                    title: 'Chuyển vào thùng rác', 
                    content: `Bạn có chắc chắn muốn chuyển bài thi "${exam.name}" vào thùng rác không?`,
                    confirmText: 'Chuyển vào thùng rác'
                };
            case 'restore':
                return { 
                    title: 'Khôi phục bài thi', 
                    content: `Bạn có chắc chắn muốn khôi phục bài thi "${exam.name}" không?`,
                    confirmText: 'Khôi phục'
                };
            case 'delete-permanently':
                return { 
                    title: 'Xóa vĩnh viễn bài thi', 
                    content: `Bạn có chắc chắn muốn xóa vĩnh viễn bài thi "${exam.name}" không? Hành động này không thể hoàn tác.`,
                    confirmText: 'Xóa vĩnh viễn'
                };
            case 'publish':
                return {
                    title: 'Xuất bản bài thi',
                    content: `Bạn có chắc chắn muốn xuất bản bài thi "${exam.name}"?`,
                    confirmText: 'Xuất bản'
                };
            case 'unpublish':
                return {
                    title: 'Hủy xuất bản bài thi',
                    content: `Bạn có chắc chắn muốn hủy xuất bản bài thi "${exam.name}"?`,
                    confirmText: 'Hủy xuất bản'
                };
            default:
                return { title: '', content: '', confirmText: '' };
        }
    }, [actionState]);

    return {
        handleAction,
        handleConfirmAction,
        getConfirmModalContent,
    };
};
