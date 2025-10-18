import React from 'react';
import type { FormQuestion, CorrectAnswer } from '../../hooks/useExamForm';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from '../../../../../components/ui';
import { TextArea } from '../../../../../components/ui/TextArea';
import { Button } from '../../../../../components/ui/Button';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface RecordAudioEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const RecordAudioEditor: React.FC<RecordAudioEditorProps> = ({ question, onQuestionChange }) => {
  
  const handleAddAnswer = () => {
    const newCorrectAnswer: CorrectAnswer = {
      id: uuidv4(),
      question_id: question.id,
      answer: '',
    };
    const updatedAnswers = [...(question.correct_answers || []), newCorrectAnswer];
    onQuestionChange({ ...question, correct_answers: updatedAnswers, correct_answer: undefined });
  };

  const handleRemoveAnswer = (answerId: string) => {
    const updatedAnswers = (question.correct_answers || []).filter(a => a.id !== answerId);
    onQuestionChange({ ...question, correct_answers: updatedAnswers });
  };

  const handleAnswerChange = (answerId: string, newText: string) => {
    const updatedAnswers = (question.correct_answers || []).map(a =>
      a.id === answerId ? { ...a, answer: newText } : a
    );
    onQuestionChange({ ...question, correct_answers: updatedAnswers });
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Đáp án đúng (phiên âm - transcript) (nếu có)"
        helpText="Hệ thống sẽ dùng đáp án này để tham khảo hoặc chấm điểm (nếu áp dụng AI). Để trống nếu đây là câu hỏi nói tự do không có đáp án."
      >
        <div className="space-y-3">
          {(question.correct_answers || []).map((answer) => (
            <div
              key={answer.id}
              className="relative group"
            >
              <TextArea
                value={answer.answer}
                onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                placeholder="Nhập nội dung phiên âm đúng..."
                rows={3}
                className="w-full pr-12"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemoveAnswer(answer.id)}
                className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity !p-2"
                title="Xóa đáp án"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddAnswer}
            >
                <PlusIcon className="w-4 h-4 mr-1" /> Thêm đáp án tham khảo
            </Button>
        </div>
      </FormField>
    </div>
  );
};

export default RecordAudioEditor;