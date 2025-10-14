
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ExamSummary } from '../../../../../types/mocktest_extended';
import { MOCK_EXAM_LEVELS } from '../../../../../mock/exam_meta';
import { ChevronRight } from 'lucide-react';
import ExamCard from './ExamCard';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import ExamLevelFilters from './ExamLevelFilters';

interface ExamTypeGroupProps {
    title: string;
    typeId: string;
    exams: ExamSummary[];
    onAction: (action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => void;
}

const ExamTypeGroup: React.FC<ExamTypeGroupProps> = ({ title, typeId, exams, onAction }) => {
    const [activeLevelId, setActiveLevelId] = useState<string | 'all'>('all');
    const scrollRef = useHorizontalScroll();
    const navigate = useNavigate();

    // Lấy TẤT CẢ các cấp độ thuộc về loại bài thi này, không phụ thuộc vào `exams` prop
    const levels = useMemo(() => {
        return MOCK_EXAM_LEVELS.filter(level => level.exam_type_id === typeId);
    }, [typeId]);

    const filteredExams = useMemo(() => {
        if (activeLevelId === 'all') return exams;
        return exams.filter(e => e.exam_level_id === activeLevelId);
    }, [exams, activeLevelId]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Group Header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <button
                    onClick={() => navigate(`/mock-tests/type/${typeId}`)}
                    className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                    Xem tất cả <ChevronRight size={16} className="ml-1" />
                </button>
            </div>

            {/* Level Filters - Luôn hiển thị nếu loại bài thi có định nghĩa các cấp độ */}
            {levels.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                    <ExamLevelFilters
                        levels={levels}
                        activeLevelId={activeLevelId}
                        onSelectLevel={setActiveLevelId}
                    />
                </div>
            )}

            {/* Horizontal Scrollable Card List */}
            <div 
                ref={scrollRef}
                className="p-4 flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {filteredExams.length > 0 ? (
                    filteredExams.map(exam => (
                        <ExamCard key={exam.id} exam={exam} onAction={onAction} />
                    ))
                ) : (
                    <div className="w-full text-center text-sm text-gray-400 py-10">
                        Không có bài thi nào cho cấp độ này.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamTypeGroup;