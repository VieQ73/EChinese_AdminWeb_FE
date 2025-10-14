
import React, { useState } from 'react';
import { ExamType } from '../../../../types';
import { useAppData } from '../../../../contexts/AppDataContext';
import { PlusIcon, TrashIcon } from 'lucide-react';
import ConfirmationModal from '../../../monetization/components/ConfirmationModal';

interface ExamTypesManagerProps {
    selectedExamType: ExamType | null;
    onSelectExamType: (examType: ExamType | null) => void;
}

const ExamTypesManager: React.FC<ExamTypesManagerProps> = ({ selectedExamType, onSelectExamType }) => {
    const { examTypes, createExamType, deleteExamType } = useAppData();
    const [deletingType, setDeletingType] = useState<ExamType | null>(null);
    const [newTypeName, setNewTypeName] = useState('');

    const handleCreate = async () => {
        if (!newTypeName.trim()) return;
        try {
            await createExamType({ name: newTypeName });
            setNewTypeName('');
        } catch (error) {
            alert((error as Error).message);
        }
    };
    
    const handleDelete = async () => {
        if (!deletingType) return;
        try {
            await deleteExamType(deletingType.id);
            onSelectExamType(null); // Bỏ chọn nếu loại đang chọn bị xóa
        } catch (error) {
             alert((error as Error).message);
        } finally {
            setDeletingType(null);
        }
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Các loại bài thi</h3>
                </div>
                <div className="p-4 space-y-2">
                    {examTypes.map(type => (
                        <div
                            key={type.id}
                            className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedExamType?.id === type.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                            onClick={() => onSelectExamType(type)}
                        >
                            <span className="font-medium">{type.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeletingType(type); }}
                                className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={`Xóa ${type.name}`}
                            >
                                <TrashIcon size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                        <input
                            value={newTypeName}
                            onChange={e => setNewTypeName(e.target.value)}
                            placeholder="Tên loại thi mới..."
                            className="flex-grow p-2 border rounded-md text-sm"
                        />
                        <button onClick={handleCreate} className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                            <PlusIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!deletingType}
                onClose={() => setDeletingType(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                confirmText="Xóa"
            >
                <p>Bạn có chắc muốn xóa loại bài thi <strong>"{deletingType?.name}"</strong> không? Tất cả cấp độ và bài thi liên quan cũng sẽ bị xóa.</p>
            </ConfirmationModal>
        </>
    );
};

export default ExamTypesManager;
