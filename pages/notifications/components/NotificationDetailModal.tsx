import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import { Clock, Tag, ExternalLink, CheckCheck, Loader2 } from 'lucide-react';
import { handleNotificationNavigation, shouldShowNavigationButton } from '../../../services/notificationNavigationService';
import * as api from '../../community/api';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id: string;
    type: string;
    title: string;
    content: {
      message: string;
    };
    redirect_type: string;
    data: any;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    expires_at: string | null;
    from_system: boolean;
  } | null;
  onNavigate?: (url: string) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  onClose,
  notification,
  onNavigate
}) => {
  if (!notification) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      system: 'Hệ thống',
      community: 'Cộng đồng',
      achievement: 'Thành tích',
      subscription: 'Gói học',
      exam: 'Bài thi',
      announcement: 'Thông báo'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      system: 'bg-blue-100 text-blue-700',
      community: 'bg-purple-100 text-purple-700',
      achievement: 'bg-yellow-100 text-yellow-700',
      subscription: 'bg-green-100 text-green-700',
      exam: 'bg-red-100 text-red-700',
      announcement: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const handleRedirect = async () => {
    if (!onNavigate) return;

    // Nếu có redirect_url, ưu tiên sử dụng
    if (notification.data?.redirect_url) {
      const path = notification.data.redirect_url.replace('app:/', '');
      onNavigate(path);
      onClose();
      return;
    }

    // Xử lý thông báo community
    if (notification.type === 'community') {
      const postId = notification.data?.post_id;
      const commentId = notification.data?.comment_id;

      if (postId) {
        try {
          // Kiểm tra trạng thái bài viết
          const post = await api.fetchPostById(postId);
          
          if (post) {
            // Nếu bài viết bị gỡ, chuyển đến trang Hoạt động của người dùng, tab "Đã gỡ"
            if (post.status === 'removed') {
              onNavigate(`/community?user=${post.user_id}&tab=removed`);
            } else {
              // Bài viết bình thường, mở chi tiết
              onNavigate(`/community?post=${postId}`);
            }
          } else {
            // Không tìm thấy bài viết, chuyển về community
            onNavigate('/community');
          }
        } catch (error) {
          console.error('Error checking post status:', error);
          // Fallback: chuyển đến trang community
          onNavigate('/community');
        }
        onClose();
        return;
      }

      if (commentId) {
        try {
          // Kiểm tra trạng thái comment
          const comment = await api.fetchCommentById(commentId);
          
          if (comment) {
            // Nếu comment bị gỡ, chuyển đến trang Hoạt động của người dùng, tab "Đã gỡ"
            if (comment.deleted_at) {
              onNavigate(`/community?user=${comment.user_id}&tab=removed`);
            } else if (comment.post_id) {
              // Comment bình thường, mở bài viết chứa comment
              onNavigate(`/community?post=${comment.post_id}`);
            } else {
              onNavigate('/community');
            }
          } else {
            // Không tìm thấy comment
            onNavigate('/community');
          }
        } catch (error) {
          console.error('Error checking comment status:', error);
          onNavigate('/community');
        }
        onClose();
        return;
      }
    }

    // Fallback: chuyển đến trang chính của type
    onNavigate(`/${notification.type}`);
    onClose();
  };

  const [isNavigating, setIsNavigating] = useState(false);
  
  const hasRedirect = notification.data?.redirect_url || 
                     (notification.type === 'community' && (notification.data?.post_id || notification.data?.comment_id));

  // Kiểm tra xem có nên hiển thị nút "Đi tới chi tiết" không
  const dataType = notification.data?.type;
  const dataId = notification.data?.id;
  const notificationData = notification.data as any;
  
  // Hỗ trợ cả format mới (post_id/comment_id) và format cũ (id)
  const hasNavigationData = dataType && (
    dataId || // Format cũ: có id
    notificationData?.post_id || // Format mới: có post_id
    notificationData?.comment_id // Format mới: có comment_id
  );
  const showNavigateButton = hasNavigationData && shouldShowNavigationButton(dataType);

  const handleNavigateToDetail = async () => {
    if (!onNavigate) return;
    
    setIsNavigating(true);
    
    try {
      let postId: string | null = null;
      let commentId: string | null = null;
      
      // Ưu tiên sử dụng post_id và comment_id từ data
      const notificationData = notification.data as any;
      if (notificationData?.post_id) {
        postId = notificationData.post_id;
        commentId = notificationData.comment_id || null;
      } 
      // Fallback: sử dụng data.id và data.type (format cũ)
      else if (dataType && dataId) {
        if (dataType === 'post' || dataType === 'post_remove') {
          // Nếu type là 'post', data.id chính là postId
          postId = dataId;
        } else if (dataType === 'comment' || dataType === 'comment_remove') {
          // Nếu type là 'comment', cần fetch comment để lấy post_id
          commentId = dataId;
          const comment = await api.fetchCommentById(dataId);
          if (comment && comment.post_id) {
            postId = comment.post_id;
          } else {
            onNavigate('/community');
            setIsNavigating(false);
            return;
          }
        }
      }
      
      if (postId) {
        // Đóng modal notification trước
        onClose();
        // Navigate đến community page với query params
        if (commentId) {
          onNavigate(`/community?post=${postId}&comment=${commentId}`);
        } else {
          onNavigate(`/community?post=${postId}`);
        }
      } else {
        // Fallback: dùng navigation
        if (dataType && dataId) {
          await handleNotificationNavigation(dataType, dataId, onNavigate, notification.data);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error navigating:', error);
      // Fallback: navigate to community
      onNavigate('/community');
      onClose();
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thông báo" className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {notification.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>
                <Tag className="w-3 h-3 inline mr-1" />
                {getTypeLabel(notification.type)}
              </span>
              {notification.from_system && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  Hệ thống
                </span>
              )}
              {!notification.is_read && (
                <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">
                  Chưa đọc
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notification.content.message}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium mr-2">Thời gian:</span>
            <span>{formatDateTime(notification.created_at)}</span>
          </div>

          {notification.read_at && (
            <div className="flex items-center text-gray-600">
              <CheckCheck className="w-4 h-4 mr-2" />
              <span className="font-medium mr-2">Đã đọc lúc:</span>
              <span>{formatDateTime(notification.read_at)}</span>
            </div>
          )}

          {notification.expires_at && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium mr-2">Hết hạn:</span>
              <span>{formatDateTime(notification.expires_at)}</span>
            </div>
          )}
        </div>

        {/* Additional Data - Ẩn phần này
        {false && notification.data && Object.keys(notification.data).length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin bổ sung:</h3>
            <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-600 max-h-40 overflow-auto">
              <pre>{JSON.stringify(notification.data, null, 2)}</pre>
            </div>
          </div>
        )} */}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
          
          {showNavigateButton && dataType !== 'comment_remove' && (
            <button
              onClick={handleNavigateToDetail}
              disabled={isNavigating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span>{dataType?.includes('post') ? 'Xem bài viết' : 'Xem bình luận'}</span>
            </button>
          )}
          
          {hasRedirect && (
            <button
              onClick={handleRedirect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem chi tiết</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
    </>
  );
};

export default NotificationDetailModal;
