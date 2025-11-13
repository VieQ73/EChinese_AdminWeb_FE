import { useState, useEffect } from 'react';
import { ExamSummary } from '../../../../types/mocktest_extended';
import { MOCK_EXAMS } from '../../../../mock/exams';
import { MOCK_EXAM_TYPES } from '../../../../mock/exam_meta';

// Định nghĩa kiểu dữ liệu cho state của modal xác nhận
export interface ActionState {
    action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently';
    exam: ExamSummary;
}

// Định nghĩa kiểu dữ liệu cho state của modal thông báo
export interface InfoModalContent {
    title: string;
    message: string;
}

/**
 * Hook tùy chỉnh để quản lý toàn bộ state cho trang danh sách bài thi.
 */
export const useExamState = () => {
    // Tab đang hoạt động ('current' hoặc 'deleted')
    const [activeTab, setActiveTab] = useState<'current' | 'deleted'>('current');
    
    // Danh sách tất cả bài thi (nguồn dữ liệu chính)
    const [allExams, setAllExams] = useState<ExamSummary[]>([]);
    
    // Trạng thái cho các hành động bất đồng bộ
    const [isCopying, setIsCopying] = useState(false);
    
    // State cho modal xác nhận
    const [actionState, setActionState] = useState<ActionState | null>(null);
    
    // State cho modal thông báo
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState<InfoModalContent>({ title: '', message: '' });

    // Trả về tất cả state và hàm setter của chúng
    return {
        activeTab, setActiveTab,
        allExams, setAllExams,
        isCopying, setIsCopying,
        actionState, setActionState,
        isInfoModalOpen, setIsInfoModalOpen,
        infoModalContent, setInfoModalContent,
    };
};
