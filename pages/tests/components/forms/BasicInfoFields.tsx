import React from 'react';
import { MockTestCreateRequest } from '../../api';
import { testTypeLabels } from '../../utils';
import { testLevelsByType } from '../../api';

interface BasicInfoFieldsProps {
  formData: MockTestCreateRequest;
  errors: Record<string, string>;
  onChange: (field: keyof MockTestCreateRequest, value: any) => void;
  isEditMode: boolean;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  errors,
  onChange,
  isEditMode
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại đề thi *
          </label>
          <select
            value={formData.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isEditMode} // Không cho sửa type khi edit
          >
            {Object.entries(testTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cấp độ *
          </label>
          <select
            value={formData.level}
            onChange={(e) => onChange('level', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.level ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Chọn cấp độ...</option>
            {testLevelsByType[formData.type]?.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề đề thi *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Nhập tiêu đề đề thi..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
    </div>
  );
};