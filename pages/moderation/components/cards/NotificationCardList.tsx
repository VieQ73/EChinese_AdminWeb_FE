import React from 'react';
import { Notification } from '../../../../types';
import NotificationCard from './NotificationCard';

interface NotificationCardListProps {
    notifications: Notification[];
    loading: boolean;
    onViewDetails: (notification: Notification) => void;
    onMarkAsRead?: (ids: string[], asRead: boolean) => void;
    // Props cho bulk selection (chỉ dành cho sent notifications)
    showCheckboxes?: boolean;
    selectedIds?: Set<string>;
    onSelectAll?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelect?: (id: string) => void;
}

const NotificationCardList: React.FC<NotificationCardListProps> = ({
    notifications,
    loading,
    onViewDetails,
    onMarkAsRead,
    showCheckboxes = false,
    selectedIds = new Set(),
    onSelectAll,
    onSelect
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy thông báo nào.
            </div>
        );
    }

    // Tính toán trạng thái select all cho checkbox header
    const selectAllState = React.useMemo(() => {
        if (!showCheckboxes || notifications.length === 0) return { checked: false, indeterminate: false };
        
        const selectedCount = selectedIds.size;
        const totalCount = notifications.length;
        
        return {
            checked: selectedCount === totalCount,
            indeterminate: selectedCount > 0 && selectedCount < totalCount
        };
    }, [selectedIds, notifications.length, showCheckboxes]);

    return (
        <div>
            {/* Header với select all (chỉ cho sent notifications) */}
            {showCheckboxes && onSelectAll && (
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            ref={(input) => {
                                if (input) {
                                    input.checked = selectAllState.checked;
                                    input.indeterminate = selectAllState.indeterminate;
                                }
                            }}
                            onChange={onSelectAll}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span 
                            className="text-sm text-gray-600 cursor-pointer select-none hover:text-primary-600 transition-colors"
                            onClick={() => onSelectAll({ target: { checked: !selectAllState.checked } } as any)}
                        >
                            {selectAllState.indeterminate ? 'Chọn tất cả' : selectAllState.checked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-primary-600">
                        {selectedIds.size > 0 ? `${selectedIds.size} đã chọn` : `${notifications.length} thông báo`}
                    </span>
                </div>
            )}

            {/* Grid layout - thông báo nhỏ nên có thể nhiều cột hơn */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {notifications.map(notification => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onViewDetails={onViewDetails}
                        onMarkAsRead={onMarkAsRead}
                        showCheckbox={showCheckboxes}
                        selected={selectedIds.has(notification.id)}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationCardList;