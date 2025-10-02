import { apiClient } from '../../services/apiClient';

// Posts API
export const fetchPosts = (params: Record<string, any> = {}): Promise<any> => {
  return apiClient.get('/admin/posts', { params });
};

export const fetchPostById = (id: string): Promise<any> => {
  return apiClient.get(`/admin/posts/${id}`);
};

export const createPost = (payload: any): Promise<any> => {
  return apiClient.post('/admin/posts', payload);
};

export const updatePost = (id: string, payload: any): Promise<any> => {
  return apiClient.put(`/admin/posts/${id}`, payload);
};

export const removePost = (id: string, opts?: { reason?: string; self?: boolean; actor?: { id: string; role?: string } }): Promise<any> => {
  return apiClient.post(`/admin/posts/${id}/remove`, opts || {});
};

export const restorePost = (id: string, opts?: { actor?: { id: string; role?: string } }): Promise<any> => {
  return apiClient.post(`/admin/posts/${id}/restore`, opts || {});
};

export const hardDeletePost = (id: string, opts?: { reason?: string; actor?: { id: string; role?: string } }): Promise<any> => {
  return apiClient.delete(`/admin/posts/${id}`, { data: opts || {} });
};

export const pinPost = (id: string): Promise<any> => {
  return apiClient.post(`/admin/posts/${id}/pin`);
};

export const unpinPost = (id: string): Promise<any> => {
  return apiClient.post(`/admin/posts/${id}/unpin`);
};

// Comments API
export const fetchComments = (postId: string): Promise<any[]> => {
  return apiClient.get(`/posts/${postId}/comments`);
};

export const fetchUserComments = (userId: string, includeDeleted = false): Promise<any[]> => {
  return apiClient.get(`/users/${userId}/comments`, { params: { includeDeleted } });
};

export const addComment = (postId: string, payload: any): Promise<any> => {
  return apiClient.post(`/posts/${postId}/comments`, payload);
};

export const addReply = (postId: string, parentCommentId: string, payload: any): Promise<any> => {
  return apiClient.post(`/posts/${postId}/comments/${parentCommentId}/replies`, payload);
};

export const removeComment = (commentId: string, opts?: { reason?: string; self?: boolean; actor?: { id: string; role?: string } }): Promise<any> => {
  return apiClient.post(`/admin/comments/${commentId}/remove`, opts || {});
};

export const hardDeleteComment = (commentId: string, opts?: { actor?: { id: string; role?: string }; reason?: string }): Promise<any> => {
  return apiClient.delete(`/admin/comments/${commentId}`, { data: opts || {} });
};

// Interactions API  
export const likePost = (postId: string): Promise<any> => {
  return apiClient.post(`/posts/${postId}/like`);
};

export const unlikePost = (postId: string): Promise<any> => {
  return apiClient.delete(`/posts/${postId}/like`);
};

export const sharePost = (postId: string): Promise<any> => {
  return apiClient.post(`/posts/${postId}/share`);
};

export const reportPost = (postId: string, payload: any): Promise<any> => {
  return apiClient.post(`/posts/${postId}/reports`, payload);
};

// User Posts API
export const fetchUserPosts = (userId: string): Promise<any[]> => {
  return apiClient.get(`/users/${userId}/posts`);
};

export const fetchUserPostsAll = (userId: string): Promise<any[]> => {
  return apiClient.get(`/admin/users/${userId}/posts?include_deleted=true`);
};
