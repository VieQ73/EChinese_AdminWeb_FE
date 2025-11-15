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

    const handleOpenDetailModal = useCallback(async (post: Post) => {
        // Mở modal trước để tạo cảm giác phản hồi nhanh (có thể thêm spinner sau)
        setters.setDetailModalOpen(true);
        try {
            const fresh = await api.fetchPostById(post.id);
            setters.setViewingPost(fresh || post);
        } catch (e) {
            // Nếu lỗi, vẫn hiển thị dữ liệu tạm thời
            setters.setViewingPost(post);
        }
    }, [setters]);

    const handleUserClick = useCallback(async (user: User) => {
        console.log(user);
        
        // Guard: if clicking same user while a fetch is already in progress, ignore
        if (state.selectedUser?.id === user.id && state.selectedUserActivity === undefined) {
            return;
        }

        setters.setDetailModalOpen(false);
        setters.setInitialActivityTab(undefined);
        setters.setInitialActivitySubTab(undefined);
        setters.setSelectedUser(user);

        // If we already have loaded activity for this user, just open modal
        if (state.selectedUserActivity && state.selectedUser?.id === user.id) {
            setters.setUserActivityModalOpen(true);
            return;
        }

        // Set loading state only if not already loading
        setters.setSelectedUserActivity(undefined);
        setters.setUserActivityModalOpen(true); // Open immediately for responsiveness
        try {
            console.log(`Loading community activity for user ${user.id}...`);
            
            const activity = await api.fetchUserCommunityActivity(user.id);
            setters.setSelectedUserActivity(activity);
        } catch (e) {
            console.error('Failed to load user community activity', e);
            setters.setSelectedUserActivity(null);
        }
    }, [setters, state.selectedUser, state.selectedUserActivity]);

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
                const postUpdatePayload = {
                    status: (action === 'remove' ? 'removed' : 'published') as RawPost['status'],
                    deleted_at: action === 'remove' ? new Date().toISOString() : null,
                    deleted_by: action === 'remove' ? currentUser.id : null,
                    deleted_reason: action === 'remove' ? reasonForLog : null, // Sử dụng lý do tự động
                };
                context.updatePost(item.id, postUpdatePayload);

                // Nếu admin/mod đang gỡ bài người khác và có ruleIds + severity -> gửi chung cả violation
                if (action === 'remove' && !isSelfAction && ruleIds && ruleIds.length > 0 && severity) {
                    await api.moderatePost(item.id, {
                        action: 'remove',
                        post_update: postUpdatePayload,
                        violation: {
                            ruleIds,
                            severity,
                            resolution: resolution || 'Nội dung đã bị gỡ.',
                            reason: reasonForLog,
                            performed_by: currentUser.id,
                            user_id: item.user_id,
                            target_type: 'post',
                            target_id: item.id,
                        }
                    });
                } else {
                    // Trường hợp tự gỡ hoặc khôi phục thì gọi moderatePost
                    await api.moderatePost(item.id, {
                        action,
                        post_update: postUpdatePayload
                    });
                }
            } else { // type === 'comment'
                const payload = {
                    deleted_at: action === 'remove' ? new Date().toISOString() : null,
                    deleted_by: action === 'remove' ? currentUser.id : null,
                    deleted_reason: action === 'remove' ? reasonForLog : null, // Sử dụng lý do tự động
                };
                const updatedCommentEnvelope = await api.updateComment(item.id, payload);
                context.updateComment(item.id, updatedCommentEnvelope.data);
            }

            // Nếu khôi phục bài người khác, xóa violation nếu có
            if (action === 'restore' && !isSelfAction) {
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
                const updatedPost = await api.updatePost(state.editingPost.id, postData);
                // Cập nhật context để đồng bộ chỉ số
                context.updatePost(state.editingPost.id, updatedPost);
                refreshData();
            } else {
                const newRawPost = await api.createPost(postData, currentUser);
                // Cập nhật context để đồng bộ chỉ số ở Dashboard và StatsDisplay
                context.addPost(newRawPost);
                // Tải lại feed để hiển thị bài mới nhất ở đầu trang
                refreshData(); 
            }
            setters.setCreateEditModalOpen(false);
        } catch (error) {
             console.error("Failed to save post", error);
             alert("Lưu bài viết thất bại.");
        }
    }, [currentUser, state.editingPost, setters, refreshData, context]);

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
        setTimeout(() => { handleOpenDetailModal(post); }, 100);
    }, [setters, handleOpenDetailModal]);

    return {
        handleOpenCreateModal,
        handleOpenEditModal,
        handleOpenDetailModal,
        handleUserClick,
        handleOpenModerationModal,
        handleConfirmModerationAction,
        handleSavePost,
        handleToggleLike,
        handleToggleView,
        handlePostSelectFromActivity,
    };
};