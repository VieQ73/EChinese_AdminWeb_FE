import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeftIcon } from '../../../components/icons';
import Modal from '../../../components/Modal';
import ConfirmationModal from '../../monetization/components/ConfirmationModal';
import { useAppData } from '../../../contexts/AppDataContext';

import ExamCard from './components/list/ExamCard';
import ExamLevelFilters from './components/list/ExamLevelFilters';

// Import hooks dùng chung cho state tác vụ & modal
import { useExamState } from './hooks/useExamState';
import { useExamActions } from './hooks/useExamActions';

const ExamTypeDetailPage: React.FC = () => {
    const { examTypeId } = useParams<{ examTypeId: string }>();
    const navigate = useNavigate();
    const { examTypes, examLevels, exams } = useAppData();

    // State dùng cho các hành động (copy, publish, delete ...) & modal
    const {
        isCopying, setIsCopying,
        actionState, setActionState,
        isInfoModalOpen, setIsInfoModalOpen,
        infoModalContent, setInfoModalContent
    } = useExamState();

    // Hook hành động (không còn phụ thuộc vào allExams nội bộ)
    const { handleAction, handleConfirmAction, getConfirmModalContent } = useExamActions({
        isCopying,
        setIsCopying,
        setActionState,
        setInfoModalContent,
        setIsInfoModalOpen,
        actionState,
    });
    
    


    const [activeLevelId, setActiveLevelId] = useState<string>(() => {
        const first = examLevels.find(l => l.exam_type_id === examTypeId);
        return first?.id || '';
    });

    const examType = useMemo(() => examTypes.find(t => t.id === examTypeId), [examTypes, examTypeId]);
    const levelsForType = useMemo(() => examLevels.filter(l => l.exam_type_id === examTypeId), [examLevels, examTypeId]);

    // Lọc bài thi dựa trên loại và cấp độ được chọn
    const filteredExams = useMemo(() => {
        let examsForType = exams.filter(e => e.exam_type_id === examTypeId && !e.is_deleted);
        if (activeLevelId) {
            examsForType = examsForType.filter(e => e.exam_level_id === activeLevelId);
        }
        return examsForType;
    }, [exams, examTypeId, activeLevelId]);

    // Lấy nội dung cho modal
    const { title, content, confirmText } = getConfirmModalContent();

    if (!examType) {
        return <div className="p-6">Không tìm thấy loại bài thi.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/mock-tests')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{examType.name}</h1>
            </div>
            
            {/* Card chứa bộ lọc và danh sách bài thi */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <ExamLevelFilters
                    levels={levelsForType}
                    activeLevelId={activeLevelId}
                    onSelectLevel={setActiveLevelId}
                />
                
                {filteredExams.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {filteredExams.map(exam => (
                            <ExamCard key={exam.id} exam={exam} onAction={handleAction} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <p>Không có bài thi nào cho cấp độ này.</p>
                    </div>
                )}
            </div>

            {/* Các modal cần thiết để các action hoạt động */}
            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title={infoModalContent.title}
                footer={
                    <button
                        onClick={() => setIsInfoModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                    >
                        Đã hiểu
                    </button>
                }
            >
                <p>{infoModalContent.message}</p>
            </Modal>

            <ConfirmationModal
                isOpen={!!actionState}
                onClose={() => setActionState(null)}
                onConfirm={handleConfirmAction}
                title={title}
                confirmText={confirmText}
            >
                <p>{content}</p>
            </ConfirmationModal>
        </div>
    );
};

export default ExamTypeDetailPage;
