import { apiClient } from '../../../services/apiClient';
import { Comment, CommentWithUser } from '../../../types';
import { mockComments } from '../../../mock';
import { getEnrichedCommentsByPostId } from '../../../mock/community';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// COMMENT API
// =============================

/**
 * Lấy thông tin chi tiết một comment theo ID.
 * Hữu ích khi cần lấy thông tin comment từ notification để navigate đến bài viết chứa comment đó.
 */
export const fetchCommentById = async (commentId: string): Promise<CommentWithUser | null> => {
    try {
        const response = await apiClient.get(`/community/comments/${commentId}`);
        
        // Kiểm tra các format response khác nhau
        if ((response as any).data) {
            return (response as any).data; // API trả về { success, message, data: Comment }
        }
        
        // Nếu response chính là Comment
        if ((response as any).id) {
            return response as CommentWithUser;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching comment by ID:', error);
        return null;
    }
};

/**
 * Tải tất cả bình luận (đã được làm giàu và sắp xếp dạng cây) cho một bài viết.
 */
export const fetchCommentsByPostId = (postId: string): Promise<CommentWithUser[]> => {
        return apiClient.get(`/community/posts/${postId}/comments`);

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const comments = getEnrichedCommentsByPostId(postId, mockComments);
                resolve(comments);
            }, 400);
        });
    }
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
        const { postId, ...body } = payload;
    
    return apiClient.post<AddCommentResponse>(`/community/posts/${postId}/comments`, body);

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
                // Không chỉnh mockComments; trả về danh sách bình luận đã làm giàu bao gồm comment mới.
                const updatedList = getEnrichedCommentsByPostId(payload.postId, [...mockComments, newComment]);
                resolve({
                    success: true,
                    message: 'Lấy danh sách bình luận thành công.',
                    data: updatedList,
                });
            }, 200);
        });
    }
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
       return apiClient.put<UpdateCommentResponse>(`/community/comments/${commentId}`, payload);

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockComments.findIndex(c => c.id === commentId);
                if (index === -1) return reject(new Error("Comment not found"));
                
                // Tạo một object đã cập nhật thay vì thay đổi trực tiếp
                const updatedComment = { ...mockComments[index], ...payload };
                resolve({
                    success: true,
                    message: 'Cập nhật bình luận thành công.',
                    data: updatedComment,
                });
            }, 200);
        });
    }
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
