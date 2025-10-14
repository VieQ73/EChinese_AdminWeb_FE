
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
export const fetchExamTypes = (): Promise<ExamType[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...MOCK_EXAM_TYPES]);
            }, 100);
        });
    }
    return apiClient.get('/exams/types');
};

export const createExamType = (payload: ExamTypePayload): Promise<ExamType> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (MOCK_EXAM_TYPES.some(t => t.name.toLowerCase() === payload.name.toLowerCase())) {
                    return reject(new Error('Tên loại bài thi đã tồn tại.'));
                }
                const newType: ExamType = {
                    ...payload,
                    id: `type_${Date.now()}` as UUID,
                    created_at: new Date().toISOString(),
                    is_active: true,
                };
                MOCK_EXAM_TYPES.unshift(newType);
                resolve(newType);
            }, 300);
        });
    }
    return apiClient.post('/exams/types', payload);
};

export const deleteExamType = (id: string): Promise<{ success: boolean }> => {
     if (USE_MOCK_API) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const typeIndex = MOCK_EXAM_TYPES.findIndex(t => t.id === id);
                if (typeIndex > -1) MOCK_EXAM_TYPES.splice(typeIndex, 1);
                
                // Xóa các level liên quan
                const newLevels = MOCK_EXAM_LEVELS.filter(l => l.exam_type_id !== id);
                MOCK_EXAM_LEVELS.length = 0;
                MOCK_EXAM_LEVELS.push(...newLevels);

                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.delete(`/exams/types/${id}`);
};

// --- EXAM LEVELS ---

//  Add missing fetchExamLevels function
export const fetchExamLevels = (): Promise<ExamLevel[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...MOCK_EXAM_LEVELS]);
            }, 100);
        });
    }
    return apiClient.get('/exams/levels');
};

export const createExamLevel = (payload: ExamLevelPayload): Promise<ExamLevel> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (MOCK_EXAM_LEVELS.some(l => l.exam_type_id === payload.exam_type_id && l.name.toLowerCase() === payload.name.toLowerCase())) {
                    return reject(new Error('Tên cấp độ đã tồn tại trong loại bài thi này.'));
                }
                const newLevel: ExamLevel = {
                    ...payload,
                    id: `level_${Date.now()}` as UUID,
                    created_at: new Date().toISOString(),
                };
                MOCK_EXAM_LEVELS.unshift(newLevel);
                resolve(newLevel);
            }, 300);
        });
    }
    return apiClient.post('/exams/levels', payload);
};

export const deleteExamLevel = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const levelIndex = MOCK_EXAM_LEVELS.findIndex(l => l.id === id);
                if (levelIndex > -1) MOCK_EXAM_LEVELS.splice(levelIndex, 1);
                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.delete(`/exams/levels/${id}`);
};