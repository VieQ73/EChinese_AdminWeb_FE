import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, createPost, updatePost, removePost, restorePost, hardDeletePost, fetchComments, addComment, removeComment, hardDeleteComment, addReply, reportPost, fetchUserPosts, likePost, sharePost } from '../communityApi';

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPosts();
      setPosts(res || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    reload: loadPosts,
    createPost: async (payload: any) => { const p = await createPost(payload); await loadPosts(); return p; },
    updatePost: async (id: string, payload: any) => { const p = await updatePost(id, payload); await loadPosts(); return p; },
  removePost: async (id: string, opts?: any) => { await removePost(id, opts); await loadPosts(); },
  restorePost: async (id: string, opts?: any) => { await restorePost(id, opts); await loadPosts(); },
  hardDeletePost: async (id: string, opts?: any) => { await hardDeletePost(id, opts); await loadPosts(); },
    // comments
    fetchComments: async (postId: string) => { return await fetchComments(postId); },
    addComment: async (postId: string, payload: any) => { const c = await addComment(postId, payload); return c; },
    addReply: async (postId: string, parentCommentId: string, payload: any) => { const c = await addReply(postId, parentCommentId, payload); return c; },
  removeComment: async (commentId: string, opts?: any) => { await removeComment(commentId, opts); },
  hardDeleteComment: async (commentId: string, opts?: any) => { await hardDeleteComment(commentId, opts); },
    reportPost: async (postId: string, payload: any) => { await reportPost(postId, payload); await loadPosts(); },
    fetchUserPosts: async (userId: string) => { return await fetchUserPosts(userId); },
    likePost: async (postId: string) => { await likePost(postId); await loadPosts(); },
    sharePost: async (postId: string) => { await sharePost(postId); await loadPosts(); },
  };
};

export default useCommunity;
