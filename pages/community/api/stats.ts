import { apiClient } from '../../../services/apiClient';
import { ModerationLog } from '../../../types';
import { mockPosts, mockComments, mockModerationLogs } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// STATS & LOGS API
// =============================

export const fetchCommunityStats = (): Promise<{ postCount: number; commentCount: number; moderationCount: number }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    postCount: mockPosts.filter(p => p.status === 'published').length,
                    commentCount: mockComments.filter(c => !c.deleted_at).length,
                    moderationCount: mockPosts.filter(p => p.status === 'removed').length + mockComments.filter(c => !!c.deleted_at).length,
                });
            }, 300);
        });
    }
    return apiClient.get('/community/stats');
};

export const fetchModerationLogs = (): Promise<ModerationLog[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockModerationLogs);
            }, 300);
        });
    }
    return apiClient.get('/community/moderation-logs');
};
