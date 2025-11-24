
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';
import { registerDeviceToken, unregisterDeviceToken } from '../utils/notificationHelper';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  initialized: boolean;
  login: (user: User | null, token?: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Khởi tạo từ localStorage (nếu trước đó đã đăng nhập)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token) {
        // restore token into api client so subsequent requests have Authorization header
        try {
          apiClient.setTokens(token, refreshToken || undefined);
        } catch {}
        setIsAuthenticated(true);
        if (savedUser && savedUser !== 'undefined') {
          try {
            setUser(JSON.parse(savedUser) as User);
          } catch {
            // dữ liệu user không hợp lệ, bỏ qua
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setInitialized(true);
    }
  }, []);

  const login = async (userData: User | null, token?: string, refreshToken?: string) => {
    // Lưu user và token nếu có
    if (token) {
      apiClient.setTokens(token, refreshToken);
    }
    try {
      if (userData) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch {
      // ignore
    }

    setIsAuthenticated(true);
    setUser(userData ?? null);
    setInitialized(true);

    // Register device token for push notifications
    if (token) {
      try {
        await registerDeviceToken();
      } catch (error) {
        console.error('Failed to register device token:', error);
        // Không throw error để không ảnh hưởng đến login flow
      }
    }
  };

  const logout = async () => {
    try {
      // Unregister device token trước khi logout
      try {
        await unregisterDeviceToken();
      } catch (error) {
        console.error('Failed to unregister device token:', error);
      }

      // Lấy refresh token để gọi API logout
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Gọi API logout
        try {
          await apiClient.post('/auth/logout', { refresh_token: refreshToken });
        } catch (error) {
          // Nếu API logout thất bại, vẫn tiếp tục logout ở client
          console.error('Logout API failed:', error);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Xóa tất cả dữ liệu authentication
      setIsAuthenticated(false);
      setUser(null);
      
      // Xóa tất cả token và user data
      try {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('fcm_token'); // Xóa FCM token
      } catch {
        // ignore
      }
      
      // Clear tokens trong apiClient
      apiClient.clearTokens();
      
      // Xóa tất cả cache
      try {
        // Xóa tất cả cache keys
        const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
        cacheKeys.forEach(key => localStorage.removeItem(key));
      } catch {
        // ignore
      }
      
      setInitialized(true);
      
      // Reload trang để reset hoàn toàn ứng dụng và về trang login
      window.location.href = '/#/login';
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Cập nhật localStorage
    try {
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, initialized, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
