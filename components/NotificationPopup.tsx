import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    redirect_url?: string;
    type?: string;
    post_id?: string;
    [key: string]: any;
  };
}

interface NotificationPopupProps {
  payload: NotificationPayload | null;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ payload, onClose, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('🎨 [NotificationPopup] useEffect triggered, payload:', payload);
    
    if (payload) {
      console.log('✅ [NotificationPopup] Payload exists, showing popup');
      console.log('📋 [NotificationPopup] Title:', payload.notification?.title);
      console.log('📋 [NotificationPopup] Body:', payload.notification?.body);
      console.log('📋 [NotificationPopup] Data:', payload.data);
      
      setIsVisible(true);
      console.log('✅ [NotificationPopup] isVisible set to true');
      
      // Tự động đóng sau 10 giây
      const timer = setTimeout(() => {
        console.log('⏰ [NotificationPopup] Auto-closing after 10 seconds');
        handleClose();
      }, 10000);

      return () => {
        console.log('🧹 [NotificationPopup] Cleaning up timer');
        clearTimeout(timer);
      };
    } else {
      console.log('⚠️ [NotificationPopup] No payload, hiding popup');
    }
  }, [payload]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Đợi animation kết thúc
  };

  const handleClick = async () => {
    if (onNavigate) {
      // Ưu tiên redirect_url nếu có
      if (payload?.data?.redirect_url) {
        const path = payload.data.redirect_url.replace('app:/', '');
        onNavigate(path);
        handleClose();
        return;
      }

      // Kiểm tra xem có phải thông báo liên quan đến bài đăng/comment không
      // Dựa vào type (community/violation) và có post_id hoặc comment_id
      const notificationType = payload?.data?.type;
      const isPostRelated = (notificationType === 'community' || notificationType === 'violation') && 
                            (payload?.data?.post_id || payload?.data?.comment_id);

      if (isPostRelated) {
        const postId = payload.data?.post_id;
        const commentId = payload.data?.comment_id;

        if (postId) {
          try {
            const response = await fetch(`/api/community/posts/${postId}`);
            if (response.ok) {
              const data = await response.json();
              const post = data.data || data;
              
              // Nếu bài viết bị gỡ, mở UserActivityModal tab "Đã gỡ"
              if (post.status === 'removed') {
                onNavigate(`/community?user=${post.user_id}&tab=removed`);
              } else {
                // Bài viết bình thường, mở PostDetailModal
                onNavigate(`/community?post=${postId}`);
              }
            } else {
              onNavigate('/community');
            }
          } catch (error) {
            console.error('Error checking post status:', error);
            onNavigate('/community');
          }
          handleClose();
          return;
        }

        if (commentId) {
          try {
            const response = await fetch(`/api/community/comments/${commentId}`);
            if (response.ok) {
              const data = await response.json();
              const comment = data.data || data;
              
              // Nếu comment bị gỡ, mở UserActivityModal tab "Đã gỡ"
              if (comment.deleted_at) {
                onNavigate(`/community?user=${comment.user_id}&tab=removed`);
              } else if (comment.post_id) {
                // Comment bình thường, mở bài viết chứa comment
                onNavigate(`/community?post=${comment.post_id}`);
              } else {
                onNavigate('/community');
              }
            } else {
              onNavigate('/community');
            }
          } catch (error) {
            console.error('Error checking comment status:', error);
            onNavigate('/community');
          }
          handleClose();
          return;
        }
      }

      // Thông báo không liên quan đến bài đăng/comment: chuyển đến trang Quản lý Thông báo
      onNavigate('/notifications');
    }
    handleClose();
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'community':
        return '💬';
      case 'achievement':
        return '🏆';
      case 'subscription':
        return '💎';
      case 'system':
        return '🔔';
      default:
        return '🔔';
    }
  };

  if (!payload) {
    console.log('🚫 [NotificationPopup] Render: No payload, returning null');
    return null;
  }

  console.log('🎨 [NotificationPopup] Rendering popup with isVisible:', isVisible);

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
              <Bell className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Thông báo mới</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleClick}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-3xl">
                {getNotificationIcon(payload.data?.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {payload.notification?.title || 'Thông báo'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {payload.notification?.body || 'Bạn có một thông báo mới'}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    {payload.data?.redirect_url || payload.data?.post_id 
                      ? 'Nhấn để xem chi tiết →' 
                      : 'Nhấn để xem tất cả thông báo →'}
                  </span>
                </div>
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
