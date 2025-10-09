import React, { useState, useMemo, useEffect } from 'react';
import { Report, CommunityRule, PaginatedResponse } from '../../../types';
import ReportsToolbar from '../components/toolbars/ReportsToolbar';
import ReportCardList from '../components/cards/ReportCardList';
import { Pagination } from '../../../components/ui/pagination';
import { useCardPagination } from '../hooks/useDynamicPagination';
import * as api from '../api';

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
    const [currentPage, setCurrentPage] = useState(1);
    
    // Sử dụng reportsData từ props để tính toán
    const filteredAndSortedReports = useMemo(() => {
        if (!reportsData) return [];
        let processedReports = [...reportsData.data];

        // Filtering
        processedReports = processedReports.filter(report => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = report.reporter?.name?.toLowerCase().includes(lowerSearch) ||
                report.reason.toLowerCase().includes(lowerSearch) ||
                report.id.toLowerCase().includes(lowerSearch);
            
            const matchesStatus = filters.status === 'all' || report.status === filters.status;
            const matchesTargetType = filters.targetType === 'all' || report.target_type === filters.targetType;

            return matchesSearch && matchesStatus && matchesTargetType;
        });
        
        return processedReports;
    }, [reportsData, searchTerm, filters]);
    
    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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
