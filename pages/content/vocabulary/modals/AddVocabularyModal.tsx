import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../../components/Modal';
import { Vocabulary } from '../../../../types';
import { mockVocab } from '../../../../mock';
import VocabFormCard from '../components/VocabFormCard';
import { PlusIcon } from '../../../../constants';

interface AddVocabularyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vocabs: Vocabulary[]) => void;
    editingVocab?: Vocabulary | null;
    showSearch?: boolean;
}

const createEmptyVocab = (): Omit<Vocabulary, 'id'> => ({
    hanzi: '',
    pinyin: '',
    meaning: '',
    notes: '',
    level: [],
    word_types: [],
    image_url: ''
});

const AddVocabularyModal: React.FC<AddVocabularyModalProps> = ({ isOpen, onClose, onSubmit, editingVocab, showSearch = true }) => {
    const [vocabForms, setVocabForms] = useState<Partial<Vocabulary>[]>([createEmptyVocab()]);
    const [search, setSearch] = useState('');
    
    const searchResults = useMemo(() => {
        if (!search.trim()) return [];
        return mockVocab.filter(v => 
            v.hanzi.includes(search) || v.meaning.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 5); // Giới hạn 5 kết quả
    }, [search]);

    useEffect(() => {
        if (isOpen) {
            if (editingVocab) {
                setVocabForms([editingVocab]);
            } else {
                setVocabForms([createEmptyVocab()]);
            }
            setSearch('');
        }
    }, [isOpen, editingVocab]);

    const handleSelectSearchResult = (vocab: Vocabulary) => {
        setVocabForms([vocab]);
        setSearch('');
    };

    const updateForm = (index: number, updatedField: Partial<Vocabulary>) => {
        setVocabForms(prev => 
            prev.map((form, i) => i === index ? { ...form, ...updatedField } : form)
        );
    };

    const addFormCard = () => {
        if (vocabForms.length < 10) {
            setVocabForms(prev => [...prev, createEmptyVocab()]);
        }
    };

    const removeFormCard = (index: number) => {
        if (vocabForms.length > 1) {
            setVocabForms(prev => prev.filter((_, i) => i !== index));
        }
    };

    const isFormValid = () => {
        return vocabForms.every(form => form.hanzi && form.pinyin && form.meaning && form.level && form.level.length > 0 && form.word_types && form.word_types.length > 0);
    };

    const handleSubmit = () => {
        if (isFormValid()) {
            const vocabsToSubmit = vocabForms.map(form => ({
                ...createEmptyVocab(),
                ...form,
                id: form.id || `v${Date.now()}${Math.random()}`,
            })) as Vocabulary[];
            onSubmit(vocabsToSubmit);
        } else {
            alert("Vui lòng điền đầy đủ các trường bắt buộc (Hán tự, Pinyin, Nghĩa, Cấp độ, Loại từ) cho tất cả các thẻ.");
        }
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50" disabled={!isFormValid()}>Lưu</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingVocab ? "Sửa từ vựng" : "Thêm từ vựng mới"} footer={footer}>
            {showSearch && !editingVocab && (
                <div className="mb-4 relative">
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tra cứu từ có sẵn (theo Hán tự/nghĩa)..."
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                            {searchResults.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => handleSelectSearchResult(v)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <span className="font-bold">{v.hanzi}</span> - <span>{v.meaning}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {vocabForms.map((form, index) => (
                    <VocabFormCard
                        key={form.id || index}
                        index={index}
                        vocabData={form}
                        onUpdate={updateForm}
                        onRemove={removeFormCard}
                        canRemove={vocabForms.length > 1 && !editingVocab}
                    />
                ))}
                 {!editingVocab && vocabForms.length < 10 && (
                    <button onClick={addFormCard} className="w-full flex items-center justify-center p-2.5 text-sm font-medium text-primary-600 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Thêm thẻ từ vựng khác
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default AddVocabularyModal;