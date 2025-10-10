import React from 'react';
import { Notebook } from '../../../types';
import Checkbox from '../../../ui/Checkbox';
import NotebookCard from './NotebookCard';

interface NotebookCardGridProps {
    notebooks: Notebook[];
    selectedNotebooks: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (notebook: Notebook) => void;
    onNavigate: (id: string) => void;
}

const NotebookCardGrid: React.FC<NotebookCardGridProps> = ({
    notebooks,
    selectedNotebooks,
    onSelect,
    onSelectAll,
    onEdit,
    onNavigate,
}) => {
    const isAllSelected = notebooks.length > 0 && selectedNotebooks.size === notebooks.length;

    return (
        <div>
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                    <Checkbox
                        onChange={onSelectAll}
                        checked={isAllSelected}
                        id="select-all-notebooks"
                    />
                    <label htmlFor="select-all-notebooks" className="ml-2 text-sm font-medium text-gray-700">
                        Chọn tất cả ({notebooks.length} sổ tay)
                    </label>
                </div>
            </div>

            {/* Cards Grid */}
            {notebooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {notebooks.map(notebook => (
                        <NotebookCard
                            key={notebook.id}
                            notebook={notebook}
                            isSelected={selectedNotebooks.has(notebook.id)}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Không tìm thấy sổ tay nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử điều chỉnh bộ lọc hoặc tạo sổ tay mới</p>
                </div>
            )}
        </div>
    );
};

export default NotebookCardGrid;