import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { CheckCheck, Trash2, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../community/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: {
    message: string;
  };
  redirect_type: string;
  data: any;
  priority: number;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
  from_system: boolean;
}

interface ReceivedNotificationsProps {
  onStatsUpdate: () => void;
}

const ReceivedNotifications: React.FC<ReceivedNotificationsProps> = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [page, filterType, showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = `/notifications?page=${page}&limit=20`;
      
      if (filterType !== 'all') {
        url += `&type=${filterType}`;
      }
      
      if (showUnreadOnly) {
        url += `&unread_only=true`;
      }

      const response = await apiClient.get<any>(url);
      setNotifications(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (ids: string[], asRead: boolean) => {
    try {
      await apiClient.post('/notifications/mark-read', {
        ids,
        asRead
      });
      
      fetchNotifications();
      onStatsUpdate();
    } catch (error) {
      console.error('Error marking notifications:', error);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Xóa ${ids.length} thông báo?`)) return;
    
    try {
      await apiClient.post('/notifications/delete', { ids });
      fetchNotifications();
      onStatsUpdate();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.is_read) {
      handleMarkAsRead([notification.id], false);
    }

    // Nếu có redirect_url, ưu tiên sử dụng
    if (notification.data?.redirect_url) {
      const path = notification.data.redirect_url.replace('app:/', '');
      navigate(path);
      return;
    }

    // Sử dụng data.type và data.id để điều hướng
    const dataType = notification.data?.type;
    const dataId = notification.data?.id;

    if (dataType && dataId) {
      try {
        let postId: string | null = null;

        if (dataType === 'post' || dataType === 'post_remove') {
          // Nếu type là 'post', data.id chính là postId
          postId = dataId;
        } else if (dataType === 'comment' || dataType === 'comment_remove') {
          // Nếu type là 'comment', cần fetch comment để lấy post_id
          const comment = await api.fetchCommentById(dataId);
          if (comment) {
            postId = comment.post_id || null;
          }
        }

        if (postId) {
          // Fetch post để kiểm tra trạng thái
          const post = await api.fetchPostById(postId);
          if (post) {
            // Nếu bài viết bị gỡ, mở UserActivityModal tab "Đã gỡ"
            if (post.status === 'removed') {
              navigate(`/community?user=${post.user_id}&tab=removed`);
            } else {
              // Bài viết bình thường, mở PostDetailModal
              if (dataType === 'comment' || dataType === 'comment_remove') {
                // Nếu là comment, thêm commentId vào URL để highlight
                navigate(`/community?post=${postId}&comment=${dataId}`);
              } else {
                navigate(`/community?post=${postId}`);
              }
            }
          } else {
            navigate('/community');
          }
        } else {
          navigate('/community');
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
        navigate('/community');
      }
      return;
    }

    // Fallback: Kiểm tra legacy format (post_id, comment_id)
    const isPostRelated = (notification.type === 'community' || notification.type === 'violation') && 
                          (notification.redirect_type === 'post' || notification.redirect_type === 'post_comment');

    if (isPostRelated) {
      const postId = notification.data?.post_id;
      const commentId = notification.data?.comment_id;

      if (postId) {
        try {
          const post = await api.fetchPostById(postId);
          if (post) {
            if (post.status === 'removed') {
              navigate(`/community?user=${post.user_id}&tab=removed`);
            } else {
              navigate(`/community?post=${postId}`);
            }
          } else {
            navigate('/community');
          }
        } catch (error) {
          console.error('Error checking post status:', error);
          navigate('/community');
        }
        return;
      }

      if (commentId) {
        try {
          const comment = await api.fetchCommentById(commentId);
          if (comment) {
            if (comment.deleted_at) {
              navigate(`/community?user=${comment.user_id}&tab=removed`);
            } else if (comment.post_id) {
              navigate(`/community?post=${comment.post_id}&comment=${commentId}`);
            } else {
              navigate('/community');
            }
          } else {
            navigate('/community');
          }
        } catch (error) {
          console.error('Error checking comment status:', error);
          navigate('/community');
        }
        return;
      }
    }

    // Thông báo không liên quan đến bài đăng/comment: chuyển đến trang Quản lý Thông báo
    // (User đang ở trang này rồi, không cần navigate)
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'community': return '💬';
      case 'system': return '🔔';
      case 'comment_ban': return '🚫';
      default: return '📢';
    }
  };



  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="system">Hệ thống</option>
            <option value="community">Cộng đồng</option>
            <option value="comment_ban">Cấm bình luận</option>
          </select>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Chỉ chưa đọc</span>
          </label>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-700">
              Đã chọn {selectedIds.length} thông báo
            </span>
            <button
              onClick={() => handleMarkAsRead(selectedIds, true)}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Đánh dấu đã đọc
            </button>
            <button
              onClick={() => handleMarkAsRead(selectedIds, false)}
              className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Đánh dấu chưa đọc
            </button>
            <button
              onClick={() => handleDelete(selectedIds)}
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b">
            <input
              type="checkbox"
              checked={selectedIds.length === notifications.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </div>

          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                !notification.is_read
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notification.id)}
                  onChange={() => toggleSelect(notification.id)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />

                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>

                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{notification.content.message}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>{formatTime(notification.created_at)}</span>
                      {notification.from_system && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          Hệ thống
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead([notification.id], true)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete([notification.id])}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceivedNotifications;
