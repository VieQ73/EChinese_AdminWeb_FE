import React, { useState, useMemo, useEffect } from 'react';
import { Violation } from '../../../types';
import ViolationsToolbar from '../components/toolbars/ViolationsToolbar';
import ViolationCardList from '../components/cards/ViolationCardList';
import { Pagination } from '../../../components/ui/pagination';
import { useCardPagination } from '../hooks/useDynamicPagination';

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
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredViolations = useMemo(() => {
        if (!violations) return [];
        return violations.filter(v => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = v.user?.name?.toLowerCase().includes(lowerSearch) || v.user_id.toLowerCase().includes(lowerSearch);
            const matchesSeverity = filters.severity === 'all' || v.severity === filters.severity;
            const matchesTargetType = filters.targetType === 'all' || v.target_type === filters.targetType;
            return matchesSearch && matchesSeverity && matchesTargetType;
        });
    }, [violations, searchTerm, filters]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const paginatedViolations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredViolations.slice(start, start + itemsPerPage);
    }, [filteredViolations, currentPage, itemsPerPage]);
    
    const pageCount = Math.ceil(filteredViolations.length / itemsPerPage);
    
    const getHandlerName = (violation: Violation) => {
        if (violation.detected_by === 'auto_ai') return 'Hệ thống AI';
        return violation.detected_by;
    };

    return (
        <div className="space-y-4">
            <ViolationsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={setFilters}
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