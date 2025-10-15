import React from 'react';
import { FormSection, FormSubsection } from '../hooks/useExamForm';
import { UUID, QuestionType } from '../../../../types';
import CollapsibleContainer from './shared/CollapsibleContainer';
import RichTextEditor from '../../../../components/RichTextEditor';
import { FormField } from '../../../../components/ui/FormField';
import SubsectionEditor from './SubsectionEditor';
import { PlusIcon, TrashIcon } from 'lucide-react';
import FileInput from './shared/FileInput';

interface SectionEditorProps {
    section: FormSection;
    sectionIndex: number;
    onUpdate: (id: UUID, payload: Partial<FormSection>) => void;
    onRemove: (id: UUID) => void;
    // Props được truyền xuống cho các component con
    addSubsection: (sectionId: UUID) => void;
    updateSubsection: (sectionId: UUID, subsectionId: UUID, payload: Partial<FormSubsection>) => void;
    removeSubsection: (sectionId: UUID, id: UUID) => void;
    addPrompt: any; updatePrompt: any; removePrompt: any;
    addQuestion: any; updateQuestion: any; removeQuestion: any;
    questionTypes: QuestionType[];
}

const SectionEditor: React.FC<SectionEditorProps> = ({
    section,
    sectionIndex,
    onUpdate,
    onRemove,
    addSubsection,
    updateSubsection,
    removeSubsection,
    ...rest
}) => {
    const headerActions = (
        <button onClick={() => onRemove(section.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50" title="Xóa Phần thi">
            <TrashIcon size={16} />
        </button>
    );

    return (
        <CollapsibleContainer title={`Phần ${sectionIndex + 1}: ${section.name || 'Chưa có tên'}`} actions={headerActions}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Tên Phần thi *" required>
                        <input
                            value={section.name}
                            onChange={e => onUpdate(section.id, { name: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                    </FormField>
                     <FormField label="Thời gian (phút)">
                        <input
                            type="number"
                            value={section.time_minutes || ''}
                            onChange={e => onUpdate(section.id, { time_minutes: Number(e.target.value) })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                    </FormField>
                </div>
                <FileInput
                    id={`section-audio-${section.id}`}
                    label="File âm thanh chung/Giới thiệu (nếu có)"
                    value={section.audio_url}
                    onFileChange={file => onUpdate(section.id, { audio_url: file ? URL.createObjectURL(file) : undefined })}
                    accept="audio/*"
                />
                <FormField label="Mô tả Phần thi">
                    <RichTextEditor
                        initialContent={section.description?.html || ''}
                        onChange={html => onUpdate(section.id, { description: { html } })}
                    />
                </FormField>

                {/* Subsections */}
                <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                    <h4 className="font-semibold text-gray-700">Các phần con</h4>
                    {section.subsections?.map((sub, subIndex) => (
                        <SubsectionEditor
                            key={sub.id}
                            sectionIndex={sectionIndex}
                            subsectionIndex={subIndex}
                            subsection={sub}
                            updateSubsection={(...args) => updateSubsection(section.id, ...args)}
                            removeSubsection={(...args) => removeSubsection(section.id, ...args)}
                            addPrompt={(...args) => rest.addPrompt(section.id, ...args)}
                            updatePrompt={(...args) => rest.updatePrompt(section.id, ...args)}
                            removePrompt={(...args) => rest.removePrompt(section.id, ...args)}
                            addQuestion={(...args) => rest.addQuestion(section.id, ...args)}
                            updateQuestion={(...args) => rest.updateQuestion(section.id, ...args)}
                            removeQuestion={(...args) => rest.removeQuestion(section.id, ...args)}
                            questionTypes={rest.questionTypes}
                        />
                    ))}
                     <button onClick={() => addSubsection(section.id)} className="flex items-center text-sm font-medium text-blue-600">
                        <PlusIcon size={16} className="mr-1"/> Thêm Phần con
                    </button>
                </div>
            </div>
        </CollapsibleContainer>
    );
};

export default SectionEditor;
