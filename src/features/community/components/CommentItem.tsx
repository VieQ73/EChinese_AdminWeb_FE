import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Trash2 } from 'lucide-react';
import type { CommentWithUser } from '../../../types/entities';
import { useAuth } from '../../../hooks/useAuth';

interface CommentItemProps {
  comment: CommentWithUser;
  depth?: number; // Theo dõi cấp độ thụt lề
  postId: string; // Cần để lấy nested replies
  onAddReply?: (parentCommentId: string, content: string) => void; // Hàm để thêm reply
  tempComments?: CommentWithUser[]; // Temp comments để hiển thị realtime
  onUserClick?: (userId: string) => void; // Callback khi click vào user
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  depth = 0, 
  postId, 
  onAddReply, 
  tempComments = [], 
  onUserClick 
}) => {
  const currentUser = useAuth(); // Lấy thông tin user hiện tại
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Comment đã có embedded user và badge data
  const commentUser = comment.user;
  const userBadge = comment.badge;
  
  // Kiểm tra quyền xóa comment (chỉ owner hoặc admin)
  const isOwner = currentUser?.id === comment.user.id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
  const canDelete = isOwner || isAdmin;

  // Format thời gian theo Facebook style
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  // Xử lý xóa comment
  const handleDeleteComment = () => {
    // TODO: Implement delete logic
    console.log('Delete comment:', comment.id);
    setShowDropdown(false);
  };

  // Xử lý gửi reply
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // Gọi hàm callback để thêm reply
    onAddReply?.(comment.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
    // Hiển thị replies sau khi gửi thành công
    setShowReplies(true);
  };

  // Lấy replies từ comment data (đã enriched)
  const mockReplies = comment.replies || [];
  
  // Lấy temp replies cho comment này
  const tempReplies = tempComments?.filter(tc => tc.parent_comment_id === comment.id) || [];
  
  // Kết hợp mock và temp replies
  const nestedReplies = [...mockReplies, ...tempReplies];
  
  // Đếm tổng số replies (bao gồm temp replies)
  const mockTotalRepliesCount = mockReplies.length;
  const tempTotalRepliesCount = tempReplies.length;
  const totalRepliesCount = mockTotalRepliesCount + tempTotalRepliesCount;

  // Giới hạn depth tối đa cho việc trả lời
  const maxReplyDepth = 2; // Chỉ cho phép trả lời đến cấp 2 (hiển thị là cấp 3)
  const canReply = depth < maxReplyDepth;
  
  return (
    <div className="flex gap-3">{/* Không thụt lề ở đây, sẽ thụt lề ở container bên ngoài */}
      {/* Avatar */}
      <img 
        src={commentUser?.avatar_url || '/default-avatar.png'} 
        alt={commentUser?.name || 'User'}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onUserClick?.(comment.user.id)}
      />
      
      <div className="flex-1 min-w-0 relative group">
        {/* Comment Content */}
        <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
              onClick={() => onUserClick?.(comment.user.id)}
            >
              {commentUser?.name}
            </span>
            {userBadge && (
              <span className="text-lg" title={userBadge.name}>
                {userBadge.icon}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-800">
            {String(comment.content)}
          </div>
          
          {/* Dropdown Menu - chỉ hiện khi có quyền */}
          {canDelete && (
            <div ref={dropdownRef} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
                  <button
                    onClick={handleDeleteComment}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Gỡ bình luận
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center justify-between mt-1 ml-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatTime(comment.created_at)}</span>
            {/* Chỉ hiển thị nút trả lời nếu chưa đạt giới hạn depth */}
            {canReply && (
              <button 
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="hover:text-blue-600 font-medium"
              >
                Trả lời
              </button>
            )}
            {totalRepliesCount > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="hover:text-blue-600 font-medium"
              >
                {showReplies ? 'Ẩn phản hồi' : `${totalRepliesCount} phản hồi`}
              </button>
            )}
          </div>
        </div>

        {/* Reply Input - Chỉ hiển thị nếu được phép trả lời */}
        {showReplyBox && canReply && (
          <div className="mt-3">
            <div className="flex gap-2">
              <img 
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format"} 
                alt={currentUser?.name || "Your avatar"}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format";
                }}
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Viết phản hồi..."
                  className="w-full px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-300 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                {replyText.trim() && (
                  <button 
                    onClick={handleSendReply}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && nestedReplies.length > 0 && (
          <div className="mt-3">
            {nestedReplies.map((reply, index) => (
              <div key={reply.id} className={`${index > 0 ? 'mt-3' : ''} ${
                depth === 0 ? 'ml-10' : 
                depth === 1 ? 'ml-10' : 
                ''  // Từ cấp 2 trở đi không thụt lề thêm
              }`}>
                <CommentItem 
                  comment={reply} 
                  postId={postId}
                  depth={depth < 2 ? depth + 1 : 2}
                  onAddReply={onAddReply}
                  tempComments={tempComments}
                  onUserClick={onUserClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;