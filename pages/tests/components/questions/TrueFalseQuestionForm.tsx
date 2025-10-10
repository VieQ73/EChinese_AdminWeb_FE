import React, { useState } from 'react';
import { MockTestDetailQuestion, TemplateQuestionPart } from '../../../../types/mocktest';
import { Upload, X, Volume2, Play, Pause } from 'lucide-react';

interface TrueFalseQuestionFormProps {
  question: MockTestDetailQuestion;
  templatePart: TemplateQuestionPart;
  onSave: (question: MockTestDetailQuestion) => void;
  onCancel: () => void;
}

export const TrueFalseQuestionForm: React.FC<TrueFalseQuestionFormProps> = ({
  question,
  templatePart,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text || '',
    audio_url: question.audio_url || '',
    correct_answer: question.correct_answer || 'true',
    explanation: question.explanation || ''
  });

  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (type: 'audio') => {
    console.log(`Upload ${type} file`);
    const mockUrl = `https://example.com/${type}/${Date.now()}.mp3`;
    setFormData(prev => ({ ...prev, audio_url: mockUrl }));
  };

  // Play audio
  const handlePlayAudio = (audioUrl: string) => {
    if (audioPlaying === audioUrl) {
      setAudioPlaying(null);
    } else {
      setAudioPlaying(audioUrl);
      setTimeout(() => setAudioPlaying(null), 3000);
    }
  };

  // Save question
  const handleSave = () => {
    const hasAudio = templatePart.allowed_fields.audio ? !!formData.audio_url : true;
    
    if (!hasAudio) {
      alert('Vui lòng upload file âm thanh');
      return;
    }

    const updatedQuestion: MockTestDetailQuestion = {
      ...question,
      question_text: formData.question_text,
      audio_url: formData.audio_url,
      options: [
        {
          id: 'true',
          label: 'A',
          text: 'Đúng',
          image_url: '',
          audio_url: '',
          is_correct: formData.correct_answer === 'true'
        },
        {
          id: 'false',
          label: 'B',
          text: 'Sai',
          image_url: '',
          audio_url: '',
          is_correct: formData.correct_answer === 'false'
        }
      ],
      correct_answer: formData.correct_answer === 'true' ? 'A' : 'B',
      explanation: formData.explanation,
      is_completed: true,
      updated_at: new Date().toISOString()
    };

    onSave(updatedQuestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

          {/* True/False Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Đáp án đúng *
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="correct_answer"
                  value="true"
                  checked={formData.correct_answer === 'true'}
                  onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-8">A.</span>
                  <span className="text-green-700 font-medium">Đúng</span>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="correct_answer"
                  value="false"
                  checked={formData.correct_answer === 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-8">B.</span>
                  <span className="text-red-700 font-medium">Sai</span>
                </div>
              </label>
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
                placeholder="Giải thích tại sao đáp án này đúng..."
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