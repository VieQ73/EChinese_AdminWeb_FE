// contexts/appData/actions/communityActions.ts
import { useCallback } from 'react';
import { RawPost, Comment, PostLike, PostView } from '../../../types';
import { cacheService } from '../../../services/cacheService';

interface UseCommunityActionsProps {
  setPostsData: React.Dispatch<React.SetStateAction<RawPost[]>>;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setPostLikes: React.Dispatch<React.SetStateAction<PostLike[]>>;
  setPostViews: React.Dispatch<React.SetStateAction<PostView[]>>;
}

export const useCommunityActions = ({ setPostsData, setComments, setPostLikes, setPostViews }: UseCommunityActionsProps) => {

    const addPost = useCallback((post: RawPost) => {
        setPostsData(prev => [post, ...prev]);
        cacheService.invalidatePosts();
    }, [setPostsData]);

    const updatePost = useCallback((postId: string, updates: Partial<RawPost>) => {
        setPostsData(prev => prev.map(p => (p.id === postId ? { ...p, ...updates } : p)));
        cacheService.invalidatePosts();
    }, [setPostsData]);

    const addComment = useCallback((comment: Comment) => {
        setComments(prev => [...prev, comment]);
        cacheService.invalidatePosts();
    }, [setComments]);

    const updateComment = useCallback((commentId: string, updates: Partial<Comment>) => {
        setComments(prev => prev.map(c => (c.id === commentId ? { ...c, ...updates } : c)));
        cacheService.invalidatePosts();
    }, [setComments]);

    const toggleLike = useCallback((postId: string, userId: string) => {
        setPostLikes(prev => {
            const likeIndex = prev.findIndex(l => l.post_id === postId && l.user_id === userId);
            if (likeIndex > -1) {
                // Nếu đã thích, xóa lượt thích (unlike)
                return prev.filter((_, index) => index !== likeIndex);
            } else {
                // Nếu chưa thích, thêm lượt thích mới (like)
                return [...prev, { id: `like_${Date.now()}`, post_id: postId, user_id: userId, created_at: new Date().toISOString() }];
            }
        });
    }, [setPostLikes]);

    const toggleView = useCallback((postId: string, userId: string) => {
        setPostViews(prev => {
            const viewIndex = prev.findIndex(v => v.post_id === postId && v.user_id === userId);
            if (viewIndex > -1) {
                // Nếu đã xem, xóa lượt xem (unview)
                return prev.filter((_, index) => index !== viewIndex);
            } else {
                // Nếu chưa xem, thêm lượt xem mới (view)
                return [...prev, { id: `view_${Date.now()}`, post_id: postId, user_id: userId, viewed_at: new Date().toISOString() }];
            }
        });
    }, [setPostViews]);

    return { addPost, updatePost, addComment, updateComment, toggleLike, toggleView };
};
