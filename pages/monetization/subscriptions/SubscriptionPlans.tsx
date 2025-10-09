import React, { useState, useEffect, useCallback } from 'react';
import { Subscription } from '../../../types';
import { fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription, checkSubscriptionUsage, SubscriptionPayload as ApiSubscriptionPayload } from '../api';
import { Pagination } from '../../../components/ui/pagination';
import SubscriptionToolbar from './components/SubscriptionToolbar';
import SubscriptionCardList from './components/SubscriptionCardList';
import AddEditSubscriptionModal, { SubscriptionPayload } from './components/AddEditSubscriptionModal';
import ConfirmationModal from '../components/ConfirmationModal';

const SubscriptionPlans: React.FC = () => {
    // State dữ liệu
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [componentError, setComponentError] = useState<string | null>(null);

    // State điều khiển UI
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<{ search: string; status: 'all' | 'active' | 'inactive' }>({ search: '', status: 'all' });
    
    // State cho Modals
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'toggle'; sub: Subscription, payload?: any } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Hàm tải dữ liệu
    const loadSubscriptions = useCallback(async () => {
        setLoading(true);
        setComponentError(null);
        try {
            const response = await fetchSubscriptions({ 
                page, 
                limit: 12,
                search: filters.search,
                status: filters.status
            });
            setSubscriptions(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (err: any) {
            console.error('Lỗi loadSubscriptions:', err);
            setError('Không thể tải danh sách gói: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        try {
            loadSubscriptions();
        } catch (err: any) {
            console.error('Lỗi useEffect:', err);
            setComponentError('Lỗi khởi tạo component: ' + err.message);
        }
    }, [loadSubscriptions]);
    
    // Reset về trang 1 khi filter
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Handlers cho CRUD
    const handleCreate = () => {
        setEditingSubscription(null);
        setModalError(null);
        setAddEditModalOpen(true);
    };

    const handleEdit = (sub: Subscription) => {
        setEditingSubscription(sub);
        setModalError(null);
        setAddEditModalOpen(true);
    };

    const handleSave = async (data: SubscriptionPayload) => {
        setIsProcessing(true);
        setModalError(null);
        try {
            const apiPayload: ApiSubscriptionPayload = {
                name: data.name,
                description: data.description,
                price: data.price,
                duration_months: data.duration_months,
                daily_quota_ai_lesson: data.daily_quota_ai_lesson,
                daily_quota_translate: data.daily_quota_translate,
                is_active: data.is_active,
            };
            
            if (editingSubscription) {
                await updateSubscription(editingSubscription.id, apiPayload);
            } else {
                await createSubscription(apiPayload);
            }
            setAddEditModalOpen(false);
            loadSubscriptions(); // Tải lại dữ liệu
        } catch (err: any) {
            setModalError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleToggleActive = async (sub: Subscription) => {
        const newStatus = !sub.is_active;
        
        try {
            if (!newStatus) {
                // Kiểm tra xem có user nào đang dùng không trước khi tắt
                const usage = await checkSubscriptionUsage(sub.id);
                if (usage.activeUsers > 0) {
                    setConfirmAction({ type: 'toggle', sub, payload: { is_active: false } });
                    setConfirmModalOpen(true);
                    return;
                }
            }
            
            setIsProcessing(true);
            await updateSubscription(sub.id, { is_active: newStatus });
            loadSubscriptions();
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra.');
        } finally {
            setIsProcessing(false);
        }
    }
    
    const handleDelete = async (sub: Subscription) => {
        setConfirmAction({ type: 'delete', sub });
        setConfirmModalOpen(true);
    };

    // Handler cho modal xác nhận
    const onConfirm = async () => {
        if (!confirmAction) return;
        setIsProcessing(true);
        try {
            if (confirmAction.type === 'delete') {
                await deleteSubscription(confirmAction.sub.id);
            } else if (confirmAction.type === 'toggle') {
                await updateSubscription(confirmAction.sub.id, confirmAction.payload);
            }
            loadSubscriptions();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
            setConfirmModalOpen(false);
        }
    };

    const renderConfirmContent = () => {
        if (!confirmAction) return null;
        if (confirmAction.type === 'delete') {
            return <>Bạn có chắc muốn xóa vĩnh viễn gói <strong>"{confirmAction.sub.name}"</strong>? Hành động này không thể hoàn tác.</>
        }
        if (confirmAction.type === 'toggle') {
            return <>Gói <strong>"{confirmAction.sub.name}"</strong> đang có người dùng sử dụng. Việc vô hiệu hóa có thể ảnh hưởng đến họ. Bạn vẫn muốn tiếp tục?</>
        }
        return null;
    }

    if (componentError) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Lỗi Component</h2>
                    <p className="text-gray-600 mb-4">{componentError}</p>
                    <button 
                        onClick={() => {
                            setComponentError(null);
                            loadSubscriptions();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <SubscriptionToolbar
                onSearchChange={(value) => setFilters(f => ({ ...f, search: value }))}
                onStatusChange={(value) => setFilters(f => ({ ...f, status: value }))}
                onCreate={handleCreate}
            />
            {error ? (
                 <div className="p-4 text-red-600">{error}</div>
            ) : (
                <>
                    <SubscriptionCardList
                        subscriptions={subscriptions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        loading={loading}
                    />
                    {totalPages > 1 && (
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    )}
                </>
            )}

            <AddEditSubscriptionModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setAddEditModalOpen(false)}
                onSave={handleSave}
                subscription={editingSubscription}
                saving={isProcessing}
                error={modalError}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={onConfirm}
                title="Xác nhận hành động"
                isConfirming={isProcessing}
            >
                {renderConfirmContent()}
            </ConfirmationModal>
        </div>
    );
};

export default SubscriptionPlans;
