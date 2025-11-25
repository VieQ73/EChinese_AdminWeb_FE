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

// This function is now only used for the mock implementation of duplicateExam
const enrichExamSummaryForMock = (exam: ExamFull): ExamSummary => {
    return {
        ...exam,
        exam_type_name: MOCK_EXAM_TYPES.find(t => t.id === exam.exam_type_id)?.name || 'N/A',
        exam_level_name: MOCK_EXAM_LEVELS.find(l => l.id === exam.exam_level_id)?.name || 'N/A',
        section_count: exam.sections?.length || 0,
        total_questions: 0, // Mock data doesn't have this field
    };
};

export const fetchExams = async (params: FetchExamsParams = {}): Promise<PaginatedResponse<ExamSummary>> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
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
        
        const enrichMockExamSummary = (exam: ExamFull): ExamSummary => ({
            ...exam,
            exam_type_name: MOCK_EXAM_TYPES.find(t => t.id === exam.exam_type_id)?.name || 'N/A',
            exam_level_name: MOCK_EXAM_LEVELS.find(l => l.id === exam.exam_level_id)?.name || 'N/A',
            section_count: exam.sections?.length || 0,
            total_questions: 0,
        });

        const data = filtered.slice((page - 1) * limit, page * limit).map(enrichMockExamSummary);
        return { data, meta: { total, page, limit, totalPages } };
    }

    // Real API
    const query = new URLSearchParams(params as any).toString();
    
    type ExamsResponse = {
        success: boolean;
        message: string;
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }

    const response = await apiClient.get<ExamsResponse>(`/admin/exams?${query}`);
    
    const transformedData = response.data.map(exam => ({
        ...exam,
        section_count: parseInt(String(exam.section_count), 10) || 0,
        total_questions: parseInt(String(exam.total_questions), 10) || 0,
    }));
    console.log({
        data: transformedData,
        meta: response.meta,
    });

    return {
        data: transformedData,
        meta: response.meta,
    };
};

export const fetchExamById = async (id: string): Promise<ExamFull> => {
    console.log(`Fetching exam with ID: ${id}`);
    
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const exam = MOCK_EXAMS.find(e => e.id === id && !e.is_deleted);
        if (exam) return exam;
        throw new Error("Exam not found");
    }

    // Real API
    type ExamByIdResponse = {
        success: boolean;
        message: string;
        data: ExamFull;
    }

    const response = await apiClient.get<ExamByIdResponse>(`/admin/exams/${id}`);
    return response.data;
};

export const createExam = async (payload: ExamPayload): Promise<ExamFull> => {
    // Deep copy the payload to avoid mutating the original form state
    const transformedPayload = JSON.parse(JSON.stringify(payload));

    // Rename image_json to image in each prompt
    transformedPayload.sections?.forEach((section: any) => {
        section.subsections?.forEach((subsection: any) => {
            subsection.prompts?.forEach((prompt: any) => {
                if (prompt.hasOwnProperty('image_json')) {
                    prompt.image = prompt.image_json;
                    delete prompt.image_json;
                }
            });
        });
    });

    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const newExam: ExamFull = {
            ...transformedPayload,
            id: `exam_${Date.now()}` as UUID,
            created_by: 'superadmin-user-id' as UUID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false,
            sections: [],
        };
        MOCK_EXAMS.unshift(newExam);
        return newExam;
    }

    // Real API
    type CreateExamResponse = {
        success: boolean;
        message: string;
        data: ExamFull;
    }

    const response = await apiClient.post<CreateExamResponse>('/admin/exams', transformedPayload);
    return response.data;
};

export const updateExam = async (id: string, payload: Partial<ExamPayload>): Promise<ExamFull | ExamFull[]> => {
    // Deep copy the payload to avoid mutating the original form state
    const transformedPayload = JSON.parse(JSON.stringify(payload));

    // Rename image_json to image in each prompt
    transformedPayload.sections?.forEach((section: any) => {
        section.subsections?.forEach((subsection: any) => {
            subsection.prompts?.forEach((prompt: any) => {
                if (prompt.hasOwnProperty('image_json')) {
                    prompt.image = prompt.image_json;
                    delete prompt.image_json;
                }
            });
        });
    });

    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        
        MOCK_EXAMS[index] = { ...MOCK_EXAMS[index], ...transformedPayload, updated_at: new Date().toISOString() } as ExamFull;
        return MOCK_EXAMS[index];
    }

    // Real API
    type UpdateExamResponse = {
        success: boolean;
        message: string;
        data: ExamFull | ExamFull[];
    }

    const response = await apiClient.put<UpdateExamResponse>(`/admin/exams/${id}`, transformedPayload);
    console.log('Update exam response:', response);
    return response.data;
};

// A generic response type for actions that return the full exam object
type ExamActionResponse = {
    success: boolean;
    message: string;
    data: ExamFull;
}

export const trashExam = async (id: string): Promise<ExamFull> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        MOCK_EXAMS[index].is_deleted = true;
        MOCK_EXAMS[index].updated_at = new Date().toISOString();
        return MOCK_EXAMS[index];
    }

    // Real API
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/delete`, {});
    return response.data;
};

export const restoreExam = async (id: string): Promise<ExamFull> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        MOCK_EXAMS[index].is_deleted = false;
        MOCK_EXAMS[index].updated_at = new Date().toISOString();
        return MOCK_EXAMS[index];
    }

    // Real API
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/restore`, {});
    return response.data;
};

export const publishExam = async (id: string): Promise<ExamFull> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        MOCK_EXAMS[index].is_published = true;
        MOCK_EXAMS[index].updated_at = new Date().toISOString();
        return MOCK_EXAMS[index];
    }

    // Real API
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/publish`, {});
    return response.data;
};

export const unpublishExam = async (id: string): Promise<ExamFull> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        MOCK_EXAMS[index].is_published = false;
        MOCK_EXAMS[index].updated_at = new Date().toISOString();
        return MOCK_EXAMS[index];
    }

    // Real API
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/unpublish`, {});
    return response.data;
};

export const deleteExam = async (id: string): Promise<{ success: boolean }> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const index = MOCK_EXAMS.findIndex(e => e.id === id);
        if (index === -1) throw new Error("Exam not found");
        MOCK_EXAMS.splice(index, 1);
        return { success: true };
    }

    // Real API
    type DeleteResponse = {
        success: boolean;
        message: string;
    }

    const response = await apiClient.delete<DeleteResponse>(`/admin/exams/${id}/force`);
    return { success: response.success };
};


/**
 * Kiểm tra số lần làm bài của một đề thi
 * @param examId - ID của bài thi cần kiểm tra
 * @returns Thông tin về số lần làm bài
 */
export interface ExamAttemptsData {
    exam_id: string;
    has_attempts: boolean;
    total_attempts: number;
    unique_users: number;
    first_attempt_at: string | null;
    last_attempt_at: string | null;
}

export interface CheckExamAttemptsResponse {
    success: boolean;
    message: string;
    data: ExamAttemptsData;
}

export const checkExamAttempts = async (examId: string): Promise<ExamAttemptsData> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        return {
            exam_id: examId,
            has_attempts: false,
            total_attempts: 0,
            unique_users: 0,
            first_attempt_at: null,
            last_attempt_at: null
        };
    }

    // Real API
    const response = await apiClient.get<CheckExamAttemptsResponse>(`/admin/exams/${examId}/check-attempts`);
    return response.data;
};

/**
 * Tạo bản sao sâu (deep copy) của một bài thi, bao gồm việc tạo ID mới cho tất cả các phần tử.
 * @param examIdToCopy - ID của bài thi gốc cần sao chép.
 * @param newName - Tên mới cho bài thi sao chép.
 * @returns - Một ExamSummary của bài thi mới đã được tạo.
 */
export const duplicateExam = async (examIdToCopy: string, newName: string): Promise<ExamSummary> => {
    // Mock API cho test hiển thị
    if (USE_MOCK_API) {
        const originalExam = MOCK_EXAMS.find(e => e.id === examIdToCopy);
        if (!originalExam) {
            throw new Error("Không tìm thấy bài thi gốc để sao chép.");
        }

        // 1. Sao chép sâu (Deep copy)
        const newExam: ExamFull = JSON.parse(JSON.stringify(originalExam));

        // 2. Cập nhật thông tin cơ bản và tạo ID mới
        const newExamId = `exam_${Date.now()}` as UUID;
        
        newExam.id = newExamId;
        newExam.name = newName;
        newExam.is_published = false;
        newExam.created_at = new Date().toISOString();
        newExam.updated_at = new Date().toISOString();

        // 3. Tạo ID mới cho tất cả các phần tử con
        if (newExam.sections) {
            newExam.sections.forEach(section => {
                const newSectionId = `sec_${Date.now()}_${Math.random()}` as UUID;
                section.id = newSectionId;
                section.exam_id = newExamId;
            });
        }
        
        // 4. Thêm bài thi mới vào đầu danh sách
        MOCK_EXAMS.unshift(newExam);

        return enrichExamSummaryForMock(newExam);
    }
    
    // Real API
    type DuplicateResponse = {
        success: boolean;
        message: string;
        data: ExamSummary;
    }

    const response = await apiClient.post<DuplicateResponse>(`/admin/exams/${examIdToCopy}/duplicate`, {});
    return response.data;
};