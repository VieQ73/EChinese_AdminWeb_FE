import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../../../contexts/AuthContext';
import type { Post, CommentWithUser, User, Comment } from '../../../../types';
import * as api from '../../api'; // Import API
import { useAppData } from '../../../../contexts/appData/context'; // ADD THIS
import { getEnrichedCommentsByPostId } from '../../../../mock/community'; // ADD THIS
import CommentItem from './CommentItem';
import ClickableUser from '../user/ClickableUser';
import Badge from '../ui/Badge';
import { Heart, MessageCircle, X, Send, Eye } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import ImageLightbox from '../ui/ImageLightbox';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
  isLiked: boolean;
  isViewed: boolean;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onToggleView: (postId: string, isViewed: boolean) => void;
  // onAddComment: (postId: string, content: string, parentCommentId?: string) => void; // REMOVED
  onRemoveComment: (comment: CommentWithUser) => void;
  onRestoreComment: (comment: CommentWithUser) => void;
  onUserClick: (user: User) => void;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "vừa xong";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút";
    return Math.floor(seconds) + " giây trước";
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  isLiked,
  isViewed,
  onToggleLike,
  onToggleView,
  onRemoveComment,
  onRestoreComment,
  onUserClick,
}) => {
  const authContext = useContext(AuthContext);
  const { comments: allComments, addComment: addCommentToContext } = useAppData();
  const currentUser = authContext?.user;
  const [newComment, setNewComment] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Lấy và xây dựng cây bình luận từ context thay vì fetch
  const comments = useMemo(() => {
    if (!post) return [];
    return getEnrichedCommentsByPostId(post.id, allComments);
  }, [post, allComments]);

  if (!isOpen || !post) return null;

  const isPostRemoved = post.status === 'removed';

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || isPostRemoved) return;
    try {
        const newCommentData = await api.addComment({ postId: post.id, content: newComment, userId: currentUser.id });
        addCommentToContext(newCommentData);
        setNewComment('');
    } catch(e) {
        alert("Gửi bình luận thất bại.");
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    if (!currentUser || isPostRemoved) return;
    try {
        const newReply = await api.addComment({ postId: post.id, content, userId: currentUser.id, parentCommentId });
        addCommentToContext(newReply);
    } catch(e) {
         alert("Gửi trả lời thất bại.");
    }
  };
  
  const handleRemoveOrRestoreComment = async (comment: CommentWithUser, action: 'remove' | 'restore') => {
      onClose(); // Đóng modal hiện tại
      if (action === 'remove') onRemoveComment(comment);
      else onRestoreComment(comment);
  }

  const totalComments = comments.reduce((count, comment) => {
    const countReplies = (c: CommentWithUser): number => 1 + c.replies.reduce((sum, r) => sum + countReplies(r), 0);
    return count + countReplies(comment);
  }, 0);

  const images = post.content?.images || [];
  const imageGridClass = images.length === 1 ? 'grid-cols-1' : 'grid-cols-2';


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0 relative">
            <h3 className="text-xl font-bold">Chi tiết bài viết</h3>
             {isPostRemoved && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-2">
                    <ShieldAlert size={14} /> Bài viết đã bị gỡ
                </div>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 flex-shrink-0 border-r overflow-y-auto p-6">
              <div className="flex items-start gap-3 mb-4">
                  <ClickableUser userId={post.user.id} onUserClick={onUserClick}>
                      <img 
                        src={post.user.avatar_url || '/default-avatar.png'} 
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                  </ClickableUser>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                      <ClickableUser userId={post.user.id} onUserClick={onUserClick}>
                          <span className="font-semibold text-gray-900 hover:underline">{post.user.name}</span>
                      </ClickableUser>
                      <Badge badge={post.badge} />
                  </div>
                  <p className="text-sm text-gray-500">{timeAgo(post.created_at)} · {post.topic}</p>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content?.html || '' }}
              />
              {images.length > 0 && (
                  <div className={`mt-4 grid ${imageGridClass} gap-2`}>
                      {images.map((image, index) => (
                          <div 
                              key={index}
                              className={`relative overflow-hidden rounded-lg cursor-pointer group
                                  ${images.length === 3 && index === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}
                              `}
                              onClick={() => setLightboxImage(image)}
                          >
                              <img
                                  src={image}
                                  alt={`Hình ảnh ${index + 1}`}
                                  className="w-full h-full object-cover border transition-transform duration-300 group-hover:scale-105"
                              />
                          </div>
                      ))}
                  </div>
              )}
            </div>

            <div className="w-1/2 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-lg font-semibold">Bình luận ({totalComments})</h3>
                {comments.length > 0 ? comments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onAddReply={handleAddReply}
                    onRemove={(c) => handleRemoveOrRestoreComment(c, 'remove')}
                    onRestore={(c) => handleRemoveOrRestoreComment(c, 'restore')}
                    onUserClick={onUserClick}
                    level={0}
                    isPostRemoved={isPostRemoved}
                  />
                )) : (
                  <div className="text-center py-8 text-gray-500">Chưa có bình luận nào.</div>
                )}
              </div>
              <div className="flex items-center gap-1 p-3 border-t border-b">
                 <button 
                  onClick={() => onToggleLike(post.id, !isLiked)}
                  disabled={isPostRemoved}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors group ${isLiked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-700'} disabled:opacity-50 disabled:hover:bg-transparent`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600 group-hover:text-red-500'}`} />
                  <span className="font-medium">{post.likes}</span>
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-gray-700">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{totalComments}</span>
                </div>
                <button 
                  onClick={() => onToggleView(post.id, !isViewed)}
                  disabled={isPostRemoved}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors group ${isViewed ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'} disabled:opacity-50 disabled:hover:bg-transparent`}>
                  <Eye className={`w-5 h-5 ${isViewed ? 'text-green-500' : 'text-gray-600 group-hover:text-green-500'}`} />
                   <span className="font-medium">{post.views}</span>
                </button>
              </div>
              <div className="bg-white p-4 flex-shrink-0">
                <div className="flex gap-3">
                  <img src={currentUser?.avatar_url || ''} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div className="relative flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={isPostRemoved ? "Không thể bình luận vào bài viết đã bị gỡ." : "Viết bình luận..."}
                      className="w-full p-3 pr-12 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                      rows={1}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); }}}
                      disabled={!currentUser || isPostRemoved}
                    />
                    <button onClick={handleSubmitComment} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={!newComment.trim() || !currentUser || isPostRemoved}>
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  );
};

export default PostDetailModal;