/**
 * User Activity API - API lấy hoạt động của người dùng theo từng loại
 */
import { apiClient } from '../../../services/apiClient';
import { Post, CommentWithUser } from '../../../types';
import { 
    mockPosts, mockPostLikes, mockPostViews, mockComments,
    mockUsers, mockBadges 
} from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Helper làm giàu dữ liệu post
const enrichPost = (post: typeof mockPosts[0]): Post => {
    const user = mockUsers.find(u => u.id === post.user_id);
    const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
    return {
        ...post,
        user: user || { id: 'unknown', name: 'Không xác định', avatar_url: '', badge_level: 0, role: 'user' },
        badge,
        comment_count: mockComments.filter(c => c.post_id === post.id && !c.deleted_at).length,
        likes: mockPostLikes.filter(l => l.post_id === post.id).length,
        views: mockPostViews.filter(v => v.post_id === post.id).length,
    };
};

// Helper làm giàu comment
const enrichComment = (comment: typeof mockComments[0]): CommentWithUser => {
    const user = mockUsers.find(u => u.id === comment.user_id);
    const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
    return { ...comment, user: user || mockUsers[0], badge, replies: [] };
};

// Response type từ BE
interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/** Lấy bài viết của user */
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return mockPosts
            .filter(p => p.user_id === userId && p.status !== 'draft' && p.status !== 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    // Real API - BE trả về envelope { success, data }
    const res = await apiClient.get<ApiResponse<Post[]>>(`/community/users/${userId}/posts`);
    return res.data || [];
};

/** Lấy bài user đã thích */
export const fetchUserLikedPosts = async (userId: string): Promise<Post[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const likedIds = new Set(mockPostLikes.filter(l => l.user_id === userId).map(l => l.post_id));
        return mockPosts
            .filter(p => likedIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost);
    }
    
    // Real API
    const res = await apiClient.get<ApiResponse<Post[]>>(`/community/users/${userId}/liked-posts`);
    return res.data || [];
};

/** Lấy bài user đã bình luận */
export const fetchUserCommentedPosts = async (userId: string): Promise<Post[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const commentedIds = new Set(mockComments.filter(c => c.user_id === userId && !c.deleted_at).map(c => c.post_id));
        return mockPosts
            .filter(p => commentedIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost);
    }
    
    // Real API
    const res = await apiClient.get<ApiResponse<Post[]>>(`/community/users/${userId}/commented-posts`);
    return res.data || [];
};

/** Lấy bài user đã xem */
export const fetchUserViewedPosts = async (userId: string): Promise<Post[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const viewedIds = new Set(mockPostViews.filter(v => v.user_id === userId).map(v => v.post_id));
        return mockPosts
            .filter(p => viewedIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost);
    }
    
    // Real API
    const res = await apiClient.get<ApiResponse<Post[]>>(`/community/users/${userId}/viewed-posts`);
    return res.data || [];
};

/** Lấy bài đã bị gỡ của user */
export const fetchUserRemovedPosts = async (userId: string): Promise<Post[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return mockPosts
            .filter(p => p.user_id === userId && p.status === 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.deleted_at || 0).getTime() - new Date(a.deleted_at || 0).getTime());
    }
    
    // Real API
    const res = await apiClient.get<ApiResponse<Post[]>>(`/community/users/${userId}/removed-posts`);
    return res.data || [];
};

/** Lấy bình luận đã bị gỡ của user */
export const fetchUserRemovedComments = async (userId: string): Promise<CommentWithUser[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return mockComments
            .filter(c => c.user_id === userId && !!c.deleted_at)
            .map(enrichComment)
            .sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime());
    }
    
    // Real API
    const res = await apiClient.get<ApiResponse<CommentWithUser[]>>(`/community/users/${userId}/removed-comments`);
    return res.data || [];
};
