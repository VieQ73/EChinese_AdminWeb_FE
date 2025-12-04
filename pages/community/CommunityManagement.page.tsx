// CommunityManagementPage.tsx
import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// Contexts & Hooks
import { AuthContext } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/appData/context';
import { useCommunityState } from './hooks/useCommunityState';
import { useCommunityHandlers } from './hooks/useCommunityHandlers';
import { useCommunityEffects } from './hooks/useCommunityEffects';

// API
import * as api from './api';
import { Post, PaginatedResponse, User } from '../../types';

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
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { state, setters } = useCommunityState();
    
    // Ref để track query params đã xử lý
    const processedQueryRef = React.useRef<string | null>(null);

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
        // Reset về trang 1 và reload posts khi topic filter thay đổi
        setPage(1);
        setPosts([]); // Clear posts cũ để tránh hiển thị data cũ
        
        // Gọi API trực tiếp thay vì dùng loadPosts để tránh dependency issue
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response: PaginatedResponse<Post> = await api.fetchPosts({
                    page: 1,
                    limit: 15,
                    topic: state.filters.topic === 'all' ? undefined : state.filters.topic,
                });
                setPosts(response.data);
                setHasMore(response.data.length > 0 && response.meta.totalPages > 1);
            } catch (error) {
                console.error("Failed to load posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
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
        movePostToTop: (postId: string) => {
            setPosts(prev => {
                const postIndex = prev.findIndex(p => p.id === postId);
                if (postIndex <= 0) return prev; // Đã ở đầu hoặc không tìm thấy
                
                const post = prev[postIndex];
                const newPosts = [...prev];
                newPosts.splice(postIndex, 1); // Xóa khỏi vị trí cũ
                newPosts.unshift(post); // Thêm vào đầu
                return newPosts;
            });
        },
    });
    
    useCommunityEffects({
        state,
        setters,
        context: { ...context, posts },
    });

    // Effect xử lý query params để mở modal
    useEffect(() => {
        const postId = searchParams.get('post');
        const commentId = searchParams.get('comment');
        const userId = searchParams.get('user');
        const tab = searchParams.get('tab');
        const subTab = searchParams.get('subTab');
        
        // Tạo key để track query đã xử lý
        const queryKey = `${postId || ''}-${commentId || ''}-${userId || ''}-${tab || ''}-${subTab || ''}`;
        
        // Nếu không có query params nào, reset processed ref
        if (!postId && !userId) {
            // Chỉ reset nếu không phải là empty key đã xử lý
            if (processedQueryRef.current !== queryKey) {
                processedQueryRef.current = null;
            }
            return;
        }
        
        // Nếu đã xử lý query này rồi, không làm gì
        if (processedQueryRef.current === queryKey) {
            console.log('[CommunityManagement] Query already processed, skipping:', queryKey);
            return;
        }
        
        console.log('[CommunityManagement] Processing query:', queryKey);
        
        // Xử lý mở PostDetailModal
        if (postId) {
            // Tìm post từ danh sách
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                // Đánh dấu đã xử lý
                processedQueryRef.current = queryKey;
                handlers.handleOpenDetailModal(post);
                // Xóa query params sau khi mở modal thành công
                setSearchParams({});
                // Nếu có commentId, scroll đến comment sau khi modal đã mở
                if (commentId) {
                    setTimeout(() => {
                        const commentElement = document.getElementById(`comment-${commentId}`);
                        if (commentElement) {
                            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            commentElement.classList.add('bg-yellow-100');
                            setTimeout(() => {
                                commentElement.classList.remove('bg-yellow-100');
                            }, 2000);
                        }
                    }, 500);
                }
            } else {
                // Không tìm thấy trong list, fetch từ API
                api.fetchPostById(postId).then(fetchedPost => {
                    if (fetchedPost) {
                        // Đánh dấu đã xử lý
                        processedQueryRef.current = queryKey;
                        handlers.handleOpenDetailModal(fetchedPost);
                        // Xóa query params sau khi mở modal thành công
                        setSearchParams({});
                        // Nếu có commentId, scroll đến comment sau khi modal đã mở
                        if (commentId) {
                            setTimeout(() => {
                                const commentElement = document.getElementById(`comment-${commentId}`);
                                if (commentElement) {
                                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    commentElement.classList.add('bg-yellow-100');
                                    setTimeout(() => {
                                        commentElement.classList.remove('bg-yellow-100');
                                    }, 2000);
                                }
                            }, 500);
                        }
                    }
                }).catch(err => {
                    console.error('Failed to fetch post:', err);
                    // Xóa query params nếu có lỗi
                    setSearchParams({});
                });
            }
            return;
        }
        
        // Xử lý mở UserActivityModal
        if (userId) {
            console.log('[CommunityManagement] Opening UserActivityModal for userId:', userId, 'tab:', tab, 'subTab:', subTab);
            
            // Đánh dấu đã xử lý ngay để tránh xử lý lại
            processedQueryRef.current = queryKey;
            
            // Set initial tab/subTab trước khi mở modal
            if (tab) {
                console.log('[CommunityManagement] Setting initialActivityTab:', tab);
                setters.setInitialActivityTab(tab);
            }
            if (subTab) {
                console.log('[CommunityManagement] Setting initialActivitySubTab:', subTab);
                setters.setInitialActivitySubTab(subTab);
            }
            
            // Tìm user từ context
            let user = context.users.find((u: any) => u.id === userId);
            console.log('[CommunityManagement] Found user in context:', user);
            
            if (!user) {
                // Nếu không tìm thấy trong context, fetch activity trước để lấy user info
                console.warn('[CommunityManagement] User not found in context, will fetch from activity API');
                
                // Xóa query params ngay để tránh re-trigger
                setSearchParams({});
                
                // Mở modal với loading state
                setters.setSelectedUser(null);
                setters.setSelectedUserActivity(undefined);
                setters.setUserActivityModalOpen(true);
                
                // Fetch activity để lấy user info (chỉ gọi 1 lần nhờ cache trong API)
                api.fetchUserCommunityActivity(userId).then(activity => {
                    console.log('[CommunityManagement] Activity fetched:', activity);
                    // Lấy user từ removedComments hoặc removedPosts
                    const userFromActivity = 
                        activity.removedComments?.[0]?.user ||
                        activity.removedPosts?.[0]?.user ||
                        activity.posts?.[0]?.user ||
                        activity.likedPosts?.[0]?.user;
                    
                    if (userFromActivity) {
                        console.log('[CommunityManagement] User found from activity:', userFromActivity);
                        // Set cả user và activity cùng lúc để tránh trigger handleUserClick
                        setters.setSelectedUser(userFromActivity as User);
                        setters.setSelectedUserActivity(activity);
                    } else {
                        console.error('[CommunityManagement] Could not find user info from activity');
                        setters.setSelectedUserActivity(null);
                    }
                }).catch(err => {
                    console.error('[CommunityManagement] Failed to fetch activity:', err);
                    setters.setSelectedUserActivity(null);
                });
            } else {
                // Xóa query params ngay để tránh re-trigger
                setSearchParams({});
                
                // User có trong context, mở modal bình thường
                handlers.handleUserClick(user);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

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
                        onTogglePin={handlers.handleTogglePin}
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

            {/* Modal chi tiết bài viết */}
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

            {(state.selectedUser || state.isUserActivityModalOpen) && (
                <UserActivityModal
                    isOpen={state.isUserActivityModalOpen}
                    onClose={() => {
                        setters.setSelectedUser(null);
                        setters.setUserActivityModalOpen(false);
                    }}
                    user={state.selectedUser!}
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