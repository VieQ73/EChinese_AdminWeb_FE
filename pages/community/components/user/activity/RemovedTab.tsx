/**
 * Tab hiển thị nội dung đã bị gỡ (bài viết + bình luận)
 */
import React, { useState, useEffect } from 'react';
import { Post, CommentWithUser } from '../../../../../types';
import RemovedCommentCard from '../../moderation/RemovedCommentCard';
import PostList from './PostList';
import { SubTabButton, EmptyState } from './TabComponents';
import { RemovedTabProps } from './types';
import { useUserActivityData } from './useUserActivityData';

const RemovedTab: React.FC<RemovedTabProps> = ({
    user,
    currentUser,
    initialSubTab,
    likedPosts,
    viewedPosts,
    onPostSelect,
    onToggleLike,
    onToggleView,
    onUserClick,
    onEditPost,
    onRemovePost,
    onRestorePost,
    onRestoreComment,
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'posts' | 'comments'>(initialSubTab || 'posts');
    const { removedPosts, removedComments } = useUserActivityData(user.id);

    // Reset subtab khi initialSubTab thay đổi
    useEffect(() => {
        if (initialSubTab) {
            setActiveSubTab(initialSubTab);
        }
    }, [initialSubTab]);

    return (
        <div className="space-y-3">
            {/* SubTab buttons */}
            <div className="flex items-center space-x-2">
                <SubTabButton 
                    active={activeSubTab === 'posts'} 
                    onClick={() => setActiveSubTab('posts')}
                >
                    Bài viết ({removedPosts.length})
                </SubTabButton>
                <SubTabButton 
                    active={activeSubTab === 'comments'} 
                    onClick={() => setActiveSubTab('comments')}
                >
                    Bình luận ({removedComments.length})
                </SubTabButton>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeSubTab === 'posts' ? (
                    <PostList
                        posts={removedPosts}
                        tabKey="removed-posts"
                        emptyMessage="Không có bài viết nào bị gỡ."
                        currentUser={currentUser}
                        likedPosts={likedPosts}
                        viewedPosts={viewedPosts}
                        onViewDetails={onPostSelect}
                        onEdit={onEditPost}
                        onRemove={onRemovePost}
                        onToggleLike={onToggleLike}
                        onToggleView={onToggleView}
                        onUserClick={onUserClick}
                        isRemoved={true}
                        onRestore={onRestorePost}
                    />
                ) : (
                    removedComments.length > 0 ? (
                        removedComments.map(comment => (
                            <RemovedCommentCard
                                key={`removed-comment-${comment.id}`}
                                comment={comment}
                                onRestore={onRestoreComment}
                                canRestore={!!currentUser}
                            />
                        ))
                    ) : (
                        <EmptyState message="Không có bình luận nào bị gỡ." />
                    )
                )}
            </div>
        </div>
    );
};

export default RemovedTab;
