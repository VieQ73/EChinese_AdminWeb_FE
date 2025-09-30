/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
// import UserManagementExample from './features/users/UserManagementExample'; // Tạm thời ẩn component này
import { fetchAllUsers } from './features/users/userApi';
import { type User } from './types/entities'; 
import MainLayout from './components/layout/MainLayout';

// Component để hiển thị ví dụ quản lý người dùng
const UserManagementExample: React.FC = () => {
  // Định nghĩa state với kiểu dữ liệu User[]
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAllUsers({ page: 1, limit: 10 }); 
        setUsers(response.data);
      } catch (err: any) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );
  if (error) return <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">Lỗi: {error}</div>;

  return (
    <div className="p-0">
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Quản lý Người dùng</h1>
      <p className="mb-6 text-sm text-gray-500">
        Hiển thị danh sách người dùng đầu tiên. Dữ liệu được lấy thông qua **API Client** trong môi trường **Mock Data**.
      </p>
      
      {/* User List Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="p-4 border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition duration-300">
            <p className="font-bold text-lg text-gray-900 truncate">{user.name}</p>
            <p className="text-sm text-gray-600">@{user.username || 'N/A'}</p>
            <p className="text-xs mt-2">
              <span className="font-medium text-blue-600 uppercase mr-2">{user.role}</span> | 
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.is_active ? 'Active' : 'Deactivated'}
              </span>
            </p>
            <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Level: {user.level} (Điểm: {user.community_points})</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mock Data Notice */}
      <p className="mt-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
        **Lưu ý:** Ứng dụng đang chạy ở chế độ **Mock Data**. Kết quả hiển thị là dữ liệu giả lập.
      </p>
    </div>
  );
};


const App: React.FC = () => {
    // Sử dụng localStorage để giả lập việc lưu trữ token sau khi đăng nhập thành công
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

    const handleLoginSuccess = (token: string) => {
        // Trong ứng dụng thực tế: Lưu token vào Http-Only Cookie hoặc nơi an toàn khác
        localStorage.setItem('admin_token', token); 
        setIsAuthenticated(true);
    };

    // Hàm giả lập đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
    }
    
    // Nếu chưa đăng nhập, hiển thị trang AuthPage
    if (!isAuthenticated) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }
    
    // Nếu đã đăng nhập, hiển thị DashboardPage
    return (
        <DashboardPage /> 
        // Hoặc nếu muốn quay lại User List (thay vì Dashboard):
        // <MainLayout>
        //    <UserManagementExample /> 
        // </MainLayout>
    );
}

export default App;
