import { apiClient } from '../../../services/apiClient';
import { MockTestTemplate, TemplateStructure } from '../../../types/mocktest';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export interface MockTestTemplateCreateRequest {
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  level: string;
  name: string;
  description: string;
  structure: TemplateStructure;
}

export interface TemplateListParams {
  type?: string;
  level?: string;
  is_active?: boolean;
  search?: string;
}

// API Functions for Templates

export const fetchTemplates = async (params?: TemplateListParams) => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const response = await mockData.mockTemplatesApi.getTemplates(params);
    return response;
  }

  const queryParams = new URLSearchParams(params as any).toString();
  return apiClient.get(`/admin/mock-test-templates?${queryParams}`);
};

/**
 * Lấy templates theo loại và cấp độ để chọn khi tạo bài thi
 */
export const fetchTemplatesByTypeAndLevel = async (
  type: string,
  level: string
): Promise<MockTestTemplate[]> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const result = await mockData.mockTemplatesApi.getTemplates({
      type,
      level,
      is_active: true,
    });
    return result;
  }

  return apiClient.get(
    `/admin/mock-test-templates?type=${type}&level=${level}&is_active=true`
  );
};

/**
 * 🔹 Lấy template với structure đầy đủ để tạo form đề thi
 */
export const fetchTemplateWithStructure = async (
  id: string
): Promise<MockTestTemplate> => {
  return fetchTemplateById(id);
};

/**
 * 🔹 Lấy template theo ID
 */
export const fetchTemplateById = async (
  id: string
): Promise<MockTestTemplate> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const result = await mockData.mockTemplatesApi.getTemplateById(id);
    if (!result) throw new Error('Template not found');
    return result;
  }

  return apiClient.get(`/admin/mock-test-templates/${id}`);
};

/**
 * 🔹 Tạo template mới
 */
export const createTemplate = async (
  data: MockTestTemplateCreateRequest
): Promise<MockTestTemplate> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    return mockData.mockTemplatesApi.createTemplate(data);
  }

  return apiClient.post('/admin/mock-test-templates', data);
};

/**
 * 🔹 Cập nhật template
 */
export const updateTemplate = async (
  id: string,
  data: Partial<MockTestTemplateCreateRequest>
): Promise<MockTestTemplate> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const result = await mockData.mockTemplatesApi.updateTemplate(id, data);
    if (!result) throw new Error('Template not found');
    return result;
  }

  return apiClient.put(`/admin/mock-test-templates/${id}`, data);
};

/**
 * 🔹 Xoá template
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    await mockData.mockTemplatesApi.deleteTemplate(id);
    return;
  }

  await apiClient.delete(`/admin/mock-test-templates/${id}`);
};
