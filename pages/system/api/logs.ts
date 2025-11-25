// API functions cho System Admin Logs
import { apiClient } from '../../../services/apiClient';
import { AdminLog, User } from '../../../types';
import { mockAdminLogs } from '../../../mock/system';
import { mockUsers } from '../../../mock/users';

// Flag để chuyển đổi giữa mock và API thật
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Types cho filter params
export interface LogFilters {
    search: string;
    adminId: string;
    actionType: string;
}

export interface DateRange {
    start: string | null;
    end: string | null;
}

export interface FetchLogsParams {
    filters: LogFilters;
    dates: DateRange;
    page?: number;
    limit?: number;
}

export interface LogsResponse {
    logs: AdminLog[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AdminUserSummary {
    id: string;
    name: string;
}

export interface LogMetadata {
    adminUsers: AdminUserSummary[];
    actionTypes: string[];
}

/**
 * Lấy danh sách admin logs với bộ lọc
 */
export async function fetchAdminLogs(params: FetchLogsParams): Promise<LogsResponse> {
    if (USE_MOCK_API) {
        const { filters, dates, page = 1, limit = 50 } = params;
        
        // Lọc logs theo điều kiện
        const filteredLogs = mockAdminLogs.filter(log => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = !filters.search || 
                log.description.toLowerCase().includes(searchLower) ||
                (log.target_id && log.target_id.toLowerCase().includes(searchLower)) ||
                (log.adminName && log.adminName.toLowerCase().includes(searchLower));
            
            const matchesAdmin = filters.adminId === 'all' || log.user_id === filters.adminId;
            const matchesAction = filters.actionType === 'all' || log.action_type === filters.actionType;

            // Lọc theo ngày
            const matchesDate = (() => {
                if (!dates.start && !dates.end) return true;
                const logDate = new Date(log.created_at);
                if (dates.start) {
                    const startDate = new Date(dates.start);
                    startDate.setHours(0, 0, 0, 0);
                    if (logDate < startDate) return false;
                }
                if (dates.end) {
                    const endDate = new Date(dates.end);
                    endDate.setHours(23, 59, 59, 999);
                    if (logDate > endDate) return false;
                }
                return true;
            })();
            
            return matchesSearch && matchesAdmin && matchesAction && matchesDate;
        });

        // Phân trang
        const total = filteredLogs.length;
        const totalPages = Math.ceil(total / limit);
        const startIdx = (page - 1) * limit;
        const paginatedLogs = filteredLogs.slice(startIdx, startIdx + limit);

        return {
            logs: paginatedLogs,
            total,
            page,
            totalPages
        };
    }
    
    // API thật với query params
    const queryParams = new URLSearchParams({
        search: params.filters.search,
        adminId: params.filters.adminId,
        actionType: params.filters.actionType,
        page: String(params.page || 1),
        limit: String(params.limit || 50)
    });
    
    if (params.dates.start) queryParams.set('startDate', params.dates.start);
    if (params.dates.end) queryParams.set('endDate', params.dates.end);
    
    return apiClient.get<LogsResponse>(`/admin/logs?${queryParams}`);
}

/**
 * Lấy metadata cho bộ lọc (danh sách admin và action types)
 */
export async function fetchLogMetadata(): Promise<LogMetadata> {
    if (USE_MOCK_API) {
        // Lấy danh sách admin users
        const adminUsers = mockUsers
            .filter(u => u.role === 'admin' || u.role === 'super admin')
            .map(u => ({ id: u.id, name: u.name }));
        
        // Lấy danh sách action types từ logs
        const actionTypes = [...new Set(mockAdminLogs.map(log => log.action_type))].sort();
        
        return { adminUsers, actionTypes };
    }
    
    return apiClient.get<LogMetadata>('/admin/logs/metadata');
}

/**
 * Lấy chi tiết một log entry
 */
export async function fetchLogDetail(logId: string): Promise<AdminLog | null> {
    if (USE_MOCK_API) {
        return mockAdminLogs.find(log => log.id === logId) || null;
    }
    
    return apiClient.get<AdminLog>(`/admin/logs/${logId}`);
}
