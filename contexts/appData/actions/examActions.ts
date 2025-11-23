// contexts/appData/actions/examActions.ts
import { useCallback } from 'react';
import { ExamType, ExamLevel, Exam } from '../../../types';
import * as configApi from '../../../pages/tests/api/configApi';
import * as examsApi from '../../../pages/tests/api/examsApi';
import type { AddAdminLogPayload } from '../types';
import { cacheService } from '../../../services/cacheService';

interface UseExamActionsProps {
  setExamTypes: React.Dispatch<React.SetStateAction<ExamType[]>>;
  setExamLevels: React.Dispatch<React.SetStateAction<ExamLevel[]>>;
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>; // Thêm setter cho exams
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useExamActions = ({ setExamTypes, setExamLevels, setExams, addAdminLog }: UseExamActionsProps) => {

  // --- Exam Types ---
  const createExamType = useCallback(async (payload: configApi.ExamTypePayload) => {
    const newType = await configApi.createExamType(payload);
    setExamTypes(prev => [newType, ...prev]);
    addAdminLog({ action_type: 'CREATE_EXAM_TYPE', target_id: newType.id, description: `Tạo loại bài thi mới: ${newType.name}` });
  }, [setExamTypes, addAdminLog]);

  const deleteExamType = useCallback(async (id: string) => {
    const typeToDelete = (await configApi.fetchExamTypes()).find(t => t.id === id);
    await configApi.deleteExamType(id);
    setExamTypes(prev => prev.filter(t => t.id !== id));
    setExamLevels(prev => prev.filter(l => l.exam_type_id !== id));
    if (typeToDelete) {
        addAdminLog({ action_type: 'DELETE_EXAM_TYPE', target_id: id, description: `Xóa loại bài thi: ${typeToDelete.name}` });
    }
  }, [setExamTypes, setExamLevels, addAdminLog]);

  // --- Exam Levels ---
  const createExamLevel = useCallback(async (payload: configApi.ExamLevelPayload) => {
    const newLevel = await configApi.createExamLevel(payload);
    setExamLevels(prev => [newLevel, ...prev]);
    addAdminLog({ action_type: 'CREATE_EXAM_LEVEL', target_id: newLevel.id, description: `Tạo cấp độ mới: ${newLevel.name}` });
  }, [setExamLevels, addAdminLog]);

  const deleteExamLevel = useCallback(async (id: string) => {
    const levelToDelete = (await configApi.fetchExamLevels()).find(l => l.id === id);
    await configApi.deleteExamLevel(id);
    setExamLevels(prev => prev.filter(l => l.id !== id));
    if (levelToDelete) {
        addAdminLog({ action_type: 'DELETE_EXAM_LEVEL', target_id: id, description: `Xóa cấp độ: ${levelToDelete.name}` });
    }
  }, [setExamLevels, addAdminLog]);

  // --- Exams ---
  const createExam = useCallback(async (payload: examsApi.ExamPayload) => {
      const newExam = await examsApi.createExam(payload);
      setExams(prev => [newExam, ...prev]);
      addAdminLog({ action_type: 'CREATE_EXAM', target_id: newExam.id, description: `Tạo bài thi mới: ${newExam.name}` });
      cacheService.invalidateExams();
      return newExam;
  }, [setExams, addAdminLog]);

  const updateExam = useCallback(async (id: string, payload: Partial<examsApi.ExamPayload>) => {
      const result = await examsApi.updateExam(id, payload);
      
      // Xử lý response: có thể là 1 exam hoặc mảng exams
      const examsToUpdate = Array.isArray(result) ? result : [result];
      
      // Cập nhật state:
      // - Nếu trả về 1 exam: cập nhật exam đó
      // - Nếu trả về 2 exams: cập nhật exam cũ + thêm exam mới vào đầu danh sách
      setExams(prev => {
          if (Array.isArray(result) && result.length > 1) {
              // Trường hợp có 2 exams (exam cũ + exam mới)
              const [oldExam, newExam] = result;
              
              // Cập nhật exam cũ và thêm exam mới vào đầu
              const updated = prev.map(e => e.id === oldExam.id ? oldExam : e);
              
              // Kiểm tra xem exam mới đã tồn tại chưa
              const newExamExists = updated.some(e => e.id === newExam.id);
              
              if (!newExamExists) {
                  // Thêm exam mới vào đầu danh sách
                  return [newExam, ...updated];
              }
              
              return updated;
          } else {
              // Trường hợp chỉ có 1 exam: cập nhật bình thường
              const examToUpdate = Array.isArray(result) ? result[0] : result;
              return prev.map(e => e.id === examToUpdate.id ? examToUpdate : e);
          }
      });
      
      // Tạo log cụ thể hơn cho các hành động quan trọng
      const mainExam = Array.isArray(result) ? result[0] : result;
      let action_type = 'UPDATE_EXAM';
      let description = `Cập nhật chi tiết bài thi: ${mainExam.name}`;

      // Ghi log cụ thể cho hành động Xuất bản / Hủy xuất bản
      if (payload.is_published !== undefined) {
          if (payload.is_published) {
              action_type = 'PUBLISH_EXAM';
              description = `Xuất bản bài thi: ${mainExam.name}`;
          } else {
              action_type = 'UNPUBLISH_EXAM';
              description = `Hủy xuất bản bài thi: ${mainExam.name}`;
          }
      }
      
      // Nếu có nhiều exams (tạo bản sao), ghi log đặc biệt
      if (Array.isArray(result) && result.length > 1) {
          description += ` (Đã tạo bản sao mới vì bài thi cũ đã có người làm)`;
      }
      
      addAdminLog({ action_type, target_id: id, description });
      cacheService.invalidateExams();
      return result;
  }, [setExams, addAdminLog]);

  const publishExam = useCallback(async (id: string) => {
      const updated = await examsApi.publishExam(id);
      setExams(prev => prev.map(e => e.id === id ? updated : e));
      addAdminLog({ action_type: 'PUBLISH_EXAM', target_id: id, description: `Xuất bản bài thi: ${updated.name}` });
      return updated;
  }, [setExams, addAdminLog]);

  const unpublishExam = useCallback(async (id: string) => {
      const updated = await examsApi.unpublishExam(id);
      setExams(prev => prev.map(e => e.id === id ? updated : e));
      addAdminLog({ action_type: 'UNPUBLISH_EXAM', target_id: id, description: `Hủy xuất bản bài thi: ${updated.name}` });
      return updated;
  }, [setExams, addAdminLog]);
  
  const deleteExam = useCallback(async (id: string) => {
      const examToDelete = (await examsApi.fetchExams()).data.find(e => e.id === id);
      await examsApi.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
      if (examToDelete) {
          addAdminLog({ action_type: 'DELETE_EXAM', target_id: id, description: `Xóa bài thi: ${examToDelete.name}` });
      }
      cacheService.invalidateExams();
  }, [setExams, addAdminLog]);

  const duplicateExam = useCallback(async (id: string, newName: string) => {
      const newExam = await examsApi.duplicateExam(id, newName);
      setExams(prev => [newExam, ...prev]);
      addAdminLog({ action_type: 'DUPLICATE_EXAM', target_id: newExam.id, description: `Sao chép bài thi từ (ID: ${id}) thành: ${newName}` });
      return newExam; // Trả về bài thi mới
  }, [setExams, addAdminLog]);

  const trashExam = useCallback(async (id: string) => {
      const updatedExam = await examsApi.trashExam(id);
      setExams(prev => prev.map(e => e.id === id ? { ...e, ...updatedExam } : e));
      addAdminLog({ action_type: 'TRASH_EXAM', target_id: id, description: `Chuyển bài thi vào thùng rác: ${updatedExam.name}` });
      return updatedExam;
  }, [setExams, addAdminLog]);

  const restoreExam = useCallback(async (id: string) => {
      const updatedExam = await examsApi.restoreExam(id);
      setExams(prev => prev.map(e => e.id === id ? { ...e, ...updatedExam } : e));
      addAdminLog({ action_type: 'RESTORE_EXAM', target_id: id, description: `Khôi phục bài thi: ${updatedExam.name}` });
      return updatedExam;
  }, [setExams, addAdminLog]);

  return { 
      createExamType, 
      deleteExamType, 
      createExamLevel, 
      deleteExamLevel,
      createExam,
      updateExam,
      publishExam,
      unpublishExam,
      deleteExam,
      duplicateExam,
      trashExam,
      restoreExam,
  };
};