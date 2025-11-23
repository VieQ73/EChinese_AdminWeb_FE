import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useExamForm } from './hooks/useExamForm';
import ExamDetailsForm from './components/ExamDetailsForm';
import SectionEditor from './components/SectionEditor';
import { PlusIcon } from '../../../components/icons';
import { QuestionNumberingProvider } from '../contexts/QuestionNumberingContext';
import { MOCK_QUESTION_TYPES } from '../../../mock';
import { useAppData } from '../../../contexts/AppDataContext';
import { ExamPayload } from '../api';

const ExamCreatePage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { createExam, updateExam } = useAppData();
    const [isSaving, setIsSaving] = useState(false);

    const {
        exam,
        loading,
        error,
        isFormValid,
        getValidationError,
        updateExamDetails,
        addSection,
        updateSection,
        removeSection,
        addSubsection,
        updateSubsection,
        removeSubsection,
        addPrompt,
        updatePrompt,
        removePrompt,
        addQuestion,
        updateQuestion,
        removeQuestion,
    } = useExamForm(examId);

    if (loading) {
        return <div className="flex justify-center items-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => navigate('/mock-tests')} className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300">
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const handleSave = async () => {
        const validationError = getValidationError();
        if (validationError) {
            alert(validationError);
            return;
        }

        setIsSaving(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, created_by, created_at, updated_at, is_deleted, ...payload } = exam;
            
            const finalPayload: ExamPayload = {
                ...payload,
                description: payload.description || { html: '' },
                instructions: payload.instructions || '',
                total_time_minutes: payload.total_time_minutes || 0,
                is_published: payload.is_published || false,
            };

            if (examId) {
                await updateExam(examId, finalPayload);
                alert('Cập nhật bài thi thành công!');
            } else {
                await createExam(finalPayload);
                alert('Tạo bài thi thành công!');
            }
            navigate('/mock-tests');
        } catch (err) {
            console.error('Failed to save exam:', err);
            alert(`Lưu bài thi thất bại: ${(err as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <QuestionNumberingProvider sections={exam.sections}>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex justify-between items-center sticky top-0 bg-gray-50/80 backdrop-blur-sm py-4 z-10 -mx-6 px-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {examId ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
                    </h1>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/mock-tests')} className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300">Hủy</button>
                        <button 
                            onClick={handleSave} 
                            disabled={!isFormValid || isSaving} 
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isSaving ? 'Đang lưu...' : 'Lưu đề thi'}
                        </button>
                    </div>
                </div>

                {/* Khối 1: Thông tin cơ bản */}
                <ExamDetailsForm exam={exam} onUpdate={updateExamDetails} />

                {/* Khối 2: Cấu trúc bài thi */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Cấu trúc bài thi</h2>
                    {exam.sections?.map((section, sectionIndex) => (
                        <SectionEditor
                            key={section.id}
                            section={section}
                            sectionIndex={sectionIndex}
                            onUpdate={updateSection}
                            onRemove={removeSection}
                            addSubsection={addSubsection}
                            updateSubsection={updateSubsection}
                            removeSubsection={removeSubsection}
                            addPrompt={addPrompt}
                            updatePrompt={updatePrompt}
                            removePrompt={removePrompt}
                            addQuestion={addQuestion}
                            updateQuestion={updateQuestion}
                            removeQuestion={removeQuestion}
                            questionTypes={MOCK_QUESTION_TYPES}
                        />
                    ))}
                    <button onClick={addSection} className="flex items-center justify-center w-full p-3 text-sm font-medium text-primary-600 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm Phần thi
                    </button>
                </div>
            </div>
        </QuestionNumberingProvider>
    );
};

export default ExamCreatePage;
