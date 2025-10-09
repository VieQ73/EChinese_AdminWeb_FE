import { apiClient } from '../../../services/apiClient';
import { Achievement, UserAchievement, PaginatedResponse, User } from '../../../types';
import { mockAchievements, mockUserAchievements, mockUsers } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types
export type AchievementPayload = Omit<Achievement, 'id' | 'created_at' | 'updated_at'>;

interface FetchAchievementsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    sortBy?: 'created_at' | 'points';
    sortOrder?: 'asc' | 'desc';
}

// API Functions
export const fetchAchievements = (params: FetchAchievementsParams = {}): Promise<PaginatedResponse<Achievement>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search = '', status = 'all', sortBy = 'created_at', sortOrder = 'desc' } = params;
                let filtered = [...mockAchievements];

                if (search) filtered = filtered.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
                if (status !== 'all') filtered = filtered.filter(a => a.is_active === (status === 'active'));

                filtered.sort((a, b) => {
                    const valA = a[sortBy];
                    const valB = b[sortBy];
                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/settings/achievements?${query}`);
};

export const fetchAchievementUsers = (achievementId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<UserAchievement>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 5 } = params;
                const usersWithAchievement = mockUserAchievements.filter(ua => ua.achievement_id === achievementId);
                const total = usersWithAchievement.length;
                const totalPages = Math.ceil(total / limit);
                const data = usersWithAchievement.slice((page - 1) * limit, page * limit);
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 400);
        });
    }
    return apiClient.get(`/settings/achievements/${achievementId}/users`, { body: params as any });
};

export const createAchievement = (payload: AchievementPayload): Promise<Achievement> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newAchievement: Achievement = { ...payload, id: `ach_${Date.now()}`, created_at: new Date().toISOString() };
                mockAchievements.unshift(newAchievement);
                resolve(newAchievement);
            }, 300);
        });
    }
    return apiClient.post('/settings/achievements', payload);
};

export const updateAchievement = (id: string, payload: Partial<AchievementPayload>): Promise<Achievement> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockAchievements.findIndex(a => a.id === id);
                if (index === -1) return reject(new Error("Achievement not found"));
                mockAchievements[index] = { ...mockAchievements[index], ...payload, updated_at: new Date().toISOString() };
                resolve(mockAchievements[index]);
            }, 300);
        });
    }
    return apiClient.put(`/settings/achievements/${id}`, payload);
};

export const deleteAchievement = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = mockAchievements.findIndex(a => a.id === id);
                if (index > -1) mockAchievements.splice(index, 1);
                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.delete(`/settings/achievements/${id}`);
};

export const grantAchievementToUser = (userId: string, achievementId: string): Promise<UserAchievement> => {
     if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const achievement = mockAchievements.find(a => a.id === achievementId);
                const user = mockUsers.find(u => u.id === userId);
                if (!achievement || !user) return reject(new Error("User or Achievement not found"));

                const existing = mockUserAchievements.find(ua => ua.user_id === userId && ua.achievement_id === achievementId);
                if (existing) return reject(new Error("Người dùng đã có thành tích này."));

                const newUserAchievement: UserAchievement = {
                    id: `ua_${Date.now()}`,
                    user_id: userId,
                    achievement_id: achievementId,
                    achieved_at: new Date().toISOString(),
                    achievement_name: achievement.name,
                    user_name: user.name,
                    user_avatar: user.avatar_url,
                };
                mockUserAchievements.unshift(newUserAchievement);
                resolve(newUserAchievement);
            }, 300);
        });
    }
    return apiClient.post('/settings/achievements/grant', { userId, achievementId });
}

export const searchUsersForGranting = (query: string, achievementId: string): Promise<User[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (!query.trim()) {
                    resolve([]);
                    return;
                }
                const lowerQuery = query.toLowerCase();

                // Tìm những user đã có thành tích này
                const usersWithAchievement = new Set(
                    mockUserAchievements.filter(ua => ua.achievement_id === achievementId).map(ua => ua.user_id)
                );

                const results = mockUsers.filter(user => 
                    !usersWithAchievement.has(user.id) && (
                        user.id.toLowerCase().includes(lowerQuery) ||
                        user.name.toLowerCase().includes(lowerQuery) ||
                        user.username.toLowerCase().includes(lowerQuery) ||
                        user.email?.toLowerCase().includes(lowerQuery)
                    )
                ).slice(0, 5); // Giới hạn 5 kết quả cho dropdown

                resolve(results);
            }, 300);
        });
    }
    return apiClient.get(`/users/search-for-granting?q=${query}&achievementId=${achievementId}`);
}