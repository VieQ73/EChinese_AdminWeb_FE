import type { Post } from '../types/entities';

// Mock data cho Posts dựa trên database schema
export const mockPosts: Post[] = [
  {
    id: 'post1',
    user_id: 'admin1',
    title: 'Chào mừng đến với cộng đồng EChinese!',
    content: {
      html: '<p><strong>Chào mừng</strong> tất cả mọi người đến với cộng đồng học tiếng Trung EChinese! 🎉</p><p>Đây là nơi các bạn có thể:</p><ul><li>Chia sẻ kinh nghiệm học tập</li><li>Đặt câu hỏi và nhận được sự hỗ trợ từ cộng đồng</li><li>Kết nối với những người cùng đam mê học tiếng Trung</li><li>Tham gia các hoạt động thú vị như thi đua từ vựng</li><li>Chia sẻ tài liệu học tập hữu ích</li></ul><p>Hãy cùng nhau xây dựng một cộng đồng học tập tích cực và hiệu quả! Chúc các bạn học tập vui vẻ và thành công! 加油! 💪</p><p><em>Lưu ý: Vui lòng tuân thủ quy định của cộng đồng để tạo môi trường học tập lành mạnh cho tất cả mọi người.</em></p>'
    },
    topic: 'Góc chia sẻ',
    likes: 24,
    views: 156,
    created_at: '2025-10-02T08:30:00Z',
    is_approved: true,
    is_pinned: true,
    deleted_by: 'admin1',
  },
  {
    id: 'post2',
    user_id: 'user1',
    title: 'Cách học từ vựng HSK hiệu quả - Chia sẻ kinh nghiệm 3 tháng tự học',
    content: {
      html: '<p>Mình muốn chia sẻ một số phương pháp học từ vựng HSK mà mình thấy hiệu quả sau 3 tháng tự học:</p><p><strong>1. Flashcard với hình ảnh:</strong> Kết hợp từ vựng với hình ảnh sinh động để dễ nhớ hơn. Mình thường dùng Anki để tạo flashcard với hình ảnh minh họa cho mỗi từ.</p><p><strong>2. Lặp lại ngắt quãng (Spaced Repetition):</strong> Sử dụng phương pháp spaced repetition để ghi nhớ lâu dài. Các từ khó sẽ xuất hiện thường xuyên hơn, từ dễ sẽ xuất hiện ít hơn.</p><p><strong>3. Áp dụng vào câu:</strong> Không chỉ học từ đơn lẻ mà phải học trong ngữ cảnh. Mình thường tạo câu ví dụ cho mỗi từ mới học.</p><p><strong>4. Nghe phát âm chuẩn:</strong> Luôn nghe và lặp lại phát âm từ các nguồn uy tín như từ điển online.</p><p><strong>5. Ôn tập định kỳ:</strong> Dành 30 phút mỗi ngày để ôn lại từ vựng cũ.</p><p>Với phương pháp này, mình đã học được khoảng 800 từ vựng HSK 4 trong 3 tháng. Các bạn có phương pháp nào khác hiệu quả không? Chia sẻ nhé! 😊</p>'
    },
    topic: 'Học tiếng Trung',
    likes: 18,
    views: 89,
    created_at: '2025-10-02T07:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_by: 'user1',
  },
  {
    id: 'post3',
    user_id: 'user2',
    title: 'Tìm bạn học chung tại Hà Nội',
    content: {
      html: '<p>Mình đang ở Hà Nội và đang học HSK 4. Muốn tìm bạn học chung để:</p><ul><li>Luyện nói tiếng Trung với nhau hàng tuần</li><li>Chia sẻ tài liệu học tập và kinh nghiệm</li><li>Động viên nhau trong quá trình học</li><li>Cùng nhau tham gia các hoạt động văn hóa Trung Quốc</li></ul><p>Mình có thể gặp vào cuối tuần tại các quán cafe quanh khu vực Hồ Gươm hoặc Cầu Giấy. Ai có nhu cầu thì inbox mình nhé! 📚✨</p>'
    },
    topic: 'Tìm bạn học chung',
    likes: 7,
    views: 34,
    created_at: '2025-10-01T19:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-10-02T09:00:00Z',
    deleted_reason: 'Vi phạm quy định đăng thông tin liên lạc cá nhân',
    deleted_by: 'admin1',
  },
  {
    id: 'post4',
    user_id: 'user3',
    title: 'Review khóa học tiếng Trung online - Kinh nghiệm 6 tháng học',
    content: {
      html: '<p>Vừa hoàn thành khóa học <em>Tiếng Trung cơ bản</em> sau 6 tháng và muốn review chi tiết:</p><p><strong>Điểm tốt:</strong></p><ul><li>Giáo viên nhiệt tình, phát âm chuẩn, có kinh nghiệm</li><li>Tài liệu phong phú, có video minh họa sinh động</li><li>Lịch học linh hoạt, phù hợp với người đi làm</li><li>Có nhóm học tập hỗ trợ trên Facebook</li><li>Giá cả hợp lý so với chất lượng</li></ul><p><strong>Điểm cần cải thiện:</strong></p><ul><li>Thiếu bài tập thực hành đối thoại</li><li>Chưa có nhiều hoạt động tương tác giữa học viên</li><li>App mobile còn có một số lỗi nhỏ</li></ul><p><strong>Kết quả:</strong> Sau 6 tháng mình đã đạt được HSK 3 và có thể giao tiếp cơ bản. Tổng thể mình đánh giá <strong>4/5 ⭐</strong></p><p>Các bạn có kinh nghiệm học khóa nào khác không? Chia sẻ để mọi người tham khảo nhé!</p>'
    },
    topic: 'Khác',
    likes: 12,
    views: 67,
    created_at: '2025-10-01T14:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_by: 'user3',
  },
  {
    id: 'post5',
    user_id: 'user1',
    title: 'Chia sẻ tài liệu luyện thi HSK 5 miễn phí',
    content: {
      html: '<p>Mình vừa thi xong HSK 5 và muốn chia sẻ một số tài liệu hữu ích mà mình đã sưu tầm được:</p><p><strong>📚 Sách và tài liệu:</strong></p><ul><li>Sách "HSK 5 标准教程" - rất chi tiết và có đáp án</li><li>Bộ đề thi thử HSK 5 từ năm 2020-2024</li><li>Từ điển 3000 từ vựng HSK 5 có phiên âm</li><li>Audio files cho phần luyện nghe</li></ul><p><strong>🎯 Chiến thuật thi:</strong></p><ul><li>Phần nghe: Luyện nghe tin tức tiếng Trung mỗi ngày 30 phút</li><li>Phần đọc: Đọc báo Trung Quốc, bắt đầu từ những bài ngắn</li><li>Phần viết: Luyện viết diary bằng tiếng Trung hàng ngày</li></ul><p>Ai cần tài liệu thì comment bên dưới, mình sẽ chia sẻ link drive. Chúc các bạn thi tốt! 🍀</p>'
    },
    topic: 'Học tiếng Trung',
    likes: 35,
    views: 198,
    created_at: '2025-09-30T16:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_by: 'user1',
  }
];

// Các topic có sẵn
export const availableTopics = [
  'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ',
  'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm',
  'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Tâm sự', 'Khác'
];