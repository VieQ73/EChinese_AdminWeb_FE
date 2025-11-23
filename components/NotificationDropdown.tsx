import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';
import { fetchReceivedNotifications, markNotificationsAsRead } from '../pages/moderation/api/notifications';
import { useNotification } from '../contexts/NotificationContext';
import { CheckCheck } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotification();

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      // Lấy TẤT CẢ thông báo chưa đọc (không giới hạn)
      const response = await fetchReceivedNotifications({ 
        read_status: 'unread',
        limit: 999 // Lấy tất cả
      });
      
      if (response.success && response.data) {
        // Sắp xếp theo created_at giảm dần (thông báo mới nhất lên đầu)
        const sortedNotifications = [...response.data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setNotifications(sortedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    setMarkingAllRead(true);
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(unreadIds, true);
        
        // Cập nhật state local
        setNotifications([]);
        
        // Refresh unread count
        await refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Đánh dấu thông báo này đã đọc
    try {
      await markNotificationsAsRead([notification.id], true);
      // Cập nhật số lượng thông báo chưa đọc
      await refreshUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    onClose();
    // Chuyển đến trang Kiểm duyệt & Thông báo, tab Thông báo, và truyền ID thông báo
    navigate(`/reports?tab=notifications&notificationId=${notification.id}`);
  };

  const handleViewAll = () => {
    onClose();
    // Chuyển đến trang Kiểm duyệt & Thông báo, tab Thông báo
    navigate('/reports?tab=notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'community':
        return '💬';
      case 'achievement':
        return '🏆';
      case 'subscription':
        return '💎';
      case 'system':
        return '🔔';
      case 'violation':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown - Giới hạn chiều cao và cải thiện thanh cuộn */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Thông báo chưa đọc
            {notifications.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({notifications.length})
              </span>
            )}
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Đánh dấu tất cả đã đọc"
            >
              {markingAllRead ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              <span className="whitespace-nowrap">Đọc hết</span>
            </button>
          )}
        </div>

        {/* Notifications List với thanh cuộn đẹp hơn */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-sm">Không có thông báo chưa đọc</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors bg-blue-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleViewAll}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
