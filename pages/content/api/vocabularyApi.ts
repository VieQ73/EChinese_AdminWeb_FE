import { apiClient } from '../../../services/apiClient';
import { Vocabulary, PaginatedResponse } from '../../../types';
import { mockVocab, mockNotebookVocabItems, mockNotebooks } from '../../../mock';
import { WORD_TYPES as vocabWordTypes } from '../../../mock/content';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Re-export constants
export const WORD_TYPES = vocabWordTypes;

// Types
export type VocabPayload = Omit<Vocabulary, 'id'>;

interface FetchVocabParams {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    notebookId?: string;
}

// API Functions

export const fetchVocabularies = (params: FetchVocabParams): Promise<PaginatedResponse<Vocabulary>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 20, search = '', level = 'all', notebookId } = params;

                let filtered = [...mockVocab];
                
                if (notebookId) {
                    const vocabIdsInNotebook = new Set(mockNotebookVocabItems
                        .filter(item => item.notebook_id === notebookId)
                        .map(item => item.vocab_id));
                    filtered = filtered.filter(v => vocabIdsInNotebook.has(v.id));
                }

                if (search) {
                    filtered = filtered.filter(v => 
                        v.hanzi.toLowerCase().includes(search.toLowerCase()) ||
                        v.pinyin.toLowerCase().includes(search.toLowerCase()) ||
                        v.meaning.toLowerCase().includes(search.toLowerCase())
                    );
                }
                if (level !== 'all') {
                    filtered = filtered.filter(v => v.level.includes(level));
                }
                
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);

                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 300);
        });
    }
    const queryParams = new URLSearchParams(params as any).toString();
    return apiClient.get(`/content/vocabularies?${queryParams}`);
};

export const createOrUpdateVocabs = (payloads: Partial<Vocabulary>[]): Promise<Vocabulary[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const results: Vocabulary[] = [];
                payloads.forEach(payload => {
                    if (payload.id) { // Update
                        const index = mockVocab.findIndex(v => v.id === payload.id);
                        if (index !== -1) {
                            mockVocab[index] = { ...mockVocab[index], ...payload } as Vocabulary;
                            results.push(mockVocab[index]);
                        }
                    } else { // Create
                        const newVocab: Vocabulary = {
                            id: `v_${Date.now()}_${Math.random()}`,
                            ...payload,
                        } as Vocabulary; // Assume payload is valid
                        mockVocab.unshift(newVocab);
                        results.push(newVocab);
                    }
                });
                resolve(results);
            }, 400);
        });
    }
    return apiClient.post('/content/vocabularies/bulk-upsert', { vocabularies: payloads });
};

export const deleteVocabularies = (vocabIds: string[]): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToDelete = new Set(vocabIds);
                const newMockVocab = mockVocab.filter(v => !idsToDelete.has(v.id));
                mockVocab.length = 0;
                mockVocab.push(...newMockVocab);

                const newItems = mockNotebookVocabItems.filter(item => !idsToDelete.has(item.vocab_id));
                mockNotebookVocabItems.length = 0;
                mockNotebookVocabItems.push(...newItems);
                
                resolve({ success: true });
            }, 400);
        });
    }
    return apiClient.post('/content/vocabularies/bulk-delete', { ids: vocabIds });
};

export const addVocabsToNotebook = (notebookId: string, vocabIds: string[]): Promise<{ addedCount: number }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                let addedCount = 0;
                vocabIds.forEach(vocabId => {
                    const exists = mockNotebookVocabItems.some(item => item.notebook_id === notebookId && item.vocab_id === vocabId);
                    if (!exists) {
                        mockNotebookVocabItems.push({
                            notebook_id: notebookId,
                            vocab_id: vocabId,
                            status: 'chưa thuộc',
                            added_at: new Date().toISOString()
                        });
                        addedCount++;
                    }
                });
                
                // Cập nhật vocab_count trong mockNotebooks
                const nbIndex = mockNotebooks.findIndex(nb => nb.id === notebookId);
                if (nbIndex !== -1) {
                    mockNotebooks[nbIndex].vocab_count += addedCount;
                }

                resolve({ addedCount });
            }, 300);
        });
    }
    return apiClient.post(`/content/notebooks/${notebookId}/vocabularies`, { vocabIds });
};

export const removeVocabsFromNotebook = (notebookId: string, vocabIds: string[]): Promise<{ success: boolean }> => {
     if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToRemove = new Set(vocabIds);
                const initialCount = mockNotebookVocabItems.length;
                
                const newItems = mockNotebookVocabItems.filter(item => 
                    !(item.notebook_id === notebookId && idsToRemove.has(item.vocab_id))
                );
                mockNotebookVocabItems.length = 0;
                mockNotebookVocabItems.push(...newItems);

                // Cập nhật vocab_count trong mockNotebooks
                const removedCount = initialCount - newItems.length;
                const nbIndex = mockNotebooks.findIndex(nb => nb.id === notebookId);
                if (nbIndex !== -1) {
                    mockNotebooks[nbIndex].vocab_count -= removedCount;
                }
                
                resolve({ success: true });
            }, 300);
        });
    }
    //  Changed the call to apiClient.delete to pass the body as the second argument, matching the updated helper signature.
    return apiClient.delete(`/content/notebooks/${notebookId}/vocabularies`, { vocabIds });
};