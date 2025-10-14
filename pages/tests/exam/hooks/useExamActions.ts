import { useCallback } from 'react';
import { ExamSummary } from '../../../../types/mocktest_extended';
import { duplicateExam } from '../../api';
import { MOCK_EXAMS } from '../../../../mock/exams';
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
            // Xác định tên gốc và tạo tên mới cho bản sao
            const baseName = examToCopy.name.replace(/^\[Bản sao\]\s*/, '').replace(/\s*\[Bản sao\]\s*\(\d+\)$/, '').trim();
            const existingVersions = MOCK_EXAMS.filter(e => e.name.includes(baseName));
            
            let newName = '';
            const firstCopyName = `[Bản sao] ${baseName}`;
            const hasFirstCopy = existingVersions.some(e => e.name === firstCopyName);

            if (!hasFirstCopy) {
                newName = firstCopyName;
            } else {
                const copyNumberRegex = /\[Bản sao\] \((\d+)\)$/;
                let maxNumber = 1;
                existingVersions.forEach(e => {
                    const match = e.name.match(copyNumberRegex);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNumber) maxNumber = num;
                    }
                });
                newName = `${baseName} [Bản sao] (${maxNumber + 1})`;
            }

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
        
        switch(action) {
            case 'copy':
                handleCopyExam(exam);
                break;
            case 'delete':
                if (exam.is_published) {
                    setInfoModalContent({
                        title: 'Không thể xóa bài thi',
                        message: 'Không thể xóa bài thi đã được xuất bản. Vui lòng thu hồi bài thi trước khi xóa.',
                    });
                    setIsInfoModalOpen(true);
                } else {
                    setActionState({ action, exam });
                }
                break;
            case 'restore':
            case 'delete-permanently':
                setActionState({ action, exam });
                break;
            case 'publish':
            case 'unpublish':
                setAllExams(prev => prev.map(e => e.id === exam.id ? { ...e, is_published: !e.is_published } : e));
                break;
            default:
                break;
        }
    }, [isCopying, handleCopyExam, setAllExams, setActionState, setInfoModalContent, setIsInfoModalOpen]);
    
    // Xử lý khi người dùng xác nhận hành động trong modal
    const handleConfirmAction = useCallback(() => {
        if (!actionState) return;
        const { action, exam } = actionState;

        setAllExams(prev => {
            if (action === 'delete') return prev.map(e => e.id === exam.id ? { ...e, is_deleted: true } : e);
            if (action === 'restore') return prev.map(e => e.id === exam.id ? { ...e, is_deleted: false } : e);
            if (action === 'delete-permanently') return prev.filter(e => e.id !== exam.id);
            return prev;
        });
        
        setActionState(null);
    }, [actionState, setAllExams, setActionState]);

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
