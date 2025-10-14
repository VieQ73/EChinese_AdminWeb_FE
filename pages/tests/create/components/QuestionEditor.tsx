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

import type { QuestionType, Explanation } from '../../../../types';
//  Import FormExplanation type.
import type { FormQuestion, FormOption, FormExplanation } from '../hooks/useExamForm';

import TrueFalseEditor from './options/TrueFalseEditor';
import MultipleChoiceEditor from './options/MultipleChoiceEditor';
import ArrangeWordsEditor from './options/ArrangeWordsEditor';
import ArrangeSentencesEditor from './options/ArrangeSentencesEditor';
import ExplanationEditor from './ExplanationEditor';

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

    if (newType) {
        if (newType.id === 'true_false') {
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
        }
    }
    onQuestionChange({ ...question, question_type_id: typeId, options: newOptions });
  };

  const renderOptions = () => {
    if (!selectedQuestionType) return null;

    switch(selectedQuestionType.id) {
        case 'true_false':
            return <TrueFalseEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'multiple_choice_3':
        case 'multiple_choice_4':
        case 'multiple_choice_5':
            return <MultipleChoiceEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'arrange_words':
            return <ArrangeWordsEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'arrange_sentences':
            return <ArrangeSentencesEditor question={question} onQuestionChange={onQuestionChange} />;
        case 'write_text':
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
            {stripHtmlAndTruncate(question.content) || 'Chưa có nội dung'}
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
          <RichTextEditor
              initialContent={question.content || ''}
              onChange={(html) => handleFieldChange('content', html)}
              placeholder="Nhập nội dung câu hỏi..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/*  Changed prop 'onFileSelect' to 'onFileChange' and added required props. */}
          <FileInput 
              id={`question-image-${question.id}`}
              label="Ảnh câu hỏi"
              value={question.image_url}
              onFileChange={(file) => handleFieldChange('image_url', file ? URL.createObjectURL(file) : '')} 
              accept="image/*"
          />
          <FileInput 
              id={`question-audio-${question.id}`}
              label="Âm thanh câu hỏi"
              value={question.audio_url}
              onFileChange={(file) => handleFieldChange('audio_url', file ? URL.createObjectURL(file) : '')} 
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
