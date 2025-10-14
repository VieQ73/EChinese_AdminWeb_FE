// pages/tests/create/hooks/useExamForm.ts
import { useState, useEffect } from 'react';
import { fetchExamById } from '../../api';

// Tái xuất khẩu các kiểu dữ liệu để duy trì API công khai của file này
export * from './examFormTypes';

// Import các hook và tiện ích cục bộ đã được tách nhỏ
import { createNewExam, normalizeExamData } from './examFormUtils';
import { useExamFormValidation } from './useExamFormValidation';
import { useExamFormActions } from './useExamFormActions';
import type { FormExam } from './examFormTypes';

/**
 * Hook chính để quản lý toàn bộ trạng thái và logic của form tạo/sửa bài thi.
 * Hook này đóng vai trò điều phối, kết hợp các hook nhỏ hơn để cung cấp một giao diện hoàn chỉnh.
 * @param {string} [examId] - ID của bài thi nếu ở chế độ chỉnh sửa.
 * @returns - Một đối tượng chứa state của bài thi, trạng thái tải, lỗi, và tất cả các hàm hành động.
 */
export const useExamForm = (examId?: string) => {
    // State chính cho dữ liệu bài thi, trạng thái tải và lỗi
    const [exam, setExam] = useState<FormExam>(createNewExam());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect để tải dữ liệu ban đầu khi ở chế độ chỉnh sửa
    useEffect(() => {
        if (examId) {
            setLoading(true);
            fetchExamById(examId)
                .then(data => {
                    const normalizedData = normalizeExamData(data);
                    setExam(normalizedData);
                })
                .catch(err => setError('Không thể tải dữ liệu bài thi.'))
                .finally(() => setLoading(false));
        } else {
            setExam(createNewExam());
            setLoading(false);
        }
    }, [examId]);

    // Lấy logic xác thực từ hook chuyên biệt
    const { getValidationError, isFormValid } = useExamFormValidation(exam);
    
    // Lấy tất cả các hàm hành động (thêm, sửa, xóa) từ hook chuyên biệt
    const actions = useExamFormActions(setExam, exam.id);

    // Kết hợp và trả về giao diện hook hoàn chỉnh, nhất quán với phiên bản trước
    return {
        exam,
        loading,
        error,
        isFormValid,
        getValidationError,
        ...actions,
    };
};
