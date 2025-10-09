import React from 'react';
import { PlusIcon, UploadIcon } from '../../../../constants';

interface VocabularyToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    levelFilter: string;
    onLevelFilterChange: (value: string) => void;
    onAdd: () => void;
    onImport: () => void;
}

const VocabularyToolbar: React.FC<VocabularyToolbarProps> = ({
    searchTerm,
    onSearchChange,
    levelFilter,
    onLevelFilterChange,
    onAdd,
    onImport,
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            {/* Ô tìm kiếm và lọc */}
            <div className="flex gap-2 w-full md:w-auto">
                <input
                    type="text"
                    placeholder="Tìm theo Hán tự, nghĩa..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-64 h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                />
                <select
                    value={levelFilter}
                    onChange={(e) => onLevelFilterChange(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                >
                    <option value="all">Tất cả cấp độ</option>
                    {['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'].map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                    ))}
                </select>
            </div>

            {/* Nút thêm & import */}
            <div className="flex gap-2 w-full md:w-auto">
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center h-10 px-4 whitespace-nowrap bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Thêm từ
                </button>
                <button
                    onClick={onImport}
                    className="flex items-center justify-center h-10 px-4 whitespace-nowrap bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
                >
                    <UploadIcon className="w-5 h-5 mr-2" /> Import
                </button>
            </div>
        </div>
    );
};

export default VocabularyToolbar;