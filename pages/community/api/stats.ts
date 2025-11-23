import { apiClient } from '../../../services/apiClient';
import { ModerationLog } from '../../../types';
import { mockPosts, mockComments, mockModerationLogs } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// STATS & LOGS API
// =============================

type CommunityStats = { postCount: number; commentCount: number; moderationCount: number };

export const fetchCommunityStats = (): Promise<{ success: true; data: CommunityStats } | { success: boolean; data: CommunityStats }> => {
    return apiClient.get<{ success: boolean; data: CommunityStats }>('/community/stats');

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const stats: CommunityStats = {
                    postCount: mockPosts.filter(p => p.status === 'published').length,
                    commentCount: mockComments.filter(c => !c.deleted_at).length,
                    moderationCount: mockPosts.filter(p => p.status === 'removed').length + mockComments.filter(c => !!c.deleted_at).length,
                };

                resolve({ success: true, data: stats });
            }, 300);
        });
    }
};

export const fetchModerationLogs = (): Promise<{ success: true; data: ModerationLog[] } | { success: boolean; data: ModerationLog[] }> => {
        return apiClient.get<{ success: boolean; data: ModerationLog[] }>('/community/moderation-logs');

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {

                resolve({ success: true, data: mockModerationLogs });
            }, 300);
        });
    }
};
