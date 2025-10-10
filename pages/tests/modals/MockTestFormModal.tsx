import React, { useState, useEffect } from 'react';
import { MockTest, MockTestTemplate } from '../../../types/mocktest';
import { fetchTemplates, createMockTest, updateMockTest, MockTestCreateRequest } from '../api';
import { AlertCircle } from 'lucide-react';
import {
  FormHeader,
  FormFooter,
  BasicInfoFields,
  TemplateSelector,
  TimeScoreFields,
  InstructionsField,
  ScoringPolicySection
} from '../components/forms';

interface MockTestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (test: MockTest) => void;
  editingTest?: MockTest | null;
}

export const MockTestFormModal: React.FC<MockTestFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTest
}) => {
  const [formData, setFormData] = useState<MockTestCreateRequest>({
    type: 'HSK',
    level: '',
    title: '',
    total_time_limit: 60,
    total_max_score: 300,
    passing_score: 180,
    instructions: '',
    scoring_policy: {
      requires_section_pass: false,
      section_min: 60,
      total_min: 180
    },
    template_id: ''
  });

  const [templates, setTemplates] = useState<MockTestTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load templates khi component mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (editingTest) {
        // Populate form với data của test đang sửa
        setFormData({
          type: editingTest.type,
          level: editingTest.level,
          title: editingTest.title,
          total_time_limit: editingTest.total_time_limit,
          total_max_score: editingTest.total_max_score,
          passing_score: editingTest.passing_score,
          instructions: editingTest.instructions || '',
          scoring_policy: editingTest.scoring_policy || {
            requires_section_pass: false,
            section_min: 60,
            total_min: 180
          }
        });
      } else {
        // Reset form cho tạo mới
        setFormData({
          type: 'HSK',
          level: '',
          title: '',
          total_time_limit: 60,
          total_max_score: 300,
          passing_score: 180,
          instructions: '',
          scoring_policy: {
            requires_section_pass: false,
            section_min: 60,
            total_min: 180
          },
          template_id: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingTest]);

  const loadTemplates = async () => {
    try {
      const templatesData = await fetchTemplates({ is_active: true });
      setTemplates(templatesData as MockTestTemplate[]);
    } catch (error) {
      console.error('Lỗi khi tải templates:', error);
    }
  };

  // Handle form changes
  const handleChange = (field: keyof MockTestCreateRequest, value: any) => {
    const updates: any = { [field]: value };
    
    // Reset level khi thay đổi type
    if (field === 'type') {
      updates.level = '';
      updates.template_id = '';
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear error khi user sửa
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleScoringPolicyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      scoring_policy: {
        ...prev.scoring_policy,
        [field]: value
      }
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.level.trim()) {
      newErrors.level = 'Cấp độ không được để trống';
    }

    if (formData.total_time_limit <= 0) {
      newErrors.total_time_limit = 'Thời gian phải lớn hơn 0';
    }

    if (formData.total_max_score <= 0) {
      newErrors.total_max_score = 'Tổng điểm phải lớn hơn 0';
    }

    if (formData.passing_score && formData.passing_score > formData.total_max_score) {
      newErrors.passing_score = 'Điểm đạt không được lớn hơn tổng điểm';
    }

    if (!editingTest && !formData.template_id) {
      newErrors.template_id = 'Vui lòng chọn template để tạo đề thi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedTest: MockTest;
      
      if (editingTest) {
        // Update existing test
        savedTest = await updateMockTest(editingTest.id, formData);
      } else {
        // Create new test
        savedTest = await createMockTest(formData);
      }
      
      onSave(savedTest);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu đề thi:', error);
      setErrors({ general: 'Có lỗi xảy ra khi lưu đề thi' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <FormHeader 
          isEditMode={!!editingTest} 
          onClose={onClose} 
        />

        {/* Form */}
        <div className="p-6 space-y-6">
          {errors.general && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{errors.general}</span>
            </div>
          )}

          <BasicInfoFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
            isEditMode={!!editingTest}
          />

          <TemplateSelector
            formData={formData}
            templates={templates}
            errors={errors}
            onChange={handleChange}
            isEditMode={!!editingTest}
          />

          <TimeScoreFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          <InstructionsField
            formData={formData}
            onChange={handleChange}
          />

          <ScoringPolicySection
            formData={formData}
            onScoringPolicyChange={handleScoringPolicyChange}
          />
        </div>

        <FormFooter
          isEditMode={!!editingTest}
          loading={loading}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};