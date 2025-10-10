import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Vocabulary, Notebook } from '../../../types';
import * as api from '../api';

import { TrashIcon, NotebookIcon } from '../../../constants';
import { useVocabSelection } from './hooks/useVocabSelection';
import VocabCardGrid from './components/VocabCardGrid';
import VocabDetailModal from './modals/VocabDetailModal';
import AddVocabularyModal from './modals/AddVocabularyModal';
import AddToNotebookModal from './modals/AddToNotebookModal';
import Modal from '../../../components/Modal';
import FloatingBulkActionsBar from '../../../components/FloatingBulkActionsBar';
import VocabularyToolbar from './components/VocabularyToolbar';
import { Loader2 } from 'lucide-react';

const VocabularyTab: React.FC = () => {
    const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [wordTypeFilter, setWordTypeFilter] = useState<string>('all');
    
    // Modal states
    const [viewingVocab, setViewingVocab] = useState<Vocabulary | null>(null);
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddToNotebookModalOpen, setIsAddToNotebookModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    
    // Filter vocabulary list based on all filters
    const filteredVocabList = useMemo(() => {
        return vocabList.filter(vocab => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                vocab.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vocab.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Level filter
            const matchesLevel = levelFilter === 'all' || 
                vocab.level.some(level => level === levelFilter);
            
            // Word type filter
            const matchesWordType = wordTypeFilter === 'all' || 
                vocab.word_types.some(type => type === wordTypeFilter);
            
            return matchesSearch && matchesLevel && matchesWordType;
        });
    }, [vocabList, searchTerm, levelFilter, wordTypeFilter]);
    
    const { selectedVocabs, handleSelect, handleSelectAll, clearSelection } = useVocabSelection(filteredVocabList);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [vocabRes, notebookRes] = await Promise.all([
                api.fetchVocabularies({ limit: 1000 }), // Load all vocabulary and filter client-side
                api.fetchNotebooks({ limit: 1000 }) // Tải tất cả sổ tay cho modal
            ]);
            setVocabList(vocabRes.data);
            setNotebooks(notebookRes.data);
        } catch (error) {
            console.error("Failed to load vocabulary data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const handleOpenAddModal = () => {
        setEditingVocab(null);
        setIsAddModalOpen(true);
    };

    const handleEdit = (vocab: Vocabulary) => {
        setEditingVocab(vocab);
        setIsAddModalOpen(true);
    };

    const handleSaveVocab = async (savedVocabs: Partial<Vocabulary>[]) => {
        try {
            await api.createOrUpdateVocabs(savedVocabs);
            setIsAddModalOpen(false);
            setEditingVocab(null);
            loadData(); // Tải lại
        } catch (error) {
            alert("Lưu từ vựng thất bại.");
        }
    };

    const handleDelete = async () => {
        try {
            await api.deleteVocabularies(Array.from(selectedVocabs));
            setIsDeleteConfirmModalOpen(false);
            loadData(); // Tải lại
        } catch (error) {
            alert("Xóa từ vựng thất bại.");
        }
    };

    const handleAddToNotebook = async (notebookId: string) => {
        try {
            const { addedCount } = await api.addVocabsToNotebook(notebookId, Array.from(selectedVocabs));
            setIsAddToNotebookModalOpen(false);
            clearSelection();
            // Tải lại notebooks để cập nhật vocab_count, hoặc cập nhật state thủ công
            const notebookRes = await api.fetchNotebooks({ limit: 1000 });
            setNotebooks(notebookRes.data);
            alert(`Đã thêm thành công ${addedCount} từ vựng mới vào sổ tay!`);
        } catch (error) {
            alert("Thêm vào sổ tay thất bại.");
        }
    };

    return (
        <div className="space-y-6 pb-24">
            {viewingVocab && <VocabDetailModal vocab={viewingVocab} onClose={() => setViewingVocab(null)} onEdit={handleEdit} />}
            <AddVocabularyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleSaveVocab} editingVocab={editingVocab} showSearch={false}/>
            <AddToNotebookModal isOpen={isAddToNotebookModalOpen} onClose={() => setIsAddToNotebookModalOpen(false)} onAddToNotebook={handleAddToNotebook} notebooks={notebooks} />
            <Modal isOpen={isDeleteConfirmModalOpen} onClose={() => setIsDeleteConfirmModalOpen(false)} title="Xác nhận xóa" footer={
                <>
                    <button onClick={() => setIsDeleteConfirmModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700">Xóa vĩnh viễn</button>
                </>
            }>
                <p>Bạn có chắc muốn xóa vĩnh viễn <span className="font-bold">{selectedVocabs.size}</span> từ đã chọn?</p>
                <p className="text-sm text-red-600 mt-1">Hành động này sẽ xóa từ vựng khỏi hệ thống và tất cả các sổ tay. Không thể hoàn tác.</p>
            </Modal>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <VocabularyToolbar 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    levelFilter={levelFilter} 
                    onLevelFilterChange={setLevelFilter}
                    wordTypeFilter={wordTypeFilter}
                    onWordTypeFilterChange={setWordTypeFilter}
                    onAdd={handleOpenAddModal} 
                    onImport={() => alert('Chức năng Import sẽ được phát triển sau!')}
                    isSelectable={true}
                    isAllSelected={filteredVocabList.length > 0 && selectedVocabs.size === filteredVocabList.length}
                    onSelectAll={handleSelectAll}
                />
                
                {loading ? (
                     <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>
                ) : (
                    <VocabCardGrid vocabItems={filteredVocabList} selectedVocabs={selectedVocabs} onSelect={handleSelect} onSelectAll={handleSelectAll} onViewDetails={setViewingVocab} isSelectable={true}/>
                )}
            </div>

            <FloatingBulkActionsBar isVisible={selectedVocabs.size > 0} selectedCount={selectedVocabs.size} onClearSelection={clearSelection}>
                <button onClick={() => setIsAddToNotebookModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    <NotebookIcon className="w-4 h-4 mr-1.5"/> Thêm vào sổ tay
                </button>
                <button onClick={() => setIsDeleteConfirmModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    <TrashIcon className="w-4 h-4 mr-1.5"/> Xóa vĩnh viễn
                </button>
            </FloatingBulkActionsBar>
        </div>
    );
};

export default VocabularyTab;