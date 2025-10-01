import { apiClient } from '../../services/apiClient';

/**
 * @fileoverview API functions for the Dashboard feature.
 * @description Contains functions to fetch analytical data for the main dashboard.
 */

// Cấu trúc dữ liệu thống kê cho dashboard
export interface DashboardAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  pendingReports: number;
  activeSubscriptions: number;
}

// Biến môi trường để bật/tắt chế độ giả lập
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * [GET] Lấy dữ liệu thống kê cho trang dashboard.
 * Endpoint thật: GET /analytics
 */
export const fetchDashboardAnalytics = (): Promise<DashboardAnalytics> => {
  if (USE_MOCK_API) {
    console.warn('[MOCK] Đang gọi API lấy dữ liệu dashboard...');
    return new Promise(resolve => setTimeout(() => resolve({
      totalUsers: 1250, activeUsers: 980, newUsersToday: 15, pendingReports: 3, activeSubscriptions: 250,
    }), 800)); // Giả lập độ trễ mạng
  }
  return apiClient.get('/analytics');
};