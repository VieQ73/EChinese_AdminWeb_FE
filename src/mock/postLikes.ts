import type { PostLike } from '../types/entities';

/** 
 * Mock data cho PostLikes - Nhất quán với 9 users và 27 posts
 * Mỗi user thích ít nhất 2 bài của users khác (không thích bài của chính mình)
 * Tổng số likes phải hợp lý với số lượng users
 */
export const mockPostLikes: PostLike[] = [
  // ========== Super Admin likes ==========
  { id: 'like-001', post_id: 'post-004', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', created_at: '2024-09-29T10:30:00Z' }, // Admin's post
  { id: 'like-002', post_id: 'post-007', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', created_at: '2024-09-26T12:00:00Z' }, // Văn A's post
  { id: 'like-003', post_id: 'post-019', user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', created_at: '2024-09-14T16:00:00Z' }, // Moderator's post
  
  // ========== Admin likes ==========
  { id: 'like-004', post_id: 'post-001', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', created_at: '2024-10-01T08:30:00Z' }, // Super Admin's post
  { id: 'like-005', post_id: 'post-008', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', created_at: '2024-09-25T15:45:00Z' }, // Văn A's post
  { id: 'like-006', post_id: 'post-025', user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', created_at: '2024-09-08T09:30:00Z' }, // Teacher's post

  // ========== Nguyễn Văn A likes ==========
  { id: 'like-007', post_id: 'post-001', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', created_at: '2024-10-01T09:00:00Z' }, // Super Admin's post
  { id: 'like-008', post_id: 'post-004', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', created_at: '2024-09-29T11:00:00Z' }, // Admin's post
  { id: 'like-009', post_id: 'post-022', user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', created_at: '2024-09-11T17:00:00Z' }, // Student's post

  // ========== Trần Thị B likes ==========
  { id: 'like-010', post_id: 'post-002', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', created_at: '2024-10-01T15:00:00Z' }, // Super Admin's post
  { id: 'like-011', post_id: 'post-005', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', created_at: '2024-09-28T14:00:00Z' }, // Admin's post
  { id: 'like-012', post_id: 'post-013', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', created_at: '2024-09-20T17:00:00Z' }, // Người bị khóa's post

  // ========== Người Bị Khóa likes ==========
  { id: 'like-013', post_id: 'post-007', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', created_at: '2024-09-26T12:30:00Z' }, // Văn A's post
  { id: 'like-014', post_id: 'post-016', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', created_at: '2024-09-17T18:00:00Z' }, // Lê Văn C's post
  { id: 'like-015', post_id: 'post-026', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', created_at: '2024-09-07T16:00:00Z' }, // Teacher's post

  // ========== Lê Văn C likes ==========
  { id: 'like-016', post_id: 'post-001', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', created_at: '2024-10-01T10:00:00Z' }, // Super Admin's post
  { id: 'like-017', post_id: 'post-010', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', created_at: '2024-09-23T13:00:00Z' }, // Trần Thị B's post
  { id: 'like-018', post_id: 'post-020', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', created_at: '2024-09-13T09:00:00Z' }, // Moderator's post

  // ========== Phạm Thị D - Moderator likes ==========
  { id: 'like-019', post_id: 'post-002', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', created_at: '2024-10-01T16:00:00Z' }, // Super Admin's post
  { id: 'like-020', post_id: 'post-008', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', created_at: '2024-09-25T16:00:00Z' }, // Văn A's post
  { id: 'like-021', post_id: 'post-023', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', created_at: '2024-09-10T13:00:00Z' }, // Student's post

  // ========== Hoàng Văn E - Student likes ==========
  { id: 'like-022', post_id: 'post-004', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', created_at: '2024-09-29T12:00:00Z' }, // Admin's post
  { id: 'like-023', post_id: 'post-011', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', created_at: '2024-09-22T20:00:00Z' }, // Trần Thị B's post
  { id: 'like-024', post_id: 'post-025', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', created_at: '2024-09-08T10:00:00Z' }, // Teacher's post

  // ========== Vũ Thị F - Teacher likes ==========
  { id: 'like-025', post_id: 'post-001', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', created_at: '2024-10-01T11:00:00Z' }, // Super Admin's post
  { id: 'like-026', post_id: 'post-017', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', created_at: '2024-09-16T14:00:00Z' }, // Lê Văn C's post
  { id: 'like-027', post_id: 'post-019', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', created_at: '2024-09-14T16:30:00Z' }, // Moderator's post

  // ========== Thêm một số likes để bài có nhiều hơn 1 like ==========
  { id: 'like-028', post_id: 'post-001', user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', created_at: '2024-10-01T12:00:00Z' }, // Post-001: 4 likes total
  { id: 'like-029', post_id: 'post-001', user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', created_at: '2024-10-01T13:00:00Z' },
  { id: 'like-030', post_id: 'post-004', user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', created_at: '2024-09-29T13:00:00Z' }, // Post-004: 4 likes total
  { id: 'like-031', post_id: 'post-007', user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', created_at: '2024-09-26T13:00:00Z' }, // Post-007: 3 likes total
  { id: 'like-032', post_id: 'post-008', user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', created_at: '2024-09-25T16:30:00Z' }, // Post-008: 3 likes total
  { id: 'like-033', post_id: 'post-019', user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', created_at: '2024-09-14T17:00:00Z' }, // Post-019: 3 likes total
];

/** Helper functions */
export const getPostLikes = (postId: string): PostLike[] => 
  mockPostLikes.filter(like => like.post_id === postId);

export const getPostLikesCount = (postId: string): number => 
  mockPostLikes.filter(like => like.post_id === postId).length;

export const hasUserLikedPost = (userId: string, postId: string): boolean =>
  mockPostLikes.some(like => like.user_id === userId && like.post_id === postId);

export const getUserLikes = (userId: string): PostLike[] =>
  mockPostLikes.filter(like => like.user_id === userId);

export const getUserLikedPostIds = (userId: string): string[] =>
  mockPostLikes.filter(like => like.user_id === userId).map(like => like.post_id);

export const getAllPostLikes = (): PostLike[] => mockPostLikes;