import React, { useState, useMemo, useEffect } from 'react';
import { Violation } from '../../../types';
import ViolationsToolbar from '../components/toolbars/ViolationsToolbar';
import ViolationCardList from '../components/cards/ViolationCardList';
import { Pagination } from '../../../components/ui/pagination';
import { useCardPagination } from '../hooks/useDynamicPagination';
import DateRangePicker, { DateRange } from '../components/shared/DateRangePicker';

interface ViolationsTabProps {
    violations: Violation[];
    onOpenViolation: (violation: Violation) => void;
    loading: boolean;
}

const ViolationsTab: React.FC<ViolationsTabProps> = ({ violations, onOpenViolation, loading }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('violation');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        severity: 'all',
        targetType: 'all',
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredViolations = useMemo(() => {
        if (!violations) return [];
        return violations.filter(v => {
            // Date filtering
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

            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = v.user?.name?.toLowerCase().includes(lowerSearch) || v.user_id.toLowerCase().includes(lowerSearch);
            const matchesSeverity = filters.severity === 'all' || v.severity === filters.severity;
            const matchesTargetType = filters.targetType === 'all' || v.target_type === filters.targetType;
            return matchesSearch && matchesSeverity && matchesTargetType;
        });
    }, [violations, searchTerm, filters, dates]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, dates]);

    const paginatedViolations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredViolations.slice(start, start + itemsPerPage);
    }, [filteredViolations, currentPage, itemsPerPage]);
    
    const pageCount = Math.ceil(filteredViolations.length / itemsPerPage);
    
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
                
                {pageCount > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pageCount}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViolationsTab;
