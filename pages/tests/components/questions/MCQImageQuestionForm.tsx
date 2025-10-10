import React, { useState } from 'react';
import { MockTestDetailQuestion, TemplateQuestionPart } from '../../../../types/mocktest';
import { Upload, X, Volume2, Play, Pause } from 'lucide-react';

interface MCQImageQuestionFormProps {
  question: MockTestDetailQuestion;
  templatePart: TemplateQuestionPart;
  onSave: (question: MockTestDetailQuestion) => void;
  onCancel: () => void;
}

export const MCQImageQuestionForm: React.FC<MCQImageQuestionFormProps> = ({
  question,
  templatePart,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text || '',
    audio_url: question.audio_url || '',
    images: question.images || [],
    options: question.options || Array.from({ length: templatePart.options_count }, (_, i) => ({
      id: `opt_${i}`,
      label: String.fromCharCode(65 + i), // A, B, C, D
      text: '',
      image_url: '',
      audio_url: '',
      is_correct: false
    })),
    explanation: question.explanation || '',
    explanation_audio: question.explanation_audio || ''
  });

  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Handle file upload (mock)
  const handleFileUpload = (type: 'audio' | 'image', optionIndex?: number) => {
    // Trong thực tế sẽ upload file lên server
    console.log(`Upload ${type} file`, { optionIndex });
    
    // Mock URL
    const mockUrl = `https://example.com/${type}/${Date.now()}.${type === 'audio' ? 'mp3' : 'jpg'}`;
    
    if (type === 'audio' && optionIndex === undefined) {
      setFormData(prev => ({ ...prev, audio_url: mockUrl }));
    } else if (type === 'image' && optionIndex !== undefined) {
      const newOptions = [...formData.options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], image_url: mockUrl };
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  // Toggle correct answer
  const handleCorrectAnswer = (optionIndex: number) => {
    const newOptions = formData.options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === optionIndex
    }));
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  // Play audio
  const handlePlayAudio = (audioUrl: string) => {
    if (audioPlaying === audioUrl) {
      setAudioPlaying(null);
      // Stop audio
    } else {
      setAudioPlaying(audioUrl);
      // Play audio
      setTimeout(() => setAudioPlaying(null), 3000); // Mock 3s audio
    }
  };

  // Save question
  const handleSave = () => {
    const hasCorrectAnswer = formData.options.some(opt => opt.is_correct);
    const hasAudio = templatePart.allowed_fields.audio ? !!formData.audio_url : true;
    const hasImages = templatePart.allowed_fields.images ? formData.options.every(opt => opt.image_url) : true;
    
    if (!hasCorrectAnswer) {
      alert('Vui lòng chọn đáp án đúng');
      return;
    }
    
    if (!hasAudio) {
      alert('Vui lòng upload file âm thanh');
      return;
    }
    
    if (!hasImages) {
      alert('Vui lòng upload đủ hình ảnh cho các lựa chọn');
      return;
    }

    const updatedQuestion: MockTestDetailQuestion = {
      ...question,
      question_text: formData.question_text,
      audio_url: formData.audio_url,
      images: formData.images,
      options: formData.options,
      correct_answer: formData.options.find(opt => opt.is_correct)?.label || '',
      explanation: formData.explanation,
      explanation_audio: formData.explanation_audio,
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
            <p className="text-sm text-gray-600 mt-1">{templatePart.notes}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio Upload */}
          {templatePart.allowed_fields.audio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File âm thanh *
              </label>
              {formData.audio_url ? (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Volume2 className="w-5 h-5 text-green-600 mr-2" />
                  <span className="flex-1 text-sm text-green-700">Đã upload âm thanh</span>
                  <button
                    onClick={() => handlePlayAudio(formData.audio_url)}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                  >
                    {audioPlaying === formData.audio_url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, audio_url: '' }))}
                    className="ml-2 p-1.5 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleFileUpload('audio')}
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50"
                >
                  <Upload className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Tải lên file âm thanh</span>
                </button>
              )}
            </div>
          )}

          {/* Question Text */}
          {templatePart.allowed_fields.text && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung câu hỏi (tuỳ chọn)
              </label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Nhập nội dung câu hỏi nếu cần..."
              />
            </div>
          )}

          {/* Options with Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Các lựa chọn hình ảnh *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.options.map((option, index) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Lựa chọn {option.label}</span>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={option.is_correct}
                        onChange={() => handleCorrectAnswer(index)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Đáp án đúng</span>
                    </label>
                  </div>

                  {option.image_url ? (
                    <div className="relative">
                      <img
                        src={option.image_url}
                        alt={`Option ${option.label}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const newOptions = [...formData.options];
                          newOptions[index] = { ...newOptions[index], image_url: '' };
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload('image', index)}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-sm text-gray-600">Tải hình ảnh</span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {templatePart.allowed_fields.explanation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải thích (tuỳ chọn)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Giải thích đáp án đúng..."
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};