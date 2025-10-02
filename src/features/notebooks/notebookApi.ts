import { apiClient } from '../../services/apiClient';
import type { Notebook, UUID } from '../../types/entities';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Mock data
const mockNotebooks: Notebook[] = [
  {
    id: 'nb-1',
    user_id: null,
    name: 'HSK1 Basic',
    vocab_count: 20,
    created_at: new Date().toISOString(),
    options: { show_hanzi: true, show_pinyin: true },
    is_premium: false,
  },
  {
    id: 'nb-2',
    user_id: null,
    name: 'HSK3 Advanced',
    vocab_count: 120,
    created_at: new Date().toISOString(),
    options: { show_hanzi: true, show_pinyin: false },
    is_premium: true,
  },
  {
    id: 'nb-3',
    user_id: null,
    name: 'Common Verbs',
    vocab_count: 50,
    created_at: new Date().toISOString(),
    options: { show_hanzi: true, show_pinyin: true },
    is_premium: false,
  }
];

// Map notebook id => list of vocab ids
// Pre-populate nb-1 with some mock vocabularies (v1,v2,v3) so the UI shows data
const notebookItems: Record<string, string[]> = {
  'nb-1': ['v1','v2','v3'],
  'nb-2': [],
  'nb-3': [],
};

export const fetchNotebooks = (): Promise<Notebook[]> => {
  if (USE_MOCK_API) {
    // compute vocab_count from notebookItems mapping so UI shows correct counts
    const computed = [...mockNotebooks].map(nb => ({ ...nb, vocab_count: (notebookItems[nb.id] || []).length }));
    return new Promise(resolve => setTimeout(() => resolve(computed.sort((a,b)=>a.name.localeCompare(b.name))), 300));
  }
  return apiClient.get('/notebooks');
};

export const createNotebook = (payload: Partial<Notebook>): Promise<Notebook> => {
  if (USE_MOCK_API) {
    const nb: Notebook = {
      id: `nb-${Date.now()}`,
      user_id: payload.user_id ?? null,
      name: payload.name || `Notebook ${Date.now()}`,
      vocab_count: 0,
      created_at: new Date().toISOString(),
      options: payload.options || { show_hanzi: true, show_pinyin: true },
      is_premium: !!payload.is_premium,
    };
    mockNotebooks.push(nb);
    notebookItems[nb.id] = [];
    return new Promise(resolve => setTimeout(() => resolve(nb), 300));
  }
  return apiClient.post('/notebooks', payload);
};

export const getNotebookById = (id: string): Promise<Notebook & { items: { vocabulary_id: string }[] }> => {
  if (USE_MOCK_API) {
    const nb = mockNotebooks.find(n => n.id === id)!;
    // return items as objects { vocabulary_id } to match UI expectations
    const items = (notebookItems[id] || []).map(vId => ({ vocabulary_id: vId }));
    return new Promise(resolve => setTimeout(() => resolve({ ...(nb as Notebook), items }), 300));
  }
  return apiClient.get(`/notebooks/${id}`);
};

export const addItemsToNotebook = (notebookId: string, vocabIds: UUID[]): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    const list = notebookItems[notebookId] || [];
    vocabIds.forEach(id => { if (!list.includes(id)) list.push(id); });
    notebookItems[notebookId] = list;
    const nb = mockNotebooks.find(n => n.id === notebookId);
    if (nb) nb.vocab_count = notebookItems[notebookId].length;
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Added' }), 300));
  }
  return apiClient.post(`/notebooks/${notebookId}/items`, { vocab_ids: vocabIds });
};

export const removeItemsFromNotebook = (notebookId: string, vocabIds: UUID[]): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    let list = notebookItems[notebookId] || [];
    list = list.filter(id => !vocabIds.includes(id));
    notebookItems[notebookId] = list;
    const nb = mockNotebooks.find(n => n.id === notebookId);
    if (nb) nb.vocab_count = list.length;
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Removed' }), 300));
  }
  return apiClient.delete(`/notebooks/${notebookId}/items`, { data: { vocab_ids: vocabIds } });
};

/** [POST] Publish notebooks to mobile clients (admin action) */
export const publishNotebooks = (notebookIds: string[]): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    // In mock mode we simply pretend to mark them as published and return success
    return new Promise(resolve => setTimeout(() => resolve({ message: `Published ${notebookIds.length} notebooks (mock)` }), 400));
  }
  return apiClient.post('/admin/notebooks/publish', { notebook_ids: notebookIds });
};

/** [DELETE] Hard-delete notebooks (admin can delete): accept array of ids */
export const hardDeleteNotebooks = (notebookIds: string[]): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    // Remove from mock store and notebookItems
    notebookIds.forEach(id => {
      const idx = mockNotebooks.findIndex(n => n.id === id);
      if (idx >= 0) mockNotebooks.splice(idx, 1);
      delete notebookItems[id];
    });
    return new Promise(resolve => setTimeout(() => resolve({ message: `Deleted ${notebookIds.length} notebooks (mock)` }), 400));
  }
  return apiClient.delete('/admin/notebooks', { data: { notebook_ids: notebookIds } });
};

export default {};
