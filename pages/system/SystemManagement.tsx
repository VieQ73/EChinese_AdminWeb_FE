// pages/system/SystemManagement.tsx
import React, { useState, useMemo } from 'react';
import { useAppData } from '../../contexts/appData/context';
import LogToolbar from './components/LogToolbar';
import LogList from './components/LogList';

// Add DateRange type
interface DateRange {
    start: string | null;
    end: string | null;
}

const SystemManagement: React.FC = () => {
    // Lấy dữ liệu từ context
    const { adminLogs, users } = useAppData();
    
    // State cục bộ để quản lý các bộ lọc
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

    // Lấy danh sách các loại hành động đã xảy ra để hiển thị trong bộ lọc
    const actionTypes = useMemo(() => 
        [...new Set(adminLogs.map(log => log.action_type))].sort(),
    [adminLogs]);

    // Lọc danh sách log dựa trên state của các bộ lọc
    const filteredLogs = useMemo(() => {
        return adminLogs.filter(log => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = log.description.toLowerCase().includes(searchLower) 
                || (log.target_id && log.target_id.toLowerCase().includes(searchLower))
                || (log.adminName && log.adminName.toLowerCase().includes(searchLower));
            const matchesAdmin = filters.adminId === 'all' || log.user_id === filters.adminId;
            const matchesAction = filters.actionType === 'all' || log.action_type === filters.actionType;

            // Date filtering logic
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
    }, [adminLogs, filters, dates]);

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
            
            {/* Danh sách các thẻ log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                 <LogList logs={filteredLogs} />
            </div>
        </div>
    );
};

export default SystemManagement;
