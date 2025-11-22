import React, { useMemo, useState, useEffect } from 'react';
import { Appeal, PaginatedResponse } from '../../../types';
import AppealsToolbar from '../components/toolbars/AppealsToolbar';
import { Pagination } from '../../../components/ui/pagination';
import AppealCardList from '../components/cards/AppealCardList';
import { useCardPagination } from '../hooks/useDynamicPagination';
import { DateRange } from '../components/shared/DateRangePicker';

interface AppealsTabProps {
    appealsData: PaginatedResponse<Appeal> | null;
    onOpenAppeal: (appeal: Appeal) => void;
    loading: boolean;
    refreshData?: (page: number, limit: number, filters?: { status?: string; search?: string }) => void;
}

const AppealsTab: React.FC<AppealsTabProps> = ({ appealsData, onOpenAppeal, loading, refreshData }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('appeal');
    const limit = 12; // Server-side pagination limit
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);

    // Xác định có dùng server-side pagination không
    const useServerPagination = !!refreshData;

    const enrichedAndFilteredAppeals = useMemo(() => {
        if (!appealsData) return [];
        let processedAppeals = appealsData.data.map(appeal => {
            const createdAt = new Date(appeal.created_at);
            const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            const timeLeft = expiresAt.getTime() - new Date().getTime();
            const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
            return { ...appeal, daysLeft };
        });

        // Date filtering ở client (vì API không hỗ trợ date range)
        processedAppeals = processedAppeals.filter(appeal => {
            if (dates.start) {
                const startDate = new Date(dates.start);
                startDate.setHours(0, 0, 0, 0);
                if (new Date(appeal.created_at) < startDate) return false;
            }
            if (dates.end) {
                const endDate = new Date(dates.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(appeal.created_at) > endDate) return false;
            }
            return true;
        });

        return processedAppeals;
    }, [appealsData, dates]);
    
    // Reset page khi filter thay đổi và gọi API với filters
    useEffect(() => {
        setCurrentPage(1);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                status: filters.status !== 'all' ? filters.status : undefined,
                search: searchTerm || undefined
            };
            refreshData(1, limit, apiFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters.status]);

    // Nếu dùng server-side pagination, không cần filter ở client
    const paginatedAppeals = useMemo(() => {
        if (useServerPagination) {
            return enrichedAndFilteredAppeals; // Hiển thị trực tiếp data từ server (đã filter theo date)
        }
        // Client-side: paginate
        const start = (currentPage - 1) * itemsPerPage;
        return enrichedAndFilteredAppeals.slice(start, start + itemsPerPage);
    }, [enrichedAndFilteredAppeals, currentPage, itemsPerPage, useServerPagination]);

    const pageCount = useServerPagination 
        ? (appealsData?.meta?.totalPages || 1)
        : Math.ceil(enrichedAndFilteredAppeals.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (useServerPagination && refreshData) {
            const apiFilters = {
                status: filters.status !== 'all' ? filters.status : undefined,
                search: searchTerm || undefined
            };
            refreshData(page, limit, apiFilters);
        }
    };

    return (
        <div className="space-y-4">
            <AppealsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={setFilters}
                dates={dates}
                onDatesChange={setDates}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4">
                <AppealCardList
                    appeals={paginatedAppeals}
                    loading={loading}
                    onViewDetails={onOpenAppeal}
                />
                {!loading && pageCount > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pageCount}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default AppealsTab;
