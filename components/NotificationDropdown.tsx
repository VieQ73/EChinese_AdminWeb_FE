import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';
import { fetchReceivedNotifications, markNotificationsAsRead } from '../pages/moderation/api/notifications';
import { useNotification } from '../contexts/NotificationContext';
import { CheckDoubleIcon, BellIcon, GemIcon, ExclamationTriangleIcon, TrophyIcon, CheckCircleIcon } from './icons';
import { ChatAltIcon, PostIcon, ReplyIcon, HeartIcon } from './icons/community';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dropdown hiển thị danh sách thông báo chưa đọc
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotification();

  // Fetch thông báo khi dropdown mở
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  // Lấy danh sách thông báo chưa đọc
  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchReceivedNotifications({ 
        read_status: 'unread',
        limit: 999 // Lấy tất cả thông báo chưa đọc
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

  // Đánh dấu tất cả đã đọc
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

  // Xử lý khi click vào thông báo
  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markNotificationsAsRead([notification.id], true);
      await refreshUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    onClose();
    // Chuyển đến trang Kiểm duyệt & Thông báo, tab Thông báo
    navigate(`/reports?tab=notifications&notificationId=${notification.id}`);
  };

  // Xem tất cả thông báo
  const handleViewAll = () => {
    onClose();
    navigate('/reports?tab=notifications');
  };

  // Lấy icon theo loại thông báo
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    
    // Icon wrapper với nền tròn
    const IconWrapper: React.FC<{ bgColor: string; children: React.ReactNode }> = ({ bgColor, children }) => (
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColor}`}>
        {children}
      </div>
    );

    switch (type) {
      // Bài viết có lượt thích/bình luận
      case 'post_like':
      case 'post_comment':
      case 'post':
        return (
          <IconWrapper bgColor="bg-indigo-100">
            <PostIcon className={`${iconClass} text-indigo-600`} />
          </IconWrapper>
        );
      // Trả lời bình luận
      case 'comment_reply':
      case 'reply':
        return (
          <IconWrapper bgColor="bg-cyan-100">
            <ReplyIcon className={`${iconClass} text-cyan-600`} />
          </IconWrapper>
        );
      // Like/yêu thích
      case 'like':
      case 'reaction':
        return (
          <IconWrapper bgColor="bg-pink-100">
            <HeartIcon className={`${iconClass} text-pink-500`} />
          </IconWrapper>
        );
      // Bình luận chung
      case 'comment':
      case 'community':
        return <ChatAltIcon className={`${iconClass} text-gray-900`} />;
      // Thành tích
      case 'achievement':
        return (
          <IconWrapper bgColor="bg-yellow-100">
            <TrophyIcon className={`${iconClass} text-yellow-600`} />
          </IconWrapper>
        );
      // Đăng ký/Premium
      case 'subscription':
        return (
          <IconWrapper bgColor="bg-purple-100">
            <GemIcon className={`${iconClass} text-purple-600`} />
          </IconWrapper>
        );
      // Hệ thống
      case 'system':
        return (
          <IconWrapper bgColor="bg-gray-100">
            <BellIcon className={`${iconClass} text-gray-600`} />
          </IconWrapper>
        );
      // Vi phạm/cảnh báo
      case 'violation':
      case 'warning':
        return (
          <IconWrapper bgColor="bg-red-100">
            <ExclamationTriangleIcon className={`${iconClass} text-red-600`} />
          </IconWrapper>
        );
      // Thành công
      case 'success':
        return (
          <IconWrapper bgColor="bg-green-100">
            <CheckCircleIcon className={`${iconClass} text-green-600`} />
          </IconWrapper>
        );
      default:
        return (
          <IconWrapper bgColor="bg-gray-100">
            <BellIcon className={`${iconClass} text-gray-600`} />
          </IconWrapper>
        );
    }
  };

  // Format thời gian hiển thị
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
      {/* Overlay để đóng dropdown khi click ra ngoài */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
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
                <CheckDoubleIcon className="w-4 h-4" />
              )}
              <span className="whitespace-nowrap">Đọc hết</span>
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
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
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 self-center">
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
                    <div className="flex-shrink-0 self-center">
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
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