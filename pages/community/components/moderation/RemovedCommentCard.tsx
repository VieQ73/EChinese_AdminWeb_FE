import React from 'react';
import type { CommentWithUser } from '../../../../types';
import { RestoreIcon } from '../../../../constants';
import { mockUsers } from '../../../../mock';

interface RemovedCommentCardProps {
    comment: CommentWithUser;
    onRestore: (comment: CommentWithUser) => void;
    canRestore: boolean;
    highlight?: boolean;
}

const RemovedCommentCard: React.FC<RemovedCommentCardProps> = ({ comment, onRestore, canRestore, highlight }) => {
    const deletedByAdmin = mockUsers.find(u => u.id === comment.deleted_by);
    
    // Format thời gian theo định dạng HH:mm:ss DD/MM/YYYY
    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${time} ${dateStr}`;
    };

    // Lấy nội dung từ html hoặc text
    const commentContent = comment.content?.html || comment.content?.text || '';

    return (
        <div id={comment.id} className={`bg-gray-50 p-4 rounded-lg border opacity-80 ${highlight ? 'border-primary-500 ring-2 ring-primary-400' : 'border-gray-200'}`}>
            <blockquote className="border-l-4 border-gray-300 pl-4 text-sm text-gray-700 italic">
                "{commentContent}"
            </blockquote>
            <div className="mt-3 text-xs text-gray-500">
                <p>
                    <span>Gỡ bởi: </span>
                    <span className="font-semibold">{deletedByAdmin?.name || 'Không rõ'}</span>
                    <span> lúc {formatDateTime(comment.deleted_at)}</span>
                </p>
                {comment.deleted_reason && (
                    <p className="mt-1">
                        <span>Lý do: </span>
                        <span className="font-medium">{comment.deleted_reason}</span>
                    </p>
                )}
            </div>
            {canRestore && (
                <div className="mt-3 text-right">
                    <button 
                        onClick={() => onRestore(comment)}
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
                    >
                       <RestoreIcon className="w-4 h-4 mr-1.5" /> Phục hồi
                    </button>
                </div>
            )}
        </div>
    );
};

export default RemovedCommentCard;