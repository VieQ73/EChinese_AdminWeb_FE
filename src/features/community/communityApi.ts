import { apiClient } from '../../services/apiClient';
import type { 
  Post, 
  Comment, 
  PostLike, 
  PostView, 
  ModerationLog
} from '../../types/entities';
import type { PaginatedResponse } from '../../types/api';

// ========================
// IMPORTANT NOTES FOR BACKEND IMPLEMENTATION
// ========================
/*
 * QUAN TRỌNG: Khi implement backend cho các API like/view/comment,
 * cần đảm bảo ĐỒNG BỘ dữ liệu giữa các bảng:
 * 
 * 1. Khi user LIKE bài viết:
 *    - Tạo record trong PostLikes table
 *    - Tăng Post.likes_count += 1
 *    - Return cả PostLike object VÀ likes_count mới
 * 
 * 2. Khi user UNLIKE bài viết:
 *    - Xóa record khỏi PostLikes table  
 *    - Giảm Post.likes_count -= 1
 *    - Return success = true VÀ likes_count mới
 * 
 * 3. Khi user VIEW bài viết:
 *    - Tạo record trong PostViews table (nếu chưa có)
 *    - Tăng Post.views_count += 1 (chỉ count unique users)
 *    - Return cả PostView object VÀ views_count mới
 * 
 * 4. Khi user COMMENT:
 *    - Tạo record trong Comments table
 *    - Tăng Post.comments_count += 1
 *    - Khi xóa comment thì giảm Post.comments_count -= 1
 * 
 * ĐẢM BẢO: Database transaction để tránh inconsistency
 * ĐẢM BẢO: Real-time sync giữa admin web và mobile app
 */

// ========================
// TYPES - Định nghĩa types cho API requests/responses  
// ========================

// Params cho query posts với filter và pagination
export interface FetchPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  user_id?: string;
  is_pinned?: boolean;
  include_deleted?: boolean;
  sort_by?: 'created_at' | 'likes' | 'views' | 'comments';
  sort_order?: 'asc' | 'desc';
}

// Payload để tạo/cập nhật post
export interface PostPayload {
  title: string;
  content: {
    html?: string;
    text?: string;
    images?: string[];
  };
  topic: string;
}

// Payload để tạo comment
export interface CommentPayload {
  content: {
    html?: string;
    text?: string;
  };
  parent_comment_id?: string;
}

// Options cho các hành động admin (xóa, khôi phục)
export interface AdminActionOptions {
  reason?: string;
  actor?: {
    id: string;
    role?: string;
  };
}

// Report functionality sẽ được tách thành module riêng

// ========================
// POSTS API - Quản lý bài viết
// ========================

/**
 * Lấy danh sách bài viết với filter và pagination
 */
export const fetchPosts = (params: FetchPostsParams = {}): Promise<PaginatedResponse<Post>> => {
  return apiClient.get('/admin/community/posts', { params });
};

/**
 * Lấy chi tiết một bài viết theo ID
 */
export const fetchPostById = (id: string): Promise<Post> => {
  return apiClient.get(`/admin/community/posts/${id}`);
};

// fetchDeletedPosts - không được sử dụng trong frontend hiện tại

/**
 * Tạo bài viết mới
 */
export const createPost = (payload: PostPayload): Promise<Post> => {
  return apiClient.post('/admin/community/posts', payload);
};

/**
 * Cập nhật bài viết
 */
export const updatePost = (id: string, payload: Partial<PostPayload>): Promise<Post> => {
  return apiClient.put(`/admin/community/posts/${id}`, payload);
};

/**
 * Xóa mềm bài viết (có thể khôi phục)
 */
export const removePost = (id: string, options: AdminActionOptions = {}): Promise<{ success: boolean }> => {
  return apiClient.post(`/admin/community/posts/${id}/remove`, options);
};

/**
 * Khôi phục bài viết đã bị xóa mềm
 */
export const restorePost = (id: string, options: AdminActionOptions = {}): Promise<Post> => {
  return apiClient.post(`/admin/community/posts/${id}/restore`, options);
};

// hardDeletePost - chưa được sử dụng trong frontend hiện tại

/**
 * Ghim bài viết lên đầu
 */
export const pinPost = (id: string): Promise<Post> => {
  return apiClient.post(`/admin/community/posts/${id}/pin`);
};

/**
 * Bỏ ghim bài viết
 */
export const unpinPost = (id: string): Promise<Post> => {
  return apiClient.post(`/admin/community/posts/${id}/unpin`);
};

// approvePost/rejectPost - chưa có workflow duyệt bài trong frontend hiện tại

// ========================
// COMMENTS API - Quản lý bình luận
// ========================

/**
 * Lấy danh sách bình luận của một bài viết
 */
export const fetchComments = (postId: string, includeDeleted = false): Promise<Comment[]> => {
  return apiClient.get(`/community/posts/${postId}/comments`, { 
    params: { include_deleted: includeDeleted } 
  });
};

/**
 * Lấy danh sách bình luận của một user
 */
export const fetchUserComments = (userId: string, includeDeleted = false): Promise<Comment[]> => {
  return apiClient.get(`/admin/community/users/${userId}/comments`, { 
    params: { include_deleted: includeDeleted } 
  });
};

/**
 * Lấy chi tiết một bình luận
 */
export const fetchCommentById = (commentId: string): Promise<Comment> => {
  return apiClient.get(`/admin/community/comments/${commentId}`);
};

/**
 * Thêm bình luận mới
 */
export const addComment = (postId: string, payload: CommentPayload): Promise<Comment> => {
  return apiClient.post(`/community/posts/${postId}/comments`, payload);
};

/**
 * Thêm reply cho một comment
 */
export const addReply = (postId: string, parentCommentId: string, payload: CommentPayload): Promise<Comment> => {
  return apiClient.post(`/community/posts/${postId}/comments/${parentCommentId}/replies`, payload);
};

/**
 * Cập nhật bình luận
 */
export const updateComment = (commentId: string, payload: Partial<CommentPayload>): Promise<Comment> => {
  return apiClient.put(`/admin/community/comments/${commentId}`, payload);
};

/**
 * Xóa mềm bình luận (có thể khôi phục)
 */
export const removeComment = (commentId: string, options: AdminActionOptions = {}): Promise<{ success: boolean }> => {
  return apiClient.post(`/admin/community/comments/${commentId}/remove`, options);
};

/**
 * Khôi phục bình luận đã bị xóa mềm
 */
export const restoreComment = (commentId: string, options: AdminActionOptions = {}): Promise<Comment> => {
  return apiClient.post(`/admin/community/comments/${commentId}/restore`, options);
};

/**
 * Xóa cứng bình luận (không thể khôi phục)
 */
export const hardDeleteComment = (commentId: string, options: AdminActionOptions = {}): Promise<{ success: boolean }> => {
  return apiClient.delete(`/admin/community/comments/${commentId}`, { data: options });
};

// ========================
// INTERACTIONS API - Tương tác với bài viết
// ========================

/**
 * Like một bài viết
 * NOTE: Backend phải đảm bảo cập nhật cả PostLike record VÀ Post.likes_count
 */
export const likePost = (postId: string): Promise<PostLike & { post_likes_count: number }> => {
  return apiClient.post(`/community/posts/${postId}/like`);
};

/**
 * Unlike một bài viết  
 * NOTE: Backend phải đảm bảo xóa PostLike record VÀ giảm Post.likes_count
 */
export const unlikePost = (postId: string): Promise<{ success: boolean; post_likes_count: number }> => {
  return apiClient.delete(`/community/posts/${postId}/like`);
};

/**
 * Đánh dấu đã xem bài viết
 * NOTE: Backend phải đảm bảo tạo PostView record VÀ tăng Post.views_count
 */
export const viewPost = (postId: string): Promise<PostView & { post_views_count: number }> => {
  return apiClient.post(`/community/posts/${postId}/view`);
};

/**
 * Chia sẻ bài viết (tăng counter share nếu có)
 */
export const sharePost = (postId: string): Promise<{ success: boolean }> => {
  return apiClient.post(`/community/posts/${postId}/share`);
};

/**
 * Lấy danh sách người đã like bài viết
 */
export const getPostLikes = (postId: string): Promise<PostLike[]> => {
  return apiClient.get(`/admin/community/posts/${postId}/likes`);
};

/**
 * Lấy danh sách người đã xem bài viết
 */
export const getPostViews = (postId: string): Promise<PostView[]> => {
  return apiClient.get(`/admin/community/posts/${postId}/views`);
};

// ========================
// COUNTERS UPDATE API - Cập nhật số lượng like/views trong Post
// ========================

/**
 * Cập nhật số lượng likes cho bài viết (dành cho admin hoặc sync data)
 * Backend tự tính toán từ bảng PostLikes và cập nhật Post.likes_count
 */
export const updatePostLikesCount = (postId: string): Promise<{ likes_count: number }> => {
  return apiClient.post(`/admin/community/posts/${postId}/sync-likes-count`);
};

/**
 * Cập nhật số lượng views cho bài viết (dành cho admin hoặc sync data)
 * Backend tự tính toán từ bảng PostViews và cập nhật Post.views_count
 */
export const updatePostViewsCount = (postId: string): Promise<{ views_count: number }> => {
  return apiClient.post(`/admin/community/posts/${postId}/sync-views-count`);
};

/**
 * Cập nhật số lượng comments cho bài viết (tự động khi thêm/xóa comment)
 * Backend tự tính toán từ bảng Comments và cập nhật Post.comments_count
 */
export const updatePostCommentsCount = (postId: string): Promise<{ comments_count: number }> => {
  return apiClient.post(`/admin/community/posts/${postId}/sync-comments-count`);
};

/**
 * Sync tất cả counters cho một bài viết
 */
export const syncAllPostCounters = (postId: string): Promise<{
  likes_count: number;
  views_count: number; 
  comments_count: number;
}> => {
  return apiClient.post(`/admin/community/posts/${postId}/sync-all-counters`);
};

// ========================
// USER POSTS API - Bài viết của user cụ thể
// ========================

/**
 * Lấy danh sách bài viết của một user cụ thể
 */
export const fetchUserPosts = (userId: string, params: FetchPostsParams = {}): Promise<PaginatedResponse<Post>> => {
  return apiClient.get(`/admin/community/users/${userId}/posts`, { params });
};

/**
 * Lấy tất cả bài viết của user (bao gồm cả đã xóa)
 */
export const fetchUserPostsAll = (userId: string, params: FetchPostsParams = {}): Promise<PaginatedResponse<Post>> => {
  return apiClient.get(`/admin/community/users/${userId}/posts/all`, { params });
};

/**
 * Lấy thống kê bài viết của user
 */
export const getUserPostStats = (userId: string): Promise<{
  total_posts: number;
  active_posts: number;
  deleted_posts: number;
  total_likes: number;
  total_views: number;
  total_comments: number;
}> => {
  return apiClient.get(`/admin/community/users/${userId}/stats`);
};

// ========================
// MODERATION LOGS API - Nhật ký quản trị
// ========================

/**
 * Lấy nhật ký các hành động quản trị
 */
export const fetchModerationLogs = (params: {
  page?: number;
  limit?: number;
  target_type?: 'post' | 'comment';
  target_id?: string;
  action?: 'gỡ' | 'khôi phục' | 'xóa vĩnh viễn';
  performed_by?: string;
  from_date?: string;
  to_date?: string;
}): Promise<PaginatedResponse<ModerationLog>> => {
  return apiClient.get('/admin/community/moderation-logs', { params });
};

// ========================
// STATISTICS API - Thống kê cộng đồng
// ========================

/**
 * Lấy thống kê tổng quan cộng đồng
 */
export const getCommunityStats = (): Promise<{
  total_posts: number;
  active_posts: number;
  deleted_posts: number;
  pending_posts: number;
  total_comments: number;
  active_comments: number;
  deleted_comments: number;
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  total_users_active: number;
  posts_today: number;
  comments_today: number;
  reports_today: number;
}> => {
  return apiClient.get('/admin/community/statistics');
};

/**
 * Lấy thống kê theo thời gian
 */
export const getCommunityStatsByDate = (params: {
  from_date: string;
  to_date: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<Array<{
  date: string;
  posts_count: number;
  comments_count: number;
  likes_count: number;
  views_count: number;
  reports_count: number;
}>> => {
  return apiClient.get('/admin/community/statistics/by-date', { params });
};

/**
 * Lấy thống kê theo chủ đề
 */
export const getCommunityStatsByTopic = (): Promise<Array<{
  topic: string;
  posts_count: number;
  comments_count: number;
  likes_count: number;
  views_count: number;
}>> => {
  return apiClient.get('/admin/community/statistics/by-topic');
};

// ========================
// EXPORTED FUNCTIONS - Grouping theo chức năng
// ========================

export default {
  // Post Management
  posts: {
    fetchPosts,
    fetchPostById, 
    createPost,
    updatePost,
    removePost,
    restorePost,
    pinPost,
    unpinPost
  },
  
  // Comment Management
  comments: {
    fetchComments,
    fetchUserComments,
    fetchCommentById,
    addComment,
    addReply,
    updateComment,
    removeComment,
    restoreComment,
    hardDeleteComment
  },
  
  // Interactions (QUAN TRỌNG: Các API này cập nhật counters)
  interactions: {
    likePost,      // Cập nhật Post.likes_count
    unlikePost,    // Cập nhật Post.likes_count  
    viewPost,      // Cập nhật Post.views_count
    sharePost,
    getPostLikes,
    getPostViews
  },
  
  // Counter Sync (Dành cho admin hoặc data repair)
  counters: {
    updatePostLikesCount,    // Sync likes_count từ PostLikes table
    updatePostViewsCount,    // Sync views_count từ PostViews table  
    updatePostCommentsCount, // Sync comments_count từ Comments table
    syncAllPostCounters      // Sync tất cả counters
  },
  
  // User Posts
  userPosts: {
    fetchUserPosts,
    fetchUserPostsAll,
    getUserPostStats
  },
  
  // Moderation & Statistics
  moderation: {
    fetchModerationLogs
  },
  
  statistics: {
    getCommunityStats,
    getCommunityStatsByDate,
    getCommunityStatsByTopic
  }
};
