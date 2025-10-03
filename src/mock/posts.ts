import type { Post } from '../types/entities';

/** 
 * Mock data cho bài đăng - Tái tạo với dữ liệu nhất quán theo 9 users
 * Mỗi user có ít nhất 2 bài đăng + 1 bài đã gỡ
 * ID users từ userApi.ts:
 * - a1b2c3d4-e5f6-7890-1234-567890abcdef (Super Admin)
 * - b2c3d4e5-f6a7-8901-2345-67890abcdef0 (Admin) 
 * - c3d4e5f6-a7b8-9012-3456-7890abcdef01 (Nguyễn Văn A)
 * - d4e5f6a7-b8c9-0123-4567-890abcdef012 (Trần Thị B)
 * - e5f6a7b8-c9d0-1234-5678-90abcdef1234 (Người Bị Khóa)
 * - f6a7b8c9-d0e1-2345-6789-0abcdef12345 (Lê Văn C)
 * - a7b8c9d0-e1f2-3456-7890-bcdef1234567 (Phạm Thị D - Moderator)
 * - b8c9d0e1-f2a3-4567-8901-cdef12345678 (Hoàng Văn E - Student)
 * - c9d0e1f2-a3b4-5678-9012-def123456789 (Vũ Thị F - Teacher)
 */
export const mockPosts: Post[] = [
  // ========== Super Admin (a1b2c3d4-e5f6-7890-1234-567890abcdef) - 3 bài ==========
  {
    id: 'post-001',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    title: 'Chào mừng cộng đồng EChinese - Hướng dẫn sử dụng platform!',
    content: {
      text: 'Chào mừng tất cả các bạn đã tham gia vào cộng đồng học tiếng Trung EChinese! 🎉\n\nTại đây, chúng ta có thể:\n• Chia sẻ kinh nghiệm học tập\n• Thảo luận về văn hóa Trung Quốc\n• Hỏi đáp các vấn đề trong quá trình học\n• Tìm bạn học cùng nhóm\n\nHãy tạo một môi trường học tập tích cực và hỗ trợ lẫn nhau nhé! Chúc các bạn học tốt! 加油! 💪',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Góc chia sẻ',
    likes: 0,
    views: 0,
    created_at: '2025-10-02T08:00:00Z',
    is_approved: true,
    is_pinned: true,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-002',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    title: 'Phương pháp học chữ Hán hiệu quả cho người mới bắt đầu',
    content: {
      text: 'Nhiều bạn thắc mắc về cách học chữ Hán một cách hiệu quả. Dựa trên kinh nghiệm giảng dạy, tôi muốn chia sẻ một số phương pháp:\n\n1️⃣ **Học theo bộ thủ**: Nắm vững 214 bộ thủ cơ bản sẽ giúp bạn đoán nghĩa và cách đọc\n\n2️⃣ **Viết tay**: Không chỉ đánh máy, hãy luyện viết tay để ghi nhớ tốt hơn\n\n3️⃣ **Flashcard thông minh**: Sử dụng SRS (Spaced Repetition System)\n\n4️⃣ **Học trong ngữ cảnh**: Đừng học từ lẻ, hãy học cả câu và đoạn văn\n\nCác bạn có phương pháp nào hiệu quả khác không? Chia sẻ nhé!'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T14:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-003',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    title: '[Đã gỡ] Thông báo quan trọng về quy định',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung đã được chỉnh sửa và đăng lại ở bài viết mới.'
    },
    topic: 'Góc chia sẻ',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T16:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-30T18:00:00Z',
    deleted_reason: 'Cập nhật thông tin mới',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Admin (b2c3d4e5-f6a7-8901-2345-67890abcdef0) - 3 bài ==========
  {
    id: 'post-004',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    title: 'Thành ngữ tiếng Trung hay và ý nghĩa sâu sắc',
    content: {
      text: 'Hôm nay mình muốn chia sẻ một số thành ngữ tiếng Trung hay và ý nghĩa tuyệt vời:\n\n🔥 **熟能生巧** (shú néng shēng qiǎo)\n"Luyện tập nhiều sẽ thành thạo" - Đây là câu nói kinh điển về việc học hỏi!\n\n🌱 **水滴石穿** (shuǐ dī shí chuān) \n"Giọt nước nhỏ cũng xuyên được đá" - Kiên trì sẽ thành công\n\n🎯 **百闻不如一见** (bǎi wén bù rú yī jiàn)\n"Nghe trăm lần không bằng thấy một lần" - Trải nghiệm thực tế quan trọng hơn\n\nCác bạn có thành ngữ nào yêu thích không? Cùng chia sẻ nhé! 📝',
      images: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Văn hóa',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T10:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-005',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    title: 'Chiến lược ôn thi HSK hiệu quả - Kinh nghiệm thực chiến',
    content: {
      text: 'Sau khi thi HSK 5 và đạt điểm khá, mình muốn chia sẻ kinh nghiệm ôn thi:\n\n📚 **Giai đoạn chuẩn bị (2-3 tháng trước):**\n• Đánh giá trình độ hiện tại qua đề thi thử\n• Lập kế hoạch học tập chi tiết theo tuần\n• Chuẩn bị tài liệu: SGK chuẩn + đề thi thử + từ điển\n\n🎯 **Phân bổ thời gian luyện tập:**\n• Nghe: 30% (luyện nghe podcast, phim)\n• Đọc: 35% (báo, truyện ngắn)\n• Viết: 25% (luyện viết đoạn văn)\n• Nói: 10% (nếu thi HSKK)\n\n💡 **Mẹo nhỏ:**\n- Làm đề thi thử mỗi tuần\n- Ghi chú lỗi sai thường gặp\n- Tạo flashcard cho từ vựng mới\n\nCác bạn đã thi HSK chưa? Chia sẻ tips nhé!'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T13:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-006',
    user_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    title: '[Đã gỡ] Link quảng cáo không phù hợp',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung chứa link quảng cáo không liên quan đến học tiếng Trung.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-28T09:00:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-29T12:30:00Z',
    deleted_reason: 'Spam/Quảng cáo không phù hợp',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Nguyễn Văn A (c3d4e5f6-a7b8-9012-3456-7890abcdef01) - 3 bài ==========
  {
    id: 'post-007',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    title: 'Hoàn thành bài học thời gian',
    content: {
      text: 'Mình vừa hoàn thành bài học về thời gian trong tiếng Trung. Cảm thấy rất hữu ích! Bài học này giúp mình nắm được cách biểu đạt giờ, ngày, tháng trong giao tiếp hàng ngày. Đặc biệt là việc sử dụng 点 (diǎn) cho giờ và 号 (hào) cho ngày tháng. Mọi người cùng luyện tập nhé! 时间就是金钱 (shíjiān jiùshì jīnqián) - Thời gian là vàng bạc.',
      images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T11:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-008',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    title: 'Tips học từ vựng hiệu quả',
    content: {
      text: 'Tips học từ vựng hiệu quả mà mình áp dụng: \n1. Tạo flashcard với Anki để ôn tập theo phương pháp spaced repetition\n2. Học từ trong ngữ cảnh thực tế, không chỉ học nghĩa đơn lẻ\n3. Nghe nhạc Trung Quốc và xem phim có phụ đề để tiếp xúc từ vựng tự nhiên\n4. Viết nhật ký bằng tiếng Trung với những từ mới học được\n5. Tham gia các nhóm chat tiếng Trung để practice\nCách này giúp mình nhớ lâu hơn rất nhiều! 加油! (jiāyóu)',
      images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T15:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-009',
    user_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung không phù hợp.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-29T08:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-29T10:00:00Z',
    deleted_reason: 'Nội dung không phù hợp',
    deleted_by: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0'
  },

  // ========== Trần Thị B (d4e5f6a7-b8c9-0123-4567-890abcdef012) - 3 bài ==========
  {
    id: 'post-010',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
    title: 'Từ vựng về gia đình',
    content: {
      text: 'Hôm nay mình học được 20 từ mới về chủ đề gia đình trong tiếng Trung! 👨‍👩‍👧‍👦\n\n🔥 Một số từ quan trọng:\n- 家庭 (jiātíng) - gia đình\n- 父母 (fùmǔ) - cha mẹ  \n- 兄弟姐妹 (xiōngdì jiěmèi) - anh chị em\n- 祖父母 (zǔfùmǔ) - ông bà nội\n- 外祖父母 (wàizǔfùmǔ) - ông bà ngoại\n\nMình thấy từ vựng này rất thực tế trong giao tiếp hàng ngày. Các bạn đã học chủ đề này chưa? Cùng chia sẻ kinh nghiệm nhé!',
      images: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T12:00:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-011',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
    title: 'Tạo nhóm học chung',
    content: {
      text: 'Các bạn có muốn tạo nhóm học chung tiếng Trung không? 🤝\n\nMình muốn tìm những bạn có cùng mục tiêu để:\n✨ Practice conversation hàng ngày (15-20 phút/ngày)\n✨ Chia sẻ tài liệu học tập chất lượng\n✨ Động viên nhau trong quá trình học\n✨ Tổ chức các buổi học nhóm online vào cuối tuần\n\nAi quan tâm thì comment hoặc inbox mình nhé! Mình mong muốn tạo được một nhóm tích cực, giúp đỡ lẫn nhau. 一起加油吧! (yīqǐ jiāyóu ba)'
    },
    topic: 'Tìm bạn học chung',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T19:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-012',
    user_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung trùng lặp.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-29T14:00:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-29T16:45:00Z',
    deleted_reason: 'Nội dung trùng lặp',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Người Bị Khóa (e5f6a7b8-c9d0-1234-5678-90abcdef1234) - 3 bài ==========
  {
    id: 'post-013',
    user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    title: 'Bài hát tiếng Trung hay',
    content: {
      text: 'Chia sẻ bài hát tiếng Trung hay mà mình mới nghe: 月亮代表我的心 (Yuèliàng dàibiǎo wǒ de xīn) - "Mặt trăng đại diện tấm lòng tôi" 🌙\n\nĐây là một trong những ca khúc kinh điển nhất của Teresa Teng (邓丽君). Giai điệu nhẹ nhàng, lời ca đơn giản nhưng rất cảm động. Qua bài này mình học được nhiều từ vựng về tình cảm:\n- 心 (xīn) - trái tim\n- 爱 (ài) - yêu\n- 深情 (shēnqíng) - tình cảm sâu sắc\n\nCác bạn có bài hát tiếng Trung yêu thích nào không? Chia sẻ để cùng nhau học qua âm nhạc nào! �',
      images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Văn hóa',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T16:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-014',
    user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    title: 'Phát âm thanh điệu',
    content: {
      text: 'Lưu ý quan trọng khi phát âm thanh điệu trong tiếng Trung! 🗣️\n\nTiếng Trung có 4 thanh điệu cơ bản + 1 thanh nhẹ:\n🔸 Thanh 1 (一声): Cao, bằng - mā (妈 - mẹ)\n🔸 Thanh 2 (二声): Từ trung lên cao - má (麻 - vải lanh)  \n🔸 Thanh 3 (三声): Xuống thấp rồi lên - mǎ (马 - ngựa)\n🔸 Thanh 4 (四声): Từ cao xuống thấp - mà (骂 - mắng)\n🔸 Thanh nhẹ (轻声): Ngắn, nhẹ - ma (吗 - chưa/không)\n\nMẹo: Tập với "妈妈骑马" để nhớ 4 thanh! Sai thanh điệu là sai nghĩa hoàn toàn đó các bạn.'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T10:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-015',
    user_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Vi phạm quy tắc cộng đồng.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-29T11:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-29T14:20:00Z',
    deleted_reason: 'Vi phạm quy tắc cộng đồng',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Lê Văn C (f6a7b8c9-d0e1-2345-6789-0abcdef12345) - 3 bài ==========
  {
    id: 'post-016',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    title: 'Xem phim luyện nghe',
    content: {
      text: 'Khuyên các bạn xem phim Trung Quốc có phụ đề để luyện nghe! 🎬\n\nMình đã thử phương pháp này và thấy hiệu quả lắm. Bắt đầu từ những bộ phim đơn giản, đời thường như:\n\n📺 Phim sitcom: "爱情公寓" (iPartment) - thoại đời thường, dễ hiểu\n📺 Phim thanh xuân: "致我们单纯的小美好" - từ vựng không quá khó\n📺 Phim cổ trang nhẹ nhàng: "陈情令" - để làm quen với văn hóa\n\nTips:\n✨ Lần đầu xem với phụ đề tiếng Việt\n✨ Lần 2 xem với phụ đề tiếng Trung  \n✨ Lần 3 thử không phụ đề\n\nAi đã thử cách này chưa? Chia sẻ phim hay cho mình với!',
      images: ['https://images.unsplash.com/photo-1489599558718-89740395b936?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Văn hóa',
    likes: 0,
    views: 0,
    created_at: '2025-10-02T17:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-017',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    title: 'Câu hỏi ngữ pháp',
    content: {
      text: 'Câu hỏi về ngữ pháp mà mình đang thắc mắc: Khi nào dùng 了, 着, 过? 🤔\n\nMình đọc nhiều tài liệu nhưng vẫn chưa hiểu rõ sự khác biệt:\n\n❓ 了 (le): Biểu thị hoàn thành hành động - "我吃了饭" (Tôi đã ăn cơm)\n❓ 着 (zhe): Biểu thị trạng thái đang tiếp tục - "门开着" (Cửa đang mở)\n❓ 过 (guo): Biểu thị kinh nghiệm từng làm - "我去过中国" (Tôi đã từng đến Trung Quốc)\n\nCác bạn có thể giải thích thêm và cho ví dụ cụ thể không? Đặc biệt là trong những trường hợp dễ nhầm lẫn. Mình cảm thấy phần ngữ pháp này khó nắm nhất! 😅'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T13:10:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-018',
    user_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung không phù hợp.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-29T09:25:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-29T12:00:00Z',
    deleted_reason: 'Nội dung không phù hợp',
    deleted_by: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567'
  },

  // ========== Phạm Thị D - Moderator (a7b8c9d0-e1f2-3456-7890-bcdef1234567) - 3 bài ==========
  {
    id: 'post-019',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
    title: 'Đạt 800 điểm cộng đồng',
    content: {
      text: 'Mình vừa đạt được 800 điểm cộng đồng! 🎉 Cảm ơn các bạn đã ủng hộ và tương tác tích cực!\n\nHành trình từ 0 đến 800 điểm thật sự đầy thử thách nhưng rất ý nghĩa. Qua đây mình học được rất nhiều từ cộng đồng, từ kiến thức tiếng Trung đến cách chia sẻ hiệu quả.\n\n� Một số milestone quan trọng:\n- 100 điểm đầu tiên từ việc chia sẻ bài học hàng ngày\n- 300 điểm từ việc trả lời câu hỏi của các bạn\n- 500-800 điểm từ các bài viết chất lượng về văn hóa Trung Quốc\n\nMục tiêu tiếp theo: 1000 điểm! Cùng nhau xây dựng cộng đồng học tiếng Trung tích cực nhé! 加油! 💪',
      images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Góc chia sẻ',
    likes: 0,
    views: 0,
    created_at: '2025-10-02T15:40:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-020',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
    title: 'App học tiếng Trung miễn phí',
    content: {
      text: 'Giới thiệu top 5 app học tiếng Trung miễn phí mà mình đang sử dụng! 📱\n\n🏆 **Duolingo Chinese**: Cơ bản, thích hợp cho người mới bắt đầu\n🏆 **HelloChinese**: Tương tác tốt, có phần phát âm chi tiết\n🏆 **Pleco**: Từ điển siêu mạnh, không thể thiếu cho người học\n🏆 **ChineseSkill**: Giống Duolingo nhưng chuyên sâu hơn\n🏆 **Anki**: Tự tạo flashcard, hiệu quả cho việc nhớ từ vựng\n\n💡 **Lời khuyên**: Đừng chỉ dựa vào app, kết hợp với sách giáo khoa và luyện nói với người bản xứ. App chỉ là công cụ hỗ trợ thôi!\n\nCác bạn đang dùng app nào? Chia sẻ kinh nghiệm của bạn nhé!'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T08:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-021',
    user_id: 'a7b8c9d0-e1f2-3456-7890-bcdef1234567',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung bị báo cáo.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T11:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-30T14:15:00Z',
    deleted_reason: 'Nội dung bị báo cáo',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Hoàng Văn E - Student (b8c9d0e1-f2a3-4567-8901-cdef12345678) - 3 bài ==========
  {
    id: 'post-022',
    user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678',
    title: 'Kinh nghiệm thi HSK level 4',
    content: {
      text: 'Chia sẻ kinh nghiệm thi HSK level 4 mà mình vừa đạt được 240/300 điểm! 📚✨\n\n🎯 **Cấu trúc kỳ thi HSK 4:**\n- Nghe hiểu: 45 câu (100 điểm)\n- Đọc hiểu: 40 câu (100 điểm) \n- Viết: 15 câu (100 điểm)\n\n💪 **Kinh nghiệm luyện tập:**\n\n🔹 **Nghe**: Nghe podcast HSK 4, xem tin tức CCTV có phụ đề. Tập trung vào từ khóa, đừng cố hiểu 100%\n🔹 **Đọc**: Làm đề thi thật, học 1200 từ vựng HSK 4 thuộc lòng\n🔹 **Viết**: Luyện viết câu đơn giản, không cần phức tạp. Chú ý ngữ pháp cơ bản\n\n⏰ **Thời gian chuẩn bị**: 6 tháng với 2h/ngày\n\nAi cần tài liệu HSK 4 thì inbox mình nhé! 加油！',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-02T16:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-023',
    user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678',
    title: 'Recommend sách học tiếng Trung',
    content: {
      text: 'Các bạn có thể recommend sách học tiếng Trung cho người mới bắt đầu không? 📖\n\nMình đang tìm sách có những đặc điểm sau:\n\n✅ Có CD hoặc audio để luyện nghe\n✅ Bài tập đa dạng, từ cơ bản đến nâng cao\n✅ Có giải thích ngữ pháp rõ ràng bằng tiếng Việt\n✅ Phù hợp tự học tại nhà\n✅ Có từ vựng thực tế, không quá học thuật\n\nMình đã nghe nói về "Hán ngữ quyển 1" và "New Practical Chinese Reader" nhưng chưa biết nên chọn loại nào. \n\nCác bạn đã học qua sách nào hiệu quả? Chia sẻ kinh nghiệm giúp mình với! Cảm ơn cả nhà! 🙏'
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T12:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-024',
    user_id: 'b8c9d0e1-f2a3-4567-8901-cdef12345678',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung vi phạm bản quyền.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T14:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-30T17:00:00Z',
    deleted_reason: 'Vi phạm bản quyền',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  },

  // ========== Vũ Thị F - Teacher (c9d0e1f2-a3b4-5678-9012-def123456789) - 3 bài ==========
  {
    id: 'post-025',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
    title: 'Phân biệt từ chỉ thời gian',
    content: {
      text: 'Hướng dẫn phân biệt các từ chỉ thời gian trong tiếng Trung - bài học quan trọng cho người mới! ⏰\n\n📍 **Các từ chỉ thời gian thường gặp:**\n\n🔸 **现在 (xiànzài)** = Bây giờ, hiện tại\n   - "我现在很忙" (Tôi bây giờ đang bận)\n\n🔸 **刚才 (gāngcái)** = Vừa rồi, lúc nãy  \n   - "刚才你在哪里?" (Lúc nãy bạn ở đâu?)\n\n🔸 **马上 (mǎshàng)** = Ngay lập tức, sắp sửa\n   - "我马上来" (Tôi sắp đến ngay)\n\n🔸 **以后 (yǐhòu)** = Sau này, về sau\n   - "以后我会努力学习" (Sau này tôi sẽ cố gắng học tập)\n\n💡 **Mẹo nhớ**: Tạo câu chuyện nhỏ để liên kết các từ này lại với nhau. Rất hữu ích cho người mới học nhé!',
      images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-02T09:00:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-026',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
    title: 'Luyện viết chữ Hán đẹp',
    content: {
      text: 'Hướng dẫn luyện viết chữ Hán đẹp - bí quyết từ giảng viên 20 năm kinh nghiệm! ✍️\n\n🎯 **8 nguyên tắc vàng khi viết chữ Hán:**\n\n1️⃣ **Thứ tự nét**: Từ trái sang phải, từ trên xuống dưới\n2️⃣ **Nét cơ bản**: Nắm vững 8 nét cơ bản (横, 竖, 撇, 捺, 点, 提, 折, 钩)\n3️⃣ **Cấu trúc**: Chú ý tỉ lệ các bộ phận trong chữ\n4️⃣ **Lực tay**: Đậm nhạt phù hợp, đầu nét mạnh, cuối nét nhẹ\n5️⃣ **Tốc độ**: Viết từ từ để tạo muscle memory\n6️⃣ **Giấy ô vuông**: Sử dụng để căn chỉnh tỷ lệ\n7⃣ **Bút phù hợp**: Bút bi mềm hoặc bút lông nhỏ\n8⃣ **Luyện tập**: 30 phút/ngày với 10-15 chữ\n\n📚 **Practice makes perfect!** Kiên trì sẽ có kết quả đẹp!',
      images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop&auto=format']
    },
    topic: 'Học tiếng Trung',
    likes: 0,
    views: 0,
    created_at: '2025-10-01T15:30:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post-027',
    user_id: 'c9d0e1f2-a3b4-5678-9012-def123456789',
    title: 'Bài đã gỡ',
    content: {
      text: '[BÀI ĐÃ GỠ] Nội dung spam.'
    },
    topic: 'Khác',
    likes: 0,
    views: 0,
    created_at: '2025-09-30T10:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-09-30T13:45:00Z',
    deleted_reason: 'Spam',
    deleted_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  }
];

/** Helper functions */
export const getAllPosts = (): Post[] => mockPosts;

export const getActivePostsOnly = (): Post[] => 
  mockPosts.filter(post => !post.deleted_at);

export const getDeletedPostsOnly = (): Post[] => 
  mockPosts.filter(post => post.deleted_at !== null);

export const getPostById = (postId: string): Post | undefined => 
  mockPosts.find(post => post.id === postId);

// Import để tính likes và views động
import { getPostLikesCount } from './postLikes';
import { getPostViewsCount } from './postViews';
import { getPostCommentsCount } from './comments';

export const getPostsByUserId = (userId: string): Post[] => 
  mockPosts.filter(post => post.user_id === userId);

export const getActivePostsByUserId = (userId: string): Post[] => 
  mockPosts.filter(post => post.user_id === userId && !post.deleted_at);

export const getDeletedPostsByUserId = (userId: string): Post[] => 
  mockPosts.filter(post => post.user_id === userId && post.deleted_at !== null);

// Helper function để lấy post với likes/views/comments được tính động
export const getPostWithStats = (postId: string): Post | null => {
  const post = mockPosts.find(p => p.id === postId);
  if (!post) return null;
  
  return {
    ...post,
    likes: getPostLikesCount(postId),
    views: getPostViewsCount(postId),
    // Thêm comments count nếu cần
    commentsCount: getPostCommentsCount(postId)
  } as Post & { commentsCount: number };
};

// Helper function để lấy tất cả posts với stats
export const getAllPostsWithStats = (): (Post & { commentsCount: number })[] => {
  return mockPosts.map(post => ({
    ...post,
    likes: getPostLikesCount(post.id),
    views: getPostViewsCount(post.id),
    commentsCount: getPostCommentsCount(post.id)
  }));
};

// Helper function để lấy posts không bị xóa với stats
export const getActivePostsWithStats = (): (Post & { commentsCount: number })[] => {
  return mockPosts
    .filter(post => !post.deleted_at)
    .map(post => ({
      ...post,
      likes: getPostLikesCount(post.id),
      views: getPostViewsCount(post.id),
      commentsCount: getPostCommentsCount(post.id)
    }));
};
