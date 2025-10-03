import type { PostView } from '../types/entities';

/** 
 * Mock data cho PostViews - Nhất quán với 9 users và 27 posts
 * Mỗi user xem ít nhất 2 bài của users khác + có thể xem bài của chính mình
 * Views bao gồm cả khách (user_id null) và users đã đăng nhập
 */
export const mockPostViews: PostView[] = [
  // ========== Post 001 views (5 views) ==========
  { id: 'view-001', post_id: 'post-001', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', viewed_at: '2024-10-01T08:15:00Z' },
  { id: 'view-002', post_id: 'post-001', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', viewed_at: '2024-10-01T08:45:00Z' },
  { id: 'view-003', post_id: 'post-001', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', viewed_at: '2024-10-01T09:30:00Z' },
  { id: 'view-004', post_id: 'post-001', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', viewed_at: '2024-10-01T10:00:00Z' },
  { id: 'view-005', post_id: 'post-001', user_id: null, viewed_at: '2024-10-01T12:00:00Z' }, // Khách

  // ========== Post 002 views (3 views) ==========
  { id: 'view-006', post_id: 'post-002', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', viewed_at: '2024-10-01T14:45:00Z' },
  { id: 'view-007', post_id: 'post-002', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', viewed_at: '2024-10-01T15:30:00Z' },
  { id: 'view-008', post_id: 'post-002', user_id: null, viewed_at: '2024-10-01T16:00:00Z' }, // Khách

  // ========== Post 004 views (4 views) ==========
  { id: 'view-009', post_id: 'post-004', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-29T10:25:00Z' },
  { id: 'view-010', post_id: 'post-004', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', viewed_at: '2024-09-29T10:50:00Z' },
  { id: 'view-011', post_id: 'post-004', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', viewed_at: '2024-09-29T11:30:00Z' },
  { id: 'view-012', post_id: 'post-004', user_id: null, viewed_at: '2024-09-29T14:00:00Z' }, // Khách

  // ========== Post 005 views (2 views) ==========
  { id: 'view-013', post_id: 'post-005', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', viewed_at: '2024-09-28T13:30:00Z' },
  { id: 'view-014', post_id: 'post-005', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', viewed_at: '2024-09-28T15:00:00Z' },

  // ========== Post 007 views (4 views) ==========
  { id: 'view-015', post_id: 'post-007', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-26T11:50:00Z' },
  { id: 'view-016', post_id: 'post-007', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', viewed_at: '2024-09-26T12:15:00Z' },
  { id: 'view-017', post_id: 'post-007', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', viewed_at: '2024-09-26T12:45:00Z' },
  { id: 'view-018', post_id: 'post-007', user_id: null, viewed_at: '2024-09-26T14:00:00Z' }, // Khách

  // ========== Post 008 views (3 views) ==========
  { id: 'view-019', post_id: 'post-008', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', viewed_at: '2024-09-25T15:25:00Z' },
  { id: 'view-020', post_id: 'post-008', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', viewed_at: '2024-09-25T15:50:00Z' },
  { id: 'view-021', post_id: 'post-008', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', viewed_at: '2024-09-25T16:15:00Z' },

  // ========== Post 010 views (2 views) ==========
  { id: 'view-022', post_id: 'post-010', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', viewed_at: '2024-09-23T12:30:00Z' },
  { id: 'view-023', post_id: 'post-010', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-23T13:30:00Z' },

  // ========== Post 011 views (3 views) ==========
  { id: 'view-024', post_id: 'post-011', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', viewed_at: '2024-09-22T19:30:00Z' },
  { id: 'view-025', post_id: 'post-011', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', viewed_at: '2024-09-22T20:30:00Z' },
  { id: 'view-026', post_id: 'post-011', user_id: null, viewed_at: '2024-09-22T21:00:00Z' }, // Khách

  // ========== Post 013 views (2 views) ==========
  { id: 'view-027', post_id: 'post-013', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', viewed_at: '2024-09-20T16:45:00Z' },
  { id: 'view-028', post_id: 'post-013', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', viewed_at: '2024-09-20T17:30:00Z' },

  // ========== Post 014 views (1 view) ==========
  { id: 'view-029', post_id: 'post-014', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', viewed_at: '2024-09-19T11:00:00Z' },

  // ========== Post 016 views (3 views) ==========
  { id: 'view-030', post_id: 'post-016', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', viewed_at: '2024-09-17T17:50:00Z' },
  { id: 'view-031', post_id: 'post-016', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-17T18:30:00Z' },
  { id: 'view-032', post_id: 'post-016', user_id: null, viewed_at: '2024-09-17T19:00:00Z' }, // Khách

  // ========== Post 017 views (2 views) ==========
  { id: 'view-033', post_id: 'post-017', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', viewed_at: '2024-09-16T13:30:00Z' },
  { id: 'view-034', post_id: 'post-017', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', viewed_at: '2024-09-16T14:30:00Z' },

  // ========== Post 019 views (4 views) ==========
  { id: 'view-035', post_id: 'post-019', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-14T15:50:00Z' },
  { id: 'view-036', post_id: 'post-019', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', viewed_at: '2024-09-14T16:15:00Z' },
  { id: 'view-037', post_id: 'post-019', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', viewed_at: '2024-09-14T16:45:00Z' },
  { id: 'view-038', post_id: 'post-019', user_id: null, viewed_at: '2024-09-14T18:00:00Z' }, // Khách

  // ========== Post 020 views (2 views) ==========
  { id: 'view-039', post_id: 'post-020', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', viewed_at: '2024-09-13T08:30:00Z' },
  { id: 'view-040', post_id: 'post-020', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', viewed_at: '2024-09-13T09:30:00Z' },

  // ========== Post 022 views (2 views) ==========
  { id: 'view-041', post_id: 'post-022', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', viewed_at: '2024-09-11T16:30:00Z' },
  { id: 'view-042', post_id: 'post-022', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-11T17:30:00Z' },

  // ========== Post 023 views (1 view) ==========
  { id: 'view-043', post_id: 'post-023', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', viewed_at: '2024-09-10T12:50:00Z' },

  // ========== Post 025 views (3 views) ==========
  { id: 'view-044', post_id: 'post-025', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', viewed_at: '2024-09-08T09:15:00Z' },
  { id: 'view-045', post_id: 'post-025', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', viewed_at: '2024-09-08T09:45:00Z' },
  { id: 'view-046', post_id: 'post-025', user_id: null, viewed_at: '2024-09-08T10:30:00Z' }, // Khách

  // ========== Post 026 views (2 views) ==========
  { id: 'view-047', post_id: 'post-026', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', viewed_at: '2024-09-07T15:45:00Z' },
  { id: 'view-048', post_id: 'post-026', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', viewed_at: '2024-09-07T16:30:00Z' }
];

/** Helper functions */
export const getPostViews = (postId: string): PostView[] => 
  mockPostViews.filter(view => view.post_id === postId);

export const getPostViewsCount = (postId: string): number => 
  mockPostViews.filter(view => view.post_id === postId).length;

export const hasUserViewedPost = (userId: string, postId: string): boolean =>
  mockPostViews.some(view => view.user_id === userId && view.post_id === postId);

export const getUserViews = (userId: string): PostView[] =>
  mockPostViews.filter(view => view.user_id === userId);

export const getUserViewedPostIds = (userId: string): string[] =>
  mockPostViews.filter(view => view.user_id === userId).map(view => view.post_id);

export const getAllPostViews = (): PostView[] => mockPostViews;