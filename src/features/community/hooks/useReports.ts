import { useState, useEffect, useCallback } from 'react';
import type { Report } from '../../../types/entities';
import type { PaginatedResponse } from '../../../types/api';
import * as communityApi from '../communityApi';

// Hook chuyên dụng cho quản lý báo cáo vi phạm
export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Hàm load reports với filter
  const loadReports = useCallback(async (params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'resolved' | 'dismissed';
    target_type?: 'post' | 'comment' | 'user' | 'bug' | 'other';
    assigned_to?: string;
  } = {}) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Report> = await communityApi.fetchReports({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setReports(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        page: response.meta.page,
        limit: response.meta.limit
      }));
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Load reports khi component mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Xử lý báo cáo
  const resolveReport = async (reportId: string, action: 'resolved' | 'dismissed'): Promise<Report> => {
    const updatedReport = await communityApi.resolveReport(reportId, action);
    setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
    return updatedReport;
  };

  // Gán báo cáo cho admin
  const assignReport = async (reportId: string, adminId: string): Promise<Report> => {
    const updatedReport = await communityApi.assignReport(reportId, adminId);
    setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
    return updatedReport;
  };

  // Pagination
  const goToPage = (page: number): void => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number): void => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    reports,
    loading,
    pagination,
    loadReports,
    resolveReport,
    assignReport,
    goToPage,
    changePageSize,
    reload: loadReports
  };
};

export default useReports;