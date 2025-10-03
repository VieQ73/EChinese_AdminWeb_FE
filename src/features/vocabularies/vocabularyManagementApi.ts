/**
 * NOTEBOOKS & VOCABULARY MANAGEMENT API - BACKEND CONNECTION
 * 
 * File này chứa tất cả các API endpoints cần thiết để kết nối với backend thật
 * cho phần quản lý "Sổ tay và từ vựng" trong admin panel.
 * 
 * Dựa trên:
 * - Database schema: Notebooks, Vocabulary, NotebookVocabItems, WordType, VocabularyWordType
 * - Types trong src/types/entities.ts
 * - Logic hiện tại trong notebookApi.ts và vocabApi.ts (mock)
 * - Components: NotebookCard, VocabularyCard, AddVocabularyModal, VocabularyDetailModal
 */

import { apiClient } from '../../services/apiClient';
import type { 
  Notebook, 
  Vocabulary, 
  NotebookVocabItem,
  WordType,
  UUID,
  Timestamp
} from '../../types/entities';
import type { PaginatedResponse } from '../../types/api';

// =====================================================
// INTERFACES & TYPES
// =====================================================

/**
 * Tham số để lấy danh sách notebooks
 */
export interface GetNotebooksParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo tên notebook
  is_premium?: boolean | null;
  user_id?: UUID | null; // null cho system notebooks
  sort_by?: 'name' | 'created_at' | 'vocab_count';
  sort_order?: 'asc' | 'desc';
}

/**
 * Tham số để lấy danh sách vocabularies
 */
export interface GetVocabulariesParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo hanzi, pinyin, meaning
  level?: string | string[]; // HSK1, HSK2, etc.
  word_types?: string | string[]; // Danh từ, Động từ, etc.
  include_deleted?: boolean;
  notebook_id?: UUID; // Filter by notebook
  created_from?: string; // ISO date
  created_to?: string; // ISO date
}

/**
 * Payload để tạo notebook mới
 */
export interface CreateNotebookPayload {
  name: string;
  is_premium?: boolean;
  user_id?: UUID | null; // null cho system notebook
  options?: {
    show_hanzi?: boolean;
    show_pinyin?: boolean;
    show_meaning?: boolean;
    sort_by?: string;
  };
}

/**
 * Payload để tạo vocabulary mới
 */
export interface CreateVocabularyPayload {
  hanzi: string;
  pinyin: string;
  meaning: string;
  notes?: string;
  level: string[]; // ['HSK1', 'HSK2']
  word_types: string[]; // ['Danh từ', 'Động từ']
  image_url?: string;
}

/**
 * Payload để cập nhật vocabulary
 */
export interface UpdateVocabularyPayload {
  hanzi?: string;
  pinyin?: string;
  meaning?: string;
  notes?: string;
  level?: string[];
  word_types?: string[];
  image_url?: string;
}

/**
 * Response cho notebook với thông tin chi tiết
 */
export interface NotebookDetailResponse extends Notebook {
  items: NotebookVocabItem[];
  total_items: number;
  items_by_status: {
    'đã thuộc': number;
    'chưa thuộc': number;
    'yêu thích': number;
    'không chắc': number;
  };
}

/**
 * Payload để thêm/xóa vocab từ notebook
 */
export interface ManageNotebookItemsPayload {
  vocab_ids: UUID[];
  status?: 'đã thuộc' | 'chưa thuộc' | 'yêu thích' | 'không chắc';
}

/**
 * Payload để import vocabularies
 */
export interface ImportVocabulariesPayload {
  vocabularies: CreateVocabularyPayload[];
  notebook_id?: UUID;
  overwrite_duplicates?: boolean;
}

/**
 * Response cho import operation
 */
export interface ImportVocabulariesResponse {
  success_count: number;
  duplicate_count: number;
  error_count: number;
  created_vocabularies: Vocabulary[];
  duplicate_vocabularies: Array<{
    hanzi: string;
    pinyin: string;
    existing_id: UUID;
  }>;
  errors: Array<{
    vocabulary: CreateVocabularyPayload;
    error: string;
  }>;
}

/**
 * Statistics response cho notebooks & vocabularies
 */
export interface VocabStatsResponse {
  total_notebooks: number;
  system_notebooks: number;
  premium_notebooks: number;
  total_vocabularies: number;
  deleted_vocabularies: number;
  vocabularies_by_level: Record<string, number>;
  vocabularies_by_word_type: Record<string, number>;
  most_used_vocabularies: Array<{
    vocabulary: Vocabulary;
    usage_count: number;
  }>;
}

// =====================================================
// NOTEBOOK MANAGEMENT
// =====================================================

/**
 * [GET] /api/admin/notebooks
 * Lấy danh sách notebooks với phân trang và bộ lọc
 */
export const fetchNotebooks = async (params: GetNotebooksParams = {}): Promise<PaginatedResponse<Notebook>> => {
  const response = await apiClient.get('/admin/notebooks', { params });
  return response.data;
};

/**
 * [GET] /api/admin/notebooks/stats
 * Lấy thống kê tổng quan về notebooks và vocabularies
 */
export const fetchVocabStats = async (): Promise<VocabStatsResponse> => {
  const response = await apiClient.get('/admin/notebooks/stats');
  return response.data;
};

/**
 * [GET] /api/admin/notebooks/:id
 * Lấy chi tiết notebook với danh sách vocabularies
 */
export const fetchNotebookDetail = async (notebookId: UUID): Promise<NotebookDetailResponse> => {
  const response = await apiClient.get(`/admin/notebooks/${notebookId}`);
  return response.data;
};

/**
 * [POST] /api/admin/notebooks
 * Tạo notebook mới (admin/super admin)
 */
export const createNotebook = async (payload: CreateNotebookPayload): Promise<Notebook> => {
  const response = await apiClient.post('/admin/notebooks', payload);
  return response.data;
};

/**
 * [PUT] /api/admin/notebooks/:id
 * Cập nhật thông tin notebook
 */
export const updateNotebook = async (
  notebookId: UUID, 
  payload: Partial<CreateNotebookPayload>
): Promise<Notebook> => {
  const response = await apiClient.put(`/admin/notebooks/${notebookId}`, payload);
  return response.data;
};

/**
 * [DELETE] /api/admin/notebooks/:id
 * Xóa notebook (sẽ xóa luôn tất cả NotebookVocabItems)
 */
export const deleteNotebook = async (notebookId: UUID): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/notebooks/${notebookId}`);
  return response.data;
};

/**
 * [POST] /api/admin/notebooks/bulk-delete
 * Xóa nhiều notebooks cùng lúc
 */
export const bulkDeleteNotebooks = async (notebookIds: UUID[]): Promise<{
  success_count: number;
  failed_count: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/notebooks/bulk-delete', {
    notebook_ids: notebookIds
  });
  return response.data;
};

/**
 * [POST] /api/admin/notebooks/publish
 * Publish notebooks để đồng bộ lên mobile app
 */
export const publishNotebooks = async (notebookIds: UUID[]): Promise<{ 
  message: string; 
  published_count: number;
}> => {
  const response = await apiClient.post('/admin/notebooks/publish', {
    notebook_ids: notebookIds
  });
  return response.data;
};

// =====================================================
// NOTEBOOK ITEMS MANAGEMENT
// =====================================================

/**
 * [POST] /api/admin/notebooks/:id/items
 * Thêm vocabularies vào notebook
 */
export const addItemsToNotebook = async (
  notebookId: UUID, 
  payload: ManageNotebookItemsPayload
): Promise<{ message: string; added_count: number }> => {
  const response = await apiClient.post(`/admin/notebooks/${notebookId}/items`, payload);
  return response.data;
};

/**
 * [DELETE] /api/admin/notebooks/:id/items
 * Xóa vocabularies khỏi notebook
 */
export const removeItemsFromNotebook = async (
  notebookId: UUID, 
  payload: { vocab_ids: UUID[] }
): Promise<{ message: string; removed_count: number }> => {
  const response = await apiClient.delete(`/admin/notebooks/${notebookId}/items`, {
    data: payload
  });
  return response.data;
};

/**
 * [PUT] /api/admin/notebooks/:id/items/:vocabId/status
 * Cập nhật trạng thái của một vocabulary trong notebook
 */
export const updateNotebookItemStatus = async (
  notebookId: UUID,
  vocabId: UUID,
  status: 'đã thuộc' | 'chưa thuộc' | 'yêu thích' | 'không chắc'
): Promise<NotebookVocabItem> => {
  const response = await apiClient.put(
    `/admin/notebooks/${notebookId}/items/${vocabId}/status`,
    { status }
  );
  return response.data;
};

/**
 * [POST] /api/admin/notebooks/:id/items/bulk-status
 * Cập nhật trạng thái của nhiều vocabularies trong notebook
 */
export const bulkUpdateNotebookItemStatus = async (
  notebookId: UUID,
  payload: {
    vocab_ids: UUID[];
    status: 'đã thuộc' | 'chưa thuộc' | 'yêu thích' | 'không chắc';
  }
): Promise<{ message: string; updated_count: number }> => {
  const response = await apiClient.post(`/admin/notebooks/${notebookId}/items/bulk-status`, payload);
  return response.data;
};

// =====================================================
// VOCABULARY MANAGEMENT  
// =====================================================

/**
 * [GET] /api/admin/vocabularies
 * Lấy danh sách vocabularies với phân trang và bộ lọc
 */
export const fetchVocabularies = async (params: GetVocabulariesParams = {}): Promise<PaginatedResponse<Vocabulary>> => {
  const response = await apiClient.get('/admin/vocabularies', { params });
  return response.data;
};

/**
 * [GET] /api/admin/vocabularies/:id
 * Lấy chi tiết một vocabulary
 */
export const fetchVocabularyDetail = async (vocabId: UUID): Promise<Vocabulary> => {
  const response = await apiClient.get(`/admin/vocabularies/${vocabId}`);
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies
 * Tạo vocabulary mới
 */
export const createVocabulary = async (payload: CreateVocabularyPayload): Promise<Vocabulary> => {
  const response = await apiClient.post('/admin/vocabularies', payload);
  return response.data;
};

/**
 * [PUT] /api/admin/vocabularies/:id
 * Cập nhật vocabulary
 */
export const updateVocabulary = async (
  vocabId: UUID, 
  payload: UpdateVocabularyPayload
): Promise<Vocabulary> => {
  const response = await apiClient.put(`/admin/vocabularies/${vocabId}`, payload);
  return response.data;
};

/**
 * [DELETE] /api/admin/vocabularies/:id
 * Soft delete vocabulary
 */
export const softDeleteVocabulary = async (
  vocabId: UUID,
  reason?: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/vocabularies/${vocabId}`, {
    data: { reason }
  });
  return response.data;
};

/**
 * [DELETE] /api/admin/vocabularies/:id/hard
 * Hard delete vocabulary (chỉ super admin)
 */
export const hardDeleteVocabulary = async (vocabId: UUID): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/vocabularies/${vocabId}/hard`);
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/:id/restore
 * Khôi phục vocabulary đã bị soft delete
 */
export const restoreVocabulary = async (vocabId: UUID): Promise<Vocabulary> => {
  const response = await apiClient.post(`/admin/vocabularies/${vocabId}/restore`);
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/bulk-create
 * Tạo nhiều vocabularies cùng lúc
 */
export const bulkCreateVocabularies = async (
  vocabularies: CreateVocabularyPayload[]
): Promise<{
  success_count: number;
  failed_count: number;
  created_vocabularies: Vocabulary[];
  errors: Array<{
    vocabulary: CreateVocabularyPayload;
    error: string;
  }>;
}> => {
  const response = await apiClient.post('/admin/vocabularies/bulk-create', {
    vocabularies
  });
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/bulk-delete
 * Soft delete nhiều vocabularies
 */
export const bulkSoftDeleteVocabularies = async (
  vocabIds: UUID[],
  reason?: string
): Promise<{
  success_count: number;
  failed_count: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/vocabularies/bulk-delete', {
    vocab_ids: vocabIds,
    reason
  });
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/bulk-restore
 * Khôi phục nhiều vocabularies đã bị soft delete
 */
export const bulkRestoreVocabularies = async (vocabIds: UUID[]): Promise<{
  success_count: number;
  failed_count: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/vocabularies/bulk-restore', {
    vocab_ids: vocabIds
  });
  return response.data;
};

// =====================================================
// IMPORT & EXPORT
// =====================================================

/**
 * [POST] /api/admin/vocabularies/import
 * Import vocabularies từ file Excel/CSV
 */
export const importVocabularies = async (
  payload: ImportVocabulariesPayload
): Promise<ImportVocabulariesResponse> => {
  const response = await apiClient.post('/admin/vocabularies/import', payload);
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/export
 * Export vocabularies ra file Excel/CSV
 */
export const exportVocabularies = async (
  params: GetVocabulariesParams & { 
    format?: 'excel' | 'csv';
    include_notebook_info?: boolean;
  }
): Promise<Blob> => {
  const response = await apiClient.post('/admin/vocabularies/export', params, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * [POST] /api/admin/notebooks/:id/export  
 * Export một notebook cụ thể ra file
 */
export const exportNotebook = async (
  notebookId: UUID,
  options?: {
    format?: 'excel' | 'csv';
    include_status?: boolean;
  }
): Promise<Blob> => {
  const response = await apiClient.post(`/admin/notebooks/${notebookId}/export`, options || {}, {
    responseType: 'blob'
  });
  return response.data;
};

// =====================================================
// WORD TYPES MANAGEMENT
// =====================================================

/**
 * [GET] /api/admin/word-types
 * Lấy danh sách tất cả word types
 */
export const fetchAllWordTypes = async (): Promise<WordType[]> => {
  const response = await apiClient.get('/admin/word-types');
  return response.data;
};

/**
 * [POST] /api/admin/word-types
 * Thêm word type mới (nếu cần tùy chỉnh)
 */
export const createWordType = async (code: string): Promise<WordType> => {
  const response = await apiClient.post('/admin/word-types', { code });
  return response.data;
};

/**
 * [DELETE] /api/admin/word-types/:code
 * Xóa word type (chỉ nếu không được sử dụng)
 */
export const deleteWordType = async (code: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/word-types/${code}`);
  return response.data;
};

// =====================================================
// PRONUNCIATION & MEDIA
// =====================================================

/**
 * [POST] /api/admin/vocabularies/:id/generate-audio
 * Tạo file audio phát âm cho vocabulary
 */
export const generateVocabularyAudio = async (vocabId: UUID): Promise<{
  audio_url: string;
  message: string;
}> => {
  const response = await apiClient.post(`/admin/vocabularies/${vocabId}/generate-audio`);
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/:id/upload-image
 * Upload hình ảnh cho vocabulary
 */
export const uploadVocabularyImage = async (
  vocabId: UUID, 
  imageFile: File
): Promise<{
  image_url: string;
  message: string;
}> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await apiClient.post(`/admin/vocabularies/${vocabId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// =====================================================
// SEARCH & ANALYTICS
// =====================================================

/**
 * [GET] /api/admin/vocabularies/search
 * Tìm kiếm vocabulary nâng cao
 */
export const advancedVocabularySearch = async (params: {
  query?: string; // Full-text search
  filters?: {
    levels?: string[];
    word_types?: string[];
    has_image?: boolean;
    has_notes?: boolean;
    created_date_range?: {
      start: string;
      end: string;
    };
    is_deleted?: boolean;
  };
  sort?: {
    field: 'hanzi' | 'pinyin' | 'created_at' | 'usage_count';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Vocabulary & { usage_count?: number }>> => {
  const response = await apiClient.get('/admin/vocabularies/search', { params });
  return response.data;
};

/**
 * [GET] /api/admin/vocabularies/duplicates
 * Tìm vocabularies trùng lặp (hanzi + pinyin giống nhau)
 */
export const findDuplicateVocabularies = async (): Promise<Array<{
  hanzi: string;
  pinyin: string;
  vocabularies: Vocabulary[];
}>> => {
  const response = await apiClient.get('/admin/vocabularies/duplicates');
  return response.data;
};

/**
 * [POST] /api/admin/vocabularies/merge-duplicates
 * Gộp các vocabularies trùng lặp
 */
export const mergeDuplicateVocabularies = async (payload: {
  keep_vocab_id: UUID;
  remove_vocab_ids: UUID[];
}): Promise<{
  merged_vocabulary: Vocabulary;
  removed_count: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/vocabularies/merge-duplicates', payload);
  return response.data;
};

// =====================================================
// ADMIN ACTIONS & AUDIT
// =====================================================

/**
 * [GET] /api/admin/notebooks/audit-logs
 * Lấy lịch sử thao tác trên notebooks
 */
export const fetchNotebookAuditLogs = async (params?: {
  notebook_id?: UUID;
  action_type?: string;
  admin_id?: UUID;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<{
  id: UUID;
  notebook_id: UUID;
  admin_id: UUID;
  action_type: string;
  description: string;
  created_at: Timestamp;
  admin_name?: string;
  notebook_name?: string;
}>> => {
  const response = await apiClient.get('/admin/notebooks/audit-logs', { params });
  return response.data;
};

/**
 * [GET] /api/admin/vocabularies/audit-logs
 * Lấy lịch sử thao tác trên vocabularies
 */
export const fetchVocabularyAuditLogs = async (params?: {
  vocab_id?: UUID;
  action_type?: string;
  admin_id?: UUID;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<{
  id: UUID;
  vocab_id: UUID;
  admin_id: UUID;
  action_type: string;
  description: string;
  created_at: Timestamp;
  admin_name?: string;
  vocab_hanzi?: string;
}>> => {
  const response = await apiClient.get('/admin/vocabularies/audit-logs', { params });
  return response.data;
};

// =====================================================
// SYSTEM UTILITIES
// =====================================================

/**
 * [POST] /api/admin/vocabularies/recount-usage
 * Tính lại số lượng sử dụng của vocabularies trong notebooks
 */
export const recountVocabularyUsage = async (): Promise<{
  processed_count: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/vocabularies/recount-usage');
  return response.data;
};

/**
 * [POST] /api/admin/notebooks/sync-vocab-count
 * Đồng bộ lại vocab_count của tất cả notebooks
 */
export const syncNotebookVocabCount = async (): Promise<{
  updated_notebooks: number;
  message: string;
}> => {
  const response = await apiClient.post('/admin/notebooks/sync-vocab-count');
  return response.data;
};

/**
 * Export tất cả functions để sử dụng
 */
export default {
  // Notebook Management
  fetchNotebooks,
  fetchVocabStats,
  fetchNotebookDetail,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  bulkDeleteNotebooks,
  publishNotebooks,
  
  // Notebook Items Management
  addItemsToNotebook,
  removeItemsFromNotebook,
  updateNotebookItemStatus,
  bulkUpdateNotebookItemStatus,
  
  // Vocabulary Management
  fetchVocabularies,
  fetchVocabularyDetail,
  createVocabulary,
  updateVocabulary,
  softDeleteVocabulary,
  hardDeleteVocabulary,
  restoreVocabulary,
  bulkCreateVocabularies,
  bulkSoftDeleteVocabularies,
  bulkRestoreVocabularies,
  
  // Import & Export
  importVocabularies,
  exportVocabularies,
  exportNotebook,
  
  // Word Types
  fetchAllWordTypes,
  createWordType,
  deleteWordType,
  
  // Media & Pronunciation
  generateVocabularyAudio,
  uploadVocabularyImage,
  
  // Search & Analytics
  advancedVocabularySearch,
  findDuplicateVocabularies,
  mergeDuplicateVocabularies,
  
  // Audit & Admin
  fetchNotebookAuditLogs,
  fetchVocabularyAuditLogs,
  
  // System Utilities
  recountVocabularyUsage,
  syncNotebookVocabCount
};