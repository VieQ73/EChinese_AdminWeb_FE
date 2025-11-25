import { apiClient } from '../../../services/apiClient';
import { Notebook, PaginatedResponse, Vocabulary } from '../../../types';
import { mockNotebooks, mockNotebookVocabItems, mockVocab } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types
export type NotebookPayload = Omit<Notebook, 'id' | 'created_at' | 'vocab_count'>;

export interface NotebookDetail extends Notebook {
    vocabularies: PaginatedResponse<Vocabulary>;
}

interface FetchNotebooksParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'published' | 'draft';
    premium?: 'all' | 'true' | 'false';
}

// API Functions

export const fetchNotebooks = async (params: FetchNotebooksParams): Promise<PaginatedResponse<Notebook>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search = '', status = 'all', premium = 'all' } = params;

                let filtered = mockNotebooks.map(nb => ({
                    ...nb,
                    vocab_count: mockNotebookVocabItems.filter(item => item.notebook_id === nb.id).length,
                }));
                
                if (search) {
                    filtered = filtered.filter(nb => nb.name.toLowerCase().includes(search.toLowerCase()));
                }
                if (status !== 'all') {
                    filtered = filtered.filter(nb => nb.status === status);
                }
                if (premium !== 'all') {
                    filtered = filtered.filter(nb => String(nb.is_premium) === premium);
                }

                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                
                console.log({ data, meta: { total, page, limit, totalPages } });
                
                resolve({ data, meta: { total, page, limit, totalPages } });
            });
        });
    }

    // Real API
    const queryParams = new URLSearchParams(params as any).toString();
    type NotebookApiResponse = { success: boolean; data: PaginatedResponse<Notebook>; }
    const response = await apiClient.get<NotebookApiResponse>(`/admin/notebooks/system?${queryParams}`);
    return response.data;
};

export const fetchNotebookById = async (id: string): Promise<NotebookDetail> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
             setTimeout(() => {
                const notebook = mockNotebooks.find(nb => nb.id === id);
                if (notebook) {
                    const vocabIdsInNotebook = new Set(mockNotebookVocabItems
                        .filter(item => item.notebook_id === id)
                        .map(item => item.vocab_id));
                    
                    const vocabularies = mockVocab.filter(v => vocabIdsInNotebook.has(v.id));

                    const response: NotebookDetail = {
                        ...notebook,
                        vocab_count: vocabularies.length,
                        vocabularies: {
                            data: vocabularies,
                            meta: {
                                total: vocabularies.length,
                                page: 1,
                                limit: 10,
                                totalPages: Math.ceil(vocabularies.length / 10),
                            }
                        }
                    };
                    resolve(response);
                } else {
                    reject(new Error('Notebook not found'));
                }
            });
        });
    }

    // Real API
    type NotebookDetailResponse = { success: boolean; data: NotebookDetail; }
    const response = await apiClient.get<NotebookDetailResponse>(`/notebooks/${id}`);
    return response.data;
}

export const createNotebook = async (payload: NotebookPayload): Promise<Notebook> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newNotebook: Notebook = {
                    id: `nb_${Date.now()}`,
                    ...payload,
                    vocab_count: 0,
                    created_at: new Date().toISOString(),
                };
                mockNotebooks.unshift(newNotebook);
                console.log(newNotebook);
                
                resolve(newNotebook);
            });
        });
    }

    // Real API
    type CreateNotebookResponse = { success: boolean; message: string; data: Notebook; }
    const response = await apiClient.post<CreateNotebookResponse>('/notebooks', payload);
    return response.data;
};

export const updateNotebook = async (id: string, payload: Partial<NotebookPayload>): Promise<Notebook> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockNotebooks.findIndex(nb => nb.id === id);
                if (index === -1) return reject(new Error('Notebook not found'));
                mockNotebooks[index] = { ...mockNotebooks[index], ...payload } as Notebook;
                resolve(mockNotebooks[index]);
            });
        });
    }

    // Real API
    type UpdateNotebookResponse = { success: boolean; message: string; data: Notebook; }
    const response = await apiClient.put<UpdateNotebookResponse>(`/admin/notebooks/${id}`, payload);
    return response.data;
};

export const deleteNotebooks = async (ids: string[]): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToDelete = new Set(ids);
                const initialCount = mockNotebooks.length;
                const newNotebooks = mockNotebooks.filter(nb => !idsToDelete.has(nb.id));
                mockNotebooks.length = 0;
                mockNotebooks.push(...newNotebooks);

                const newItems = mockNotebookVocabItems.filter(item => !idsToDelete.has(item.notebook_id));
                mockNotebookVocabItems.length = 0;
                mockNotebookVocabItems.push(...newItems);
                
                const deletedCount = initialCount - newNotebooks.length;
                resolve({ 
                    success: true, 
                    message: `Đã xóa thành công ${deletedCount} notebook.`,
                    data: { deletedCount }
                });
            });
        });
    }

    // Real API
    type DeleteNotebooksResponse = { success: boolean; message: string; data: { deletedCount: number } }
    const response = await apiClient.post<DeleteNotebooksResponse>('/admin/notebooks/bulk-delete', { ids });
    return response;
};

export const bulkUpdateNotebookStatus = async (ids: string[], status: 'published' | 'draft'): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                let updatedCount = 0;
                const idsToUpdate = new Set(ids);
                mockNotebooks.forEach(nb => {
                    if (idsToUpdate.has(nb.id)) {
                        nb.status = status;
                        updatedCount++;
                    }
                });
                resolve({ success: true, message: `Đã cập nhật trạng thái thành công cho ${updatedCount} notebook.` });
            });
        });
    }

    // Real API
    type BulkUpdateResponse = { success: boolean; message: string; };
    const response = await apiClient.post<BulkUpdateResponse>('/admin/notebooks/bulk-status', { ids, status });
    return response;
}