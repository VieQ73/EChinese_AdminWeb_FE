import { apiClient } from '../../services/apiClient';
import type { Vocabulary } from '../../types/entities';
import { addItemsToNotebook } from '../notebooks/notebookApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

let mockVocabularies: Vocabulary[] = [
  {
    id: 'v1',
    word_types: ['Danh từ'],
    hanzi: '你',
    pinyin: 'nǐ',
    meaning: 'bạn',
    notes: 'thông dụng',
    level: ['HSK1'],
    image_url: 'https://picsum.photos/seed/ni/200/120',
  },
  {
    id: 'v2',
    word_types: ['Động từ'],
    hanzi: '吃',
    pinyin: 'chī',
    meaning: 'ăn',
    level: ['HSK1'],
    image_url: 'https://picsum.photos/seed/chi/200/120',
  },
  {
    id: 'v3',
    word_types: ['Danh từ'],
    hanzi: '学习',
    pinyin: 'xuéxí',
    meaning: 'học',
    level: ['HSK2'],
    image_url: 'https://picsum.photos/seed/xue/200/120',
  },
];

export const fetchVocabularies = (params?: { search?: string; level?: string }): Promise<Vocabulary[]> => {
  if (USE_MOCK_API) {
    let list = [...mockVocabularies].filter(v => !v.deleted_at);
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(v => v.hanzi.includes(s) || v.pinyin.toLowerCase().includes(s) || (v.meaning || '').toLowerCase().includes(s));
    }
    if (params?.level) list = list.filter(v => Array.isArray(v.level) ? (v.level as any[]).includes(params.level!) : (v.level === params.level));
    return new Promise(resolve => setTimeout(() => resolve(list), 300));
  }
  return apiClient.get('/vocabularies', { params });
};

// Variant: fetch with option to include deleted items
export const fetchVocabulariesIncludingDeleted = (params?: { search?: string; level?: string; includeDeleted?: boolean }): Promise<Vocabulary[]> => {
  if (USE_MOCK_API) {
    let list = [...mockVocabularies];
    if (!params?.includeDeleted) list = list.filter(v => !v.deleted_at);
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(v => v.hanzi.includes(s) || v.pinyin.toLowerCase().includes(s) || (v.meaning || '').toLowerCase().includes(s));
    }
    if (params?.level) list = list.filter(v => Array.isArray(v.level) ? (v.level as any[]).includes(params.level!) : (v.level === params.level));
    return new Promise(resolve => setTimeout(() => resolve(list), 300));
  }
  return apiClient.get('/vocabularies', { params });
};

export const fetchVocabularyById = (id: string): Promise<Vocabulary> => {
  if (USE_MOCK_API) {
    const v = mockVocabularies.find(x => x.id === id)!;
    return new Promise(resolve => setTimeout(() => resolve(v), 200));
  }
  return apiClient.get(`/vocabularies/${id}`);
};

export const createVocabulary = (payload: Partial<Vocabulary>): Promise<Vocabulary> => {
  if (USE_MOCK_API) {
    const v: Vocabulary = {
      id: `v${Date.now()}`,
      // accept word_types array or single word_type
  word_types: Array.isArray(payload.word_types) ? payload.word_types as any : ((payload as any).word_type ? [(payload as any).word_type as string] : ['Danh từ']),
      hanzi: payload.hanzi || '',
      pinyin: payload.pinyin || '',
      meaning: payload.meaning || '',
      notes: payload.notes,
      // level now is string[] in entities; accept array or comma-separated string
      level: Array.isArray(payload.level) ? payload.level as any : (typeof payload.level === 'string' ? (payload.level ? (payload.level as string).split(',').map(s=>s.trim()) : ['HSK1']) : ['HSK1']),
      image_url: payload.image_url,
    };
    mockVocabularies.push(v);
    return new Promise(resolve => setTimeout(() => resolve(v), 300));
  }
  return apiClient.post('/vocabularies', payload);
};

export const updateVocabulary = (id: string, payload: Partial<Vocabulary>): Promise<Vocabulary> => {
  if (USE_MOCK_API) {
    // normalize incoming word_types/word_type
    const normalized = { ...payload } as any;
  if ((payload as any).word_type && !payload.word_types) normalized.word_types = [(payload as any).word_type as any];
    mockVocabularies = mockVocabularies.map(v => (v.id === id ? { ...v, ...normalized } : v));
    return new Promise(resolve => setTimeout(() => resolve(mockVocabularies.find(v => v.id === id)!), 300));
  }
  return apiClient.put(`/vocabularies/${id}`, payload);
};

export const softDeleteVocabulary = (id: string, fromNotebookId?: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
  mockVocabularies = mockVocabularies.map(v => (v.id === id ? ({ ...v, deleted_at: new Date().toISOString(), ...( { deleted_from: (fromNotebookId || (v as any).deleted_from) } as any) }) as any : v));
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Soft deleted' }), 300));
  }
  return apiClient.delete(`/vocabularies/${id}`);
};

export const restoreVocabulary = async (id: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    // find vocab
    const v = mockVocabularies.find(x => x.id === id);
    if (v) {
      // if it was deleted from a notebook, re-add it
      const from = (v as any).deleted_from as string | undefined;
      mockVocabularies = mockVocabularies.map(x => (x.id === id ? { ...x, deleted_at: undefined, deleted_from: undefined } : x));
      if (from) {
        // re-add to notebook using notebooks API helper
        try { await addItemsToNotebook(from, [id]); } catch (_e) { /* ignore in mock */ }
      }
    }
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Restored' }), 300));
  }
  return apiClient.post(`/vocabularies/${id}/restore`);
};

export const hardDeleteVocabulary = (id: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    mockVocabularies = mockVocabularies.filter(v => v.id !== id);
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Hard deleted' }), 300));
  }
  return apiClient.delete(`/vocabularies/${id}/hard`);
};

// Pronunciation / audio stub - backend not implemented yet, provide a mock promise
export const playPronunciation = (id: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    // no-op for now, resolve quickly
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Not implemented (mock)' }), 150));
  }
  return apiClient.post(`/vocabularies/${id}/pronounce`);
};

export default {};
