import React, { useState, useMemo, useEffect, useCallback } from 'react';
//  Changed imports of `useParams` and `useNavigate` from `react-router-dom` to `react-router` to resolve module export errors.
import { useParams, useNavigate } from 'react-router';
import { Notebook, Vocabulary, PaginatedResponse } from '../../types';
import * as api from './api';
//  Import Loader2 from lucide-react instead of constants
import { ArrowLeftIcon, PlusIcon, TrashIcon, UploadIcon } from '../../constants';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal';
import AddVocabularyModal from './vocabulary/modals/AddVocabularyModal';
import FloatingBulkActionsBar from '../../components/FloatingBulkActionsBar';
import { useVocabSelection } from './vocabulary/hooks/useVocabSelection';
import VocabCardGrid from './vocabulary/components/VocabCardGrid';
import VocabDetailModal from './vocabulary/modals/VocabDetailModal';
import BulkAddVocabModal from './vocabulary/modals/BulkAddVocabModal';
import NotebookDetailToolbar from './notebooks/NotebookDetailToolbar';

const NotebookDetail: React.FC = () => {
    const { notebookId } = useParams<{ notebookId: string }>();
    const navigate = useNavigate();

    const [notebook, setNotebook] = useState<Notebook | null>(null);
    const [vocabItems, setVocabItems] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [wordTypeFilter, setWordTypeFilter] = useState<string>('all');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    
    const [viewingVocab, setViewingVocab] = useState<Vocabulary | null>(null);
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(50); // Số items mỗi trang (có thể thay đổi)

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset về trang 1 khi search
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    // Reset page khi filter hoặc itemsPerPage thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [levelFilter, wordTypeFilter, itemsPerPage]);

    const loadData = useCallback(async () => {
        if (!notebookId) return;
        setLoading(true);
        try {
            // Build query params
            const params: any = {
                notebookId,
                page: currentPage,
                limit: itemsPerPage
            };
            
            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }
            
            if (levelFilter !== 'all') {
                params.level = levelFilter;
            }

            const [notebookData, vocabData] = await Promise.all([
                api.fetchNotebookById(notebookId),
                api.fetchVocabularies(params)
            ]);
            
            setNotebook(notebookData);
            setVocabItems(vocabData.data);
            
            // Update pagination info
            if (vocabData.meta) {
                setTotalPages(vocabData.meta.totalPages || 1);
                setTotalItems(vocabData.meta.total || 0);
            }
        } catch (error) {
            console.error("Failed to load notebook details:", error);
            setNotebook(null); // Để hiển thị thông báo lỗi
        } finally {
            setLoading(false);
        }
    }, [notebookId, currentPage, itemsPerPage, debouncedSearchTerm, levelFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Filter chỉ áp dụng cho word_type vì search và level đã được xử lý ở server
    const filteredVocab = useMemo(() => {
        return vocabItems.filter(vocab => {
            // Word type filter (client-side vì API không hỗ trợ)
            const matchesWordType = wordTypeFilter === 'all' || 
                vocab.word_types.some(type => type === wordTypeFilter);
            
            return matchesWordType;
        });
    }, [vocabItems, wordTypeFilter]);
    
    const { selectedVocabs, handleSelect, handleSelectAll, clearSelection } = useVocabSelection(filteredVocab);

    const handleOpenAddModal = () => {
        setEditingVocab(null);
        setIsAddModalOpen(true);
    };

    const handleEdit = (vocab: Vocabulary) => {
        setEditingVocab(vocab);
        setIsAddModalOpen(true);
    };
    
    const handleViewDetails = (vocab: Vocabulary) => {
        setViewingVocab(vocab);
    };

    const handleRemoveFromNotebook = async () => {
        if (!notebookId) return;
        try {
            await api.removeVocabsFromNotebook(notebookId, Array.from(selectedVocabs));
            setIsDeleteModalOpen(false);
            loadData(); // Tải lại dữ liệu
        } catch (error) {
            alert("Xóa từ vựng khỏi sổ tay thất bại.");
        }
    };
    
    const addVocabsToNotebook = async (newVocabs: Vocabulary[]) => {
        if (!notebookId) return { addedCount: 0 };
        const vocabIds = newVocabs.map(v => v.id);
        const { addedCount } = await api.addVocabsToNotebook(notebookId, vocabIds);
        return { addedCount };
    };

    const handleSaveVocabsFromModal = async (savedVocabs: Partial<Vocabulary>[]) => {
        try {
            const createdOrUpdatedVocabs = await api.createOrUpdateVocabs(savedVocabs);
            await addVocabsToNotebook(createdOrUpdatedVocabs);
            setIsAddModalOpen(false);
            setEditingVocab(null);
            loadData(); // Tải lại
        } catch(error) {
            alert("Lưu và thêm từ vựng thất bại.");
        }
    };
    
    const handleBulkAdd = async (vocabsToAdd: Vocabulary[]) => {
         try {
            const { addedCount } = await addVocabsToNotebook(vocabsToAdd);
            alert(`Đã thêm thành công ${addedCount} từ vựng mới vào sổ tay.`);
            setIsBulkAddModalOpen(false);
            loadData();
        } catch (error) {
             alert("Thêm hàng loạt thất bại.");
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600"/></div>;
    }

    if (!notebook) {
        return <div className="p-6">Không tìm thấy sổ tay. <button onClick={() => navigate('/notebooks')} className="text-primary-600">Quay lại</button></div>;
    }

    return (
        <div className="space-y-6 pb-24">
             <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận xóa" footer={
                <div className="space-x-2">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button onClick={handleRemoveFromNotebook} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700">Xóa khỏi sổ tay</button>
                </div>
            }>
                <p>Bạn có chắc chắn muốn xóa <span className="font-bold">{selectedVocabs.size}</span> từ đã chọn khỏi sổ tay này không?</p>
                <p className="text-sm text-gray-500 mt-1">Hành động này sẽ không xóa từ vựng khỏi hệ thống.</p>
            </Modal>
            
            <AddVocabularyModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingVocab(null); }} onSubmit={handleSaveVocabsFromModal} editingVocab={editingVocab} showSearch={true}/>
            <BulkAddVocabModal isOpen={isBulkAddModalOpen} onClose={() => setIsBulkAddModalOpen(false)} onAddVocabs={handleBulkAdd}/>

            {viewingVocab && <VocabDetailModal vocab={viewingVocab} onClose={() => setViewingVocab(null)} onEdit={handleEdit}/>}

            <div>
                 <button onClick={() => navigate('/notebooks')} className="flex items-center text-primary-600 mb-4 font-medium hover:underline"><ArrowLeftIcon className="w-5 h-5 mr-2" />Quay lại danh sách Sổ tay</button>
                <div className="md:flex md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{notebook.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">Tổng số: {notebook.vocab_count} từ vựng</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                 <NotebookDetailToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    levelFilter={levelFilter}
                    onLevelFilterChange={setLevelFilter}
                    wordTypeFilter={wordTypeFilter}
                    onWordTypeFilterChange={setWordTypeFilter}
                    onAdd={handleOpenAddModal}
                    onBulkAdd={() => setIsBulkAddModalOpen(true)}
                    isSelectable={true}
                    isAllSelected={filteredVocab.length > 0 && selectedVocabs.size === filteredVocab.length}
                    onSelectAll={handleSelectAll}
                 />
                 
                 <VocabCardGrid vocabItems={filteredVocab} selectedVocabs={selectedVocabs} onSelect={handleSelect} onSelectAll={handleSelectAll} onViewDetails={handleViewDetails}/>
                 
                 {/* Pagination */}
                 {totalPages > 1 && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong tổng số{' '}
                                <span className="font-medium">{totalItems}</span> từ vựng
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Số từ/trang:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset về trang 1
                                    }}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {/* First page */}
                                {currentPage > 3 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            1
                                        </button>
                                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                                    </>
                                )}
                                
                                {/* Pages around current */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                                    .map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                page === currentPage
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                
                                {/* Last page */}
                                {currentPage < totalPages - 2 && (
                                    <>
                                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
             <FloatingBulkActionsBar isVisible={selectedVocabs.size > 0} selectedCount={selectedVocabs.size} onClearSelection={clearSelection}>
                 <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><TrashIcon className="w-4 h-4 mr-1.5"/> Xóa khỏi sổ tay</button>
            </FloatingBulkActionsBar>
        </div>
    );
};

export default NotebookDetail;
