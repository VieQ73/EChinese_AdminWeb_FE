import React, { useState, useEffect } from 'react';
import { Notebook } from '../../../../types';
import Modal from '../../../../components/Modal';

interface AddToNotebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    notebooks: Notebook[];
    onAddToNotebook: (notebookId: string) => void;
    onAddByLevel?: (notebookId: string, levels: string[]) => void;
    mode?: 'selected' | 'byLevel'; // Chế độ: thêm từ đã chọn hoặc thêm theo cấp độ
}

const AddToNotebookModal: React.FC<AddToNotebookModalProps> = ({ 
    isOpen, 
    onClose, 
    notebooks, 
    onAddToNotebook,
    onAddByLevel,
    mode = 'selected'
}) => {
    const [selectedNotebook, setSelectedNotebook] = useState<string>('');
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [excludeExisting, setExcludeExisting] = useState<boolean>(true);

    // Cập nhật selectedNotebook khi modal mở hoặc notebooks thay đổi
    useEffect(() => {
        if (isOpen && notebooks.length > 0 && !selectedNotebook) {
            setSelectedNotebook(notebooks[0].id);
        }
    }, [isOpen, notebooks]);

    // Reset state khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setSelectedLevels([]);
            setExcludeExisting(true);
        }
    }, [isOpen]);

    const handleLevelToggle = (level: string) => {
        setSelectedLevels(prev => 
            prev.includes(level) 
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const handleConfirm = () => {
        if (!selectedNotebook) {
            alert('Vui lòng chọn sổ tay');
            return;
        }
        
        // Kiểm tra notebook ID có hợp lệ không
        const notebook = notebooks.find(nb => nb.id === selectedNotebook);
        if (!notebook) {
            alert('Sổ tay không hợp lệ');
            return;
        }
        
        if (mode === 'byLevel' && onAddByLevel) {
            if (selectedLevels.length === 0) {
                alert('Vui lòng chọn ít nhất một cấp độ');
                return;
            }
            console.log('Adding by level:', { notebookId: selectedNotebook, levels: selectedLevels });
            onAddByLevel(selectedNotebook, selectedLevels);
        } else {
            console.log('Adding selected vocabs to notebook:', selectedNotebook);
            onAddToNotebook(selectedNotebook);
        }
    };
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={mode === 'byLevel' ? 'Thêm từ vựng theo cấp độ' : 'Thêm từ vựng vào sổ tay'}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!selectedNotebook || (mode === 'byLevel' && selectedLevels.length === 0)} 
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                        Xác nhận
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="notebook-select" className="text-sm font-medium text-gray-700">Chọn sổ tay</label>
                    <select
                        id="notebook-select"
                        value={selectedNotebook}
                        onChange={(e) => {
                            console.log('Selected notebook ID:', e.target.value);
                            setSelectedNotebook(e.target.value);
                        }}
                        className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        {notebooks.length === 0 && <option value="">Không có sổ tay</option>}
                        {notebooks.map(nb => (
                            <option key={nb.id} value={nb.id}>
                                {nb.name} (ID: {nb.id.substring(0, 8)}...)
                            </option>
                        ))}
                    </select>
                    {notebooks.length === 0 && <p className="text-sm text-gray-500 mt-1">Chưa có sổ tay nào.</p>}
                </div>

                {mode === 'byLevel' && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Chọn cấp độ (HSK)</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelToggle(level)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                            selectedLevels.includes(level)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="exclude-existing"
                                checked={excludeExisting}
                                onChange={(e) => setExcludeExisting(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="exclude-existing" className="ml-2 text-sm text-gray-700">
                                Bỏ qua từ đã có trong sổ tay
                            </label>
                        </div>

                        {selectedLevels.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Đã chọn:</span> {selectedLevels.join(', ')}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default AddToNotebookModal;