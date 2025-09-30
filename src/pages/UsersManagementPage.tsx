import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { fetchAllUsers } from '../features/users/userApi';
import type { User } from '../types/entities';
import type { PaginatedResponse } from '../mocks/wrapper';
import { UserListTable } from '../features/users/components/UserListTable';
import { UserFilter } from '../features/users/components/UserFilter';
import { Pagination } from '../components/ui/pagination';
import { UserDetailModal } from '../features/users/components/UserDetailModal'; // Sẽ tạo file này sau

/**
 * @fileoverview UsersManagementPage component - Trang quản lý người dùng
 * @description Hiển thị danh sách người dùng, hỗ trợ lọc, tìm kiếm, phân trang và xem/chỉnh sửa chi tiết người dùng.
 * Tích hợp các components con: UserFilter, UserListTable, UserDetailModal.
 */

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Có thể cho phép user thay đổi

  const [filters, setFilters] = useState({
    search: '',
    role: '', // 'user', 'admin', 'super admin'
    is_active: undefined as boolean | undefined, // true, false, undefined (all)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Callback để fetch users khi có thay đổi trang hoặc filter
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: filters.search || undefined,
        role: filters.role === '' ? undefined : (filters.role as 'user' | 'admin' | 'super admin'),
        is_active: filters.is_active,
      });
      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalUsersCount(response.meta.total);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setError(err.message || "Không thể tải danh sách người dùng.");
      setUsers([]);
      setTotalPages(1);
      setTotalUsersCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh danh sách sau khi đóng modal (có thể đã có thay đổi)
  };

  // Hàm xử lý khi người dùng tạo mới (chưa có trong spec, nhưng có thể cần)
  const handleCreateUser = () => {
    setSelectedUser(null); // Để form trống cho user mới
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="p-0">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Quản lý Người dùng</h1>
        <p className="text-gray-500 mb-8">Danh sách tất cả người dùng trong hệ thống EChinese.</p>

        <div className="flex justify-between items-center mb-6">
          <UserFilter currentFilters={filters} onFilterChange={handleFilterChange} />
          <Button onClick={handleCreateUser} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Người dùng mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Lỗi:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-3 text-lg text-gray-600">Đang tải dữ liệu người dùng...</span>
          </div>
        ) : (
          <>
            <UserListTable
              users={users}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onRefresh={fetchUsers} // Truyền callback để table có thể refresh
            />
            {totalUsersCount > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                />
            )}
            <p className="text-sm text-gray-600 mt-4 text-right">Tổng cộng: {totalUsersCount} người dùng</p>
          </>
        )}
      </div>

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersManagementPage;