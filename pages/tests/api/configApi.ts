
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
    
    type ExamTypesResponse = {
        success: boolean;
        message: string;
        data: ExamType[];
    }

    const response = await apiClient.get<ExamTypesResponse>('/exams/types');
     console.log(response.data);
    return response.data;

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...MOCK_EXAM_TYPES]);
            }, 100);
        });
    }


};

export const createExamType = async (payload: ExamTypePayload): Promise<ExamType> => {
    const response = await apiClient.post<{ data: ExamType }>('/admin/exams/types', payload);
    return response.data;
};

export const deleteExamType = (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/admin/exams/types/${id}`);
};

// --- EXAM LEVELS ---

//  Add missing fetchExamLevels function
export const fetchExamLevels = async (): Promise<ExamLevel[]> => {

    type ExamLevelsResponse = {
        success: boolean;
        message: string;
        data: ExamLevel[];
    }

    const response = await apiClient.get<ExamLevelsResponse>('/exams/levels');
     console.log(response.data);
    return response.data;

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...MOCK_EXAM_LEVELS]);
            }, 100);
        });
    }
    

};

export const createExamLevel = async (payload: ExamLevelPayload): Promise<ExamLevel> => {
    const response = await apiClient.post<{ data: ExamLevel }>('/admin/exams/levels', payload);
    return response.data;
};

export const deleteExamLevel = (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/admin/exams/levels/${id}`);
};
