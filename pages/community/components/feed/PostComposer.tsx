import React from 'react';
import { User } from '../../../../types';

interface PostComposerProps {
    currentUser: User | null;
    onCreatePost: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ currentUser, onCreatePost }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
            <img
                src={currentUser?.avatar_url || '/default-avatar.png'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
            />
            <button
                onClick={onCreatePost}
                className="flex-1 text-left text-gray-500 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors"
            >
                Bạn đang nghĩ gì, {currentUser?.name || '...'}?
            </button>
        </div>
    );
};

export default PostComposer;