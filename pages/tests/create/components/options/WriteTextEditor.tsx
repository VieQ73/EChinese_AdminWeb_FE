import React from 'react';
import type { FormQuestion } from '../../hooks/useExamForm';
import { FormField } from '../../../../../components/ui';
import { Input } from '../../../../../components/ui/Input';

interface WriteTextEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const WriteTextEditor: React.FC<WriteTextEditorProps> = ({ question, onQuestionChange }) => {
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange({ ...question, correct_answer: e.target.value });
  };

  return (
    <div className="space-y-3">
      <FormField 
        label="Đáp án đúng (nếu có)"
        helpText="Điền đáp án đúng cho các câu hỏi điền từ/điền vào chỗ trống để hệ thống có thể chấm tự động. Để trống nếu đây là câu hỏi tự luận."
      >
        <Input
          value={question.correct_answer || ''}
          onChange={handleAnswerChange}
          placeholder="Nhập một hoặc nhiều đáp án đúng, cách nhau bởi dấu phẩy (,)"
        />
      </FormField>
    </div>
  );
};

export default WriteTextEditor;
