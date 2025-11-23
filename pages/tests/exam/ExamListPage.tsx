import React from 'react'; // useEffect không còn cần thiết
import { useNavigate } from 'react-router';
import { useAppData } from '../../../contexts/AppDataContext';
import Modal from '../../../components/Modal';
import ConfirmationModal from '../../monetization/components/ConfirmationModal';

import ExamListHeader from './components/list/ExamListHeader';
import ExamTypeGroup from './components/list/ExamTypeGroup';

// Import các custom hook đã được tách
import { useExamState } from './hooks/useExamState';
import { useExamData } from './hooks/useExamData';
import { useExamActions } from './hooks/useExamActions';

const ExamListPage: React.FC = () => {
    const navigate = useNavigate();
    // Lấy dữ liệu trực tiếp từ context, đây là "source of truth"
    const { exams: allExams, examTypes, examLevels } = useAppData();

    // 1. Hook quản lý State (đã loại bỏ allExams và setAllExams)
    const {
        activeTab, setActiveTab,
        isCopying, setIsCopying,
        actionState, setActionState,
        isInfoModalOpen, setIsInfoModalOpen,
        infoModalContent, setInfoModalContent
    } = useExamState();

    // useEffect không còn cần thiết nữa
    // useEffect(() => {
    //     setAllExams(allExamsFromContext);
    // }, [allExamsFromContext, setAllExams]);

    // 2. Hook xử lý dữ liệu (lọc, nhóm) - sử dụng trực tiếp `allExams` từ context
    const { groupedExams } = useExamData(allExams, activeTab);

    // 3. Hook quản lý các hành động (đã loại bỏ setAllExams)
    const { handleAction, handleConfirmAction, getConfirmModalContent } = useExamActions({
        isCopying,
        setIsCopying,
        // setAllExams,
        setActionState,
        setInfoModalContent,
        setIsInfoModalOpen,
        actionState,
    });
    
    const { title, content, confirmText } = getConfirmModalContent();

    return (
        <div className="space-y-6">
            <ExamListHeader onCreateExam={() => navigate('/mock-tests/create')} />

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            activeTab === 'current'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                        }`}
                    >
                        Bài thi hiện có
                    </button>
                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            activeTab === 'deleted'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                        }`}
                    >
                        Bài thi đã xóa
                    </button>
                </nav>
            </div>

            {/* Exam Groups */}
            <div className="space-y-8">
                {Object.entries(groupedExams).map(([typeId, exams]) => {
                    const examType = examTypes.find(t => t.id === typeId);
                    if (!examType) return null;
                    const levelsForType = examLevels.filter(l => l.exam_type_id === typeId);
                    return (
                        <ExamTypeGroup
                            key={typeId}
                            typeId={typeId}
                            title={examType.name}
                            exams={exams}
                            levels={levelsForType}
                            onAction={handleAction}
                        />
                    );
                })}

                {Object.keys(groupedExams).length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            {activeTab === 'current' ? 'Không có bài thi nào.' : 'Thùng rác trống.'}
                        </p>
                    </div>
                )}
            </div>
            
            {/* Modals */}
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

export default ExamListPage;