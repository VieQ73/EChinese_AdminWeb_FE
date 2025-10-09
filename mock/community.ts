import { RawPost, Comment, type CommentWithUser, PostLike, PostView } from '../types';
import { mockUsers } from './users';
import { mockBadges } from './settings';

// Helper để tạo nội dung rich text đơn giản
const createContent = (text: string, images: string[] = []) => ({
    html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
    text: text,
    images: images,
});

export const mockPosts: RawPost[] = [
    {
        id: 'p1', user_id: 'u1', title: 'Mẹo cho phần Viết HSK 5',
        content: createContent(
            'Phần viết có thể khá khó, nhưng với việc luyện tập, bạn có thể thành thạo nó. Tập trung vào các cấu trúc câu phức tạp và từ vựng đa dạng...',
            ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop&auto=format']
        ),
        topic: 'Học tiếng Trung', likes: 0, views: 0, created_at: '2025-10-06T18:00:00Z',
        status: 'published', is_pinned: true, is_approved: true, auto_flagged: false
    },
    {
        id: 'p2', user_id: 'u2', title: 'Tìm bạn học chung HSK 3',
        content: createContent('Chào mọi người, mình hiện đang chuẩn bị cho kỳ thi HSK 3 và rất muốn tìm một bạn học cùng để luyện nói. Múi giờ của mình là GMT+7.'),
        topic: 'Tìm bạn học chung', likes: 0, views: 0, created_at: '2025-10-06T11:20:00Z',
        status: 'removed', is_pinned: false, is_approved: true, auto_flagged: false,
        deleted_at: '2025-10-06T14:00:00Z', deleted_by: 'admin-user-id', deleted_reason: 'Nội dung spam, lặp lại.'
    },
    {
        id: 'p3', user_id: 'u3', title: 'Review tài liệu học tiếng Trung cho người mới bắt đầu',
        content: createContent('Mình đã tổng hợp một số giáo trình và app học tiếng Trung hay nhất cho các bạn mới bắt đầu. Hy vọng sẽ giúp ích được cho mọi người! Bài viết này khá dài và chứa nhiều thông tin chi tiết về từng loại sách, ưu nhược điểm của từng app, cũng như lộ trình học tập hiệu quả. Mình sẽ đi sâu vào phân tích cách kết hợp các tài liệu này để đạt kết quả tốt nhất trong thời gian ngắn nhất. Các bạn hãy đọc kỹ và nếu có câu hỏi gì thì đừng ngần ngại bình luận bên dưới nhé. Chúc các bạn thành công trên con đường chinh phục Hán ngữ!'),
        topic: 'Góc chia sẻ', likes: 0, views: 0, created_at: '2025-10-05T09:00:00Z',
        status: 'published', is_pinned: false, is_approved: true, auto_flagged: false
    },
    {
        id: 'p4', user_id: 'admin-user-id', title: 'Thông báo cập nhật chính sách cộng đồng',
        content: createContent('Để xây dựng một cộng đồng lành mạnh, chúng tôi đã cập nhật một số điều khoản. Vui lòng đọc kỹ để tránh vi phạm.'),
        topic: 'Khác', likes: 0, views: 0, created_at: '2025-10-05T15:00:00Z',
        status: 'published', is_pinned: true, is_approved: true, auto_flagged: false
    },
    {
        id: 'p5', user_id: 'u1', title: 'Kinh nghiệm du học Trung Quốc (Nháp)',
        content: createContent('Chia sẻ về quá trình chuẩn bị hồ sơ, xin học bổng và cuộc sống tại Thượng Hải...'),
        topic: 'Du học', likes: 0, views: 0, created_at: '2025-10-06T10:00:00Z',
        status: 'draft', is_pinned: false, is_approved: true, auto_flagged: false
    },
    {
        id: 'p6', user_id: 'u2', title: 'Cần tìm việc làm phiên dịch Tiếng Trung',
        content: createContent('Mình có HSK 6, kinh nghiệm 2 năm phiên dịch cabin. Cần tìm việc full-time tại Hà Nội. CV trong profile.'),
        topic: 'Việc làm', likes: 0, views: 0, created_at: '2025-10-04T14:00:00Z',
        status: 'removed', is_pinned: false, is_approved: false, auto_flagged: true,
        deleted_at: '2025-10-04T14:00:05Z', deleted_by: null, deleted_reason: 'Nội dung bị gỡ tự động do nghi ngờ vi phạm ngôn từ không phù hợp.'
    },
    {
        id: 'p7',
        user_id: 'superadmin-user-id',
        title: 'Chào mừng cộng đồng EChinese - Hướng dẫn sử dụng platform!',
        content: {
          text: 'Chào mừng tất cả các bạn đã tham gia vào cộng đồng học tiếng Trung EChinese! 🎉\n\nTại đây, chúng ta có thể:\n• Chia sẻ kinh nghiệm học tập\n• Thảo luận về văn hóa Trung Quốc\n• Hỏi đáp các vấn đề trong quá trình học\n• Tìm bạn học cùng nhóm\n\nHãy tạo một môi trường học tập tích cực và hỗ trợ lẫn nhau nhé! Chúc các bạn học tốt! 加油! 💪',
          html: '<p>Chào mừng tất cả các bạn đã tham gia vào cộng đồng học tiếng Trung EChinese! 🎉</p><br><p>Tại đây, chúng ta có thể:<br>• Chia sẻ kinh nghiệm học tập<br>• Thảo luận về văn hóa Trung Quốc<br>• Hỏi đáp các vấn đề trong quá trình học<br>• Tìm bạn học cùng nhóm</p><br><p>Hãy tạo một môi trường học tập tích cực và hỗ trợ lẫn nhau nhé! Chúc các bạn học tốt! 加油! 💪</p>',
          images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&auto=format']
        },
        topic: 'Góc chia sẻ',
        likes: 0, views: 0,
        created_at: '2025-10-04T08:00:00Z',
        status: 'published',
        auto_flagged: false,
        is_approved: true,
        is_pinned: true,
    },
    {
        id: 'p8', user_id: 'u3', title: 'Bài viết bị gỡ',
        content: createContent('Nội dung này đã bị gỡ do vi phạm.'),
        topic: 'Tâm sự', likes: 0, views: 0, created_at: '2025-10-04T10:00:00Z',
        status: 'removed', is_pinned: false, is_approved: false, auto_flagged: false,
        deleted_at: '2025-10-04T11:00:00Z', deleted_by: 'admin-user-id', deleted_reason: 'Nội dung không phù hợp'
    },
    {
        id: 'p9', user_id: 'u2', title: 'Bài viết đang được xử lý',
        content: createContent('Nội dung này bị báo cáo và admin đang xử lý.'),
        topic: 'Tâm sự', likes: 0, views: 0, created_at: '2025-10-06T15:00:00Z',
        status: 'removed', is_pinned: false, is_approved: false, auto_flagged: false,
        deleted_at: '2025-10-06T16:00:00Z', deleted_by: 'admin-user-id', deleted_reason: 'Đang xem xét theo báo cáo.'
    },
     {
        id: 'p10', user_id: 'u4', title: 'Văn hóa uống trà ở Trung Quốc',
        content: createContent('Mình mới tìm hiểu về văn hóa trà đạo, mọi người có thể chia sẻ thêm kiến thức được không?'),
        topic: 'Văn hóa', likes: 0, views: 0, created_at: '2025-10-07T09:00:00Z',
        status: 'published', is_pinned: false, is_approved: true, auto_flagged: false
    },
    {
        id: 'p11', user_id: 'u5', title: 'Cần tìm gia sư HSKK Cao cấp',
        content: createContent('Mình đang ở TPHCM, cần tìm gia sư HSKK Cao cấp dạy offline. Yêu cầu phát âm chuẩn, có kinh nghiệm dạy. Xin cảm ơn!'),
        topic: 'Tìm gia sư', likes: 0, views: 0, created_at: '2025-10-07T10:30:00Z',
        status: 'published', is_pinned: false, is_approved: true, auto_flagged: false
    },
    {
        id: 'p12', user_id: 'u7', title: 'Phân biệt 比较 (bǐjiào) và 更 (gèng)',
        content: createContent('Mình hay bị nhầm lẫn cách dùng của hai từ này. Ai đó có thể giải thích sự khác biệt và cho ví dụ được không?'),
        topic: 'Học tiếng Trung', likes: 0, views: 0, created_at: '2025-10-07T11:00:00Z',
        status: 'published', is_pinned: false, is_approved: true, auto_flagged: false
    },
];

export const mockComments: Comment[] = [
    { 
        id: 'c1', post_id: 'p1', user_id: 'u2', content: { text: 'Điều này siêu hữu ích, cảm ơn bạn đã chia sẻ!' }, created_at: '2025-10-06T19:30:00Z',
        deleted_at: '2025-10-06T20:00:00Z', deleted_by: 'superadmin-user-id', deleted_reason: 'Sử dụng ngôn ngữ không phù hợp.'
    },
    { id: 'c2', post_id: 'p1', user_id: 'u3', content: { text: 'Mình đã áp dụng và thấy hiệu quả rõ rệt.' }, created_at: '2025-10-06T20:00:00Z' },
    { 
        id: 'c3', post_id: 'p2', user_id: 'u1', content: { text: 'Cẩn thận đấy, tao mà tìm được mày thì... xong đời nha mậy.' }, created_at: '2025-10-06T12:00:00Z',
        deleted_at: '2025-10-06T12:01:00Z', deleted_by: 'admin-user-id', deleted_reason: 'Đe dọa.' },
    { id: 'c4', post_id: 'p3', user_id: 'u1', content: { text: 'Wow, danh sách tuyệt vời!' }, created_at: '2025-10-05T10:00:00Z' },
    { id: 'c5', post_id: 'p3', user_id: 'admin-user-id', content: { text: 'Cảm ơn bạn đã đóng góp nội dung chất lượng cho cộng đồng.' }, created_at: '2025-10-05T11:00:00Z' },
    { id: 'c6', post_id: 'p3', user_id: 'u2', content: { text: 'Mình cũng đang dùng app X, rất ổn.' }, parent_comment_id: 'c4', created_at: '2025-10-05T12:00:00Z' },
    { id: 'c7', post_id: 'p3', user_id: 'u1', content: { text: 'Đúng vậy, app X giao diện thân thiện thật.' }, parent_comment_id: 'c6', created_at: '2025-10-05T13:00:00Z' },
    { id: 'c8', post_id: 'p1', user_id: 'superadmin-user-id', content: { text: 'Bài viết rất chất lượng, cảm ơn bạn.' }, parent_comment_id: 'c2', created_at: '2025-10-06T21:00:00Z' },
    { 
        id: 'c9', post_id: 'p7', user_id: 'u1', content: { text: 'Bình luận này cũng đang được xử lý.' }, created_at: '2025-10-06T09:00:00Z',
        deleted_at: '2025-10-06T16:05:00Z', deleted_by: 'admin-user-id', deleted_reason: 'Đang xem xét theo báo cáo.'
    },
    { id: 'c10', post_id: 'p10', user_id: 'u5', content: { text: 'Trà đạo là một nghệ thuật đó bạn. Có nhiều loại trà nổi tiếng như Long Tỉnh, Thiết Quan Âm,...' }, created_at: '2025-10-07T09:15:00Z' },
    { id: 'c11', post_id: 'p10', user_id: 'u1', content: { text: 'Mình thích uống trà Phổ Nhĩ.' }, parent_comment_id: 'c10', created_at: '2025-10-07T09:30:00Z' },
    { id: 'c12', post_id: 'p12', user_id: 'admin-user-id', content: { text: 'Chào bạn, 更 dùng để so sánh giữa A và B (A hơn B). 比较 dùng để chỉ mức độ tương đối của một vật (khá/tương đối). Ví dụ: 他更高 (anh ấy cao hơn), 他比较高 (anh ấy khá cao).' }, created_at: '2025-10-07T11:10:00Z' },
    { id: 'c13', post_id: 'p12', user_id: 'u7', content: { text: 'Giải thích dễ hiểu quá, cảm ơn admin!' }, parent_comment_id: 'c12', created_at: '2025-10-07T11:20:00Z' },
    { id: 'c14', post_id: 'p1', user_id: 'u7', content: { text: 'Cảm ơn bạn, mình đang ôn HSK5 và bài viết này rất hữu ích.' }, created_at: '2025-10-07T12:00:00Z' },

    // Bổ sung
    // ----- Post p1 -----
    { id: 'c15', post_id: 'p1', user_id: 'u3', content: { text: 'Mình thấy cấu trúc câu luyện theo HSK thật sự giúp tăng điểm phần viết.' }, created_at: '2025-10-07T13:00:00Z' },
    { id: 'c16', post_id: 'p1', user_id: 'u1', content: { text: 'Đúng rồi! Mình còn ghi nhớ cả mẫu câu từ bài này nữa.' }, parent_comment_id: 'c15', created_at: '2025-10-07T13:10:00Z' },
    { id: 'c17', post_id: 'p1', user_id: 'admin-user-id', content: { text: 'Các bạn nhớ chú ý lỗi chính tả khi viết bài thi nhé.' }, parent_comment_id: 'c16', created_at: '2025-10-07T13:20:00Z' },
    { 
        id: 'c18', post_id: 'p1', user_id: 'u2', 
        content: { text: 'Bình luận này bị ẩn do vi phạm quy tắc cộng đồng.' }, 
        created_at: '2025-10-07T13:25:00Z', 
        deleted_at: '2025-10-07T13:30:00Z', 
        deleted_by: 'superadmin-user-id', 
        deleted_reason: 'Bình luận mang tính công kích cá nhân.'
    },

    // ----- Post p3 -----
    { id: 'c19', post_id: 'p3', user_id: 'u5', content: { text: 'Bài tổng hợp cực kỳ hữu ích, cảm ơn bạn nhiều!' }, created_at: '2025-10-07T10:40:00Z' },
    { id: 'c20', post_id: 'p3', user_id: 'u3', content: { text: 'Bạn dùng giáo trình nào là chính vậy?' }, parent_comment_id: 'c19', created_at: '2025-10-07T10:50:00Z' },
    { id: 'c21', post_id: 'p3', user_id: 'u5', content: { text: 'Mình học theo bộ Hán ngữ 1-6, rất cơ bản và dễ theo.' }, parent_comment_id: 'c20', created_at: '2025-10-07T11:00:00Z' },
    { 
        id: 'c22', post_id: 'p3', user_id: 'u4', 
        content: { text: 'Mình nghĩ bộ đó hơi cũ rồi, có thể thử app HelloChinese.' }, 
        parent_comment_id: 'c20', 
        created_at: '2025-10-07T11:05:00Z'
    },

    // ----- Post p7 -----
    { id: 'c23', post_id: 'p7', user_id: 'u3', content: { text: 'Thật vui khi thấy cộng đồng phát triển!' }, created_at: '2025-10-06T09:30:00Z' },
    { id: 'c24', post_id: 'p7', user_id: 'admin-user-id', content: { text: 'Cảm ơn bạn đã ủng hộ. Hy vọng mọi người cùng đóng góp nhiều bài viết bổ ích.' }, parent_comment_id: 'c23', created_at: '2025-10-06T09:40:00Z' },
    { 
        id: 'c25', post_id: 'p7', user_id: 'u2', 
        content: { text: 'Mình bị lỗi khi đăng bài, có ai biết cách khắc phục không?' }, 
        created_at: '2025-10-06T09:45:00Z' 
    },
    { 
        id: 'c26', post_id: 'p7', user_id: 'superadmin-user-id', 
        content: { text: 'Lỗi này có thể do ảnh tải lên quá lớn. Bạn thử lại với kích thước nhỏ hơn nhé.' }, 
        parent_comment_id: 'c25', 
        created_at: '2025-10-06T09:50:00Z' 
    },

    // ----- Post p10 -----
    { id: 'c27', post_id: 'p10', user_id: 'u2', content: { text: 'Mình từng đến Hàng Châu và được uống trà Long Tỉnh tại gốc, hương vị tuyệt vời.' }, created_at: '2025-10-07T09:40:00Z' },
    { id: 'c28', post_id: 'p10', user_id: 'u3', content: { text: 'Nghe hấp dẫn quá, bạn có hình không?' }, parent_comment_id: 'c27', created_at: '2025-10-07T09:45:00Z' },
    { 
        id: 'c29', post_id: 'p10', user_id: 'u2', 
        content: { text: 'Có, nhưng bình luận này bị gỡ vì chứa thông tin cá nhân.' }, 
        parent_comment_id: 'c28', 
        created_at: '2025-10-07T09:50:00Z', 
        deleted_at: '2025-10-07T09:55:00Z', 
        deleted_by: 'admin-user-id', 
        deleted_reason: 'Chia sẻ thông tin cá nhân (số điện thoại).'
    },

    // ----- Post p12 -----
    { id: 'c30', post_id: 'p12', user_id: 'u3', content: { text: 'Từ ví dụ của admin dễ hiểu quá, mình đã nắm được rồi!' }, created_at: '2025-10-07T11:30:00Z' },
    { id: 'c31', post_id: 'p12', user_id: 'u4', content: { text: 'Đúng đó, 比较 thường dùng trong văn nói nhiều hơn 更.' }, parent_comment_id: 'c30', created_at: '2025-10-07T11:35:00Z' },
    { id: 'c32', post_id: 'p12', user_id: 'u7', content: { text: 'Chuẩn luôn, mình gặp trong phim Trung rất nhiều.' }, parent_comment_id: 'c31', created_at: '2025-10-07T11:40:00Z' }
];


export const mockPostLikes: PostLike[] = [
    // Post 1
    { id: 'pl1', post_id: 'p1', user_id: 'u2', created_at: '2025-10-06T19:00:00Z' },
    { id: 'pl2', post_id: 'p1', user_id: 'u4', created_at: '2025-10-06T20:00:00Z' },
    { id: 'pl3', post_id: 'p1', user_id: 'u5', created_at: '2025-10-06T21:00:00Z' },
    // Post 3
    { id: 'pl4', post_id: 'p3', user_id: 'u1', created_at: '2025-10-05T10:00:00Z' },
    { id: 'pl5', post_id: 'p3', user_id: 'u4', created_at: '2025-10-05T11:00:00Z' },
    { id: 'pl6', post_id: 'p3', user_id: 'u5', created_at: '2025-10-05T12:00:00Z' },
    { id: 'pl7', post_id: 'p3', user_id: 'u7', created_at: '2025-10-05T13:00:00Z' },
    // Post 7
    { id: 'pl8', post_id: 'p7', user_id: 'u1', created_at: '2025-10-04T09:00:00Z' },
    { id: 'pl9', post_id: 'p7', user_id: 'u3', created_at: '2025-10-04T10:00:00Z' },
    { id: 'pl10', post_id: 'p7', user_id: 'u4', created_at: '2025-10-04T11:00:00Z' },
    { id: 'pl11', post_id: 'p7', user_id: 'u5', created_at: '2025-10-04T12:00:00Z' },
    // Post 10
    { id: 'pl12', post_id: 'p10', user_id: 'u1', created_at: '2025-10-07T09:05:00Z' },
    { id: 'pl13', post_id: 'p10', user_id: 'u5', created_at: '2025-10-07T09:10:00Z' },
    // Post 12
    { id: 'pl14', post_id: 'p12', user_id: 'u7', created_at: '2025-10-07T11:05:00Z' },
    { id: 'pl15', post_id: 'p12', user_id: 'u5', created_at: '2025-10-07T11:15:00Z' },
    { id: 'pl16', post_id: 'p12', user_id: 'u4', created_at: '2025-10-07T11:25:00Z' },
    // User u5 likes many posts
    { id: 'pl17', post_id: 'p4', user_id: 'u5', created_at: '2025-10-05T16:00:00Z' },
    { id: 'pl18', post_id: 'p5', user_id: 'u5', created_at: '2025-10-06T11:00:00Z' },
    // superadmin likes p2
    { id: 'pl19', post_id: 'p2', user_id: 'superadmin-user-id', created_at: '2025-10-06T13:00:00Z' }
];

export const mockPostViews: PostView[] = [
    // Views for Post 1
    { id: 'pv1', post_id: 'p1', user_id: 'u1', viewed_at: '2025-10-06T18:05:00Z' },
    { id: 'pv2', post_id: 'p1', user_id: 'u2', viewed_at: '2025-10-06T18:10:00Z' },
    { id: 'pv3', post_id: 'p1', user_id: 'u3', viewed_at: '2025-10-06T18:15:00Z' },
    { id: 'pv4', post_id: 'p1', user_id: 'u4', viewed_at: '2025-10-06T18:20:00Z' },
    { id: 'pv5', post_id: 'p1', user_id: 'u5', viewed_at: '2025-10-06T18:25:00Z' },
    { id: 'pv6', post_id: 'p1', user_id: 'u7', viewed_at: '2025-10-06T18:30:00Z' },
    // Views for Post 3
    { id: 'pv7', post_id: 'p3', user_id: 'u1', viewed_at: '2025-10-05T09:05:00Z' },
    { id: 'pv8', post_id: 'p3', user_id: 'u2', viewed_at: '2025-10-05T09:10:00Z' },
    { id: 'pv9', post_id: 'p3', user_id: 'u4', viewed_at: '2025-10-05T09:15:00Z' },
    { id: 'pv10', post_id: 'p3', user_id: 'u5', viewed_at: '2025-10-05T09:20:00Z' },
    { id: 'pv11', post_id: 'p3', user_id: 'u7', viewed_at: '2025-10-05T09:25:00Z' },
    { id: 'pv12', post_id: 'p3', user_id: 'u8', viewed_at: '2025-10-05T09:30:00Z' },
    { id: 'pv13', post_id: 'p3', user_id: 'superadmin-user-id', viewed_at: '2025-10-06T01:00:00Z' },
     // Views for Post 7
    { id: 'pv14', post_id: 'p7', user_id: 'u1', viewed_at: '2025-10-04T08:05:00Z' },
    { id: 'pv15', post_id: 'p7', user_id: 'u2', viewed_at: '2025-10-04T08:10:00Z' },
    { id: 'pv16', post_id: 'p7', user_id: 'u4', viewed_at: '2025-10-04T08:15:00Z' },
    { id: 'pv17', post_id: 'p7', user_id: 'u5', viewed_at: '2025-10-04T08:20:00Z' },
    // User u1 has viewed multiple posts
    { id: 'pv18', post_id: 'p10', user_id: 'u1', viewed_at: '2025-10-07T09:01:00Z' },
    { id: 'pv19', post_id: 'p12', user_id: 'u1', viewed_at: '2025-10-07T11:01:00Z' },
];

// Hàm này lấy và làm giàu dữ liệu comments cho một bài viết cụ thể
export const getEnrichedCommentsByPostId = (postId: string, allComments: Comment[]): CommentWithUser[] => {
    // Lấy tất cả bình luận, bao gồm cả bình luận đã bị gỡ, từ state hiện tại
    const postComments = allComments.filter(c => c.post_id === postId);

    const enrichedComments = postComments.map(comment => {
        const user = mockUsers.find(u => u.id === comment.user_id);
        const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
        return {
            ...comment,
            user: user || mockUsers[2], // Fallback user
            badge: badge,
            replies: [] // Khởi tạo mảng replies
        };
    });

    const commentMap = new Map(enrichedComments.map(c => [c.id, c]));
    const rootComments: CommentWithUser[] = [];

    for (const comment of enrichedComments) {
        if (comment.parent_comment_id) {
            const parent = commentMap.get(comment.parent_comment_id);
            if (parent) {
                parent.replies.push(comment);
            } else {
                // Nếu không tìm thấy parent, coi nó là root
                rootComments.push(comment);
            }
        } else {
            rootComments.push(comment);
        }
    }
    
    // Sắp xếp bình luận gốc theo thời gian mới nhất
    return rootComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};


// Hàm mới: Lấy các bình luận đã bị xóa của một người dùng
export const getRemovedCommentsByUserId = (userId: string): CommentWithUser[] => {
    const removedComments = mockComments.filter(c => c.user_id === userId && c.deleted_at);

    return removedComments.map(comment => {
        const user = mockUsers.find(u => u.id === comment.user_id);
        const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
        return {
            ...comment,
            user: user || mockUsers[2],
            badge: badge,
            replies: [], // Bình luận đã xóa không hiển thị replies
        };
    }).sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime());
};