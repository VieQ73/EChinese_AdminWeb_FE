import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Vocabulary, Notebook } from '../../../types';
import * as api from '../api';

import { TrashIcon, NotebookIcon } from '../../../constants';
import { useVocabSelection } from './hooks/useVocabSelection';
import VocabCardGrid from './components/VocabCardGrid';
import VocabDetailModal from './modals/VocabDetailModal';
import AddVocabularyModal from './modals/AddVocabularyModal';
import AddToNotebookModal from './modals/AddToNotebookModal';
import ErrorReportModal from './modals/ErrorReportModal'; // Import mới
import { ImportVocabModal } from './modals/ImportVocabModal'; // Import mới
import Modal from '../../../components/Modal';
import FloatingBulkActionsBar from '../../../components/FloatingBulkActionsBar';
import VocabularyToolbar from './components/VocabularyToolbar';
import { Loader2 } from 'lucide-react';

import { useAppData } from '../../../contexts/AppDataContext';

// Định nghĩa kiểu cho lỗi chi tiết
interface BulkUpsertError {
    index: number;
    hanzi: string;
    id?: string;
    detail: string;
}

const VocabularyTab: React.FC = () => {
    const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [wordTypeFilter, setWordTypeFilter] = useState<string>('all');
    
    // Modal states
    const [viewingVocab, setViewingVocab] = useState<Vocabulary | null>(null);
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddToNotebookModalOpen, setIsAddToNotebookModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State cho modal import
    const [isImporting, setIsImporting] = useState(false); // State loading cho import

    const { vocabularies } = useAppData();
    // State cho modal báo cáo lỗi
    const [errorReport, setErrorReport] = useState<{ isOpen: boolean; errors: BulkUpsertError[]; message: string }>({
        isOpen: false,
        errors: [],
        message: '',
    });
    
    // Debounce search term để tối ưu performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    // Filter vocabulary list based on all filters
    const filteredVocabList = useMemo(() => {
        return vocabList.filter(vocab => {
            // Search filter - sử dụng debouncedSearchTerm
            const matchesSearch = debouncedSearchTerm === '' || 
                vocab.hanzi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                vocab.pinyin.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                vocab.meaning.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            // Level filter
            const matchesLevel = levelFilter === 'all' || 
                vocab.level.some(level => level === levelFilter);
            
            // Word type filter
            const matchesWordType = wordTypeFilter === 'all' || 
                vocab.word_types.some(type => type === wordTypeFilter);
            
            return matchesSearch && matchesLevel && matchesWordType;
        });
    }, [vocabList, debouncedSearchTerm, levelFilter, wordTypeFilter]);
    
    const { selectedVocabs, handleSelect, handleSelectAll, clearSelection } = useVocabSelection(filteredVocabList);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [vocabRes, notebookRes] = await Promise.all([
                api.fetchVocabularies({ limit: 5000 }), // Load all vocabulary and filter client-side
                api.fetchNotebooks({ limit: 5000 }) // Tải tất cả sổ tay cho modal
            ]);
            console.log(vocabRes.data);
            
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
        } catch (error: any) {
            if (error.details) {
                // Nếu có lỗi chi tiết từ API, hiển thị modal lỗi
                setErrorReport({
                    isOpen: true,
                    errors: error.details,
                    message: error.message,
                });
            } else {
                // Lỗi chung
                alert("Lưu từ vựng thất bại: " + error.message);
            }
            // Ném lại lỗi để hàm gọi có thể xử lý
            throw error;
        }
    };

    const handleImportVocab = async (data: Partial<Vocabulary>[]) => {
        setIsImporting(true);
        try {
            await handleSaveVocab(data);
            // Nếu không có lỗi, đóng modal import
            setIsImportModalOpen(false);
        } catch (error) {
            // Nếu có lỗi (đã được xử lý và hiển thị modal error trong handleSaveVocab),
            // không đóng modal import để người dùng có thể thử lại với file khác nếu muốn.
            console.error("Import failed but error report is shown.", error);
        } finally {
            setIsImporting(false);
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
            <ImportVocabModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportVocab}
                isLoading={isImporting}
            />
            <ErrorReportModal 
                isOpen={errorReport.isOpen}
                onClose={() => setErrorReport({ isOpen: false, errors: [], message: '' })}
                errors={errorReport.errors}
                message={errorReport.message}
            />
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
                    onImport={() => setIsImportModalOpen(true)}
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