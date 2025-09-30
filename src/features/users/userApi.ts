import type { PaginatedResponse } from '../../mocks/wrapper';
import { apiClient, type PaginatedApiResponse } from '../../services/apiClient';
import type { User } from '../../types/entities';

// Định nghĩa tham số cho API GET List
interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'user' | 'admin' | 'super admin';
  search?: string; // tìm kiếm theo username/email/name
  is_active?: boolean;
}

/**
 * [GET] Lấy danh sách người dùng (Admin View)
 * Endpoint Backend dự kiến: GET /api/admin/users
 * Sử dụng apiClient để tự động chuyển sang Mock Data nếu cần
 */
export const fetchAllUsers = (params: GetUsersParams = {}): PaginatedApiResponse<User> => {
  // Xây dựng chuỗi query string từ params
  const query = new URLSearchParams({
    ...(params.page && { page: params.page.toString() }),
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.role && { role: params.role }),
    ...(params.search && { search: params.search }),
    ...(params.is_active !== undefined && { is_active: params.is_active.toString() }),
  }).toString();
  const endpoint = `/users?${query}`;

  // Sử dụng PaginatedResponse<User> thay vì PaginatedApiResponse<User>
  return apiClient<PaginatedResponse<User>>(endpoint, 'GET');
};

/**
 * [GET] Lấy chi tiết một người dùng
 * Endpoint Backend dự kiến: GET /api/admin/users/:id
 */
export const fetchUserById = (userId: string): Promise<User> => {
  return apiClient<User>(`/users/${userId}`, 'GET');
};

/**
 * [POST] Tạo người dùng mới
 * Endpoint Backend dự kiến: POST /api/admin/users
 */
export const createUser = (data: Partial<User>): Promise<User> => {
  return apiClient<User>('/users', 'POST', data);
};

/**
 * [PUT] Cập nhật thông tin người dùng
 * Endpoint Backend dự kiến: PUT /api/admin/users/:id
 */
export const updateUser = (userId: string, data: Partial<User>): Promise<User> => {
  return apiClient<User>(`/users/${userId}`, 'PUT', data);
};

/**
 * [DELETE] Xóa người dùng (xóa cứng)
 * Endpoint Backend dự kiến: DELETE /api/admin/users/:id
 */
export const deleteUser = (userId: string): Promise<{ message: string }> => {
  return apiClient<{ message: string }>(`/users/${userId}`, 'DELETE');
};

/**
 * [PUT] Deactivate người dùng (cập nhật is_active = false)
 * Endpoint Backend dự kiến: PUT /api/admin/users/:id/deactivate
 */
export const deactivateUser = (userId: string): Promise<User> => {
  return apiClient<User>(`/users/${userId}/deactivate`, 'PUT', { is_active: false });
};

/**
 * [PUT] Activate người dùng (cập nhật is_active = true)
 * Endpoint Backend dự kiến: PUT /api/admin/users/:id/activate
 */
export const activateUser = (userId: string): Promise<User> => {
  return apiClient<User>(`/users/${userId}/activate`, 'PUT', { is_active: true });
};