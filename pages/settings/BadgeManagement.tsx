
import React from 'react';
import { PlusIcon } from '../../constants';

const BadgeManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Huy hiệu</h1>
                 <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Thêm cấp độ huy hiệu
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-700">Trang này sẽ hiển thị các cấp độ huy hiệu cùng với tên và biểu tượng của chúng. Quản trị viên có thể chỉnh sửa chi tiết cho từng cấp độ huy hiệu.</p>
            </div>
        </div>
    );
};

export default BadgeManagement;
