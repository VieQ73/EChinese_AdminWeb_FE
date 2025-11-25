// API functions cho Community Stats
import { apiClient } from '../../../services/apiClient';
import { ModerationLog } from '../../../types';
import { mockPosts, mockComments } from '../../../mock/community';
import { mockModerationLogs } from '../../../mock/moderation';

// Flag để chuyển đổi giữa mock và API thật
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export interface CommunityStats {
    postCount: number;
    commentCount: number;
    moderationCount: number;
    logs: ModerationLog[];
}

/**
 * Lấy thống kê cộng đồng cho sidebar
 */
export async function fetchCommunityStats(): Promise<CommunityStats> {
    if (USE_MOCK_API) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const postCount = mockPosts.filter(p => p.status === 'published').length;
        const commentCount = mockComments.filter(c => !c.deleted_at).length;
        const moderationCount = mockPosts.filter(p => p.status === 'removed').length + 
                               mockComments.filter(c => !!c.deleted_at).length;
        
        return {
            postCount,
            commentCount,
            moderationCount,
            logs: mockModerationLogs
        };
    }
    
    return apiClient.get<CommunityStats>('/community/stats');
}

/**
 * Lấy moderation logs
 */
export async function fetchModerationLogs(limit?: number): Promise<ModerationLog[]> {
    if (USE_MOCK_API) {
        await new Promise(resolve => setTimeout(resolve, 150));
        return limit ? mockModerationLogs.slice(0, limit) : mockModerationLogs;
    }
    
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiClient.get<ModerationLog[]>(`/community/moderation-logs${queryParams}`);
}
