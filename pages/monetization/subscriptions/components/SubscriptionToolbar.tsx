import React from 'react';
import { PlusIcon } from '../../../../components/icons';

interface SubscriptionToolbarProps {
    onSearchChange: (value: string) => void;
    onStatusChange: (value: 'all' | 'active' | 'inactive') => void;
    onCreate: () => void;
}

const SubscriptionToolbar: React.FC<SubscriptionToolbarProps> = ({
    onSearchChange,
    onStatusChange,
    onCreate,
}) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm theo tên gói..."
                        className="w-full md:w-80 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <select
                        className="p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                        onChange={(e) => onStatusChange(e.target.value as any)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>

                <button
                    onClick={onCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Tạo gói mới</span>
                </button>
            </div>
        </div>
    );
};

export default SubscriptionToolbar;
