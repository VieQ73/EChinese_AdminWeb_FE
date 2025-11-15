import { apiClient } from '../../services/apiClient';

export const fetchDashboardCharts = async (): Promise<any> => {
  const res = await apiClient.get('/admin/dashboard/charts');
  console.log(res);
  
  // backend envelope { success, message, data }
  return (res as any).data?.data || null;
};

export const fetchDashboardAnalytics = async (): Promise<any> => {
  const res = await apiClient.get('/admin/dashboard/analytics');
  console.log(res);
  return (res as any).data?.data || null;
};

export const fetchDashboardCommunity = async (): Promise<any> => {
  const res = await apiClient.get('/admin/dashboard/community');
    console.log(res);
  return (res as any).data?.data || null;
};
