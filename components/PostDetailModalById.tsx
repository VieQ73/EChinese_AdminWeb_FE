import React, { useState, useEffect } from 'react';
import { X, Heart, Eye, MessageCircle, User, Calendar, Loader2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface PostDetailModalByIdProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

interface PostData {
  id: string;
  user_id: string;
  user_name?: string;
  title?: string;
  content: string;
  topic?: string;
  status: string;
  likes?: number;
  views?: number;
  comment_count?: number;
  created_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deleted_reason?: string | null;
  images?: string[];
}

const PostDetailModalById: React.FC<PostDetailModalByIdProps> = ({ isOpen, onClose, postId }) => {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && postId) {
      console.log('🔄 [PostDetailModalById] Fetching post:', postId);
      fetchPost(postId);
    }
  }, [isOpen, postId]);

  const fetchPost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 [PostDetailModalById] Calling API...');
      const response = await apiClient.get(`/community/posts/${id}`);
      console.log('📥 [PostDetailModalById] Response:', response);
      
      // Xử lý các format response khác nhau
      let postData = null;
      if ((response as any).data) {
        postData = (response as any).data;
      } else if ((response as any).id) {
        postData = response;
      }
      
      console.log('✅ [PostDetailModalById] Post data:', postData);
      setPost(postData);
    } catch (err: any) {
      console.error('❌ [PostDetailModalById] Error:', err);
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã xuất bản' },
      removed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã gỡ' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Nháp' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết bài viết</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Đang tải bài viết...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 font-semibold mb-2">Lỗi</p>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {!loading && !error && post && (
              <div className="space-y-6">
                {/* Status & Meta */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(post.status)}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {post.user_name || `User ${post.user_id}`}
                    </div>
                    <div className="text-sm text-gray-500">ID: {post.user_id}</div>
                  </div>
                </div>

                {/* Title */}
                {post.title && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Tiêu đề
                    </h3>
                    <p className="text-xl font-bold text-gray-900">{post.title}</p>
                  </div>
                )}

                {/* Topic */}
                {post.topic && (
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {post.topic}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Nội dung
                  </h3>
                  <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Hình ảnh ({post.images.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-2 text-red-600 mb-1">
                      <Heart className="w-5 h-5" />
                      <span className="text-2xl font-bold">{post.likes || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">Lượt thích</div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-2 text-blue-600 mb-1">
                      <Eye className="w-5 h-5" />
                      <span className="text-2xl font-bold">{post.views || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">Lượt xem</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-2xl font-bold">{post.comment_count || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">Bình luận</div>
                  </div>
                </div>

                {/* Deleted Info */}
                {post.deleted_at && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-700 mb-2">
                      Thông tin gỡ bài
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian gỡ:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(post.deleted_at)}
                        </span>
                      </div>
                      {post.deleted_by && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Người gỡ:</span>
                          <span className="font-medium text-gray-900">{post.deleted_by}</span>
                        </div>
                      )}
                      {post.deleted_reason && (
                        <div className="mt-2">
                          <span className="text-gray-600">Lý do:</span>
                          <p className="mt-1 text-gray-900">{post.deleted_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post ID */}
                <div className="border-t pt-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded text-sm">
                    <span className="text-gray-600">ID bài viết:</span>
                    <span className="font-mono text-gray-900">{post.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailModalById;
