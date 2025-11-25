
import React, { useState, useEffect } from 'react';
import type { User, Violation } from '../../../types';
import Modal from '../../../components/Modal';
import BanUserForm from './forms/BanUserForm';
import UnbanUserForm from './forms/UnbanUserForm';
import { useAppData } from '../../../contexts/appData/context';
import FileInput from '../../tests/create/components/shared/FileInput';

interface FormData {
    logReason: string;
    ruleIds: string[];
    resolution: string;
    severity: Violation['severity'];
}

interface UserActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalContent: { type: string | null; title: string; data?: any };
    user: User;
    editableUser: User | null;
    setEditableUser: React.Dispatch<React.SetStateAction<User | null>>;
    onConfirm: (action: string, data?: any) => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
    isOpen,
    onClose,
    modalContent,
    user,
    editableUser,
    setEditableUser,
    onConfirm,
}) => {
    const { communityRules } = useAppData();
    const [formData, setFormData] = useState<FormData>({
        logReason: '',
        ruleIds: [],
        resolution: '',
        severity: 'high', // Mặc định mức độ cấm là cao
    });

    useEffect(() => {
        // Reset form data khi modal mở
        if (isOpen) {
            if (modalContent.type === 'ban-user') {
                setFormData({
                    logReason: '',
                    ruleIds: [],
                    resolution: '',
                    severity: 'high',
                });
            } else if (modalContent.type === 'unban-user') {
                setFormData({
                    logReason: '',
                    ruleIds: [],
                    resolution: '',
                    severity: 'low', // Không sử dụng nhưng reset cho nhất quán
                });
            }
        }
    }, [isOpen, modalContent.type]);

    const handleFormChange = (updatedData: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updatedData }));
    };

    const renderContent = () => {
        if (!editableUser) return null;

        switch (modalContent.type) {
            case 'edit-info': {
                const { isViewingSelf, isAdminOrSuperAdmin } = modalContent.data || {};
                const canEditExtended = isViewingSelf && isAdminOrSuperAdmin;
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Tên hiển thị</label>
                            <input type="text" value={editableUser.name} onChange={(e) => setEditableUser({ ...editableUser, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={editableUser.email || ''} onChange={(e) => setEditableUser(prev => prev ? { ...prev, email: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50" />
                        </div>
                        {canEditExtended && (
                            <>
                                <div>
                                    <FileInput
                                        id="user-avatar-upload"
                                        label="Ảnh đại diện"
                                        value={editableUser.avatar_url || null}
                                        onFileChange={(url) => setEditableUser(prev => prev ? { ...prev, avatar_url: url || undefined } : null)}
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Trình độ HSK</label>
                                    <select value={editableUser.level} onChange={(e) => setEditableUser(prev => prev ? { ...prev, level: e.target.value as User['level'] } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50">
                                        <option value="1">Cấp 1</option>
                                        <option value="2">Cấp 2</option>
                                        <option value="3">Cấp 3</option>
                                        <option value="4">Cấp 4</option>
                                        <option value="5">Cấp 5</option>
                                        <option value="6">Cấp 6</option>
                                        <option value="7-9">Cấp 7-9</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ngôn ngữ</label>
                                    <select value={editableUser.language} onChange={(e) => setEditableUser(prev => prev ? { ...prev, language: e.target.value as User['language'] } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50">
                                        <option value="Tiếng Việt">Tiếng Việt</option>
                                        <option value="Tiếng Anh">Tiếng Anh</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                );
            }
            case 'change-role': {
                const isViewingSelf = !!modalContent.data?.isViewingSelf;
                const isDisabled = isViewingSelf; // Super Admin tự xem chính mình: không cho phép đổi
                return (
                    <div>
                        <p className="mb-4">Chọn vai trò mới cho <span className="font-semibold">{user.name}</span>.</p>
                        <select
                            value={editableUser.role}
                            onChange={(e) => setEditableUser(prev => prev ? { ...prev, role: e.target.value as User['role'] } : null)}
                            disabled={isDisabled}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Chỉ có thể có một Super Admin. Không thể chỉ định vai trò này cho người khác.</p>
                        {isDisabled && (
                            <p className="text-xs text-red-600 mt-1">Super Admin không thể thay đổi vai trò của chính mình.</p>
                        )}
                    </div>
                );
            }
            case 'ban-user':
                return <BanUserForm data={formData} onChange={handleFormChange} rules={communityRules} />;
            case 'unban-user':
                return <UnbanUserForm data={formData} onChange={handleFormChange} />;
            case 'reset-quota':
                return <p>Bạn có chắc muốn đặt lại quota <span className="font-semibold">{modalContent.data.feature}</span> về 0 cho người dùng này?</p>;
            default:
                return <p>Bạn có chắc chắn muốn thực hiện hành động này không?</p>;
        }
    };

    const renderFooter = () => {
        let isConfirmDisabled = false;
        if (modalContent.type === 'ban-user') {
            isConfirmDisabled = !formData.logReason.trim() || formData.ruleIds.length === 0;
        } else if (modalContent.type === 'unban-user') {
            isConfirmDisabled = !formData.logReason.trim();
        }

        const confirmButtonClass = modalContent.type === 'delete-user' || modalContent.type === 'ban-user'
            ? "bg-red-600 hover:bg-red-700"
            : "bg-primary-600 hover:bg-primary-700";
        
        const actionType = modalContent.type;
        const actionData = ['ban-user', 'unban-user'].includes(actionType!) ? formData : (['edit-info', 'change-role'].includes(actionType!) ? editableUser : modalContent.data);

        return (
            <div className="space-x-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                <button 
                    onClick={() => onConfirm(actionType!, actionData)} 
                    disabled={isConfirmDisabled}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmButtonClass} disabled:opacity-50`}
                >
                    Xác nhận
                </button>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalContent.title} footer={renderFooter()}>
            {renderContent()}
        </Modal>
    );
};

export default UserActionModal;