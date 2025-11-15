import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamSummary } from '../../../../types/mocktest_extended';
import { useAppData } from '../../../../contexts/AppDataContext';
// API 'deleteExam' vẫn được dùng cho xóa vĩnh viễn, không qua context
import { deleteExam } from '../../api'; 
import { ActionState, InfoModalContent } from './useExamState';

// Định nghĩa props cho hook
interface UseExamActionsProps {
    isCopying: boolean;
    setIsCopying: (isCopying: boolean) => void;
    setActionState: (state: ActionState | null) => void;
    setInfoModalContent: (content: InfoModalContent) => void;
    setIsInfoModalOpen: (isOpen: boolean) => void;
    actionState: ActionState | null;
}

/**
 * Hook tùy chỉnh quản lý tất cả các hành động liên quan đến bài thi.
 * Hook này giờ đây sẽ điều phối các hành động tới AppDataContext.
 */
export const useExamActions = ({
    isCopying,
    setIsCopying,
    setActionState,
    setInfoModalContent,
    setIsInfoModalOpen,
    actionState,
}: UseExamActionsProps) => {
    const navigate = useNavigate();
    const { 
        duplicateExam: duplicateExamInContext,
        trashExam: trashExamInContext,
        restoreExam: restoreExamInContext,
        updateExam: updateExamInContext,
        publishExam: publishExamInContext,
        unpublishExam: unpublishExamInContext,
        deleteExam: deleteExamInContext, // Dùng cho xóa vĩnh viễn
    } = useAppData();

    // Logic sao chép bài thi
    const handleCopyExam = useCallback(async (examToCopy: ExamSummary) => {
        setIsCopying(true);
        try {
            const baseName = examToCopy.name.replace(/^\[Bản sao\]\s*/, '').replace(/\s*\[Bản sao\]\s*\(\d+\)$/, '').trim();
            const newName = `[Bản sao] ${baseName}`;
            const newExam = await duplicateExamInContext(examToCopy.id, newName);
            navigate(`/mock-tests/edit/${newExam.id}`);
        } catch (error) {
            alert(`Sao chép thất bại: ${(error as Error).message}`);
        } finally {
            setIsCopying(false);
        }
    }, [duplicateExamInContext, navigate, setIsCopying]);

    // Hàm điều phối chính cho các hành động trên thẻ bài thi
    const handleAction = useCallback((action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => {
        if (isCopying) return;
        
        if (action === 'copy') {
            handleCopyExam(exam);
            return;
        }
        
        setActionState({ action, exam });

    }, [isCopying, handleCopyExam]);
    
    // Xử lý khi người dùng xác nhận hành động trong modal
    const handleConfirmAction = useCallback(async () => {
        if (!actionState) return;
        const { action, exam } = actionState;

        try {
            switch (action) {
                case 'delete':
                    await trashExamInContext(exam.id);
                    break;
                case 'restore':
                    await restoreExamInContext(exam.id);
                    break;
                case 'publish':
                    await publishExamInContext(exam.id);
                    break;
                case 'unpublish':
                    await unpublishExamInContext(exam.id);
                    break;
                case 'delete-permanently':
                    // Xóa vĩnh viễn vẫn gọi trực tiếp vì nó xóa khỏi DB và state
                    await deleteExamInContext(exam.id);
                    break;
            }
            // Không cần cập nhật state cục bộ ở đây nữa.
            // Component sẽ tự động re-render vì AppDataContext đã thay đổi.

        } catch (error) {
            setInfoModalContent({
                title: 'Thao tác thất bại',
                message: `Đã có lỗi xảy ra: ${(error as Error).message}`,
            });
            setIsInfoModalOpen(true);
        } finally {
            setActionState(null);
        }
    }, [actionState, trashExamInContext, restoreExamInContext, updateExamInContext, deleteExamInContext, setActionState, setInfoModalContent, setIsInfoModalOpen]);

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
