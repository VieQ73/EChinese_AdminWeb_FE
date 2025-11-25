import { apiClient } from '../../services/apiClient';
import type { AdminLog } from '../../types/system';
import { mockAdminLogs } from '../../mock/system';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    return mockAdminLogs;
  }
  
  // Real API - BE trả về envelope { success, data }
  const res = await apiClient.get<{ success: boolean; data: AdminLog[] | { data: AdminLog[] } }>('/admin/logs');
  
  // Xử lý cả 2 dạng response: { success, data: AdminLog[] } hoặc { success, data: { data: AdminLog[] } }
  if (res && res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  }
  return [];
}
