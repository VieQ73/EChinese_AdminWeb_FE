// CommunityManagementPage.tsx
import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';

// Contexts & Hooks
import { AuthContext } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/appData/context';
import { useCommunityState } from './hooks/useCommunityState';
import { useCommunityHandlers } from './hooks/useCommunityHandlers';
import { useCommunityEffects } from './hooks/useCommunityEffects';
import { useCommunityStats } from './hooks/useCommunityStats';

// API
import * as api from './api';
import { Post, PaginatedResponse } from '../../types';

// Components
import CommunitySidebar from './components/sidebar/CommunitySidebar';
import PostFeed from './components/feed/PostFeed';
import CreateEditPostModal from './components/post/CreateEditPostModal';
import PostDetailModal from './components/post/PostDetailModal';
import UserActivityModal from './components/user/UserActivityModal';
import ModerationActionModal from '../moderation/components/details/ModerationActionModal';
import PostComposer from './components/feed/PostComposer';

const CommunityManagementPage: React.FC = () => {
    // --- Hooks & Context ---
    const currentUser = useContext(AuthContext)?.user || null;
    const context = useAppData();
    
    const { state, setters } = useCommunityState();

    // --- Local State for Posts ---
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // --- Data Fetching ---
    const loadPosts = useCallback(async (isLoadMore = false) => {
        setIsLoading(true);
        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            const response: PaginatedResponse<Post> = await api.fetchPosts({
                page: currentPage,
                limit: 15, // Số lượng bài viết mỗi lần tải
                topic: state.filters.topic === 'all' ? undefined : state.filters.topic,
            });

            if (isLoadMore) {
                setPosts(prev => [...prev, ...response.data]);
            } else {
                setPosts(response.data);
            }
            
            setPage(currentPage);
            setHasMore(response.data.length > 0 && response.meta.totalPages > currentPage);

        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, state.filters.topic]);

    // Effect tải lại từ đầu khi filter thay đổi
    useEffect(() => {
        loadPosts(false);
    }, [state.filters.topic]);

    // --- Đồng bộ hóa state cục bộ với context ---
    const { postLikes, postViews, comments: contextComments } = useAppData();
    useEffect(() => {
        setPosts(currentPosts =>
            currentPosts.map(post => {
                const newLikes = postLikes.filter(l => l.post_id === post.id).length;
                const newViews = postViews.filter(v => v.post_id === post.id).length;
                const newCommentCount = contextComments.filter(c => c.post_id === post.id && !c.deleted_at).length;
                
                // Chỉ tạo object mới nếu có sự thay đổi để tối ưu re-render
                if (post.likes !== newLikes || post.views !== newViews || post.comment_count !== newCommentCount) {
                     return { ...post, likes: newLikes, views: newViews, comment_count: newCommentCount };
                }
                return post;
            })
        );
    }, [postLikes, postViews, contextComments]);


    const handlers = useCommunityHandlers({
        currentUser,
        state,
        setters,
        context,
        refreshData: () => loadPosts(false),
    });
    
    useCommunityEffects({
        state,
        setters,
        context: { ...context, posts },
    });

    // --- Derived Data ---
    const likedPosts = useMemo(() => new Set(context.postLikes.filter(l => l.user_id === currentUser?.id).map(l => l.post_id)), [context.postLikes, currentUser]);
    const viewedPosts = useMemo(() => new Set(context.postViews.filter(v => v.user_id === currentUser?.id).map(v => v.post_id)), [context.postViews, currentUser]);
    
    // Sử dụng hook API để lấy stats thay vì tính từ context
    const { data: communityStats } = useCommunityStats();
    const stats = useMemo(() => ({
        postCount: communityStats?.postCount ?? 0,
        commentCount: communityStats?.commentCount ?? 0,
        moderationCount: communityStats?.moderationCount ?? 0,
        logs: communityStats?.logs ?? [],
    }), [communityStats]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Cộng đồng</h1>
            
            <div className="flex gap-8 items-start">
                {/* Main Content: Composer + Feed */}
                <div className="flex-1 min-w-0 space-y-6">
                    <PostComposer
                        currentUser={currentUser}
                        onCreatePost={handlers.handleOpenCreateModal}
                    />
                    <PostFeed
                        posts={posts}
                        isLoading={isLoading}
                        hasMore={hasMore}
                        loadMorePosts={() => loadPosts(true)}
                        currentUser={currentUser}
                        onViewDetails={handlers.handleOpenDetailModal}
                        onEdit={handlers.handleOpenEditModal}
                        onRemove={post => handlers.handleOpenModerationModal('remove', 'post', post)}
                        onUserClick={handlers.handleUserClick}
                        onToggleLike={handlers.handleToggleLike}
                        isLiked={postId => likedPosts.has(postId)}
                        onToggleView={handlers.handleToggleView}
                        isViewed={postId => viewedPosts.has(postId)}
                    />
                </div>

                {/* Sticky Sidebar */}
                <aside className="w-[340px] flex-shrink-0 lg:sticky top-6 hidden lg:block">
                     <CommunitySidebar
                        stats={stats}
                        topicFilter={state.filters.topic}
                        onTopicFilterChange={(topic) => setters.setFilters({ ...state.filters, topic })}
                        onUserSelect={handlers.handleUserClick}
                    />
                </aside>
            </div>


            {/* Modals */}
            <CreateEditPostModal
                isOpen={state.isCreateEditModalOpen}
                onClose={() => setters.setCreateEditModalOpen(false)}
                onSave={handlers.handleSavePost}
                post={state.editingPost}
            />

            {state.viewingPost && (
                <PostDetailModal
                    isOpen={state.isDetailModalOpen}
                    onClose={() => setters.setDetailModalOpen(false)}
                    post={state.viewingPost}
                    isLiked={likedPosts.has(state.viewingPost.id)}
                    isViewed={viewedPosts.has(state.viewingPost.id)}
                    onToggleLike={() => handlers.handleToggleLike(state.viewingPost!.id)}
                    onToggleView={() => handlers.handleToggleView(state.viewingPost!.id)}
                    onRemoveComment={comment => handlers.handleOpenModerationModal('remove', 'comment', comment)}
                    onRestoreComment={comment => handlers.handleOpenModerationModal('restore', 'comment', comment)}
                    onUserClick={handlers.handleUserClick}
                />
            )}

            {state.selectedUser && (
                <UserActivityModal
                    isOpen={state.isUserActivityModalOpen}
                    onClose={() => setters.setSelectedUser(null)}
                    user={state.selectedUser}
                    currentUser={currentUser}
                    initialTab={state.initialActivityTab}
                    initialSubTab={state.initialActivitySubTab}
                    onPostSelect={handlers.handlePostSelectFromActivity}
                    likedPosts={likedPosts}
                    viewedPosts={viewedPosts}
                    onToggleLike={handlers.handleToggleLike}
                    onToggleView={handlers.handleToggleView}
                    onUserClick={handlers.handleUserClick}
                    onEditPost={handlers.handleOpenEditModal}
                    onRemovePost={post => handlers.handleOpenModerationModal('remove', 'post', post)}
                    onRestorePost={post => handlers.handleOpenModerationModal('restore', 'post', post)}
                    onRestoreComment={comment => handlers.handleOpenModerationModal('restore', 'comment', comment)}
                />
            )}

            <ModerationActionModal
                isOpen={state.isModerationModalOpen}
                onClose={() => setters.setModerationModalOpen(false)}
                actionData={state.moderationAction}
                onConfirm={handlers.handleConfirmModerationAction}
            />
        </div>
    );
};

export default CommunityManagementPage;