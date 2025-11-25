// React Query-like hooks cho Dashboard
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    fetchDashboardStats,
    fetchOverviewStats,
    fetchChartData,
    fetchRecentAdminLogs,
    fetchTrendingContent,
    fetchCommunityActivityStats,
    DashboardStats,
    ChartDataPoint,
    TopUser,
    TopTopic
} from '../api/stats';
import { AdminLog, User } from '../../../types';

// Cache TTL mặc định 30 giây
const DEFAULT_CACHE_TTL = 30000;

// Generic hook với caching
function useCachedQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    cacheTTL: number = DEFAULT_CACHE_TTL
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        // Kiểm tra cache còn hiệu lực
        if (!forceRefresh && cacheRef.current) {
            const isExpired = Date.now() - cacheRef.current.timestamp > cacheTTL;
            if (!isExpired) {
                setData(cacheRef.current.data);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await queryFn();
            cacheRef.current = { data: result, timestamp: Date.now() };
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [queryFn, cacheTTL]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}

/**
 * Hook lấy toàn bộ Dashboard stats
 */
export function useDashboardStats() {
    return useCachedQuery<DashboardStats>(
        fetchDashboardStats,
        'dashboard-stats'
    );
}

/**
 * Hook lấy 4 số liệu tổng quan
 */
export function useOverviewStats() {
    return useCachedQuery<Pick<DashboardStats, 'monthlyRevenue' | 'activeUsers' | 'pendingReports' | 'newPostsToday'>>(
        fetchOverviewStats,
        'overview-stats'
    );
}

/**
 * Hook lấy dữ liệu biểu đồ
 */
export function useChartData() {
    return useCachedQuery<Pick<DashboardStats, 'dailyRevenue' | 'dailyReports' | 'dailyViolations' | 'dailyNewUsers'>>(
        fetchChartData,
        'chart-data'
    );
}

/**
 * Hook lấy admin logs gần đây
 */
export function useRecentAdminLogs(limit: number = 10) {
    const queryFn = useCallback(() => fetchRecentAdminLogs(limit), [limit]);
    return useCachedQuery<AdminLog[]>(queryFn, `recent-logs-${limit}`);
}

/**
 * Hook lấy trending content (top users & topics)
 */
export function useTrendingContent() {
    return useCachedQuery<Pick<DashboardStats, 'topUsers' | 'topTopics'>>(
        fetchTrendingContent,
        'trending-content'
    );
}

/**
 * Hook lấy community activity stats
 */
export function useCommunityActivityStats() {
    return useCachedQuery<Pick<DashboardStats, 'pendingAppeals' | 'unreadAdminNotifications' | 'recentUsers'> & { pendingReports: number }>(
        fetchCommunityActivityStats,
        'community-activity'
    );
}

// Export types cho components
export type { DashboardStats, ChartDataPoint, TopUser, TopTopic };
