import { apiClient } from '../../services/apiClient';

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

export const fetchDashboardCharts = async (): Promise<DashboardChartsData> => {
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardChartsData }>('/admin/dashboard/charts');
  return res.data;
};

export const fetchDashboardAnalytics = async (): Promise<DashboardAnalyticsData> => {
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardAnalyticsData }>('/admin/dashboard/analytics');
  return res.data;
};

export const fetchDashboardCommunity = async (): Promise<DashboardCommunityData> => {
  const res = await apiClient.get<{ success: boolean; message: string; data: DashboardCommunityData }>('/admin/dashboard/community');
  return res.data;
};
