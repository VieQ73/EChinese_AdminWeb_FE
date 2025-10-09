import { apiClient } from '../../../services/apiClient';
import { Notebook, PaginatedResponse } from '../../../types';
import { mockNotebooks, mockNotebookVocabItems } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types
export type NotebookPayload = Omit<Notebook, 'id' | 'created_at' | 'vocab_count'>;

interface FetchNotebooksParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'published' | 'draft';
    premium?: 'all' | 'true' | 'false';
}

// API Functions

export const fetchNotebooks = (params: FetchNotebooksParams): Promise<PaginatedResponse<Notebook>> => {
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

                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 300);
        });
    }
    const queryParams = new URLSearchParams(params as any).toString();
    return apiClient.get(`/content/notebooks?${queryParams}`);
};

export const fetchNotebookById = (id: string): Promise<Notebook> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
             setTimeout(() => {
                const notebook = mockNotebooks.find(nb => nb.id === id);
                if (notebook) {
                    const vocab_count = mockNotebookVocabItems.filter(item => item.notebook_id === id).length;
                    resolve({ ...notebook, vocab_count });
                } else {
                    reject(new Error('Notebook not found'));
                }
            }, 200);
        });
    }
    return apiClient.get(`/content/notebooks/${id}`);
}

export const createNotebook = (payload: NotebookPayload): Promise<Notebook> => {
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
                resolve(newNotebook);
            }, 300);
        });
    }
    return apiClient.post('/content/notebooks', payload);
};

export const updateNotebook = (id: string, payload: Partial<NotebookPayload>): Promise<Notebook> => {
     if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockNotebooks.findIndex(nb => nb.id === id);
                if (index === -1) return reject(new Error('Notebook not found'));
                mockNotebooks[index] = { ...mockNotebooks[index], ...payload };
                resolve(mockNotebooks[index]);
            }, 300);
        });
    }
    return apiClient.put(`/content/notebooks/${id}`, payload);
};

export const deleteNotebooks = (ids: string[]): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToDelete = new Set(ids);
                const newNotebooks = mockNotebooks.filter(nb => !idsToDelete.has(nb.id));
                mockNotebooks.length = 0;
                mockNotebooks.push(...newNotebooks);

                const newItems = mockNotebookVocabItems.filter(item => !idsToDelete.has(item.notebook_id));
                mockNotebookVocabItems.length = 0;
                mockNotebookVocabItems.push(...newItems);
                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.post('/content/notebooks/bulk-delete', { ids });
};

export const bulkUpdateNotebookStatus = (ids: string[], status: 'published' | 'draft'): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToUpdate = new Set(ids);
                mockNotebooks.forEach(nb => {
                    if (idsToUpdate.has(nb.id)) {
                        nb.status = status;
                    }
                });
                resolve({ success: true });
            }, 300);
        });
    }
    return apiClient.post('/content/notebooks/bulk-status', { ids, status });
}