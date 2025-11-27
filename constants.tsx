import React from 'react';

// Tái export (re-export) tất cả các icon từ thư mục mới.
// Điều này giúp duy trì API công khai của file này,
// do đó các file khác đang import icon từ 'constants' không cần phải thay đổi.
export * from './components/icons';

// Import các kiểu dữ liệu và các icon cụ thể cần thiết cho các hằng số được định nghĩa trong file này.
import type { IconProps } from './components/icons';
import {
    DashboardIcon, UsersIcon, CommunityIcon, NotebookIcon, ReportIcon,
    SubscriptionIcon, AchievementIcon, MockTestIcon, TipIcon,
    SystemIcon, RuleIcon
} from './components/icons';

export const MenuIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const BellIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0-1.064-.124-2.09-.356-3.04z" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

export const RotateCcwIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const NAVIGATION_LINKS: { name: string; path: string; icon: React.FC<IconProps> }[] = [
    { name: 'Tổng quan', path: '/', icon: DashboardIcon },
    { name: 'Quản lý Người dùng', path: '/users', icon: UsersIcon },
    { name: 'Quản lý Cộng đồng', path: '/community', icon: CommunityIcon },
    { name: 'Sổ tay & Từ vựng', path: '/notebooks', icon: NotebookIcon },
    { name: 'Kiểm duyệt & Thông báo', path: '/reports', icon: ReportIcon },
    { name: 'Quản lý Quy tắc', path: '/rules', icon: RuleIcon },
    { name: 'Gói đăng ký và thanh toán', path: '/subscriptions', icon: SubscriptionIcon },
    { name: 'Thành tích và Huy hiệu', path: '/achievements', icon: AchievementIcon },
    { name: 'Quản lý Bài thi', path: '/mock-tests', icon: MockTestIcon },
    { name: 'Quản lý Mẹo', path: '/tips', icon: TipIcon },
    { name: 'Quản lý Hệ thống', path: '/system', icon: SystemIcon },
];

export const POST_TOPICS = [
    'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ', 'Tìm bạn học chung',
    'Học tiếng Trung', 'Tìm gia sư', 'Việc làm', 'Văn hóa', 'Thể thao', 'Xây dựng',
    'Y tế', 'Tâm sự', 'Khác'
] as const;