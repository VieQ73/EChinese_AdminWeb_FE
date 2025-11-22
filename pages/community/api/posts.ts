import { apiClient } from '../../../services/apiClient';
import { RawPost, Post, User, PaginatedResponse } from '../../../types';

// =============================
// POST API
// =============================

interface FetchPostsParams {
    page?: number;
    limit?: number;
    topic?: string;
    status?: string;
}

/**
 * Lấy danh sách bài viết với filter và pagination
 */
export const fetchPosts = async (params: FetchPostsParams = {}): Promise<PaginatedResponse<Post>> => {
    try {
        // Xây dựng query params, chỉ thêm các param có giá trị
        const queryParams = new URLSearchParams();
        
        // Pagination params
        if (params.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        
        // Filter params - chỉ thêm khi có giá trị
        if (params.topic && params.topic !== 'all') {
            queryParams.append('topic', params.topic);
        }
        if (params.status && params.status !== 'all') {
            queryParams.append('status', params.status);
        }
        
        // Gọi API với query string
        const queryString = queryParams.toString();
        const url = queryString ? `/community/posts?${queryString}` : '/community/posts';
        
        console.log('🔄 Fetching posts from:', url);
        const response = await apiClient.get(url);
        console.log('📥 Raw response:', response);
        
        // Kiểm tra cấu trúc response
        if (!response) {
            console.error('❌ Response is null or undefined');
            return { data: [], meta: { total: 0, page: 1, limit: params.limit || 15, totalPages: 0 } };
        }
        
        // Nếu response đã là PaginatedResponse (có data và meta)
        if ((response as any).data && Array.isArray((response as any).data)) {
            console.log('✅ Response format 1: { data: Post[], meta: {...} }');
            return response as PaginatedResponse<Post>;
        }
        
        // Nếu response có envelope { success, data: { data, meta } }
        if ((response as any).data && (response as any).data.data) {
            console.log('✅ Response format 2: { success, data: { data: Post[], meta: {...} } }');
            return (response as any).data;
        }
        
        // Fallback: trả về empty
        console.error('❌ Unknown response format:', response);
        return { data: [], meta: { total: 0, page: 1, limit: params.limit || 15, totalPages: 0 } };
        
    } catch (error) {
        console.error('❌ Error fetching posts:', error);
        // Trả về empty data thay vì throw error để tránh crash UI
        return { data: [], meta: { total: 0, page: 1, limit: params.limit || 15, totalPages: 0 } };
    }
};

/**
 * Tải chi tiết một bài viết theo ID.
 */
export const fetchPostById = async (postId: string): Promise<Post | null> => {
    const response = await apiClient.get(`/community/posts/${postId}`);
    return (response as any).data; // API trả về { success, message, data: Post }
};

/**
 * Tạo một bài viết mới.
 */
export const createPost = async (postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>, currentUser: User): Promise<RawPost> => {
    const response = await apiClient.post('/community/posts', postData);
    return (response as any).data; // API trả về { success, message, data: RawPost }
};

/**
 * Cập nhật một bài viết.
 */
export const updatePost = async (postId: string, postData: Partial<Omit<RawPost, 'id'>>): Promise<Post> => {
    const response = await apiClient.put(`/community/posts/${postId}`, postData);
    return (response as any).data; // API trả về { success, message, data: Post }
};

/**
 * Moderate a post (e.g. remove with violation details).
 * Combines the post status update and violation logging in a single request so
 * the backend can ensure atomic consistency.
 */
export const moderatePost = async (postId: string, payload: {
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
    const response = await apiClient.post(`/community/posts/${postId}/moderation`, payload);
    return (response as any).data; // API trả về { success, message, data: Post }
};
