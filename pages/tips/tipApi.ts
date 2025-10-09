import { apiClient } from '../../services/apiClient';
import type { Tip } from '../../types';
import type { PaginatedResponse } from '../../types';
import { mockPaginatedTips, mockTips } from '../../mock/tips';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

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
export const fetchTips = (params: GetTipsParams = {}): Promise<PaginatedResponse<Tip>> => {
  if (USE_MOCK_API) {
    // Sử dụng mock data để test
    return Promise.resolve(mockPaginatedTips(
      params.page || 1,
      params.limit || 12,
      {
        topic: params.topic,
        level: params.level,
        search: params.search,
        is_pinned: params.is_pinned
      }
    ));
  }
  // Kết nối API thật
  const queryParams = new URLSearchParams(params as any).toString();
  return apiClient.get(`/tips?${queryParams}`);
};

/**
 * Lấy chi tiết một tip theo ID
 */
export const fetchTipById = (id: string): Promise<Tip> => {
  if (USE_MOCK_API) {
    const tip = mockTips.find(t => t.id === id);
    return tip ? Promise.resolve(tip) : Promise.reject(new Error('Tip not found'));
  }
  // Kết nối API thật
  return apiClient.get(`/tips/${id}`);
};

/**
 * Tạo tip mới
 */
export const createTip = (payload: TipPayload): Promise<Tip> => {
  if (USE_MOCK_API) {
    const newTip: Tip = {
      id: Date.now().toString(),
      ...payload,
      is_pinned: payload.is_pinned ?? false,
      created_by: 'admin-mock'
    };
    mockTips.unshift(newTip);
    return new Promise(resolve => setTimeout(() => resolve(newTip), 500));
  }
  // Kết nối API thật
  return apiClient.post('/tips', payload);
};

/**
 * Cập nhật tip
 */
export const updateTip = (id: string, payload: Partial<TipPayload>): Promise<Tip> => {
  if (USE_MOCK_API) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex === -1) return Promise.reject(new Error('Tip not found'));
    
    const existingTip = mockTips[tipIndex];
    const updatedTip: Tip = { ...existingTip, ...payload };
    
    mockTips[tipIndex] = updatedTip;
    return new Promise(resolve => setTimeout(() => resolve(updatedTip), 500));
  }
  // Kết nối API thật
  return apiClient.put(`/tips/${id}`, payload);
};

/**
 * Xóa tip
 */
export const deleteTip = (id: string): Promise<{ success: boolean }> => {
  if (USE_MOCK_API) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex !== -1) {
      mockTips.splice(tipIndex, 1);
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }
  // Kết nối API thật
  return apiClient.delete(`/tips/${id}`);
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
export const bulkUploadTips = (tips: TipPayload[]): Promise<{
  success_count: number;
  error_count: number;
  errors: string[];
  created_tips: Tip[];
}> => {
  if (USE_MOCK_API) {
    return new Promise(resolve => {
      setTimeout(() => {
        const created_tips: Tip[] = tips.map((tipPayload, index) => ({
          id: (Date.now() + index).toString(),
          ...tipPayload,
          is_pinned: tipPayload.is_pinned ?? false,
          created_by: 'admin-mock'
        }));
        
        mockTips.unshift(...created_tips);
        
        resolve({
          success_count: tips.length,
          error_count: 0,
          errors: [],
          created_tips
        });
      }, 1500);
    });
  }
  // Kết nối API thật
  return apiClient.post('/tips/bulk-upload', { tips });
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
