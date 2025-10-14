import React, { useMemo, useState, useEffect } from 'react';
import { Appeal, PaginatedResponse } from '../../../types';
import AppealsToolbar from '../components/toolbars/AppealsToolbar';
import { Pagination } from '../../../components/ui/pagination';
import AppealCardList from '../components/cards/AppealCardList';
import { useCardPagination } from '../hooks/useDynamicPagination';
import DateRangePicker, { DateRange } from '../components/shared/DateRangePicker';

interface AppealsTabProps {
    appealsData: PaginatedResponse<Appeal> | null;
    onOpenAppeal: (appeal: Appeal) => void;
    loading: boolean;
}

const AppealsTab: React.FC<AppealsTabProps> = ({ appealsData, onOpenAppeal, loading }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('appeal');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);

    const enrichedAndFilteredAppeals = useMemo(() => {
        if (!appealsData) return [];
        let processedAppeals = appealsData.data.map(appeal => {
            const createdAt = new Date(appeal.created_at);
            const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            const timeLeft = expiresAt.getTime() - new Date().getTime();
            const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
            return { ...appeal, daysLeft };
        });

        // Filtering
        processedAppeals = processedAppeals.filter(appeal => {
            // Date filtering
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

            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = appeal.user?.name?.toLowerCase().includes(lowerSearch) || appeal.user_id.toLowerCase().includes(lowerSearch);
            const matchesStatus = filters.status === 'all' || appeal.status === filters.status;
            return matchesSearch && matchesStatus;
        });

        return processedAppeals;
    }, [appealsData, searchTerm, filters, dates]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, dates]);

    const paginatedAppeals = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return enrichedAndFilteredAppeals.slice(start, start + itemsPerPage);
    }, [enrichedAndFilteredAppeals, currentPage, itemsPerPage]);

    const pageCount = Math.ceil(enrichedAndFilteredAppeals.length / itemsPerPage);

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
                {pageCount > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pageCount}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default AppealsTab;
