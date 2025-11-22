import { apiClient } from '../../services/apiClient';
import type { AdminLog } from '../../types/system';
import type { PaginatedResponse } from '../../types';

/**
 * Tham số để lấy danh sách admin logs
 */
export interface GetAdminLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  admin_id?: string;
  action_type?: string;
  start_date?: string; // ISO date string
  end_date?: string;   // ISO date string
}

/**
 * Lấy danh sách admin logs với filter và pagination
 */
export async function fetchAdminLogs(params: GetAdminLogsParams = {}): Promise<PaginatedResponse<AdminLog>> {
  // Xây dựng query params, chỉ thêm các param có giá trị
  const queryParams = new URLSearchParams();
  
  // Pagination params
  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  // Filter params - chỉ thêm khi có giá trị
  if (params.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  if (params.admin_id && params.admin_id !== 'all') {
    queryParams.append('admin_id', params.admin_id);
  }
  if (params.action_type && params.action_type !== 'all') {
    queryParams.append('action_type', params.action_type);
  }
  if (params.start_date) {
    queryParams.append('start_date', params.start_date);
  }
  if (params.end_date) {
    queryParams.append('end_date', params.end_date);
  }
  
  // Gọi API với query string
  const queryString = queryParams.toString();
  const url = queryString ? `/admin/logs?${queryString}` : '/admin/logs';
  
  const response = await apiClient.get(url);
  console.log('📥 Fetched admin logs:', response);
  
  return (response as any).data; // API trả về { success, message, data: { data: AdminLog[], meta: { total, page, limit } } }
}
