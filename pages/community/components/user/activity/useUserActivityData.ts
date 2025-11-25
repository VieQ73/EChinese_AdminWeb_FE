/**
 * Hook để enrich và filter posts/comments cho UserActivityModal
 */
import { useMemo } from 'react';
import { Post, CommentWithUser } from '../../../../../types';
import { useAppData } from '../../../../../contexts/appData/context';

// Hook trả về dữ liệu đã được enrich cho một user cụ thể
export const useUserActivityData = (userId: string) => {
    const { posts, postLikes, postViews, violations, comments, users, badges } = useAppData();

    // Helper để enrich post data
    const enrichPost = (post: typeof posts[0]): Post => {
        const postUser = users.find(u => u.id === post.user_id);
        const badge = badges.find(b => b.level === postUser?.badge_level) || badges[0];
        return {
            ...post,
            user: postUser || { 
                id: 'unknown', 
                name: 'Người dùng không xác định', 
                avatar_url: '', 
                badge_level: 0, 
                role: 'user' 
            },
            badge,
            comment_count: comments.filter(c => c.post_id === post.id && !c.deleted_at).length,
            likes: postLikes.filter(l => l.post_id === post.id).length,
            views: postViews.filter(v => v.post_id === post.id).length,
        };
    };

    // Bài viết của user (không bao gồm draft và removed)
    const userPosts = useMemo(() => {
        return posts
            .filter(p => p.user_id === userId && p.status !== 'draft' && p.status !== 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [posts, userId, postLikes, postViews, comments, users, badges]);

    // Bài user đã thích
    const userLikedPosts = useMemo(() => {
        const likedPostIds = new Set(
            postLikes.filter(l => l.user_id === userId).map(l => l.post_id)
        );
        return posts
            .filter(p => likedPostIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [posts, postLikes, userId, postViews, comments, users, badges]);

    // Bài user đã bình luận
    const userCommentedPosts = useMemo(() => {
        const commentedPostIds = new Set(
            comments.filter(c => c.user_id === userId && !c.deleted_at).map(c => c.post_id)
        );
        return posts
            .filter(p => commentedPostIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [posts, comments, userId, postLikes, postViews, users, badges]);

    // Bài user đã xem
    const userViewedPosts = useMemo(() => {
        const viewedPostIds = new Set(
            postViews.filter(v => v.user_id === userId).map(v => v.post_id)
        );
        return posts
            .filter(p => viewedPostIds.has(p.id) && p.status !== 'removed')
            .map(enrichPost)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [posts, postViews, userId, postLikes, comments, users, badges]);

    // Bài viết đã bị gỡ của user
    const removedPosts = useMemo(() => {
        return posts
            .filter(p => p.user_id === userId && p.status === 'removed')
            .map(enrichPost)
            .sort((a, b) => {
                const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
                const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
                return bTime - aTime;
            });
    }, [posts, userId, postLikes, postViews, comments, users, badges]);

    // Bình luận đã bị gỡ của user
    const removedComments = useMemo(() => {
        return comments
            .filter(c => c.user_id === userId && !!c.deleted_at)
            .map(comment => {
                const commentUser = users.find(u => u.id === comment.user_id);
                const badge = badges.find(b => b.level === commentUser?.badge_level) || badges[0];
                return {
                    ...comment,
                    user: commentUser || users[0],
                    badge,
                    replies: [],
                } as CommentWithUser;
            })
            .sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime());
    }, [comments, userId, users, badges]);

    // Số vi phạm của user
    const violationCount = useMemo(() => 
        violations.filter(v => v.user_id === userId).length
    , [violations, userId]);

    return {
        userPosts,
        userLikedPosts,
        userCommentedPosts,
        userViewedPosts,
        removedPosts,
        removedComments,
        violationCount,
    };
};
