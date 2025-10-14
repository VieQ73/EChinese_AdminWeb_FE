import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Notification } from '../../../../../types';
import { Pagination } from '../../../../../components/ui/pagination';
import ReceivedNotificationsToolbar from '../../toolbars/ReceivedNotificationsToolbar';
import FloatingBulkActionsBar from '../../../../../components/FloatingBulkActionsBar';
import { CheckCircleIcon, XCircleIcon } from '../../../../../constants';
import NotificationCardList from '../../cards/NotificationCardList';
import { useCardPagination } from '../../../hooks/useDynamicPagination';
import { DateRange } from '../../shared/DateRangePicker';

interface ReceivedNotificationsViewProps {
    notifications: Notification[];
    onViewDetails: (notification: Notification) => void;
    onMarkAsRead: (ids: string[], asRead: boolean) => void;
}

const ReceivedNotificationsView: React.FC<ReceivedNotificationsViewProps> = ({ notifications, onViewDetails, onMarkAsRead }) => {
    // Dynamic pagination cho notification cards
    const itemsPerPage = useCardPagination('notification');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: 'all', status: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const sortedNotifications = useMemo(() => 
        [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), 
    [notifications]);

    const filtered = useMemo(() => {
        return sortedNotifications.filter(n => {
            // Date filtering
            if (dates.start) {
                const startDate = new Date(dates.start);
                startDate.setHours(0, 0, 0, 0);
                if (new Date(n.created_at) < startDate) return false;
            }
            if (dates.end) {
                const endDate = new Date(dates.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(n.created_at) > endDate) return false;
            }

            const lowerSearch = searchTerm.toLowerCase();
            const status = n.read_at ? 'read' : 'unread';
            return n.title.toLowerCase().includes(lowerSearch) &&
                   (filters.type === 'all' || n.type === filters.type) &&
                   (filters.status === 'all' || status === filters.status);
        });
    }, [sortedNotifications, searchTerm, filters, dates]);

    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage, itemsPerPage]);
    const pageCount = Math.ceil(filtered.length / itemsPerPage);
    
    // Reset page and selection on filter change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [searchTerm, filters, dates]);

    const handleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) newSelection.delete(id);
            else newSelection.add(id);
            return newSelection;
        });
    }, []);

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(new Set(paginated.map(n => n.id)));
        else setSelectedIds(new Set());
    }, [paginated]);

    const handleBulkMarkRead = (asRead: boolean) => {
        onMarkAsRead(Array.from(selectedIds), asRead);
        setSelectedIds(new Set());
    };

    return (
        <div className="space-y-4">
            <ReceivedNotificationsToolbar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                filters={filters} 
                onFilterChange={setFilters}
                dates={dates}
                onDatesChange={setDates}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4">
                <NotificationCardList
                    notifications={paginated}
                    loading={false}
                    onViewDetails={onViewDetails}
                    onMarkAsRead={onMarkAsRead}
                    showCheckboxes={true}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelect={handleSelect}
                />
                {pageCount > 1 && <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />}
            </div>
              <FloatingBulkActionsBar
                  isVisible={selectedIds.size > 0}
                  selectedCount={selectedIds.size}
                  onClearSelection={() => setSelectedIds(new Set())}
              >
                  <button
                      onClick={() => handleBulkMarkRead(true)}
                      className="flex items-center text-xs font-semibold text-green-600 hover:bg-green-50 active:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                      <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-600" />
                      Đánh dấu đã đọc
                  </button>
                  <button
                      onClick={() => handleBulkMarkRead(false)}
                      className="flex items-center text-xs font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                      <XCircleIcon className="w-4 h-4 mr-1.5 text-red-600" />
                      Đánh dấu chưa đọc
                  </button>
              </FloatingBulkActionsBar>
        </div>
    );
};

export default ReceivedNotificationsView;
