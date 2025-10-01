import { useState, useEffect } from 'react';
import { fetchAllUsers, deactivateUser, activateUser, deleteUser } from '../features/users/userApi';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/entities';
import type { PaginatedResponse } from '../types/api';


const Table = ({ children }: { children: React.ReactNode }) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
const TableHeader = ({ children }: { children: React.ReactNode }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
const TableRow = ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>;
const TableHead = ({ children }: { children: React.ReactNode }) => <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const TableCell = ({ children }: { children: React.ReactNode }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>;
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>{children}</span>;

import { UserActions } from '../features/users/components/UserActions';

export const UsersManagementPage = () => {
  const currentUser = useAuth();
  const [usersResponse, setUsersResponse] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers({ page: 1, limit: 10 });
      setUsersResponse(response);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleEdit = (user: User) => {
    // TODO: Mở modal chỉnh sửa người dùng
    alert(`Mở form chỉnh sửa cho người dùng: ${user.name}`);
    console.log('Dữ liệu người dùng để sửa:', user);
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!currentUser) return <div>Đang xác thực...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Người dùng</h1>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>
                <span className="sr-only">Hành động</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersResponse?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-500">{user.email}</div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Đã khóa</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    currentUser={currentUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* TODO: Thêm component phân trang ở đây */}
    </div>
  );
};