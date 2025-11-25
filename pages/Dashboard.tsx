import React from 'react';
import { useDashboardStats } from './dashboard/hooks/useDashboardStats';

import StatCard from './dashboard/components/StatCard';
import AnalyticsCard from './dashboard/components/AnalyticsCard';
import RecentAdminLogs from './dashboard/components/RecentAdminLogs';
import CommunityActivityFeed from './dashboard/components/CommunityActivityFeed';
import TrendingContentCard from './dashboard/components/TrendingContentCard';

import { UsersIcon, CurrencyDollarIcon, ChatAlt2Icon, DocumentTextIcon } from '../constants';

const Dashboard: React.FC = () => {
    // Sử dụng hook với caching thay vì lấy toàn bộ data từ context
    const { data: stats, isLoading, error } = useDashboardStats();

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Hiển thị loading state
    if (isLoading && !stats) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // Hiển thị error state
    if (error) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi khi tải dữ liệu: {error.message}
                </div>
            </div>
        );
    }

    // Không có dữ liệu
    if (!stats) return null;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>

            {/* Hàng trên: 4 thẻ thống kê chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Doanh thu tháng này" value={formatCurrency(stats.monthlyRevenue)} icon={CurrencyDollarIcon} />
                <StatCard title="Người dùng hoạt động" value={stats.activeUsers.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Báo cáo chờ xử lý" value={stats.pendingReports.toLocaleString()} icon={ChatAlt2Icon} />
                <StatCard title="Bài viết mới hôm nay" value={stats.newPostsToday.toLocaleString()} icon={DocumentTextIcon} />
            </div>

            {/* Thay đổi layout thành lưới 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsCard 
                    dailyRevenue={stats.dailyRevenue}
                    dailyReports={stats.dailyReports}
                    dailyViolations={stats.dailyViolations}
                    dailyNewUsers={stats.dailyNewUsers}
                />
                <RecentAdminLogs logs={stats.recentLogs} />
                <TrendingContentCard topUsers={stats.topUsers} topTopics={stats.topTopics} />
                <CommunityActivityFeed 
                    recentUsers={stats.recentUsers} 
                    pendingReportsCount={stats.pendingReports} 
                    pendingAppealsCount={stats.pendingAppeals}
                    unreadNotificationsCount={stats.unreadAdminNotifications}
                />
            </div>
        </div>
    );
};

export default Dashboard;