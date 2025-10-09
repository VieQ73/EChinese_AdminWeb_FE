import React from 'react';
import { PlusIcon } from '../../../constants';

interface NotebooksToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { status: string; premium: string };
    onFilterChange: (filters: { status: string; premium: string }) => void;
    onCreate: () => void;
}

const NotebooksToolbar: React.FC<NotebooksToolbarProps> = ({
    searchTerm,
    onSearchChange,
    filters,
    onFilterChange,
    onCreate,
}) => {
    return (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* Ô tìm kiếm */}
                <input
                    type="text"
                    placeholder="Tìm kiếm sổ tay..."
                    value={searchTerm}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-xl bg-white 
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    onChange={(e) => onSearchChange(e.target.value)}
                />

                {/* Bộ lọc và nút tạo */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        className="p-3 border border-gray-300 rounded-xl bg-white 
                                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                    >
                        <option value="all">Mọi trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Bản nháp</option>
                    </select>

                    <select
                        className="p-3 border border-gray-300 rounded-xl bg-white 
                                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        value={filters.premium}
                        onChange={(e) => onFilterChange({ ...filters, premium: e.target.value })}
                    >
                        <option value="all">Mọi loại</option>
                        <option value="false">Miễn phí</option>
                        <option value="true">Premium</option>
                    </select>

                    {/* Nút tạo sổ tay */}
                    <button
                        onClick={onCreate}
                        className="flex items-center justify-center gap-2 px-5 py-3 
                                   bg-primary-600 text-white rounded-xl hover:bg-primary-700 
                                   font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Tạo Sổ tay</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotebooksToolbar;
