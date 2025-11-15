import { apiClient } from '../../../services/apiClient';
import { RawPost, Post, User, PaginatedResponse } from '../../../types';
import { mockUsers, mockPosts, mockBadges, mockComments, mockPostLikes, mockPostViews } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// HELPERS - HÀM HỖ TRỢ (CHỈ DÙNG CHO MOCK)
// =============================

/**
 * Làm giàu dữ liệu cho một bài viết thô (RawPost) để có đầy đủ thông tin hiển thị.
 */
const enrichPost = (post: RawPost): Post => {
    const user = mockUsers.find(u => u.id === post.user_id);
    const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
    return {
        ...post,
        user: user || { id: 'unknown', name: 'Người dùng không xác định', avatar_url: '', badge_level: 0, role: 'user' },
        badge,
        comment_count: mockComments.filter(c => c.post_id === post.id && !c.deleted_at).length,
        likes: mockPostLikes.filter(l => l.post_id === post.id).length,
        views: mockPostViews.filter(v => v.post_id === post.id).length,
    };
};

// =============================
// POST API
// =============================

interface FetchPostsParams {
    page?: number;
    limit?: number;
    topic?: string;
}


export const fetchPosts = (params: FetchPostsParams): Promise<PaginatedResponse<Post>> => {
    return apiClient.get('/community/posts');
    
    
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 15, topic = 'all' } = params;
                
                let filtered = mockPosts.filter(p => p.status !== 'removed' && p.status !== 'draft');

                if (topic && topic !== 'all') {
                    filtered = filtered.filter(p => p.topic === topic);
                }
                
                // Sắp xếp ghim lên đầu, sau đó theo ngày tạo
                filtered.sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit).map(enrichPost);
                                
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }
};

/**
 * Tải chi tiết một bài viết theo ID.
 */
export const fetchPostById = (postId: string): Promise<Post | null> => {
    return apiClient.get(`/community/posts/${postId}`);

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const post = mockPosts.find(p => p.id === postId);
                if (post) {

                    resolve(enrichPost(post));
                } else {
                    resolve(null);
                }
            }, 300);
        });
    }
    
};

/**
 * Tạo một bài viết mới.
 */
export const createPost = (postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>, currentUser: User): Promise<RawPost> => {
    return apiClient.post('/community/posts', postData);

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newPost: RawPost = {
                    ...postData,
                    id: `p${Date.now()}`,
                    user_id: currentUser.id,
                    created_at: new Date().toISOString(),
                    likes: 0,
                    views: 0,
                };
                // Cập nhật "database" giả lập
                mockPosts.unshift(newPost);

                resolve(newPost);
            }, 300);
        });
    }
    
};

/**
 * Cập nhật một bài viết.
 */
export const updatePost = (postId: string, postData: Partial<Omit<RawPost, 'id'>>): Promise<Post> => {
    
    return apiClient.put(`/community/posts/${postId}`, postData);

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockPosts.findIndex(p => p.id === postId);
                if (index === -1) return reject(new Error("Post not found"));
                
                mockPosts[index] = { ...mockPosts[index], ...postData };
                
                resolve(enrichPost(mockPosts[index]));
            }, 300);
        });
    }
    
};

/**
 * Moderate a post (e.g. remove with violation details).
 * Combines the post status update and violation logging in a single request so
 * the backend can ensure atomic consistency.
 */
export const moderatePost = (postId: string, payload: {
    action: 'remove' | 'restore';
    post_update: Partial<Omit<RawPost, 'id'>>;
    violation?: {
        ruleIds: string[];
        severity: string; // Using string to avoid tight coupling; backend will validate
        resolution: string;
        reason: string;
        performed_by: string; // user id of moderator
        user_id: string; // owner of the post
        target_type: 'post';
        target_id: string;
    };
}): Promise<Post> => {
    return apiClient.post(`/community/posts/${postId}/moderation`, payload);

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockPosts.findIndex(p => p.id === postId);
                if (index === -1) return reject(new Error('Post not found'));
                // Apply post update
                mockPosts[index] = { ...mockPosts[index], ...payload.post_update };
                
            }, 300);
        });
    }
};
