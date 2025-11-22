import React, { useState, useMemo, useEffect } from 'react';
import { Violation, PaginatedResponse } from '../../../types';
import ViolationsToolbar from '../components/toolbars/ViolationsToolbar';
import ViolationCardList from '../components/cards/ViolationCardList';
import { Pagination } from '../../../components/ui/pagination';
import { useCardPagination } from '../hooks/useDynamicPagination';
import { DateRange } from '../components/shared/DateRangePicker';

interface ViolationsTabProps {
    violationsData: PaginatedResponse<Violation> | null;
    onOpenViolation: (violation: Violation) => void;
    loading: boolean;
    refreshData?: (page: number, limit: number, filters?: { severity?: string; targetType?: string; search?: string }) => void;
}

const ViolationsTab: React.FC<ViolationsTabProps> = ({ violationsData, onOpenViolation, loading, refreshData }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('violation');
    const limit = 12; // Server-side pagination limit
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        severity: 'all',
        targetType: 'all',
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    
    // Xác định có dùng server-side pagination không
    const useServerPagination = !!refreshData;
    
    // Filter theo date ở client (vì API không hỗ trợ date range)
    const filteredViolations = useMemo(() => {
        if (!violationsData) return [];
        let processedViolations = [...violationsData.data];

        // Date filtering ở client
        processedViolations = processedViolations.filter(v => {
            if (dates.start) {
                const startDate = new Date(dates.start);
                startDate.setHours(0, 0, 0, 0);
                if (new Date(v.created_at) < startDate) return false;
            }
            if (dates.end) {
                const endDate = new Date(dates.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(v.created_at) > endDate) return false;
            }
            return true;
        });
        
        return processedViolations;
    }, [violationsData, dates]);
    
    // Reset page khi filter thay đổi và gọi API với filters
    useEffect(() => {
        setCurrentPage(1);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                severity: filters.severity !== 'all' ? filters.severity : undefined,
                targetType: filters.targetType !== 'all' ? filters.targetType : undefined,
                search: searchTerm || undefined
            };
            refreshData(1, limit, apiFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters.severity, filters.targetType]);

    // Nếu dùng server-side pagination, không cần filter/sort ở client
    const paginatedViolations = useMemo(() => {
        if (useServerPagination) {
            return filteredViolations; // Hiển thị trực tiếp data từ server (đã filter theo date)
        }
        // Client-side: paginate
        const start = (currentPage - 1) * itemsPerPage;
        return filteredViolations.slice(start, start + itemsPerPage);
    }, [filteredViolations, currentPage, itemsPerPage, useServerPagination]);

    const pageCount = useServerPagination 
        ? (violationsData?.meta?.totalPages || 1)
        : Math.ceil(filteredViolations.length / itemsPerPage);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                severity: filters.severity !== 'all' ? filters.severity : undefined,
                targetType: filters.targetType !== 'all' ? filters.targetType : undefined,
                search: searchTerm || undefined
            };
            refreshData(page, limit, apiFilters);
        }
    };
    
    return (
        <div className="space-y-4">
            <ViolationsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={setFilters}
                dates={dates}
                onDatesChange={setDates}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ViolationCardList
                    violations={paginatedViolations}
                    loading={loading}
                    onViewDetails={onOpenViolation}
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

export default ViolationsTab;
