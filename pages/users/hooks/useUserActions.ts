import { useCallback } from 'react';
import { User } from '../../../types';
import { useAppData } from '../../../contexts/appData/context';
import { updateUser, resetUserQuota, UserDetailData, deleteUser, resetUserPassword } from '../userApi';

// Định nghĩa props cho custom hook
interface UseUserActionsProps {
    user: User | null;
    currentUser: User | null;
    editableUser: User | null;
    setData: React.Dispatch<React.SetStateAction<UserDetailData | null>>;
    loadData: () => Promise<void>;
    setNotification: (message: string) => void;
    closeModal: () => void;
}

/**
 * Custom hook để quản lý logic xử lý các hành động của admin trên trang chi tiết người dùng.
 * Tách biệt logic khỏi component `UserDetail` để làm cho component chính gọn gàng hơn.
 */
export const useUserActions = ({
    user,
    currentUser,
    editableUser,
    setData,
    loadData,
    setNotification,
    closeModal,
}: UseUserActionsProps) => {
    const { updateUser: updateContextUser, addViolation, removeViolationByTarget, addModerationLog, communityRules, addAdminLog } = useAppData();

    const handleAction = useCallback(async (action: string, data?: any) => {
        if (!user || !currentUser) return;

        let message = '';
        try {
            switch (action) {
                case 'ban-user': {
                    const { logReason, ruleIds, resolution, severity } = data;
                    const updatedUser = await updateUser(user.id, { is_active: false });
                    setData(d => d ? { ...d, user: updatedUser } : null);
                    updateContextUser(user.id, { is_active: false });
                    
                    addViolation({
                        user_id: user.id,
                        target_type: 'user',
                        target_id: user.id,
                        ruleIds,
                        severity,
                        resolution: resolution || `Tài khoản bị cấm. Lý do: ${logReason}`,
                        detected_by: currentUser.role === 'super admin' ? 'super admin' : 'admin'
                    });

                    addModerationLog({ target_type: 'user', target_id: user.id, action: 'remove', reason: logReason, performed_by: currentUser.id });
                    addAdminLog({ action_type: 'BAN_USER', target_id: user.id, description: `Cấm người dùng: ${user.name}. Lý do: ${logReason}` });
                    
                    message = `Đã cấm người dùng ${user.name}`;
                    break;
                }
                case 'unban-user': {
                     const { logReason } = data;
                     const updatedUser = await updateUser(user.id, { is_active: true });
                     setData(d => d ? { ...d, user: updatedUser } : null);
                     updateContextUser(user.id, { is_active: true });
                     
                     removeViolationByTarget('user', user.id);
                     addModerationLog({ target_type: 'user', target_id: user.id, action: 'restore', reason: logReason, performed_by: currentUser.id });
                     addAdminLog({ action_type: 'UNBAN_USER', target_id: user.id, description: `Bỏ cấm người dùng: ${user.name}. Lý do: ${logReason}` });

                    message = `Đã bỏ cấm người dùng ${user.name}`;
                    break;
                }
                case 'edit-info': {
                    if (!editableUser) return;
                    const updatedUser = await updateUser(user.id, editableUser);
                    setData(d => d ? { ...d, user: updatedUser } : null);
                    updateContextUser(user.id, editableUser);
                    addAdminLog({ action_type: 'UPDATE_USER_INFO', target_id: user.id, description: `Cập nhật thông tin cho ${user.name}` });
                    message = `Đã cập nhật thông tin cho ${user.name}`;
                    break;
                }
                case 'change-role': {
                    if (!editableUser) return;
                    const updatedUser = await updateUser(user.id, { role: editableUser.role });
                    setData(d => d ? { ...d, user: updatedUser } : null);
                    updateContextUser(user.id, { role: editableUser.role });
                    addAdminLog({ action_type: 'CHANGE_USER_ROLE', target_id: user.id, description: `Thay đổi vai trò của ${user.name} thành ${editableUser.role}` });
                    message = `Đã thay đổi vai trò của ${user.name} thành ${editableUser.role}`;
                    break;
                }
                case 'reset-password':
                    const result = await resetUserPassword(user.id);
                    message = result.message;
                    addAdminLog({ action_type: 'RESET_USER_PASSWORD', target_id: user.id, description: `Yêu cầu đặt lại mật khẩu cho ${user.name}` });
                    break;
                case 'delete-user':
                    await deleteUser(user.id);
                    addAdminLog({ action_type: 'DELETE_USER', target_id: user.id, description: `Xóa vĩnh viễn người dùng ${user.name}` });
                    message = `Đã xoá người dùng ${user.name}`;
                    // Cần điều hướng sau khi xóa, component cha sẽ xử lý
                    break;
                case 'reset-quota':
                    await resetUserQuota(user.id, data.feature);
                    await loadData();
                    message = `Đã reset quota ${data.feature} cho ${user.name}`;
                    // Ghi log đã được chuyển vào action của context
                    break;
            }
            setNotification(message);
        } catch (err) {
            setNotification(`Lỗi: ${err instanceof Error ? err.message : 'Hành động thất bại'}`);
        }
        closeModal();
    }, [user, currentUser, editableUser, setData, updateContextUser, addViolation, removeViolationByTarget, addModerationLog, communityRules, addAdminLog, loadData, setNotification, closeModal]);

    return handleAction;
}
