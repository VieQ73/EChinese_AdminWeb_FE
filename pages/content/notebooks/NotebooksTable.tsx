import React from 'react';
import { Notebook } from '../../../types';
import { PencilIcon } from '../../../constants';
import Checkbox from '../../../ui/Checkbox';

interface NotebooksTableProps {
    notebooks: Notebook[];
    selectedNotebooks: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit: (notebook: Notebook) => void;
    onNavigate: (id: string) => void;
}

const NotebooksTable: React.FC<NotebooksTableProps> = ({
    notebooks,
    selectedNotebooks,
    onSelect,
    onSelectAll,
    onEdit,
    onNavigate,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="p-4">
                            <Checkbox 
                                onChange={onSelectAll}
                                checked={notebooks.length > 0 && selectedNotebooks.size === notebooks.length}
                            />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sổ tay</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số từ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {notebooks.map(nb => (
                        <tr key={nb.id} className={`transition-colors ${selectedNotebooks.has(nb.id) ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                            <td className="p-4 text-left">
                                <Checkbox
                                    checked={selectedNotebooks.has(nb.id)} 
                                    onChange={() => onSelect(nb.id)} 
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                <button onClick={() => onNavigate(nb.id)} className="text-sm font-medium text-primary-600 hover:underline text-left">
                                    {nb.name}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{nb.vocab_count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{nb.is_premium ? 'Premium' : 'Miễn phí'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${nb.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {nb.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{new Date(nb.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(nb)} className="text-primary-600 hover:text-primary-900">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {notebooks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500">Không tìm thấy sổ tay nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NotebooksTable;