
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  initialized: boolean;
  login: (user: User | null, token?: string, refreshToken?: string) => void;
  logout: () => void;
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

  const login = (userData: User | null, token?: string, refreshToken?: string) => {
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
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
    } catch {
      // ignore
    }
    apiClient.clearTokens();
    setInitialized(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
