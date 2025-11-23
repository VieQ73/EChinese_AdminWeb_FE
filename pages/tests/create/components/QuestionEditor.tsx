import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQuestionNumbering } from '../../contexts/QuestionNumberingContext';
import { stripHtmlAndTruncate } from '../../../../utils/numbering';

import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import RichTextEditor from '../../../../components/RichTextEditor';
import CollapsibleContainer from './shared/CollapsibleContainer';
import FileInput from './shared/FileInput';
import { TrashIcon } from 'lucide-react';

import type { QuestionType, CorrectAnswer } from '../../../../types';
import type { FormQuestion, FormOption, FormExplanation } from '../hooks/useExamForm';

import TrueFalseEditor from './options/TrueFalseEditor';
import MultipleChoiceEditor from './options/MultipleChoiceEditor';
import ArrangeWordsEditor from './options/ArrangeWordsEditor';
import ArrangeSentencesEditor from './options/ArrangeSentencesEditor';
import ExplanationEditor from './ExplanationEditor';
import WriteTextEditor from './options/WriteTextEditor';
import RecordAudioEditor from './options/RecordAudioEditor'; 

interface QuestionEditorProps {
  sectionIndex: number;
  subsectionIndex: number;
  questionIndex: number;
  question: FormQuestion;
  questionTypes: QuestionType[];
  onQuestionChange: (question: FormQuestion) => void;
  onRemoveQuestion: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  sectionIndex,
  subsectionIndex,
  questionIndex,
  question,
  questionTypes,
  onQuestionChange,
  onRemoveQuestion,
}) => {
  const { getQuestionNumber } = useQuestionNumbering();
  const questionNumber = getQuestionNumber(sectionIndex, subsectionIndex, questionIndex);
  const selectedQuestionType = questionTypes.find(qt => qt.id === question.question_type_id);

  const handleFieldChange = (field: keyof FormQuestion, value: any) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleExplanationChange = (newContent: string | undefined) => {
      let newExplanation: FormExplanation | null = null;
      if (newContent !== undefined) {
          newExplanation = question.explanation
              ? { ...question.explanation, content: newContent }
              : { id: uuidv4(), question_id: question.id, content: newContent };
      }
      handleFieldChange('explanation', newExplanation);
  };

  const handleQuestionTypeChange = (typeId: string) => {
    const newType = questionTypes.find(qt => qt.id === typeId);
    let newOptions: FormOption[] = [];
    let newCorrectAnswer: string | undefined = ''; // Reset correct_answer
    let newCorrectAnswers: CorrectAnswer[] | undefined = undefined; // Reset correct_answers

    if (newType) {
        // Sử dụng 'name' để kiểm tra thay vì 'id'
        if (newType.name === 'Đúng/Sai') {
            newOptions = [
                { id: uuidv4(), question_id: question.id, label: 'A', content: 'Đúng', is_correct: false },
                { id: uuidv4(), question_id: question.id, label: 'B', content: 'Sai', is_correct: false },
            ];
        } else if (newType.num_options && newType.num_options > 0) {
            newOptions = Array.from({ length: newType.num_options }, (_, index) => ({
                id: uuidv4(),
                question_id: question.id,
                label: String.fromCharCode(65 + index),
                content: '',
                is_correct: false,
            }));
        } else if (['Sắp xếp từ', 'Sắp xếp câu', 'Viết văn bản', 'Ghi âm'].includes(newType.name)) {
            // Các loại câu hỏi này sử dụng correct_answers
            newCorrectAnswers = [];
            newCorrectAnswer = undefined; 
        }
    }
    // Cập nhật cả correct_answer và correct_answers
    onQuestionChange({ ...question, question_type_id: typeId, options: newOptions, correct_answer: newCorrectAnswer, correct_answers: newCorrectAnswers });
  };
  
  const isArrangeType = selectedQuestionType?.name === 'Sắp xếp từ' || selectedQuestionType?.name === 'Sắp xếp câu';

  const generatePreviewHtml = () => {
    if (!isArrangeType) return '';

    const options = question.options || [];

    if (selectedQuestionType?.name === 'Sắp xếp từ') {
        if (options.length === 0) return '<p class="text-slate-400">Thêm các từ/cụm từ ở phần "Các lựa chọn trả lời" bên dưới để xem trước.</p>';
        return options.map(opt => 
            `<span class="inline-block bg-slate-200 text-slate-800 text-sm font-medium mr-2 mb-2 px-3 py-1.5 rounded-full">${opt.content || '...'}</span>`
        ).join('');
    }

    if (selectedQuestionType?.name === 'Sắp xếp câu') {
        if (options.length === 0) return '<p class="text-slate-400">Thêm các câu ở phần "Các lựa chọn trả lời" bên dưới để xem trước.</p>';
        return options.map(opt => 
            `<div class="flex items-start gap-2 mb-2 p-2 border rounded-md bg-slate-100">
                <span class="flex-shrink-0 font-bold text-slate-600">${opt.label}.</span>
                <span class="text-slate-800">${opt.content || '...'}</span>
            </div>`
        ).join('');
    }
    return '';
  };


  const renderOptions = () => {
    if (!selectedQuestionType) return null;

    switch(selectedQuestionType.name) {
        case 'Đúng/Sai':
            return <TrueFalseEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'Trắc nghiệm (3 đáp án)':
        case 'Trắc nghiệm (4 đáp án)':
        case 'Trắc nghiệm (5 đáp án - Nối)':
            return <MultipleChoiceEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'Sắp xếp từ':
            return <ArrangeWordsEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'Sắp xếp câu':
            return <ArrangeSentencesEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'Viết câu trả lời':
            return <WriteTextEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'Trả lời bằng ghi âm':
            return <RecordAudioEditor question={question} onQuestionChange={onQuestionChange} />;
        default:
            return null;
    }
  };


  return (
    <CollapsibleContainer
      title={
        <>
          <span className="font-semibold">Câu hỏi {questionNumber}</span>
          <span className="ml-2 font-normal text-slate-500 truncate max-w-sm">
            {stripHtmlAndTruncate(question.content) || (isArrangeType ? 'Sắp xếp các mục bên dưới' : 'Chưa có nội dung')}
          </span>
        </>
      }
      actions={
         <Button variant="danger" size="sm" onClick={onRemoveQuestion}>
          <TrashIcon className="w-4 h-4 mr-1" /> Xóa
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Loại câu hỏi"
            value={question.question_type_id}
            onChange={(e) => handleQuestionTypeChange(e.target.value)}
          >
            <option value="">Chọn loại câu hỏi</option>
            {questionTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.name}</option>)}
          </Select>
          <Input
            label="Điểm"
            type="number"
            value={question.points || 0}
            onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 0)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung câu hỏi</label>
          {isArrangeType ? (
              <div 
                  className="p-3 min-h-[120px] bg-slate-100 border border-slate-200 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }} 
              />
          ) : (
              <RichTextEditor
                  initialContent={question.content || ''}
                  onChange={(html) => handleFieldChange('content', html)}
                  placeholder="Nhập nội dung câu hỏi..."
              />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileInput 
              id={`question-image-${question.id}`}
              label="Ảnh câu hỏi"
              value={question.image_url}
              onFileChange={(url) => handleFieldChange('image_url', url)} 
              accept="image/*"
          />
          <FileInput 
              id={`question-audio-${question.id}`}
              label="Âm thanh câu hỏi"
              value={question.audio_url}
              onFileChange={(url) => handleFieldChange('audio_url', url)} 
              accept="audio/*"
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
            {renderOptions()}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <ExplanationEditor
                explanation={question.explanation?.content}
                onExplanationChange={handleExplanationChange}
            />
        </div>
      </div>
    </CollapsibleContainer>
  );
};

export default QuestionEditor;
