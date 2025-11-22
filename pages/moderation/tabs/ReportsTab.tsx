import React, { useState, useMemo, useEffect } from 'react';
import { Report, CommunityRule, PaginatedResponse } from '../../../types';
import ReportsToolbar from '../components/toolbars/ReportsToolbar';
import ReportCardList from '../components/cards/ReportCardList';
import { Pagination } from '../../../components/ui/pagination';
import { useCardPagination } from '../hooks/useDynamicPagination';
import * as api from '../api';
import DateRangePicker, { DateRange } from '../components/shared/DateRangePicker';

interface ReportsTabProps {
    reportsData: PaginatedResponse<Report> | null;
    onOpenReport: (report: Report) => void;
    loading: boolean;
    communityRules: CommunityRule[];
    refreshData?: (page: number, limit: number, filters?: { status?: string; target_type?: string; search?: string }) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reportsData, onOpenReport, loading, communityRules, refreshData }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('report');
    const limit = 12; // Server-side pagination limit
    
    // State cục bộ cho filter và pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        targetType: 'all',
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    
    // Xác định có dùng server-side pagination không
    const useServerPagination = !!refreshData;
    
    // Sử dụng reportsData từ props để tính toán
    const filteredAndSortedReports = useMemo(() => {
        if (!reportsData) return [];
        let processedReports = [...reportsData.data];

        // Filtering
        processedReports = processedReports.filter(report => {
            // Date filtering
            if (dates.start) {
                const startDate = new Date(dates.start);
                startDate.setHours(0, 0, 0, 0);
                if (new Date(report.created_at) < startDate) return false;
            }
            if (dates.end) {
                const endDate = new Date(dates.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(report.created_at) > endDate) return false;
            }

            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = report.reporter?.name?.toLowerCase().includes(lowerSearch) ||
                report.reason.toLowerCase().includes(lowerSearch) ||
                report.id.toLowerCase().includes(lowerSearch);
            
            const matchesStatus = filters.status === 'all' || report.status === filters.status;
            const matchesTargetType = filters.targetType === 'all' || report.target_type === filters.targetType;

            return matchesSearch && matchesStatus && matchesTargetType;
        });
        
        return processedReports;
    }, [reportsData, searchTerm, filters, dates]);
    
    // Reset page khi filter thay đổi và gọi API với filters
    useEffect(() => {
        setCurrentPage(1);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                status: filters.status !== 'all' ? filters.status : undefined,
                target_type: filters.targetType !== 'all' ? filters.targetType : undefined,
                search: searchTerm || undefined
            };
            refreshData(1, limit, apiFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters.status, filters.targetType, dates]);

    // Nếu dùng server-side pagination, không cần filter/sort ở client
    // Server đã xử lý tất cả
    const paginatedReports = useMemo(() => {
        if (useServerPagination) {
            return reportsData?.data || []; // Hiển thị trực tiếp data từ server
        }
        // Client-side: filter, sort và paginate
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedReports.slice(start, start + itemsPerPage);
    }, [reportsData, filteredAndSortedReports, currentPage, itemsPerPage, useServerPagination]);

    const pageCount = useServerPagination 
        ? (reportsData?.meta?.totalPages || 1)
        : Math.ceil(filteredAndSortedReports.length / itemsPerPage);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                status: filters.status !== 'all' ? filters.status : undefined,
                target_type: filters.targetType !== 'all' ? filters.targetType : undefined,
                search: searchTerm || undefined
            };
            refreshData(page, limit, apiFilters);
        }
    };
    
    return (
        <div className="space-y-4">
            <ReportsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={setFilters}
                dates={dates}
                onDatesChange={setDates}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReportCardList
                    reports={paginatedReports}
                    loading={loading}
                    onViewDetails={onOpenReport}
                />
                
                {!loading && pageCount > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pageCount}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsTab;
