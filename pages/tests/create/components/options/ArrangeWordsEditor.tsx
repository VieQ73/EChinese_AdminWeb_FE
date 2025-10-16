import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormQuestion, FormOption } from '../../hooks/useExamForm';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { TrashIcon, PlusIcon } from '../../../../../components/icons';
import { X } from 'lucide-react';

interface ArrangeWordsEditorProps {
  question: FormQuestion;
  onQuestionChange: (question: FormQuestion) => void;
}

const ArrangeWordsEditor: React.FC<ArrangeWordsEditorProps> = ({ question, onQuestionChange }) => {
    const [currentAnswer, setCurrentAnswer] = useState<string[]>([]);
    
    // Phân tích cú pháp chuỗi JSON từ correct_answer để hiển thị các đáp án đã lưu
    const correctAnswers = useMemo((): string[][] => {
        try {
            const parsed = JSON.parse(question.correct_answer || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, [question.correct_answer]);

    // Cập nhật một từ/cụm từ trong danh sách các lựa chọn
    const handleOptionContentChange = (optionId: string, content: string) => {
        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, content } : opt
        );
        onQuestionChange({ ...question, options: newOptions });
    };

    // Thêm một thẻ từ/cụm từ mới
    const addOption = () => {
        const newOption: FormOption = {
            id: uuidv4(),
            question_id: question.id,
            content: '',
        };
        onQuestionChange({ ...question, options: [...question.options, newOption] });
    };

    // Xóa một thẻ từ/cụm từ
    const removeOption = (optionId: string) => {
        const newOptions = question.options.filter(opt => opt.id !== optionId);
        onQuestionChange({ ...question, options: newOptions });
    };

    // Thêm một từ vào chuỗi đáp án đang xây dựng
    const addWordToCurrentAnswer = (word: string) => {
        if (word) setCurrentAnswer(prev => [...prev, word]);
    };
    
    // Xóa một từ khỏi chuỗi đáp án đang xây dựng
    const removeWordFromCurrentAnswer = (index: number) => {
        setCurrentAnswer(prev => prev.filter((_, i) => i !== index));
    };

    // Lưu chuỗi đáp án hiện tại vào danh sách các đáp án đúng
    const saveCurrentAnswer = () => {
        if (currentAnswer.length === 0) return;
        const newAnswers = [...correctAnswers, currentAnswer];
        onQuestionChange({ ...question, correct_answer: JSON.stringify(newAnswers) });
        setCurrentAnswer([]);
    };
    
    // Xóa một đáp án đúng đã lưu
    const deleteCorrectAnswer = (index: number) => {
        const newAnswers = correctAnswers.filter((_, i) => i !== index);
        onQuestionChange({ ...question, correct_answer: JSON.stringify(newAnswers) });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Các từ/cụm từ (bắt buộc):</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-lg">
                    {question.options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-1 bg-white p-1 rounded-md border">
                            <Input
                                value={option.content || ''}
                                onChange={(e) => handleOptionContentChange(option.id, e.target.value)}
                                placeholder={`Từ ${index + 1}`}
                                className="!p-1 text-sm w-24"
                            />
                            <Button type="button" variant="danger" size="sm" onClick={() => removeOption(option.id)} className="!p-1 h-full">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                        <PlusIcon className="w-4 h-4 mr-1" /> Thêm từ
                    </Button>
                </div>
            </div>
            
            <div>
                 <label className="text-sm font-medium text-slate-700 block mb-2">Đáp án đúng (nhấn vào các từ bên dưới để tạo):</label>
                 {/* Hiển thị các đáp án đã lưu */}
                 {correctAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-2">
                        <div className="flex-grow flex flex-wrap gap-2">
                            {answer.map((word, wordIndex) => (
                                <span key={wordIndex} className="px-3 py-1 bg-white border rounded-full text-sm">{word}</span>
                            ))}
                        </div>
                        <Button type="button" variant="danger" size="sm" onClick={() => deleteCorrectAnswer(index)}>
                            <TrashIcon className="w-4 h-4" />
                        </Button>
                    </div>
                 ))}

                {/* Khu vực tạo đáp án mới */}
                <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
                    <div className="min-h-[40px] flex flex-wrap items-center gap-2">
                        {currentAnswer.map((word, index) => (
                            <button key={index} onClick={() => removeWordFromCurrentAnswer(index)} className="flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-sm text-blue-800">
                                {word}
                                <X size={12} />
                            </button>
                        ))}
                    </div>
                     <div className="flex flex-wrap gap-2 pt-3 border-t border-dashed">
                        {question.options.map(option => (
                           <button key={option.id} onClick={() => addWordToCurrentAnswer(option.content || '')} disabled={!option.content} className="px-3 py-1 bg-slate-200 rounded-full text-sm hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                               {option.content || '...'}
                           </button>
                        ))}
                    </div>
                    <div className="text-right">
                        <Button type="button" variant="primary" size="sm" onClick={saveCurrentAnswer} disabled={currentAnswer.length === 0}>
                            Lưu đáp án này
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArrangeWordsEditor;
