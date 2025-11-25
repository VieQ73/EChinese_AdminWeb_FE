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
export const fetchTips = async (params: GetTipsParams = {}): Promise<PaginatedResponse<Tip>> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    return mockPaginatedTips(
      params.page || 1,
      params.limit || 12,
      {
        topic: params.topic,
        level: params.level,
        search: params.search,
        is_pinned: params.is_pinned
      }
    );
  }

  // Real API
  const queryParams = new URLSearchParams(params as any).toString();
  const response = await apiClient.get(`/admin/tips?${queryParams}`);
  return (response as any).data;
};

/**
 * Lấy chi tiết một tip theo ID
 */
export const fetchTipById = async (id: string): Promise<Tip> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    const tip = mockTips.find(t => t.id === id);
    if (!tip) throw new Error('Tip not found');
    return tip;
  }

  // Real API
  const response = await apiClient.get(`/admin/tips/${id}`);
  return (response as any).data;
};

/**
 * Tạo tip mới
 */
export const createTip = async (payload: TipPayload): Promise<Tip> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    const newTip: Tip = {
      id: Date.now().toString(),
      ...payload,
      is_pinned: payload.is_pinned ?? false,
      created_by: 'admin-mock'
    };
    mockTips.unshift(newTip);
    return newTip;
  }

  // Real API
  const response = await apiClient.post('/admin/tips', payload);
  return (response as any).data;
};

/**
 * Cập nhật tip
 */
export const updateTip = async (id: string, payload: Partial<TipPayload>): Promise<Tip> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex === -1) throw new Error('Tip not found');
    
    const existingTip = mockTips[tipIndex];
    const updatedTip: Tip = { ...existingTip, ...payload };
    
    mockTips[tipIndex] = updatedTip;
    return updatedTip;
  }

  // Real API
  const response = await apiClient.put(`/admin/tips/${id}`, payload);
  return (response as any).data;
};

/**
 * Xóa tip
 */
export const deleteTip = async (id: string): Promise<void> => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    const tipIndex = mockTips.findIndex(t => t.id === id);
    if (tipIndex !== -1) {
      mockTips.splice(tipIndex, 1);
    }
    return;
  }

  // Real API
  await apiClient.delete(`/admin/tips/${id}`);
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
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    const created_tips: Tip[] = tips.map((tipPayload, index) => ({
      id: (Date.now() + index).toString(),
      ...tipPayload,
      is_pinned: tipPayload.is_pinned ?? false,
      created_by: 'admin-mock'
    }));
    
    mockTips.unshift(...created_tips);
    
    return {
      success_count: tips.length,
      error_count: 0,
      errors: [],
      created_tips
    };
  }

  // Real API
  const response = await apiClient.post('/admin/tips/bulk-upload', { tips });
  return (response as any).data;
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

