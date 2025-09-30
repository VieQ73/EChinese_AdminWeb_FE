import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button'; // Vẫn giữ import nếu dùng cho mục đích khác
import { Loader2, PlusCircle } from 'lucide-react'; // Có thể loại bỏ PlusCircle nếu không dùng
import { fetchAllUsers } from '../features/users/userApi';
import type { User } from '../types/entities';
import type { PaginatedResponse } from '../mocks/wrapper';
import { UserListTable } from '../features/users/components/UserListTable';
import { UserFilter } from '../features/users/components/UserFilter';
import { Pagination } from '../components/ui/pagination';
import { UserDetailModal } from '../features/users/components/UserDetailModal';
import { useAuth } from '../hooks/useAuth'; // Sẽ tạo hook này để lấy thông tin user hiện tại

/**
 * @fileoverview UsersManagementPage component - Trang quản lý người dùng
 * @description Hiển thị danh sách người dùng, hỗ trợ lọc, tìm kiếm, phân trang và xem/chỉnh sửa chi tiết người dùng.
 * Tích hợp các components con: UserFilter, UserListTable, UserDetailModal.
 * Trang này KHÔNG TỰ RENDER MainLayout, mà sẽ được render BÊN TRONG MainLayout
 * thông qua React Router's Outlet.
 */

const UsersManagementPage: React.FC = () => {
  const { currentUser } = useAuth(); // Lấy thông tin user hiện tại để phân quyền

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
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view'); // Thêm mode cho modal

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
    setModalMode('view'); // Chế độ xem
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit'); // Chế độ chỉnh sửa
    setIsModalOpen(true);
  };

  const handleModalClose = (refreshNeeded: boolean = false) => {
    setIsModalOpen(false);
    setSelectedUser(null);
    if (refreshNeeded) {
      fetchUsers(); // Chỉ refresh khi có thay đổi được lưu
    }
  };

  // Loại bỏ nút "Thêm Người dùng mới"
  // const handleCreateUser = () => {
  //   setSelectedUser(null);
  //   setModalMode('edit'); // Khi tạo mới, luôn ở chế độ chỉnh sửa
  //   setIsModalOpen(true);
  // };

  return (
    <div className="p-0">
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Quản lý Người dùng</h1>
      <p className="text-gray-500 mb-8">Danh sách tất cả người dùng trong hệ thống EChinese.</p>

      <div className="flex justify-between items-center mb-6">
        <UserFilter currentFilters={filters} onFilterChange={handleFilterChange} />
        {/* Loại bỏ nút "Thêm Người dùng mới" */}
        {/*
        <Button onClick={handleCreateUser} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm Người dùng mới
        </Button>
        */}
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
            onRefresh={fetchUsers} // Vẫn truyền để các hành động khóa/mở khóa/xóa có thể gọi
            currentUser={currentUser} // Truyền thông tin user hiện tại để phân quyền
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

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        mode={modalMode} // Truyền mode vào modal
        currentUser={currentUser} // Truyền thông tin user hiện tại để phân quyền
      />
    </div>
  );
};

export default UsersManagementPage;