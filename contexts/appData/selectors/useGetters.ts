// contexts/appData/selectors/useGetters.ts
import { useCallback } from 'react';
import { Post, Comment, PostLike, PostView, RawPost, CommentWithUser, User } from '../../../types';
import { getEnrichedCommentsByPostId, mockUsers, mockBadges } from '../../../mock';

interface UseGettersProps {
    posts: Post[];
    allPosts: RawPost[];
    comments: Comment[];
    postLikes: PostLike[];
    postViews: PostView[];
}

export const useGetters = ({ posts, allPosts, comments, postLikes, postViews }: UseGettersProps) => {

    const getPostsByUserId = useCallback((userId: string) => {
        return posts.filter(p => p.user_id === userId && p.status !== 'draft');
    }, [posts]);

    const getLikedPostsByUserId = useCallback((userId: string) => {
        const likedPostIds = new Set(postLikes.filter(like => like.user_id === userId).map(like => like.post_id));
        return posts.filter(post => likedPostIds.has(post.id));
    }, [posts, postLikes]);

    const getViewedPostsByUserId = useCallback((userId: string) => {
        const viewedPostIds = new Set(postViews.filter(view => view.user_id === userId).map(view => view.post_id));
        return posts.filter(post => viewedPostIds.has(post.id));
    }, [posts, postViews]);
    
    const getCommentedPostsByUserId = useCallback((userId: string) => {
        const commentedPostIds = new Set(comments.filter(c => c.user_id === userId && !c.deleted_at).map(c => c.post_id));
        const uniquePostIds = Array.from(commentedPostIds);
        return uniquePostIds.map(postId => posts.find(p => p.id === postId)).filter(Boolean) as Post[];
    }, [posts, comments]);

    const getRemovedPostsByUserId = useCallback((userId: string) => {
        return posts.filter(p => p.user_id === userId && p.status === 'removed');
    }, [posts]);

    const getRemovedCommentsByUserId = useCallback((userId: string): CommentWithUser[] => {
        return comments
            .filter(c => c.user_id === userId && !!c.deleted_at)
            .map(comment => {
                const user = mockUsers.find(u => u.id === comment.user_id) as User;
                const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
                 return {
                    ...comment,
                    user,
                    badge,
                    replies: [],
                };
            })
            .sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime());
    }, [comments]);


    return {
        getPostsByUserId,
        getLikedPostsByUserId,
        getViewedPostsByUserId,
        getCommentedPostsByUserId,
        getRemovedPostsByUserId,
        getRemovedCommentsByUserId,
    };
};
