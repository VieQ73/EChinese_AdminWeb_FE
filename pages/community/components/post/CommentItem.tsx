import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../../../contexts/AuthContext';
import { CommentWithUser, User } from '../../../../types';
import ClickableUser from '../user/ClickableUser';
import Badge from '../ui/Badge';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
import { RestoreIcon } from '../../../../constants';

const INDENT_CLASSES = ['pl-0', 'pl-8', 'pl-16'];
const MAX_INDENT_INDEX = INDENT_CLASSES.length - 1;

interface CommentItemProps {
  comment: CommentWithUser;
  onAddReply: (parentCommentId: string, content: string) => void;
  onRemove: (comment: CommentWithUser) => void;
  onRestore: (comment: CommentWithUser) => void;
  onUserClick: (user: User) => void;
  level: number;
  isPostRemoved?: boolean;
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'vừa xong';
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' năm';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' tháng';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' ngày';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' giờ';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' phút';
  return Math.floor(seconds) + ' giây trước';
};

const countTotalDescendants = (comment: CommentWithUser) => {
  if (!comment.replies || comment.replies.length === 0) return 0;
  let count = comment.replies.length;
  comment.replies.forEach((r) => (count += countTotalDescendants(r)));
  return count;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onRemove,
  onRestore,
  onUserClick,
  level,
  isPostRemoved,
}) => {
  const { user: currentUser } = useContext(AuthContext) || {};
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isCommentRemoved = !!comment.deleted_at;

  const hasMultipleDirectReplies = comment.replies && comment.replies.length > 1;
  const defaultExpanded = level === 0 || !hasMultipleDirectReplies;
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(defaultExpanded);

  const totalDescendantCount = useMemo(
    () => (comment.replies ? countTotalDescendants(comment) : 0),
    [comment.replies]
  );

  const canRemove =
    !isCommentRemoved &&
    currentUser &&
    (currentUser.id === comment.user.id ||
      (currentUser.role === 'super admin' && comment.user.role !== 'super admin') ||
      (currentUser.role === 'admin' && comment.user.role === 'user'));

  const canRestore =
    isCommentRemoved &&
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'super admin');

  const canInteract = !isCommentRemoved && !isPostRemoved && !!currentUser;

  const handleReplySubmit = () => {
    if (replyContent.trim() && canInteract) {
      onAddReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      if (!isRepliesExpanded) setIsRepliesExpanded(true);
    }
  };

  // toggle mở / đóng ô phản hồi
  const handleStartReply = () => {
    if (!canInteract) return;

    if (isReplying) {
      setIsReplying(false);
      setReplyContent('');
      return;
    }

    setIsReplying(true);
    if (!replyContent.trim()) {
      setReplyContent(`@${comment.user.name} `);
    }
  };

  const visualLevel = Math.min(level, MAX_INDENT_INDEX);
  const indentClass = INDENT_CLASSES[visualLevel];
  const borderClass = visualLevel > 0 ? 'border-l-2 border-gray-200' : '';

  const showToggleButton = hasMultipleDirectReplies;

  return (
    <div className="mt-4">
      <div className={`flex items-start gap-3 ${indentClass} ${borderClass}`}>
        <ClickableUser userId={comment.user.id} onUserClick={onUserClick}>
          <img
            src={
              comment.user.avatar_url ||
              'https://placehold.co/36x36/cccccc/333333?text=A'
            }
            alt={comment.user.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        </ClickableUser>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-xl p-3 relative">
            {isCommentRemoved && (
              <div
                className="absolute -top-1 -right-1"
                title={`Đã bị gỡ: ${comment.deleted_reason || 'Không có lý do'}`}
              >
                <AlertCircle size={16} className="text-red-500 fill-red-100" />
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <ClickableUser userId={comment.user.id} onUserClick={onUserClick}>
                <span className="font-semibold text-sm text-gray-800 hover:underline">
                  {comment.user.name}
                </span>
              </ClickableUser>
              <Badge badge={comment.badge} />
            </div>
            <p className="text-gray-700 text-sm mt-1 break-words">
              {comment.content.text}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 pl-1">
            <span>{timeAgo(comment.created_at)}</span>
            <button
              onClick={handleStartReply}
              className="font-semibold hover:underline text-blue-600 disabled:text-gray-400 disabled:no-underline"
              disabled={!canInteract}
            >
              Phản hồi
            </button>
            {isCommentRemoved ? (
              canRestore && (
                <button
                  onClick={() => onRestore(comment)}
                  className="font-semibold hover:underline text-green-600 flex items-center gap-1"
                >
                  <RestoreIcon className="w-3 h-3" /> Khôi phục
                </button>
              )
            ) : (
              canRemove && (
                <button
                  onClick={() => onRemove(comment)}
                  className="font-semibold hover:underline text-red-500"
                >
                  Gỡ
                </button>
              )
            )}
            {showToggleButton && (
              <button
                onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                className="font-semibold hover:underline text-gray-500 flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3 text-gray-400" />
                {isRepliesExpanded
                  ? 'Ẩn phản hồi'
                  : `Xem ${totalDescendantCount} phản hồi`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isRepliesExpanded &&
          comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onAddReply={onAddReply}
              onRemove={onRemove}
              onRestore={onRestore}
              onUserClick={onUserClick}
              level={level + 1}
              isPostRemoved={isPostRemoved}
            />
          ))}

        {isReplying && (
          <div
            className={`mt-2 flex gap-2 ${
              INDENT_CLASSES[Math.min(level + 1, MAX_INDENT_INDEX)]
            } ${borderClass}`}
          >
            <img
              src={
                currentUser?.avatar_url ||
                'https://placehold.co/32x32/cccccc/333333?text=You'
              }
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời ${comment.user.name}...`}
                className="w-full text-sm p-2 pr-10 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                autoFocus
              />
              <button
                onClick={handleReplySubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                disabled={!replyContent.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
