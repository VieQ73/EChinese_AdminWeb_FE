import { apiClient } from '../../../services/apiClient';
import { mockPostLikes, mockPostViews } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// INTERACTION API
// =============================

type ToggleLikeResponse = {
    success: boolean;
    message: string;
    data: { action: 'liked' | 'unliked'; likes: number };
};

type ToggleViewResponse = {
    success: boolean;
    message: string;
    data: { views: number };
};

export const toggleLike = (postId: string, userId: string): Promise<ToggleLikeResponse> => {
    
    
    return apiClient.post<ToggleLikeResponse>(`/community/posts/${postId}/like`, {});

    if (USE_MOCK_API) {
        // Hàm này không còn trực tiếp thay đổi state.
        // Logic cập nhật state đã được chuyển vào AppDataContext (optimistic update).
        // Hàm này chỉ mô phỏng việc gọi API thành công.
        return new Promise(resolve => {
            setTimeout(() => {
                const currentLikes = mockPostLikes.filter(l => l.post_id === postId).length;
                const alreadyLiked = mockPostLikes.some(l => l.post_id === postId && l.user_id === userId);
                const action: 'liked' | 'unliked' = alreadyLiked ? 'unliked' : 'liked';
                const likes = alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
                resolve({
                    success: true,
                    message: action === 'liked' ? 'Đã thích bài viết.' : 'Đã bỏ thích bài viết.',
                    data: { action, likes },
                });
            }, 100);
        });
    }
    
};

export const toggleView = (postId: string, userId: string): Promise<ToggleViewResponse> => {
    
    return apiClient.post<ToggleViewResponse>(`/community/posts/${postId}/view`, {});

    if (USE_MOCK_API) {
        // Tương tự toggleLike, hàm này chỉ mô phỏng API call.
        return new Promise(resolve => {
            setTimeout(() => {
                const currentViews = mockPostViews.filter(v => v.post_id === postId).length;
                const views = currentViews + 1;
                resolve({
                    success: true,
                    message: 'Ghi nhận lượt xem thành công.',
                    data: { views },
                });
            }, 100);
        });
    }
     
};