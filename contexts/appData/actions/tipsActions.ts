// contexts/appData/actions/tipsActions.ts
import { useCallback } from 'react';
import { Tip } from '../../../types';
import * as api from '../../../pages/tips/tipApi';
import type { AddAdminLogPayload } from '../types';

interface UseTipsActionsProps {
  setTips: React.Dispatch<React.SetStateAction<Tip[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useTipsActions = ({ setTips, addAdminLog }: UseTipsActionsProps) => {

  const createTip = useCallback(async (payload: api.TipPayload) => {
    const newTip = await api.createTip(payload);
    setTips(prev => [newTip, ...prev]);
    addAdminLog({ action_type: 'CREATE_TIP', target_id: newTip.id, description: `Tạo mẹo mới: ${newTip.topic}` });
  }, [setTips, addAdminLog]);

  const updateTip = useCallback(async (id: string, payload: Partial<api.TipPayload>) => {
    const updated = await api.updateTip(id, payload);
    setTips(prev => prev.map(t => t.id === id ? updated : t));
    
    // Check if it's a pin/unpin action
    if (payload.is_pinned !== undefined) {
        addAdminLog({ action_type: 'UPDATE_TIP_PIN_STATUS', target_id: id, description: `${payload.is_pinned ? 'Ghim' : 'Bỏ ghim'} mẹo: ${updated.topic}` });
    } else {
        addAdminLog({ action_type: 'UPDATE_TIP', target_id: id, description: `Cập nhật mẹo: ${updated.topic}` });
    }
  }, [setTips, addAdminLog]);

  const deleteTip = useCallback(async (id: string) => {
    const tipToDelete = (await api.fetchTips()).data.find(t => t.id === id);
    await api.deleteTip(id);
    setTips(prev => prev.filter(t => t.id !== id));
    if (tipToDelete) {
        addAdminLog({ action_type: 'DELETE_TIP', target_id: id, description: `Xóa mẹo: ${tipToDelete.topic}` });
    }
  }, [setTips, addAdminLog]);

  const bulkUploadTips = useCallback(async (tips: api.TipPayload[]) => {
      const result = await api.bulkUploadTips(tips);
      setTips(prev => [...result.created_tips, ...prev]);
      addAdminLog({ action_type: 'BULK_UPLOAD_TIPS', description: `Tải lên hàng loạt ${result.success_count} mẹo mới.` });
  }, [setTips, addAdminLog]);

  return { createTip, updateTip, deleteTip, bulkUploadTips };
};