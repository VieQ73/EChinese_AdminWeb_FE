import { apiClient } from '../../services/apiClient';
import type { User } from '../../types/entities';

// Cấu trúc dữ liệu gửi lên khi đăng nhập
export interface LoginPayload {
  username: string;
  password?: string;
}

// Cấu trúc dữ liệu trả về khi đăng nhập thành công
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'name' | 'role' | 'avatar_url' | 'level' | 'badge_level'>;
}

// Cấu trúc dữ liệu gửi lên khi quên mật khẩu
export interface ForgotPasswordPayload {
  email: string;
}

// Biến môi trường để bật/tắt chế độ giả lập
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * [POST] Gửi yêu cầu đăng nhập.
 * @param payload - Thông tin username và password.
 * @returns - Promise chứa token và thông tin người dùng.
 */
export const login = (payload: LoginPayload): Promise<LoginResponse> => {
  if (USE_MOCK_API) {
    console.warn('[MOCK] Đang gọi API đăng nhập...');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Giả lập logic backend: chỉ admin/super admin mới được đăng nhập
        if (payload.username === 'superadmin' && payload.password === '123456') {
          resolve({
            token: 'mock_super_admin_token_string',
            refreshToken: 'mock_super_admin_refresh_token',
            user: {
              id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              username: 'superadmin',
              name: 'Super Admin',
              email: 'super@admin.com',
              role: 'super admin',
              level: '7-9',
              badge_level: 5,
              avatar_url: 'https://i.pravatar.cc/150?u=superadmin',
            },
          });
        } else if (payload.username === 'admin' && payload.password === '123456') {
          resolve({
            token: 'mock_admin_token_string',
            refreshToken: 'mock_admin_refresh_token',
            user: {
              id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
              username: 'admin',
              name: 'Admin',
              email: 'admin@example.com',
              role: 'admin',
              level: '6',
              badge_level: 4,
              avatar_url: 'https://i.pravatar.cc/150?u=admin',
            },
          });
        } else {
          reject(new Error('Tên đăng nhập hoặc mật khẩu không đúng.'));
        }
      }, 500);
    });
  }
  // Kết nối API thật
  return apiClient.post('/auth/login', payload);
};

/**
 * [POST] Gửi yêu cầu quên mật khẩu.
 * @param payload - Email của người dùng.
 */
export const forgotPassword = (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    console.warn('[MOCK] Đang gọi API quên mật khẩu...');
    return new Promise(resolve => setTimeout(() => resolve({ message: `Hướng dẫn đã được gửi tới ${payload.email}` }), 500));
  }
  // Kết nối API thật
  return apiClient.post('/auth/forgot-password', payload);
};