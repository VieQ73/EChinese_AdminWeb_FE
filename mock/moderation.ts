
import { Report, ModerationLog, Violation, Appeal, User, RawPost, Comment, ViolationRule } from '../types';
import { mockUsers } from './users';
import { mockPosts } from './community';
import { mockComments } from './community';
import { mockCommunityRules } from './rules';

// Dữ liệu giả lập cho Báo cáo (Reports)
export const mockReports: Report[] = [
    { 
        id: 'r1', 
        reporter_id: 'u2', 
        target_type: 'post', 
        target_id: 'p1', 
        reason: 'Spam', 
        details: 'Bài viết có vẻ không liên quan và quảng cáo.', 
        status: 'pending', 
        created_at: '2025-10-06T22:00:00Z', 
        updated_at: '2025-10-06T22:00:00Z',
        auto_flagged: false 
    },
    { 
        id: 'r2', 
        reporter_id: null, // AI tự động flag
        target_type: 'post', 
        target_id: 'p6', 
        reason: 'Ngôn từ không phù hợp', 
        details: 'Hệ thống phát hiện ngôn từ có khả năng gây xúc phạm.', 
        status: 'in_progress', 
        created_at: '2025-10-04T14:00:05Z', 
        updated_at: '2025-10-04T14:00:05Z',
        auto_flagged: true 
    },
    { 
        id: 'r3', 
        reporter_id: 'u1', 
        target_type: 'comment', 
        target_id: 'c3', 
        reason: 'Quấy rối', 
        details: 'Bình luận này tấn công cá nhân.', 
        status: 'resolved', 
        resolution: 'Bình luận đã bị gỡ do vi phạm quy tắc cộng đồng.',
        resolved_by: 'admin-user-id',
        resolved_at: '2025-10-06T13:00:00Z',
        related_violation_id: 'v1',
        created_at: '2025-10-06T12:30:00Z', 
        updated_at: '2025-10-06T13:00:00Z',
        auto_flagged: false 
    },
    { 
        id: 'r4', 
        reporter_id: 'u3', 
        target_type: 'user', 
        target_id: 'u2', 
        reason: 'Tài khoản giả mạo', 
        details: 'Tài khoản này đang giả mạo người khác.', 
        status: 'dismissed', 
        resolution: 'Không đủ bằng chứng để xác định vi phạm.',
        resolved_by: 'superadmin-user-id',
        resolved_at: '2025-10-05T18:00:00Z',
        created_at: '2025-10-05T12:00:00Z', 
        updated_at: '2025-10-05T18:00:00Z',
        auto_flagged: false 
    },
    { 
        id: 'r5', 
        reporter_id: 'u1', 
        target_type: 'user', 
        target_id: 'u3', 
        reason: 'Hành vi không phù hợp', 
        details: 'Người dùng này liên tục đăng nội dung không liên quan.', 
        status: 'pending', 
        created_at: '2025-10-06T21:00:00Z', 
        updated_at: '2025-10-06T21:00:00Z',
        auto_flagged: false 
    },
    { 
        id: 'r6', 
        reporter_id: 'u2', 
        target_type: 'bug', 
        target_id: 'feature-login', 
        reason: 'Lỗi đăng nhập', 
        details: 'Tôi không thể đăng nhập bằng tài khoản Google trên thiết bị iOS.', 
        status: 'pending', 
        created_at: '2025-10-06T23:00:00Z', 
        updated_at: '2025-10-06T23:00:00Z',
        auto_flagged: false 
    },
    { 
        id: 'r7', 
        reporter_id: 'u1', 
        target_type: 'post', 
        target_id: 'p9', 
        reason: 'Ngôn từ gây thù ghét', 
        details: 'Bài viết sử dụng từ ngữ không phù hợp.', 
        status: 'in_progress', // Admin đã bấm "Bắt đầu xử lý" và gỡ bài
        created_at: '2025-10-06T15:30:00Z', 
        updated_at: '2025-10-06T15:45:00Z', // Thời gian admin bấm "Bắt đầu xử lý"
        auto_flagged: false 
    },
    { 
        id: 'r8', 
        reporter_id: 'u3', 
        target_type: 'comment', 
        target_id: 'c9', 
        reason: 'Spam', 
        details: 'Bình luận quảng cáo.', 
        status: 'in_progress', // Admin đã bấm "Bắt đầu xử lý" và gỡ comment
        created_at: '2025-10-06T09:30:00Z', 
        updated_at: '2025-10-06T16:00:00Z', // Thời gian admin bấm "Bắt đầu xử lý"
        auto_flagged: false 
    },
    // Report cho p8 (giả sử từ u5, resolved vì đã handled)
    { 
        id: 'r9', 
        reporter_id: 'u5', 
        target_type: 'post', 
        target_id: 'p8', 
        reason: 'Nội dung không phù hợp', 
        details: 'Bài viết vi phạm quy tắc cộng đồng.', 
        status: 'resolved', 
        resolution: 'Bài viết đã bị gỡ.',
        resolved_by: 'admin-user-id',
        resolved_at: '2025-10-04T11:05:00Z',
        related_violation_id: 'v8',
        created_at: '2025-10-04T10:30:00Z', 
        updated_at: '2025-10-04T11:00:00Z',
        auto_flagged: false 
    },
];

// Dữ liệu giả lập cho Vi phạm (Violations)
export const mockViolations: Omit<Violation, 'rules' | 'user' | 'targetContent'>[] = [
    {
        id: 'v1',
        user_id: 'u1', // Người vi phạm
        target_type: 'comment',
        target_id: 'c3', // Bình luận vi phạm
        severity: 'medium',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-06T13:00:00Z',
        resolved_at: '2025-10-06T13:05:00Z',
        resolution: 'Gỡ bình luận và gửi cảnh cáo.'
    },
    {
        id: 'v2',
        user_id: 'u2',
        target_type: 'post',
        target_id: 'p2',
        severity: 'low',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-06T14:00:00Z',
        resolved_at: '2025-10-06T14:05:00Z',
        resolution: 'Gỡ bài viết do spam.'
    },
    {
        id: 'v3',
        user_id: 'u2',
        target_type: 'comment',
        target_id: 'c1',
        severity: 'medium',
        detected_by: 'super admin',
        handled: true,
        created_at: '2025-10-06T20:00:00Z',
        resolved_at: '2025-10-06T20:05:00Z',
        resolution: 'Gỡ bình luận do ngôn ngữ không phù hợp.',
    },
    {
        id: 'v4',
        user_id: 'u1',
        target_type: 'comment',
        target_id: 'c9',
        severity: 'low',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-06T16:05:00Z',
        resolved_at: '2025-10-06T16:15:00Z',
        resolution: 'Gỡ bình luận.'
    },
    {
        id: 'v5',
        user_id: 'u2',
        target_type: 'comment',
        target_id: 'c18',
        severity: 'high',
        detected_by: 'super admin',
        handled: true,
        created_at: '2025-10-07T13:30:00Z',
        resolved_at: '2025-10-07T13:40:00Z',
        resolution: 'Gỡ bình luận và cảnh cáo người dùng.',
    },
    {
        id: 'v6',
        user_id: 'u2',
        target_type: 'comment',
        target_id: 'c29',
        severity: 'high',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-07T09:55:00Z',
        resolved_at: '2025-10-07T10:00:00Z',
        resolution: 'Gỡ bình luận vì tiết lộ thông tin cá nhân.',
    },
    // Vi phạm cho p6 (auto_flagged, detected_by 'auto_ai')
    {
        id: 'v7',
        user_id: 'u2',
        target_type: 'post',
        target_id: 'p6',
        severity: 'medium',
        detected_by: 'auto_ai',
        handled: true,
        created_at: '2025-10-04T14:00:05Z',
        resolved_at: '2025-10-04T14:00:10Z',
        resolution: 'Gỡ bài viết tự động do nghi ngờ vi phạm ngôn từ không phù hợp.',
    },
    // Vi phạm cho p8 (deleted_by admin)
    {
        id: 'v8',
        user_id: 'u3',
        target_type: 'post',
        target_id: 'p8',
        severity: 'medium',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-04T11:00:00Z',
        resolved_at: '2025-10-04T11:05:00Z',
        resolution: 'Gỡ bài viết do nội dung không phù hợp.',
    },
    // Vi phạm cho p9 (deleted_by admin)
    {
        id: 'v9',
        user_id: 'u2',
        target_type: 'post',
        target_id: 'p9',
        severity: 'low',
        detected_by: 'admin',
        handled: true,
        created_at: '2025-10-06T16:00:00Z',
        resolved_at: '2025-10-06T16:05:00Z',
        resolution: 'Gỡ bài viết đang xem xét theo báo cáo.',
    },
];

// Dữ liệu giả lập cho bảng liên kết Vi phạm - Quy tắc
export const mockViolationRules: ViolationRule[] = [
    { id: 'vr1', violation_id: 'v1', rule_id: 'rule-04' }, // Đe dọa
    { id: 'vr2', violation_id: 'v2', rule_id: 'rule-01' }, // Spam
    { id: 'vr3', violation_id: 'v2', rule_id: 'rule-02' }, // Lặp lại nội dung
    { id: 'vr4', violation_id: 'v3', rule_id: 'rule-03' }, // Ngôn từ không phù hợp
    { id: 'vr5', violation_id: 'v5', rule_id: 'rule-04' }, // Công kích cá nhân
    { id: 'vr6', violation_id: 'v6', rule_id: 'rule-06' }, // Thông tin cá nhân
    { id: 'vr7', violation_id: 'v4', rule_id: 'rule-01' }, // Spam
    { id: 'vr8', violation_id: 'v7', rule_id: 'rule-03' }, // Ngôn từ không phù hợp
    { id: 'vr9', violation_id: 'v8', rule_id: 'rule-03' }, // Ngôn từ không phù hợp
    { id: 'vr10', violation_id: 'v9', rule_id: 'rule-01' }, // Spam
];


// Dữ liệu giả lập cho Khiếu nại (Appeals)
export const mockAppeals: Appeal[] = [
    {
        id: 'ap1',
        violation_id: 'v2',
        user_id: 'u2',
        reason: 'Tôi không nghĩ bài viết của mình là spam, tôi chỉ đang cố gắng tìm một người bạn học thực sự. Xin vui lòng xem xét lại.',
        status: 'pending',
        created_at: '2025-10-06T15:00:00Z'
    },
    {
        id: 'ap2',
        violation_id: 'v1',
        user_id: 'u1',
        reason: 'Tôi không đồng ý với quyết định này. Bình luận của tôi chỉ là một trò đùa.',
        status: 'rejected',
        created_at: '2025-10-06T18:00:00Z',
        resolved_at: '2025-10-06T20:00:00Z',
        resolved_by: 'superadmin-user-id',
        notes: 'Bình luận vẫn chứa ngôn từ không phù hợp, vi phạm rõ ràng quy tắc cộng đồng.'
    },
    {
        id: 'ap3',
        violation_id: 'v8',
        user_id: 'u3',
        reason: 'Bài viết của tôi không vi phạm gì cả, chỉ là chia sẻ cá nhân. Xin xem xét lại.',
        status: 'pending',
        created_at: '2025-10-04T12:00:00Z'
    }
];


// Hàm làm giàu dữ liệu để thêm thông tin người dùng, bài viết, etc.
export const enrichReport = (report: Report): Report => {
    const reporter = mockUsers.find(u => u.id === report.reporter_id);
    let target: Partial<User & RawPost & Comment> | null = null;
    switch (report.target_type) {
        case 'user':
            target = mockUsers.find(u => u.id === report.target_id) || { id: report.target_id, name: 'Người dùng không xác định' };
            break;
        case 'post':
            target = mockPosts.find(p => p.id === report.target_id) || { id: report.target_id, title: 'Bài viết không tìm thấy' };
            break;
        case 'comment':
            target = mockComments.find(c => c.id === report.target_id) || { id: report.target_id, content: { text: 'Bình luận không tìm thấy' }};
            break;
        case 'bug':
        case 'other':
             target = { id: report.target_id, title: report.reason }; // Dùng reason làm title tạm thời
             break;
    }
    return { ...report, reporter, targetContent: target };
};

export const enrichViolation = (violation: Omit<Violation, 'rules' | 'user' | 'targetContent'>): Violation => {
    const user = mockUsers.find(u => u.id === violation.user_id);
    let target: Partial<RawPost & Comment & User> | null = null;
    if (violation.target_type === 'post') {
        target = mockPosts.find(p => p.id === violation.target_id) || null;
    } else if (violation.target_type === 'comment') {
        target = mockComments.find(c => c.id === violation.target_id) || null;
    } else if (violation.target_type === 'user') {
        target = mockUsers.find(u => u.id === violation.target_id) || null;
    }

    // Làm giàu các quy tắc liên quan
    const relatedRuleIds = mockViolationRules
        .filter(vr => vr.violation_id === violation.id)
        .map(vr => vr.rule_id);
    const rules = mockCommunityRules.filter(rule => relatedRuleIds.includes(rule.id));

    return { ...violation, user, targetContent: target, rules };
};

export const enrichAppeal = (appeal: Appeal): Appeal => {
    const user = mockUsers.find(u => u.id === appeal.user_id);
    const violationData = mockViolations.find(v => v.id === appeal.violation_id);
    return { ...appeal, user, violation: violationData ? enrichViolation(violationData) : undefined };
};


// Dữ liệu giả lập cho nhật ký kiểm duyệt
export const mockModerationLogs: ModerationLog[] = [
    {
        id: 'ml1',
        target_type: 'post',
        target_id: 'p2',
        action: 'remove',
        reason: 'Nội dung spam, lặp lại.',
        performed_by: 'admin-user-id',
        created_at: '2025-10-06T14:00:00Z',
    },
    {
        id: 'ml2',
        target_type: 'comment',
        target_id: 'c1',
        action: 'remove',
        reason: 'Sử dụng ngôn ngữ không phù hợp.',
        performed_by: 'superadmin-user-id',
        created_at: '2025-10-06T20:00:00Z',
    },
    {
        id: 'ml3',
        target_type: 'post',
        target_id: 'p8',
        action: 'restore',
        reason: 'Gỡ bỏ nhầm lẫn, nội dung hợp lệ.',
        performed_by: 'admin-user-id',
        created_at: '2025-10-06T14:30:00Z',
    },
    {
        id: 'ml4',
        target_type: 'comment',
        target_id: 'c9',
        action: 'remove',
        reason: 'Đang xem xét theo báo cáo.',
        performed_by: 'admin-user-id',
        created_at: '2025-10-06T16:05:00Z',
    },
    {
        id: 'ml5',
        target_type: 'comment',
        target_id: 'c18',
        action: 'remove',
        reason: 'Bình luận mang tính công kích cá nhân.',
        performed_by: 'superadmin-user-id',
        created_at: '2025-10-07T13:30:00Z',
    },
    {
        id: 'ml6',
        target_type: 'comment',
        target_id: 'c29',
        action: 'remove',
        reason: 'Chia sẻ thông tin cá nhân (số điện thoại).',
        performed_by: 'admin-user-id',
        created_at: '2025-10-07T09:55:00Z',
    },
    // Log cho p6 (auto_flagged)
    {
        id: 'ml7',
        target_type: 'post',
        target_id: 'p6',
        action: 'remove',
        reason: 'Nội dung bị gỡ tự động do nghi ngờ vi phạm ngôn từ không phù hợp.',
        performed_by: 'auto_ai', // Vì deleted_by null
        created_at: '2025-10-04T14:00:05Z',
    },
    {
        id: 'ml8',
        target_type: 'post',
        target_id: 'p8',
        action: 'remove',
        reason: 'Nội dung không phù hợp',
        performed_by: 'admin-user-id',
        created_at: '2025-10-04T11:00:00Z',
    },
    {
        id: 'ml9',
        target_type: 'post',
        target_id: 'p9',
        action: 'remove',
        reason: 'Đang xem xét theo báo cáo.',
        performed_by: 'admin-user-id',
        created_at: '2025-10-06T16:00:00Z',
    },
    {
        id: 'ml10',
        target_type: 'comment',
        target_id: 'c3',
        action: 'remove',
        reason: 'Đe dọa.',
        performed_by: 'admin-user-id',
        created_at: '2025-10-06T12:01:00Z',
    },
    // test infinite scroll
    ...Array.from({ length: 50 }, (_, i) => ({
        id: `ml_extra_${i + 1}`,
        target_type: (i % 2 === 0 ? 'post' : 'comment') as 'post' | 'comment',
        target_id: `extra_target_${i + 1}`,
        //  The 'action' property must be either 'remove' or 'restore'. Changed from Vietnamese equivalents.
        action: (i % 3 === 0 ? 'restore' : 'remove') as 'restore' | 'remove',
        reason: `Lý do tự động ${i + 1}.`,
        performed_by: i % 5 === 0 ? 'superadmin-user-id' : 'admin-user-id',
        created_at: new Date(Date.now() - i * 3600000).toISOString(), // Mỗi log cách nhau 1 giờ
    }))
];