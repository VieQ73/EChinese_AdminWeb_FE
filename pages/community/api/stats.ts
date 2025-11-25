import { apiClient } from '../../../services/apiClient';
import { ModerationLog } from '../../../types';
import { mockPosts, mockComments, mockModerationLogs } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// STATS & LOGS API
// =============================

type CommunityStats = { postCount: number; commentCount: number; moderationCount: number };

export const fetchCommunityStats = (): Promise<{ success: boolean; data: CommunityStats }> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const stats: CommunityStats = {
            postCount: mockPosts.filter(p => p.status === 'published').length,
            commentCount: mockComments.filter(c => !c.deleted_at).length,
            moderationCount: mockPosts.filter(p => p.status === 'removed').length + mockComments.filter(c => !!c.deleted_at).length,
        };
        return Promise.resolve({ success: true, data: stats });
    }
    
    // Real API - BE trả về envelope { success, data }
    return apiClient.get<{ success: boolean; data: CommunityStats }>('/community/stats');
};

export const fetchModerationLogs = (): Promise<{ success: boolean; data: ModerationLog[] }> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: mockModerationLogs });
    }
    
    // Real API - BE trả về envelope { success, data }
    return apiClient.get<{ success: boolean; data: ModerationLog[] }>('/community/moderation-logs');
};
