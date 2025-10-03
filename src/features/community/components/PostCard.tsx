import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Pin, MoreVertical } from 'lucide-react';
import type { Post } from '../../../types/entities';
import { useAuth } from '../../../hooks/useAuth';
import { mockUsers, mockBadgeLevels } from '../../../mock';
import { getPostCommentsCount } from '../../../mock/comments';

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  isViewed: boolean;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onToggleView: (postId: string, isViewed: boolean) => void;
  onComment: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onUserClick?: (userId: string) => void;
}

// Helper function để format thời gian
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

// Component chính PostCard theo design từ AdminCommunityInstruction.md
const PostCard: React.FC<PostCardProps> = ({
  post,
  isLiked,
  isViewed,
  onToggleLike,
  onToggleView, 
  onComment,
  onPin,
  onUnpin,
  onEdit,
  onRemove,
  onUserClick
}) => {
  const currentUser = useAuth();
  
  // State cho UI
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State cho overflow detection
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  const MAX_HEIGHT_PX = 150; // Giới hạn chiều cao như yêu cầu
  
  // Kiểm tra nội dung có bị overflow không
  useEffect(() => {
    if (contentRef.current) {
      const isContentOverflowing = contentRef.current.scrollHeight > MAX_HEIGHT_PX;
      setIsOverflowing(isContentOverflowing);
    }
  }, [post.content]);

  // Helper functions để lấy thông tin user và badge
  const getUserById = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || mockUsers[0];
  };

  const getBadgeByLevel = (level: number) => {
    return mockBadgeLevels.find(b => b.level === level) || mockBadgeLevels[0];
  };

  const user = getUserById(post.user_id);
  const badge = getBadgeByLevel(user.badge_level);
  const commentsCount = getPostCommentsCount(post.id);

  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
  const isDeleted = !!post.deleted_at;

  // Handler functions
  const handleToggleLike = () => {
    const newLikedState = !isLiked;
    onToggleLike(post.id, newLikedState);
  };

  const handleToggleView = () => {
    const newViewedState = !isViewed;
    onToggleView(post.id, newViewedState);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isDeleted ? 'opacity-60' : ''}`}>
      {/* Header - Thông tin người đăng */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div 
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onUserClick?.(post.user_id)}
            >
              <img 
                src={user.avatar_url || '/default-avatar.png'} 
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              {!user.is_active && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </div>
            
            {/* Tên và thông tin */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span 
                  className="font-semibold text-gray-900 hover:underline cursor-pointer"
                  onClick={() => onUserClick?.(post.user_id)}
                >
                  {user.name}
                </span>
                <span className="text-lg" title={badge.name}>
                  {badge.icon}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium text-blue-600">{post.topic}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Trạng thái ghim và menu */}
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <Pin className="w-3 h-3" />
                <span>Đã ghim</span>
              </div>
            )}
            
            {(isOwner || isAdmin) && (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {isAdmin && !isDeleted && (
                    <>
                      {post.is_pinned ? (
                        <button onClick={onUnpin} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4" />
                          Bỏ ghim
                        </button>
                      ) : (
                        <button onClick={onPin} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4" />
                          Ghim bài viết
                        </button>
                      )}
                    </>
                  )}
                  {isOwner && !isDeleted && (
                    <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                      Chỉnh sửa
                    </button>
                  )}
                  {(isOwner || isAdmin) && !isDeleted && (
                    <button onClick={onRemove} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                      Gỡ bài viết
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Nội dung chính */}
      <div className="p-4">
        {/* Tiêu đề */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {post.title}
        </h3>
        
        {/* Nội dung với tính năng "Xem thêm" */}
        <div className="relative">
          <div 
            ref={contentRef}
            className={`text-gray-700 prose prose-sm max-w-none leading-relaxed transition-all duration-500 overflow-hidden ${
              isExpanded ? 'max-h-full' : ''
            }`}
            style={{ 
              maxHeight: !isExpanded ? `${MAX_HEIGHT_PX}px` : 'none'
            }}
            dangerouslySetInnerHTML={{ 
              __html: post.content?.html || 
                      (post.content?.text ? `<p>${post.content.text.replace(/\n/g, '<br>')}</p>` : '') 
            }}
          />
          
          {/* Hiển thị hình ảnh khi expanded - giống PostDetailModal */}
          {isExpanded && post.content?.images && post.content.images.length > 0 && (
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
          
          {/* Hiệu ứng mờ dần và nút "Xem thêm" */}
          {isOverflowing && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-2">
              <button 
                onClick={() => setIsExpanded(true)}
                className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md"
              >
                Xem thêm...
              </button>
            </div>
          )}
          
          {isExpanded && isOverflowing && (
            <div className="mt-2 text-center">
              <button 
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1 bg-gray-600 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
              >
                Thu gọn
              </button>
            </div>
          )}
        </div>
        
        {isDeleted && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg shadow-inner">
            <p className="text-red-700 text-sm font-medium">
              Bài viết đã bị gỡ: {post.deleted_reason}
            </p>
          </div>
        )}
      </div>
      
      {/* Thanh tương tác */}
      {!isDeleted && (
        <>
          {/* Actions - Thanh Tương tác Nhanh với số lượt tương tác */}
          <div className="px-4 py-3 border-t border-gray-100 grid grid-cols-3 gap-2">
            {/* Nút Thích/Bỏ thích */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-[1.02] active:scale-[0.98] ${
                isLiked 
                  ? 'text-red-600 bg-red-100 hover:bg-red-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{isLiked ? 'Bỏ thích' : 'Thích'} {post.likes > 0 ? `(${post.likes})` : ''}</span>
            </button>
            
            {/* Nút Bình luận - Mở giao diện chi tiết */}
            <button
              onClick={onComment}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-gray-600 hover:bg-gray-100 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Bình luận {commentsCount > 0 ? `(${commentsCount})` : ''}</span>
            </button>
            
            {/* Nút Xem/Đã xem */}
            <button
              onClick={handleToggleView}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-[1.02] active:scale-[0.98] ${
                isViewed 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className={`w-5 h-5 ${isViewed ? 'fill-current' : ''}`} />
              <span className="font-medium">{isViewed ? 'Đã xem' : 'Xem'} {post.views > 0 ? `(${post.views})` : ''}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PostCard;