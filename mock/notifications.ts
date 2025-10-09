import type { Notification } from '../types';
import { mockReports } from './moderation';
import { mockAppeals } from './moderation';

// Hàm tạo thông báo tự động từ mock data khác
const generateAdminNotifications = (): Notification[] => {
  const reportNotifications: Notification[] = mockReports.map(report => ({
    id: `notif-report-${report.id}`,
    audience: 'admin',
    type: 'report',
    title: `Báo cáo mới về ${report.target_type}: "${report.reason}"`,
    content: {
      html: `<p>Người dùng <strong>${report.reporter?.name || 'Hệ thống AI'}</strong> đã báo cáo nội dung với lý do: <em>${report.reason}</em>. Vui lòng kiểm tra.</p>`
    },
    related_type: 'report',
    related_id: report.id,
    redirect_url: `/reports`, // Dùng để xác định hành động, không phải URL thực tế
    read_at: report.status === 'pending' ? null : report.updated_at, // Đã xử lý = đã đọc
    is_push_sent: true,
    created_at: report.created_at,
    from_system: true,
    priority: report.status === 'pending' ? 2 : 1,
  }));

  const appealNotifications: Notification[] = mockAppeals.map(appeal => ({
    id: `notif-appeal-${appeal.id}`,
    audience: 'admin',
    type: 'appeal',
    title: `Khiếu nại mới từ người dùng ${appeal.user?.name}`,
    content: {
      html: `<p>Người dùng <strong>${appeal.user?.name}</strong> đã gửi khiếu nại cho vi phạm <strong>${appeal.violation_id}</strong>. Vui lòng xem xét.</p>`
    },
    related_type: 'appeal',
    related_id: appeal.id,
    redirect_url: `/reports?tab=appeals`,
    read_at: appeal.status === 'pending' ? null : appeal.resolved_at,
    is_push_sent: true,
    created_at: appeal.created_at,
    from_system: true,
    priority: appeal.status === 'pending' ? 2 : 1,
  }));

  return [...reportNotifications, ...appealNotifications];
};

// Dữ liệu giả lập cho Notifications
export const mockNotifications: Notification[] = [
  // --- Thông báo do Admin tạo ---
  {
    id: 'notif-admin-1',
    audience: 'all',
    type: 'community',
    title: 'Sự kiện: Cuộc thi viết "Hán ngữ và Tôi"',
    content: {
      html: '<h2>🎉 Tham gia ngay cuộc thi viết "Hán ngữ và Tôi"! 🎉</h2><p>Chia sẻ câu chuyện học tiếng Trung của bạn và có cơ hội nhận những phần quà hấp dẫn. Xem chi tiết tại <a href="/community/p-event-123">đây</a>.</p>'
    },
    redirect_url: '/community/p-event-123',
    read_at: null,
    is_push_sent: true, // Đã phát hành
    created_at: '2025-10-07T08:00:00Z',
    from_system: false, 
    priority: 1,
  },
  {
    id: 'notif-admin-2',
    audience: 'all',
    type: 'system',
    title: '[NHÁP] Thông báo về lịch học bù',
    content: {
      html: '<p>Do ngày nghỉ lễ, lớp HSK 5 sẽ được học bù vào tối thứ 7 tuần này. Các bạn chú ý theo dõi.</p>'
    },
    redirect_url: '/schedule',
    read_at: null,
    is_push_sent: false, // Nháp
    created_at: '2025-10-11T11:00:00Z',
    from_system: false, 
    priority: 1,
  },

  // --- Thông báo hệ thống cho người dùng (ví dụ) ---
  {
    id: 'notif-user-1',
    recipient_id: 'u1',
    audience: 'user',
    type: 'achievement',
    title: 'Chúc mừng! Bạn đã đạt thành tích mới!',
    content: {
      html: '<p>Bạn đã mở khóa thành tích "<strong>Gấu chăm chỉ</strong>" vì đã đăng nhập liên tục 7 ngày. Hãy tiếp tục phát huy nhé!</p>'
    },
    redirect_url: '/achievements',
    read_at: '2025-10-09T11:00:00Z',
    is_push_sent: true,
    created_at: '2025-10-09T10:30:00Z',
    from_system: true,
    priority: 1,
  },
  {
    id: 'notif-user-2',
    recipient_id: 'u2',
    audience: 'user',
    type: 'violation',
    title: 'Cảnh báo về vi phạm quy tắc cộng đồng',
    content: {
      html: '<p>Chúng tôi đã gỡ bỏ một nội dung của bạn do vi phạm quy tắc về "Spam". Vui lòng xem lại quy tắc cộng đồng để tránh tái phạm. Bạn có thể khiếu nại quyết định này.</p>'
    },
    related_type: 'violation',
    related_id: 'v2',
    redirect_url: '/profile/violations',
    read_at: null,
    is_push_sent: true,
    created_at: '2025-10-06T14:05:00Z',
    from_system: true,
    priority: 2,
  },

  // --- Thông báo tự động tạo cho Admin ---
  ...generateAdminNotifications(),
];
