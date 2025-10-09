import React, { useState, useEffect } from 'react';
import { Post, CommentWithUser, Violation } from '../../../../types';
import Modal from '../../../../components/Modal';
import RemoveActionForm from '../../../moderation/components/details/forms/RemoveActionForm';
import RestoreActionForm from '../../../moderation/components/details/forms/RestoreActionForm';
import { useAppData } from '../../../../contexts/AppDataContext';

type ModerationAction = {
    action: 'remove' | 'restore';
    type: 'post' | 'comment';
    item: Post | CommentWithUser;
    isSelfAction: boolean;
};

interface FormData {
    logReason: string;
    ruleIds: string[];
    resolution: string;
    severity: Violation['severity'];
}

interface ModerationActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionData: ModerationAction | null;
    onConfirm: (data: Partial<FormData>) => void; // Allow partial for restore action
}

const ModerationActionModal: React.FC<ModerationActionModalProps> = ({ isOpen, onClose, actionData, onConfirm }) => {
    const { communityRules } = useAppData();
    const [formData, setFormData] = useState<FormData>({
        logReason: '',
        ruleIds: [],
        resolution: '',
        severity: 'low',
    });

    useEffect(() => {
        if (isOpen && actionData) {
            const defaultSeverity = actionData.isSelfAction ? 'low' : 'medium';
            const defaultLogReason = actionData.isSelfAction 
                ? (actionData.action === 'remove' ? 'Tự gỡ' : 'Tự khôi phục')
                : '';

            setFormData({
                logReason: defaultLogReason,
                ruleIds: [],
                resolution: '',
                severity: defaultSeverity,
            });
        }
    }, [isOpen, actionData]);

    if (!actionData) return null;

    const { action, type, isSelfAction } = actionData;
    
    const actionText = action === 'remove' ? 'gỡ' : 'khôi phục';
    const typeText = type === 'post' ? 'bài viết' : 'bình luận';

    const getTitle = () => {
        if (isSelfAction) return `Xác nhận ${actionText} ${typeText}`;
        return `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${typeText}`;
    };

    const handleFormChange = (updatedData: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updatedData }));
    };

    const handleConfirm = () => {
        onConfirm(formData);
    };
    
    const isConfirmDisabled = action === 'remove' && !isSelfAction
        ? !formData.logReason.trim() || formData.ruleIds.length === 0
        : !formData.logReason.trim();

    const buttonBgColor = action === 'remove' ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300' : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button onClick={handleConfirm} disabled={isConfirmDisabled} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${buttonBgColor}`}>
                        Xác nhận {actionText}
                    </button>
                </div>
            }
        >
            {action === 'remove' ? (
                <RemoveActionForm
                    data={formData}
                    onChange={handleFormChange}
                    rules={communityRules}
                    isSelfAction={isSelfAction}
                />
            ) : (
                <RestoreActionForm
                    data={formData}
                    onChange={handleFormChange}
                    isSelfAction={isSelfAction}
                />
            )}
        </Modal>
    );
};

export default ModerationActionModal;