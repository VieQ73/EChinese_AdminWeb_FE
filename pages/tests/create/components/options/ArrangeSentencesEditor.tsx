import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormQuestion, FormOption, CorrectAnswer } from '../../hooks/useExamForm';
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

    // Đọc trực tiếp chuỗi đáp án hoàn chỉnh, không cần parse JSON
    const correctAnswers = useMemo((): string[] => {
        return (question.correct_answers || []).map(ca => ca.answer);
    }, [question.correct_answers]);

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
        // Tìm label của option sắp bị xóa để loại bỏ khỏi currentAnswer
        const optionToRemove = question.options.find(opt => opt.id === optionId);
        if (optionToRemove && optionToRemove.label) {
            setCurrentAnswer(prev => prev.filter(label => label !== optionToRemove.label));
        }

        const newOptions = question.options
            .filter(opt => opt.id !== optionId)
            .map((opt, index) => ({
                ...opt,
                label: String.fromCharCode(65 + index),
            }));
        
        // Cập nhật lại currentAnswer với labels mới sau khi re-label
        setCurrentAnswer(prev => {
            const validLabels = prev.filter(label => {
                const newIndex = question.options.findIndex(opt => 
                    opt.id !== optionId && opt.label === label
                );
                return newIndex !== -1;
            }).map(label => {
                const oldIndex = question.options.findIndex(opt => opt.label === label);
                const newIndex = question.options.filter(opt => opt.id !== optionId)
                    .findIndex(opt => opt.id === question.options[oldIndex].id);
                return String.fromCharCode(65 + newIndex);
            });
            return validLabels;
        });

        onQuestionChange({ ...question, options: newOptions });
    };

    const addLabelToCurrentAnswer = (label: string) => {
        if (label && currentAnswer.length < question.options.length && !currentAnswer.includes(label)) {
            setCurrentAnswer(prev => [...prev, label]);
        }
    };

    const removeLabelFromCurrentAnswer = (index: number) => {
        setCurrentAnswer(prev => prev.filter((_, i) => i !== index));
    };

    // Thêm/bỏ câu khỏi danh sách đang sắp xếp
    const toggleLabelInCurrentAnswer = (label: string) => {
        if (currentAnswer.includes(label)) {
            setCurrentAnswer(prev => prev.filter(l => l !== label));
        } else {
            addLabelToCurrentAnswer(label);
        }
    };

    // Lưu chuỗi đáp án hiện tại thành một câu/đoạn văn hoàn chỉnh
    const saveCurrentAnswer = () => {
        if (currentAnswer.length === 0) return;

        // Ánh xạ các nhãn (labels) trong `currentAnswer` sang nội dung (content) tương ứng và ghép chúng lại
        const answerSentence = currentAnswer.map(label => {
            const option = question.options.find(opt => opt.label === label);
            return option ? option.content?.trim() : '';
        }).join(''); // Ghép các câu lại, không có khoảng trắng cho tiếng Trung

        const newCorrectAnswer: CorrectAnswer = {
            id: uuidv4(),
            question_id: question.id,
            answer: answerSentence, // Lưu câu hoàn chỉnh
        };
        const newCorrectAnswers = [...(question.correct_answers || []), newCorrectAnswer];
        onQuestionChange({ ...question, correct_answers: newCorrectAnswers, correct_answer: undefined });
        setCurrentAnswer([]);
    };

    const deleteCorrectAnswer = (index: number) => {
        const newCorrectAnswers = (question.correct_answers || []).filter((_, i) => i !== index);
        onQuestionChange({ ...question, correct_answers: newCorrectAnswers });
    };

    return (
        <div className="space-y-4">
            {/* Phần đáp án đúng */}
            <div>
                 <label className="text-sm font-medium text-slate-700 block mb-2">Đáp án đúng (nhấn vào các câu bên dưới để tạo):</label>
                 {/* Hiển thị các đáp án đã lưu dưới dạng câu hoàn chỉnh */}
                 {correctAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-2">
                        <div className="flex-grow p-2 bg-white rounded">
                            <span className="text-sm text-slate-800">{answer}</span>
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
                    {question.options.map((option) => {
                        const isSelected = currentAnswer.includes(option.label || '');
                        return (
                            <div key={option.id} className="flex items-start gap-2">
                                <div className="flex-grow p-3 border rounded-lg bg-white">
                                    <Input
                                        label={`Câu ${option.label}`}
                                        value={option.content || ''}
                                        onChange={(e) => handleOptionChange(option.id, 'content', e.target.value)}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    variant={isSelected ? "secondary" : "primary"} 
                                    size="sm" 
                                    onClick={() => toggleLabelInCurrentAnswer(option.label || '')} 
                                    className="mt-8"
                                >
                                    {isSelected ? 'Bỏ chọn' : 'Chọn'}
                                </Button>
                                <Button type="button" variant="danger" size="sm" onClick={() => removeOption(option.id)} className="mt-8">
                                    <TrashIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        )
                    })}
                    <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Thêm câu
                    </Button>
                 </div>
            </div>
        </div>
    );
};

export default ArrangeSentencesEditor;