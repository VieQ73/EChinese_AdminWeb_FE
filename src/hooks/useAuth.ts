import { useState, useEffect } from 'react';
import type { AuthenticatedUser } from '../App'; 

/**
 * @fileoverview useAuth hook - Hook tùy chỉnh để lấy thông tin xác thực của người dùng
 * @description Cung cấp cách dễ dàng để truy cập trạng thái đăng nhập và thông tin người dùng hiện tại
 * từ bất kỳ component nào trong ứng dụng.
 */

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthenticatedUser | null;
  // login: (token: string, user: AuthenticatedUser) => void; // Có thể thêm nếu muốn quản lý global state
  // logout: () => void; // Có thể thêm nếu muốn quản lý global state
}

export const useAuth = (): AuthContextType => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userString = localStorage.getItem('admin_user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString) as AuthenticatedUser;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Lỗi khi parse thông tin người dùng từ localStorage:", error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
    // Đây sẽ lắng nghe thay đổi của localStorage hoặc một Context API
    // Trong môi trường này, nó chỉ chạy 1 lần khi component mount
    // Hoặc khi có sự thay đổi từ App.tsx thông qua re-render
  }, []); // [] đảm bảo chỉ chạy một lần khi component mount

  return { isAuthenticated, currentUser };
};