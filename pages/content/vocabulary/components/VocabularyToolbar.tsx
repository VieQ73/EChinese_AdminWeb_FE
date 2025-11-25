import React from 'react';
import { PlusIcon, UploadIcon } from '../../../../constants';
import Checkbox from '../../../../ui/Checkbox';

interface VocabularyToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    levelFilter: string;
    onLevelFilterChange: (value: string) => void;
    wordTypeFilter: string;
    onWordTypeFilterChange: (value: string) => void;
    onAdd: () => void;
    onImport: () => void;
    onAddByLevel?: () => void;
    // Select all props
    isSelectable?: boolean;
    isAllSelected?: boolean;
    onSelectAll?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VocabularyToolbar: React.FC<VocabularyToolbarProps> = ({
    searchTerm,
    onSearchChange,
    levelFilter,
    onLevelFilterChange,
    wordTypeFilter,
    onWordTypeFilterChange,
    onAdd,
    onImport,
    onAddByLevel,
    isSelectable = true,
    isAllSelected = false,
    onSelectAll,
}) => {
    const wordTypes = [
        'Danh từ', 'Đại từ', 'Động từ', 'Tính từ', 'Trạng từ', 
        'Giới từ', 'Liên từ', 'Trợ từ', 'Thán từ', 'Số từ', 
        'Lượng từ', 'Thành phần câu', 'Cụm từ'
    ];

    return (
        <div className="space-y-4 mb-4 text-sm">
            {/* Top row: Select all checkbox aligned with filters and buttons */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Left side: Select all and filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Select all checkbox */}
                    {isSelectable && onSelectAll && (
                        <div className="flex items-center">
                            <Checkbox
                                onChange={onSelectAll}
                                checked={isAllSelected}
                                id="select-all-vocabs"
                            />
                            <label htmlFor="select-all-vocabs" className="ml-2 text-sm font-medium text-gray-700">
                                Chọn tất cả
                            </label>
                        </div>
                    )}
                    
                    {/* Filters */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm theo Hán tự, nghĩa..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full sm:w-64 h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
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
                        <select
                            value={wordTypeFilter}
                            onChange={(e) => onWordTypeFilterChange(e.target.value)}
                            className="h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
                        >
                            <option value="all">Tất cả từ loại</option>
                            {wordTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex gap-2 w-full lg:w-auto">
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
                    {onAddByLevel && (
                        <button
                            onClick={onAddByLevel}
                            className="flex items-center justify-center h-10 px-4 whitespace-nowrap bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Thêm theo cấp độ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VocabularyToolbar;