import React, { useState } from 'react';
import type { FormQuestion, CorrectAnswer } from '../../hooks/useExamForm';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from '../../../../../components/ui';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface WriteTextEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const WriteTextEditor: React.FC<WriteTextEditorProps> = ({ question, onQuestionChange }) => {
  const [newAnswer, setNewAnswer] = useState('');

  const handleAddAnswer = () => {
    if (!newAnswer.trim()) return;
    const newCorrectAnswer: CorrectAnswer = {
      id: uuidv4(),
      question_id: question.id,
      answer: newAnswer.trim(),
    };
    const updatedAnswers = [...(question.correct_answers || []), newCorrectAnswer];
    onQuestionChange({ ...question, correct_answers: updatedAnswers, correct_answer: undefined });
    setNewAnswer('');
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
        label="Các đáp án đúng được chấp nhận (nếu có)"
        helpText="Hệ thống sẽ chấm đúng nếu câu trả lời của người dùng khớp với bất kỳ đáp án nào trong danh sách này. Để trống nếu đây là câu hỏi tự luận."
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {(question.correct_answers || []).map((answer) => (
            <div
              key={answer.id}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1"
            >
              <Input
                value={answer.answer}
                onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                className="w-48" 
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemoveAnswer(answer.id)}
                className="!p-2"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Nhập đáp án đúng..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAnswer();
              }
            }}
            className="flex-grow"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddAnswer}
            className="!px-4"
          >
            <PlusIcon className="w-4 h-4 mr-1" /> Thêm
          </Button>
        </div>
      </FormField>
    </div>
  );
};

export default WriteTextEditor;
