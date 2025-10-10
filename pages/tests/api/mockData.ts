import { MockTest, MockTestTemplate } from '../../../types/mocktest';
import { MockTestListParams, MockTestCreateRequest, MockTestUpdateRequest } from './mockTestsApi';
import { 
  mockHSK1Template, 
  mockHSK2Template, 
  mockHSK3Template,
  mockTOCFLBandATemplate,
  mockD4Template,
  mockHSKKBasicTemplate
} from './templates';

// Mock data
const mockTestsData: MockTest[] = [
  {
    id: '1',
    type: 'HSK',
    level: 'HSK3',
    title: 'HSK 3 - Đề thi mẫu 2024',
    total_time_limit: 90,
    total_max_score: 300,
    passing_score: 180,
    instructions: 'Hướng dẫn làm bài HSK 3...',
    scoring_policy: {
      requires_section_pass: true,
      section_min: 60,
      total_min: 180
    },
    template_id: '9a78f2c4-2c7b-5add-c9f2-223dbfe4221c',
    completion_status: 'incomplete',
    completion_percentage: 75,
    is_active: true,
    created_by: 'admin1',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    type: 'TOCFL',
    level: 'Band A',
    title: 'TOCFL Band A - Đề thi thử nghiệm',
    total_time_limit: 120,
    total_max_score: 400,
    passing_score: 240,
    template_id: 'bb45c7d8-3e8c-6fee-d0a3-334ecgf5332d',
    completion_status: 'completed',
    completion_percentage: 100,
    is_active: true,
    created_by: 'admin2',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    type: 'HSK',
    level: 'HSK1',
    title: 'HSK 1 - Đề cơ bản cho người mới bắt đầu',
    total_time_limit: 40,
    total_max_score: 200,
    passing_score: 120,
    template_id: '8d89e0b3-1b6a-49bb-b8e1-112cafe3110b',
    completion_status: 'completed',
    completion_percentage: 100,
    is_active: true,
    created_by: 'admin1',
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-01-25T09:00:00Z'
  },
  {
    id: '4',
    type: 'HSK',
    level: 'HSK3',
    title: 'HSK 3 - Đề kiểm tra cuối khóa',
    total_time_limit: 85,
    total_max_score: 300,
    passing_score: 180,
    template_id: '9a78f2c4-2c7b-5add-c9f2-223dbfe4221c',
    completion_status: 'incomplete',
    completion_percentage: 45,
    is_active: false,
    created_by: 'admin3',
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2024-02-01T14:30:00Z'
  },
  {
    id: '5',
    type: 'HSK',
    level: 'HSK2',
    title: 'HSK 2 - Đề luyện tập cơ bản',
    total_time_limit: 55,
    total_max_score: 200,
    passing_score: 120,
    template_id: 'mockHSK2Template',
    completion_status: 'completed',
    completion_percentage: 100,
    is_active: true,
    created_by: 'admin2',
    created_at: '2024-02-03T08:30:00Z',
    updated_at: '2024-02-03T16:45:00Z'
  },
  {
    id: '6',
    type: 'D4',
    level: 'Level 4',
    title: 'D4 Level 4 - Đề thi chính thức 2024',
    total_time_limit: 120,
    total_max_score: 300,
    passing_score: 180,
    template_id: 'cc56d8e9-4f9d-7gff-e1b4-445fdghe443e',
    completion_status: 'draft',
    completion_percentage: 0,
    is_active: true,
    created_by: 'admin1',
    created_at: '2024-02-05T14:00:00Z',
    updated_at: '2024-02-05T15:30:00Z'
  },
  {
    id: '7',
    type: 'HSKK',
    level: 'Basic',
    title: 'HSKK Basic - Đề thi khẩu ngữ cơ bản',
    total_time_limit: 25,
    total_max_score: 200,
    passing_score: 120,
    template_id: 'dd67e9fa-5g0e-8hgg-f2c5-556geihf554f',
    completion_status: 'incomplete',
    completion_percentage: 30,
    is_active: true,
    created_by: 'admin2',
    created_at: '2024-02-10T13:00:00Z',
    updated_at: '2024-02-10T15:20:00Z'
  }
];

const mockTemplatesData: MockTestTemplate[] = [
  mockHSK1Template,
  mockHSK2Template,
  mockHSK3Template,
  mockTOCFLBandATemplate,
  mockD4Template,
  mockHSKKBasicTemplate,
];

// Export template examples for reference
export { mockHSK1Template, mockHSK2Template, mockHSK3Template, mockTOCFLBandATemplate, mockD4Template, mockHSKKBasicTemplate };

// Mock API implementation
export const mockTestsApi = {
  async getMockTests(params?: MockTestListParams) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredTests = [...mockTestsData];
    
    if (params?.type) {
      filteredTests = filteredTests.filter(test => test.type === params.type);
    }
    
    if (params?.level) {
      filteredTests = filteredTests.filter(test => test.level === params.level);
    }
    
    // Status filtering can be added if needed in MockTestListParams interface
    
    return {
      data: filteredTests,
      total: filteredTests.length
    };
  },

  async getMockTestById(id: string): Promise<MockTest | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTestsData.find(test => test.id === id) || null;
  },

  async createMockTest(data: MockTestCreateRequest): Promise<MockTest> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTest: MockTest = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type,
      level: data.level,
      title: data.title,
      total_time_limit: data.total_time_limit,
      total_max_score: data.total_max_score,
      passing_score: data.passing_score,
      instructions: data.instructions,
      scoring_policy: data.scoring_policy,
      template_id: data.template_id,
      completion_status: 'draft',
      completion_percentage: 0,
      is_active: true,
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockTestsData.push(newTest);
    return newTest;
  },

  async updateMockTest(id: string, data: MockTestUpdateRequest): Promise<MockTest | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const testIndex = mockTestsData.findIndex(test => test.id === id);
    if (testIndex === -1) return null;
    
    mockTestsData[testIndex] = {
      ...mockTestsData[testIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return mockTestsData[testIndex];
  },

  async deleteMockTest(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const testIndex = mockTestsData.findIndex(test => test.id === id);
    if (testIndex === -1) return false;
    
    mockTestsData.splice(testIndex, 1);
    return true;
  },

  // Template API methods  
  async getTemplates(params?: { type?: string; level?: string; is_active?: boolean }): Promise<MockTestTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredTemplates = [...mockTemplatesData];
    
    if (params?.type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === params.type);
    }
    if (params?.level) {
      filteredTemplates = filteredTemplates.filter(t => t.level === params.level);
    }
    if (params?.is_active !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.is_active === params.is_active);
    }
    
    return filteredTemplates;
  },

  async getTemplateById(id: string): Promise<MockTestTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTemplatesData.find(template => template.id === id) || null;
  },

  async createTemplate(data: Partial<MockTestTemplate>): Promise<MockTestTemplate> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newTemplate: MockTestTemplate = {
      id: Math.random().toString(36).substr(2, 20),
      type: data.type!,
      level: data.level!,
      name: data.name!,
      description: data.description || '',
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      structure: data.structure!
    };
    
    mockTemplatesData.push(newTemplate);
    return newTemplate;
  },

  async updateTemplate(id: string, data: Partial<MockTestTemplate>): Promise<MockTestTemplate> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const templateIndex = mockTemplatesData.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      throw new Error('Template not found');
    }
    
    mockTemplatesData[templateIndex] = {
      ...mockTemplatesData[templateIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return mockTemplatesData[templateIndex];
  },

  async deleteTemplate(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const templateIndex = mockTemplatesData.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return false;
    }
    
    mockTemplatesData.splice(templateIndex, 1);
    return true;
  }
};

// Level data by type
export const testLevelsByType = {
  'HSK': ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  'TOCFL': ['Band A', 'Band B', 'Band C'],
  'D4': ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
  'HSKK': ['Basic', 'Intermediate', 'Advanced']
};

// Export alias for templates API
export const mockTemplatesApi = mockTestsApi;

export default mockTestsApi;