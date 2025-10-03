/**
 * USER MANAGEMENT API - BACKEND CONNECTION
 * 
 * File này chứa tất cả các API endpoints cần thiết để kết nối với backend thật
 * cho phần quản lý người dùng trong admin panel.
 * 
 * Dựa trên:
 * - Database schema trong docs/database-schema.dbml
 * - Types trong src/types/entities.ts
 * - Logic hiện tại trong userApi.ts (mock)
 * - Components trong src/features/users/components/
 */

import { apiClient } from '../../services/apiClient';
import type { 
  User, 
  Subscription, 
  BadgeLevel, 
  UserUsage, 
  Payment,
  AdminLog,
  UUID,
  Timestamp
} from '../../types/entities';
import type { PaginatedResponse } from '../../types/api';

// =====================================================
// INTERFACES & TYPES
// =====================================================

/**
 * Tham số để lấy danh sách người dùng
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo name, email, username
  role?: 'user' | 'admin' | 'super admin' | '';
  is_active?: boolean | null;
  subscription_id?: string | null;
  badge_level?: number | null;
  sort_by?: 'created_at' | 'last_login' | 'community_points' | 'name';
  sort_order?: 'asc' | 'desc';
  level?: '1' | '2' | '3' | '4' | '5' | '6' | '7-9' | '';
  provider?: 'google' | 'apple' | 'local' | '';
  created_from?: string; // ISO date string
  created_to?: string; // ISO date string
}

/**
 * Response cho user statistics
 */
export interface UserStatsResponse {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  users_by_role: {
    user: number;
    admin: number;
    'super admin': number;
  };
  users_by_provider: {
    local: number;
    google: number;
    apple: number;
  };
  users_by_subscription: Array<{
    subscription_id: string;
    subscription_name: string;
    user_count: number;
  }>;
  users_by_badge_level: Array<{
    badge_level: number;
    badge_name: string;
    user_count: number;
  }>;
}

/**
 * Payload để tạo người dùng mới
 */
export interface CreateUserPayload {
  username: string;
  password?: string; // Optional cho OAuth users
  name?: string;
  email?: string;
  provider?: 'google' | 'apple' | 'local';
  provider_id?: string;
  role?: 'user' | 'admin' | 'super admin';
  subscription_id?: UUID;
  level?: '1' | '2' | '3' | '4' | '5' | '6' | '7-9';
  language?: 'Tiếng Việt' | 'Tiếng Anh';
}

/**
 * Payload để cập nhật người dùng
 */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'super admin';
  is_active?: boolean;
  isVerify?: boolean;
  community_points?: number;
  subscription_id?: UUID;
  subscription_expiry?: Timestamp;
  level?: '1' | '2' | '3' | '4' | '5' | '6' | '7-9';
  badge_level?: number;
  language?: 'Tiếng Việt' | 'Tiếng Anh';
}

/**
 * Response cho user detail với thông tin mở rộng
 */
export interface UserDetailResponse extends User {
  subscription_details?: Subscription;
  usage_stats?: UserUsage[];
  payment_history?: Payment[];
  recent_activities?: AdminLog[];
  total_posts?: number;
  total_comments?: number;
  total_likes_received?: number;
  achievement_count?: number;
}

/**
 * Payload để reset user quota
 */
export interface ResetQuotaPayload {
  feature?: 'ai_lesson' | 'ai_translate'; // Nếu không có thì reset all
  reset_all?: boolean;
}

/**
 * Payload để bulk operations
 */
export interface BulkUserOperationPayload {
  user_ids: UUID[];
  action: 'activate' | 'deactivate' | 'delete' | 'verify' | 'unverify' | 'reset_quota';
  reason?: string; // Cho delete action
  reset_quota_feature?: 'ai_lesson' | 'ai_translate'; // Cho reset_quota action
}

// =====================================================
// USER CRUD OPERATIONS
// =====================================================

/**
 * [GET] /api/admin/users
 * Lấy danh sách người dùng với phân trang và bộ lọc nâng cao
 */
export const fetchUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

/**
 * [GET] /api/admin/users/stats
 * Lấy thống kê tổng quan về người dùng
 */
export const fetchUserStats = async (): Promise<UserStatsResponse> => {
  const response = await apiClient.get('/admin/users/stats');
  return response.data;
};

/**
 * [GET] /api/admin/users/:id
 * Lấy chi tiết người dùng với thông tin mở rộng
 */
export const fetchUserDetail = async (userId: UUID): Promise<UserDetailResponse> => {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * [POST] /api/admin/users
 * Tạo người dùng mới (chỉ admin/super admin)
 */
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await apiClient.post('/admin/users', payload);
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id
 * Cập nhật thông tin người dùng
 */
export const updateUser = async (userId: UUID, payload: UpdateUserPayload): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}`, payload);
  return response.data;
};

/**
 * [DELETE] /api/admin/users/:id
 * Xóa vĩnh viễn người dùng (chỉ super admin)
 */
export const deleteUser = async (userId: UUID): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

// =====================================================
// USER STATUS MANAGEMENT
// =====================================================

/**
 * [PUT] /api/admin/users/:id/activate
 * Kích hoạt tài khoản người dùng
 */
export const activateUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/activate`);
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id/deactivate
 * Vô hiệu hóa tài khoản người dùng
 */
export const deactivateUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/deactivate`);
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id/verify
 * Xác thực email của người dùng
 */
export const verifyUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/verify`);
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id/unverify
 * Bỏ xác thực email của người dùng
 */
export const unverifyUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/unverify`);
  return response.data;
};

// =====================================================
// USER SUBSCRIPTION MANAGEMENT
// =====================================================

/**
 * [PUT] /api/admin/users/:id/subscription
 * Thay đổi gói đăng ký của người dùng
 */
export const updateUserSubscription = async (
  userId: UUID, 
  subscriptionId: UUID, 
  customExpiry?: Timestamp
): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/subscription`, {
    subscription_id: subscriptionId,
    custom_expiry: customExpiry
  });
  return response.data;
};

/**
 * [DELETE] /api/admin/users/:id/subscription
 * Xóa gói đăng ký của người dùng (về free)
 */
export const removeUserSubscription = async (userId: UUID): Promise<User> => {
  const response = await apiClient.delete(`/admin/users/${userId}/subscription`);
  return response.data;
};

/**
 * [GET] /api/admin/users/:id/payments
 * Lấy lịch sử thanh toán của người dùng
 */
export const fetchUserPayments = async (
  userId: UUID, 
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Payment>> => {
  const response = await apiClient.get(`/admin/users/${userId}/payments`, { params });
  return response.data;
};

// =====================================================
// AI QUOTA & USAGE MANAGEMENT
// =====================================================

/**
 * [GET] /api/admin/users/:id/usage
 * Lấy thông tin sử dụng AI của người dùng
 */
export const fetchUserUsage = async (userId: UUID): Promise<UserUsage[]> => {
  const response = await apiClient.get(`/admin/users/${userId}/usage`);
  return response.data;
};

/**
 * [POST] /api/admin/users/:id/reset-quota
 * Reset quota AI của người dùng
 */
export const resetUserQuota = async (
  userId: UUID, 
  payload: ResetQuotaPayload = {}
): Promise<{ message: string; updated_usage: UserUsage[] }> => {
  const response = await apiClient.post(`/admin/users/${userId}/reset-quota`, payload);
  return response.data;
};

/**
 * [GET] /api/admin/usage-stats
 * Lấy thống kê sử dụng AI toàn hệ thống
 */
export const fetchSystemUsageStats = async (
  params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    feature?: 'ai_lesson' | 'ai_translate';
  }
): Promise<{
  total_usage: number;
  usage_by_feature: Record<string, number>;
  usage_by_subscription: Array<{
    subscription_name: string;
    usage_count: number;
  }>;
  top_users: Array<{
    user_id: UUID;
    username: string;
    name: string;
    total_usage: number;
  }>;
}> => {
  const response = await apiClient.get('/admin/usage-stats', { params });
  return response.data;
};

// =====================================================
// BADGE & ACHIEVEMENT MANAGEMENT
// =====================================================

/**
 * [PUT] /api/admin/users/:id/badge-level
 * Thay đổi cấp độ huy hiệu của người dùng
 */
export const updateUserBadgeLevel = async (
  userId: UUID, 
  badgeLevel: number
): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/badge-level`, {
    badge_level: badgeLevel
  });
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id/community-points
 * Cập nhật điểm cộng đồng của người dùng
 */
export const updateUserCommunityPoints = async (
  userId: UUID, 
  points: number, 
  operation: 'set' | 'add' | 'subtract' = 'set'
): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/community-points`, {
    points,
    operation
  });
  return response.data;
};

/**
 * [POST] /api/admin/users/:id/achievements
 * Thêm thành tích cho người dùng
 */
export const addUserAchievement = async (
  userId: UUID, 
  achievement: {
    name: string;
    criteria: string;
    achieved_at?: Timestamp;
  }
): Promise<User> => {
  const response = await apiClient.post(`/admin/users/${userId}/achievements`, achievement);
  return response.data;
};

/**
 * [DELETE] /api/admin/users/:id/achievements/:achievementName
 * Xóa thành tích của người dùng
 */
export const removeUserAchievement = async (
  userId: UUID, 
  achievementName: string
): Promise<User> => {
  const response = await apiClient.delete(`/admin/users/${userId}/achievements/${achievementName}`);
  return response.data;
};

// =====================================================
// BULK OPERATIONS
// =====================================================

/**
 * [POST] /api/admin/users/bulk-operations
 * Thực hiện hành động hàng loạt trên nhiều người dùng
 */
export const bulkUserOperation = async (
  payload: BulkUserOperationPayload
): Promise<{
  success_count: number;
  failed_count: number;
  failed_users: Array<{
    user_id: UUID;
    error: string;
  }>;
  message: string;
}> => {
  const response = await apiClient.post('/admin/users/bulk-operations', payload);
  return response.data;
};

/**
 * [POST] /api/admin/users/export
 * Xuất danh sách người dùng ra file Excel/CSV
 */
export const exportUsers = async (
  params: GetUsersParams & { format?: 'excel' | 'csv' }
): Promise<Blob> => {
  const response = await apiClient.post('/admin/users/export', params, {
    responseType: 'blob'
  });
  return response.data;
};

// =====================================================
// ADMIN LOGS & AUDIT TRAIL
// =====================================================

/**
 * [GET] /api/admin/logs
 * Lấy lịch sử hành động admin
 */
export const fetchAdminLogs = async (
  params?: {
    page?: number;
    limit?: number;
    user_id?: UUID; // Admin thực hiện
    target_id?: UUID; // Đối tượng bị tác động
    action_type?: string;
    created_from?: string;
    created_to?: string;
  }
): Promise<PaginatedResponse<AdminLog>> => {
  const response = await apiClient.get('/admin/logs', { params });
  return response.data;
};

/**
 * [GET] /api/admin/users/:id/activity-logs
 * Lấy lịch sử hoạt động của một người dùng cụ thể
 */
export const fetchUserActivityLogs = async (
  userId: UUID,
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<AdminLog>> => {
  const response = await apiClient.get(`/admin/users/${userId}/activity-logs`, { params });
  return response.data;
};

// =====================================================
// NOTIFICATION MANAGEMENT
// =====================================================

/**
 * [POST] /api/admin/notifications/broadcast
 * Gửi thông báo tới tất cả người dùng hoặc một nhóm cụ thể
 */
export const sendBroadcastNotification = async (payload: {
  title: string;
  content: string;
  audience: 'all' | 'admin' | 'user';
  type: 'system' | 'announcement' | 'maintenance';
  redirect_url?: string;
  expires_at?: Timestamp;
}): Promise<{ message: string; notification_id: UUID }> => {
  const response = await apiClient.post('/admin/notifications/broadcast', payload);
  return response.data;
};

/**
 * [POST] /api/admin/notifications/send-to-user
 * Gửi thông báo riêng tư tới một người dùng cụ thể
 */
export const sendUserNotification = async (
  userId: UUID,
  payload: {
    title: string;
    content: string;
    type: 'system' | 'warning' | 'info' | 'reminder';
    related_type?: string;
    related_id?: UUID;
    redirect_url?: string;
  }
): Promise<{ message: string; notification_id: UUID }> => {
  const response = await apiClient.post(`/admin/notifications/send-to-user/${userId}`, payload);
  return response.data;
};

// =====================================================
// SUBSCRIPTION & BADGE LEVEL MANAGEMENT
// =====================================================

/**
 * [GET] /api/admin/subscriptions
 * Lấy danh sách tất cả gói đăng ký (để dùng trong dropdown)
 */
export const fetchAllSubscriptions = async (): Promise<Subscription[]> => {
  const response = await apiClient.get('/admin/subscriptions');
  return response.data;
};

/**
 * [GET] /api/admin/badge-levels
 * Lấy danh sách tất cả cấp độ huy hiệu (để dùng trong dropdown)
 */
export const fetchAllBadgeLevels = async (): Promise<BadgeLevel[]> => {
  const response = await apiClient.get('/admin/badge-levels');
  return response.data;
};

// =====================================================
// PASSWORD MANAGEMENT
// =====================================================

/**
 * [POST] /api/admin/users/:id/reset-password
 * Reset mật khẩu cho người dùng (gửi email với mật khẩu mới)
 */
export const resetUserPassword = async (
  userId: UUID,
  payload?: {
    send_email?: boolean;
    new_password?: string; // Nếu không có thì backend tự generate
  }
): Promise<{
  message: string;
  temporary_password?: string; // Chỉ trả về nếu send_email = false
}> => {
  const response = await apiClient.post(`/admin/users/${userId}/reset-password`, payload || {});
  return response.data;
};

/**
 * [PUT] /api/admin/users/:id/force-password-change
 * Buộc người dùng phải đổi mật khẩu ở lần đăng nhập tiếp theo
 */
export const forcePasswordChange = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/force-password-change`);
  return response.data;
};

// =====================================================
// ADVANCED SEARCH & FILTERING
// =====================================================

/**
 * [GET] /api/admin/users/search
 * Tìm kiếm người dùng nâng cao với nhiều tiêu chí
 */
export const advancedUserSearch = async (params: {
  query?: string; // Full-text search
  filters?: {
    role?: string[];
    is_active?: boolean;
    isVerify?: boolean;
    subscription_ids?: UUID[];
    badge_levels?: number[];
    levels?: string[];
    providers?: string[];
    community_points_min?: number;
    community_points_max?: number;
    created_date_range?: {
      start: string;
      end: string;
    };
    last_login_range?: {
      start: string;
      end: string;
    };
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get('/admin/users/search', { params });
  return response.data;
};

/**
 * Export tất cả functions để sử dụng
 */
export default {
  // CRUD Operations
  fetchUsers,
  fetchUserStats,
  fetchUserDetail,
  createUser,
  updateUser,
  deleteUser,
  
  // Status Management
  activateUser,
  deactivateUser,
  verifyUser,
  unverifyUser,
  
  // Subscription Management
  updateUserSubscription,
  removeUserSubscription,
  fetchUserPayments,
  
  // AI Quota & Usage
  fetchUserUsage,
  resetUserQuota,
  fetchSystemUsageStats,
  
  // Badge & Achievement
  updateUserBadgeLevel,
  updateUserCommunityPoints,
  addUserAchievement,
  removeUserAchievement,
  
  // Bulk Operations
  bulkUserOperation,
  exportUsers,
  
  // Admin Logs & Audit
  fetchAdminLogs,
  fetchUserActivityLogs,
  
  // Notifications
  sendBroadcastNotification,
  sendUserNotification,
  
  // Dropdown Data
  fetchAllSubscriptions,
  fetchAllBadgeLevels,
  
  // Password Management
  resetUserPassword,
  forcePasswordChange,
  
  // Advanced Search
  advancedUserSearch
};