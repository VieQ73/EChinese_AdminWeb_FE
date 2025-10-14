import React from 'react';
import type { FormQuestion } from '../../hooks/useExamForm';

interface TrueFalseEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({ question, onQuestionChange }) => {
  
  const handleSelectCorrect = (optionId: string) => {
    const newOptions = question.options.map(opt => ({
      ...opt,
      is_correct: opt.id === optionId,
    }));
    onQuestionChange({ ...question, options: newOptions });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Chọn đáp án đúng:</p>
      <div className="flex gap-4">
        {question.options.map(option => (
          <label key={option.id} className="flex items-center gap-2 p-3 border rounded-lg bg-white cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
            <input
              type="radio"
              name={`correct-answer-${question.id}`}
              checked={option.is_correct}
              onChange={() => handleSelectCorrect(option.id)}
              className="w-4 h-4 text-blue-600"
            />
            <span>{option.content}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TrueFalseEditor;
