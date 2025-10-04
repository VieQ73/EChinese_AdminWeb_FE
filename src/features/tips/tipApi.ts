import { apiClient } from '../../services/apiClient';
import type { Tip } from '../../types/entities';
import type { PaginatedResponse } from '../../types/api';
import { mockPaginatedTips, mockTips } from '../../mock/tips';

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
  level: string;
  content: any; // Rich text JSON (giống content của Post)
  answer?: string;
  is_pinned?: boolean;
}

/**
 * Lấy danh sách tips với filter và pagination
 */
export const fetchTips = (params: GetTipsParams = {}): Promise<PaginatedResponse<Tip>> => {
  // Sử dụng mock data để test (comment dòng này khi có API thật)
  if (import.meta.env.DEV) {
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
  
  return apiClient.get('/admin/tips', { params });
};

/**
 * Lấy chi tiết một tip theo ID
 */
export const fetchTipById = (id: string): Promise<Tip> => {
  if (import.meta.env.DEV) {
    const tip = mockTips.find(t => t.id === id);
    return tip ? Promise.resolve(tip) : Promise.reject(new Error('Tip not found'));
  }
  
  return apiClient.get(`/admin/tips/${id}`);
};

/**
 * Tạo tip mới
 */
export const createTip = (payload: TipPayload): Promise<Tip> => {
  if (import.meta.env.DEV) {
    const newTip: Tip = {
      id: Date.now().toString(),
      ...payload,
      created_by: 'admin-mock'
    };
    
    // Thêm vào mock data (sẽ reset sau khi reload)
    mockTips.unshift(newTip);
    
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve(newTip), 500));
  }
  
  return apiClient.post('/admin/tips', payload);
};

/**
 * Cập nhật tip
 */
export const updateTip = (id: string, payload: Partial<TipPayload>): Promise<Tip> => {
  if (import.meta.env.DEV) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex === -1) return Promise.reject(new Error('Tip not found'));
    
    const existingTip = mockTips[tipIndex];
    const updatedTip: Tip = { ...existingTip, ...payload };
    
    // Cập nhật trong mock data (sẽ reset sau khi reload)
    mockTips[tipIndex] = updatedTip;
    
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve(updatedTip), 500));
  }
  
  return apiClient.put(`/admin/tips/${id}`, payload);
};

/**
 * Xóa tip (soft delete)
 */
export const deleteTip = (id: string): Promise<{ success: boolean }> => {
  if (import.meta.env.DEV) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex !== -1) {
      // Xóa khỏi mock data (sẽ reset sau khi reload)
      mockTips.splice(tipIndex, 1);
    }
    
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }
  
  return apiClient.delete(`/admin/tips/${id}`);
};

/**
 * Ghim/bỏ ghim tip
 */
export const togglePinTip = (id: string, is_pinned: boolean): Promise<Tip> => {
  if (import.meta.env.DEV) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex === -1) return Promise.reject(new Error('Tip not found'));
    
    const existingTip = mockTips[tipIndex];
    const updatedTip: Tip = { ...existingTip, is_pinned };
    
    // Cập nhật trong mock data (sẽ reset sau khi reload)
    mockTips[tipIndex] = updatedTip;
    
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve(updatedTip), 500));
  }
  
  return apiClient.post(`/admin/tips/${id}/pin`, { is_pinned });
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
  if (import.meta.env.DEV) {
    // Simulate batch upload process
    return new Promise(resolve => {
      setTimeout(() => {
        const created_tips: Tip[] = tips.map((tipPayload, index) => ({
          id: (Date.now() + index).toString(),
          ...tipPayload,
          created_by: 'admin-mock'
        }));
        
        // Thêm tất cả tips mới vào đầu mockTips (sẽ reset sau khi reload)
        mockTips.unshift(...created_tips);
        
        resolve({
          success_count: tips.length,
          error_count: 0,
          errors: [],
          created_tips
        });
      }, 1500); // Simulate longer upload time
    });
  }
  
  return apiClient.post('/admin/tips/bulk-upload', { tips });
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

export const LEVEL_COLORS: { [key: string]: string } = {
  'Sơ cấp': 'bg-green-500 text-white shadow-green-700',
  'Trung cấp': 'bg-yellow-500 text-gray-800 shadow-yellow-700', 
  'Cao cấp': 'bg-red-500 text-white shadow-red-700',
};

export default {
  fetchTips,
  fetchTipById,
  createTip,
  updateTip,
  deleteTip,
  togglePinTip,
  bulkUploadTips,
};
