import React from 'react';
import { Save } from 'lucide-react';

interface FormFooterProps {
  isEditMode: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isEditMode,
  loading,
  onClose,
  onSave
}) => {
  return (
    <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Hủy
      </button>
      <button
        onClick={onSave}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {isEditMode ? 'Cập nhật' : 'Tạo đề thi'}
      </button>
    </div>
  );
};