import { useCallback } from 'react';
import { User, Post, RawPost, CommentWithUser, Violation, CommunityRule } from '../../../types';
import { ModerationAction } from './useCommunityState';
import * as api from '../api'; // Import tất cả các hàm từ api.ts

interface ModerationConfirmPayload {
    logReason: string;
    ruleIds?: string[];
    resolution?: string;
    severity?: Violation['severity'];
}

interface UseCommunityHandlersProps {
    currentUser: User | null;
    state: any; // from useCommunityState
    setters: any; // from useCommunityState
    context: any; // from useAppData
    refreshData: () => void; // Hàm để tải lại dữ liệu
}

export const useCommunityHandlers = ({ currentUser, state, setters, context, refreshData }: UseCommunityHandlersProps) => {

    const handleOpenCreateModal = useCallback(() => {
        setters.setEditingPost(null);
        setters.setCreateEditModalOpen(true);
    }, [setters]);

    const handleOpenEditModal = useCallback((post: Post) => {
        setters.setEditingPost(post);
        setters.setCreateEditModalOpen(true);
    }, [setters]);

    const handleOpenDetailModal = useCallback((post: Post) => {
        setters.setViewingPost(post);
        setters.setDetailModalOpen(true);
    }, [setters]);

    const handleUserClick = useCallback((user: User) => {
        setters.setDetailModalOpen(false);
        setters.setInitialActivityTab(undefined);
        setters.setInitialActivitySubTab(undefined);
        setters.setSelectedUser(user);
        setters.setUserActivityModalOpen(true);
    }, [setters]);

    const handleOpenModerationModal = useCallback((action: 'remove' | 'restore', type: 'post' | 'comment', item: Post | CommentWithUser) => {
        const isSelfAction = currentUser?.id === item.user_id;
        setters.setModerationAction({ action, type, item, isSelfAction });
        setters.setModerationModalOpen(true);
    }, [currentUser, setters]);

    const handleConfirmModerationAction = useCallback(async (data: ModerationConfirmPayload) => {
        if (!state.moderationAction || !currentUser) return;

        const { action, type, item, isSelfAction } = state.moderationAction as ModerationAction;
        const { logReason, ruleIds, resolution, severity } = data;

        // Tự động xác định lý do cho log và content khi người dùng tự thao tác
        const reasonForLog = isSelfAction
            ? (action === 'remove' ? 'Tự gỡ' : 'Tự khôi phục')
            : logReason;

        try {
            // Optimistic update trong context
            if (type === 'post') {
                const payload = {
                    status: (action === 'remove' ? 'removed' : 'published') as RawPost['status'],
                    deleted_at: action === 'remove' ? new Date().toISOString() : null,
                    deleted_by: action === 'remove' ? currentUser.id : null,
                    deleted_reason: action === 'remove' ? reasonForLog : null, // Sử dụng lý do tự động
                };
                context.updatePost(item.id, payload);
                await api.updatePost(item.id, payload);
            } else { // type === 'comment'
                const payload = {
                    deleted_at: action === 'remove' ? new Date().toISOString() : null,
                    deleted_by: action === 'remove' ? currentUser.id : null,
                    deleted_reason: action === 'remove' ? reasonForLog : null, // Sử dụng lý do tự động
                };
                const updatedComment = await api.updateComment(item.id, payload);
                context.updateComment(item.id, updatedComment);
            }

            // Chỉ tạo violation và log phức tạp khi admin/mod gỡ bài người khác
            if (action === 'remove' && !isSelfAction && ruleIds && ruleIds.length > 0 && severity) {
                context.addViolation({ 
                    user_id: item.user_id, 
                    target_type: type, 
                    target_id: item.id, 
                    ruleIds, 
                    severity, 
                    resolution: resolution || `Nội dung đã bị gỡ.`,
                    detected_by: currentUser.role === 'super admin' ? 'super admin' : 'admin'
                });
            } else if (action === 'restore' && !isSelfAction) {
                // Khi admin khôi phục bài, xóa violation nếu có
                context.removeViolationByTarget(type, item.id);
            }
            
            // Luôn ghi log cho mọi hành động gỡ/khôi phục
            context.addModerationLog({ target_type: type, target_id: item.id, action, reason: reasonForLog, performed_by: currentUser.id });

            setters.setModerationModalOpen(false);
            setters.setModerationAction(null);
            refreshData();
        } catch (error) {
            console.error("Failed to confirm moderation action", error);
            alert("Đã có lỗi xảy ra.");
            // Cân nhắc revert lại optimistic update ở đây nếu cần
        }
    }, [state.moderationAction, currentUser, context, setters, refreshData]);
    
    const handleSavePost = useCallback(async (postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>) => {
        if (!currentUser) return;
        try {
            if (state.editingPost) {
                await api.updatePost(state.editingPost.id, postData);
            } else {
                await api.createPost(postData, currentUser);
            }
            setters.setCreateEditModalOpen(false);
            refreshData(); // Tải lại dữ liệu
        } catch (error) {
             console.error("Failed to save post", error);
             alert("Lưu bài viết thất bại.");
        }
    }, [currentUser, state.editingPost, setters, refreshData]);

    const handleToggleLike = useCallback(async (postId: string) => {
        if (!currentUser) return;
        // Optimistic update
        context.toggleLike(postId, currentUser.id);
        try {
            await api.toggleLike(postId, currentUser.id);
        } catch (error) {
            // Revert state if API fails
            context.toggleLike(postId, currentUser.id);
            alert('Thao tác thất bại, vui lòng thử lại.');
        }
    }, [currentUser, context]);

    const handleToggleView = useCallback(async (postId: string) => {
        if (!currentUser) return;
        // Optimistic update
        context.toggleView(postId, currentUser.id);
        try {
            await api.toggleView(postId, currentUser.id);
        } catch (error) {
            // Revert state if API fails
            context.toggleView(postId, currentUser.id);
            alert('Thao tác thất bại, vui lòng thử lại.');
        }
    }, [currentUser, context]);

    const handlePostSelectFromActivity = useCallback((post: Post) => {
        setters.setUserActivityModalOpen(false);
        setTimeout(() => handleOpenDetailModal(post), 100);
    }, [setters, handleOpenDetailModal]);

    return {
        handleOpenCreateModal,
        handleOpenEditModal,
        handleOpenDetailModal,
        handleUserClick,
        handleOpenModerationModal,
        handleConfirmModerationAction,
        handleSavePost,
        // handleAddComment is removed as it's now handled by the modal + context
        handleToggleLike,
        handleToggleView,
        handlePostSelectFromActivity,
    };
};