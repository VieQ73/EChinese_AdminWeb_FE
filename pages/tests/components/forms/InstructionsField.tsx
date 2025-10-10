import React from 'react';
import { MockTestCreateRequest } from '../../api';

interface InstructionsFieldProps {
  formData: MockTestCreateRequest;
  onChange: (field: keyof MockTestCreateRequest, value: any) => void;
}

export const InstructionsField: React.FC<InstructionsFieldProps> = ({
  formData,
  onChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Hướng dẫn làm bài
      </label>
      <textarea
        value={formData.instructions || ''}
        onChange={(e) => onChange('instructions', e.target.value)}
        rows={4}
        placeholder="Nhập hướng dẫn làm bài cho học viên..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};