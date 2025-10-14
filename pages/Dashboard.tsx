import React, { useMemo } from 'react';
import { useAppData } from '../contexts/appData/context';

import StatCard from './dashboard/components/StatCard';
import AnalyticsCard from './dashboard/components/AnalyticsCard';
import RecentAdminLogs from './dashboard/components/RecentAdminLogs';
import CommunityActivityFeed from './dashboard/components/CommunityActivityFeed';
import { generateDailyRevenue, generateDailyReports, generateDailyViolations, generateDailyNewUsers } from './dashboard/utils';
import TrendingContentCard from './dashboard/components/TrendingContentCard';

import { UsersIcon, CurrencyDollarIcon, ChatAlt2Icon, DocumentTextIcon } from '../constants';

const Dashboard: React.FC = () => {
    // Lấy dữ liệu toàn cục từ context, thêm appeals và notifications
    const { users, payments, adminLogs, posts, reports, violations, comments, postLikes, appeals, notifications } = useAppData();

    // Sử dụng useMemo để tính toán các chỉ số mà không cần render lại không cần thiết
    const stats = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));

        // --- Thống kê cơ bản ---
        const monthlyRevenue = payments
            .filter(p => {
                const date = new Date(p.transaction_date);
                return p.status === 'successful' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        const activeUsers = users.filter(u => u.is_active).length;
        const pendingReports = reports.filter(r => r.status === 'pending').length;
        const newPostsToday = posts.filter(p => new Date(p.created_at) >= todayStart).length;

        // --- Thống kê mới cho Community Activity ---
        const pendingAppeals = appeals.filter(a => a.status === 'pending').length;
        const unreadAdminNotifications = notifications.filter(n => (n.audience === 'admin' || n.from_system) && !n.read_at).length;
        
        const recentLogs = adminLogs.slice(0, 10);

        const recentUsers = users
            .filter(u => new Date(u.created_at) >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        // --- Dữ liệu cho các biểu đồ ---
        const dailyRevenue = generateDailyRevenue(payments, 7);
        const dailyReports = generateDailyReports(reports, 7);
        const dailyViolations = generateDailyViolations(violations, 7);
        const dailyNewUsers = generateDailyNewUsers(users, 7);
        
        // Tính toán người dùng nổi bật ---
        const userActivity = new Map<string, { posts: number, comments: number, likes: number, score: number }>();
        
        const processItems = <T extends { user_id: string, created_at: string }>(items: T[], type: 'posts' | 'comments' | 'likes') => {
            items.filter(item => new Date(item.created_at) >= oneWeekAgo).forEach(item => {
                const activity = userActivity.get(item.user_id) || { posts: 0, comments: 0, likes: 0, score: 0 };
                activity[type]++;
                userActivity.set(item.user_id, activity);
            });
        };
        
        processItems(posts, 'posts');
        processItems(comments.filter(c => !c.deleted_at), 'comments');
        processItems(postLikes, 'likes');

        userActivity.forEach((activity, userId) => {
            activity.score = activity.posts * 3 + activity.comments * 1 + activity.likes * 0.5;
            userActivity.set(userId, activity);
        });

        const sortedUsers = Array.from(userActivity.entries())
            .sort(([, a], [, b]) => b.score - a.score)
            .slice(0, 5)
            .map(([userId, activity]) => ({ user: users.find(u => u.id === userId), ...activity }));
            
        const maxScore = sortedUsers.length > 0 ? sortedUsers[0].score : 0;
        const topUsers = sortedUsers.filter(u => u.user).map(u => ({ ...u, scorePercent: maxScore > 0 ? (u.score / maxScore) * 100 : 0 }));

        // --- Tính toán chủ đề sôi nổi ---
        const topicCounts = new Map<string, number>();
        const postsLastWeek = posts.filter(p => new Date(p.created_at) >= oneWeekAgo);

        postsLastWeek.forEach(p => {
            topicCounts.set(p.topic, (topicCounts.get(p.topic) || 0) + 1);
        });
        
        const topTopics = Array.from(topicCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic, count]) => ({
                topic,
                count,
                percent: postsLastWeek.length > 0 ? (count / postsLastWeek.length) * 100 : 0
            }));

        return { 
            monthlyRevenue, activeUsers, pendingReports, newPostsToday, recentLogs, recentUsers, 
            dailyRevenue, dailyReports, dailyViolations, dailyNewUsers,
            topUsers, topTopics,
            pendingAppeals, unreadAdminNotifications // Thêm vào kết quả trả về
        };
    }, [users, payments, adminLogs, posts, reports, violations, comments, postLikes, appeals, notifications]); // Thêm dependencies

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

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