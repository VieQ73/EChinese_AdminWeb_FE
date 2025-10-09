
import React from 'react';
import { PlusIcon } from '../../../components/icons';

// FIX: Update prop types for filters to be more specific, ensuring type safety.
interface RulesToolbarProps {
    filters: {
        search: string;
        severity: 'all' | 'low' | 'medium' | 'high';
        status: 'all' | 'active' | 'inactive';
    };
    onFiltersChange: (filters: {
        search: string;
        severity: 'all' | 'low' | 'medium' | 'high';
        status: 'all' | 'active' | 'inactive';
    }) => void;
    onCreate: () => void;
}

const RulesToolbar: React.FC<RulesToolbarProps> = ({ filters, onFiltersChange, onCreate }) => {
    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        // FIX: Cast value to `any` to satisfy the stricter type from the parent component.
        // This is safe as the values come from a controlled select input.
        onFiltersChange({ ...filters, [field]: value as any });
    };

    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm theo tên quy tắc..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full md:w-80 p-2.5 border border-gray-300 rounded-lg bg-white"
                    />
                    <select
                        value={filters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Mọi mức độ</option>
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                     <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Mọi trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Đã tắt</option>
                    </select>
                </div>
                <button onClick={onCreate} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Tạo quy tắc</span>
                </button>
            </div>
        </div>
    );
};

export default RulesToolbar;
