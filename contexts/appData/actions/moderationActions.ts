// contexts/appData/actions/moderationActions.ts
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Violation, ViolationRule, ModerationLog } from '../../../types';
import type { AddViolationPayload, AddModerationLogPayload } from '../types';
import { cacheService } from '../../../services/cacheService';

interface UseModerationActionsProps {
    setViolationsData: React.Dispatch<React.SetStateAction<Omit<Violation, 'rules' | 'user' | 'targetContent'>[]>>;
    setViolationRules: React.Dispatch<React.SetStateAction<ViolationRule[]>>;
    setModerationLogs: React.Dispatch<React.SetStateAction<ModerationLog[]>>;
    addAdminLog: (payload: { action_type: string, target_id?: string, description: string }) => void;
}

export const useModerationActions = ({ setViolationsData, setViolationRules, setModerationLogs, addAdminLog }: UseModerationActionsProps) => {

    const addViolation = useCallback((payload: AddViolationPayload) => {
        const newViolationId = uuidv4();
        const newViolation: Omit<Violation, 'rules' | 'user' | 'targetContent'> = {
            id: newViolationId,
            user_id: payload.user_id,
            target_type: payload.target_type,
            target_id: payload.target_id,
            severity: payload.severity,
            detected_by: payload.detected_by,
            handled: true,
            created_at: new Date().toISOString(),
            resolved_at: new Date().toISOString(),
            resolution: payload.resolution,
        };

        setViolationsData(prev => [newViolation, ...prev]);

        const newRules: ViolationRule[] = payload.ruleIds.map(ruleId => ({
            id: uuidv4(),
            violation_id: newViolationId,
            rule_id: ruleId,
        }));
        setViolationRules(prev => [...prev, ...newRules]);
        
        // Invalidate cache khi thêm violation
        cacheService.invalidateViolations();
    }, [setViolationsData, setViolationRules]);
    
    const removeViolationByTarget = useCallback((targetType: 'post' | 'comment' | 'user', targetId: string) => {
        let violationIdToRemove: string | undefined;

        setViolationsData(prev => {
            const violationToRemove = prev.find(v => v.target_type === targetType && v.target_id === targetId);
            violationIdToRemove = violationToRemove?.id;
            return prev.filter(v => !(v.target_type === targetType && v.target_id === targetId));
        });

        if (violationIdToRemove) {
            setViolationRules(prev => prev.filter(vr => vr.violation_id !== violationIdToRemove));
        }

        // Invalidate cache khi xóa violation
        cacheService.invalidateViolations();
    }, [setViolationsData, setViolationRules]);

    const addModerationLog = useCallback((payload: AddModerationLogPayload) => {
        const newLog: ModerationLog = {
            id: uuidv4(),
            ...payload,
            created_at: new Date().toISOString(),
        };
        setModerationLogs(prev => [newLog, ...prev]);
        addAdminLog({
            action_type: payload.action === 'remove' ? 'REMOVE_CONTENT' : 'RESTORE_CONTENT',
            target_id: payload.target_id,
            description: `${payload.action === 'remove' ? 'Gỡ' : 'Khôi phục'} ${payload.target_type} với lý do: ${payload.reason}`
        });
        
        // Invalidate cache khi thêm moderation log
        cacheService.invalidateViolations();
    }, [setModerationLogs, addAdminLog]);

    return { addViolation, removeViolationByTarget, addModerationLog };
};
