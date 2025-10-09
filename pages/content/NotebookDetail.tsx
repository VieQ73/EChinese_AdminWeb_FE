import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Changed imports of `useParams` and `useNavigate` from `react-router-dom` to `react-router` to resolve module export errors.
import { useParams, useNavigate } from 'react-router';
import { Notebook, Vocabulary, PaginatedResponse } from '../../types';
import * as api from './api';
// FIX: Import Loader2 from lucide-react instead of constants
import { ArrowLeftIcon, PlusIcon, TrashIcon, UploadIcon } from '../../constants';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal';
import AddVocabularyModal from './vocabulary/modals/AddVocabularyModal';
import FloatingBulkActionsBar from '../../components/FloatingBulkActionsBar';
import { useVocabSelection } from './vocabulary/hooks/useVocabSelection';
import VocabCardGrid from './vocabulary/components/VocabCardGrid';
import VocabDetailModal from './vocabulary/modals/VocabDetailModal';
import BulkAddVocabModal from './vocabulary/modals/BulkAddVocabModal';

const NotebookDetail: React.FC = () => {
    const { notebookId } = useParams<{ notebookId: string }>();
    const navigate = useNavigate();

    const [notebook, setNotebook] = useState<Notebook | null>(null);
    const [vocabItems, setVocabItems] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    
    const [viewingVocab, setViewingVocab] = useState<Vocabulary | null>(null);
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

    const loadData = useCallback(async () => {
        if (!notebookId) return;
        setLoading(true);
        try {
            const [notebookData, vocabData] = await Promise.all([
                api.fetchNotebookById(notebookId),
                api.fetchVocabularies({ notebookId, limit: 1000 }) // Tải tất cả vocab trong sổ tay
            ]);
            setNotebook(notebookData);
            setVocabItems(vocabData.data);
        } catch (error) {
            console.error("Failed to load notebook details:", error);
            setNotebook(null); // Để hiển thị thông báo lỗi
        } finally {
            setLoading(false);
        }
    }, [notebookId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const filteredVocab = useMemo(() => {
        return vocabItems.filter(v => 
            v.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vocabItems, searchTerm]);
    
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
                     <div className="mt-4 flex items-center space-x-2 md:mt-0">
                         <button onClick={handleOpenAddModal} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"><PlusIcon className="w-5 h-5 mr-2"/>Thêm từ</button>
                        <button onClick={() => setIsBulkAddModalOpen(true)} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"><UploadIcon className="w-5 h-5 mr-2"/>Thêm hàng loạt</button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                 <div className="flex justify-between items-center mb-4">
                     <input type="text" placeholder="Tìm bằng Hán tự, Pinyin, hoặc nghĩa..." className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500" onChange={(e) => setSearchTerm(e.target.value)}/>
                 </div>
                 <VocabCardGrid vocabItems={filteredVocab} selectedVocabs={selectedVocabs} onSelect={handleSelect} onSelectAll={handleSelectAll} onViewDetails={handleViewDetails}/>
            </div>
            
             <FloatingBulkActionsBar isVisible={selectedVocabs.size > 0} selectedCount={selectedVocabs.size} onClearSelection={clearSelection}>
                 <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><TrashIcon className="w-4 h-4 mr-1.5"/> Xóa khỏi sổ tay</button>
            </FloatingBulkActionsBar>
        </div>
    );
};

export default NotebookDetail;
