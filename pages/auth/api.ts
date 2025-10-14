import { apiClient } from '../../services/apiClient';
import type { User, UserSession, UserAchievement } from '../../types';
import { mockUsers, mockUserSessions, mockUserDailyActivities, mockUserStreaks, mockAchievements, mockUserAchievements } from '../../mock';

// ====== CÁC ĐỊNH NGHĨA TYPE CHO API ======

// Cấu trúc dữ liệu gửi lên khi đăng nhập
export interface LoginPayload {
  username: string;
  password?: string;
}

// Cấu trúc dữ liệu trả về khi đăng nhập thành công
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User; // Sử dụng User type đầy đủ để nhất quán với AuthContext
}

// Cấu trúc dữ liệu gửi lên khi quên mật khẩu
export interface ForgotPasswordPayload {
  email: string;
}

// Cấu trúc dữ liệu trả về khi yêu cầu quên mật khẩu
export interface ForgotPasswordResponse {
    message: string;
}

// Biến môi trường để bật/tắt chế độ giả lập
// File .env ở gốc dự án sẽ chứa: VITE_USE_MOCK_API=false để dùng API thật.
// Mặc định sẽ là true nếu không được định nghĩa, giúp an toàn cho môi trường dev.
//  Cast import.meta to any to resolve TypeScript error regarding 'env' property,
// as the vite/client types are not available in this context.
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';


// ====== CÁC HÀM GỌI API ======

/**
 * [POST] Gửi yêu cầu đăng nhập.
 * @param payload - Thông tin username và password.
 * @returns - Promise chứa token và thông tin người dùng.
 */
export const login = (payload: LoginPayload): Promise<LoginResponse> => {
  // Chế độ giả lập
  if (USE_MOCK_API) {
    console.warn('[MOCK] Đang gọi API đăng nhập...');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.username === payload.username);
        
        // Logic giả lập: kiểm tra user, password và vai trò
        if (user && payload.password === 'password' && (user.role === 'admin' || user.role === 'super admin')) {
          // --- Bắt đầu: Logic đồng bộ hoạt động ---
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
          
          // 1. Cập nhật last_login
          const userIndex = mockUsers.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            mockUsers[userIndex].last_login = now.toISOString();
          }
          
          // 2. Tạo phiên đăng nhập mới
          const newSession: UserSession = {
            id: `s_mock_${Date.now()}`,
            user_id: user.id,
            login_at: now.toISOString(),
            logout_at: undefined,
            device: 'Web Browser (Đăng nhập)',
            ip_address: '127.0.0.1',
          };
          mockUserSessions.unshift(newSession);
          
          // 3. Cập nhật hoạt động hàng ngày
          let activity = mockUserDailyActivities.find(a => a.user_id === user.id && a.date === todayStr);
          if (activity) {
            activity.login_count += 1;
          } else {
            mockUserDailyActivities.push({
              user_id: user.id,
              date: todayStr,
              minutes_online: 0, // Sẽ được cập nhật sau khi có logic tính thời gian online
              login_count: 1,
            });
          }
          
          // --- Bắt đầu: Logic cập nhật chuỗi đăng nhập (streak) ---
          const streakIndex = mockUserStreaks.findIndex(s => s.user_id === user.id);
          if (streakIndex !== -1) {
            const userStreak = mockUserStreaks[streakIndex];
            const lastLoginDate = userStreak.last_login_date;

            if (lastLoginDate !== todayStr) { // Chỉ cập nhật nếu chưa đăng nhập hôm nay
              const yesterday = new Date();
              yesterday.setDate(now.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastLoginDate === yesterdayStr) {
                // Tiếp tục chuỗi
                userStreak.current_streak += 1;
              } else {
                // Chuỗi bị ngắt, reset
                userStreak.current_streak = 1;
              }
              // Cập nhật chuỗi dài nhất nếu cần
              userStreak.longest_streak = Math.max(userStreak.longest_streak, userStreak.current_streak);
              // Cập nhật ngày đăng nhập cuối
              userStreak.last_login_date = todayStr;
            }
          } else {
            // Tạo mới nếu chưa có
            mockUserStreaks.push({
                user_id: user.id,
                current_streak: 1,
                longest_streak: 1,
                last_login_date: todayStr,
            });
          }
          // --- Kết thúc: Logic cập nhật chuỗi đăng nhập (streak) ---
          
          // --- Bắt đầu: Logic đồng bộ thành tích ---
          const userStreak = mockUserStreaks.find(s => s.user_id === user.id);
          if (userStreak) {
              const loginStreakAchievements = mockAchievements.filter(
                  ach => ach.is_active && ach.criteria.type === 'login_streak'
              );

              for (const ach of loginStreakAchievements) {
                  const hasAchievement = mockUserAchievements.some(
                      ua => ua.user_id === user.id && ua.achievement_id === ach.id
                  );

                  if (!hasAchievement && userStreak.current_streak >= (ach.criteria as any).min_streak) {
                      // Grant achievement
                      const newUserAchievement: UserAchievement = {
                          id: `ua_mock_${Date.now()}`,
                          user_id: user.id,
                          achievement_id: ach.id,
                          achieved_at: new Date().toISOString(),
                          achievement_name: ach.name,
                          user_name: user.name,
                          user_avatar: user.avatar_url,
                      };
                      mockUserAchievements.push(newUserAchievement);
                      console.log(`[MOCK] Granted achievement "${ach.name}" to user "${user.name}"`);
                  }
              }
          }
          // --- Kết thúc: Logic đồng bộ thành tích ---

          resolve({
            token: `mock_token_for_${user.id}`,
            refreshToken: `mock_refresh_token_for_${user.id}`,
            user: user, // Trả về toàn bộ object user
          });
        } else {
          reject(new Error('Thông tin không hợp lệ. Chỉ quản trị viên mới có thể đăng nhập.'));
        }
      }, 500); // Giả lập độ trễ mạng
    });
  }
  
  // Kết nối API thật
  return apiClient.post<LoginResponse>('/auth/login', payload);
};


/**
 * [POST] Gửi yêu cầu đặt lại mật khẩu.
 * @param payload - Thông tin email.
 * @returns - Promise chứa thông báo từ server.
 */
export const forgotPassword = (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    // Chế độ giả lập
    if (USE_MOCK_API) {
        console.warn('[MOCK] Đang gọi API quên mật khẩu...');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ message: `Nếu tồn tại tài khoản với email ${payload.email}, một liên kết đặt lại mật khẩu đã được gửi.` });
            }, 500); // Giả lập độ trễ mạng
        });
    }

    // Kết nối API thật
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', payload);
};