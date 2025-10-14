import { useMemo } from 'react';
import { ExamSummary } from '../../../../types/mocktest_extended';

/**
 * Hook tùy chỉnh để xử lý việc lọc và nhóm dữ liệu bài thi.
 * @param allExams - Mảng chứa tất cả các bài thi.
 * @param activeTab - Tab đang hoạt động ('current' hoặc 'deleted').
 * @returns Dữ liệu bài thi đã được nhóm theo loại để hiển thị.
 */
export const useExamData = (allExams: ExamSummary[], activeTab: 'current' | 'deleted') => {
    // Lọc ra các bài thi hiện có và đã xóa
    const { currentExams, deletedExams } = useMemo(() => {
        const current = allExams.filter(e => !e.is_deleted);
        const deleted = allExams.filter(e => e.is_deleted);
        return { currentExams: current, deletedExams: deleted };
    }, [allExams]);

    // Chọn danh sách bài thi để hiển thị dựa trên tab đang hoạt động
    const examsToDisplay = useMemo(() => 
        activeTab === 'current' ? currentExams : deletedExams,
        [activeTab, currentExams, deletedExams]
    );

    // Nhóm các bài thi theo `exam_type_id`
    const groupedExams = useMemo(() => {
        return examsToDisplay.reduce((acc, exam) => {
            const typeId = exam.exam_type_id;
            if (!acc[typeId]) {
                acc[typeId] = [];
            }
            acc[typeId].push(exam);
            return acc;
        }, {} as Record<string, ExamSummary[]>);
    }, [examsToDisplay]);

    return {
        groupedExams,
    };
};
