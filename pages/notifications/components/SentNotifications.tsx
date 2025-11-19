import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { Search, Users, User, Globe } from 'lucide-react';
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

    // Xử lý thông báo community
    if (notification.type === 'community') {
      const postId = notification.data?.post_id;
      const commentId = notification.data?.comment_id;

      if (postId) {
        try {
          const response = await fetch(`/api/community/posts/${postId}`);
          if (response.ok) {
            const data = await response.json();
            const post = data.data || data;
            
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
          const response = await fetch(`/api/community/comments/${commentId}`);
          if (response.ok) {
            const data = await response.json();
            const comment = data.data || data;
            
            if (comment.deleted_at) {
              navigate(`/community?user=${comment.user_id}&tab=removed`);
            } else if (comment.post_id) {
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

    // Mặc định: không làm gì (vì là sent notification)
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
              className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getAudienceIcon(notification.audience)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
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
