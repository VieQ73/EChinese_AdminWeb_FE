import React, { useCallback } from 'react';
import { User } from '../../../types';
import { useAppData } from '../../../contexts/AppDataContext';
import { updateUser, resetUserQuota, UserDetailData } from '../userApi';

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
    const { updateUser: updateContextUser, updateUserUsage, addViolation, removeViolationByTarget, addModerationLog, communityRules } = useAppData();

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
                    
                    const ruleNames = communityRules.filter(rule => ruleIds.includes(rule.id)).map(rule => `"${rule.title}"`).join(', ');
                    const notificationMessage = `Tài khoản của bạn đã bị cấm do vi phạm quy tắc cộng đồng: ${ruleNames}. Bạn có thể khiếu nại quyết định này.`;
                    console.log(`[NOTIFICATION] Gửi tới người dùng ${user.name}: ${notificationMessage}`);
                    
                    message = `Đã cấm người dùng ${user.name}`;
                    break;
                }
                case 'unban-user': {
                     const { logReason } = data;
                     const updatedUser = await updateUser(user.id, { is_active: true });
                     setData(d => d ? { ...d, user: updatedUser } : null);
                     updateContextUser(user.id, { is_active: true });
                     
                     // Xóa vi phạm liên quan đến việc cấm tài khoản
                     removeViolationByTarget('user', user.id);
                     
                     addModerationLog({ target_type: 'user', target_id: user.id, action: 'restore', reason: logReason, performed_by: currentUser.id });

                     // Mô phỏng gửi thông báo cho người dùng
                     const notificationMessage = `Tài khoản của bạn đã được bỏ cấm. Lý do: ${logReason}.`;
                     console.log(`[NOTIFICATION] Gửi tới người dùng ${user.name}: ${notificationMessage}`);
                    
                    message = `Đã bỏ cấm người dùng ${user.name}`;
                    break;
                }
                case 'edit-info': {
                    if (!editableUser) return;
                    const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
                    const isViewingSelf = currentUser?.id === user?.id;
                    let updatedFields: Partial<User> = { name: editableUser.name, email: editableUser.email };

                    if (isViewingSelf && isAdminOrSuperAdmin) {
                        updatedFields = { ...updatedFields, avatar_url: editableUser.avatar_url, level: editableUser.level, language: editableUser.language };
                    }
                    const updatedUser = await updateUser(user.id, updatedFields);
                    setData(d => d ? { ...d, user: updatedUser } : null);
                    updateContextUser(user.id, updatedFields);
                    message = `Đã cập nhật thông tin cho ${user.name}`;
                    break;
                }
                case 'change-role': {
                    if (!editableUser) return;
                    const updatedUser = await updateUser(user.id, { role: editableUser.role });
                    setData(d => d ? { ...d, user: updatedUser } : null);
                    updateContextUser(user.id, { role: editableUser.role });
                    message = `Đã thay đổi vai trò của ${user.name} thành ${editableUser.role}`;
                    break;
                }
                case 'reset-password':
                    message = `Đã gửi email đặt lại mật khẩu cho ${user.name}`;
                    break;
                case 'delete-user':
                    message = `Đã xoá người dùng ${user.name} (giả lập)`;
                    break;
                case 'reset-quota':
                    await resetUserQuota(user.id, data.feature);
                    // Cập nhật context để đồng bộ với tab Monetization
                    updateUserUsage(user.id, data.feature, { daily_count: 0, last_reset: new Date().toISOString() });
                    await loadData();
                    message = `Đã reset quota ${data.feature} cho ${user.name}`;
                    break;
            }
            setNotification(message);
        } catch (err) {
            setNotification(`Lỗi: ${err instanceof Error ? err.message : 'Hành động thất bại'}`);
        }
        closeModal();
    }, [user, currentUser, editableUser, setData, updateContextUser, addViolation, removeViolationByTarget, addModerationLog, communityRules, loadData, setNotification, closeModal]);

    return handleAction;
};