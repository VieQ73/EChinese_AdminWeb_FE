// pages/system/utils.ts
import React from 'react';
import { 
    PencilIcon, TrashIcon, CheckCircleIcon, PlusIcon, 
    RestoreIcon, KeyIcon, ShieldExclamationIcon, HistoryIcon, PublishIcon, UnpublishIcon, CopyIcon
} from '../../components/icons';

/**
 * Trả về thông tin icon và màu sắc dựa trên loại hành động log.
 * @param actionType - Chuỗi loại hành động (vd: 'CREATE_RULE', 'BAN_USER').
 * @returns - Một object chứa component Icon và class màu của Tailwind.
 */
export const getLogActionInfo = (actionType: string): { icon: React.FC<any>, color: string } => {
    switch(true) {
        // Create
        case actionType.startsWith('CREATE'): 
            return { icon: PlusIcon, color: 'text-green-600' };
        
        // Update / Edit / Change
        case actionType.startsWith('UPDATE'): 
        case actionType.startsWith('EDIT'):
        case actionType.startsWith('CHANGE'):
            return { icon: PencilIcon, color: 'text-blue-600' };

        // Delete / Remove
        case actionType.startsWith('DELETE'):
        case actionType.startsWith('REMOVE'):
            return { icon: TrashIcon, color: 'text-red-600' };

        // Ban / Unban
        case actionType.startsWith('BAN'): 
            return { icon: ShieldExclamationIcon, color: 'text-yellow-600' };
        case actionType.startsWith('UNBAN'):
            return { icon: RestoreIcon, color: 'text-teal-600' };
        
        // Restore
        case actionType.startsWith('RESTORE'):
            return { icon: RestoreIcon, color: 'text-green-600' };
        
        // Confirm / Process
        case actionType.startsWith('CONFIRM'):
        case actionType.startsWith('PROCESS'):
            return { icon: CheckCircleIcon, color: 'text-indigo-600' };

        case actionType.includes('PUBLISH'):
             return { icon: PublishIcon, color: 'text-sky-600' };
        case actionType.includes('UNPUBLISH'):
             return { icon: UnpublishIcon, color: 'text-slate-600' };
            
        // Other specific actions
        case actionType.includes('PASSWORD'):
        case actionType.includes('RESET'):
             return { icon: KeyIcon, color: 'text-purple-600' };
        case actionType.includes('COPY'):
             return { icon: CopyIcon, color: 'text-cyan-600' };
        
        // Default
        default: 
            return { icon: HistoryIcon, color: 'text-gray-500' };
    }
};
