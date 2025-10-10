import React from 'react';
import { MockTestDetailQuestion, TemplateQuestionPart } from '../../../../types/mocktest';
import { MCQImageQuestionForm } from './MCQImageQuestionForm';
import { MCQTextQuestionForm } from './MCQTextQuestionForm';
import { TrueFalseQuestionForm } from './TrueFalseQuestionForm';
import { EssayImageQuestionForm } from './EssayImageQuestionForm';
// Import other question forms as needed

interface QuestionFormManagerProps {
  question: MockTestDetailQuestion;
  templatePart: TemplateQuestionPart;
  onSave: (question: MockTestDetailQuestion) => void;
  onCancel: () => void;
}

export const QuestionFormManager: React.FC<QuestionFormManagerProps> = ({
  question,
  templatePart,
  onSave,
  onCancel
}) => {
  // Render appropriate form based on question type
  switch (templatePart.question_type) {
    case 'mcq_image':
      return (
        <MCQImageQuestionForm
          question={question}
          templatePart={templatePart}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      
    case 'mcq_text':
      return (
        <MCQTextQuestionForm
          question={question}
          templatePart={templatePart}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      
    case 'true_false':
      return (
        <TrueFalseQuestionForm
          question={question}
          templatePart={templatePart}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      
    case 'match_image':
      // TODO: Implement MatchImageQuestionForm
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Form chưa hoàn thành</h3>
            <p className="text-gray-600 mb-4">
              Form cho loại câu hỏi "Ghép câu với hình" đang được phát triển.
            </p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      );
      
    case 'pair':
      // TODO: Implement PairQuestionForm
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Form chưa hoàn thành</h3>
            <p className="text-gray-600 mb-4">
              Form cho loại câu hỏi "Ghép cặp" đang được phát triển.
            </p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      );
      
    case 'fill_blank':
      // TODO: Implement FillBlankQuestionForm
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Form chưa hoàn thành</h3>
            <p className="text-gray-600 mb-4">
              Form cho loại câu hỏi "Điền vào chỗ trống" đang được phát triển.
            </p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      );
      
    case 'essay':
      return (
        <EssayImageQuestionForm
          question={question}
          templatePart={templatePart}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      
    default:
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Loại câu hỏi không hỗ trợ</h3>
            <p className="text-gray-600 mb-4">
              Loại câu hỏi "{templatePart.question_type}" chưa được hỗ trợ.
            </p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      );
  }
};