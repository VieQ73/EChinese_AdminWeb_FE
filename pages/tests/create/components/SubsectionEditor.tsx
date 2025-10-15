import React from 'react';
import { Input } from '../../../../components/ui/Input';
import { TextArea } from '../../../../components/ui/TextArea';
import { Button } from '../../../../components/ui/Button';
import { TrashIcon, PlusIcon } from 'lucide-react';
import CollapsibleContainer from './shared/CollapsibleContainer';
import { stripHtmlAndTruncate } from '../../../../utils/numbering';
import FileInput from './shared/FileInput';

import type { QuestionType, UUID } from '../../../../types';
import type { FormSubsection, FormPrompt, FormQuestion } from '../hooks/useExamForm';

import QuestionEditor from './QuestionEditor';
import PromptEditor from './PromptEditor';


interface SubsectionEditorProps {
  sectionIndex: number;
  subsectionIndex: number;
  subsection: FormSubsection;
  questionTypes: QuestionType[];
  updateSubsection: (subsectionId: UUID, payload: Partial<FormSubsection>) => void;
  removeSubsection: (subsectionId: UUID) => void;
  addPrompt: (subsectionId: UUID) => void;
  updatePrompt: (subsectionId: UUID, promptId: UUID, payload: Partial<FormPrompt>) => void;
  removePrompt: (subsectionId: UUID, promptId: UUID) => void;
  addQuestion: (subsectionId: UUID, promptId?: UUID) => void;
  updateQuestion: (subsectionId: UUID, questionId: UUID, payload: Partial<FormQuestion>) => void;
  removeQuestion: (subsectionId: UUID, questionId: UUID) => void;
}

const SubsectionEditor: React.FC<SubsectionEditorProps> = ({
  sectionIndex,
  subsectionIndex,
  subsection,
  questionTypes,
  updateSubsection,
  removeSubsection,
  addPrompt,
  updatePrompt,
  removePrompt,
  addQuestion,
  updateQuestion,
  removeQuestion
}) => {
  const handleFieldChange = (field: keyof FormSubsection, value: string) => {
    updateSubsection(subsection.id, { [field]: value });
  };

  const questionsWithoutPrompt = subsection.questions.filter(q => !q.prompt_id);

  return (
    <CollapsibleContainer
      title={`Phần con ${subsectionIndex + 1}: ${subsection.name || 'Chưa có tên'}`}
      actions={
        <Button type="button" variant="danger" size="sm" onClick={() => removeSubsection(subsection.id)}>
          <TrashIcon className="w-4 h-4 mr-1" /> Xóa phần con
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tên phần con *"
          value={subsection.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Ví dụ: Phần 1: Nghe và chọn hình"
          required
        />
        <TextArea
          label="Mô tả phần con"
          value={subsection.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Mô tả ngắn gọn về yêu cầu của phần con này"
        />
        
        <FileInput
            id={`subsection-audio-${subsection.id}`}
            label={`File âm thanh giới thiệu cho ${subsection.name || `Phần ${subsectionIndex + 1}`}`}
            value={subsection.audio_url}
            onFileChange={file => updateSubsection(subsection.id, { audio_url: file ? URL.createObjectURL(file) : undefined })}
            accept="audio/*"
        />

        {/* Render các prompts và các câu hỏi liên quan */}
        {subsection.prompts.map((prompt) => {
          const questionsForPrompt = subsection.questions.filter(q => q.prompt_id === prompt.id);
          return (
            <CollapsibleContainer
              key={prompt.id}
              title={
                <>
                  <span className="font-semibold">Đề bài chung:</span>
                  <span className="ml-2 font-normal text-slate-500 truncate max-w-md">
                    {stripHtmlAndTruncate(prompt.content?.html) || 'Chưa có nội dung'}
                  </span>
                </>
              }
              actions={
                <Button type="button" variant="danger" size="sm" onClick={() => removePrompt(subsection.id, prompt.id)}>
                  <TrashIcon className="w-4 h-4 mr-1" /> Xóa Đề bài
                </Button>
              }
            >
              <div className="space-y-4">
                 <PromptEditor
                    prompt={prompt}
                    onPromptChange={(p) => updatePrompt(subsection.id, prompt.id, p)}
                  />
                  <div className="pl-6 border-l-2 border-blue-200 space-y-4">
                    {questionsForPrompt.map((q) => (
                      <QuestionEditor
                        key={q.id}
                        sectionIndex={sectionIndex}
                        subsectionIndex={subsectionIndex}
                        questionIndex={subsection.questions.indexOf(q)}
                        question={q}
                        questionTypes={questionTypes}
                        onQuestionChange={(changedQ) => updateQuestion(subsection.id, q.id, changedQ)}
                        onRemoveQuestion={() => removeQuestion(subsection.id, q.id)}
                      />
                    ))}
                     <Button type="button" variant="secondary" size="sm" onClick={() => addQuestion(subsection.id, prompt.id)}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Thêm câu hỏi vào đề bài này
                     </Button>
                  </div>
              </div>
            </CollapsibleContainer>
          )
        })}
        
        {/* Render các câu hỏi không thuộc prompt nào */}
        <div className="space-y-4">
          {questionsWithoutPrompt.map((q) => (
            <QuestionEditor
              key={q.id}
              sectionIndex={sectionIndex}
              subsectionIndex={subsectionIndex}
              questionIndex={subsection.questions.indexOf(q)}
              question={q}
              questionTypes={questionTypes}
              onQuestionChange={(changedQ) => updateQuestion(subsection.id, q.id, changedQ)}
              onRemoveQuestion={() => removeQuestion(subsection.id, q.id)}
            />
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={() => addPrompt(subsection.id)}>
            <PlusIcon className="w-4 h-4 mr-2" /> Thêm Đề bài chung
          </Button>
          <Button type="button" variant="secondary" onClick={() => addQuestion(subsection.id)}>
            <PlusIcon className="w-4 h-4 mr-2" /> Thêm Câu hỏi (đơn lẻ)
          </Button>
        </div>
      </div>
    </CollapsibleContainer>
  );
};

export default SubsectionEditor;