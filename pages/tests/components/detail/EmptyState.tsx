import React from 'react';
import { FileText } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn phần để bắt đầu</h3>
      <p className="text-gray-600">Chọn một phần từ danh sách bên trái để xem chi tiết</p>
    </div>
  );
};