import { apiClient } from '../../../services/apiClient';
import { mockPostLikes, mockPostViews } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// INTERACTION API
// =============================

export const toggleLike = (postId: string, userId: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        // Hàm này không còn trực tiếp thay đổi state.
        // Logic cập nhật state đã được chuyển vào AppDataContext (optimistic update).
        // Hàm này chỉ mô phỏng việc gọi API thành công.
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 100);
        });
    }
    return apiClient.post(`/community/posts/${postId}/like`, {});
};

export const toggleView = (postId: string, userId: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        // Tương tự toggleLike, hàm này chỉ mô phỏng API call.
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 100);
        });
    }
     return apiClient.post(`/community/posts/${postId}/view`, {});
};