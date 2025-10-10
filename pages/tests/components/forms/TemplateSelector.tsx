import React from 'react';
import { MockTestCreateRequest } from '../../api';
import { MockTestTemplate } from '../../../../types/mocktest';

interface TemplateSelectorProps {
  formData: MockTestCreateRequest;
  templates: MockTestTemplate[];
  errors: Record<string, string>;
  onChange: (field: keyof MockTestCreateRequest, value: any) => void;
  isEditMode: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  formData,
  templates,
  errors,
  onChange,
  isEditMode
}) => {
  // Filter templates theo type và level
  const filteredTemplates = templates.filter(t => 
    t.type === formData.type && (
      !formData.level || t.level === formData.level
    )
  );

  // Chỉ hiển thị khi tạo mới (không phải edit)
  if (isEditMode) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Template *
      </label>
      <select
        value={formData.template_id || ''}
        onChange={(e) => onChange('template_id', e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors.template_id ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">Chọn template...</option>
        {filteredTemplates.map(template => (
          <option key={template.id} value={template.id}>
            {template.name} ({template.type} - {template.level})
          </option>
        ))}
      </select>
      {errors.template_id && <p className="mt-1 text-sm text-red-600">{errors.template_id}</p>}
      {formData.type && formData.level && filteredTemplates.length === 0 && (
        <p className="mt-1 text-sm text-amber-600">
          Chưa có template nào cho {formData.type} - {formData.level}
        </p>
      )}
    </div>
  );
};