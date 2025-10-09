import React, { useState } from 'react';
import { Notebook } from '../../../../types';
import Modal from '../../../../components/Modal';

interface AddToNotebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    notebooks: Notebook[];
    onAddToNotebook: (notebookId: string) => void;
}

const AddToNotebookModal: React.FC<AddToNotebookModalProps> = ({ isOpen, onClose, notebooks, onAddToNotebook }) => {
    const [selectedNotebook, setSelectedNotebook] = useState<string>(notebooks[0]?.id || '');

    const handleConfirm = () => {
        if (selectedNotebook) {
            onAddToNotebook(selectedNotebook);
        }
    };
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Thêm từ vựng vào sổ tay"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button onClick={handleConfirm} disabled={!selectedNotebook} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50">Xác nhận</button>
                </>
            }
        >
            <div className="space-y-2">
                <label htmlFor="notebook-select" className="text-sm font-medium text-gray-700">Chọn sổ tay</label>
                <select
                    id="notebook-select"
                    value={selectedNotebook}
                    onChange={(e) => setSelectedNotebook(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                >
                    {notebooks.map(nb => (
                        <option key={nb.id} value={nb.id}>{nb.name}</option>
                    ))}
                </select>
                {notebooks.length === 0 && <p className="text-sm text-gray-500">Chưa có sổ tay nào.</p>}
            </div>
        </Modal>
    );
};

export default AddToNotebookModal;