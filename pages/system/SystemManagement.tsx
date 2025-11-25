// pages/system/SystemManagement.tsx
import React, { useState } from 'react';
import { useAdminLogs, useLogMetadata, LogFilters, DateRange } from './hooks/useLogs';
import LogToolbar from './components/LogToolbar';
import LogList from './components/LogList';

const SystemManagement: React.FC = () => {
    // State cục bộ để quản lý các bộ lọc
    const [filters, setFilters] = useState<LogFilters>({
        search: '',
        adminId: 'all',
        actionType: 'all'
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });

    // Lấy metadata cho bộ lọc (danh sách admin và action types)
    const { data: metadata, isLoading: metadataLoading } = useLogMetadata();

    // Lấy logs với bộ lọc từ API
    const { data: logsData, isLoading: logsLoading, error } = useAdminLogs(filters, dates);

    // Hiển thị loading state
    if ((logsLoading || metadataLoading) && !logsData) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // Hiển thị error state
    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi khi tải dữ liệu: {error.message}
                </div>
            </div>
        );
    }

    // Tạo danh sách admin cho toolbar (từ metadata)
    const adminUsers = metadata?.adminUsers.map(admin => ({
        id: admin.id,
        name: admin.name,
        role: 'admin' as const
    })) || [];

    const actionTypes = metadata?.actionTypes || [];
    const logs = logsData?.logs || [];

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
                 <LogList logs={logs} />
            </div>
        </div>
    );
};

export default SystemManagement;
