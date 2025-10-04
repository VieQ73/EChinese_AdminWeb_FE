/**
 * USER MANAGEMENT API - BACKEND CONNECTION
 * 
 * File này chứa các API endpoints thực sự được sử dụng bởi frontend
 * cho phần quản lý người dùng trong admin panel.
 * 
 * Dựa trên phân tích usage từ:
 * - UsersManagementPage.tsx 
 * - UserDetailModal.tsx
 * - Mock data trong userApi.ts
 * - Components thực tế đã phát triển
 */

import { apiClient } from '../../services/apiClient';
import type { User, UserUsage, UUID } from '../../types/entities';
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
  role?: string;
  is_active?: boolean;
}

/**
 * Payload để cập nhật user (được sử dụng bởi UserDetailModal)
 */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  is_active?: boolean;
}

// =====================================================
// USER CRUD OPERATIONS
// =====================================================

/** [GET] /api/admin/users
 * Lấy danh sách người dùng với phân trang và filter cơ bản
 */
export const fetchAllUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};


/** [GET] /api/admin/users/:id
 * Lấy chi tiết người dùng
 */
export const fetchUserById = async (userId: UUID): Promise<User> => {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data;
};

/** [PUT] /api/admin/users/:id
 * Cập nhật thông tin người dùng (dùng bởi frontend)
 */
export const updateUser = async (userId: UUID, payload: UpdateUserPayload): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}`, payload);
  return response.data;
};

/** [DELETE] /api/admin/users/:id
 * Xóa người dùng
 */
export const deleteUser = async (userId: UUID): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

// =====================================================
// USER STATUS MANAGEMENT
// =====================================================


/** [PUT] /api/admin/users/:id/activate
 * Kích hoạt tài khoản người dùng
 */
export const activateUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/activate`);
  return response.data;
};

/** [PUT] /api/admin/users/:id/deactivate
 * Vô hiệu hóa tài khoản người dùng
 */
export const deactivateUser = async (userId: UUID): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/deactivate`);
  return response.data;
};

// NOTE: verify/unverify email không được sử dụng bởi frontend hiện tại

// =====================================================
// USER SUBSCRIPTION MANAGEMENT  
// =====================================================

// NOTE: Subscription management được xử lý ở subscriptionApi module riêng

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

/** [POST] /api/admin/users/:id/reset-quota */
export const resetUserQuota = async (userId: UUID, payload: { feature?: string } = {}): Promise<{ message: string }> => {
  const response = await apiClient.post(`/admin/users/${userId}/reset-quota`, payload);
  return response.data;
};

// NOTE: System usage stats chưa được frontend sử dụng

// =====================================================
// BADGE & ACHIEVEMENT MANAGEMENT
// =====================================================

// NOTE: Badge management được xử lý ở badges module

// =====================================================
// BULK OPERATIONS (Chưa phát triển)
// =====================================================

// NOTE: Bulk operations chưa được frontend sử dụng

// =====================================================
// ADMIN LOGS & AUDIT TRAIL (Chưa phát triển)
// =====================================================

// NOTE: Admin audit logs chưa được frontend sử dụng

// =====================================================
// NOTIFICATION MANAGEMENT (Chưa phát triển)
// =====================================================

// NOTE: Notification broadcast sẽ được xử lý ở notifications module

// NOTE: Subscription & Badge level lists có sẵn trong các module riêng

// =====================================================
// PASSWORD MANAGEMENT (Chưa phát triển)
// =====================================================

// NOTE: Password reset chưa được frontend sử dụng

// =====================================================
// ADVANCED SEARCH & FILTERING (Chưa phát triển)
// =====================================================

// NOTE: Advanced search với nhiều filter chưa được frontend sử dụng

// =====================================================
// API EXPORT - CHỈ CÁC FUNCTIONS ĐƯỢC SỬ DỤNG
// =====================================================
/**
 * Export chỉ các functions thực sự được frontend sử dụng:
 * 
 * ĐƯỢC SỬ DỤNG BỞI:
 * - UsersManagementPage.tsx: fetchAllUsers, updateUser, deleteUser, activateUser, deactivateUser
 * - UserDetailModal.tsx: fetchUserById, updateUser, fetchUserUsage, resetUserQuota
 */
export default {
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  fetchUserUsage,
  resetUserQuota
};