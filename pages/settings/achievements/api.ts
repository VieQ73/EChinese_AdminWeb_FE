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
type AchievementsResponse = {
    success: boolean;
    message: string;
    data: Achievement[]; // Flat array per sample
    meta: { page: number; limit: number; total: number; totalPages: number };
};

export const fetchAchievements = async (params: FetchAchievementsParams = {}): Promise<PaginatedResponse<Achievement>> => {
    
        const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<AchievementsResponse>(`/admin/settings/achievements?${query}`);
    return { data: response.data, meta: response.meta };
    
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
                const pageData = filtered.slice((page - 1) * limit, page * limit);
                resolve({ data: pageData, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }

};

type AchievementUsersResponse = {
    success: boolean;
    data: {
        data: UserAchievement[];
        meta: { total: number; page: number; limit: number; totalPages: number };
    };
};

export const fetchAchievementUsers = async (
    achievementId: string,
    params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<UserAchievement>> => {

    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<AchievementUsersResponse>(`/admin/settings/achievements/${achievementId}/users?${query}`);
    return { data: response.data.data, meta: response.data.meta };

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 5 } = params;
                const usersWithAchievement = mockUserAchievements.filter(ua => ua.achievement_id === achievementId);
                const total = usersWithAchievement.length;
                const totalPages = Math.ceil(total / limit);
                const pageData = usersWithAchievement.slice((page - 1) * limit, page * limit);
                resolve({ data: pageData, meta: { total, page, limit, totalPages } });
            }, 400);
        });
    }

};

type CreateAchievementResponse = { success: boolean; data: Achievement };

export const createAchievement = async (payload: AchievementPayload): Promise<Achievement> => {
    
    const response = await apiClient.post<CreateAchievementResponse>(`/admin/settings/achievements`, payload);
    return response.data;

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newAchievement: Achievement = { ...payload, id: `ach_${Date.now()}`, created_at: new Date().toISOString() };
                mockAchievements.unshift(newAchievement);
                resolve(newAchievement);
            }, 300);
        });
    }
    
};

type UpdateAchievementResponse = { success: boolean; data: Achievement };

export const updateAchievement = async (id: string, payload: Partial<AchievementPayload>): Promise<Achievement> => {
    
    const response = await apiClient.put<UpdateAchievementResponse>(`/admin/settings/achievements/${id}`, payload);
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockAchievements.findIndex(a => a.id === id);
                if (index === -1) return reject(new Error('Achievement not found'));
                mockAchievements[index] = { ...mockAchievements[index], ...payload, updated_at: new Date().toISOString() };
                resolve(mockAchievements[index]);
            }, 300);
        });
    }
    
};

type DeleteAchievementResponse = { success: boolean; data?: any };

export const deleteAchievement = async (id: string): Promise<{ success: boolean }> => {
    
    const response = await apiClient.delete<DeleteAchievementResponse>(`/admin/settings/achievements/${id}`);
    return { success: response.success };

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = mockAchievements.findIndex(a => a.id === id);
                if (index > -1) mockAchievements.splice(index, 1);
                resolve({ success: true });
            }, 300);
        });
    }
    
};

type GrantAchievementResponse = { success: boolean; data: UserAchievement };

export const grantAchievementToUser = async (userId: string, achievementId: string): Promise<UserAchievement> => {
    
    const response = await apiClient.post<GrantAchievementResponse>(`/admin/settings/achievements/grant`, { userId, achievementId });
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const achievement = mockAchievements.find(a => a.id === achievementId);
                const user = mockUsers.find(u => u.id === userId);
                if (!achievement || !user) return reject(new Error('User or Achievement not found'));
                const existing = mockUserAchievements.find(ua => ua.user_id === userId && ua.achievement_id === achievementId);
                if (existing) return reject(new Error('Người dùng đã có thành tích này.'));
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
    
};

type SearchUsersResponse = { success: boolean; data: User[] };

export const searchUsersForGranting = async (query: string, achievementId: string): Promise<User[]> => {
    
    const response = await apiClient.get<SearchUsersResponse>(`/admin/users/search-for-granting?q=${encodeURIComponent(query)}&achievementId=${achievementId}`);
    return response.data;
    
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (!query.trim()) return resolve([]);
                const lowerQuery = query.toLowerCase();
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
                ).slice(0, 5);
                resolve(results);
            }, 300);
        });
    }
    
};