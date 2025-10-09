import React from 'react';
import { Report, User, RawPost, Comment } from '../../../../types';

interface TargetContentDisplayProps {
    targetType: Report['target_type'];
    targetContent: Report['targetContent'];
    reason?: string;
    details?: string;
}

const TargetContentDisplay: React.FC<TargetContentDisplayProps> = ({ targetType, targetContent, reason, details }) => {
    
    const renderContent = () => {
        if (!targetContent) {
            return <p className="text-sm text-gray-500 italic">Không thể tải nội dung.</p>;
        }
        
        const user = targetContent as Partial<User>;
        const post = targetContent as Partial<RawPost>;
        const comment = targetContent as Partial<Comment>;

        switch (targetType) {
            case 'user':
                return (
                    <div className="flex items-center space-x-3">
                        <img src={user.avatar_url || ''} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                );
            case 'post':
                return (
                    <div>
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3 italic">
                            "{post.content?.text || post.content?.html?.replace(/<[^>]*>?/gm, '')}"
                        </p>
                    </div>
                );
            case 'comment':
                return (
                    <blockquote className="border-l-4 border-gray-300 pl-4">
                        <p className="text-sm text-gray-700 italic">"{comment.content?.text}"</p>
                    </blockquote>
                );
            case 'bug':
            case 'other':
                return(
                     <div>
                        <p className="font-semibold">{reason}</p>
                        <p className="text-sm text-gray-600 mt-1">{details}</p>
                    </div>
                );
            default:
                return <p className="text-sm text-gray-500">Loại nội dung không xác định.</p>;
        }
    };

    return (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            {renderContent()}
        </div>
    );
};

export default TargetContentDisplay;
