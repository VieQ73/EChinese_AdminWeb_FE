import type { Comment } from '../types/entities';

export const mockComments: Comment[] = [
  // Post 001 comments (5 comments)
  {
    id: 'comment-001',
    post_id: 'post-001',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    content: { html: '<p>Bài viết rất hữu ích! Mình cũng đang học HSK4.</p>' },
    created_at: '2025-10-02T09:00:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-002',
    post_id: 'post-001',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    content: { html: '<p>Cảm ơn bạn đã chia sẻ! Chúng tôi sẽ có thêm tài liệu HSK4 sớm.</p>' },
    created_at: '2025-10-02T09:30:00Z',
    parent_comment_id: 'comment-001',
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-003',
    post_id: 'post-001',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    content: { html: '<p>Mình cũng gặp vấn đề tương tự với ngữ pháp này.</p>' },
    created_at: '2025-10-02T10:15:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-004',
    post_id: 'post-001',
    user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    content: { html: '<p>Bạn có thể tham khảo thêm sách "HSK Standard Course" nhé.</p>' },
    created_at: '2025-10-02T11:00:00Z',
    parent_comment_id: 'comment-003',
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-005',
    post_id: 'post-001',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
    content: { html: '<p>Thanks for sharing! Rất có ích.</p>' },
    created_at: '2025-10-02T12:30:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },

  // Post 002 comments (3 comments)
  {
    id: 'comment-006',
    post_id: 'post-002',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    content: { html: '<p>Kinh nghiệm rất quý báu! Cảm ơn bạn đã chia sẻ.</p>' },
    created_at: '2025-10-02T15:00:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-007',
    post_id: 'post-002',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
    content: { html: '<p>Mình cũng đang chuẩn bị du học. Có thể inbox để trao đổi không?</p>' },
    created_at: '2025-10-02T15:45:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-008',
    post_id: 'post-002',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    content: { html: '<p>Nhóm có thể tạo một topic riêng để thảo luận về du học nhé!</p>' },
    created_at: '2025-10-02T16:15:00Z',
    parent_comment_id: 'comment-007',
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },

  // Post 004 comments (2 comments)
  {
    id: 'comment-009',
    post_id: 'post-004',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    content: { html: '<p>Văn hóa trà đạo thật thú vị. Mình muốn tìm hiểu thêm.</p>' },
    created_at: '2025-10-01T11:00:00Z',
    parent_comment_id: null,
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  },
  {
    id: 'comment-010',
    post_id: 'post-004',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
    content: { html: '<p>Kung fu tea là tinh túy của văn hóa Trung Quốc.</p>' },
    created_at: '2025-10-01T12:30:00Z',
    parent_comment_id: 'comment-009',
    deleted_at: null,
    deleted_reason: null,
    deleted_by: null
  }
];

export const getPostComments = (postId: string): Comment[] => 
  mockComments.filter(comment => comment.post_id === postId && !comment.deleted_at);

export const getPostCommentsCount = (postId: string): number => 
  mockComments.filter(comment => comment.post_id === postId && !comment.deleted_at).length;

export const getUserComments = (userId: string): Comment[] =>
  mockComments.filter(comment => comment.user_id === userId && !comment.deleted_at);

export const getUserCommentsCount = (userId: string): number =>
  mockComments.filter(comment => comment.user_id === userId && !comment.deleted_at).length;

export const getAllComments = (): Comment[] => 
  mockComments.filter(comment => !comment.deleted_at);

// Additional helper functions for CommentItem and PostDetailModal
export const getCommentsByPostId = (postId: string): Comment[] => 
  getPostComments(postId);

export const getParentComments = (postId: string): Comment[] =>
  mockComments.filter(comment => comment.post_id === postId && !comment.parent_comment_id && !comment.deleted_at);

export const getNestedReplies = (parentId: string): Comment[] =>
  mockComments.filter(comment => comment.parent_comment_id === parentId && !comment.deleted_at);

export const getTotalRepliesCount = (parentId: string): number =>
  getNestedReplies(parentId).length;