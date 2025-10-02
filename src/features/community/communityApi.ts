import { apiClient } from '../../services/apiClient';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Minimal mock store for posts
let mockPosts: Array<any> = [
  {
    id: 'p-1',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // testuser1
    user_role: 'user',
    title: 'Welcome to Admin Feed',
    content: { ops: [{ insert: 'Hello admins! This is a mock post.' }] },
    topic: 'Học tiếng Trung',
    images: [],
    likes: 5,
    comments_count: 2,
    reports_count: 0,
    created_at: new Date().toISOString(),
    deleted_at: null,
    removed_kind: null,
  }
  ,
  {
    id: 'p-2',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // admin
    user_role: 'admin',
    title: '',
    content: { ops: [{ insert: 'Hôm nay mình học được một câu mới: 你好 (Nǐ hǎo)!' }] },
    topic: 'Tâm sự',
    images: ['https://picsum.photos/seed/p2a/800/600'],
    likes: 12,
    comments_count: 1,
    reports_count: 0,
    created_at: new Date(Date.now()-1000*60*60).toISOString(),
    deleted_at: null,
    removed_kind: null,
  },
  {
    id: 'p-3',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // testuser2
    user_role: 'user',
    title: 'Hình ảnh lớp học',
    content: { ops: [{ insert: 'Buổi học hôm nay rất thú vị, xem vài tấm ảnh nhé.' }] },
    topic: 'Tâm sự',
    images: ['https://picsum.photos/seed/p3a/800/600', 'https://picsum.photos/seed/p3b/800/600'],
    likes: 3,
    comments_count: 0,
    reports_count: 0,
    created_at: new Date(Date.now()-1000*60*60*5).toISOString(),
    deleted_at: null,
    removed_kind: null,
  }
];
// mock comments store
let mockComments: Array<any> = [
  { id: 'c-1', post_id: 'p-1', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', content: { ops: [{ insert: 'Nice post!' }] }, likes: 0, parent_comment_id: null, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'c-2', post_id: 'p-1', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', content: { ops: [{ insert: 'Cảm ơn hộ chủ tus' }] }, likes: 0, parent_comment_id: 'c-1', created_at: new Date().toISOString(), deleted_at: null },
];

// ensure posts' comments_count reflect actual mockComments
const recomputeCommentsCounts = ()=>{
  mockPosts = mockPosts.map(p=>{
    const cnt = mockComments.filter(c=> c.post_id === p.id && !c.deleted_at).length;
    return { ...p, comments_count: cnt };
  });
};

// initial sync
recomputeCommentsCounts();

// mock admin logs
const mockAdminLogs: Array<any> = [];

export const fetchPosts = (params: Record<string, any> = {}): Promise<any> => {
  // params: { page?: number, limit?: number, q?: string }
  if (USE_MOCK_API) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    // filter out deleted posts by default
    const rows = mockPosts.filter(p => !p.deleted_at).slice().reverse();
    const start = (page - 1) * limit;
    const slice = rows.slice(start, start + limit);
    const result = { items: slice, total: rows.length, page, limit };
    return new Promise(resolve => setTimeout(() => resolve(result), 500));
  }
  return apiClient.get('/admin/posts', { params });
};

export { mockAdminLogs };

export const fetchPostById = (id: string): Promise<any> => {
  if (USE_MOCK_API) {
    const p = mockPosts.find(m => m.id === id);
    return new Promise(resolve => setTimeout(() => resolve(p), 200));
  }
  return apiClient.get(`/admin/posts/${id}`);
};

export const createPost = (payload: any): Promise<any> => {
  if (USE_MOCK_API) {
    const p = { id: `p-${Date.now()}`, ...payload, created_at: new Date().toISOString(), likes: 0, comments_count: 0, reports_count: 0 };
    mockPosts.push(p);
    return new Promise(resolve => setTimeout(() => resolve(p), 300));
  }
  return apiClient.post('/admin/posts', payload);
};

export const updatePost = (id: string, payload: any): Promise<any> => {
  if (USE_MOCK_API) {
    mockPosts = mockPosts.map(p => p.id === id ? { ...p, ...payload } : p);
    const updated = mockPosts.find(p => p.id === id);
    return new Promise(resolve => setTimeout(() => resolve(updated), 300));
  }
  return apiClient.put(`/admin/posts/${id}`, payload);
};

export const removePost = (id: string, opts?: { reason?: string; self?: boolean; actor?: { id:string; role?:string } }): Promise<any> => {
  if (USE_MOCK_API) {
    const now = new Date().toISOString();
    mockPosts = mockPosts.map(p => {
      if (p.id !== id) return p;
      return { ...p, deleted_at: now, removed_kind: opts?.self ? 'self' : 'soft', deleted_reason: opts?.reason || null, deleted_by: opts?.actor?.id || 'admin-mock' };
    });
    // record admin log
    mockAdminLogs.push({ id: `log-${Date.now()}`, action: 'remove_post', target: id, actor: opts?.actor || null, reason: opts?.reason || null, at: now });
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Removed (mock)' }), 300));
  }
  return apiClient.post(`/admin/posts/${id}/remove`, opts || {});
};

export const restorePost = (id: string, opts?: { actor?: { id:string; role?:string } }): Promise<any> => {
  if (USE_MOCK_API) {
    const now = new Date().toISOString();
    mockPosts = mockPosts.map(p => p.id === id ? { ...p, deleted_at: null, removed_kind: null, deleted_reason: null, deleted_by: null } : p);
    mockAdminLogs.push({ id: `log-${Date.now()}`, action: 'restore_post', target: id, actor: opts?.actor || null, at: now });
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Restored (mock)' }), 300));
  }
  return apiClient.post(`/admin/posts/${id}/restore`);
};

export const hardDeletePost = (id: string, opts?: { reason?: string; actor?: { id:string; role?:string } }): Promise<any> => {
  if (USE_MOCK_API) {
    mockPosts = mockPosts.filter(p => p.id !== id);
    mockAdminLogs.push({ id: `log-${Date.now()}`, action: 'hard_delete_post', target: id, actor: opts?.actor || null, reason: opts?.reason || null, at: new Date().toISOString() });
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Hard deleted (mock)' }), 300));
  }
  return apiClient.delete(`/admin/posts/${id}`, { data: opts || {} });
};

// --- Comments ---
export const fetchComments = (postId: string): Promise<any[]> => {
  if (USE_MOCK_API) {
    // return nested comments in a flat array (client will group by parent)
    const rows = mockComments.filter(c => c.post_id === postId && !c.deleted_at).map(c => ({ ...c }));
    return new Promise(resolve => setTimeout(() => resolve(rows), 200));
  }
  return apiClient.get(`/posts/${postId}/comments`);
};

export const addComment = (postId: string, payload: any): Promise<any> => {
  if (USE_MOCK_API) {
    const c = { id: `c-${Date.now()}`, post_id: postId, ...payload, created_at: new Date().toISOString(), likes: 0 };
    mockComments.push(c);
    recomputeCommentsCounts();
    return new Promise(resolve => setTimeout(() => resolve(c), 200));
  }
  return apiClient.post(`/posts/${postId}/comments`, payload);
};

// add a reply to a comment (nested comments)
export const addReply = (postId: string, parentCommentId: string, payload: any): Promise<any> => {
  if (USE_MOCK_API) {
    const c = { id: `c-${Date.now()}`, post_id: postId, parent_comment_id: parentCommentId, ...payload, created_at: new Date().toISOString(), likes: 0 };
    mockComments.push(c);
    recomputeCommentsCounts();
    return new Promise(resolve => setTimeout(() => resolve(c), 200));
  }
  return apiClient.post(`/posts/${postId}/comments/${parentCommentId}/replies`, payload);
};

export const likePost = (postId: string): Promise<any> => {
  if (USE_MOCK_API) {
    mockPosts = mockPosts.map(p => p.id === postId ? { ...p, likes: (p.likes||0) + 1 } : p);
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Liked (mock)' }), 150));
  }
  return apiClient.post(`/posts/${postId}/like`);
};

export const sharePost = (postId: string): Promise<any> => {
  if (USE_MOCK_API) {
    mockPosts = mockPosts.map(p => p.id === postId ? { ...p, shares: (p.shares||0) + 1 } : p);
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Shared (mock)' }), 150));
  }
  return apiClient.post(`/posts/${postId}/share`);
};

// report a post
export const reportPost = (postId: string, payload: any): Promise<any> => {
  if (USE_MOCK_API) {
    mockPosts = mockPosts.map(p => p.id === postId ? { ...p, reports_count: (p.reports_count||0) + 1 } : p);
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Reported (mock)' }), 200));
  }
  return apiClient.post(`/posts/${postId}/reports`, payload);
};

// fetch posts by a user
export const fetchUserPosts = (userId: string): Promise<any[]> => {
  if (USE_MOCK_API) {
    const rows = mockPosts.filter(p => p.user_id === userId && !p.deleted_at).slice().reverse();
    return new Promise(resolve => setTimeout(() => resolve(rows), 200));
  }
  return apiClient.get(`/users/${userId}/posts`);
};

// Fetch all posts for a user including deleted (mock only). Useful for admin user profile panel.
export const fetchUserPostsAll = (userId: string): Promise<any[]> => {
  if (USE_MOCK_API) {
    const rows = mockPosts.filter(p => p.user_id === userId).slice().reverse();
    return new Promise(resolve => setTimeout(() => resolve(rows), 200));
  }
  // Fallback to normal endpoint for non-mock mode (server should provide admin endpoint)
  return apiClient.get(`/admin/users/${userId}/posts?include_deleted=true`);
};

export const removeComment = (commentId: string, opts?: { reason?: string; self?: boolean; actor?: { id:string; role?:string } }): Promise<any> => {
  if (USE_MOCK_API) {
    const now = new Date().toISOString();
    mockComments = mockComments.map(c => c.id === commentId ? { ...c, deleted_at: now, deleted_reason: opts?.reason || null, deleted_by: opts?.actor?.id || 'admin-mock' } : c);
    mockAdminLogs.push({ id: `log-${Date.now()}`, action: 'remove_comment', target: commentId, actor: opts?.actor || null, reason: opts?.reason || null, at: now });
    recomputeCommentsCounts();
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Comment removed (mock)' }), 200));
  }
  return apiClient.post(`/admin/comments/${commentId}/remove`, opts || {});
};

export const hardDeleteComment = (commentId: string, opts?: { actor?: { id:string; role?:string }; reason?: string }): Promise<any> => {
  if (USE_MOCK_API) {
    mockComments = mockComments.filter(c => c.id !== commentId);
    mockAdminLogs.push({ id: `log-${Date.now()}`, action: 'hard_delete_comment', target: commentId, actor: opts?.actor || null, reason: opts?.reason || null, at: new Date().toISOString() });
    recomputeCommentsCounts();
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Comment hard deleted (mock)' }), 200));
  }
  return apiClient.delete(`/admin/comments/${commentId}`);
};

// exported functions above
