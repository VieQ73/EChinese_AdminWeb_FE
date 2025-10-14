import { User, UserSession, UserDailyActivity, UserStreak, UserUsage } from '../types';

// Super Admin user, consistent with login mock
export const superAdminUser: User = {
    id: 'superadmin-user-id',
    username: 'superadmin',
    name: 'Vương Đại Nhân',
    avatar_url: `https://picsum.photos/seed/superadmin/100`,
    email: `superadmin@example.com`,
    role: 'super admin',
    is_active: true,
    isVerify: true,
    community_points: 9999,
    level: '7-9',
    badge_level: 5,
    language: 'Tiếng Việt',
    created_at: '2023-01-01T12:00:00Z',
    last_login: new Date().toISOString(),
    provider: 'local',
};

export const mockUsers: User[] = [
    superAdminUser,
    { id: 'admin-user-id', username: 'admin_01', name: 'Trần Quản Lý', avatar_url: 'https://picsum.photos/seed/admin01/100', email: 'admin@example.com', role: 'admin', is_active: true, isVerify: true, community_points: 1500, level: '6', badge_level: 4, language: 'Tiếng Việt', created_at: '2023-02-10T11:00:00Z', last_login: '2025-10-06T08:30:00Z', provider: 'local' },
    { id: 'u1', username: 'ling_lee98', name: 'Linh Lê', avatar_url: 'https://picsum.photos/seed/u1/100', email: 'ling.lee@example.com', role: 'user', is_active: true, isVerify: true, community_points: 1250, level: '5', badge_level: 2, language: 'Tiếng Việt', created_at: '2023-05-10T10:00:00Z', last_login: '2025-10-06T09:15:00Z', provider: 'google' },
    { id: 'u2', username: 'chen_wei_cool', name: 'user_wei_chen', avatar_url: 'https://picsum.photos/seed/u2/100', email: 'wei.chen@example.com', role: 'user', is_active: true, isVerify: true, community_points: 800, level: '3', badge_level: 1, language: 'Tiếng Anh', created_at: '2023-08-15T14:30:00Z', last_login: '2025-10-06T09:45:00Z', provider: 'local' },
    { id: 'u3', username: 'mei_zhang_hsk', name: 'Mei Zhang', avatar_url: 'https://picsum.photos/seed/u3/100', email: 'mei.zhang@example.com', role: 'user', is_active: false, isVerify: false, community_points: 200, level: '2', badge_level: 0, language: 'Tiếng Việt', created_at: '2024-01-20T09:00:00Z', last_login: '2025-10-06T10:00:00Z', provider: 'apple' },
    { id: 'u4', username: 'hoang_viet_2k', name: 'Hoàng Văn Việt', avatar_url: 'https://picsum.photos/seed/u4/100', email: 'hoangviet@example.com', role: 'user', is_active: true, isVerify: true, community_points: 540, level: '4', badge_level: 1, language: 'Tiếng Việt', created_at: '2023-09-01T18:00:00Z', last_login: '2025-10-06T10:30:00Z', provider: 'local' },
    { id: 'u5', username: 'premium_user_99', name: 'Nguyễn An Nhiên', avatar_url: 'https://picsum.photos/seed/u5/100', email: 'annhien@example.com', role: 'user', is_active: true, isVerify: true, community_points: 2100, level: '6', badge_level: 3, language: 'Tiếng Việt', created_at: '2023-03-15T09:00:00Z', last_login: '2025-10-06T11:15:00Z', provider: 'google' },
    { id: 'u6', username: 'banned_user_01', name: 'Tài Khoản Bị Cấm', avatar_url: 'https://picsum.photos/seed/u6/100', email: 'banned@example.com', role: 'user', is_active: false, isVerify: true, community_points: 10, level: '1', badge_level: 0, language: 'Tiếng Việt', created_at: '2024-03-01T12:00:00Z', last_login: '2025-10-06T07:00:00Z', provider: 'local' },
    { id: 'u7', username: 'hsk_lover_vn', name: 'Trần Thị Thảo', avatar_url: 'https://picsum.photos/seed/u7/100', email: 'thaotran@example.com', role: 'user', is_active: true, isVerify: true, community_points: 980, level: '5', badge_level: 2, language: 'Tiếng Việt', created_at: '2023-11-20T16:00:00Z', last_login: '2025-10-06T11:45:00Z', provider: 'google' },
    { id: 'u8', username: 'apple_fan_88', name: 'Lê Minh Anh', avatar_url: 'https://picsum.photos/seed/u8/100', email: 'minhanh.le@example.com', role: 'user', is_active: true, isVerify: false, community_points: 330, level: '3', badge_level: 1, language: 'Tiếng Việt', created_at: '2024-02-18T22:00:00Z', last_login: '2025-10-06T12:00:00Z', provider: 'apple' },
    { id: 'u9', username: 'refund_guy_01', name: 'Hoàn Tiền Nhanh', avatar_url: 'https://picsum.photos/seed/u9/100', email: 'hoantien@example.com', role: 'user', is_active: true, isVerify: true, community_points: 50, level: '1', badge_level: 0, language: 'Tiếng Việt', created_at: '2025-05-25T10:00:00Z', last_login: '2025-06-10T09:00:00Z', provider: 'local' },
    { id: 'u10', username: 'partial_refund_99', name: 'Văn An', avatar_url: 'https://picsum.photos/seed/u10/100', email: 'vanan@example.com', role: 'user', is_active: true, isVerify: true, community_points: 120, level: '2', badge_level: 1, language: 'Tiếng Việt', created_at: '2025-05-28T11:00:00Z', last_login: '2025-06-11T14:00:00Z', provider: 'google' },
];

export const mockUserSessions: UserSession[] = [
    { id: 's1', user_id: 'u1', login_at: '2025-10-06T09:15:00Z', logout_at: '2025-10-06T10:45:00Z', device: 'iPhone 15 Pro', ip_address: '123.45.67.89' },
    { id: 's2', user_id: 'u2', login_at: '2025-10-06T09:45:00Z', logout_at: '2025-10-06T11:00:00Z', device: 'Oppo A78', ip_address: '98.76.54.32' },
    { id: 's3', user_id: 'u3', login_at: '2025-10-06T10:00:00Z', logout_at: '2025-10-06T10:20:00Z', device: 'iPhone 13', ip_address: '45.22.11.54' },
    { id: 's4', user_id: 'u4', login_at: '2025-10-06T10:30:00Z', logout_at: '2025-10-06T11:30:00Z', device: 'Samsung Galaxy S23', ip_address: '203.11.54.78' },
    { id: 's5', user_id: 'u5', login_at: '2025-10-06T11:15:00Z', logout_at: '2025-10-06T12:30:00Z', device: 'Xiaomi 14 Ultra', ip_address: '102.45.88.23' },
    { id: 's6', user_id: 'u6', login_at: '2025-10-06T07:00:00Z', logout_at: '2025-10-06T07:20:00Z', device: 'Vivo Y36', ip_address: '110.24.56.77' },
    { id: 's7', user_id: 'u7', login_at: '2025-10-06T11:45:00Z', logout_at: '2025-10-06T13:00:00Z', device: 'iPhone 14 Pro', ip_address: '122.99.45.12' },
    { id: 's8', user_id: 'u8', login_at: '2025-10-06T12:00:00Z', logout_at: '2025-10-06T13:20:00Z', device: 'iPad Air 5', ip_address: '156.77.23.89' },
    // Admin và Super Admin có thể truy cập Web + Mobile
    { id: 's9', user_id: 'admin-user-id', login_at: '2025-10-06T08:30:00Z', logout_at: '2025-10-06T11:00:00Z', device: 'Web Browser', ip_address: '203.0.113.1' },
    { id: 's10', user_id: 'admin-user-id', login_at: '2025-10-06T07:45:00Z', logout_at: '2025-10-06T08:15:00Z', device: 'iPhone 14 Pro Max', ip_address: '123.33.22.11' },
    { id: 's11', user_id: 'superadmin-user-id', login_at: '2025-10-06T09:00:00Z', logout_at: '2025-10-06T12:00:00Z', device: 'Web Browser', ip_address: '198.51.100.2' },
    { id: 's12', user_id: 'superadmin-user-id', login_at: '2025-10-06T06:30:00Z', logout_at: '2025-10-06T08:00:00Z', device: 'Google Pixel 8 Pro', ip_address: '202.44.55.66' },
];


export const mockUserDailyActivities: UserDailyActivity[] = [
    // Super admin & admin hoạt động cả web & mobile
    { user_id: 'superadmin-user-id', date: '2025-10-06', minutes_online: 180, login_count: 3 },
    { user_id: 'admin-user-id', date: '2025-10-06', minutes_online: 150, login_count: 2 },

    // Người dùng premium & thường
    { user_id: 'u1', date: '2025-10-06', minutes_online: 120, login_count: 2 },
    { user_id: 'u2', date: '2025-10-06', minutes_online: 90, login_count: 1 },
    { user_id: 'u3', date: '2025-10-06', minutes_online: 0, login_count: 0 }, // inactive
    { user_id: 'u4', date: '2025-10-06', minutes_online: 60, login_count: 1 },
    { user_id: 'u5', date: '2025-10-06', minutes_online: 200, login_count: 2 }, // premium
    { user_id: 'u6', date: '2025-10-06', minutes_online: 0, login_count: 0 }, // banned
    { user_id: 'u7', date: '2025-10-06', minutes_online: 85, login_count: 1 },
    { user_id: 'u8', date: '2025-10-06', minutes_online: 70, login_count: 1 },
];

export const mockUserStreaks: UserStreak[] = [
    { user_id: 'superadmin-user-id', current_streak: 120, longest_streak: 365, last_login_date: '2025-10-06' },
    { user_id: 'admin-user-id', current_streak: 90, longest_streak: 200, last_login_date: '2025-10-06' },
    { user_id: 'u1', current_streak: 25, longest_streak: 45, last_login_date: '2025-10-06' },
    { user_id: 'u2', current_streak: 5, longest_streak: 10, last_login_date: '2025-10-06' },
    { user_id: 'u3', current_streak: 0, longest_streak: 7, last_login_date: '2024-06-01' },
    { user_id: 'u4', current_streak: 8, longest_streak: 15, last_login_date: '2025-10-06' },
    { user_id: 'u5', current_streak: 40, longest_streak: 80, last_login_date: '2025-10-06' },
    { user_id: 'u6', current_streak: 0, longest_streak: 2, last_login_date: '2024-05-01' },
    { user_id: 'u7', current_streak: 10, longest_streak: 25, last_login_date: '2025-10-06' },
    { user_id: 'u8', current_streak: 6, longest_streak: 12, last_login_date: '2025-10-06' },
];

export const mockUserUsage: UserUsage[] = [
    // Super admin
    { id: 'usage1', user_id: 'superadmin-user-id', feature: 'ai_lesson', daily_count: 25, last_reset: new Date().toISOString() },
    { id: 'usage2', user_id: 'superadmin-user-id', feature: 'ai_translate', daily_count: 250, last_reset: new Date().toISOString() },

    // Admin
    { id: 'usage3', user_id: 'admin-user-id', feature: 'ai_lesson', daily_count: 10, last_reset: new Date().toISOString() },
    { id: 'usage4', user_id: 'admin-user-id', feature: 'ai_translate', daily_count: 200, last_reset: new Date().toISOString() },

    // User u1 (premium)
    { id: 'usage5', user_id: 'u1', feature: 'ai_lesson', daily_count: 4, last_reset: new Date().toISOString() },
    { id: 'usage6', user_id: 'u1', feature: 'ai_translate', daily_count: 60, last_reset: new Date().toISOString() },

    // User u2 (free)
    { id: 'usage7', user_id: 'u2', feature: 'ai_lesson', daily_count: 1, last_reset: new Date().toISOString() },
    { id: 'usage8', user_id: 'u2', feature: 'ai_translate', daily_count: 3, last_reset: new Date().toISOString() },

    // User u3 (inactive)
    { id: 'usage9', user_id: 'u3', feature: 'ai_lesson', daily_count: 0, last_reset: new Date().toISOString() },
    { id: 'usage10', user_id: 'u3', feature: 'ai_translate', daily_count: 0, last_reset: new Date().toISOString() },

    // User u4 (free)
    { id: 'usage11', user_id: 'u4', feature: 'ai_lesson', daily_count: 1, last_reset: new Date().toISOString() },
    { id: 'usage12', user_id: 'u4', feature: 'ai_translate', daily_count: 4, last_reset: new Date().toISOString() },

    // User u5 (premium)
    { id: 'usage13', user_id: 'u5', feature: 'ai_lesson', daily_count: 6, last_reset: new Date().toISOString() },
    { id: 'usage14', user_id: 'u5', feature: 'ai_translate', daily_count: 120, last_reset: new Date().toISOString() },

    // User u6 (banned)
    { id: 'usage15', user_id: 'u6', feature: 'ai_lesson', daily_count: 0, last_reset: new Date().toISOString() },
    { id: 'usage16', user_id: 'u6', feature: 'ai_translate', daily_count: 0, last_reset: new Date().toISOString() },

    // User u7
    { id: 'usage17', user_id: 'u7', feature: 'ai_lesson', daily_count: 3, last_reset: new Date().toISOString() },
    { id: 'usage18', user_id: 'u7', feature: 'ai_translate', daily_count: 25, last_reset: new Date().toISOString() },

    // User u8
    { id: 'usage19', user_id: 'u8', feature: 'ai_lesson', daily_count: 2, last_reset: new Date().toISOString() },
    { id: 'usage20', user_id: 'u8', feature: 'ai_translate', daily_count: 15, last_reset: new Date().toISOString() },
    
    // User u9 (free tier usage)
    { id: 'usage21', user_id: 'u9', feature: 'ai_lesson', daily_count: 0, last_reset: new Date().toISOString() },
    { id: 'usage22', user_id: 'u9', feature: 'ai_translate', daily_count: 1, last_reset: new Date().toISOString() },
    // User u10 (premium usage)
    { id: 'usage23', user_id: 'u10', feature: 'ai_lesson', daily_count: 3, last_reset: new Date().toISOString() },
    { id: 'usage24', user_id: 'u10', feature: 'ai_translate', daily_count: 15, last_reset: new Date().toISOString() },
];