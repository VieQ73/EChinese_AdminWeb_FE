import React from 'react';
import { PlusIcon } from '../../../../constants';

interface AchievementsToolbarProps {
    filters: { search: string; status: 'all' | 'active' | 'inactive' };
    onFiltersChange: (filters: { search: string; status: 'all' | 'active' | 'inactive' }) => void;
    onCreate: () => void;
}

const AchievementsToolbar: React.FC<AchievementsToolbarProps> = ({ filters, onFiltersChange, onCreate }) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm theo tên thành tích..."
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                        className="w-full md:w-80 p-2.5 border border-gray-300 rounded-lg bg-white"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
                <button onClick={onCreate} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Tạo thành tích</span>
                </button>
            </div>
        </div>
    );
};

export default AchievementsToolbar;
