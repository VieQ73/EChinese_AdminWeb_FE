import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Notification } from '../../../../../types';
import { Pagination } from '../../../../../components/ui/pagination';
import SentNotificationsToolbar from '../../toolbars/SentNotificationsToolbar';
import FloatingBulkActionsBar from '../../../../../components/FloatingBulkActionsBar';
import { TrashIcon, SendIcon } from '../../../../../constants';
import NotificationCardList from '../../cards/NotificationCardList';
import { useCardPagination } from '../../../hooks/useDynamicPagination';

interface SentNotificationsViewProps {
    notifications: Notification[];
    onViewDetails: (notification: Notification) => void;
    onCreate: () => void;
    onPublish: (ids: string[]) => void;
    onDelete: (ids: string[]) => void;
}

const SentNotificationsView: React.FC<SentNotificationsViewProps> = ({ notifications, onViewDetails, onCreate, onPublish, onDelete }) => {
    // Dynamic pagination cho notification cards
    const itemsPerPage = useCardPagination('notification');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ audience: 'all_audience', type: 'all', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const sortedNotifications = useMemo(() => 
        [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), 
    [notifications]);

    const filtered = useMemo(() => {
        return sortedNotifications.filter(n => {
            const lowerSearch = searchTerm.toLowerCase();
            const status = n.is_push_sent ? 'published' : 'draft';
            return n.title.toLowerCase().includes(lowerSearch) &&
                   (filters.audience === 'all_audience' || n.audience === filters.audience) &&
                   (filters.status === 'all' || status === filters.status);
        });
    }, [sortedNotifications, searchTerm, filters]);

    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage, itemsPerPage]);
    const pageCount = Math.ceil(filtered.length / itemsPerPage);

    // Reset page and selection on filter change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [searchTerm, filters]);

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

    const selectedItems = useMemo(() => 
        Array.from(selectedIds).map(id => notifications.find(n => n.id === id)).filter(Boolean) as Notification[], 
    [selectedIds, notifications]);

    const canDelete = selectedItems.length > 0 && selectedItems.every(n => !n.is_push_sent);
    const canPublish = selectedItems.length > 0 && selectedItems.some(n => !n.is_push_sent);

    return (
        <>
            <SentNotificationsToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} filters={filters} onFilterChange={setFilters} onCreate={onCreate} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <NotificationCardList
                    notifications={paginated}
                    loading={false}
                    onViewDetails={onViewDetails}
                    showCheckboxes={true}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelect={handleSelect}
                />
                {pageCount > 1 && <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />}
            </div>
            <FloatingBulkActionsBar isVisible={selectedIds.size > 0} selectedCount={selectedIds.size} onClearSelection={() => setSelectedIds(new Set())}>
                {canPublish && <button onClick={() => onPublish(Array.from(selectedIds))} className="flex items-center text-xs font-medium text-green-600 hover:text-black"><SendIcon className="w-4 h-4 mr-1.5"/> Phát hành</button>}
                {canDelete && <button onClick={() => onDelete(Array.from(selectedIds))} className="flex items-center text-xs font-medium text-red-600 hover:text-black"><TrashIcon className="w-4 h-4 mr-1.5"/> Xóa</button>}
                {!canDelete && selectedIds.size > 0 && <span className="text-xs text-gray-400 italic">Chỉ có thể xóa thông báo nháp.</span>}
            </FloatingBulkActionsBar>
        </>
    );
};

export default SentNotificationsView;