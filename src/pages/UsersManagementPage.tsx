import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, deactivateUser, activateUser, deleteUser } from '../features/users/userApi';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/entities';
import type { PaginatedResponse } from '../types/api';
import { UserDetailModal } from '../features/users/components/UserDetailModal';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { UserFilter } from '../features/users/components/UserFilter';
import { UserListTable } from '../features/users/components/UserListTable';

// Component phân trang
const Pagination = ({ meta, onPageChange }: { meta: PaginatedResponse<any>['meta']; onPageChange: (page: number) => void }) => (
  <div className="flex items-center justify-between mt-4">
    <span className="text-sm text-gray-700">
      Hiển thị {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} trên {meta.total} kết quả
    </span>
    <div className="space-x-2">
      <Button onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}>Trước</Button>
      <Button onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}>Sau</Button>
    </div>
  </div>
);

export const UsersManagementPage = () => {
  const currentUser = useAuth();
  const [usersResponse, setUsersResponse] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho bộ lọc và tìm kiếm
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers(filters);
      setUsersResponse(response);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (user: User) => {
    if (!window.confirm(`Bạn có chắc muốn ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản "${user.name}"?`)) return;

    try {
      const action = user.is_active ? deactivateUser : activateUser;
      await action(user.id);
      // Tải lại danh sách để cập nhật UI
      loadUsers();
      alert(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Hành động này không thể hoàn tác. Bạn có chắc muốn xóa vĩnh viễn người dùng này?')) return;

    try {
      await deleteUser(userId);
      loadUsers();
      alert('Đã xóa người dùng thành công!');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!currentUser) return <div>Đang xác thực...</div>;

  return (
    <div className="p-0 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Quản lý Người dùng</h1>
        <p className="text-gray-500 mt-1">Tìm kiếm, lọc và thực hiện các hành động trên tài khoản người dùng.</p>
      </div>

      <UserFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRoleChange={(role) => setFilters(prev => ({ ...prev, role, page: 1 }))}
      />

      <UserListTable
        users={usersResponse?.data || []}
        currentUser={currentUser}
        onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onToggleActive={handleToggleActive}
      />

      {usersResponse && usersResponse.meta.total > 0 && (
        <Pagination meta={usersResponse.meta} onPageChange={handlePageChange} />
      )}

      {isModalOpen && (
        <UserDetailModal
          isOpen={isModalOpen}
          onClose={(refreshNeeded) => {
            setIsModalOpen(false);
            if (refreshNeeded) loadUsers();
          }}
          user={selectedUser}
          mode={modalMode}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};