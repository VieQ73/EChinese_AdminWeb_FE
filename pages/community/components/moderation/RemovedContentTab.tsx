import React, { useState, useMemo, useEffect } from 'react';
import type { User, Post, CommentWithUser } from '../../../../types';
import PostFeedCard from '../feed/PostCard';
import RemovedCommentCard from './RemovedCommentCard';

interface RemovedContentTabProps {
    user: User;
    currentUser: User | null;
    initialSubTab?: 'posts' | 'comments';
    getRemovedPostsByUserId: (userId: string) => Post[];
    getRemovedCommentsByUserId: (userId: string) => CommentWithUser[];
    onPostSelect: (post: Post) => void;
    likedPosts: Set<string>;
    viewedPosts: Set<string>;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onToggleView: (postId: string, isViewed: boolean) => void;
    onUserClick: (user: User) => void;
    onEditPost: (post: Post) => void;
    onRemovePost: (post: Post) => void;
    onRestorePost: (post: Post) => void;
    onRestoreComment: (comment: CommentWithUser) => void;
}

const SubTabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            active ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

const RemovedContentTab: React.FC<RemovedContentTabProps> = ({
    user,
    currentUser,
    initialSubTab,
    getRemovedPostsByUserId,
    getRemovedCommentsByUserId,
    onRestorePost,
    onRestoreComment,
    onEditPost,
    onRemovePost,
    ...postCardProps
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'posts' | 'comments'>(initialSubTab || 'posts');

    useEffect(() => {
        setActiveSubTab(initialSubTab || 'posts');
    }, [initialSubTab]);

    const removedPosts = useMemo(() => getRemovedPostsByUserId(user.id), [user.id, getRemovedPostsByUserId]);
    const removedComments = useMemo(() => getRemovedCommentsByUserId(user.id), [user.id, getRemovedCommentsByUserId]);

    const renderContent = () => {
        if (activeSubTab === 'posts') {
            return removedPosts.length > 0 ? (
                removedPosts.map(post => (
                    <div key={`removed-post-${post.id}`}>
                        <PostFeedCard 
                            {...postCardProps}
                            post={post}
                            currentUser={currentUser}
                            isLiked={postCardProps.likedPosts.has(post.id)}
                            isViewed={postCardProps.viewedPosts.has(post.id)}
                            onViewDetails={postCardProps.onPostSelect}
                            isRemoved={true}
                            onRestore={onRestorePost}
                            onEdit={onEditPost}
                            onRemove={onRemovePost}
                        />
                    </div>
                ))
            ) : <p className="text-center text-gray-500 py-16">Không có bài viết nào bị gỡ.</p>;
        }

        if (activeSubTab === 'comments') {
            return removedComments.length > 0 ? (
                removedComments.map(comment => (
                    <RemovedCommentCard
                        key={`removed-comment-${comment.id}`}
                        comment={comment}
                        onRestore={onRestoreComment}
                        canRestore={!!currentUser} // Chỉ admin mới thấy modal này nên luôn có thể restore
                    />
                ))
            ) : <p className="text-center text-gray-500 py-16">Không có bình luận nào bị gỡ.</p>;
        }

        return null;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <SubTabButton active={activeSubTab === 'posts'} onClick={() => setActiveSubTab('posts')}>
                    Bài viết ({removedPosts.length})
                </SubTabButton>
                <SubTabButton active={activeSubTab === 'comments'} onClick={() => setActiveSubTab('comments')}>
                    Bình luận ({removedComments.length})
                </SubTabButton>
            </div>
            <div className="space-y-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default RemovedContentTab;