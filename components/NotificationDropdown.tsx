import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';
import { fetchReceivedNotifications } from '../pages/moderation/api/notifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      // Lấy thông báo chưa đọc, giới hạn 7 cái
      const response = await fetchReceivedNotifications({ 
        read_status: 'unread',
        limit: 7 
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

  const handleNotificationClick = (notification: Notification) => {
    onClose();
    // Chuyển đến trang Kiểm duyệt & Thông báo, tab Thông báo
    navigate('/reports?tab=notifications');
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
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Không có thông báo chưa đọc</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read_at ? 'bg-blue-50' : ''
                  }`}
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
                    {!notification.read_at && (
                      <div className="flex-shrink-0">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
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
