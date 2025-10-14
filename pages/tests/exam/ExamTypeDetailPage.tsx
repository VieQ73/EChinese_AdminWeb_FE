import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeftIcon } from '../../../components/icons';
import { MOCK_EXAM_TYPES, MOCK_EXAM_LEVELS, MOCK_EXAMS } from '../../../mock';
import Modal from '../../../components/Modal';
import ConfirmationModal from '../../monetization/components/ConfirmationModal';

import ExamCard from './components/list/ExamCard';
import ExamLevelFilters from './components/list/ExamLevelFilters';

// Import hooks từ trang danh sách để tái sử dụng logic
import { useExamState } from './hooks/useExamState';
import { useExamActions } from './hooks/useExamActions';

const ExamTypeDetailPage: React.FC = () => {
    const { examTypeId } = useParams<{ examTypeId: string }>();
    const navigate = useNavigate();
    
    // Tái sử dụng state và logic action từ trang danh sách chính
    const {
        allExams, setAllExams,
        isCopying, setIsCopying,
        actionState, setActionState,
        isInfoModalOpen, setIsInfoModalOpen,
        infoModalContent, setInfoModalContent
    } = useExamState();

    const { handleAction, handleConfirmAction, getConfirmModalContent } = useExamActions({
        isCopying,
        setIsCopying,
        setAllExams,
        setActionState,
        setInfoModalContent,
        setIsInfoModalOpen,
        actionState,
    });
    
    // Khởi tạo dữ liệu bài thi (tương tự trang danh sách)
    useEffect(() => {
        const initialExams = MOCK_EXAMS.map(exam => ({
            ...exam,
            exam_type_name: MOCK_EXAM_TYPES.find(t => t.id === exam.exam_type_id)?.name || 'N/A',
            exam_level_name: 'N/A',
            section_count: exam.sections?.length || 0,
        }));
        setAllExams(initialExams);
    }, [setAllExams]);


    const [activeLevelId, setActiveLevelId] = useState<string | 'all'>('all');

    const examType = useMemo(() => MOCK_EXAM_TYPES.find(t => t.id === examTypeId), [examTypeId]);
    const levelsForType = useMemo(() => MOCK_EXAM_LEVELS.filter(l => l.exam_type_id === examTypeId), [examTypeId]);

    // Lọc bài thi dựa trên loại và cấp độ được chọn
    const filteredExams = useMemo(() => {
        let exams = allExams.filter(e => e.exam_type_id === examTypeId && !e.is_deleted);
        if (activeLevelId !== 'all') {
            exams = exams.filter(e => e.exam_level_id === activeLevelId);
        }
        return exams;
    }, [allExams, examTypeId, activeLevelId]);

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
