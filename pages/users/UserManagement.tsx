import React, { useState, useEffect, useCallback } from 'react';
//  Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import { PaginatedResponse } from '../../types';
import { fetchUsers, UserWithSubscription } from './userApi';
import { Loader2 } from 'lucide-react';

const USERS_PER_PAGE = 20;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserWithSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'super admin'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<UserWithSubscription> = await fetchUsers({
                page: currentPage,
                limit: USERS_PER_PAGE,
                searchTerm,
                roleFilter,
            });
            setUsers(response.data);
            setPageCount(response.meta.totalPages);
        } catch (error) {
            console.error("Không thể tải danh sách người dùng", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, roleFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Trở về trang 1 khi bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Tìm theo tên, username, email..."
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className="w-full md:w-auto p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                </select>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói đăng ký</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-600"/>
                                        <span className="ml-2 text-gray-500">Đang tải...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500">
                                    Không tìm thấy người dùng nào.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatar_url || ''} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Hoạt động' : 'Bị cấm'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.subscription?.name || 'Miễn phí'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/users/${user.id}`)} className="text-primary-600 hover:text-primary-900 font-medium">Xem chi tiết</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {pageCount > 1 && !loading && (
                <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
                    <div className="flex-1 flex justify-between sm:justify-end">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-700 hidden md:flex items-center mx-4">
                           Trang <strong className="mx-1">{currentPage}</strong> / <strong className="mx-1">{pageCount}</strong>
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                            disabled={currentPage === pageCount}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default UserManagement;
