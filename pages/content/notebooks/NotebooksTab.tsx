

import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
// FIX: Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import { Notebook, PaginatedResponse } from '../../../types';
import { AuthContext } from '../../../contexts/AuthContext';
import * as api from '../api';

import Modal from '../../../components/Modal';
import FloatingBulkActionsBar from '../../../components/FloatingBulkActionsBar';
import { useNotebookSelection } from './useNotebookSelection';
import NotebooksToolbar from './NotebooksToolbar';
import NotebookCardGrid from './NotebookCardGrid';
import AddEditNotebookModal from './AddEditNotebookModal';
import { Pagination } from '../../../components/ui/pagination';
// FIX: Import Loader2 from lucide-react instead of constants
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '../../../constants';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const NotebooksTab: React.FC = () => {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'all', premium: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState<{ action: 'publish' | 'unpublish' | 'delete'; onConfirm: () => void; } | null>(null);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext)!;
    const isSuperAdmin = user?.role === 'super admin';
    
    const { selectedNotebooks, handleSelect, handleSelectAll, clearSelection } = useNotebookSelection(notebooks);

    const loadNotebooks = useCallback(async () => {
        setLoading(true);
        clearSelection();
        try {
            const response = await api.fetchNotebooks({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: searchTerm,
                status: filters.status as any,
                premium: filters.premium as any,
            });
            setNotebooks(response.data);
            setPageCount(response.meta.totalPages);
        } catch (error) {
            console.error("Failed to load notebooks:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filters, clearSelection]);

    useEffect(() => {
        loadNotebooks();
    }, [loadNotebooks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const handleOpenCreateModal = () => {
        setEditingNotebook(null);
        setAddEditModalOpen(true);
    };
    
    const handleOpenEditModal = (notebook: Notebook) => {
        setEditingNotebook(notebook);
        setAddEditModalOpen(true);
    };

    const handleSaveNotebook = async (notebookData: api.NotebookPayload) => {
        try {
            if (editingNotebook) {
                await api.updateNotebook(editingNotebook.id, notebookData);
            } else {
                await api.createNotebook(notebookData);
            }
            setAddEditModalOpen(false);
            loadNotebooks();
        } catch (error) {
            console.error("Failed to save notebook:", error);
            alert("Lưu sổ tay thất bại.");
        }
    };
    
    const handleBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
        setConfirmModalConfig({
            action,
            onConfirm: async () => {
                const ids = Array.from(selectedNotebooks);
                try {
                    if (action === 'publish' || action === 'unpublish') {
                        await api.bulkUpdateNotebookStatus(ids, action === 'publish' ? 'published' : 'draft');
                    } else if (action === 'delete') {
                        await api.deleteNotebooks(ids);
                    }
                    loadNotebooks();
                } catch (error) {
                    console.error(`Failed to ${action} notebooks:`, error);
                } finally {
                    setConfirmModalOpen(false);
                }
            }
        });
        setConfirmModalOpen(true);
    };
    
    const renderConfirmModalContent = () => {
        if (!confirmModalConfig) return null;
        const actionText = { publish: "xuất bản", unpublish: "hủy xuất bản", delete: "xóa vĩnh viễn" };
        const count = selectedNotebooks.size;
        return (
             <p>Bạn có chắc chắn muốn <span className="font-bold text-red-600">{actionText[confirmModalConfig.action]}</span> <span className="font-bold">{count}</span> sổ tay đã chọn không?
             {confirmModalConfig.action === 'delete' && <span className="block mt-2 text-sm text-red-700">Hành động này không thể hoàn tác.</span>}
             </p>
        );
    }

    return (
        <div className="space-y-6">
            <AddEditNotebookModal isOpen={isAddEditModalOpen} onClose={() => setAddEditModalOpen(false)} onSave={handleSaveNotebook} notebook={editingNotebook}/>
            <Modal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="Xác nhận hành động" footer={
                <>
                    <button onClick={() => setConfirmModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
                    <button onClick={() => confirmModalConfig?.onConfirm()} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmModalConfig?.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>Xác nhận</button>
                </>
            }>
                {renderConfirmModalContent()}
            </Modal>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <NotebooksToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} filters={filters} onFilterChange={setFilters} onCreate={handleOpenCreateModal}/>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>
                ) : (
                    <NotebookCardGrid notebooks={notebooks} selectedNotebooks={selectedNotebooks} onSelect={handleSelect} onSelectAll={handleSelectAll} onEdit={handleOpenEditModal} onNavigate={(id) => navigate(`/notebooks/${id}`)}/>
                )}

                 {pageCount > 1 && !loading && (
                    <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
                )}
            </div>

            <FloatingBulkActionsBar isVisible={selectedNotebooks.size > 0} selectedCount={selectedNotebooks.size} onClearSelection={clearSelection}>
                <button onClick={() => handleBulkAction('publish')} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"><CheckCircleIcon className="w-4 h-4 mr-1.5"/>Xuất bản</button>
                <button onClick={() => handleBulkAction('unpublish')} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"><XCircleIcon className="w-4 h-4 mr-1.5"/>Hủy xuất bản</button>
                {isSuperAdmin && <button onClick={() => handleBulkAction('delete')} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><TrashIcon className="w-4 h-4 mr-1.5"/> Xóa</button>}
            </FloatingBulkActionsBar>
        </div>
    );
};

export default NotebooksTab;
