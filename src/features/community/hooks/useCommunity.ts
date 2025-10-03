import { useState, useEffect, useCallback } from 'react';
import type { Post, Comment } from '../../../types/entities';
import type { PaginatedResponse } from '../../../types/api';
import * as communityApi from '../communityApi';

// Hook chính cho việc quản lý state cộng đồng
export const useCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Hàm load posts với pagination và filter
  const loadPosts = useCallback(async (params: communityApi.FetchPostsParams = {}) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Post> = await communityApi.fetchPosts({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setPosts(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        page: response.meta.page,
        limit: response.meta.limit
      }));
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Load posts khi component mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ===== POSTS MANAGEMENT =====
  
  const createPost = async (payload: communityApi.PostPayload): Promise<Post> => {
    const newPost = await communityApi.createPost(payload);
    await loadPosts(); // Reload để lấy data mới nhất
    return newPost;
  };

  const updatePost = async (id: string, payload: Partial<communityApi.PostPayload>): Promise<Post> => {
    const updatedPost = await communityApi.updatePost(id, payload);
    setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
    return updatedPost;
  };

  const removePost = async (id: string, options?: communityApi.AdminActionOptions): Promise<void> => {
    await communityApi.removePost(id, options);
    await loadPosts(); // Reload để update trạng thái
  };

  const restorePost = async (id: string, options?: communityApi.AdminActionOptions): Promise<Post> => {
    const restoredPost = await communityApi.restorePost(id, options);
    setPosts(prev => prev.map(p => p.id === id ? restoredPost : p));
    return restoredPost;
  };

  const hardDeletePost = async (id: string, options?: communityApi.AdminActionOptions): Promise<void> => {
    await communityApi.hardDeletePost(id, options);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const pinPost = async (id: string): Promise<Post> => {
    const pinnedPost = await communityApi.pinPost(id);
    setPosts(prev => prev.map(p => p.id === id ? pinnedPost : p));
    return pinnedPost;
  };

  const unpinPost = async (id: string): Promise<Post> => {
    const unpinnedPost = await communityApi.unpinPost(id);
    setPosts(prev => prev.map(p => p.id === id ? unpinnedPost : p));
    return unpinnedPost;
  };

  const approvePost = async (id: string): Promise<Post> => {
    const approvedPost = await communityApi.approvePost(id);
    setPosts(prev => prev.map(p => p.id === id ? approvedPost : p));
    return approvedPost;
  };

  const rejectPost = async (id: string, reason?: string): Promise<void> => {
    await communityApi.rejectPost(id, reason);
    await loadPosts();
  };

  // ===== COMMENTS MANAGEMENT =====
  
  const fetchComments = async (postId: string, includeDeleted = false): Promise<Comment[]> => {
    return await communityApi.fetchComments(postId, includeDeleted);
  };

  const addComment = async (postId: string, payload: communityApi.CommentPayload): Promise<Comment> => {
    return await communityApi.addComment(postId, payload);
  };

  const addReply = async (postId: string, parentCommentId: string, payload: communityApi.CommentPayload): Promise<Comment> => {
    return await communityApi.addReply(postId, parentCommentId, payload);
  };

  const removeComment = async (commentId: string, options?: communityApi.AdminActionOptions): Promise<void> => {
    await communityApi.removeComment(commentId, options);
  };

  const restoreComment = async (commentId: string, options?: communityApi.AdminActionOptions): Promise<Comment> => {
    return await communityApi.restoreComment(commentId, options);
  };

  const hardDeleteComment = async (commentId: string, options?: communityApi.AdminActionOptions): Promise<void> => {
    await communityApi.hardDeleteComment(commentId, options);
  };

  // ===== INTERACTIONS =====
  
  const likePost = async (postId: string): Promise<void> => {
    await communityApi.likePost(postId);
    // Cập nhật local state để UI phản hồi ngay
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likes: (p.likes || 0) + 1 }
        : p
    ));
  };

  const unlikePost = async (postId: string): Promise<void> => {
    await communityApi.unlikePost(postId);
    // Cập nhật local state
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likes: Math.max((p.likes || 0) - 1, 0) }
        : p
    ));
  };

  const viewPost = async (postId: string): Promise<void> => {
    await communityApi.viewPost(postId);
    // Cập nhật local state
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, views: (p.views || 0) + 1 }
        : p
    ));
  };

  const sharePost = async (postId: string): Promise<void> => {
    await communityApi.sharePost(postId);
  };

  // ===== REPORTS =====
  
  const reportPost = async (postId: string, payload: communityApi.ReportPayload): Promise<void> => {
    await communityApi.reportPost(postId, payload);
  };

  const reportComment = async (commentId: string, payload: communityApi.ReportPayload): Promise<void> => {
    await communityApi.reportComment(commentId, payload);
  };

  // ===== PAGINATION =====
  
  const goToPage = (page: number): void => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number): void => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // ===== USER POSTS =====
  
  const fetchUserPosts = async (userId: string, params?: communityApi.FetchPostsParams): Promise<PaginatedResponse<Post>> => {
    return await communityApi.fetchUserPosts(userId, params);
  };

  const fetchUserPostsAll = async (userId: string, params?: communityApi.FetchPostsParams): Promise<PaginatedResponse<Post>> => {
    return await communityApi.fetchUserPostsAll(userId, params);
  };

  const getUserPostStats = async (userId: string) => {
    return await communityApi.getUserPostStats(userId);
  };

  return {
    // State
    posts,
    loading,
    pagination,
    
    // Posts management
    loadPosts,
    createPost,
    updatePost,
    removePost,
    restorePost,
    hardDeletePost,
    pinPost,
    unpinPost,
    approvePost,
    rejectPost,
    
    // Comments management
    fetchComments,
    addComment,
    addReply,
    removeComment,
    restoreComment,
    hardDeleteComment,
    
    // Interactions
    likePost,
    unlikePost,
    viewPost,
    sharePost,
    
    // Reports
    reportPost,
    reportComment,
    
    // Pagination
    goToPage,
    changePageSize,
    
    // User posts
    fetchUserPosts,
    fetchUserPostsAll,
    getUserPostStats,
    
    // Utility
    reload: loadPosts
  };
};

export default useCommunity;
