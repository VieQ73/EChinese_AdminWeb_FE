import React, { useRef, useCallback } from 'react';
import { Post, User } from '../../../../types';
import PostFeedCard from './PostCard';
import { Loader2 } from 'lucide-react';

interface PostFeedProps {
    posts: Post[];
    isLoading: boolean;
    hasMore: boolean;
    loadMorePosts: () => void;
    currentUser: User | null;
    onViewDetails: (post: Post) => void;
    onEdit: (post: Post) => void;
    onRemove: (post: Post) => void;
    onUserClick: (user: User) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    isLiked: (postId: string) => boolean;
    onToggleView: (postId: string, isViewed: boolean) => void;
    isViewed: (postId: string) => boolean;
}

const PostFeed: React.FC<PostFeedProps> = (props) => {
    const { posts, isLoading, hasMore, loadMorePosts, ...cardProps } = props;
    const observer = useRef<IntersectionObserver | null>(null);

    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMorePosts]);

    return (
        <div className="space-y-4">
            {posts.map((post, index) => {
                const card = (
                    <PostFeedCard
                        key={post.id} 
                        post={post}
                        currentUser={cardProps.currentUser}
                        onViewDetails={cardProps.onViewDetails}
                        onEdit={cardProps.onEdit}
                        onRemove={cardProps.onRemove}
                        onUserClick={cardProps.onUserClick}
                        onToggleLike={cardProps.onToggleLike}
                        isLiked={cardProps.isLiked(post.id)}
                        onToggleView={cardProps.onToggleView}
                        isViewed={cardProps.isViewed(post.id)}
                    />
                );

                if (posts.length === index + 1) {
                    return <div ref={lastPostElementRef} key={post.id}>{card}</div>;
                }
                return card;
            })}

            {isLoading && (
                 <div className="flex justify-center items-center p-8">
                     <Loader2 className="w-8 h-8 animate-spin text-primary-600"/>
                     <p className="ml-3 text-gray-500">Đang tải...</p>
                 </div>
            )}

            {!isLoading && posts.length === 0 && (
                <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                    <p>Không tìm thấy bài viết nào.</p>
                </div>
            )}
        </div>
    );
};

export default PostFeed;