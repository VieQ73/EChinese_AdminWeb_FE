// pages/system/SystemManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppData } from '../../contexts/appData/context';
import { fetchAdminLogs, type GetAdminLogsParams } from './api';
import { Pagination } from '../../components/ui/pagination';
import LogToolbar from './components/LogToolbar';
import LogList from './components/LogList';
import type { AdminLog, PaginatedResponse } from '../../types';

// Add DateRange type
interface DateRange {
    start: string | null;
    end: string | null;
}

const SystemManagement: React.FC = () => {
    // Lấy danh sách users từ context (để hiển thị filter)
    const { users } = useAppData();
    
    // State cho logs data
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // State cho pagination và filter
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20); // 20 logs per page
    const [filters, setFilters] = useState({
        search: '',
        adminId: 'all',
        actionType: 'all'
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });

    // Lấy danh sách admin để hiển thị trong bộ lọc
    const adminUsers = useMemo(() => 
        users.filter(u => u.role === 'admin' || u.role === 'super admin'), 
    [users]);

    // Lấy danh sách các loại hành động (từ logs hiện tại)
    const actionTypes = useMemo(() => 
        [...new Set(logs.map(log => log.action_type))].sort(),
    [logs]);

    // Load logs data từ API
    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params: GetAdminLogsParams = {
                page: currentPage,
                limit: pageSize,
                search: filters.search || undefined,
                admin_id: filters.adminId !== 'all' ? filters.adminId : undefined,
                action_type: filters.actionType !== 'all' ? filters.actionType : undefined,
                start_date: dates.start || undefined,
                end_date: dates.end || undefined
            };

            const response: PaginatedResponse<AdminLog> = await fetchAdminLogs(params);
            setLogs(response.data || []);
            setTotalLogs(response.meta?.total || 0);
        } catch (err) {
            console.error('Lỗi khi tải logs:', err);
            setError('Không thể tải danh sách nhật ký hệ thống');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, dates]);

    // Load logs khi component mount hoặc filter thay đổi
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    // Reset về trang 1 khi filter hoặc pageSize thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.adminId, filters.actionType, dates.start, dates.end, pageSize]);

    // Tính toán pagination
    const totalPages = Math.ceil(totalLogs / pageSize);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
            
            {/* Thanh công cụ chứa các bộ lọc */}
            <LogToolbar
                filters={filters}
                onFiltersChange={setFilters}
                dates={dates}
                onDatesChange={setDates}
                admins={adminUsers}
                actionTypes={actionTypes}
            />
            
            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
            )}
            
            {/* Danh sách các thẻ log */}
            {!loading && !error && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <LogList logs={logs} />
                </div>
            )}

            {/* Pagination với Page Size Selector */}
            {logs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Hiển thị</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>logs / trang</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Tổng cộng: <span className="font-semibold text-gray-900">{totalLogs}</span> logs
                        </div>
                    </div>
                    
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SystemManagement;
