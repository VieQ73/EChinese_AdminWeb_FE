
import { apiClient } from '../../../services/apiClient';
import { ExamType, ExamLevel, UUID } from '../../../types';
import { MOCK_EXAM_TYPES, MOCK_EXAM_LEVELS } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// EXAM CONFIGURATION API
// =============================

export type ExamTypePayload = Omit<ExamType, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>;
export type ExamLevelPayload = Omit<ExamLevel, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>;

// --- EXAM TYPES ---

//  Add missing fetchExamTypes function
export const fetchExamTypes = async (): Promise<ExamType[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return [...MOCK_EXAM_TYPES];
    }

    // Real API
    type ExamTypesResponse = {
        success: boolean;
        message: string;
        data: ExamType[];
    }

    const response = await apiClient.get<ExamTypesResponse>('/exams/types');
    console.log(response.data);
    return response.data;
};

export const createExamType = async (payload: ExamTypePayload): Promise<ExamType> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const newType: ExamType = {
            ...payload,
            id: `type_${Date.now()}` as UUID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false
        };
        MOCK_EXAM_TYPES.push(newType);
        return newType;
    }

    // Real API
    const response = await apiClient.post<{ data: ExamType }>('/admin/exams/types', payload);
    return response.data;
};

export const deleteExamType = async (id: string): Promise<{ success: boolean }> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAM_TYPES.findIndex(t => t.id === id);
        if (index !== -1) {
            MOCK_EXAM_TYPES.splice(index, 1);
        }
        return { success: true };
    }

    // Real API
    return apiClient.delete(`/admin/exams/types/${id}`);
};

// --- EXAM LEVELS ---

//  Add missing fetchExamLevels function
export const fetchExamLevels = async (): Promise<ExamLevel[]> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return [...MOCK_EXAM_LEVELS];
    }

    // Real API
    type ExamLevelsResponse = {
        success: boolean;
        message: string;
        data: ExamLevel[];
    }

    const response = await apiClient.get<ExamLevelsResponse>('/exams/levels');
    console.log(response.data);
    return response.data;
};

export const createExamLevel = async (payload: ExamLevelPayload): Promise<ExamLevel> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const newLevel: ExamLevel = {
            ...payload,
            id: `level_${Date.now()}` as UUID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false
        };
        MOCK_EXAM_LEVELS.push(newLevel);
        return newLevel;
    }

    // Real API
    const response = await apiClient.post<{ data: ExamLevel }>('/admin/exams/levels', payload);
    return response.data;
};

export const deleteExamLevel = async (id: string): Promise<{ success: boolean }> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAM_LEVELS.findIndex(l => l.id === id);
        if (index !== -1) {
            MOCK_EXAM_LEVELS.splice(index, 1);
        }
        return { success: true };
    }

    // Real API
    return apiClient.delete(`/admin/exams/levels/${id}`);
};
