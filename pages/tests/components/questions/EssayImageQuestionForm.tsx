import React, { useState } from 'react';
import { MockTestDetailQuestion, TemplateQuestionPart } from '../../../../types/mocktest';
import { Upload, X, Save } from 'lucide-react';
import { ImagePreview, FormField } from '../../../../components/ui';

interface EssayImageQuestionFormProps {
  question: MockTestDetailQuestion;
  templatePart: TemplateQuestionPart;
  onSave: (question: MockTestDetailQuestion) => void;
  onCancel: () => void;
}

export const EssayImageQuestionForm: React.FC<EssayImageQuestionFormProps> = ({
  question,
  templatePart,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text || '',
    images: question.images || [],
    sample_answer: '', // Đáp án mẫu cho câu essay
    explanation: question.explanation || '',
    scoring_criteria: '' // Tiêu chí chấm điểm
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle image upload
  const handleImageUpload = () => {
    console.log('Upload image for essay question');
    const mockImageUrl = `https://example.com/essay_image/${Date.now()}.jpg`;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, mockImageUrl]
    }));
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle text changes
  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (templatePart.allowed_fields.text && !formData.question_text.trim()) {
      newErrors.question_text = 'Nội dung câu hỏi không được để trống';
    }

    if (templatePart.allowed_fields.images && formData.images.length === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất một hình ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save question
  const handleSave = () => {
    if (!validateForm()) return;

    const updatedQuestion: MockTestDetailQuestion = {
      ...question,
      question_text: formData.question_text,
      images: formData.images,
      correct_answer: formData.sample_answer, // Lưu đáp án mẫu
      explanation: formData.explanation,
      is_completed: true,
      updated_at: new Date().toISOString()
    };

    onSave(updatedQuestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Câu hỏi {question.order_no}: {templatePart.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {templatePart.notes || 'Viết câu mô tả hình ảnh hoặc tình huống'}
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Question Text */}
          {templatePart.allowed_fields.text && (
            <FormField
              label="Nội dung câu hỏi"
              required
              error={errors.question_text}
            >
              <textarea
                value={formData.question_text}
                onChange={(e) => handleTextChange('question_text', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.question_text ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Ví dụ: Hãy viết một câu mô tả hình ảnh dưới đây bằng tiếng Trung..."
              />
            </FormField>
          )}

          {/* Image Upload */}
          {templatePart.allowed_fields.images && (
            <FormField
              label="Hình ảnh"
              required
              error={errors.images}
            >
              {/* Upload Button */}
              <button
                onClick={handleImageUpload}
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors mb-4"
              >
                <Upload className="w-6 h-6 text-gray-400 mr-2" />
                <span className="text-gray-600">Tải lên hình ảnh</span>
              </button>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <ImagePreview
                      key={index}
                      imageUrl={imageUrl}
                      altText={`Hình ${index + 1}`}
                      onRemove={() => handleRemoveImage(index)}
                    />
                  ))}
                </div>
              )}
            </FormField>
          )}

          {/* Sample Answer */}
          <FormField
            label="Đáp án mẫu"
            helpText="Đáp án mẫu giúp giáo viên có tham khảo khi chấm bài"
          >
            <textarea
              value={formData.sample_answer}
              onChange={(e) => handleTextChange('sample_answer', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Nhập câu trả lời mẫu bằng tiếng Trung..."
            />
          </FormField>

          {/* Scoring Criteria */}
          <FormField
            label="Tiêu chí chấm điểm"
            helpText="Hướng dẫn cụ thể về cách phân phối điểm số"
          >
            <textarea
              value={formData.scoring_criteria}
              onChange={(e) => handleTextChange('scoring_criteria', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Ví dụ: Ngữ pháp đúng (2 điểm), Từ vựng phong phú (2 điểm), Nội dung phù hợp (1 điểm)"
            />
          </FormField>

          {/* Explanation */}
          {templatePart.allowed_fields.explanation && (
            <FormField
              label="Ghi chú hướng dẫn"
            >
              <textarea
                value={formData.explanation}
                onChange={(e) => handleTextChange('explanation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Ghi chú thêm cho giáo viên hoặc học sinh..."
              />
            </FormField>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};