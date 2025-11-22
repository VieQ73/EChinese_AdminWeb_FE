// contexts/appData/actions/logActions.ts
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AdminLog, User } from '../../../types';
import type { AddAdminLogPayload } from '../types';

interface UseLogActionsProps {
  setAdminLogs: React.Dispatch<React.SetStateAction<AdminLog[]>>;
  currentUser: User | null;
}

/**
 * Hook chứa logic để tạo và thêm các bản ghi log admin mới.
 * @param setAdminLogs - Hàm setState để cập nhật danh sách logs.
 * @param currentUser - Thông tin admin đang đăng nhập.
 * @returns - Hàm `addAdminLog` để sử dụng trong Provider.
 */
export const useLogActions = ({ setAdminLogs, currentUser }: UseLogActionsProps) => {
  const addAdminLog = useCallback((payload: AddAdminLogPayload) => {
    // Không ghi log nếu không có admin đăng nhập (ví dụ: trong quá trình khởi tạo)
    if (!currentUser) return;
    
    const newLog: AdminLog = {
      id: uuidv4(),
      user_id: currentUser.id,
      adminName: currentUser.name,
      ...payload,
      created_at: new Date().toISOString(),
    };

    // Thêm log mới vào đầu danh sách để hiển thị mới nhất trước
    // Đảm bảo prevLogs luôn là array để tránh lỗi "not iterable"
    setAdminLogs(prevLogs => {
      const safePrevLogs = Array.isArray(prevLogs) ? prevLogs : [];
      return [newLog, ...safePrevLogs];
    });
  }, [currentUser, setAdminLogs]);

  return { addAdminLog };
};
