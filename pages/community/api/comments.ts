import { apiClient } from '../../../services/apiClient';
import { Comment, CommentWithUser } from '../../../types';
import { mockComments } from '../../../mock';
import { getEnrichedCommentsByPostId } from '../../../mock/community';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// COMMENT API
// =============================

/**
 * Tải tất cả bình luận (đã được làm giàu và sắp xếp dạng cây) cho một bài viết.
 */
export const fetchCommentsByPostId = (postId: string): Promise<CommentWithUser[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const comments = getEnrichedCommentsByPostId(postId, mockComments);
                resolve(comments);
            }, 400);
        });
    }
    return apiClient.get(`/community/posts/${postId}/comments`);
};

interface AddCommentPayload {
    postId: string;
    content: string;
    userId: string;
    parentCommentId?: string;
}

/**
 * Thêm một bình luận mới.
 * Hàm này giờ chỉ tạo và trả về object comment mới, không tự ý thay đổi mảng mock.
 */
export const addComment = (payload: AddCommentPayload): Promise<Comment> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newComment: Comment = {
                    id: `c${Date.now()}`,
                    post_id: payload.postId,
                    user_id: payload.userId,
                    content: { text: payload.content },
                    created_at: new Date().toISOString(),
                    parent_comment_id: payload.parentCommentId,
                };
                // KHÔNG push vào mockComments ở đây.
                // Chỉ trả về object mới để Context xử lý.
                resolve(newComment);
            }, 200);
        });
    }
    const { postId, ...body } = payload;
    return apiClient.post(`/community/posts/${postId}/comments`, body);
};

/**
 * Cập nhật bình luận (chủ yếu cho việc xóa/khôi phục).
 * Hàm này giờ chỉ trả về object đã cập nhật, không tự ý thay đổi mảng mock.
 */
export const updateComment = (commentId: string, payload: Partial<Comment>): Promise<Comment> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockComments.findIndex(c => c.id === commentId);
                if (index === -1) return reject(new Error("Comment not found"));
                
                // Tạo một object đã cập nhật thay vì thay đổi trực tiếp
                const updatedComment = { ...mockComments[index], ...payload };
                resolve(updatedComment);
            }, 200);
        });
    }
    return apiClient.put(`/community/comments/${commentId}`, payload);
};