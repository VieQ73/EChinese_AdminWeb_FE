import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { Search, Users, User, Globe, Trash2, Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SentNotification {
  id: string;
  recipient_id: string | null;
  recipient_username: string | null;
  recipient_email: string | null;
  audience: 'user' | 'admin' | 'all';
  type: string;
  title: string;
  content: {
    message: string;
  };
  redirect_type: string;
  data: any;
  priority: number;
  is_push_sent: boolean;
  created_at: string;
  expires_at: string | null;
}

const SentNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/admin/notifications/all?page=${page}&limit=20`);
      setNotifications(response.data?.sent || []);
      setTotalPages(response.meta?.totalPagesSent || 1);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotifications = async (ids: string[]) => {
    if (!confirm(`Bạn có chắc muốn xóa ${ids.length} thông báo?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await apiClient.post<{ success: boolean }>('/admin/notifications/delete', { ids });
      
      if (response.success) {
        // Xóa khỏi danh sách local
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        setSelectedIds([]);
        alert('Xóa thành công!');
        
        // Nếu trang hiện tại không còn thông báo nào, load lại
        if (notifications.length === ids.length && page > 1) {
          setPage(page - 1);
        } else {
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert('Có lỗi xảy ra khi xóa thông báo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handlePublishNotifications = async (ids: string[]) => {
    if (!confirm(`Bạn có chắc muốn xuất bản ${ids.length} thông báo?`)) {
      return;
    }

    try {
      setIsPublishing(true);
      const response = await apiClient.post<{ success: boolean }>('/notifications/publish', { ids });
      
      if (response.success) {
        alert('Xuất bản thành công!');
        fetchNotifications();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Error publishing notifications:', error);
      alert('Có lỗi xảy ra khi xuất bản thông báo');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRevokeNotifications = async (ids: string[]) => {
    if (!confirm(`Bạn có chắc muốn thu hồi ${ids.length} thông báo?`)) {
      return;
    }

    try {
      setIsRevoking(true);
      const response = await apiClient.post<{ success: boolean; message?: string; data?: { revokedCount: number } }>('/notifications/revoke', { ids });
      
      if (response.success) {
        const count = response.data?.revokedCount || ids.length;
        alert(`Thu hồi thành công ${count} thông báo!`);
        fetchNotifications();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Error revoking notifications:', error);
      alert('Có lỗi xảy ra khi thu hồi thông báo');
    } finally {
      setIsRevoking(false);
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'user': return <User className="w-5 h-5 text-blue-600" />;
      case 'admin': return <Users className="w-5 h-5 text-purple-600" />;
      case 'all': return <Globe className="w-5 h-5 text-green-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'user': return 'Người dùng';
      case 'admin': return 'Admin';
      case 'all': return 'Tất cả';
      default: return audience;
    }
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'all': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNotificationClick = async (notification: SentNotification) => {
    // Nếu có redirect_url, ưu tiên sử dụng
    if (notification.data?.redirect_url) {
      const path = notification.data.redirect_url.replace('app:/', '');
      navigate(path);
      return;
    }

    // Kiểm tra xem có phải thông báo liên quan đến bài đăng/comment không
    const isPostRelated = (notification.type === 'community' || notification.type === 'violation') && 
                          (notification.redirect_type === 'post' || notification.redirect_type === 'post_comment');

    if (isPostRelated) {
      const postId = notification.data?.post_id;
      const commentId = notification.data?.comment_id;

      if (postId) {
        try {
          const response = await fetch(`/api/community/posts/${postId}`);
          if (response.ok) {
            const data = await response.json();
            const post = data.data || data;
            
            // Nếu bài viết bị gỡ, mở UserActivityModal tab "Đã gỡ"
            if (post.status === 'removed') {
              navigate(`/community?user=${post.user_id}&tab=removed`);
            } else {
              // Bài viết bình thường, mở PostDetailModal
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
          const response = await fetch(`/api/community/comments/${commentId}`);
          if (response.ok) {
            const data = await response.json();
            const comment = data.data || data;
            
            // Nếu comment bị gỡ, mở UserActivityModal tab "Đã gỡ"
            if (comment.deleted_at) {
              navigate(`/community?user=${comment.user_id}&tab=removed`);
            } else if (comment.post_id) {
              // Comment bình thường, mở bài viết chứa comment
              navigate(`/community?post=${comment.post_id}`);
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

    // Thông báo không liên quan đến bài đăng/comment: không làm gì (đã ở trang này rồi)
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.recipient_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAudience = filterAudience === 'all' || n.audience === filterAudience;
    
    return matchesSearch && matchesAudience;
  });

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-blue-900">
              Đã chọn {selectedIds.length} thông báo
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Bỏ chọn
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePublishNotifications(selectedIds)}
              disabled={isPublishing || isDeleting || isRevoking}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? 'Đang xuất bản...' : 'Xuất bản'}</span>
            </button>
            <button
              onClick={() => handleRevokeNotifications(selectedIds)}
              disabled={isRevoking || isDeleting || isPublishing}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isRevoking ? 'Đang thu hồi...' : 'Thu hồi'}</span>
            </button>
            <button
              onClick={() => handleDeleteNotifications(selectedIds)}
              disabled={isDeleting || isPublishing || isRevoking}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Đang xóa...' : 'Xóa'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo đã gửi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterAudience}
          onChange={(e) => setFilterAudience(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả đối tượng</option>
          <option value="user">Người dùng</option>
          <option value="admin">Admin</option>
          <option value="all">Broadcast</option>
        </select>

        {filteredNotifications.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {selectedIds.length === filteredNotifications.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
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
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa gửi thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 bg-white rounded-lg border transition-colors ${
                selectedIds.includes(notification.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notification.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectOne(notification.id);
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />

                <div 
                  className="p-2 bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getAudienceIcon(notification.audience)}
                </div>

                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${getAudienceBadgeColor(notification.audience)}`}>
                          {getAudienceLabel(notification.audience)}
                        </span>
                        {notification.is_push_sent && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            ✓ Đã push
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.is_push_sent ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishNotifications([notification.id]);
                          }}
                          disabled={isPublishing || isDeleting || isRevoking}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xuất bản thông báo"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevokeNotifications([notification.id]);
                          }}
                          disabled={isRevoking || isDeleting || isPublishing}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Thu hồi thông báo"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotifications([notification.id]);
                        }}
                        disabled={isDeleting || isPublishing || isRevoking}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{notification.content.message}</p>

                  {/* Recipient Info */}
                  {notification.recipient_username && (
                    <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
                      <span className="text-gray-600">Người nhận: </span>
                      <span className="font-medium text-gray-900">
                        {notification.recipient_username}
                      </span>
                      {notification.recipient_email && (
                        <span className="text-gray-500 ml-2">
                          ({notification.recipient_email})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Additional Data */}
                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="text-gray-600">Dữ liệu: </span>
                      <code className="text-gray-800">
                        {JSON.stringify(notification.data)}
                      </code>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatTime(notification.created_at)}</span>
                    {notification.expires_at && (
                      <span className="text-orange-600">
                        Hết hạn: {formatTime(notification.expires_at)}
                      </span>
                    )}
                  </div>
                </div>
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

export default SentNotifications;
