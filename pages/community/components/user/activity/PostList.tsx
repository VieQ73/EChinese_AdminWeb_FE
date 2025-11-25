/**
 * Component hiển thị danh sách bài viết dùng chung cho các tab
 */
import React from 'react';
import { User, Post } from '../../../../../types';
import PostFeedCard from '../../feed/PostCard';
import { EmptyState } from './TabComponents';

interface PostListProps {
    posts: Post[];
    tabKey: string;
    emptyMessage: string;
    currentUser: User | null;
    likedPosts: Set<string>;
    viewedPosts: Set<string>;
    onViewDetails: (post: Post) => void;
    onEdit: (post: Post) => void;
    onRemove: (post: Post) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onToggleView: (postId: string, isViewed: boolean) => void;
    onUserClick: (user: User) => void;
    isRemoved?: boolean;
    onRestore?: (post: Post) => void;
}

const PostList: React.FC<PostListProps> = ({
    posts,
    tabKey,
    emptyMessage,
    currentUser,
    likedPosts,
    viewedPosts,
    onViewDetails,
    onEdit,
    onRemove,
    onToggleLike,
    onToggleView,
    onUserClick,
    isRemoved = false,
    onRestore,
}) => {
    if (posts.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <>
            {posts.map(post => (
                <PostFeedCard
                    key={`${tabKey}-${post.id}`}
                    post={post}
                    currentUser={currentUser}
                    isLiked={likedPosts.has(post.id)}
                    isViewed={viewedPosts.has(post.id)}
                    onViewDetails={onViewDetails}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onToggleLike={onToggleLike}
                    onToggleView={onToggleView}
                    onUserClick={onUserClick}
                    isRemoved={isRemoved}
                    onRestore={isRemoved ? onRestore : undefined}
                />
            ))}
        </>
    );
};

export default PostList;
