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
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const comments = getEnrichedCommentsByPostId(postId, mockComments);
        return Promise.resolve(comments);
    }
    
    // Real API
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
type AddCommentResponse = {
    success: boolean;
    message: string;
    data: CommentWithUser[];
};

export const addComment = (payload: AddCommentPayload): Promise<AddCommentResponse> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const newComment: Comment = {
            id: `c${Date.now()}`,
            post_id: payload.postId,
            user_id: payload.userId,
            content: { text: payload.content },
            created_at: new Date().toISOString(),
            parent_comment_id: payload.parentCommentId,
        };
        // Không chỉnh mockComments; trả về danh sách bình luận đã làm giàu bao gồm comment mới.
        const updatedList = getEnrichedCommentsByPostId(payload.postId, [...mockComments, newComment]);
        return Promise.resolve({
            success: true,
            message: 'Lấy danh sách bình luận thành công.',
            data: updatedList,
        });
    }
    
    // Real API
    const { postId, ...body } = payload;
    return apiClient.post<AddCommentResponse>(`/community/posts/${postId}/comments`, body);
};

/**
 * Cập nhật bình luận (chủ yếu cho việc xóa/khôi phục).
 * Hàm này giờ chỉ trả về object đã cập nhật, không tự ý thay đổi mảng mock.
 */
type UpdateCommentResponse = {
    success: boolean;
    message: string;
    data: Comment;
};

export const updateComment = (commentId: string, payload: Partial<Comment>): Promise<UpdateCommentResponse> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = mockComments.findIndex(c => c.id === commentId);
        if (index === -1) return Promise.reject(new Error("Comment not found"));
        
        // Tạo một object đã cập nhật thay vì thay đổi trực tiếp
        const updatedComment = { ...mockComments[index], ...payload };
        return Promise.resolve({
            success: true,
            message: 'Cập nhật bình luận thành công.',
            data: updatedComment,
        });
    }
    
    // Real API
    return apiClient.put<UpdateCommentResponse>(`/community/comments/${commentId}`, payload);
};

// =============================
// REMOVE/RESTORE COMMENT API
// =============================

/**
 * Payload khi gỡ bình luận
 */
export interface RemoveCommentPayload {
    reason: string;        // Lý do gỡ (hiển thị trên log)
    ruleIds: string[];     // Danh sách ID quy tắc vi phạm
    resolution: string;    // Ghi chú hướng giải quyết
    severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm
}

/**
 * Payload khi khôi phục bình luận
 */
export interface RestoreCommentPayload {
    reason: string; // Lý do khôi phục
}

/**
 * Response chung cho remove/restore comment
 */
export interface RemoveRestoreCommentResponse {
    success: boolean;
    message: string;
    comment: Comment;
}

/**
 * Gỡ bình luận - Đặt deleted_at, deleted_by, deleted_reason
 * @param commentId - ID của bình luận cần gỡ
 * @param payload - Thông tin đầy đủ về lý do gỡ
 * @returns Promise với thông tin bình luận đã được cập nhật
 */
export const removeComment = (commentId: string, payload: RemoveCommentPayload): Promise<RemoveRestoreCommentResponse> => {
    return apiClient.post<RemoveRestoreCommentResponse>(`/community/comments/${commentId}/remove`, payload);
};

/**
 * Khôi phục bình luận - Xóa deleted_at, deleted_by, deleted_reason
 * @param commentId - ID của bình luận cần khôi phục
 * @param payload - Thông tin lý do khôi phục
 * @returns Promise với thông tin bình luận đã được cập nhật
 */
export const restoreComment = (commentId: string, payload: RestoreCommentPayload): Promise<RemoveRestoreCommentResponse> => {
    return apiClient.post<RemoveRestoreCommentResponse>(`/community/comments/${commentId}/restore`, payload);
};
