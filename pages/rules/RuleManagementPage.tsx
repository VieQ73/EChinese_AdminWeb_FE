import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { CommunityRule, User } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { RulePayload } from './api';
import { Loader2, RefreshCw } from 'lucide-react';
import RulesToolbar from './components/RulesToolbar';
import RulesTable from './components/RulesTable';
import AddEditRuleModal from './components/AddEditRuleModal';
import ConfirmationModal from '../monetization/components/ConfirmationModal';
import { Pagination } from '../../components/ui/pagination';

// Component thông báo toast
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-20 right-6 z-[100] max-w-sm w-full px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all duration-300 border animate-in slide-in-from-bottom-5";
    const typeClasses = type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {message}
        </div>
    );
};

const RuleManagementPage: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;
    // Sử dụng context làm nguồn dữ liệu chính
    const { communityRules, createRule, updateRule, deleteRule } = useAppData();
    
    // State cục bộ cho UI (loading, error, filter, pagination)
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<{ search: string; severity: 'all' | 'low' | 'medium' | 'high'; status: 'all' | 'active' | 'inactive'; }>({ search: '', severity: 'all', status: 'all' });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State cho modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<CommunityRule | null>(null);
    const [deletingRule, setDeletingRule] = useState<CommunityRule | null>(null);

    // Lọc và phân trang dữ liệu từ context
    const displayedRules = useMemo(() => {
        let filtered = [...communityRules];
        if (filters.search) {
            filtered = filtered.filter(r => r.title.toLowerCase().includes(filters.search.toLowerCase()));
        }
        if (filters.severity !== 'all') {
            filtered = filtered.filter(r => r.severity_default === filters.severity);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(r => r.is_active === (filters.status === 'active'));
        }
        return filtered.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    }, [communityRules, filters]);

    const paginatedRules = useMemo(() => {
        const limit = 10;
        const start = (page - 1) * limit;
        return displayedRules.slice(start, start + limit);
    }, [displayedRules, page]);

    const totalPages = Math.ceil(displayedRules.length / 10);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Handlers cho các hành động CRUD (giờ gọi hàm từ context)
    const handleSave = async (payload: RulePayload) => {
        setLoading(true);
        try {
            if (editingRule) {
                await updateRule(editingRule.id, payload);
                setToast({ message: 'Cập nhật quy tắc thành công!', type: 'success' });
            } else {
                await createRule(payload);
                setToast({ message: 'Tạo quy tắc mới thành công!', type: 'success' });
            }
            setIsModalOpen(false);
        } catch (err) {
            setToast({ message: (err as Error).message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleToggleActive = async (rule: CommunityRule) => {
        setLoading(true);
        try {
            await updateRule(rule.id, { is_active: !rule.is_active });
            setToast({ message: `Đã ${rule.is_active ? 'tắt' : 'bật'} quy tắc.`, type: 'success' });
        } catch (err) {
             setToast({ message: "Mất kết nối, không thể cập nhật.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }
    
    const handleDelete = (rule: CommunityRule) => {
        if (currentUser?.role !== 'super admin') {
            setToast({ message: 'Bạn không có quyền thực hiện hành động này.', type: 'error' });
            return;
        }
        setDeletingRule(rule);
    };

    const handleConfirmDelete = async () => {
        if (!deletingRule) return;
        setLoading(true);
        try {
            await deleteRule(deletingRule.id);
            setToast({ message: 'Đã xóa quy tắc thành công.', type: 'success' });
        } catch (err) {
            setToast({ message: (err as Error).message, type: 'error' });
        } finally {
            setLoading(false);
            setDeletingRule(null);
        }
    };
    
    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Quy tắc Cộng đồng</h1>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <RulesToolbar 
                    filters={filters}
                    onFiltersChange={setFilters}
                    onCreate={() => { setEditingRule(null); setIsModalOpen(true); }}
                />
                
                <RulesTable
                    rules={paginatedRules}
                    loading={loading}
                    onEdit={(rule) => { setEditingRule(rule); setIsModalOpen(true); }}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    currentUserRole={currentUser?.role}
                />
                
                {totalPages > 1 && !loading && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>
            
            <AddEditRuleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                rule={editingRule}
            />
            
            <ConfirmationModal
                isOpen={!!deletingRule}
                onClose={() => setDeletingRule(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa quy tắc"
                confirmText="Xóa vĩnh viễn"
                isConfirming={loading}
            >
                <p>Bạn có chắc chắn muốn xóa vĩnh viễn quy tắc <strong>"{deletingRule?.title}"</strong> không? Hành động này không thể hoàn tác.</p>
            </ConfirmationModal>
        </div>
    );
};

export default RuleManagementPage;