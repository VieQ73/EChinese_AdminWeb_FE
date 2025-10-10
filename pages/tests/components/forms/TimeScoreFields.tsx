import React from 'react';
import { MockTestCreateRequest } from '../../api';

interface TimeScoreFieldsProps {
  formData: MockTestCreateRequest;
  errors: Record<string, string>;
  onChange: (field: keyof MockTestCreateRequest, value: any) => void;
}

export const TimeScoreFields: React.FC<TimeScoreFieldsProps> = ({
  formData,
  errors,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thời gian (phút) *
        </label>
        <input
          type="number"
          value={formData.total_time_limit}
          onChange={(e) => onChange('total_time_limit', parseInt(e.target.value) || 0)}
          min="1"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.total_time_limit ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.total_time_limit && <p className="mt-1 text-sm text-red-600">{errors.total_time_limit}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tổng điểm *
        </label>
        <input
          type="number"
          value={formData.total_max_score}
          onChange={(e) => onChange('total_max_score', parseInt(e.target.value) || 0)}
          min="1"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.total_max_score ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.total_max_score && <p className="mt-1 text-sm text-red-600">{errors.total_max_score}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Điểm đạt
        </label>
        <input
          type="number"
          value={formData.passing_score || ''}
          onChange={(e) => onChange('passing_score', parseInt(e.target.value) || undefined)}
          min="1"
          max={formData.total_max_score}
          placeholder="Tùy chọn"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.passing_score ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.passing_score && <p className="mt-1 text-sm text-red-600">{errors.passing_score}</p>}
      </div>
    </div>
  );
};