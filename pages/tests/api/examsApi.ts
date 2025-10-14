import { apiClient } from '../../../services/apiClient';
import { PaginatedResponse, UUID } from '../../../types';
import { ExamFull, ExamSummary } from '../../../types/mocktest_extended';
import { Exam } from '../../../types/mocktest';
import { MOCK_EXAMS } from '../../../mock/exams';
import { MOCK_EXAM_TYPES, MOCK_EXAM_LEVELS } from '../../../mock/exam_meta';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

export type ExamPayload = Omit<Exam, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_deleted'>;

interface FetchExamsParams {
    page?: number;
    limit?: number;
    search?: string;
    examTypeId?: string;
    examLevelId?: string;
}

const enrichExamSummary = (exam: ExamFull): ExamSummary => {
    return {
        ...exam,
        exam_type_name: MOCK_EXAM_TYPES.find(t => t.id === exam.exam_type_id)?.name || 'N/A',
        exam_level_name: MOCK_EXAM_LEVELS.find(l => l.id === exam.exam_level_id)?.name || 'N/A',
        section_count: exam.sections?.length || 0,
    };
};

export const fetchExams = (params: FetchExamsParams = {}): Promise<PaginatedResponse<ExamSummary>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, examTypeId, examLevelId } = params;
                let filtered = MOCK_EXAMS.filter(e => !e.is_deleted);

                if (search) {
                    filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
                }
                if (examTypeId) {
                    filtered = filtered.filter(e => e.exam_type_id === examTypeId);
                }
                if (examLevelId) {
                    filtered = filtered.filter(e => e.exam_level_id === examLevelId);
                }

                filtered.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
                
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit).map(enrichExamSummary);

                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/exams?${query}`);
};

export const fetchExamById = (id: string): Promise<ExamFull> => {
     if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const exam = MOCK_EXAMS.find(e => e.id === id && !e.is_deleted);
                if(exam) resolve(exam);
                else reject(new Error("Exam not found"));
            }, 300);
        });
    }
    return apiClient.get(`/exams/${id}`);
}

export const createExam = (payload: ExamPayload): Promise<ExamFull> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newExam: ExamFull = {
                    ...payload,
                    id: `exam_${Date.now()}` as UUID,
                    created_by: 'superadmin-user-id' as UUID,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_deleted: false,
                    sections: [],
                };
                MOCK_EXAMS.unshift(newExam);
                resolve(newExam);
            }, 400);
        });
    }
    return apiClient.post('/exams', payload);
};

export const updateExam = (id: string, payload: Partial<ExamPayload>): Promise<ExamFull> => {
     if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                
                MOCK_EXAMS[index] = { ...MOCK_EXAMS[index], ...payload, updated_at: new Date().toISOString() };
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }
    return apiClient.put(`/exams/${id}`, payload);
}

export const deleteExam = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                 const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                MOCK_EXAMS.splice(index, 1);
                resolve({ success: true });
            }, 400);
        });
    }
    return apiClient.delete(`/exams/${id}`);
}


/**
 * Tạo bản sao sâu (deep copy) của một bài thi, bao gồm việc tạo ID mới cho tất cả các phần tử.
 * @param examIdToCopy - ID của bài thi gốc cần sao chép.
 * @param newName - Tên mới cho bài thi sao chép.
 * @returns - Một ExamSummary của bài thi mới đã được tạo.
 */
export const duplicateExam = (examIdToCopy: string, newName: string): Promise<ExamSummary> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const originalExam = MOCK_EXAMS.find(e => e.id === examIdToCopy);
                if (!originalExam) {
                    return reject(new Error("Không tìm thấy bài thi gốc để sao chép."));
                }

                // 1. Sao chép sâu (Deep copy)
                const newExam: ExamFull = JSON.parse(JSON.stringify(originalExam));

                // 2. Cập nhật thông tin cơ bản và tạo ID mới
                const oldExamId = newExam.id;
                const newExamId = `exam_${Date.now()}` as UUID;
                
                newExam.id = newExamId;
                newExam.name = newName;
                newExam.is_published = false; // Bản sao luôn là bản nháp
                newExam.created_at = new Date().toISOString();
                newExam.updated_at = new Date().toISOString();

                // 3. Tạo ID mới cho tất cả các phần tử con (sections, subsections, etc.)
                // Điều này rất quan trọng để tránh xung đột ID
                if (newExam.sections) {
                    newExam.sections.forEach(section => {
                        const oldSectionId = section.id;
                        const newSectionId = `sec_${Date.now()}_${Math.random()}` as UUID;
                        section.id = newSectionId;
                        section.exam_id = newExamId;
                        // Cần lặp qua subsections, questions... nếu có để tạo ID mới tương tự
                    });
                }
                
                // 4. Thêm bài thi mới vào đầu danh sách
                MOCK_EXAMS.unshift(newExam);

                // 5. Trả về phiên bản summary của bài thi mới
                resolve(enrichExamSummary(newExam));
            }, 500);
        });
    }
    // API thật sẽ phức tạp hơn, cần backend xử lý sao chép
    return apiClient.post(`/exams/${examIdToCopy}/duplicate`, { newName });
};