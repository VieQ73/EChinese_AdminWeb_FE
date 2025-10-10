import React from 'react';
import { MockTestCreateRequest } from '../../api';

interface ScoringPolicySectionProps {
  formData: MockTestCreateRequest;
  onScoringPolicyChange: (field: string, value: any) => void;
}

export const ScoringPolicySection: React.FC<ScoringPolicySectionProps> = ({
  formData,
  onScoringPolicyChange
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Quy tắc chấm điểm</h3>
      
      <div className="space-y-4">
        {/* Requires Section Pass */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requires_section_pass"
            checked={formData.scoring_policy?.requires_section_pass || false}
            onChange={(e) => onScoringPolicyChange('requires_section_pass', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requires_section_pass" className="ml-2 text-sm text-gray-700">
            Yêu cầu đạt điểm tối thiểu từng phần
          </label>
        </div>

        {/* Section Min & Total Min */}
        {formData.scoring_policy?.requires_section_pass && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Điểm tối thiểu từng phần</label>
              <input
                type="number"
                value={formData.scoring_policy?.section_min || 60}
                onChange={(e) => onScoringPolicyChange('section_min', parseInt(e.target.value) || 60)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tổng điểm tối thiểu</label>
              <input
                type="number"
                value={formData.scoring_policy?.total_min || 180}
                onChange={(e) => onScoringPolicyChange('total_min', parseInt(e.target.value) || 180)}
                min="1"
                max={formData.total_max_score}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};