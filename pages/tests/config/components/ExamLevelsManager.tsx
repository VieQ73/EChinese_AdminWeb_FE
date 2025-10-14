
import React, { useState, useMemo } from 'react';
import { ExamType, ExamLevel } from '../../../../types';
import { useAppData } from '../../../../contexts/AppDataContext';
import { PlusIcon, TrashIcon } from 'lucide-react';
import ConfirmationModal from '../../../monetization/components/ConfirmationModal';

interface ExamLevelsManagerProps {
    selectedExamType: ExamType | null;
}

const ExamLevelsManager: React.FC<ExamLevelsManagerProps> = ({ selectedExamType }) => {
    const { examLevels, createExamLevel, deleteExamLevel } = useAppData();
    const [deletingLevel, setDeletingLevel] = useState<ExamLevel | null>(null);
    const [newLevelName, setNewLevelName] = useState('');

    const filteredLevels = useMemo(() => {
        if (!selectedExamType) return [];
        return examLevels.filter(level => level.exam_type_id === selectedExamType.id);
    }, [selectedExamType, examLevels]);

    const handleCreate = async () => {
        if (!newLevelName.trim() || !selectedExamType) return;
        try {
            await createExamLevel({ name: newLevelName, exam_type_id: selectedExamType.id });
            setNewLevelName('');
        } catch (error) {
            alert((error as Error).message);
        }
    };
    
    const handleDelete = async () => {
        if (!deletingLevel) return;
        try {
            await deleteExamLevel(deletingLevel.id);
        } catch(error) {
            alert((error as Error).message);
        } finally {
            setDeletingLevel(null);
        }
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">
                        Cấp độ cho: {selectedExamType ? <span className="text-primary-600">{selectedExamType.name}</span> : '...'}
                    </h3>
                </div>
                {!selectedExamType ? (
                    <div className="p-8 text-center text-gray-500">
                        Vui lòng chọn một loại bài thi để xem các cấp độ.
                    </div>
                ) : (
                    <>
                        <div className="p-4 space-y-2">
                            {filteredLevels.map(level => (
                                <div key={level.id} className="group flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
                                    <span className="font-medium">{level.name}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingLevel(level); }}
                                        className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={`Xóa ${level.name}`}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            ))}
                             {filteredLevels.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có cấp độ nào.</p>}
                        </div>
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex gap-2">
                                <input
                                    value={newLevelName}
                                    onChange={e => setNewLevelName(e.target.value)}
                                    placeholder="Tên cấp độ mới (vd: HSK 7-9)..."
                                    className="flex-grow p-2 border rounded-md text-sm"
                                />
                                <button onClick={handleCreate} className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                    <PlusIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deletingLevel}
                onClose={() => setDeletingLevel(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                confirmText="Xóa"
            >
                <p>Bạn có chắc muốn xóa cấp độ <strong>"{deletingLevel?.name}"</strong> không? Tất cả bài thi liên quan cũng sẽ bị xóa.</p>
            </ConfirmationModal>
        </>
    );
};

export default ExamLevelsManager;
