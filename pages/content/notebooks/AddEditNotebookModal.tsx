
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { Notebook } from '../../../types';

interface AddEditNotebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notebook: Omit<Notebook, 'id' | 'created_at' | 'vocab_count'>) => void;
    notebook: Notebook | null;
}

const AddEditNotebookModal: React.FC<AddEditNotebookModalProps> = ({ isOpen, onClose, onSave, notebook }) => {
    const [name, setName] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [status, setStatus] = useState<'published' | 'draft'>('draft');
    
    useEffect(() => {
        if (notebook) {
            setName(notebook.name);
            setIsPremium(notebook.is_premium);
            setStatus(notebook.status);
        } else {
            setName('');
            setIsPremium(false);
            setStatus('draft');
        }
    }, [notebook, isOpen]);

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                name: name.trim(),
                is_premium: isPremium,
                status,
                options: {}, // Default options
            });
        }
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50" disabled={!name.trim()}>Lưu</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={notebook ? "Sửa Sổ tay" : "Tạo Sổ tay mới"} footer={footer}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="notebook-name" className="block text-sm font-medium text-gray-700 mb-1">Tên Sổ tay</label>
                    <input
                        type="text"
                        id="notebook-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ví dụ: Sổ tay HSK 5"
                    />
                </div>
                <div>
                    <label htmlFor="notebook-status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                     <select
                        id="notebook-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input
                        id="is-premium"
                        type="checkbox"
                        checked={isPremium}
                        onChange={(e) => setIsPremium(e.target.checked)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is-premium" className="ml-2 block text-sm text-gray-900">Đây là sổ tay Premium</label>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditNotebookModal;