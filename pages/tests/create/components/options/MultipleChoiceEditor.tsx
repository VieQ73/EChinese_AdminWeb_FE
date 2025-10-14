import React from 'react';
import type { FormQuestion, FormOption } from '../../hooks/useExamForm';
import { Input } from '../../../../../components/ui/Input';
import FileInput from '../shared/FileInput';

interface MultipleChoiceEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({ question, onQuestionChange }) => {

  const handleOptionChange = (optionId: string, field: keyof FormOption, value: any) => {
    const newOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, [field]: value } : opt
    );
    onQuestionChange({ ...question, options: newOptions });
  };
  
  const handleSelectCorrect = (optionId: string) => {
    const newOptions = question.options.map(opt => ({
      ...opt,
      is_correct: opt.id === optionId,
    }));
    onQuestionChange({ ...question, options: newOptions });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">Các lựa chọn trả lời:</p>
      {question.options.map(option => (
        <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg bg-white">
          <input
            type="radio"
            name={`mc-correct-${question.id}`}
            checked={!!option.is_correct}
            onChange={() => handleSelectCorrect(option.id)}
            className="mt-2.5 h-4 w-4 text-blue-600"
          />
          <div className="flex-1 space-y-2">
            <Input
              label={`Nội dung lựa chọn ${option.label}`}
              value={option.content || ''}
              onChange={(e) => handleOptionChange(option.id, 'content', e.target.value)}
            />
          </div>
          <div className="w-40">
            {/*  Changed prop 'onFileSelect' to 'onFileChange' and added required props. Also implemented file handling logic. */}
            <FileInput
                id={`option-image-${option.id}`}
                label={`Ảnh ${option.label}`}
                value={option.image_url}
                onFileChange={(file) => handleOptionChange(option.id, 'image_url', file ? URL.createObjectURL(file) : undefined)}
                accept="image/*"
                variant="compact"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultipleChoiceEditor;
