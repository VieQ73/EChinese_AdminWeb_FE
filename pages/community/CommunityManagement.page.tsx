// CommunityManagementPage.tsx
import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';

// Contexts & Hooks
import { AuthContext } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/appData/context';
import { useCommunityState } from './hooks/useCommunityState';
import { useCommunityHandlers } from './hooks/useCommunityHandlers';
import { useCommunityEffects } from './hooks/useCommunityEffects';

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
    const [communityStats, setCommunityStats] = useState<{ postCount: number; commentCount: number; moderationCount: number } | null>(null);
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

    // --- Fetch Community Stats from API ---
    const loadStats = useCallback(async () => {
        try {
            const res = await api.fetchCommunityStats();
            // API returns envelope: { success, data }
            setCommunityStats(res.data);
        } catch (e) {
            console.error('Failed to load community stats', e);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Không cần sync useEffect nữa vì updatePostInList đã xử lý
    // API trả về isLiked, isViewed từ đầu, và updatePostInList sẽ update khi có action


    const handlers = useCommunityHandlers({
        currentUser,
        state,
        setters,
        context,
        refreshData: () => loadPosts(false),
        updatePostInList: (postId: string, updates: any) => {
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    // Tạo bản sao để không mutate object gốc
                    const { likesChange, viewsChange, ...restUpdates } = updates;
                    
                    const newPost = { ...p };
                    
                    // Xử lý likesChange và viewsChange (delta)
                    if (likesChange !== undefined) {
                        newPost.likes = (p.likes || 0) + likesChange;
                    }
                    if (viewsChange !== undefined) {
                        newPost.views = (p.views || 0) + viewsChange;
                    }
                    
                    // Apply các updates còn lại
                    return { ...newPost, ...restUpdates };
                }
                return p;
            }));
        },
    });
    
    useCommunityEffects({
        state,
        setters,
        context: { ...context, posts },
    });

    // --- Derived Data ---
    // Sử dụng isLiked và isViewed từ API response thay vì tính toán từ context
    const likedPosts = useMemo(() => new Set(posts.filter(p => p.isLiked).map(p => p.id)), [posts]);
    const viewedPosts = useMemo(() => new Set(posts.filter(p => p.isViewed).map(p => p.id)), [posts]);
    
    const stats = useMemo(() => ({
        postCount: communityStats?.postCount ?? context.posts.filter(p => p.status === 'published').length,
        commentCount: communityStats?.commentCount ?? context.comments.filter(c => !c.deleted_at).length,
        moderationCount: communityStats?.moderationCount ?? (context.posts.filter(p => p.status === 'removed').length + context.comments.filter(c => !!c.deleted_at).length),
        logs: context.moderationLogs,
    }), [communityStats, context.posts, context.comments, context.moderationLogs]);

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
                        onToggleLike={(postId, isLiked) => handlers.handleToggleLike(postId, isLiked)}
                        isLiked={postId => likedPosts.has(postId)}
                        onToggleView={(postId, isViewed) => handlers.handleToggleView(postId, isViewed)}
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
                    onToggleLike={() => handlers.handleToggleLike(state.viewingPost!.id, likedPosts.has(state.viewingPost!.id))}
                    onToggleView={() => handlers.handleToggleView(state.viewingPost!.id, viewedPosts.has(state.viewingPost!.id))}
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
                    activityData={state.selectedUserActivity}
                    getPostsByUserId={(userId) => posts.filter(p => p.user_id === userId && p.status !== 'draft')}
                    getLikedPostsByUserId={context.getLikedPostsByUserId}
                    getCommentedPostsByUserId={context.getCommentedPostsByUserId}
                    getViewedPostsByUserId={context.getViewedPostsByUserId}
                    getRemovedPostsByUserId={(userId) => context.posts.filter(p => p.user_id === userId && p.status === 'removed')}
                    getRemovedCommentsByUserId={context.getRemovedCommentsByUserId}
                    onPostSelect={handlers.handlePostSelectFromActivity}
                    likedPosts={likedPosts}
                    viewedPosts={viewedPosts}
                    onToggleLike={(postId, isLiked) => handlers.handleToggleLike(postId, isLiked)}
                    onToggleView={(postId, isViewed) => handlers.handleToggleView(postId, isViewed)}
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