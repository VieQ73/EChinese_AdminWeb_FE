import React from 'react';
import { CheckCircle, Settings } from 'lucide-react';
import { MockTestDetailQuestion } from '../../../../types/mocktest';

interface QuestionsListProps {
  questions: MockTestDetailQuestion[];
  onQuestionEdit: (questionIndex: number) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onQuestionEdit
}) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3">
        {questions.map((question, qIndex) => (
          <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mr-3">
                {qIndex + 1}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Câu hỏi {qIndex + 1}
                </div>
                <div className="text-xs text-gray-500">
                  {question.is_completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {question.is_completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              <button 
                onClick={() => onQuestionEdit(qIndex)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};