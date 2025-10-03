import type { Comment } from '../types/entities';

// Mock data cho Comments đồng nhất với userApi.ts
export const mockComments: Comment[] = [
  // Comments cho post1 (Chào mừng) - Nhiều cấp độ lồng nhau
  {
    id: 'comment1',
    post_id: 'post1',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>Cảm ơn admin! Mình rất vui khi tham gia cộng đồng này 😊</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-02T09:15:00Z',
    deleted_by: null,
  },
  // Reply cấp 2 cho comment1
  {
    id: 'comment1_reply1',
    post_id: 'post1',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Admin
    content: {
      html: '<p>@nguyenvana Chào mừng bạn! Hãy thoải mái chia sẻ nhé 👍</p>'
    },
    parent_comment_id: 'comment1',
    created_at: '2025-10-02T11:00:00Z',
    deleted_by: null,
  },
  // Reply cấp 3 cho comment1_reply1
  {
    id: 'comment1_reply1_reply1',
    post_id: 'post1',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>@admin Cảm ơn admin! Mình sẽ tích cực tham gia ✨</p>'
    },
    parent_comment_id: 'comment1_reply1',
    created_at: '2025-10-02T11:30:00Z',
    deleted_by: null,
  },

  // Comment độc lập khác cho post1
  {
    id: 'comment2',
    post_id: 'post1',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', // Lê Văn C
    content: {
      html: '<p>Tuyệt vời! Hy vọng sẽ học được nhiều điều từ mọi người 🎓</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-02T10:30:00Z',
    deleted_by: null,
  },
  // Reply cho comment2
  {
    id: 'comment2_reply1',
    post_id: 'post1',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>Đúng rồi! Mình cũng mong được chia sẻ kinh nghiệm với mọi người 🌟</p>'
    },
    parent_comment_id: 'comment2',
    created_at: '2025-10-02T13:00:00Z',
    deleted_by: null,
  },

  // Comment từ Super Admin
  {
    id: 'comment2_reply2',
    post_id: 'post1',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Super Admin
    content: {
      html: '<p>Cảm ơn mọi người đã tích cực tham gia! Cộng đồng EChinese sẽ ngày càng phát triển 🚀</p>'
    },
    parent_comment_id: 'comment2',
    created_at: '2025-10-02T14:00:00Z',
    deleted_by: null,
  },

  // Comments cho post2 (Học từ vựng HSK) - Chuỗi thảo luận sâu
  {
    id: 'comment3',
    post_id: 'post2',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', // Lê Văn C
    content: {
      html: '<p>Phương pháp rất hay! Mình cũng đang dùng Anki và thấy hiệu quả 📱</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-02T08:00:00Z',
    deleted_by: null,
  },
  {
    id: 'comment3_reply1',
    post_id: 'post2',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', // Phạm Thị D (Moderator)
    content: {
      html: '<p>@levanc Bạn có thể chia sẻ cách setting Anki để hiệu quả nhất không?</p>'
    },
    parent_comment_id: 'comment3',
    created_at: '2025-10-02T08:30:00Z',
    deleted_by: null,
  },
  {
    id: 'comment3_reply1_reply1',
    post_id: 'post2',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', // Lê Văn C
    content: {
      html: '<p>Mình thường set 20 từ mới/ngày, review 50 từ cũ. Và quan trọng là phải kiên trì! 💪</p>'
    },
    parent_comment_id: 'comment3_reply1',
    created_at: '2025-10-02T09:00:00Z',
    deleted_by: null,
  },

  {
    id: 'comment4',
    post_id: 'post2',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Admin
    content: {
      html: '<p>Cảm ơn bạn đã chia sẻ! Có thể bạn chia sẻ thêm về việc tạo câu ví dụ không? 🤔</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-02T09:30:00Z',
    deleted_by: null,
  },
  {
    id: 'comment4_reply1',
    post_id: 'post2',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>@admin Mình thường tạo câu dựa trên tình huống thực tế, ví dụ như miêu tả công việc hàng ngày bằng từ vựng mới học 🏢</p>'
    },
    parent_comment_id: 'comment4',
    created_at: '2025-10-02T10:15:00Z',
    deleted_by: null,
  },

  // Comments cho post3 (Tìm bạn học) - Kết nối học viên
  {
    id: 'comment5',
    post_id: 'post3',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // Trần Thị B
    content: {
      html: '<p>Mình cũng ở Hà Nội và đang học HSK 4! Có thể kết bạn để cùng học không? 😊</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-01T19:30:00Z',
    deleted_by: null,
  },
  {
    id: 'comment5_reply1',
    post_id: 'post3',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>@tranthib Tuyệt vời! Mình sẽ inbox bạn để trao đổi thêm nhé 👍</p>'
    },
    parent_comment_id: 'comment5',
    created_at: '2025-10-01T20:00:00Z',
    deleted_by: null,
  },
  {
    id: 'comment5_reply1_reply1',
    post_id: 'post3',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // Trần Thị B
    content: {
      html: '<p>Okee! Mình cũng đang tìm study buddy để cùng motivate nhau học tập 🔥</p>'
    },
    parent_comment_id: 'comment5_reply1',
    created_at: '2025-10-01T20:30:00Z',
    deleted_by: null,
  },
  
  {
    id: 'comment6',
    post_id: 'post3',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Admin
    content: {
      html: '<p>Thật tuyệt khi thấy các bạn kết nối với nhau! Đây chính là ý nghĩa của cộng đồng học tập 🎉</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-01T20:15:00Z',
    deleted_by: null,
  },
  {
    id: 'comment6_reply1',
    post_id: 'post3',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', // Vũ Thị F (Teacher)
    content: {
      html: '<p>Mình cũng muốn tham gia nhóm study group! Có thể add mình vào không? 🙋‍♀️</p>'
    },
    parent_comment_id: 'comment6',
    created_at: '2025-10-01T21:00:00Z',
    deleted_by: null,
  },

  // Comments cho post4 (Review khóa học)
  {
    id: 'comment7',
    post_id: 'post4',
    user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678', // Hoàng Văn E (Student)
    content: {
      html: '<p>Review rất chi tiết! Mình cũng đang tìm hiểu khóa học này. Bạn có thể cho biết tên cụ thể không? 📖</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-01T15:45:00Z',
    deleted_by: null,
  },
  {
    id: 'comment7_reply1',
    post_id: 'post4',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', // Lê Văn C
    content: {
      html: '<p>Khóa học của trung tâm ABC đó bạn. Giáo viên dạy rất nhiệt tình và có kinh nghiệm!</p>'
    },
    parent_comment_id: 'comment7',
    created_at: '2025-10-01T16:20:00Z',
    deleted_by: null,
  },
  
  {
    id: 'comment8',
    post_id: 'post4',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567', // Phạm Thị D (Moderator)
    content: {
      html: '<p>Cảm ơn bạn đã chia sẻ review chi tiết! Những thông tin này rất hữu ích cho cộng đồng 👏</p>'
    },
    parent_comment_id: null,
    created_at: '2025-10-01T16:00:00Z',
    deleted_by: null,
  },

  // Comments cho post5 (Chia sẻ tài liệu) - Thảo luận sôi nổi
  {
    id: 'comment9',
    post_id: 'post5',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', // Vũ Thị F (Teacher)
    content: {
      html: '<p>Wow! Cảm ơn bạn rất nhiều. Mình đang cần tài liệu HSK 5. Có thể chia sẻ được không? 🙏</p>'
    },
    parent_comment_id: null,
    created_at: '2025-09-30T17:00:00Z',
    deleted_by: null,
  },
  {
    id: 'comment9_reply1',
    post_id: 'post5',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>@teacher1 Mình sẽ gửi link qua message nhé! 😊</p>'
    },
    parent_comment_id: 'comment9',
    created_at: '2025-09-30T19:00:00Z',
    deleted_by: null,
  },
  {
    id: 'comment9_reply1_reply1',
    post_id: 'post5',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789', // Vũ Thị F (Teacher)
    content: {
      html: '<p>Cảm ơn bạn nhiều! Mình sẽ chờ message của bạn 💕</p>'
    },
    parent_comment_id: 'comment9_reply1',
    created_at: '2025-09-30T19:15:00Z',
    deleted_by: null,
  },
  
  {
    id: 'comment10',
    post_id: 'post5',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Super Admin
    content: {
      html: '<p>Rất cảm ơn tinh thần chia sẻ của bạn! Đây chính là điều làm nên sức mạnh của cộng đồng 👏</p>'
    },
    parent_comment_id: null,
    created_at: '2025-09-30T18:30:00Z',
    deleted_by: null,
  },
  
  {
    id: 'comment11',
    post_id: 'post5',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // Trần Thị B
    content: {
      html: '<p>Mình cũng muốn được chia sẻ tài liệu HSK 4 và 5. Cảm ơn bạn nhiều! 🌟</p>'
    },
    parent_comment_id: null,
    created_at: '2025-09-30T20:00:00Z',
    deleted_by: null,
  },
  {
    id: 'comment11_reply1',
    post_id: 'post5',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Nguyễn Văn A
    content: {
      html: '<p>@tranthib Sure! Mình sẽ share cho bạn luôn 🤗</p>'
    },
    parent_comment_id: 'comment11',
    created_at: '2025-09-30T20:30:00Z',
    deleted_by: null,
  },
  {
    id: 'comment11_reply1_reply1',
    post_id: 'post5',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // Trần Thị B
    content: {
      html: '<p>Bạn thật tốt bụng! Cộng đồng này có những người như bạn thật là may mắn 🌟</p>'
    },
    parent_comment_id: 'comment11_reply1',
    created_at: '2025-09-30T21:00:00Z',
    deleted_by: null,
  }
];

// Helper functions để lấy comments và xử lý nested comments với giới hạn 3 cấp độ
export const getCommentsByPostId = (postId: string): Comment[] => {
  return mockComments.filter(comment => comment.post_id === postId && !comment.deleted_at);
};

export const getParentComments = (postId: string): Comment[] => {
  return getCommentsByPostId(postId).filter(comment => !comment.parent_comment_id);
};

// Hàm lấy direct replies cho một comment cụ thể
export const getDirectReplies = (postId: string, parentCommentId: string): Comment[] => {
  return getCommentsByPostId(postId).filter(comment => comment.parent_comment_id === parentCommentId);
};

// Hàm đếm tổng số replies (bao gồm tất cả nested levels) của một comment
export const getTotalRepliesCount = (postId: string, commentId: string): number => {
  const directReplies = getDirectReplies(postId, commentId);
  let total = directReplies.length;
  
  for (const reply of directReplies) {
    total += getTotalRepliesCount(postId, reply.id);
  }
  
  return total;
};

// Hàm lấy replies với logic flatten từ cấp độ 3
export const getReplies = (postId: string, parentCommentId: string, currentDepth: number = 0): Comment[] => {
  const directReplies = getDirectReplies(postId, parentCommentId);
  
  // Nếu đã đến cấp độ 2 (tức là replies sẽ hiển thị ở cấp độ 3), flatten tất cả
  if (currentDepth >= 2) {
    const allFlattenedReplies: Comment[] = [];
    const toProcess = [...directReplies];
    
    while (toProcess.length > 0) {
      const current = toProcess.shift()!;
      allFlattenedReplies.push(current);
      
      // Thêm tất cả children vào queue để xử lý
      const children = getDirectReplies(postId, current.id);
      toProcess.push(...children);
    }
    
    return allFlattenedReplies;
  }
  
  // Dưới cấp độ 2, hiển thị bình thường
  return directReplies;
};

// Hàm để lấy nested replies với depth tracking
export const getNestedReplies = (postId: string, parentCommentId: string, currentDepth: number = 0): Comment[] => {
  return getReplies(postId, parentCommentId, currentDepth);
};