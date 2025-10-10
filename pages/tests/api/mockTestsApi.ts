import { apiClient } from '../../../services/apiClient';
import { MockTest, MockTestTemplate } from '../../../types/mocktest';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types for API requests
export interface MockTestListParams {
  page?: number;
  limit?: number;
  type?: string;
  level?: string;
  is_active?: boolean;
  search?: string;
}

export interface MockTestCreateRequest {
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  level: string;
  title: string;
  total_time_limit: number;
  total_max_score: number;
  passing_score?: number;
  instructions?: string;
  scoring_policy?: {
    requires_section_pass?: boolean;
    section_min?: number;
    total_min?: number;
  };
  template_id?: string;
}

export interface MockTestUpdateRequest extends Partial<MockTestCreateRequest> {
  is_active?: boolean;
  completion_status?: 'draft' | 'incomplete' | 'completed' | 'reviewed';
  completion_percentage?: number;
}

export interface MockTestListResponse {
  data: MockTest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions for Mock Tests
export const fetchMockTests = async (params?: MockTestListParams): Promise<MockTestListResponse> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const response = await mockData.mockTestsApi.getMockTests(params);
    // Transform to expected format
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const totalPages = Math.ceil(response.total / limit);
    
    return {
      data: response.data,
      pagination: {
        page,
        limit,
        total: response.total,
        totalPages
      }
    };
  }
  
  const queryParams = new URLSearchParams(params as any).toString();
  return apiClient.get(`/admin/mock-tests?${queryParams}`);
};

export const fetchMockTestById = async (id: string): Promise<MockTest> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const result = await mockData.mockTestsApi.getMockTestById(id);
    if (!result) throw new Error('Test not found');
    return result;
  }
  
  return apiClient.get(`/admin/mock-tests/${id}`);
};

export const createMockTest = async (data: MockTestCreateRequest): Promise<MockTest> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    return mockData.mockTestsApi.createMockTest(data);
  }
  
  return apiClient.post('/admin/mock-tests', data);
};

export const updateMockTest = async (id: string, data: MockTestUpdateRequest): Promise<MockTest> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    const result = await mockData.mockTestsApi.updateMockTest(id, data);
    if (!result) throw new Error('Test not found');
    return result;
  }
  
  return apiClient.put(`/admin/mock-tests/${id}`, data);
};

export const deleteMockTest = async (id: string): Promise<void> => {
  if (USE_MOCK_API) {
    const mockData = await import('./mockData');
    await mockData.mockTestsApi.deleteMockTest(id);
    return;
  }
  
  await apiClient.delete(`/admin/mock-tests/${id}`);
};