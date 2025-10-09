import { apiClient } from '../../../services/apiClient';
import { BadgeLevel, User } from '../../../types';
import { mockBadges } from '../../../mock/settings';
import { mockUsers } from '../../../mock/users';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export type BadgePayload = Omit<BadgeLevel, 'id' | 'level' | 'created_at' | 'updated_at'>;

export const fetchBadges = (): Promise<BadgeLevel[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Sắp xếp theo level tăng dần
                resolve([...mockBadges].sort((a, b) => a.min_points - b.min_points));
            }, 300);
        });
    }
    return apiClient.get('/settings/badges');
};

export const createBadge = (payload: BadgePayload): Promise<BadgeLevel> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validation
                if (payload.min_points === 0 || mockBadges.some(b => b.min_points === payload.min_points)) {
                    return reject(new Error('Điểm tối thiểu đã tồn tại hoặc không hợp lệ (không được là 0).'));
                }

                // Tìm level cao nhất hiện có để tạo level mới
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
            }, 400);
        });
    }
    return apiClient.post('/settings/badges', payload);
};

export const updateBadge = (id: string, payload: Partial<BadgePayload>): Promise<BadgeLevel> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockBadges.findIndex(b => b.id === id);
                if (index === -1) return reject(new Error("Badge not found"));
                
                const badge = mockBadges[index];

                // Ngăn chặn việc vô hiệu hóa các huy hiệu đặc biệt (Người mới, Admin, Super Admin)
                if ([0, 4, 5].includes(badge.level) && payload.is_active === false) {
                    delete payload.is_active;
                }
                
                // Ngăn chặn việc sửa min_points của huy hiệu cấp 0, admin, super admin
                if ([0, 4, 5].includes(badge.level) && payload.min_points !== undefined) {
                    delete payload.min_points;
                }
                
                // Kiểm tra trùng lặp min_points khi cập nhật
                if (payload.min_points !== undefined && mockBadges.some(b => b.id !== id && b.min_points === payload.min_points)) {
                     return reject(new Error('Điểm tối thiểu đã tồn tại ở một huy hiệu khác.'));
                }

                mockBadges[index] = { ...badge, ...payload };
                resolve(mockBadges[index]);
            }, 300);
        });
    }
    return apiClient.put(`/settings/badges/${id}`, payload);
};

export const deleteBadge = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockBadges.findIndex(b => b.id === id);
                if (index === -1) return reject(new Error("Badge not found"));

                const badgeToDelete = mockBadges[index];
                if ([0, 4, 5].includes(badgeToDelete.level)) {
                    return reject(new Error("Không thể xóa các huy hiệu hệ thống đặc biệt."));
                }

                mockBadges.splice(index, 1);
                resolve({ success: true });
            }, 400);
        });
    }
    return apiClient.delete(`/settings/badges/${id}`);
};


/**
 * Tính toán lại và cập nhật huy hiệu cho tất cả người dùng.
 * @returns Trả về danh sách người dùng đã được cập nhật.
 */
export const resyncAllUserBadges = (): Promise<{ updatedUsers: User[] }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Lấy các huy hiệu đang hoạt động, có điểm, và không phải của admin/superadmin
                const activePointBadges = [...mockBadges]
                    .filter(b => b.is_active && b.min_points !== undefined && ![4, 5].includes(b.level))
                    .sort((a, b) => b.min_points - a.min_points); // Sắp xếp từ cao xuống thấp

                const updatedUsers = mockUsers.map(user => {
                    // Không thay đổi huy hiệu của admin và super admin
                    if (user.role === 'admin' || user.role === 'super admin') {
                        return user;
                    }
                    
                    // Tìm huy hiệu cao nhất mà người dùng đủ điều kiện
                    const newBadge = activePointBadges.find(b => user.community_points >= b.min_points);
                    
                    // Mặc định là level 0 nếu không đủ điều kiện cho bất kỳ huy hiệu nào
                    const newBadgeLevel = newBadge ? newBadge.level : 0;

                    if (user.badge_level !== newBadgeLevel) {
                        return { ...user, badge_level: newBadgeLevel };
                    }
                    return user;
                });
                
                // Cập nhật lại mock data gốc
                mockUsers.length = 0;
                mockUsers.push(...updatedUsers);

                resolve({ updatedUsers });
            }, 800);
        });
    }
    return apiClient.post('/settings/badges/resync', {});
};