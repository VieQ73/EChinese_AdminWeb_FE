import React, { useState } from 'react';
import type { User } from '../../../types/entities';
import { Button } from '../../../components/ui/button';
import { Eye, Edit, Lock, Unlock, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './DropdownMenu';
import { cn } from '../../../lib/utils';
import { deactivateUser, activateUser, deleteUser } from '../userApi';
import type { AuthenticatedUser } from '../../../App';

/**
 * @fileoverview UserListTable component - Bảng hiển thị danh sách người dùng
 * @description Hiển thị thông tin người dùng trong một bảng, cung cấp các hành động như xem, sửa, khóa/mở khóa, và xóa.
 * Hỗ trợ sắp xếp và tích hợp DropdownMenu cho các hành động.
 * Áp dụng phân quyền dựa trên vai trò của người dùng hiện tại.
 */

interface UserListTableProps {
  users: User[];
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onRefresh: () => void;
  currentUser: AuthenticatedUser | null; // Thông tin user hiện tại để phân quyền
}

const UserListTable: React.FC<UserListTableProps> = ({ users, onViewUser, onEditUser, onRefresh, currentUser }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Helper để kiểm tra quyền của currentUser
  const isSuperAdmin = currentUser?.role === 'super admin';
  const isAdmin = currentUser?.role === 'admin';

  // --- Kiểm tra quyền cho các hành động ---

  // Quyền chỉnh sửa thông tin (ngoại trừ role)
  const canEditInfo = (targetUser: User): boolean => {
    if (!currentUser) return false;
    // Super Admin có thể sửa tất cả trừ super admin khác
    if (isSuperAdmin) {
      return targetUser.role !== 'super admin' || currentUser.id === targetUser.id;
    }
    // Admin thường chỉ có thể sửa thông tin của user thường (không phải admin/super admin)
    if (isAdmin) {
      return targetUser.role === 'user';
    }
    return false;
  };

  // Quyền khóa/mở khóa
  const canLockUnlock = (targetUser: User): boolean => {
    if (!currentUser || (!isSuperAdmin && !isAdmin)) return false; // Chỉ admin/super admin
    if (targetUser.role === 'super admin') return false; // Không thể khóa/mở khóa super admin
    if (targetUser.id === currentUser.id) return false; // Không thể tự khóa/mở khóa chính mình
    return true;
  };

  // Quyền xóa vĩnh viễn
  const canDelete = (targetUser: User): boolean => {
    if (!isSuperAdmin) return false; // Chỉ super admin
    if (targetUser.role === 'super admin') return false; // Không thể xóa super admin khác hoặc chính mình
    return true;
  };

  const handleDeactivate = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !canLockUnlock(targetUser)) {
        alert("Bạn không có quyền thực hiện thao tác này.");
        return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn khóa người dùng ${targetUser.name || targetUser.username} không?`)) {
      setLoadingAction(userId + '_deactivate');
      try {
        await deactivateUser(userId);
        onRefresh();
      } catch (error: any) {
        console.error("Lỗi khi khóa người dùng:", error);
        alert("Không thể khóa người dùng: " + (error.message || "Lỗi không xác định."));
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleActivate = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !canLockUnlock(targetUser)) {
        alert("Bạn không có quyền thực hiện thao tác này.");
        return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn mở khóa người dùng ${targetUser.name || targetUser.username} không?`)) {
      setLoadingAction(userId + '_activate');
      try {
        await activateUser(userId);
        onRefresh();
      } catch (error: any) {
        console.error("Lỗi khi mở khóa người dùng:", error);
        alert("Không thể mở khóa người dùng: " + (error.message || "Lỗi không xác định."));
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleDelete = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !canDelete(targetUser)) {
        alert("Bạn không có quyền thực hiện thao tác này.");
        return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng ${targetUser.name || targetUser.username} không? Hành động này không thể hoàn tác.`)) {
      setLoadingAction(userId + '_delete');
      try {
        await deleteUser(userId);
        onRefresh();
      } catch (error: any) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Không thể xóa người dùng: " + (error.message || "Lỗi không xác định."));
      } finally {
        setLoadingAction(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm Cộng đồng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar_url || '/default-avatar.png'}
                          alt={user.name || user.username || 'Người dùng'}
                        />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                            {user.name ? user.name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'N/A')}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || user.username}</div>
                        <div className="text-xs text-gray-500">@{user.username || user.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        user.role === 'super admin' && 'bg-purple-100 text-purple-800',
                        user.role === 'admin' && 'bg-blue-100 text-blue-800',
                        user.role === 'user' && 'bg-green-100 text-green-800',
                    )}>
                      {user.role === 'super admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.community_points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                    )}>
                      {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More actions">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewUser(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {canEditInfo(user) && (
                                <DropdownMenuItem onClick={() => onEditUser(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                            )}
                            {canLockUnlock(user) && (user.is_active ? (
                                <DropdownMenuItem onClick={() => handleDeactivate(user.id)} disabled={loadingAction === user.id + '_deactivate'}>
                                    {loadingAction === user.id + '_deactivate' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                    Khóa người dùng
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handleActivate(user.id)} disabled={loadingAction === user.id + '_activate'}>
                                    {loadingAction === user.id + '_activate' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                                    Mở khóa người dùng
                                </DropdownMenuItem>
                            ))}
                            {canDelete(user) && (
                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 hover:bg-red-50" disabled={loadingAction === user.id + '_delete'}>
                                    {loadingAction === user.id + '_delete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Xóa vĩnh viễn
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { UserListTable };