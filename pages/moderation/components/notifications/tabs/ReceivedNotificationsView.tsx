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
    loading?: boolean;
    onPageChange?: (page: number, filters?: any) => void;
    currentPage?: number;
    totalPages?: number;
}

const ReceivedNotificationsView: React.FC<ReceivedNotificationsViewProps> = ({ 
    notifications, 
    onViewDetails, 
    onMarkAsRead, 
    loading = false,
    onPageChange,
    currentPage: externalCurrentPage,
    totalPages: externalTotalPages
}) => {
    // Dynamic pagination cho notification cards (chỉ dùng khi không có server-side pagination)
    const itemsPerPage = useCardPagination('notification');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: 'all', status: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [localCurrentPage, setLocalCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Sử dụng external page nếu có, nếu không dùng local page
    const currentPage = externalCurrentPage || localCurrentPage;
    const useServerPagination = !!onPageChange;

    const sortedNotifications = useMemo(() => 
        [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), 
    [notifications]);

    const filtered = useMemo(() => {
        console.log('🔍 Filter applied:', filters);
        console.log('📋 All notifications types:', sortedNotifications.map(n => ({ id: n.id, type: n.type, title: n.title })));
        
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
            const matchesSearch = n.title.toLowerCase().includes(lowerSearch);
            const matchesType = filters.type === 'all' || n.type === filters.type;
            const matchesStatus = filters.status === 'all' || status === filters.status;
            
            console.log(`Notification ${n.id}: type="${n.type}", filter="${filters.type}", matches=${matchesType}`);
            
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [sortedNotifications, searchTerm, filters, dates]);

    // Nếu có server-side pagination, hiển thị trực tiếp data từ server
    const paginated = useMemo(() => {
        if (useServerPagination) {
            // Server đã filter và paginate, chỉ cần filter theo date ở client (nếu có)
            return sortedNotifications.filter(n => {
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
                return true;
            });
        }
        // Client-side: filter và paginate
        return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [sortedNotifications, filtered, currentPage, itemsPerPage, useServerPagination, dates]);
    
    const pageCount = externalTotalPages || Math.ceil(filtered.length / itemsPerPage);
    
    // Reset page and selection on filter change
    useEffect(() => {
        if (onPageChange) {
            const apiFilters = {
                read_status: filters.status !== 'all' ? filters.status : undefined,
                type: filters.type !== 'all' ? filters.type : undefined
            };
            onPageChange(1, apiFilters);
        } else {
            setLocalCurrentPage(1);
        }
        setSelectedIds(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters.status, filters.type, dates]);
    
    const handlePageChangeInternal = (page: number) => {
        if (onPageChange) {
            const apiFilters = {
                read_status: filters.status !== 'all' ? filters.status : undefined,
                type: filters.type !== 'all' ? filters.type : undefined
            };
            onPageChange(page, apiFilters);
        } else {
            setLocalCurrentPage(page);
        }
    };

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
                    loading={loading}
                    onViewDetails={onViewDetails}
                    onMarkAsRead={onMarkAsRead}
                    showCheckboxes={true}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelect={handleSelect}
                />
                {!loading && pageCount > 1 && <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={handlePageChangeInternal} />}
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
