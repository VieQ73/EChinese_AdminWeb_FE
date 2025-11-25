import { apiClient } from '../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types cho response từ API
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardChartsData {
  dailyRevenue: ChartDataPoint[];
  dailyReports: ChartDataPoint[];
  dailyViolations: ChartDataPoint[];
  dailyNewUsers: ChartDataPoint[];
}

export interface DashboardAnalyticsData {
  monthlyRevenue: number;
  activeUsers: number;
  pendingReports: number;
  newPostsToday: number;
  pendingAppeals: number;
  unreadAdminNotifications: number;
}

export interface TopUser {
  id: string;
  name: string;
  avatar_url: string | null;
  community_points: number;
}

export interface TopTopic {
  topic: string;
  post_count: string; // API trả về string
}

export interface RecentUser {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface RecentLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  admin_name: string;
}

export interface DashboardCommunityData {
  topUsers: TopUser[];
  topTopics: TopTopic[];
  recentUsers: RecentUser[];
  recentLogs: RecentLog[];
}

// =============================
// MOCK DATA
// =============================

const generateMockChartData = (days: number = 7): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000000) + 100000, // 100k - 1.1M
    });
  }
  return data;
};

const mockChartsData: DashboardChartsData = {
  dailyRevenue: generateMockChartData(7),
  dailyReports: generateMockChartData(7).map(d => ({ ...d, value: Math.floor(Math.random() * 20) })),
  dailyViolations: generateMockChartData(7).map(d => ({ ...d, value: Math.floor(Math.random() * 15) })),
  dailyNewUsers: generateMockChartData(7).map(d => ({ ...d, value: Math.floor(Math.random() * 50) + 10 })),
};

const mockAnalyticsData: DashboardAnalyticsData = {
  monthlyRevenue: 15680000,
  activeUsers: 1234,
  pendingReports: 8,
  newPostsToday: 24,
  pendingAppeals: 3,
  unreadAdminNotifications: 5,
};

const mockCommunityData: DashboardCommunityData = {
  topUsers: [
    { id: '1', name: 'Nguyễn Văn A', avatar_url: null, community_points: 1500 },
    { id: '2', name: 'Trần Thị B', avatar_url: null, community_points: 1200 },
    { id: '3', name: 'Lê Văn C', avatar_url: null, community_points: 980 },
  ],
  topTopics: [
    { topic: 'vocabulary', post_count: '45' },
    { topic: 'grammar', post_count: '32' },
    { topic: 'listening', post_count: '28' },
  ],
  recentUsers: [
    { id: '10', name: 'Người dùng mới 1', avatar_url: null, created_at: new Date().toISOString() },
    { id: '11', name: 'Người dùng mới 2', avatar_url: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  recentLogs: [
    { id: 'log1', action_type: 'UPDATE', description: 'Cập nhật gói Premium', created_at: new Date().toISOString(), admin_name: 'Admin' },
  ],
};

// =============================
// API FUNCTIONS
// =============================

export const fetchDashboardCharts = async (): Promise<DashboardChartsData> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    return mockChartsData;
  }
  
  // Real API
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardChartsData }>('/admin/dashboard/charts');
  return res.data;
};

export const fetchDashboardAnalytics = async (): Promise<DashboardAnalyticsData> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    return mockAnalyticsData;
  }
  
  // Real API
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardAnalyticsData }>('/admin/dashboard/analytics');
  return res.data;
};

export const fetchDashboardCommunity = async (): Promise<DashboardCommunityData> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    return mockCommunityData;
  }
  
  // Real API
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardCommunityData }>('/admin/dashboard/community');
  return res.data;
};
