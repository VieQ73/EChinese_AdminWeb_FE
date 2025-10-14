// contexts/appData/actions/ruleActions.ts
import { useCallback } from 'react';
import { CommunityRule } from '../../../types';
import * as api from '../../../pages/rules/api';
import type { AddAdminLogPayload } from '../types';

interface UseRuleActionsProps {
  setCommunityRules: React.Dispatch<React.SetStateAction<CommunityRule[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useRuleActions = ({ setCommunityRules, addAdminLog }: UseRuleActionsProps) => {

  const createRule = useCallback(async (payload: api.RulePayload) => {
    const newRule = await api.createRule(payload);
    setCommunityRules(prev => [newRule, ...prev]);
    addAdminLog({ action_type: 'CREATE_RULE', target_id: newRule.id, description: `Tạo quy tắc mới: ${newRule.title}` });
  }, [setCommunityRules, addAdminLog]);

  const updateRule = useCallback(async (id: string, payload: Partial<api.RulePayload>) => {
    const updatedRule = await api.updateRule(id, payload);
    setCommunityRules(prev => prev.map(r => (r.id === id ? updatedRule : r)));
    addAdminLog({ action_type: 'UPDATE_RULE', target_id: id, description: `Cập nhật quy tắc: ${updatedRule.title}` });
  }, [setCommunityRules, addAdminLog]);

  const deleteRule = useCallback(async (id: string) => {
    const ruleToDelete = await api.fetchRules({}).then(res => res.data.find(r => r.id === id));
    await api.deleteRule(id);
    setCommunityRules(prev => prev.filter(r => r.id !== id));
    if (ruleToDelete) {
        addAdminLog({ action_type: 'DELETE_RULE', target_id: id, description: `Xóa quy tắc: ${ruleToDelete.title}` });
    }
  }, [setCommunityRules, addAdminLog]);

  return { createRule, updateRule, deleteRule };
};
