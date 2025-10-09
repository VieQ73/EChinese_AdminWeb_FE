
import React from 'react';
import { PlusIcon } from '../../constants';

const MediaManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Thư viện Media</h1>
                <label className="cursor-pointer flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tải lên Media
                    <input type="file" className="hidden" />
                </label>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-700">Tại đây, quản trị viên có thể tải lên và quản lý tất cả các tệp media (âm thanh cho bài thi thử, hình ảnh cho từ vựng, v.v.) được sử dụng trên toàn nền tảng. Thư viện sẽ hiển thị chi tiết tệp và nơi mỗi tệp được sử dụng.</p>
            </div>
        </div>
    );
};

export default MediaManagement;
