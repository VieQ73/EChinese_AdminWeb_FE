
import React from 'react';

interface ReportsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { status: string; targetType: string };
    onFilterChange: (filters: { status: string; targetType: string }) => void;
}

const ReportsToolbar: React.FC<ReportsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo lý do, người báo cáo..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white"
                />
                <div className="flex items-center gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="dismissed">Đã bỏ qua</option>
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
                        <option value="bug">Lỗi</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ReportsToolbar;
