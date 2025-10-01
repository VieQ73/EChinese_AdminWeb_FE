import { useState, useEffect } from 'react';
import type { User } from '../types/entities';

/**
 * Hook để lấy thông tin người dùng đang đăng nhập từ localStorage.
 * @returns {User | null} - Thông tin người dùng hoặc null nếu chưa đăng nhập.
 */
export const useAuth = (): User | null => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('admin_user');
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch (error) {
        console.error('Lỗi khi parse thông tin người dùng từ localStorage:', error);
      }
    }
  }, []);

  return currentUser;
};