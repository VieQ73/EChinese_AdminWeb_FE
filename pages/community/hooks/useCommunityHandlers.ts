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
    updatePostInList?: (postId: string, updates: Partial<Post>) => void; // Hàm để update post trong list
}

export const useCommunityHandlers = ({ currentUser, state, setters, context, refreshData, updatePostInList }: UseCommunityHandlersProps) => {

    const handleOpenCreateModal = useCallback(() => {
        setters.setEditingPost(null);
        setters.setCreateEditModalOpen(true);
    }, [setters]);

    const handleOpenEditModal = useCallback((post: Post) => {
        setters.setEditingPost(post);
        setters.setCreateEditModalOpen(true);
    }, [setters]);

    const handleOpenDetailModal = useCallback(async (post: Post) => {
        // Mở modal trước để tạo cảm giác phản hồi nhanh
        setters.setDetailModalOpen(true);
        setters.setViewingPost(post); // Set ngay để modal hiển thị
        try {
            // Fetch dữ liệu mới nhất
            const fresh = await api.fetchPostById(post.id);
            setters.setViewingPost(fresh || post);
        } catch (e) {
            console.error('Error fetching fresh post data:', e);
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
        
        // Chỉ reset initial tabs nếu đang không có giá trị được set từ URL
        // (để giữ lại giá trị khi navigate từ report/notification)
        if (!state.initialActivityTab && !state.initialActivitySubTab) {
            setters.setInitialActivityTab(undefined);
            setters.setInitialActivitySubTab(undefined);
        }
        
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
    }, [setters, state.selectedUser, state.selectedUserActivity, state.initialActivityTab, state.initialActivitySubTab]);

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
                if (action === 'remove') {
                    // Gọi API removeComment với đầy đủ thông tin
                    const removePayload: api.RemoveCommentPayload = {
                        reason: reasonForLog,
                        ruleIds: ruleIds || [],
                        resolution: resolution || 'Bình luận đã bị gỡ.',
                        severity: severity || 'low'
                    };
                    const response = await api.removeComment(item.id, removePayload);
                    context.updateComment(item.id, response.comment);
                    
                    // Nếu admin/mod gỡ bình luận người khác, tạo violation
                    if (!isSelfAction && ruleIds && ruleIds.length > 0 && severity) {
                        context.addViolation({
                            user_id: item.user_id,
                            target_type: 'comment',
                            target_id: item.id,
                            ruleIds,
                            severity,
                            resolution: resolution || 'Bình luận đã bị gỡ.',
                            detected_by: currentUser.role === 'super admin' ? 'super admin' : 'admin'
                        });
                    }
                } else {
                    // Gọi API restoreComment
                    const restorePayload: api.RestoreCommentPayload = {
                        reason: reasonForLog
                    };
                    const response = await api.restoreComment(item.id, restorePayload);
                    context.updateComment(item.id, response.comment);
                }
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
            // Không cần refreshData() vì context đã cập nhật và cache đã được invalidate
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
                // Không cần refreshData() vì context đã cập nhật và cache đã được invalidate
            } else {
                const newRawPost = await api.createPost(postData, currentUser);
                // Cập nhật context để đồng bộ chỉ số ở Dashboard và StatsDisplay
                context.addPost(newRawPost);
                // Reload lại trang để hiển thị bài viết mới
                refreshData();
            }
            setters.setCreateEditModalOpen(false);
        } catch (error) {
             console.error("Failed to save post", error);
             alert("Lưu bài viết thất bại.");
        }
    }, [currentUser, state.editingPost, setters, context, refreshData]);

    const handleToggleLike = useCallback(async (postId: string, currentIsLiked?: boolean) => {
        if (!currentUser) return;
        
        // Dựa vào trạng thái hiện tại của nút từ UI
        const isCurrentlyLiked = currentIsLiked ?? context.postLikes.some((l: any) => l.post_id === postId && l.user_id === currentUser.id);
        
        // Optimistic update context
        context.toggleLike(postId, currentUser.id);
        
        // Optimistic update UI - Tăng/giảm số lượng dựa vào trạng thái nút
        if (updatePostInList) {
            updatePostInList(postId, {
                likesChange: isCurrentlyLiked ? -1 : 1, // -1 nếu đang liked (unlike), +1 nếu chưa liked (like)
                isLiked: !isCurrentlyLiked
            } as any);
        }
        
        try {
            await api.toggleLike(postId, currentUser.id);
            // Không sync lại, chỉ dựa vào optimistic update
        } catch (error) {
            // Revert state if API fails
            context.toggleLike(postId, currentUser.id);
            if (updatePostInList) {
                updatePostInList(postId, {
                    likesChange: isCurrentlyLiked ? 1 : -1, // Revert: +1 nếu đã unlike, -1 nếu đã like
                    isLiked: isCurrentlyLiked
                } as any);
            }
            alert('Thao tác thất bại, vui lòng thử lại.');
        }
    }, [currentUser, context, updatePostInList]);

    const handleToggleView = useCallback(async (postId: string, currentIsViewed?: boolean) => {
        if (!currentUser) return;
        
        // Dựa vào trạng thái hiện tại của nút từ UI
        const isCurrentlyViewed = currentIsViewed ?? context.postViews.some((v: any) => v.post_id === postId && v.user_id === currentUser.id);
        
        // Optimistic update context
        context.toggleView(postId, currentUser.id);
        
        // Optimistic update UI - Tăng/giảm số lượng dựa vào trạng thái nút
        if (updatePostInList) {
            updatePostInList(postId, {
                viewsChange: isCurrentlyViewed ? -1 : 1, // -1 nếu đang viewed (unview), +1 nếu chưa viewed (view)
                isViewed: !isCurrentlyViewed
            } as any);
        }
        
        try {
            await api.toggleView(postId, currentUser.id);
            // Không sync lại, chỉ dựa vào optimistic update
        } catch (error) {
            // Revert state if API fails
            context.toggleView(postId, currentUser.id);
            if (updatePostInList) {
                updatePostInList(postId, {
                    viewsChange: isCurrentlyViewed ? 1 : -1, // Revert: +1 nếu đã unview, -1 nếu đã view
                    isViewed: isCurrentlyViewed
                } as any);
            }
            alert('Thao tác thất bại, vui lòng thử lại.');
        }
    }, [currentUser, context, updatePostInList]);

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