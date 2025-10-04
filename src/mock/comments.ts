import type { CommentWithUser } from '../types/entities';

export const mockComments: CommentWithUser[] = [
  // Post 001 comments
  {
    id: 'comment-001',
    post_id: 'post-001',
    content: 'Bài viết rất hữu ích! Mình cũng đang học HSK4.',
    created_at: '2025-10-02T09:00:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
      name: 'Nguyễn Văn A',
      username: 'testuser1',
      avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 2,
      role: 'user',
      is_active: true
    },
    badge: {
      level: 2,
      name: 'Thành thạo',
      icon: '⭐'
    },
    replies: [
      {
        id: 'comment-002',
        post_id: 'post-001',
        content: 'Cảm ơn bạn đã chia sẻ! Chúng tôi sẽ có thêm tài liệu HSK4 sớm.',
        created_at: '2025-10-02T09:30:00Z',
        parent_comment_id: 'comment-001',
        deleted_by: null,
        user: {
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          name: 'Super Admin',
          username: 'superadmin',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 5,
          role: 'super admin',
          is_active: true
        },
        badge: {
          level: 5,
          name: 'Siêu quản trị',
          icon: '💎'
        },
        replies: []
      }
    ]
  },
  {
    id: 'comment-003',
    post_id: 'post-001',
    content: 'Mình cũng gặp vấn đề tương tự với ngữ pháp này.',
    created_at: '2025-10-02T10:15:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
      name: 'Lê Văn C',
      username: 'user3',
      avatar_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 0,
      role: 'user',
      is_active: true
    },
    badge: {
      level: 0,
      name: 'Người mới',
      icon: '🌱'
    },
    replies: [
      {
        id: 'comment-004',
        post_id: 'post-001',
        content: 'Bạn có thể tham khảo thêm sách "HSK Standard Course" nhé.',
        created_at: '2025-10-02T11:00:00Z',
        parent_comment_id: 'comment-003',
        deleted_by: null,
        user: {
          id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
          name: 'Người Bị Khóa',
          username: 'locked_user',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 1,
          role: 'user',
          is_active: false
        },
        badge: {
          level: 1,
          name: 'Học viên',
          icon: '📚'
        },
        replies: []
      },
      {
        id: 'comment-004b',
        post_id: 'post-001',
        content: 'Mình cũng vừa mua cuốn sách này, thấy khá hay!',
        created_at: '2025-10-02T11:30:00Z',
        parent_comment_id: 'comment-003',
        deleted_by: null,
        user: {
          id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678',
          name: 'Hoàng Văn E',
          username: 'student1',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 2,
          role: 'user',
          is_active: true
        },
        badge: {
          level: 2,
          name: 'Thành thạo',
          icon: '⭐'
        },
        replies: []
      },
      {
        id: 'comment-004c',
        post_id: 'post-001',
        content: 'Các bạn có thể tham gia group học chung HSK4 không?',
        created_at: '2025-10-02T12:00:00Z',
        parent_comment_id: 'comment-003',
        deleted_by: null,
        user: {
          id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
          name: 'Phạm Thị D',
          username: 'moderator1',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 3,
          role: 'admin',
          is_active: true
        },
        badge: {
          level: 3,
          name: 'Chuyên gia',
          icon: '🏆'
        },
        replies: []
      }
    ]
  },
  {
    id: 'comment-005',
    post_id: 'post-001',
    content: 'Thanks for sharing! Rất có ích.',
    created_at: '2025-10-02T12:30:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
      name: 'Vũ Thị F',
      username: 'teacher1',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 3,
      role: 'user',
      is_active: true
    },
    badge: {
      level: 3,
      name: 'Chuyên gia',
      icon: '🏆'
    },
    replies: []
  },

  // Post 002 comments
  {
    id: 'comment-006',
    post_id: 'post-002',
    content: 'Kinh nghiệm rất quý báu! Cảm ơn bạn đã chia sẻ.',
    created_at: '2025-10-02T15:00:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Super Admin',
      username: 'superadmin',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 5,
      role: 'super admin',
      is_active: true
    },
    badge: {
      level: 5,
      name: 'Siêu quản trị',
      icon: '💎'
    },
    replies: []
  },
  {
    id: 'comment-007',
    post_id: 'post-002',
    content: 'Mình cũng đang chuẩn bị du học. Có thể inbox để trao đổi không?',
    created_at: '2025-10-02T15:45:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
      name: 'Trần Thị B',
      username: 'testuser2',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 5,
      role: 'user',
      is_active: false
    },
    badge: {
      level: 5,
      name: 'Siêu quản trị',
      icon: '💎'
    },
    replies: [
      {
        id: 'comment-008',
        post_id: 'post-002',
        content: 'Nhóm có thể tạo một topic riêng để thảo luận về du học nhé!',
        created_at: '2025-10-02T16:15:00Z',
        parent_comment_id: 'comment-007',
        deleted_by: null,
        user: {
          id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
          name: 'Admin',
          username: 'admin',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 4,
          role: 'admin',
          is_active: true
        },
        badge: {
          level: 4,
          name: 'Quản trị viên',
          icon: '👑'
        },
        replies: []
      }
    ]
  },

  // Post 004 comments
  {
    id: 'comment-009',
    post_id: 'post-004',
    content: 'Văn hóa trà đạo thật thú vị. Mình muốn tìm hiểu thêm.',
    created_at: '2025-10-01T11:00:00Z',
    parent_comment_id: null,
    deleted_by: null,
    user: {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
      name: 'Nguyễn Văn A',
      username: 'testuser1',
      avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face&auto=format',
      badge_level: 2,
      role: 'user',
      is_active: true
    },
    badge: {
      level: 2,
      name: 'Thành thạo',
      icon: '⭐'
    },
    replies: [
      {
        id: 'comment-010',
        post_id: 'post-004',
        content: 'Kung fu tea là tinh túy của văn hóa Trung Quốc.',
        created_at: '2025-10-01T12:30:00Z',
        parent_comment_id: 'comment-009',
        deleted_by: null,
        user: {
          id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
          name: 'Phạm Thị D',
          username: 'moderator1',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format',
          badge_level: 3,
          role: 'admin',
          is_active: true
        },
        badge: {
          level: 3,
          name: 'Chuyên gia',
          icon: '🏆'
        },
        replies: []
      }
    ]
  }
];

// Helper functions
export const getEnrichedCommentsByPostId = (postId: string): CommentWithUser[] => 
  mockComments.filter(comment => comment.post_id === postId && !comment.deleted_by);

export const getPostCommentsCount = (postId: string): number => 
  mockComments.filter(comment => comment.post_id === postId && !comment.deleted_by).length;

export const getUserComments = (userId: string): CommentWithUser[] =>
  mockComments.filter(comment => comment.user.id === userId && !comment.deleted_by);

export const getUserCommentsCount = (userId: string): number =>
  mockComments.filter(comment => comment.user.id === userId && !comment.deleted_by).length;

export const getAllComments = (): CommentWithUser[] => 
  mockComments.filter(comment => !comment.deleted_by);

// Compatibility functions (for existing code)
export const getCommentsByPostId = (postId: string): CommentWithUser[] => 
  getEnrichedCommentsByPostId(postId);

export const getParentComments = (postId: string): CommentWithUser[] =>
  mockComments.filter(comment => comment.post_id === postId && !comment.parent_comment_id && !comment.deleted_by);

export const getNestedReplies = (parentId: string): CommentWithUser[] => {
  const parentComment = mockComments.find(comment => comment.id === parentId);
  return parentComment?.replies || [];
};

export const getTotalRepliesCount = (parentId: string): number =>
  getNestedReplies(parentId).length;

export const getEnrichedComment = (commentId: string): CommentWithUser | null => {
  return mockComments.find(c => c.id === commentId) || null;
};