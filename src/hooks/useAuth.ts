import { useState, useEffect } from 'react';
import type { User } from '../types/entities';
import { mockUsers } from '../mock/users';

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
        const userData = JSON.parse(userJson);
        
        // Đồng bộ với mock data để đảm bảo có avatar_url
        const mockUser = mockUsers.find(u => u.id === userData.id || u.username === userData.username);
        if (mockUser) {
          // Merge data từ localStorage với mock data
          setCurrentUser({
            ...mockUser,
            ...userData, // Ưu tiên dữ liệu từ localStorage
            avatar_url: mockUser.avatar_url // Nhưng luôn dùng avatar từ mock
          });
        } else {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Lỗi khi parse thông tin người dùng từ localStorage:', error);
        // Fallback về Super Admin nếu có lỗi
        setCurrentUser(mockUsers[0]);
      }
    } else {
      // Nếu không có trong localStorage, dùng Super Admin làm mặc định
      setCurrentUser(mockUsers[0]);
    }
  }, []);

  return currentUser;
};