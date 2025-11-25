import React, { useState, useEffect } from 'react';
import { fetchDashboardCharts, fetchDashboardAnalytics, fetchDashboardCommunity } from './dashboard/api';
import type { DashboardChartsData, DashboardAnalyticsData, DashboardCommunityData } from './dashboard/api';

import StatCard from './dashboard/components/StatCard';
import AnalyticsCard from './dashboard/components/AnalyticsCard';
import RecentAdminLogs from './dashboard/components/RecentAdminLogs';
import CommunityActivityFeed from './dashboard/components/CommunityActivityFeed';
import TrendingContentCard from './dashboard/components/TrendingContentCard';

import { UsersIcon, CurrencyDollarIcon, ChatAlt2Icon, DocumentTextIcon } from '../constants';

const Dashboard: React.FC = () => {
    // State cho dữ liệu từ API
    const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);
    const [analyticsData, setAnalyticsData] = useState<DashboardAnalyticsData | null>(null);
    const [communityData, setCommunityData] = useState<DashboardCommunityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dữ liệu từ API - Sử dụng cache để tránh load lại nhiều lần
    useEffect(() => {
        const loadDashboardData = async () => {
            // Kiểm tra cache trong sessionStorage
            const cachedData = sessionStorage.getItem('dashboard_data');
            const cachedTimestamp = sessionStorage.getItem('dashboard_timestamp');
            
            // Nếu có cache và chưa quá 5 phút thì dùng cache
            if (cachedData && cachedTimestamp) {
                const age = Date.now() - parseInt(cachedTimestamp);
                if (age < 5 * 60 * 1000) { // 5 phút
                    try {
                        const parsed = JSON.parse(cachedData);
                        setChartsData(parsed.charts);
                        setAnalyticsData(parsed.analytics);
                        setCommunityData(parsed.community);
                        setIsLoading(false);
                        return;
                    } catch {
                        // Cache lỗi, tiếp tục fetch
                    }
                }
            }

            // Không có cache hoặc cache hết hạn → Fetch mới
            setIsLoading(true);
            setError(null);
            try {
                const [charts, analytics, community] = await Promise.all([
                    fetchDashboardCharts(),
                    fetchDashboardAnalytics(),
                    fetchDashboardCommunity(),
                ]);
                setChartsData(charts);
                setAnalyticsData(analytics);
                setCommunityData(community);
                
                // Lưu vào cache
                try {
                    sessionStorage.setItem('dashboard_data', JSON.stringify({ charts, analytics, community }));
                    sessionStorage.setItem('dashboard_timestamp', Date.now().toString());
                } catch {
                    // Ignore cache errors
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Transform dữ liệu từ API để phù hợp với UI
    const topUsers = communityData?.topUsers.map((user) => {
        const maxPoints = communityData.topUsers[0]?.community_points || 1;
        return {
            user: {
                id: user.id,
                name: user.name,
                avatar_url: user.avatar_url,
            },
            posts: 0,
            comments: 0,
            likes: 0,
            score: user.community_points,
            scorePercent: (user.community_points / maxPoints) * 100,
        };
    }) || [];

    const topTopics = communityData?.topTopics.map((topic) => {
        const totalPosts = communityData.topTopics.reduce((sum, t) => sum + parseInt(t.post_count), 0);
        return {
            topic: topic.topic,
            count: parseInt(topic.post_count),
            percent: totalPosts > 0 ? (parseInt(topic.post_count) / totalPosts) * 100 : 0,
        };
    }) || [];

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-semibold">Lỗi tải dữ liệu</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Kiểm tra dữ liệu đã load
    if (!chartsData || !analyticsData || !communityData) {
        return null;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>

            {/* Hàng trên: 4 thẻ thống kê chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Doanh thu tháng này" value={formatCurrency(analyticsData.monthlyRevenue)} icon={CurrencyDollarIcon} />
                <StatCard title="Người dùng hoạt động" value={analyticsData.activeUsers.toLocaleString()} icon={UsersIcon} />
                <StatCard title="Báo cáo chờ xử lý" value={analyticsData.pendingReports.toLocaleString()} icon={ChatAlt2Icon} />
                <StatCard title="Bài viết mới hôm nay" value={analyticsData.newPostsToday.toLocaleString()} icon={DocumentTextIcon} />
            </div>

            {/* Thay đổi layout thành lưới 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsCard 
                    dailyRevenue={chartsData.dailyRevenue}
                    dailyReports={chartsData.dailyReports}
                    dailyViolations={chartsData.dailyViolations}
                    dailyNewUsers={chartsData.dailyNewUsers}
                />
                <RecentAdminLogs logs={communityData.recentLogs} />
                <TrendingContentCard topUsers={topUsers} topTopics={topTopics} />
                <CommunityActivityFeed 
                    recentUsers={communityData.recentUsers} 
                    pendingReportsCount={analyticsData.pendingReports} 
                    pendingAppealsCount={analyticsData.pendingAppeals}
                    unreadNotificationsCount={analyticsData.unreadAdminNotifications}
                />
            </div>
        </div>
    );
};

export default Dashboard;