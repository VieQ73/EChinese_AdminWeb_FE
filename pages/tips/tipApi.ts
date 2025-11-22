import { apiClient } from '../../services/apiClient';
import type { Tip } from '../../types';
import type { PaginatedResponse } from '../../types';

// ========================
// TIPS API - Quản lý mẹo học tập
// ========================

/**
 * Tham số để lấy danh sách tips
 */
export interface GetTipsParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo content
  topic?: string;
  level?: string;
  is_pinned?: boolean;
}

/**
 * Payload để tạo/cập nhật tip
 */
export interface TipPayload {
  topic: string;
  level: 'Sơ cấp' | 'Trung cấp' | 'Cao cấp';
  content: any; // Rich text JSON (giống content của Post)
  answer?: string;
  is_pinned?: boolean;
}

/**
 * Lấy danh sách tips với filter và pagination
 */
export const fetchTips = async (params: GetTipsParams = {}): Promise<PaginatedResponse<Tip>> => {
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
  if (params.topic && params.topic !== 'Tất cả') {
    queryParams.append('topic', params.topic);
  }
  if (params.level && params.level !== 'Tất cả') {
    queryParams.append('level', params.level);
  }
  if (params.is_pinned !== undefined) {
    queryParams.append('is_pinned', params.is_pinned.toString());
  }
  
  // Gọi API với query string
  const queryString = queryParams.toString();
  const url = queryString ? `/admin/tips?${queryString}` : '/admin/tips';
  
  const response = await apiClient.get(url);
  console.log('📥 Fetched tips:', response);
  
  return (response as any).data; // API trả về { success, message, data: { data: Tip[], meta: { total, page, limit } } }
};

/**
 * Lấy chi tiết một tip theo ID
 */
export const fetchTipById = async (id: string): Promise<Tip> => {
  const response = await apiClient.get(`/admin/tips/${id}`);
  return (response as any).data; // API trả về { success, message, data: Tip }
};

/**
 * Tạo tip mới
 */
export const createTip = async (payload: TipPayload): Promise<Tip> => {
  const response = await apiClient.post('/admin/tips', payload);
  return (response as any).data; // API trả về { success, message, data: Tip }
};

/**
 * Cập nhật tip
 */
export const updateTip = async (id: string, payload: Partial<TipPayload>): Promise<Tip> => {
  const response = await apiClient.put(`/admin/tips/${id}`, payload);
  return (response as any).data; // API trả về { success, message, data: Tip }
};

/**
 * Xóa tip
 */
export const deleteTip = (id: string): Promise<void> => {
  return apiClient.delete(`/admin/tips/${id}`); // API trả về { success, message }
};

/**
 * Ghim/bỏ ghim tip (bằng cách gọi hàm update)
 */
export const togglePinTip = (id: string, is_pinned: boolean): Promise<Tip> => {
    return updateTip(id, { is_pinned });
};

/**
 * Tải lên tips hàng loạt
 */
export const bulkUploadTips = async (tips: TipPayload[]): Promise<{
  success_count: number;
  error_count: number;
  errors: string[];
  created_tips: Tip[];
}> => {
  const response = await apiClient.post('/admin/tips/bulk-upload', { tips });
  return (response as any).data; // API trả về { success, message, data: { success_count, ... } }
};

// ========================
// CONSTANTS - Dữ liệu cho dropdown, filter
// ========================

export const TIP_TOPICS = [
  'Tất cả',
  'Văn hóa', 
  'Ngữ pháp', 
  'Từ vựng', 
  'Phát âm', 
  'Khẩu ngữ', 
  'Kỹ năng nghe', 
  'Kỹ năng đọc', 
  'Kỹ năng viết',
  'Câu đố', 
  'HSK',
  'Câu nói hay',
  'Giao tiếp',
  'HSKK',
  'Ngôn ngữ mạng',
  'Du học',
  'Hướng dẫn sử dụng',
  'Truyện cười'
] as const;

export const TIP_LEVELS = [
  'Tất cả',
  'Sơ cấp', 
  'Trung cấp', 
  'Cao cấp'
] as const;

export const LEVEL_COLORS: { [key: string]: 'Sơ cấp' | 'Trung cấp' | 'Cao cấp' | string } = {
  'Sơ cấp': 'bg-green-100 text-green-800',
  'Trung cấp': 'bg-yellow-100 text-yellow-800', 
  'Cao cấp': 'bg-red-100 text-red-800',
};

