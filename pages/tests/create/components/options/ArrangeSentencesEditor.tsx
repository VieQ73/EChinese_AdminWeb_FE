import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormQuestion, FormOption } from '../../hooks/useExamForm';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { TrashIcon, PlusIcon } from '../../../../../components/icons';
import { X } from 'lucide-react';


interface ArrangeSentencesEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const ArrangeSentencesEditor: React.FC<ArrangeSentencesEditorProps> = ({ question, onQuestionChange }) => {
    const [currentAnswer, setCurrentAnswer] = useState<string[]>([]);

    const correctAnswers = useMemo((): string[][] => {
        try {
            const parsed = JSON.parse(question.correct_answer || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, [question.correct_answer]);

    const handleOptionChange = (optionId: string, field: keyof FormOption, value: any) => {
        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
        );
        onQuestionChange({ ...question, options: newOptions });
    };

    const addOption = () => {
        const existingLabels = new Set(question.options.map(o => o.label));
        let newLabel = '';
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (!existingLabels.has(char)) {
                newLabel = char;
                break;
            }
        }
        if (!newLabel) {
            alert("Đã đạt giới hạn 26 câu.");
            return;
        }

        const newOption: FormOption = {
            id: uuidv4(),
            question_id: question.id,
            content: '',
            label: newLabel,
        };
        const newOptions = [...question.options, newOption];
        onQuestionChange({ ...question, options: newOptions });
    };

    const removeOption = (optionId: string) => {
        const newOptions = question.options
            .filter(opt => opt.id !== optionId)
            .map((opt, index) => ({
                ...opt,
                label: String.fromCharCode(65 + index),
            }));
        onQuestionChange({ ...question, options: newOptions });
    };

    const addLabelToCurrentAnswer = (label: string) => {
        if (label && currentAnswer.length < question.options.length) {
            setCurrentAnswer(prev => [...prev, label]);
        }
    };

    const removeLabelFromCurrentAnswer = (index: number) => {
        setCurrentAnswer(prev => prev.filter((_, i) => i !== index));
    };

    const saveCurrentAnswer = () => {
        if (currentAnswer.length === 0) return;
        const newAnswers = [...correctAnswers, currentAnswer];
        onQuestionChange({ ...question, correct_answer: JSON.stringify(newAnswers) });
        setCurrentAnswer([]);
    };

    const deleteCorrectAnswer = (index: number) => {
        const newAnswers = correctAnswers.filter((_, i) => i !== index);
        onQuestionChange({ ...question, correct_answer: JSON.stringify(newAnswers) });
    };


    return (
        <div className="space-y-4">
            {/* Phần đáp án đúng */}
            <div>
                 <label className="text-sm font-medium text-slate-700 block mb-2">Đáp án đúng (nhấn vào các câu bên dưới để tạo):</label>
                 {correctAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-2">
                        <div className="flex-grow flex flex-wrap gap-2">
                            {answer.map((label, labelIndex) => (
                                <div key={labelIndex} className="w-10 h-10 flex items-center justify-center bg-white border rounded-md font-semibold text-slate-800">{label}</div>
                            ))}
                        </div>
                        <Button type="button" variant="danger" size="sm" onClick={() => deleteCorrectAnswer(index)}>
                            <TrashIcon className="w-4 h-4" />
                        </Button>
                    </div>
                 ))}
                 
                 {/* Khu vực tạo đáp án mới */}
                 <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
                    <div className="flex justify-center items-center gap-2 min-h-[48px]">
                        {currentAnswer.map((label, index) => (
                            <button key={index} onClick={() => removeLabelFromCurrentAnswer(index)} className="relative w-10 h-10 flex items-center justify-center bg-blue-100 border border-blue-200 rounded-md font-semibold text-blue-800">
                                {label}
                                <X size={12} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5" />
                            </button>
                        ))}
                        {Array.from({ length: question.options.length - currentAnswer.length }).map((_, i) => (
                            <div key={i} className="w-10 h-10 bg-slate-200 rounded-md"></div>
                        ))}
                    </div>
                     <div className="text-right">
                        <Button type="button" variant="primary" size="sm" onClick={saveCurrentAnswer} disabled={currentAnswer.length === 0}>
                            Lưu đáp án này
                        </Button>
                    </div>
                 </div>
            </div>

            {/* Phần nhập câu */}
            <div>
                 <label className="text-sm font-medium text-slate-700 block mb-2">Các câu (nhấn để chọn thứ tự đúng):</label>
                 <div className="space-y-3">
                    {question.options.map((option) => (
                        <div key={option.id} className="flex items-start gap-2">
                             <div 
                                onClick={() => addLabelToCurrentAnswer(option.label || '')}
                                className="flex-grow p-3 border rounded-lg bg-white cursor-pointer hover:bg-slate-50 hover:border-slate-400"
                            >
                                <Input
                                    label={`Câu ${option.label}`}
                                    value={option.content || ''}
                                    onChange={(e) => handleOptionChange(option.id, 'content', e.target.value)}
                                />
                             </div>
                             <Button type="button" variant="danger" size="sm" onClick={() => removeOption(option.id)} className="mt-8">
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Thêm câu
                    </Button>
                 </div>
            </div>
        </div>
    );
};

export default ArrangeSentencesEditor;
