import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { AuthContext } from './AuthContext';
import { mockNotifications } from '../mock';

// Biến môi trường để bật/tắt chế độ giả lập
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Interface cho NotificationContext
interface NotificationContextType {
  unreadCount: number;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Fetch unread count khi mount (chỉ 1 lần) và khi isAuthenticated thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Hàm refresh số lượng thông báo chưa đọc
  const refreshUnreadCount = useCallback(async () => {
    try {
      if (USE_MOCK_API) {
        // Mock: đếm số thông báo chưa đọc từ mock data
        const unread = mockNotifications.filter(n => 
          (n.from_system || n.audience === 'admin') && !n.read_at
        ).length;
        setUnreadCount(unread);
        return;
      }

      // Real API
      const response = await apiClient.get<{ data: { count: number } }>('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        setUnreadCount,
        refreshUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook để sử dụng NotificationContext
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
