import React, { useState, useEffect } from 'react';
import { useAppData } from '../../../contexts/appData/context';
import { BadgeLevel } from '../../../types';
import BadgesTable from './components/BadgesTable';
import EditBadgeModal from './components/EditBadgeModal';
import ConfirmationModal from '../../monetization/components/ConfirmationModal';
import { RefreshCw, Loader2, PlusIcon } from 'lucide-react';
import { BadgePayload } from './api';

const BadgesTab: React.FC = () => {
    const { badges, createBadge, updateBadge, deleteBadge, resyncAllUserBadges } = useAppData();
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalBadge, setModalBadge] = useState<BadgeLevel | null>(null); // null for create
    const [confirmToggle, setConfirmToggle] = useState<BadgeLevel | null>(null);
    const [deletingBadge, setDeletingBadge] = useState<BadgeLevel | null>(null);


    useEffect(() => {
        if (badges) {
            setLoading(false);
        }
    }, [badges]);

    const handleOpenCreate = () => {
        setModalBadge(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (badge: BadgeLevel) => {
        setModalBadge(badge);
        setIsModalOpen(true);
    };

    const handleSave = async (payload: BadgePayload) => {
        try {
            if (modalBadge) { // Update mode
                await updateBadge(modalBadge.id, payload);
            } else { // Create mode
                await createBadge(payload);
            }
            setIsModalOpen(false);
        } catch(error) {
            alert((error as Error).message);
        }
    };
    
    const handleDelete = (badge: BadgeLevel) => {
        setDeletingBadge(badge);
    };
    
    const handleConfirmDelete = async () => {
        if (!deletingBadge) return;
        try {
            await deleteBadge(deletingBadge.id);
            setDeletingBadge(null);
        } catch(error) {
             alert((error as Error).message);
        }
    }

    const handleToggleActive = (badge: BadgeLevel, isActive: boolean) => {
        if (!isActive) {
            setConfirmToggle(badge);
        } else {
            updateBadge(badge.id, { is_active: isActive });
        }
    };
    
    const handleConfirmToggle = async () => {
        if (!confirmToggle) return;
        await updateBadge(confirmToggle.id, { is_active: false });
        setConfirmToggle(null);
    }
    
    const handleManualSync = async () => {
        setIsSyncing(true);
        await resyncAllUserBadges();
        setIsSyncing(false);
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Quản lý Huy hiệu</h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm disabled:opacity-60"
                        >
                            {isSyncing ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <RefreshCw className="w-5 h-5 mr-2"/>}
                            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại'}
                        </button>
                         <button 
                            onClick={handleOpenCreate}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2"/>
                            Tạo huy hiệu mới
                        </button>
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin" /></div>
                ) : (
                    <BadgesTable 
                        badges={badges}
                        onEdit={handleOpenEdit}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                    />
                )}
            </div>
            
            <EditBadgeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                badge={modalBadge}
            />
            
            <ConfirmationModal
                isOpen={!!confirmToggle}
                onClose={() => setConfirmToggle(null)}
                onConfirm={handleConfirmToggle}
                title="Xác nhận vô hiệu hóa"
                confirmText="Vẫn vô hiệu hóa"
            >
                <p>
                    Vô hiệu hóa huy hiệu <strong>"{confirmToggle?.name}"</strong> sẽ khiến những người dùng đang sở hữu nó bị hạ cấp xuống huy hiệu thấp hơn (nếu đủ điều kiện). 
                    Hệ thống sẽ tự động đồng bộ lại.
                </p>
                <p className="mt-2 font-semibold">Bạn có chắc chắn muốn tiếp tục không?</p>
            </ConfirmationModal>

             <ConfirmationModal
                isOpen={!!deletingBadge}
                onClose={() => setDeletingBadge(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa"
                confirmText="Xóa huy hiệu"
            >
                <p>
                    Xóa huy hiệu <strong>"{deletingBadge?.name}"</strong> sẽ khiến những người dùng đang sở hữu nó bị hạ cấp.
                    Hệ thống sẽ tự động đồng bộ lại.
                </p>
                <p className="mt-2 font-semibold text-red-600">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?</p>
            </ConfirmationModal>
        </div>
    );
};

export default BadgesTab;