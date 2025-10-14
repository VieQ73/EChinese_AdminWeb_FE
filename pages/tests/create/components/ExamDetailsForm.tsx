import React, { useMemo } from 'react';
import { ExamFull } from '../../../../types/mocktest_extended';
import RichTextEditor from '../../../../components/RichTextEditor';
import { useAppData } from '../../../../contexts/AppDataContext';
import { FormField } from '../../../../components/ui';

interface ExamDetailsFormProps {
    exam: ExamFull;
    onUpdate: (payload: Partial<ExamFull>) => void;
}

const ExamDetailsForm: React.FC<ExamDetailsFormProps> = ({ exam, onUpdate }) => {
    const { examTypes, examLevels } = useAppData();

    const filteredLevels = useMemo(() => {
        return examLevels.filter(level => level.exam_type_id === exam.exam_type_id);
    }, [exam.exam_type_id, examLevels]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
            {/* --- START CHANGED SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1 */}
                <FormField label="Tên bài thi" required>
                    <input
                        value={exam.name}
                        onChange={e => onUpdate({ name: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                </FormField>
                <FormField label="Tổng thời gian (phút)" required>
                    <input
                        type="number"
                        value={exam.total_time_minutes || ''}
                        onChange={e => onUpdate({ total_time_minutes: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                </FormField>

                {/* Row 2 */}
                <FormField label="Loại bài thi" required>
                    <select
                        value={exam.exam_type_id}
                        onChange={e => onUpdate({ exam_type_id: e.target.value, exam_level_id: '' })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Chọn loại</option>
                        {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </FormField>
                <FormField label="Cấp độ" required>
                    <select
                        value={exam.exam_level_id}
                        onChange={e => onUpdate({ exam_level_id: e.target.value })}
                        disabled={!exam.exam_type_id || filteredLevels.length === 0}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg disabled:bg-slate-200 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Chọn cấp độ</option>
                        {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </FormField>

                {/* --- END CHANGED SECTION --- */}

                <div className="md:col-span-2">
                    <FormField label="Mô tả">
                         <RichTextEditor
                            initialContent={exam.description?.html || ''}
                            onChange={html => onUpdate({ description: { html } })}
                            placeholder="Mô tả ngắn gọn về bài thi..."
                        />
                    </FormField>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Hướng dẫn làm bài">
                        <RichTextEditor
                            initialContent={exam.instructions || ''}
                            onChange={html => onUpdate({ instructions: html })}
                            placeholder="Hướng dẫn chi tiết cho thí sinh..."
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
};

export default ExamDetailsForm;