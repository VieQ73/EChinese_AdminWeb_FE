import type { Comment } from '../types/entities';

// Mock data cho Comments dựa trên database schema
export const mockComments: Comment[] = [
  // Comments cho post1 (Chào mừng)
  {
    id: 'comment1',
    post_id: 'post1',
    user_id: 'user1',
    content: {
      html: '<p>Cảm ơn admin! Mình rất vui khi tham gia cộng đồng này 😊</p>'
    },
    likes: 3,
    parent_comment_id: null,
    created_at: '2025-10-02T09:15:00Z',
    deleted_by: 'user1',
  },
  {
    id: 'comment2',
    post_id: 'post1',
    user_id: 'user3',
    content: {
      html: '<p>Tuyệt vời! Hy vọng sẽ học được nhiều điều từ mọi người</p>'
    },
    likes: 1,
    parent_comment_id: null,
    created_at: '2025-10-02T10:30:00Z',
    deleted_by: 'user3',
  },
  {
    id: 'comment3',
    post_id: 'post1',
    user_id: 'admin1',
    content: {
      html: '<p>@nguyenvana Chào mừng bạn! Hãy thoải mái chia sẻ nhé 👍</p>'
    },
    likes: 2,
    parent_comment_id: 'comment1',
    created_at: '2025-10-02T11:00:00Z',
    deleted_by: 'admin1',
  },

  // Comments cho post2 (Học từ vựng HSK)
  {
    id: 'comment4',
    post_id: 'post2',
    user_id: 'user3',
    content: {
      html: '<p>Phương pháp rất hay! Mình cũng đang dùng Anki và thấy hiệu quả</p>'
    },
    likes: 5,
    parent_comment_id: null,
    created_at: '2025-10-02T08:00:00Z',
    deleted_by: 'user3',
  },
  {
    id: 'comment5',
    post_id: 'post2',
    user_id: 'admin1',
    content: {
      html: '<p>Cảm ơn bạn đã chia sẻ! Có thể bạn chia sẻ thêm về việc tạo câu ví dụ không?</p>'
    },
    likes: 2,
    parent_comment_id: null,
    created_at: '2025-10-02T09:30:00Z',
    deleted_by: 'admin1',
  },
  {
    id: 'comment6',
    post_id: 'post2',
    user_id: 'user1',
    content: {
      html: '<p>@admin Mình thường tạo câu dựa trên tình huống thực tế, ví dụ như miêu tả công việc hàng ngày bằng từ vựng mới học</p>'
    },
    likes: 3,
    parent_comment_id: 'comment5',
    created_at: '2025-10-02T10:15:00Z',
    deleted_by: 'user1',
  },

  // Comments cho post4 (Review khóa học)
  {
    id: 'comment7',
    post_id: 'post4',
    user_id: 'user1',
    content: {
      html: '<p>Review rất chi tiết! Mình cũng đang tìm hiểu khóa học này. Bạn có thể cho biết tên cụ thể không?</p>'
    },
    likes: 1,
    parent_comment_id: null,
    created_at: '2025-10-01T15:45:00Z',
    deleted_by: 'user1',
  },
  {
    id: 'comment8',
    post_id: 'post4',
    user_id: 'admin1',
    content: {
      html: '<p>Cảm ơn bạn đã chia sẻ review chi tiết! Những thông tin này rất hữu ích cho cộng đồng</p>'
    },
    likes: 2,
    parent_comment_id: null,
    created_at: '2025-10-01T16:00:00Z',
    deleted_by: 'admin1',
  },

  // Comments cho post5 (Chia sẻ tài liệu)
  {
    id: 'comment9',
    post_id: 'post5',
    user_id: 'user3',
    content: {
      html: '<p>Wow! Cảm ơn bạn rất nhiều. Mình đang cần tài liệu HSK 5. Có thể chia sẻ được không? 🙏</p>'
    },
    likes: 8,
    parent_comment_id: null,
    created_at: '2025-09-30T17:00:00Z',
    deleted_by: 'user3',
  },
  {
    id: 'comment10',
    post_id: 'post5',
    user_id: 'admin1',
    content: {
      html: '<p>Rất cảm ơn tinh thần chia sẻ của bạn! Đây chính là điều làm nên sức mạnh của cộng đồng 👏</p>'
    },
    likes: 5,
    parent_comment_id: null,
    created_at: '2025-09-30T18:30:00Z',
    deleted_by: 'admin1',
  },
  {
    id: 'comment11',
    post_id: 'post5',
    user_id: 'user1',
    content: {
      html: '<p>@lequanghung Mình sẽ gửi link qua message nhé! 😊</p>'
    },
    likes: 3,
    parent_comment_id: 'comment9',
    created_at: '2025-09-30T19:00:00Z',
    deleted_by: 'user1',
  }
];

// Helper functions
export const getCommentsByPostId = (postId: string): Comment[] => {
  return mockComments.filter(comment => comment.post_id === postId && !comment.deleted_at);
};

export const getParentComments = (postId: string): Comment[] => {
  return getCommentsByPostId(postId).filter(comment => !comment.parent_comment_id);
};

export const getReplies = (postId: string, parentCommentId: string): Comment[] => {
  return getCommentsByPostId(postId).filter(comment => comment.parent_comment_id === parentCommentId);
};