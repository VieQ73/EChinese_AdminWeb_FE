
import React from 'react';

interface ViolationsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { severity: string; targetType: string };
    onFilterChange: (filters: { severity: string; targetType: string }) => void;
}

const ViolationsToolbar: React.FC<ViolationsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo tên người vi phạm..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white"
                />
                <div className="flex items-center gap-3">
                    <select
                        value={filters.severity}
                        onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả mức độ</option>
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                     <select
                        value={filters.targetType}
                        onChange={(e) => onFilterChange({ ...filters, targetType: e.target.value })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả đối tượng</option>
                        <option value="post">Bài viết</option>
                        <option value="comment">Bình luận</option>
                        <option value="user">Người dùng</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ViolationsToolbar;
