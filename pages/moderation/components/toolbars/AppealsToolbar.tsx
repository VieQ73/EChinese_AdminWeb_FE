
import React from 'react';

interface AppealsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { status: string };
    onFilterChange: (filters: { status: string }) => void;
}

const AppealsToolbar: React.FC<AppealsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo tên người khiếu nại..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white"
                />
                <div className="flex items-center gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="accepted">Chấp nhận</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AppealsToolbar;
