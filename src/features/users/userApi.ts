import { apiClient } from '../../services/apiClient';
import type { User } from '../../types/entities';
import type { PaginatedResponse } from '../../types/api';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/** Mock data gốc */
let mockUsers: User[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    username: 'superadmin',
    name: 'Super Admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'super@admin.com',
    role: 'super admin',
    is_active: true,
    isVerify: true,
    community_points: 9999,
    level: '7-9',
    badge_level: 5,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2023-01-15T10:00:00Z',
    last_login: new Date().toISOString(),
    subscription_id: 'sub-permanent-001',
    subscription_expiry: null,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    username: 'admin',
    name: 'Admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    isVerify: true,
    community_points: 1500,
    level: '6',
    badge_level: 4,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2023-05-20T14:30:00Z',
    last_login: new Date().toISOString(),
    subscription_id: 'sub-free-001',
    subscription_expiry: null,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    username: 'testuser1',
    name: 'Nguyễn Văn A',
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'vana@gmail.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 250,
    level: '3',
    badge_level: 2,
    language: 'Tiếng Việt',
    provider: 'google',
    created_at: '2024-06-10T08:00:00Z',
    last_login: '2024-07-20T11:00:00Z',
    subscription_id: 'sub-premium-001',
    subscription_expiry: '2025-06-10T08:00:00Z',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
    username: 'testuser2',
    name: 'Trần Thị B',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'thib@gmail.com',
    role: 'user',
    is_active: false,
    isVerify: false,
    community_points: 50,
    level: '1',
    badge_level: 5,
    language: 'Tiếng Anh',
    provider: 'local',
    created_at: '2024-07-01T18:45:00Z',
    last_login: '2024-07-02T10:00:00Z',
    subscription_id: 'sub-free-001',
    subscription_expiry: null,
  },
  // additional mock users
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    username: 'locked_user',
    name: 'Người Bị Khóa',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'locked@example.com',
    role: 'user',
    is_active: false, // locked
    isVerify: true,
    community_points: 10,
    level: '1',
    badge_level: 1,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2024-08-01T12:00:00Z',
    last_login: '2024-09-01T09:00:00Z',
    subscription_id: '',
    subscription_expiry: null,
  },
  {
    id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    username: 'user3',
    name: 'Lê Văn C',
    avatar_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'c@example.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 75,
    level: '2',
    badge_level: 0,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2024-09-10T10:00:00Z',
    last_login: '2024-09-11T08:00:00Z',
    subscription_id: '',
    subscription_expiry: null,
  },
  {
    id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
    username: 'moderator1',
    name: 'Phạm Thị D',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'moderator1@example.com',
    role: 'admin',
    is_active: true,
    isVerify: true,
    community_points: 800,
    level: '5',
    badge_level: 3,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2024-03-15T16:00:00Z',
    last_login: new Date().toISOString(),
    subscription_id: 'sub-premium-002',
    subscription_expiry: '2025-03-15T16:00:00Z',
  },
  {
    id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678',
    username: 'student1',
    name: 'Hoàng Văn E',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'student1@gmail.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 320,
    level: '4',
    badge_level: 2,
    language: 'Tiếng Việt',
    provider: 'google',
    created_at: '2024-08-20T09:30:00Z',
    last_login: '2024-09-25T14:00:00Z',
    subscription_id: 'sub-premium-003',
    subscription_expiry: '2025-08-20T09:30:00Z',
  },
  {
    id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
    username: 'teacher1',
    name: 'Vũ Thị F',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face&auto=format',
    email: 'teacher1@example.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 950,
    level: '6',
    badge_level: 3,
    language: 'Tiếng Việt',
    provider: 'local',
    created_at: '2024-02-10T11:15:00Z',
    last_login: '2024-09-28T08:45:00Z',
    subscription_id: 'sub-premium-004',
    subscription_expiry: '2025-02-10T11:15:00Z',
  }
];

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  is_active?: boolean;
}

/** [GET] Lấy danh sách người dùng có phân trang và bộ lọc. */
export const fetchAllUsers = (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  if (USE_MOCK_API) {
    console.warn('[MOCK] Lấy danh sách người dùng với params:', params);
    let filteredUsers = [...mockUsers];

    // Giả lập logic filter và search của backend
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        u =>
          u.name?.toLowerCase().includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm) ||
          u.username?.toLowerCase().includes(searchTerm)
      );
    }
    if (params.role) {
      filteredUsers = filteredUsers.filter(u => u.role === params.role);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedUsers = filteredUsers.slice(start, end);

    return new Promise(resolve =>
      setTimeout(
        () =>
          resolve({
            data: pagedUsers,
            meta: { total: filteredUsers.length, page, limit, totalPages: Math.ceil(filteredUsers.length / limit) },
          }),
        500
      )
    );
  }
  return apiClient.get('/users', { params });
};

/** [GET] Chi tiết người dùng */
export const fetchUserById = (userId: string): Promise<User> => {
  if (USE_MOCK_API) {
    const user = mockUsers.find(u => u.id === userId);
    return new Promise(resolve => setTimeout(() => resolve(user || mockUsers[0]), 500));
  }
  return apiClient.get(`/users/${userId}`);
};

/** [PUT] Cập nhật người dùng */
export const updateUser = (userId: string, data: Partial<User>): Promise<User> => {
  if (USE_MOCK_API) {
    mockUsers = mockUsers.map(u => (u.id === userId ? { ...u, ...data } : u));
    const updated = mockUsers.find(u => u.id === userId)!;
    return new Promise(resolve => setTimeout(() => resolve(updated), 500));
  }
  return apiClient.put(`/users/${userId}`, data);
};

/** [DELETE] Xóa người dùng */
export const deleteUser = (userId: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    mockUsers = mockUsers.filter(u => u.id !== userId);
    return new Promise(resolve => setTimeout(() => resolve({ message: `Người dùng ${userId} đã được xóa.` }), 500));
  }
  return apiClient.delete(`/users/${userId}`);
};

/** [PUT] Khóa tài khoản */
export const deactivateUser = (userId: string): Promise<User> => {
  if (USE_MOCK_API) {
    mockUsers = mockUsers.map(u => (u.id === userId ? { ...u, is_active: false } : u));
    const user = mockUsers.find(u => u.id === userId)!;
    return new Promise(resolve => setTimeout(() => resolve(user), 500));
  }
  return apiClient.put(`/users/${userId}/lock`);
};

/** [PUT] Mở khóa tài khoản */
export const activateUser = (userId: string): Promise<User> => {
  if (USE_MOCK_API) {
    mockUsers = mockUsers.map(u => (u.id === userId ? { ...u, is_active: true } : u));
    const user = mockUsers.find(u => u.id === userId)!;
    return new Promise(resolve => setTimeout(() => resolve(user), 500));
  }
  return apiClient.put(`/users/${userId}/unlock`);
};

/** Export function để lấy users từ external components */
export const getAllMockUsers = (): User[] => [...mockUsers];

export const getUserById = (userId: string): User | undefined => mockUsers.find(u => u.id === userId);

/** Mock UserUsage data and helpers for AI quota management */
interface ResetQuotaPayload {
  feature?: 'ai_lesson' | 'ai_translate';
}

let mockUserUsages: Array<{
  id: string;
  user_id: string;
  feature: 'ai_lesson' | 'ai_translate';
  daily_count: number;
  last_reset: string;
}> = [
  // Example usages for existing mock users
  { id: 'uusage-1', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', feature: 'ai_lesson', daily_count: 5, last_reset: new Date().toISOString() },
  { id: 'uusage-2', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', feature: 'ai_translate', daily_count: 2, last_reset: new Date().toISOString() },
  { id: 'uusage-3', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', feature: 'ai_lesson', daily_count: 0, last_reset: new Date().toISOString() },
];

/** [GET] Lấy UserUsage cho một user */
export const fetchUserUsage = (userId: string): Promise<any[]> => {
  if (USE_MOCK_API) {
    const rows = mockUserUsages.filter(u => u.user_id === userId);
    return new Promise(resolve => setTimeout(() => resolve(rows), 300));
  }
  return apiClient.get(`/admin/users/${userId}/usage`);
};

/** [POST] Reset quota cho user (admin only endpoint) */
export const resetUserQuota = (userId: string, payload?: ResetQuotaPayload): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    // If feature provided, reset only that; otherwise reset all AI features
    const now = new Date().toISOString();
    mockUserUsages = mockUserUsages.map(u => {
      if (u.user_id !== userId) return u;
      if (!payload?.feature || payload.feature === u.feature) {
        return { ...u, daily_count: 0, last_reset: now };
      }
      return u;
    });
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Quota đã được reset (mock).' }), 300));
  }
  // Backend admin route as specified: POST /api/admin/users/:id/reset-quota
  return apiClient.post(`/admin/users/${userId}/reset-quota`, payload || {});
};
