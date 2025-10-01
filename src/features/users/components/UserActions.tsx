import type { User } from '../../../types/entities';
import { MoreHorizontal, Edit, Trash2, Lock, Unlock, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
// Sửa lại đường dẫn import để trỏ đến component cục bộ
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';

interface UserActionsProps {
  user: User;
  currentUser: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleActive: (user: User) => void;
}

export const UserActions = ({ user, currentUser, onView, onEdit, onDelete, onToggleActive }: UserActionsProps) => {
  // --- Logic Phân Quyền ---

  // 1. Quyền mở form chỉnh sửa. Logic chi tiết về trường nào được sửa sẽ nằm trong modal.
  const canEdit = (() => {
    if (currentUser.role === 'super admin') {
      // Super admin có thể sửa mọi người, trừ super admin khác
      return user.role !== 'super admin' || user.id === currentUser.id;
    }
    if (currentUser.role === 'admin') {
      // Admin chỉ có thể sửa user thường
      return user.role === 'user';
    }
    return false;
  })();

  // 2. Quyền khóa/mở khóa
  const canToggleActive = (() => {
    // Không ai có thể khóa super admin
    if (user.role === 'super admin') return false;
    // Không thể tự khóa chính mình
    if (user.id === currentUser.id) return false;
    // Super admin có thể khóa admin và user
    if (currentUser.role === 'super admin') return true;
    // Admin chỉ có thể khóa user
    if (currentUser.role === 'admin' && user.role === 'user') return true;
    return false;
  })();

  // 3. Quyền xóa
  const canDelete = (() => {
    // Chỉ super admin mới có quyền xóa
    if (currentUser.role !== 'super admin') return false;
    // Không thể xóa super admin
    if (user.role === 'super admin') return false;
    return true;
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(user)}>
          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user)} disabled={!canEdit}>
          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleActive(user)} disabled={!canToggleActive}>
          {user.is_active ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
          {user.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user.id)} disabled={!canDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Xóa người dùng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};