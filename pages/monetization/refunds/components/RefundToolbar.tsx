import React from 'react';

interface RefundToolbarProps {
    filters: {
        search: string;
        status: 'all' | 'pending' | 'completed' | 'rejected';
    };
    onSearchChange: (value: string) => void;
    onStatusChange: (value: 'all' | 'pending' | 'completed' | 'rejected') => void;
}

const RefundToolbar: React.FC<RefundToolbarProps> = ({ filters, onSearchChange, onStatusChange }) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo tên người dùng..."
                    value={filters.search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white"
                />
                <select
                    value={filters.status}
                    onChange={(e) => onStatusChange(e.target.value as any)}
                    className="w-full md:w-auto p-2.5 border border-gray-300 rounded-lg bg-white"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="completed">Đã hoàn tất</option>
                    <option value="rejected">Đã từ chối</option>
                </select>
            </div>
        </div>
    );
};

export default RefundToolbar;