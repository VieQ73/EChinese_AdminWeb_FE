import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, X, Send, Eye, MoreHorizontal, Pin, Edit, Trash2 } from 'lucide-react';
import type { Post, Comment } from '../../../types/entities';
import { mockUsers } from '../../../mock/users';
import { mockBadgeLevels } from '../../../mock/badgeLevels';
import { getCommentsByPostId, getParentComments } from '../../../mock/comments';
import { useAuth } from '../../../hooks/useAuth';
import CommentItem from './CommentItem';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
  isLiked: boolean;
  isViewed: boolean;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onToggleView: (postId: string, isViewed: boolean) => void;
  onUserClick?: (userId: string) => void;
}

// Helper function để tính thời gian tương đối
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}



const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  isLiked,
  isViewed,
  onToggleLike,
  onToggleView,
  onUserClick
}) => {
  const currentUser = useAuth(); // Lấy thông tin user hiện tại
  const [newComment, setNewComment] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // State để lưu comments tạm thời (sẽ mất sau khi reload)
  const [tempComments, setTempComments] = useState<Comment[]>([]);

  // Reset state khi modal đóng/mở hoặc post thay đổi
  useEffect(() => {
    if (isOpen && post) {
      setNewComment('');
      setShowDropdown(false);
      setTempComments([]); // Reset temp comments
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  // Lấy thông tin user và badge
  const postUser = mockUsers.find(u => u.id === post.user_id);
  const userBadge = mockBadgeLevels.find(b => b.level === postUser?.badge_level);
  
  // Kiểm tra quyền
  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';

  // Lấy comments gốc từ mock data
  const mockComments = getCommentsByPostId(post.id);
  const mockParentComments = getParentComments(post.id);
  
  // Kết hợp với temp comments để hiển thị
  const allComments = [...mockComments, ...tempComments];
  const parentComments = [...mockParentComments, ...tempComments.filter(c => !c.parent_comment_id)];



  // Xử lý comment mới
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // Tạo comment mới với ID random
    const newCommentObj: Comment = {
      id: `temp_comment_${Date.now()}`,
      post_id: post.id,
      user_id: currentUser?.id || 'anonymous', // Sử dụng user ID thật
      content: {
        html: `<p>${newComment}</p>`
      },
      parent_comment_id: null,
      created_at: new Date().toISOString(),
      deleted_by: null,
    };
    
    // Thêm vào temp comments
    setTempComments(prev => [...prev, newCommentObj]);
    setNewComment('');
    console.log('Added new comment:', newCommentObj);
  };

  // Xử lý thêm reply
  const handleAddReply = (parentCommentId: string, content: string) => {
    const replyComment: Comment = {
      id: `temp_reply_${Date.now()}`,
      post_id: post.id,
      user_id: currentUser?.id || 'anonymous', // Sử dụng user ID thật
      content: {
        html: `<p>${content}</p>`
      },
      parent_comment_id: parentCommentId,
      created_at: new Date().toISOString(),
      deleted_by: null,
    };
    
    // Thêm vào temp comments
    setTempComments(prev => [...prev, replyComment]);
    console.log('Added reply comment:', replyComment);
  };

  // Xử lý Like - Toggle state như PostCard
  const handleLike = () => {
    const newLikedState = !isLiked;
    
    // Gọi callback với state mới
    onToggleLike(post.id, newLikedState);
  };

  // Xử lý View - Toggle state như PostCard  
  const handleView = () => {
    const newViewedState = !isViewed;
    
    // Gọi callback với state mới
    onToggleView(post.id, newViewedState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <h3 className="text-xl font-bold">Chi tiết bài viết</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col max-h-[calc(90vh-80px)]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Post Content */}
            <div className="p-6 border-b">
            {/* User Info */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <img 
                  src={postUser?.avatar_url || '/default-avatar.png'} 
                  alt={postUser?.name || 'User'}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onUserClick?.(post.user_id)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-semibold text-gray-900 hover:underline cursor-pointer"
                        onClick={() => onUserClick?.(post.user_id)}
                      >
                        {postUser?.name}
                      </span>
                      {userBadge && (
                        <span className="text-lg" title={userBadge.name}>
                          {userBadge.icon}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="font-medium text-blue-600">{post.topic}</span>
                      <span>•</span>
                      <span>{timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown - Chỉ hiển thị cho owner hoặc admin */}
                  {(isOwner || isAdmin) && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      {showDropdown && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                          {isAdmin && (
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                              <Pin className="w-4 h-4" />
                              Ghim bài viết
                            </button>
                          )}
                          {isOwner && (
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                              <Edit className="w-4 h-4" />
                              Chỉnh sửa
                            </button>
                          )}
                          {(isOwner || isAdmin) && (
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                              Gỡ bài viết
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Title & Content */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: post.content?.html || 
                          (post.content?.text ? `<p>${post.content.text.replace(/\n/g, '<br>')}</p>` : '') 
                }}
              />
              
              {/* Hiển thị hình ảnh nếu có */}
              {post.content?.images && post.content.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {post.content.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Hình ảnh ${index + 1}`}
                      className="w-full h-auto rounded-lg object-cover max-h-96"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Hiển thị số lượng tương tác ngay trong nút như PostCard */}
            <div className="flex items-center gap-1 pt-3 border-t">
              <button 
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors group ${
                  isLiked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 transition-colors ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover:text-red-500'
                }`} />
                <span className={`font-medium transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-700 group-hover:text-red-500'
                }`}>
                  {isLiked ? 'Bỏ thích' : 'Thích'} {post.likes > 0 ? `(${post.likes})` : ''}
                </span>
              </button>
              
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-700 font-medium group-hover:text-blue-500 transition-colors">
                  Bình luận {allComments.length > 0 ? `(${allComments.length})` : ''}
                </span>
              </button>
              
              <button 
                onClick={handleView}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors group ${
                  isViewed ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Eye className={`w-5 h-5 transition-colors ${
                  isViewed ? 'text-green-500 fill-green-500' : 'text-gray-600 group-hover:text-green-500'
                }`} />
                <span className={`font-medium transition-colors ${
                  isViewed ? 'text-green-600' : 'text-gray-700 group-hover:text-green-500'
                }`}>
                  {isViewed ? 'Đã xem' : 'Xem'} {post.views > 0 ? `(${post.views})` : ''}
                </span>
              </button>
            </div>
          </div>

            {/* Comments Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Bình luận ({allComments.length})
              </h3>

              {/* Comments List */}
              <div className="space-y-4">
                {parentComments.map(comment => (
                  <CommentItem 
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    depth={0}
                    onAddReply={handleAddReply}
                    tempComments={tempComments}
                    onUserClick={onUserClick}
                  />
                ))}
              </div>

              {parentComments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có bình luận nào</p>
                  <p className="text-sm">Hãy là người đầu tiên bình luận về bài viết này!</p>
                </div>
              )}
            </div>
          </div>

          {/* Comment Input - Fixed at bottom */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-3">
              <img 
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format"}
                alt={currentUser?.name || "Your avatar"}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format";
                }}
              />
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="w-full p-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-300 transition-all"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  {newComment.trim() && (
                    <button 
                      onClick={handleSubmitComment}
                      className="absolute right-3 top-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;