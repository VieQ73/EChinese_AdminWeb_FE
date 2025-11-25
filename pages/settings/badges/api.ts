import { apiClient } from '../../../services/apiClient';
import { BadgeLevel, User } from '../../../types';
import { mockBadges } from '../../../mock/settings';
import { mockUsers } from '../../../mock/users';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export type BadgePayload = Omit<BadgeLevel, 'id' | 'level' | 'created_at' | 'updated_at'>;

// ===================== API RESPONSE TYPES =====================
type FetchBadgesResponse = {
    success: boolean;
    message: string;
    data: BadgeLevel[];
};

type CreateBadgeResponse = {
    success: boolean;
    message: string;
    data: BadgeLevel;
};

type UpdateBadgeResponse = {
    success: boolean;
    message: string;
    data: BadgeLevel;
};

type DeleteBadgeResponse = {
    success: boolean;
    message: string;
};

type ResyncBadgesResponse = {
    success: boolean;
    message: string;
    data: User[];
};

// ===================== FETCH BADGES =====================
export const fetchBadges = async (): Promise<BadgeLevel[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const sorted = [...mockBadges].sort((a, b) => a.min_points - b.min_points);
                resolve(sorted);
            });
        });
    }

    // Real API
    const response = await apiClient.get<FetchBadgesResponse>('/admin/settings/badges');
    return [...response.data].sort((a, b) => a.min_points - b.min_points);
};

export const createBadge = async (payload: BadgePayload): Promise<BadgeLevel> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (payload.min_points === 0 || mockBadges.some(b => b.min_points === payload.min_points)) {
                    return reject(new Error('Điểm tối thiểu đã tồn tại hoặc không hợp lệ (không được là 0).'));
                }
                const maxLevel = Math.max(...mockBadges.map(b => b.level));
                const newBadge: BadgeLevel = {
                    ...payload,
                    id: `badge-${Date.now()}`,
                    level: maxLevel + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mockBadges.push(newBadge);
                resolve(newBadge);
            });
        });
    }

    // Real API
    const response = await apiClient.post<CreateBadgeResponse>('/admin/settings/badges', payload);
    return response.data;
};

export const updateBadge = async (id: string, payload: Partial<BadgePayload>): Promise<BadgeLevel> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockBadges.findIndex(b => b.id === id);
                if (index === -1) return reject(new Error('Badge not found'));
                const badge = mockBadges[index];
                if ([0, 4, 5].includes(badge.level) && payload.is_active === false) {
                    delete payload.is_active;
                }
                if ([0, 4, 5].includes(badge.level) && payload.min_points !== undefined) {
                    delete payload.min_points;
                }
                if (payload.min_points !== undefined && mockBadges.some(b => b.id !== id && b.min_points === payload.min_points)) {
                    return reject(new Error('Điểm tối thiểu đã tồn tại ở một huy hiệu khác.'));
                }
                mockBadges[index] = { ...badge, ...payload };
                resolve(mockBadges[index]);
            });
        });
    }

    // Real API
    const response = await apiClient.put<UpdateBadgeResponse>(`/admin/settings/badges/${id}` , payload);
    return response.data;
};

export const deleteBadge = async (id: string): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockBadges.findIndex(b => b.id === id);
                if (index === -1) return reject(new Error('Badge not found'));
                const badgeToDelete = mockBadges[index];
                if ([0, 4, 5].includes(badgeToDelete.level)) {
                    return reject(new Error('Không thể xóa các huy hiệu hệ thống đặc biệt.'));
                }
                mockBadges.splice(index, 1);
                resolve({ success: true, message: 'thành công' });
            });
        });
    }

    // Real API
    const response = await apiClient.delete<DeleteBadgeResponse>(`/admin/settings/badges/${id}`);
    return { success: response.success, message: response.message };
};


/**
 * Tính toán lại và cập nhật huy hiệu cho tất cả người dùng.
 * @returns Trả về danh sách người dùng đã được cập nhật.
 */
export const resyncAllUserBadges = async (): Promise<User[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const activePointBadges = [...mockBadges]
                    .filter(b => b.is_active && b.min_points !== undefined && ![4, 5].includes(b.level))
                    .sort((a, b) => b.min_points - a.min_points);
                const updatedUsers = mockUsers.map(user => {
                    if (user.role === 'admin' || user.role === 'super admin') return user;
                    const newBadge = activePointBadges.find(b => user.community_points >= b.min_points);
                    const newLevel = newBadge ? newBadge.level : 0;
                    return user.badge_level !== newLevel ? { ...user, badge_level: newLevel } : user;
                });
                mockUsers.length = 0;
                mockUsers.push(...updatedUsers);
                resolve(updatedUsers);
            });
        });
    }

    // Real API
    const response = await apiClient.post<ResyncBadgesResponse>('/admin/settings/badges/resync', {});
    return response.data;
};
