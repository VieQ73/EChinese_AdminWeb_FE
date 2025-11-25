// API functions cho Dashboard stats
import { apiClient } from '../../../services/apiClient';
import { User, Payment, Report, Violation, AdminLog, RawPost, Comment, PostLike, Appeal, Notification } from '../../../types';
import { mockUsers } from '../../../mock/users';
import { mockPayments } from '../../../mock/monetization';
import { mockAdminLogs } from '../../../mock/system';
import { mockNotifications } from '../../../mock/notifications';
import { mockPosts, mockComments, mockPostLikes } from '../../../mock/community';
import { mockReports, mockViolations, mockAppeals } from '../../../mock/moderation';
import { generateDailyRevenue, generateDailyReports, generateDailyViolations, generateDailyNewUsers } from '../utils';

// Flag để chuyển đổi giữa mock và API thật
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types cho Dashboard stats
export interface ChartDataPoint {
    date: string;
    value: number;
}

export interface TopUser {
    user: User | undefined;
    posts: number;
    comments: number;
    likes: number;
    score: number;
    scorePercent: number;
}

export interface TopTopic {
    topic: string;
    count: number;
    percent: number;
}

export interface DashboardStats {
    monthlyRevenue: number;
    activeUsers: number;
    pendingReports: number;
    newPostsToday: number;
    pendingAppeals: number;
    unreadAdminNotifications: number;
    recentLogs: AdminLog[];
    recentUsers: User[];
    dailyRevenue: ChartDataPoint[];
    dailyReports: ChartDataPoint[];
    dailyViolations: ChartDataPoint[];
    dailyNewUsers: ChartDataPoint[];
    topUsers: TopUser[];
    topTopics: TopTopic[];
}

// Hàm tính toán stats từ raw data (dùng cho mock)
function calculateStats(
    users: User[],
    payments: Payment[],
    adminLogs: AdminLog[],
    posts: RawPost[],
    reports: Report[],
    violations: Violation[],
    comments: Comment[],
    postLikes: PostLike[],
    appeals: Appeal[],
    notifications: Notification[]
): DashboardStats {
    const now = new Date();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Thống kê cơ bản
    const monthlyRevenue = payments
        .filter(p => {
            const date = new Date(p.transaction_date);
            return p.status === 'successful' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const activeUsers = users.filter(u => u.is_active).length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const newPostsToday = posts.filter(p => new Date(p.created_at) >= todayStart).length;
    const pendingAppeals = appeals.filter(a => a.status === 'pending').length;
    const unreadAdminNotifications = notifications.filter(n => (n.audience === 'admin' || n.from_system) && !n.read_at).length;

    const recentLogs = adminLogs.slice(0, 10);

    const recentUsers = users
        .filter(u => new Date(u.created_at) >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    // Dữ liệu biểu đồ
    const dailyRevenue = generateDailyRevenue(payments, 7);
    const dailyReports = generateDailyReports(reports, 7);
    const dailyViolations = generateDailyViolations(violations, 7);
    const dailyNewUsers = generateDailyNewUsers(users, 7);

    // Tính toán người dùng nổi bật
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

    // Tính toán chủ đề sôi nổi
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
        monthlyRevenue,
        activeUsers,
        pendingReports,
        newPostsToday,
        pendingAppeals,
        unreadAdminNotifications,
        recentLogs,
        recentUsers,
        dailyRevenue,
        dailyReports,
        dailyViolations,
        dailyNewUsers,
        topUsers,
        topTopics
    };
}

/**
 * Lấy toàn bộ thống kê cho Dashboard
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
    if (USE_MOCK_API) {
        return calculateStats(
            mockUsers,
            mockPayments,
            mockAdminLogs,
            mockPosts,
            mockReports,
            mockViolations,
            mockComments,
            mockPostLikes,
            mockAppeals,
            mockNotifications
        );
    }
    
    // API thật - backend sẽ tính toán và trả về stats
    return apiClient.get<DashboardStats>('/dashboard/stats');
}

/**
 * Lấy thống kê tổng quan (4 số liệu chính)
 */
export async function fetchOverviewStats(): Promise<Pick<DashboardStats, 'monthlyRevenue' | 'activeUsers' | 'pendingReports' | 'newPostsToday'>> {
    if (USE_MOCK_API) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));

        return {
            monthlyRevenue: mockPayments
                .filter(p => {
                    const date = new Date(p.transaction_date);
                    return p.status === 'successful' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .reduce((sum, p) => sum + p.amount, 0),
            activeUsers: mockUsers.filter(u => u.is_active).length,
            pendingReports: mockReports.filter(r => r.status === 'pending').length,
            newPostsToday: mockPosts.filter(p => new Date(p.created_at) >= todayStart).length
        };
    }
    
    return apiClient.get<Pick<DashboardStats, 'monthlyRevenue' | 'activeUsers' | 'pendingReports' | 'newPostsToday'>>('/dashboard/overview');
}

/**
 * Lấy dữ liệu biểu đồ
 */
export async function fetchChartData(): Promise<Pick<DashboardStats, 'dailyRevenue' | 'dailyReports' | 'dailyViolations' | 'dailyNewUsers'>> {
    if (USE_MOCK_API) {
        return {
            dailyRevenue: generateDailyRevenue(mockPayments, 7),
            dailyReports: generateDailyReports(mockReports, 7),
            dailyViolations: generateDailyViolations(mockViolations, 7),
            dailyNewUsers: generateDailyNewUsers(mockUsers, 7)
        };
    }
    
    return apiClient.get<Pick<DashboardStats, 'dailyRevenue' | 'dailyReports' | 'dailyViolations' | 'dailyNewUsers'>>('/dashboard/charts');
}

/**
 * Lấy admin logs gần đây
 */
export async function fetchRecentAdminLogs(limit: number = 10): Promise<AdminLog[]> {
    if (USE_MOCK_API) {
        return mockAdminLogs.slice(0, limit);
    }
    
    return apiClient.get<AdminLog[]>(`/dashboard/admin-logs?limit=${limit}`);
}

/**
 * Lấy người dùng mới gần đây
 */
export async function fetchRecentUsers(days: number = 3, limit: number = 5): Promise<User[]> {
    if (USE_MOCK_API) {
        return mockUsers
            .filter(u => new Date(u.created_at) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
    }
    
    return apiClient.get<User[]>(`/dashboard/recent-users?days=${days}&limit=${limit}`);
}

/**
 * Lấy top users và topics
 */
export async function fetchTrendingContent(): Promise<Pick<DashboardStats, 'topUsers' | 'topTopics'>> {
    if (USE_MOCK_API) {
        const fullStats = calculateStats(
            mockUsers, mockPayments, mockAdminLogs, mockPosts,
            mockReports, mockViolations, mockComments, mockPostLikes,
            mockAppeals, mockNotifications
        );
        
        return {
            topUsers: fullStats.topUsers,
            topTopics: fullStats.topTopics
        };
    }
    
    return apiClient.get<Pick<DashboardStats, 'topUsers' | 'topTopics'>>('/dashboard/trending');
}

/**
 * Lấy community activity stats
 */
export async function fetchCommunityActivityStats(): Promise<Pick<DashboardStats, 'pendingAppeals' | 'unreadAdminNotifications' | 'recentUsers'> & { pendingReports: number }> {
    if (USE_MOCK_API) {
        return {
            pendingReports: mockReports.filter(r => r.status === 'pending').length,
            pendingAppeals: mockAppeals.filter(a => a.status === 'pending').length,
            unreadAdminNotifications: mockNotifications.filter(n => (n.audience === 'admin' || n.from_system) && !n.read_at).length,
            recentUsers: mockUsers
                .filter(u => new Date(u.created_at) >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
        };
    }
    
    return apiClient.get<Pick<DashboardStats, 'pendingAppeals' | 'unreadAdminNotifications' | 'recentUsers'> & { pendingReports: number }>('/dashboard/community-activity');
}
