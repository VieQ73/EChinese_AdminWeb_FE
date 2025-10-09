import React, { useState } from 'react';
import { Vocabulary } from '../../../../types';
import { mockVocab } from '../../../../mock';
import Modal from '../../../../components/Modal';

interface BulkAddVocabModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Changed prop type to void to match parent's async handler. The parent will now handle alerts and closing.
    onAddVocabs: (vocabs: Vocabulary[]) => void;
}

type AddMode = 'json' | 'level';

const BulkAddVocabModal: React.FC<BulkAddVocabModalProps> = ({ isOpen, onClose, onAddVocabs }) => {
    const [mode, setMode] = useState<AddMode>('level');
    const [selectedLevel, setSelectedLevel] = useState('HSK1');
    const [jsonInput, setJsonInput] = useState('');

    const handleAdd = () => {
        let vocabsToAdd: Vocabulary[] = [];
        if (mode === 'level') {
            vocabsToAdd = mockVocab.filter(v => v.level.includes(selectedLevel));
        } else {
            try {
                const parsed = JSON.parse(jsonInput);
                if (Array.isArray(parsed)) {
                    // Cần validate thêm ở đây trong thực tế
                    vocabsToAdd = parsed;
                } else {
                    alert("JSON không hợp lệ, cần phải là một mảng từ vựng.");
                    return;
                }
            } catch (error) {
                alert("Lỗi phân tích JSON.");
                return;
            }
        }

        if (vocabsToAdd.length > 0) {
            // FIX: The parent component now handles the async logic, alerts, and closing the modal.
            onAddVocabs(vocabsToAdd);
        } else {
            alert("Không có từ vựng nào để thêm.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm từ vựng hàng loạt">
            <div className="space-y-4">
                <div className="flex border-b">
                    <button 
                        onClick={() => setMode('level')}
                        className={`px-4 py-2 text-sm font-medium ${mode === 'level' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
                    >
                        Thêm theo cấp độ
                    </button>
                    <button 
                        onClick={() => setMode('json')}
                        className={`px-4 py-2 text-sm font-medium ${mode === 'json' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
                    >
                        Import file JSON
                    </button>
                </div>

                {mode === 'level' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Chọn cấp độ HSK</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                        >
                            {['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">Thêm tất cả các từ vựng thuộc cấp độ đã chọn vào sổ tay. Các từ đã có sẽ được bỏ qua.</p>
                    </div>
                )}
                
                {mode === 'json' && (
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Dán nội dung JSON</label>
                         <textarea
                            rows={8}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                            placeholder='[{"hanzi": "你好", "pinyin": "nǐ hǎo", ...}]'
                         />
                         <p className="text-xs text-gray-500">Dán một mảng các đối tượng từ vựng. Mỗi từ phải có các trường bắt buộc.</p>
                    </div>
                )}
                
                 <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleAdd}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm"
                    >
                        Thêm vào sổ tay
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkAddVocabModal;