
import { apiClient } from '../../services/apiClient';
import { 
    User, 
    UserSession, 
    UserAchievement, 
    UserStreak, 
    Subscription,
    UserDailyActivity,
    UserUsage,
    PaginatedResponse,
} from '../../types';

// Extended User type with subscription info from API
export interface UserWithSubscription extends User {
    subscription?: {
        id: string;
        name: string;
        duration_months: number;
        price: number;
        expiry_date: string;
        is_active: boolean;
    } | null;
}
import { 
    mockUsers, 
    mockUserSessions, 
    mockUserAchievements, 
    mockUserStreaks, 
    mockSubscriptions,
    mockUserUsage,
    mockUserDailyActivities,
    mockUserSubscriptions
} from '../../mock';
import { log } from 'node:console';

//  Cast import.meta to any to resolve TypeScript error regarding 'env' property,
// as the vite/client types are not available in this context.
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// === TYPES ===

export interface UserDetailData {
  user: User;
  sessions: UserSession[];
  achievements: UserAchievement[];
  streak?: UserStreak;
  subscription?: Subscription;
  dailyActivities: UserDailyActivity[];
  usage: UserUsage[];
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  roleFilter?: 'all' | 'user' | 'admin' | 'super admin';
}

// === API FUNCTIONS ===

/**
 * Lấy danh sách người dùng với filter và pagination.
 */
export const fetchUsers = (params: FetchUsersParams = {}): Promise<PaginatedResponse<UserWithSubscription>> => {
    
    type FetchUsersResponse = {
        success: boolean;
        data: {
            data: UserWithSubscription[];
            meta: { total: number; page: number; limit: number; totalPages: number };
        };
    };
    const query = new URLSearchParams(params as any).toString();
    return apiClient
        .get<FetchUsersResponse>(`/admin/users?${query}`)
        .then(res => ({ data: res.data.data, meta: res.data.meta }));

    if (USE_MOCK_API) {
    return new Promise(resolve => {
      setTimeout(() => {
        const { page = 1, limit = 20, searchTerm = '', roleFilter = 'all' } = params;
        
        const filteredUsers = mockUsers.filter(user => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = user.name.toLowerCase().includes(lowerSearchTerm) ||
                user.username.toLowerCase().includes(lowerSearchTerm) ||
                (user.email && user.email.toLowerCase().includes(lowerSearchTerm));
            const matchesFilter = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesFilter;
        });

        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const data = filteredUsers.slice((page - 1) * limit, page * limit);

        resolve({
          data,
          meta: {
            total,
            page,
            limit,
            totalPages,
          }
        });
      }, 300);
    });
  }

};

/**
 * Lấy toàn bộ dữ liệu chi tiết cho một người dùng.
 */
export const fetchUserDetailData = (userId: string): Promise<UserDetailData> => {
    
    type UserDetailResponse = {
        user: User;
        achievements: UserAchievement[];
        dailyActivities: UserDailyActivity[];
        sessions: UserSession[];
        streak: UserStreak | null;
        subscription: Subscription | null;
        usage: UserUsage[];
    };
    return apiClient.get<UserDetailResponse>(`/admin/users/${userId}/details`).then(res => ({
        user: res.user,
        achievements: res.achievements,
        dailyActivities: res.dailyActivities,
        sessions: res.sessions,
        streak: res.streak || undefined,
        subscription: res.subscription || undefined,
        usage: res.usage,
    }));

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.id === userId);
                if (!user) {
                    return reject(new Error('Không tìm thấy người dùng.'));
                }

                const activeUserSub = mockUserSubscriptions.find(us => us.user_id === user.id && us.is_active);
                const subscriptionId = activeUserSub ? activeUserSub.subscription_id : 'sub_free';

                const data: UserDetailData = {
                    user,
                    sessions: mockUserSessions.filter(s => s.user_id === userId).sort((a, b) => new Date(b.login_at).getTime() - new Date(a.login_at).getTime()),
                    achievements: mockUserAchievements.filter(a => a.user_id === userId),
                    streak: mockUserStreaks.find(s => s.user_id === userId),
                    subscription: mockSubscriptions.find(sub => sub.id === subscriptionId),
                    dailyActivities: mockUserDailyActivities.filter(a => a.user_id === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                    usage: mockUserUsage.filter(u => u.user_id === userId)
                };
                resolve(data);

            }, 300);
        });
    }

};

/**
 * Lấy thông tin cơ bản của một người dùng (dùng cho các component nhỏ).
 */

export const fetchUserById = (userId: string): Promise<User| undefined> => {
    return apiClient.get<User>(`/admin/users/${userId}`);
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const u = mockUsers.find(m => m.id === userId);
                if (!u) return reject(new Error('Không tìm thấy người dùng.'));
                resolve(u);
            }, 200);
        });
    }
    
};


/**
 * Cập nhật thông tin người dùng.
 */
export const updateUser = (userId: string, data: Partial<User>): Promise<User> => {
    console.log(data);
    
    return apiClient.put<User>(`/admin/users/${userId}`, data);
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userIndex = mockUsers.findIndex(u => u.id === userId);
                if (userIndex === -1) {
                    return reject(new Error('Không tìm thấy người dùng.'));
                }
                mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
                console.log(mockUsers[userIndex]);
                
                resolve(mockUsers[userIndex]);
            }, 300);
        });
    }
    
};

/**
 * Reset hạn mức sử dụng hàng ngày của người dùng cho một tính năng cụ thể.
 */
export const resetUserQuota = (userId: string, feature: 'ai_lesson' | 'ai_translate'): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const usageIndex = mockUserUsage.findIndex(u => u.user_id === userId && u.feature === feature);
                if (usageIndex === -1) {
                    // Nếu người dùng chưa có bản ghi sử dụng, tạo mới.
                    mockUserUsage.push({
                        id: `usage_mock_${Date.now()}`,
                        user_id: userId,
                        feature: feature,
                        daily_count: 0,
                        last_reset: new Date().toISOString()
                    });
                } else {
                    mockUserUsage[usageIndex].daily_count = 0;
                    mockUserUsage[usageIndex].last_reset = new Date().toISOString();
                }
                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.post(`/admin/users/${userId}/reset-quota`, { feature });
};

/**
 * Yêu cầu đặt lại mật khẩu cho người dùng.
 * API này sẽ gửi một email chứa liên kết để người dùng tự đặt lại mật khẩu.
 */
export const resetUserPassword = (userId: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.id === userId);
                if (user && user.email) {
                    console.log(`[MOCK] Gửi email đặt lại mật khẩu đến ${user.email}.`);
                    resolve({ message: `Đã gửi email đặt lại mật khẩu đến ${user.email}.` });
                } else if (user) {
                    resolve({ message: 'Người dùng này không có địa chỉ email.' });
                } else {
                    resolve({ message: 'Không tìm thấy người dùng.' });
                }
            }, 500);
        });
    }
    // API thật: Gửi yêu cầu POST để kích hoạt quy trình đặt lại mật khẩu
    return apiClient.post(`/admin/users/${userId}/reset-password`, {});
};

/**
 * Xóa vĩnh viễn một người dùng khỏi hệ thống.
 * Đây là một hành động nguy hiểm và không thể hoàn tác.
 */
export const deleteUser = (userId: string): Promise<{ success: boolean }> => {
    
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userIndex = mockUsers.findIndex(u => u.id === userId);
                if (userIndex === -1) {
                    return reject(new Error('Không tìm thấy người dùng để xóa.'));
                }
                
                // Xóa người dùng khỏi mảng chính
                mockUsers.splice(userIndex, 1);
                
                // Helper để xóa tại chỗ dữ liệu liên quan từ các mảng mock khác
                const filterInPlace = <T extends { user_id: string }>(arr: T[], id: string) => {
                    for (let i = arr.length - 1; i >= 0; i--) {
                        if (arr[i].user_id === id) {
                            arr.splice(i, 1);
                        }
                    }
                };

                filterInPlace(mockUserSessions, userId);
                filterInPlace(mockUserDailyActivities, userId);
                filterInPlace(mockUserStreaks, userId);
                filterInPlace(mockUserUsage, userId);
                filterInPlace(mockUserAchievements, userId);
                filterInPlace(mockUserSubscriptions, userId);
                
                console.log(`[MOCK] Đã xóa người dùng ${userId} và dữ liệu liên quan.`);
                resolve({ success: true });
            }, 500);
        });
    }
    // API thật: Gửi yêu cầu DELETE để xóa người dùng
    return apiClient.delete(`/admin/users/${userId}`);
};

// === BAN/UNBAN USER ===

export interface BanUserPayload {
    reason: string; // Lý do cấm (hiển thị trên log)
    ruleIds: string[]; // Danh sách ID quy tắc vi phạm
    resolution: string; // Ghi chú hướng giải quyết
    severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm
}

export interface UnbanUserPayload {
    reason: string; // Lý do bỏ cấm
}

export interface BanUserResponse {
    success: boolean;
    message: string;
    user: User;
}

/**
 * Cấm người dùng - Đặt is_active = false
 * @param userId - ID của người dùng cần cấm
 * @param payload - Thông tin đầy đủ về lý do cấm
 * @returns Promise với thông tin người dùng đã được cập nhật
 */
export const banUser = (userId: string, payload: BanUserPayload): Promise<BanUserResponse> => {
    return apiClient.post<BanUserResponse>(`/admin/users/${userId}/ban`, payload);
};

/**
 * Bỏ cấm người dùng - Đặt is_active = true
 * @param userId - ID của người dùng cần bỏ cấm
 * @param payload - Thông tin lý do bỏ cấm
 * @returns Promise với thông tin người dùng đã được cập nhật
 */
export const unbanUser = (userId: string, payload: UnbanUserPayload): Promise<BanUserResponse> => {
    return apiClient.post<BanUserResponse>(`/admin/users/${userId}/unban`, payload);
};