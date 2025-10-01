import React, { useState, useEffect } from 'react';
// Import `Outlet` từ `react-router-dom`
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import {UsersManagementPage} from './pages/UsersManagementPage';
import NotebooksPage from './pages/NotebooksPage';
import NotebookDetail from './pages/NotebookDetail';
import MainLayout from './components/layout/MainLayout';
import ChangePasswordPage from './pages/ChangePassword';
import { ToastProvider } from './components/ui/Toast';
import { type User } from './types/entities';

/**
 * @fileoverview App component - Quản lý trạng thái xác thực và định tuyến chính của ứng dụng.
 * @description Đây là component gốc của ứng dụng, chịu trách nhiệm kiểm tra trạng thái đăng nhập,
 * hiển thị trang đăng nhập hoặc layout admin, và định tuyến giữa các trang.
 */

// Giả định một type cho thông tin user cần lưu sau khi đăng nhập
export type AuthenticatedUser = Pick<
  User,
  'id' | 'username' | 'email' | 'name' | 'role' | 'avatar_url' | 'level' | 'badge_level'
>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Kiểm tra token trong localStorage khi ứng dụng khởi tạo
    return !!localStorage.getItem('admin_token');
  });
  // currentUser được lưu trong localStorage; nếu cần global access hãy dùng hook/useContext
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Trong môi trường thực, sẽ kiểm tra tính hợp lệ của token ở đây,
    // ví dụ bằng cách gọi một API /auth/me hoặc /auth/verify-token.
    // Hiện tại chỉ kiểm tra sự tồn tại của token.
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (token && user) {
      try {
        // chỉ xác thực dựa trên tồn tại token/user
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Lỗi khi parse thông tin người dùng từ localStorage:", error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (token: string, user: AuthenticatedUser) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setIsAuthenticated(true);
    // Có thể redirect đến dashboard hoặc trang mặc định sau đăng nhập
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    // Redirect về trang đăng nhập
  };

  if (loadingAuth) {
    // Có thể render một loading spinner toàn màn hình ở đây
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-teal-600 mb-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-gray-700 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
      <Routes>
        {/* Route cho trang đăng nhập */}
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Các Route yêu cầu xác thực - sử dụng LayoutWrapper */}
        {/* Khi dùng nested routes với layout, component cha (LayoutWrapper) cần render Outlet */}
        <Route
          path="/"
          element={isAuthenticated ? <LayoutWrapper onLogout={handleLogout} /> : <Navigate to="/auth" replace />}
        >
          {/* Dashboard Page */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* User Management Page */}
          <Route path="users" element={<UsersManagementPage />} />
          <Route path="notebooks" element={<NotebooksPage />} />
          <Route path="notebooks/:id" element={<NotebookDetail />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          {/* ... Các trang khác sẽ được thêm vào sau */}
          
          {/* Redirect mặc định nếu path "/" không khớp và đã đăng nhập */}
          <Route index element={<Navigate to="/dashboard" replace />} /> {/* Thêm index route để redirect */}
        </Route>

        {/* Catch-all route cho 404 hoặc redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

// Component wrapper để truyền children (Outlet) vào MainLayout
// và xử lý việc gọi hàm onLogout từ MainLayout
interface LayoutWrapperProps {
  onLogout: () => void;
}
const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ onLogout }) => {
  return (
    <MainLayout onLogout={onLogout}> {/* Truyền onLogout xuống MainLayout */}
      <Outlet /> {/* Đây là nơi các route con sẽ được render */}
    </MainLayout>
  );
};