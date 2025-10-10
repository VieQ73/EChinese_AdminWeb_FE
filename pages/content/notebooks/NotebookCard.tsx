import React from 'react';
import { Notebook } from '../../../types';
import Checkbox from '../../../ui/Checkbox';
import { PencilIcon } from '../../../constants';
import { BookOpen, Calendar, Crown } from 'lucide-react';

interface NotebookCardProps {
    notebook: Notebook;
    isSelected: boolean;
    onSelect?: (id: string) => void;
    onEdit: (notebook: Notebook) => void;
    onNavigate: (id: string) => void;
}

const NotebookCard: React.FC<NotebookCardProps> = ({ 
    notebook, 
    isSelected, 
    onSelect, 
    onEdit, 
    onNavigate 
}) => {
    return (
        <div 
            className={`relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden hover:shadow-lg group ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
            }`}
        >
            {/* Header với checkbox và actions */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                {onSelect && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                            checked={isSelected} 
                            onChange={() => onSelect(notebook.id)} 
                            id={`notebook-${notebook.id}`}
                        />
                    </div>
                )}
                
                {/* Premium badge */}
                {notebook.is_premium && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        <Crown className="w-3 h-3" />
                        Premium
                    </div>
                )}
                
                {/* Action buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(notebook);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content area - clickable */}
            <div 
                className="p-4 cursor-pointer"
                onClick={() => onNavigate(notebook.id)}
            >
                {/* Tên sổ tay */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors" 
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                    {notebook.name}
                </h3>
                
                {/* Thông tin chi tiết */}
                <div className="space-y-3">
                    {/* Số từ vựng */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{notebook.vocab_count}</span>
                        <span>từ vựng</span>
                    </div>
                    
                    {/* Ngày tạo */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(notebook.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            {/* Footer với status */}
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                    {/* Loại sổ tay */}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        notebook.is_premium 
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800' 
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        {notebook.is_premium ? 'Premium' : 'Miễn phí'}
                    </span>
                    
                    {/* Trạng thái */}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        notebook.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {notebook.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotebookCard;