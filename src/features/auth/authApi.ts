import { apiClient, type ApiResponse } from '../../services/apiClient';
import type { User } from '../../types/entities';

/**
 * @fileoverview API services cho Authentication
 * Gồm các hàm: login, forgotPassword, logout, refreshToken
 */

/* -------------------- Kiểu dữ liệu -------------------- */

// Payload gửi khi login
export interface LoginPayload {
  username?: string; // có thể dùng username
  email?: string;    // hoặc email
  password: string;
}

// Response trả về khi login thành công
export interface LoginSuccessResponse {
  token: string;        // Access token
  refreshToken: string; // Refresh token
  user: Pick<
    User,
    'id' | 'username' | 'email' | 'name' | 'role' | 'avatar_url' | 'level' | 'badge_level'
  >;
}

// Response khi quên mật khẩu
export interface ForgotPasswordResponse {
  message: string;
}

// Response khi refresh token
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Response khi logout
export interface LogoutResponse {
  message: string;
}

/* -------------------- Auth APIs -------------------- */

// [POST] Đăng nhập
export const login = async (
  credentials: LoginPayload
): ApiResponse<LoginSuccessResponse> => {
  return apiClient<LoginSuccessResponse>('/auth/login', 'POST', credentials);
};

// [POST] Quên mật khẩu
export const forgotPassword = async (
  email: string
): ApiResponse<ForgotPasswordResponse> => {
  return apiClient<ForgotPasswordResponse>('/auth/forgot-password', 'POST', { email });
};

// [POST] Đăng xuất
export const logout = async (): ApiResponse<LogoutResponse> => {
  return apiClient<LogoutResponse>('/auth/logout', 'POST');
};

// [POST] Refresh token
export const refreshToken = async (
  refreshToken: string
): ApiResponse<RefreshTokenResponse> => {
  return apiClient<RefreshTokenResponse>('/auth/refresh-token', 'POST', { refreshToken });
};