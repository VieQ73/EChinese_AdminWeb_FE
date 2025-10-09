import React from 'react';
import { Plus, Upload } from 'lucide-react';

interface PageHeaderProps {
  onCreateTip: () => void;
  onBulkUpload: () => void;
}

/**
 * Header của trang quản lý tips
 */
const PageHeader: React.FC<PageHeaderProps> = ({ onCreateTip, onBulkUpload }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Mẹo & Hướng dẫn</h1>
        <p className="text-gray-600 mt-1">
          Tạo và quản lý các mẹo học tiếng Trung cho học viên
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onBulkUpload}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Upload size={16} />
          Tải lên hàng loạt
        </button>
        
        <button
          onClick={onCreateTip}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Tạo mẹo mới
        </button>
      </div>
    </div>
  );
};

export default PageHeader;