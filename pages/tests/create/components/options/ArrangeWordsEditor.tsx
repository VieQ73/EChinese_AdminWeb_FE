import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormQuestion, FormOption } from '../../hooks/useExamForm';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { TrashIcon, PlusIcon, GripVerticalIcon } from '../../../../../components/icons';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableOptionItemProps {
  id: string;
  option: FormOption;
  index: number;
  onOptionChange: (id: string, field: keyof FormOption, value: any) => void;
  onRemoveOption: (id: string) => void;
}

const SortableOptionItem: React.FC<SortableOptionItemProps> = ({ id, option, index, onOptionChange, onRemoveOption }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-white border rounded-lg">
            <span {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400 touch-none">
                <GripVerticalIcon className="w-5 h-5" />
            </span>
            <Input
                value={option.content || ''}
                onChange={(e) => onOptionChange(id, 'content', e.target.value)}
                placeholder={`Từ/cụm từ ${index + 1}`}
                className="flex-grow"
            />
            <Button type="button" variant="danger" size="sm" onClick={() => onRemoveOption(id)}>
                <TrashIcon className="w-4 h-4" />
            </Button>
        </div>
    );
};


interface ArrangeWordsEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const ArrangeWordsEditor: React.FC<ArrangeWordsEditorProps> = ({ question, onQuestionChange }) => {

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleOptionChange = (optionId: string, field: keyof FormOption, value: any) => {
        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
        );
        onQuestionChange({ ...question, options: newOptions });
    };

    const addOption = () => {
        const newOption: FormOption = {
            id: uuidv4(),
            question_id: question.id,
            content: '',
            order: question.options.length,
        };
        const newOptions = [...question.options, newOption].map((opt, index) => ({ ...opt, correct_order: index + 1}));
        onQuestionChange({ ...question, options: newOptions });
    };

    const removeOption = (optionId: string) => {
        const newOptions = question.options.filter(opt => opt.id !== optionId).map((opt, index) => ({ ...opt, correct_order: index + 1}));
        onQuestionChange({ ...question, options: newOptions });
    };

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = question.options.findIndex(o => o.id === active.id);
            const newIndex = question.options.findIndex(o => o.id === over.id);
            const newSortedOptions = arrayMove(question.options, oldIndex, newIndex).map((opt, index) => ({...opt, correct_order: index + 1}));
            onQuestionChange({...question, options: newSortedOptions});
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700">Các từ/cụm từ (kéo thả để sắp xếp thứ tự đúng):</p>
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={question.options.map(o => o.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {question.options.map((option, index) => (
                           <SortableOptionItem
                                key={option.id}
                                id={option.id.toString()}
                                option={option}
                                index={index}
                                onOptionChange={handleOptionChange}
                                onRemoveOption={removeOption}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                <PlusIcon className="w-4 h-4 mr-2" /> Thêm từ
            </Button>
        </div>
    );
};

export default ArrangeWordsEditor;
