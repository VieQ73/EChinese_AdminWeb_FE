/**
 * Các Tab component cho UserActivityModal
 * Mỗi tab sử dụng hook riêng để fetch data
 */
import React, { useState, useEffect } from 'react';
import { User, Post, CommentWithUser } from '../../../../types';
import PostFeedCard from '../feed/PostCard';
import RemovedCommentCard from '../moderation/RemovedCommentCard';
import {
    useUserPosts,
    useUserLikedPosts,
    useUserCommentedPosts,
    useUserViewedPosts,
    useUserRemovedPosts,
    useUserRemovedComments,
} from '../../hooks/useUserActivity';

// Props chung cho các tab bài viết
interface PostTabProps {
    userId: string;
    enabled: boolean;
    currentUser: User | null;
    likedPosts: Set<string>;
    viewedPosts: Set<string>;
    onPostSelect: (post: Post) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onToggleView: (postId: string, isViewed: boolean) => void;
    onUserClick: (user: User) => void;
    onEditPost: (post: Post) => void;
    onRemovePost: (post: Post) => void;
}

// Loading skeleton
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-32" />
        ))}
    </div>
);

// Empty state
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <p className="text-center text-gray-500 py-12">{message}</p>
);

// Component render danh sách bài viết
const PostList: React.FC<{
    posts: Post[];
    isLoading: boolean;
    emptyMsg: string;
    tabKey: string;
    isRemoved?: boolean;
    onRestore?: (post: Post) => void;
} & Omit<PostTabProps, 'userId' | 'enabled'>> = ({
    posts, isLoading, emptyMsg, tabKey, isRemoved, onRestore, ...props
}) => {
    if (isLoading) return <LoadingSkeleton />;
    if (!posts?.length) return <EmptyState message={emptyMsg} />;

    return (
        <>
            {posts.map(post => (
                <PostFeedCard
                    key={`${tabKey}-${post.id}`}
                    post={post}
                    currentUser={props.currentUser}
                    isLiked={props.likedPosts.has(post.id)}
                    isViewed={props.viewedPosts.has(post.id)}
                    onViewDetails={props.onPostSelect}
                    onEdit={props.onEditPost}
                    onRemove={props.onRemovePost}
                    onToggleLike={props.onToggleLike}
                    onToggleView={props.onToggleView}
                    onUserClick={props.onUserClick}
                    isRemoved={isRemoved}
                    onRestore={isRemoved ? onRestore : undefined}
                />
            ))}
        </>
    );
};

// Tab: Bài đã đăng
export const PostsTab: React.FC<PostTabProps> = ({ userId, enabled, ...props }) => {
    const { data = [], isLoading } = useUserPosts(userId, enabled);
    return <PostList posts={data} isLoading={isLoading} emptyMsg="Chưa có bài viết nào." tabKey="posts" {...props} />;
};

// Tab: Đã thích
export const LikesTab: React.FC<PostTabProps> = ({ userId, enabled, ...props }) => {
    const { data = [], isLoading } = useUserLikedPosts(userId, enabled);
    return <PostList posts={data} isLoading={isLoading} emptyMsg="Chưa thích bài viết nào." tabKey="likes" {...props} />;
};

// Tab: Đã bình luận
export const CommentsTab: React.FC<PostTabProps> = ({ userId, enabled, ...props }) => {
    const { data = [], isLoading } = useUserCommentedPosts(userId, enabled);
    return <PostList posts={data} isLoading={isLoading} emptyMsg="Chưa bình luận bài nào." tabKey="comments" {...props} />;
};

// Tab: Đã xem
export const ViewsTab: React.FC<PostTabProps> = ({ userId, enabled, ...props }) => {
    const { data = [], isLoading } = useUserViewedPosts(userId, enabled);
    return <PostList posts={data} isLoading={isLoading} emptyMsg="Chưa xem bài viết nào." tabKey="views" {...props} />;
};

// Tab: Đã gỡ (có subtab)
interface RemovedTabProps extends PostTabProps {
    initialSubTab?: 'posts' | 'comments';
    onRestorePost: (post: Post) => void;
    onRestoreComment: (comment: CommentWithUser) => void;
}

export const RemovedTab: React.FC<RemovedTabProps> = ({
    userId, enabled, initialSubTab, onRestorePost, onRestoreComment, ...props
}) => {
    const [subTab, setSubTab] = useState<'posts' | 'comments'>(initialSubTab || 'posts');
    const { data: posts = [], isLoading: loadingPosts } = useUserRemovedPosts(userId, enabled && subTab === 'posts');
    const { data: comments = [], isLoading: loadingComments } = useUserRemovedComments(userId, enabled && subTab === 'comments');

    useEffect(() => {
        if (initialSubTab) setSubTab(initialSubTab);
    }, [initialSubTab]);

    const SubTabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = 
        ({ active, onClick, children }) => (
            <button
                onClick={onClick}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    active ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                {children}
            </button>
        );

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <SubTabBtn active={subTab === 'posts'} onClick={() => setSubTab('posts')}>
                    Bài viết ({posts.length})
                </SubTabBtn>
                <SubTabBtn active={subTab === 'comments'} onClick={() => setSubTab('comments')}>
                    Bình luận ({comments.length})
                </SubTabBtn>
            </div>
            <div className="space-y-4">
                {subTab === 'posts' ? (
                    <PostList
                        posts={posts}
                        isLoading={loadingPosts}
                        emptyMsg="Không có bài viết nào bị gỡ."
                        tabKey="removed"
                        isRemoved
                        onRestore={onRestorePost}
                        {...props}
                    />
                ) : loadingComments ? (
                    <LoadingSkeleton />
                ) : comments.length ? (
                    comments.map(c => (
                        <RemovedCommentCard key={c.id} comment={c} onRestore={onRestoreComment} canRestore={!!props.currentUser} />
                    ))
                ) : (
                    <EmptyState message="Không có bình luận nào bị gỡ." />
                )}
            </div>
        </div>
    );
};
