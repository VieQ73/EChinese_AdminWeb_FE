import React, { useState } from 'react';
import { Heart, MessageCircle, X, Send } from 'lucide-react';
import type { Post, Comment } from '../../../types/entities';
import { useAuth } from '../../../hooks/useAuth';
import { mockComments } from '../../../mock';

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
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

// Component hiển thị comment
const CommentItem: React.FC<{
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
}> = ({ comment, onReply }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReply(false);
    }
  };

  return (
    <div className="flex space-x-3">
      {/* Avatar */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
        {comment.user_id?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      
      {/* Nội dung comment */}
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            User {comment.user_id}
          </div>
          <p className="text-gray-800 text-sm">
            {typeof comment.content === 'string' 
              ? comment.content 
              : comment.content?.ops?.map((op: any) => op.insert).join('') || ''
            }
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{timeAgo(comment.created_at)}</span>
          <button 
            onClick={() => setShowReply(!showReply)}
            className="hover:text-blue-600"
          >
            Trả lời
          </button>
        </div>
        
        {/* Reply form */}
        {showReply && (
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết trả lời..."
              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleReply()}
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onLike,
  onComment
}) => {
  const currentUser = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post.likes || 0);

  // Lọc comments thuộc về bài viết này
  const postComments = mockComments.filter(comment => comment.post_id === post.id);

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setOptimisticLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    onLike?.(post.id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleReply = (commentId: string, content: string) => {
    // Xử lý reply - có thể expand sau
    console.log('Reply to comment:', commentId, content);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết bài viết</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-4 border-b border-gray-100">
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {post.user_id?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  User {post.user_id}
                </div>
                <div className="text-sm text-gray-500">
                  {post.topic && <span className="font-medium text-blue-600">{post.topic}</span>}
                  {post.topic && ' • '}
                  {timeAgo(post.created_at)}
                </div>
              </div>
            </div>

            {/* Post Title */}
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{post.title}</h3>
            )}

            {/* Post Content */}
            <div className="text-gray-800 whitespace-pre-wrap mb-4">
              {typeof post.content === 'string' 
                ? post.content 
                : post.content?.ops?.map((op: any) => op.insert).join('') || ''
              }
            </div>

            {/* Post Images */}
            {(post as any).images && (post as any).images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {(post as any).images.map((src: string, idx: number) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Post Stats and Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {optimisticLikes > 0 && (
                  <span className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    <span>{optimisticLikes}</span>
                  </span>
                )}
                <span>{postComments.length} bình luận</span>
                <span>{post.views || 0} lượt xem</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-600' : ''}`} />
                <span className="font-medium">Thích</span>
              </button>
              
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">Bình luận</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Bình luận ({postComments.length})
            </h4>
            
            {/* Comments List */}
            <div className="space-y-4 mb-4">
              {postComments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                postComments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Comment Input - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;