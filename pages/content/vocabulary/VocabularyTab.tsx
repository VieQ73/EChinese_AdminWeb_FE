import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Vocabulary, Notebook, WordTypeEnum } from '../../../types';
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
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { fetchImageForVocab } from '../api/imageservice';

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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(50); // Số items mỗi trang
    
    // Modal states
    const [viewingVocab, setViewingVocab] = useState<Vocabulary | null>(null);
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddToNotebookModalOpen, setIsAddToNotebookModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State cho modal import
    const [isImporting, setIsImporting] = useState(false); // State loading cho import
    const [isLoadingImages, setIsLoadingImages] = useState(false); // State loading cho load ảnh
    const [imageLoadProgress, setImageLoadProgress] = useState({ current: 0, total: 0 }); // Progress tracking


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
            setCurrentPage(1); // Reset về trang 1 khi search
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [levelFilter, wordTypeFilter]);
    
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
            // Build query params
            const params: any = {
                page: currentPage,
                limit: itemsPerPage
            };
            
            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }
            
            if (levelFilter !== 'all') {
                params.level = levelFilter;
            }
            
            // Note: API không hỗ trợ filter theo word_type, sẽ filter ở client-side
            
            const [vocabRes, notebookRes] = await Promise.all([
                api.fetchVocabularies(params),
                api.fetchNotebooks({ limit: 5000 }) // Tải tất cả sổ tay cho modal
            ]);
            
            console.log('Vocab response:', vocabRes);
            
            setVocabList(vocabRes.data);
            setNotebooks(notebookRes.data);
            
            // Update pagination info
            if (vocabRes.meta) {
                setTotalPages(vocabRes.meta.totalPages || 1);
                setTotalItems(vocabRes.meta.total || 0);
            }
        } catch (error) {
            console.error("Failed to load vocabulary data:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, levelFilter]);

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

    // Hàm chuyển đổi word_types từ string sang WordTypeEnum
    const mapWordTypesToEnum = (wordTypes: string[]): WordTypeEnum[] => {
        const mapping: Record<string, WordTypeEnum> = {
            'Danh từ': WordTypeEnum.NOUN,
            'Đại từ': WordTypeEnum.PRONOUN,
            'Động từ': WordTypeEnum.VERB,
            'Tính từ': WordTypeEnum.ADJECTIVE,
            'Trạng từ': WordTypeEnum.ADVERB,
            'Giới từ': WordTypeEnum.PREPOSITION,
            'Liên từ': WordTypeEnum.CONJUNCTION,
            'Trợ từ': WordTypeEnum.AUXILIARY,
            'Thán từ': WordTypeEnum.INTERJECTION,
            'Số từ': WordTypeEnum.NUMERAL,
            'Lượng từ': WordTypeEnum.CLASSIFIER,
            'Thành phần câu': WordTypeEnum.SENTENCE_COMPONENT,
            'Cụm từ': WordTypeEnum.PHRASE,
        };
        return wordTypes.map(type => mapping[type]).filter(Boolean);
    };

    // Hàm load ảnh cho các từ đã chọn - cập nhật UI real-time và lưu database
    const handleLoadImages = async () => {
        if (selectedVocabs.size === 0) {
            alert('Vui lòng chọn ít nhất một từ vựng để load ảnh.');
            return;
        }

        const selectedVocabList = vocabList.filter(v => selectedVocabs.has(v.id));
        const vocabsNeedingImages = selectedVocabList.filter(v => !v.image_url);

        if (vocabsNeedingImages.length === 0) {
            alert('Tất cả các từ đã chọn đều có ảnh rồi.');
            return;
        }

        const confirmLoad = window.confirm(
            `Bạn có muốn load ảnh cho ${vocabsNeedingImages.length} từ vựng chưa có ảnh?\n\n` +
            `Ảnh sẽ được hiển thị ngay và lưu vào database.`
        );

        if (!confirmLoad) return;

        setIsLoadingImages(true);
        setImageLoadProgress({ current: 0, total: vocabsNeedingImages.length });

        let successCount = 0;
        let failCount = 0;
        const vocabsToUpdate: Partial<Vocabulary>[] = [];

        for (let i = 0; i < vocabsNeedingImages.length; i++) {
            const vocab = vocabsNeedingImages[i];
            setImageLoadProgress({ current: i + 1, total: vocabsNeedingImages.length });

            try {
                const wordTypeEnums = mapWordTypesToEnum(vocab.word_types);
                const imageUrl = await fetchImageForVocab(vocab.hanzi, vocab.meaning, wordTypeEnums);

                if (imageUrl) {
                    // Cập nhật UI ngay lập tức
                    setVocabList(prevList => 
                        prevList.map(v => 
                            v.id === vocab.id 
                                ? { ...v, image_url: imageUrl }
                                : v
                        )
                    );

                    // Thêm vào danh sách cần update database với đầy đủ thông tin
                    vocabsToUpdate.push({
                        id: vocab.id,
                        hanzi: vocab.hanzi,
                        pinyin: vocab.pinyin,
                        meaning: vocab.meaning,
                        notes: vocab.notes,
                        level: vocab.level,
                        image_url: imageUrl,
                        word_types: vocab.word_types
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Lỗi khi load ảnh cho từ ${vocab.hanzi}:`, error);
                failCount++;
            }
        }

        // Lưu tất cả ảnh vào database
        if (vocabsToUpdate.length > 0) {
            try {
                await api.createOrUpdateVocabs(vocabsToUpdate);
                clearSelection();
                alert(
                    `Hoàn thành!\n\n` +
                    `✅ Thành công: ${successCount} từ\n` +
                    `❌ Thất bại: ${failCount} từ\n\n` +
                    `Ảnh đã được lưu vào database.`
                );
            } catch (error) {
                alert('Có lỗi khi lưu ảnh vào database.');
                console.error('Error saving images:', error);
            }
        } else {
            alert(`Không có ảnh nào được load thành công.`);
        }

        setIsLoadingImages(false);
        setImageLoadProgress({ current: 0, total: 0 });
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
                    <>
                        <VocabCardGrid vocabItems={filteredVocabList} selectedVocabs={selectedVocabs} onSelect={handleSelect} onSelectAll={handleSelectAll} onViewDetails={setViewingVocab} isSelectable={true}/>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong tổng số{' '}
                                    <span className="font-medium">{totalItems}</span> từ vựng
                                </div>
                                
                                <div className="flex items-center space-x-2">
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
                    </>
                )}
            </div>

            <FloatingBulkActionsBar isVisible={selectedVocabs.size > 0} selectedCount={selectedVocabs.size} onClearSelection={clearSelection}>
                <button 
                    onClick={handleLoadImages} 
                    disabled={isLoadingImages}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoadingImages ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin"/> 
                            Đang load {imageLoadProgress.current}/{imageLoadProgress.total}
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-4 h-4 mr-1.5"/> Load ảnh
                        </>
                    )}
                </button>
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