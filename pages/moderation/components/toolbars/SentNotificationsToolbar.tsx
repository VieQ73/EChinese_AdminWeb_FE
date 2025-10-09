import React from 'react';
import { PlusIcon } from '../../../../constants';

interface SentNotificationsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { audience: string; type: string; status: string };
    onFilterChange: (filters: { audience: string; type: string; status: string }) => void;
    onCreate: () => void;
}

const NOTIFICATION_TYPES = ['system', 'community', 'reminder', 'feedback'];

const SentNotificationsToolbar: React.FC<SentNotificationsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange, onCreate }) => {
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
                    <select value={filters.status} onChange={(e) => onFilterChange({ ...filters, status: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg bg-white">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="draft">Nháp</option>
                        <option value="published">Đã phát hành</option>
                    </select>
                    <select value={filters.audience} onChange={(e) => onFilterChange({ ...filters, audience: e.target.value })} className="p-2.5 border border-gray-300 rounded-lg bg-white">
                        <option value="all_audience">Tất cả đối tượng</option>
                        <option value="all">Tất cả mọi người</option>
                        <option value="user">Chỉ người dùng thường</option>
                        <option value="admin">Chỉ Quản trị viên</option>
                    </select>
                    <button onClick={onCreate} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
                        <PlusIcon className="w-5 h-5 mr-2"/> Tạo thông báo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SentNotificationsToolbar;