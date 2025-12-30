import React from 'react';
import { Upload } from 'lucide-react';

interface PageHeaderProps {
  onBulkUpload: () => void;
}

/**
 * Header của trang quản lý tips
 */
const PageHeader: React.FC<PageHeaderProps> = ({ onBulkUpload }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Câu đố, Bài đọc và Mẹo</h1>
        <p className="text-gray-600 mt-1">
          Tạo và quản lý câu đố, bài đọc hiểu và mẹo học tiếng Trung cho học viên
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
      </div>
    </div>
  );
};

export default PageHeader;
