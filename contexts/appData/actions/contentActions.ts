// contexts/appData/actions/contentActions.ts
import { useCallback } from 'react';
import { Notebook, Vocabulary } from '../../../types';
import * as api from '../../../pages/content/api';
import type { AddAdminLogPayload } from '../types';

interface UseContentActionsProps {
  setNotebooks: React.Dispatch<React.SetStateAction<Notebook[]>>;
  setVocabularies: React.Dispatch<React.SetStateAction<Vocabulary[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useContentActions = ({ setNotebooks, setVocabularies, addAdminLog }: UseContentActionsProps) => {

  // --- Notebooks ---
  const createNotebook = useCallback(async (payload: api.NotebookPayload) => {
    const newNotebook = await api.createNotebook(payload);
    setNotebooks(prev => [newNotebook, ...prev]);
    addAdminLog({ action_type: 'CREATE_NOTEBOOK', target_id: newNotebook.id, description: `Tạo sổ tay mới: ${newNotebook.name}` });
  }, [setNotebooks, addAdminLog]);

  const updateNotebook = useCallback(async (id: string, payload: Partial<api.NotebookPayload>) => {
    const updated = await api.updateNotebook(id, payload);
    setNotebooks(prev => prev.map(n => n.id === id ? updated : n));
    addAdminLog({ action_type: 'UPDATE_NOTEBOOK', target_id: id, description: `Cập nhật sổ tay: ${updated.name}` });
  }, [setNotebooks, addAdminLog]);
  
  const deleteNotebooks = useCallback(async (ids: string[]) => {
    await api.deleteNotebooks(ids);
    setNotebooks(prev => prev.filter(n => !ids.includes(n.id)));
    addAdminLog({ action_type: 'BULK_DELETE_NOTEBOOKS', description: `Xóa vĩnh viễn ${ids.length} sổ tay.` });
  }, [setNotebooks, addAdminLog]);

  const bulkUpdateNotebookStatus = useCallback(async (ids: string[], status: 'published' | 'draft') => {
      await api.bulkUpdateNotebookStatus(ids, status);
      setNotebooks(prev => prev.map(n => ids.includes(n.id) ? { ...n, status } : n));
      addAdminLog({ action_type: 'BULK_UPDATE_NOTEBOOK_STATUS', description: `Cập nhật trạng thái của ${ids.length} sổ tay thành: ${status}` });
  }, [setNotebooks, addAdminLog]);


  // --- Vocabularies ---
  const createOrUpdateVocabs = useCallback(async (payloads: Partial<Vocabulary>[]) => {
    const results = await api.createOrUpdateVocabs(payloads);
    // Logic to merge results into state
    setVocabularies(prev => {
        const updatedIds = new Set(results.map(r => r.id));
        const oldVocabs = prev.filter(v => !updatedIds.has(v.id));
        return [...results, ...oldVocabs];
    });
    const createdCount = payloads.filter(p => !p.id).length;
    const updatedCount = payloads.length - createdCount;
    addAdminLog({ action_type: 'BULK_UPSERT_VOCABS', description: `Tạo ${createdCount} và cập nhật ${updatedCount} từ vựng.` });
  }, [setVocabularies, addAdminLog]);

  const deleteVocabularies = useCallback(async (ids: string[]) => {
    await api.deleteVocabularies(ids);
    setVocabularies(prev => prev.filter(v => !ids.includes(v.id)));
    addAdminLog({ action_type: 'BULK_DELETE_VOCABS', description: `Xóa vĩnh viễn ${ids.length} từ vựng.` });
  }, [setVocabularies, addAdminLog]);


  // --- Notebook <-> Vocabularies ---
  const addVocabsToNotebook = useCallback(async (notebookId: string, vocabIds: string[]) => {
    const { addedCount } = await api.addVocabsToNotebook(notebookId, vocabIds);
    // Tải lại state sổ tay để cập nhật vocab_count
    const notebookRes = await api.fetchNotebooks({ limit: 1000 });
    setNotebooks(notebookRes.data);
    addAdminLog({ action_type: 'ADD_VOCABS_TO_NOTEBOOK', target_id: notebookId, description: `Thêm ${addedCount} từ vựng vào sổ tay.` });
  }, [setNotebooks, addAdminLog]);

  const removeVocabsFromNotebook = useCallback(async (notebookId: string, vocabIds: string[]) => {
    await api.removeVocabsFromNotebook(notebookId, vocabIds);
    // Tải lại state sổ tay để cập nhật vocab_count
    const notebookRes = await api.fetchNotebooks({ limit: 1000 });
    setNotebooks(notebookRes.data);
    addAdminLog({ action_type: 'REMOVE_VOCABS_FROM_NOTEBOOK', target_id: notebookId, description: `Xóa ${vocabIds.length} từ vựng khỏi sổ tay.` });
  }, [setNotebooks, addAdminLog]);

  return {
    createNotebook,
    updateNotebook,
    deleteNotebooks,
    bulkUpdateNotebookStatus,
    createOrUpdateVocabs,
    deleteVocabularies,
    addVocabsToNotebook,
    removeVocabsFromNotebook,
  };
};