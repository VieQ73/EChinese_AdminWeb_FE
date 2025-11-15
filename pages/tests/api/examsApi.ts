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
    
    // // Real API implementation
    const query = new URLSearchParams(params as any).toString();
    
    type ExamsResponse = {
        success: boolean;
        message: string;
        data: any[]; // Raw data from API
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }

    const response = await apiClient.get<ExamsResponse>(`/admin/exams?${query}`);
    
    // Transform data to match ExamSummary type, especially string to number conversions
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

    if (USE_MOCK_API) {
        // Mock implementation
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
                
                const enrichMockExamSummary = (exam: ExamFull): ExamSummary => ({
                    ...exam,
                    exam_type_name: MOCK_EXAM_TYPES.find(t => t.id === exam.exam_type_id)?.name || 'N/A',
                    exam_level_name: MOCK_EXAM_LEVELS.find(l => l.id === exam.exam_level_id)?.name || 'N/A',
                    section_count: exam.sections?.length || 0,
                    total_questions: 0, // Mock doesn't have this, default to 0
                });

                const data = filtered.slice((page - 1) * limit, page * limit).map(enrichMockExamSummary);

                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }

    
};

export const fetchExamById = async (id: string): Promise<ExamFull> => {
    console.log(`Fetching exam with ID: ${id}`);
    
    type ExamByIdResponse = {
        success: boolean;
        message: string;
        data: ExamFull;
    }

    const response = await apiClient.get<ExamByIdResponse>(`/admin/exams/${id}`);
    return response.data;
     if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const exam = MOCK_EXAMS.find(e => e.id === id && !e.is_deleted);
                if(exam) resolve(exam);
                else reject(new Error("Exam not found"));
            }, 300);
        });
    }


};

export const createExam = async (payload: ExamPayload): Promise<ExamFull> => {
    type CreateExamResponse = {
        success: boolean;
        message: string;
        data: ExamFull;
    }

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

    // Helper function to save payload to a JSON file for debugging
    // const savePayloadAsJson = (data: any) => {
    //     try {
    //         // A replacer function to handle non-serializable objects like File
    //         const replacer = (key: string, value: any) => {
    //             if (value instanceof File) {
    //                 return {
    //                     _type: 'File',
    //                     name: value.name,
    //                     size: value.size,
    //                     type: value.type,
    //                 };
    //             }
    //             return value;
    //         };

    //         const jsonString = JSON.stringify(data, replacer, 2);
    //         const blob = new Blob([jsonString], { type: 'application/json' });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = 'exam_payload.json';
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);
    //         URL.revokeObjectURL(url);
    //         console.log('Payload saved as exam_payload.json');
    //     } catch (error) {
    //         console.error('Failed to save payload as JSON:', error);
    //     }
    // };
    // savePayloadAsJson(transformedPayload);

    const response = await apiClient.post<CreateExamResponse>('/admin/exams', transformedPayload);
    console.log(transformedPayload);
    
    return response.data;

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
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
                resolve(newExam);
            }, 400);
        });
    }
    

};

export const updateExam = async (id: string, payload: Partial<ExamPayload>): Promise<ExamFull> => {

    type UpdateExamResponse = {
        success: boolean;
        message: string;
        data: ExamFull;
    }

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

    const response = await apiClient.put<UpdateExamResponse>(`/admin/exams/${id}`, transformedPayload);
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                
                MOCK_EXAMS[index] = { ...MOCK_EXAMS[index], ...transformedPayload, updated_at: new Date().toISOString() } as ExamFull;
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }
    

}

// A generic response type for actions that return the full exam object
type ExamActionResponse = {
    success: boolean;
    message: string;
    data: ExamFull;
}

export const trashExam = async (id: string): Promise<ExamFull> => {
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/delete`, {});
    return response.data;
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                MOCK_EXAMS[index].is_deleted = true;
                MOCK_EXAMS[index].updated_at = new Date().toISOString();
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }

}

export const restoreExam = async (id: string): Promise<ExamFull> => {
    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/restore`, {});
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                MOCK_EXAMS[index].is_deleted = false;
                MOCK_EXAMS[index].updated_at = new Date().toISOString();
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }

}

export const publishExam = async (id: string): Promise<ExamFull> => {

    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/publish`, {});
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                MOCK_EXAMS[index].is_published = true;
                MOCK_EXAMS[index].updated_at = new Date().toISOString();
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }
    
}

export const unpublishExam = async (id: string): Promise<ExamFull> => {

    const response = await apiClient.post<ExamActionResponse>(`/admin/exams/${id}/unpublish`, {});
    return response.data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_EXAMS.findIndex(e => e.id === id);
                if (index === -1) return reject(new Error("Exam not found"));
                MOCK_EXAMS[index].is_published = false;
                MOCK_EXAMS[index].updated_at = new Date().toISOString();
                resolve(MOCK_EXAMS[index]);
            }, 400);
        });
    }
    
}

export const deleteExam = async (id: string): Promise<{ success: boolean }> => {
    type DeleteResponse = {
        success: boolean;
        message: string;
    }

    const response = await apiClient.delete<DeleteResponse>(`/admin/exams/${id}/force`);
    return { success: response.success };

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
}


/**
 * Tạo bản sao sâu (deep copy) của một bài thi, bao gồm việc tạo ID mới cho tất cả các phần tử.
 * @param examIdToCopy - ID của bài thi gốc cần sao chép.
 * @param newName - Tên mới cho bài thi sao chép.
 * @returns - Một ExamSummary của bài thi mới đã được tạo.
 */
export const duplicateExam = async (examIdToCopy: string, newName: string): Promise<ExamSummary> => {
    
    type DuplicateResponse = {
        success: boolean;
        message: string;
        data: ExamSummary;
    }

    const response = await apiClient.post<DuplicateResponse>(`/admin/exams/${examIdToCopy}/duplicate`, {});
    return response.data;
    
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
                resolve(enrichExamSummaryForMock(newExam));
            }, 500);
        });
    }
    

};