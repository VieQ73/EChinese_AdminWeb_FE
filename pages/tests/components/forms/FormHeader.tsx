import React from 'react';
import { X } from 'lucide-react';

interface FormHeaderProps {
  isEditMode: boolean;
  onClose: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  isEditMode,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">
        {isEditMode ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};