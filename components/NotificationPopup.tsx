import React, { useEffect, useState } from 'react';
import { XIcon, BellIcon, GemIcon, ExclamationTriangleIcon, TrophyIcon, CheckCircleIcon } from './icons';
import { ChatAltIcon, PostIcon, ReplyIcon, HeartIcon } from './icons/community';

// Interface cho payload thông báo realtime
interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    redirect_url?: string;
    type?: string;
    post_id?: string;
    notification_id?: string;
    id?: string;
    content?: string;
    message?: string;
    body?: string;
    [key: string]: any;
  };
}

interface NotificationPopupProps {
  payload: NotificationPayload | null;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

// Popup thông báo realtime khi có notification mới
const NotificationPopup: React.FC<NotificationPopupProps> = ({ payload, onClose, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (payload) {
      setIsVisible(true);
      
      // Tự động đóng sau 10 giây
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [payload]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Đợi animation kết thúc
  };

  // Xử lý khi click vào popup
  const handleClick = async () => {
    if (onNavigate) {
      const notificationId = payload?.data?.notification_id || payload?.data?.id;
      
      if (notificationId) {
        onNavigate(`/reports?tab=notifications&notificationId=${notificationId}`);
        handleClose();
        return;
      }

      // Fallback: chuyển đến trang thông báo
      onNavigate('/reports?tab=notifications');
    }
    handleClose();
  };

  // Lấy icon theo loại thông báo
  const getNotificationIcon = (type?: string) => {
    const iconClass = "w-8 h-8";
    
    // Icon wrapper với nền tròn
    const IconWrapper: React.FC<{ bgColor: string; children: React.ReactNode }> = ({ bgColor, children }) => (
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor}`}>
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
        return (
          <IconWrapper bgColor="bg-blue-100">
            <ChatAltIcon className={`${iconClass} text-blue-600`} />
          </IconWrapper>
        );
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

  if (!payload) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-sm transition-all duration-300 transform ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Thông báo mới</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleClick}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(payload.data?.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {payload.notification?.title || 'Thông báo'}
                </h3>
                <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Nhấn để xem chi tiết →
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-[10000ms] ease-linear"
              style={{ width: isVisible ? '0%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
