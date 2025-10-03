import { useState, useEffect, useCallback } from 'react';
import type { ModerationLog } from '../../../types/entities';
import type { PaginatedResponse } from '../../../types/api';
import * as communityApi from '../communityApi';

// Hook chuyên dụng cho quản lý thống kê và moderation logs
export const useCommunityStats = () => {
  const [stats, setStats] = useState<{
    total_posts: number;
    active_posts: number;
    deleted_posts: number;
    pending_posts: number;
    total_comments: number;
    active_comments: number;
    deleted_comments: number;
    total_reports: number;
    pending_reports: number;
    resolved_reports: number;
    total_users_active: number;
    posts_today: number;
    comments_today: number;
    reports_today: number;
  } | null>(null);

  const [statsByDate, setStatsByDate] = useState<Array<{
    date: string;
    posts_count: number;
    comments_count: number;
    likes_count: number;
    views_count: number;
    reports_count: number;
  }>>([]);

  const [statsByTopic, setStatsByTopic] = useState<Array<{
    topic: string;
    posts_count: number;
    comments_count: number;
    likes_count: number;
    views_count: number;
  }>>([]);

  const [loading, setLoading] = useState(false);

  // Load thống kê tổng quan
  const loadGeneralStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await communityApi.getCommunityStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading community stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load thống kê theo thời gian
  const loadStatsByDate = useCallback(async (params: {
    from_date: string;
    to_date: string;
    group_by?: 'day' | 'week' | 'month';
  }) => {
    try {
      const data = await communityApi.getCommunityStatsByDate(params);
      setStatsByDate(data);
    } catch (error) {
      console.error('Error loading stats by date:', error);
    }
  }, []);

  // Load thống kê theo chủ đề
  const loadStatsByTopic = useCallback(async () => {
    try {
      const data = await communityApi.getCommunityStatsByTopic();
      setStatsByTopic(data);
    } catch (error) {
      console.error('Error loading stats by topic:', error);
    }
  }, []);

  // Load tất cả thống kê khi component mount
  useEffect(() => {
    loadGeneralStats();
    loadStatsByTopic();
    
    // Load stats 30 ngày qua
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    loadStatsByDate({
      from_date: thirtyDaysAgo.toISOString().split('T')[0],
      to_date: today.toISOString().split('T')[0],
      group_by: 'day'
    });
  }, [loadGeneralStats, loadStatsByDate, loadStatsByTopic]);

  return {
    stats,
    statsByDate,
    statsByTopic,
    loading,
    loadGeneralStats,
    loadStatsByDate,
    loadStatsByTopic,
    reload: loadGeneralStats
  };
};

// Hook chuyên dụng cho moderation logs
export const useModerationLogs = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Load moderation logs
  const loadLogs = useCallback(async (params: {
    page?: number;
    limit?: number;
    target_type?: 'post' | 'comment';
    target_id?: string;
    action?: 'gỡ' | 'khôi phục' | 'xóa vĩnh viễn';
    performed_by?: string;
    from_date?: string;
    to_date?: string;
  } = {}) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<ModerationLog> = await communityApi.fetchModerationLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setLogs(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        page: response.meta.page,
        limit: response.meta.limit
      }));
    } catch (error) {
      console.error('Error loading moderation logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Load logs khi component mount
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Pagination
  const goToPage = (page: number): void => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number): void => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    logs,
    loading,
    pagination,
    loadLogs,
    goToPage,
    changePageSize,
    reload: loadLogs
  };
};

export { useCommunityStats as default };