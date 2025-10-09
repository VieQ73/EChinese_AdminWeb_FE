import React from 'react';

interface ReceivedNotificationsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { type: string; status: string };
    onFilterChange: (filters: { type: string; status: string }) => void;
}

const NOTIFICATION_TYPES = ['system', 'report', 'violation', 'appeal', 'subscription', 'community', 'achievement', 'reminder', 'feedback'];

const ReceivedNotificationsToolbar: React.FC<ReceivedNotificationsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo tiêu đề..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white"
                />
                <div className="flex items-center gap-3 flex-wrap">
                    <select value={filters.type} onChange={(e) => onFilterChange({ ...filters, type: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg bg-white">
                        <option value="all">Tất cả loại</option>
                        {NOTIFICATION_TYPES.map(type => <option key={type} value={type} className="capitalize">{type}</option>)}
                    </select>
                    <select value={filters.status} onChange={(e) => onFilterChange({ ...filters, status: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg bg-white">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="read">Đã đọc</option>
                        <option value="unread">Chưa đọc</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ReceivedNotificationsToolbar;
