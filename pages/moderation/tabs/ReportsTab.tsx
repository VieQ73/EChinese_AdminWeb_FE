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
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reportsData, onOpenReport, loading, communityRules }) => {
    // Dynamic pagination dựa trên responsive grid layout
    const itemsPerPage = useCardPagination('report');
    
    // State cục bộ cho filter và pagination, không còn phụ thuộc vào data từ context
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        targetType: 'all',
    });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    
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
    
    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, dates]);

    const paginatedReports = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedReports.slice(start, start + itemsPerPage);
    }, [filteredAndSortedReports, currentPage, itemsPerPage]);

    const pageCount = Math.ceil(filteredAndSortedReports.length / itemsPerPage);
    
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

export default ReportsTab;
