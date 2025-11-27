import React, { useState, useMemo } from 'react';
import { Notification } from '../../../types';
import CreateEditNotificationModal from '../components/notifications/CreateEditNotificationModal';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import Modal from '../../../components/Modal';
import ReceivedNotificationsView from '../components/notifications/tabs/ReceivedNotificationsView';
import SentNotificationsView from '../components/notifications/tabs/SentNotificationsView';
import { useNotification } from '../../../contexts/NotificationContext';
import * as api from '../api';

type ActiveSubTab = 'received' | 'sent';

interface NotificationsTabProps {
    notifications: Notification[];
    onNavigateToAction: (type?: string, id?: string) => void;
    refreshData: (page?: number, limit?: number, filters?: any) => void; // Hàm để tải lại dữ liệu từ component cha
    loading?: boolean; // Trạng thái loading
    notificationIdToOpen?: string | null; // ID thông báo cần mở chi tiết
}

// Nút chuyển tab con
const SubTabButton: React.FC<{ tabId: ActiveSubTab; activeTab: ActiveSubTab; onClick: (tabId: ActiveSubTab) => void; children: React.ReactNode }> = ({ tabId, activeTab, onClick, children }) => {
    const isActive = activeTab === tabId;
    return (
        <button
            onClick={() => onClick(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );
};

// Component container chính
const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications, onNavigateToAction, refreshData, loading = false, notificationIdToOpen }) => {
    const { refreshUnreadCount } = useNotification();
    const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('received');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 15; // Server-side pagination limit

    // State cho modals
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setPublishModalOpen] = useState(false);
    const [isRevokeModalOpen, setRevokeModalOpen] = useState(false);
    const [idsForBulkAction, setIdsForBulkAction] = useState<string[]>([]);
    
    // Handler cho page change
    const handlePageChange = (page: number, filters?: any) => {
        setCurrentPage(page);
        refreshData(page, limit, filters);
    };

    // Tách dữ liệu cho từng tab dựa trên _source từ API
    const sentNotifications = useMemo(() => 
        notifications.filter(n => (n as any)._source === 'sent'), 
        [notifications]
    );
    const receivedNotifications = useMemo(() => 
        notifications.filter(n => (n as any)._source === 'received'), 
        [notifications]
    );
    
    // Lấy meta từ notification đầu tiên của mỗi loại
    const receivedMeta = (receivedNotifications[0] as any)?._meta;
    const sentMeta = (sentNotifications[0] as any)?._meta;

    // --- Handlers cho Modal và Actions ---
    const handleViewDetails = async (notification: Notification) => {
        // Chỉ mở modal, không tự động đánh dấu đã đọc
        // Người dùng sẽ tự đánh dấu đã đọc bằng nút riêng
        setViewingNotification(notification);
        setDetailModalOpen(true);
    };
    
    // Tự động mở modal chi tiết khi có notificationIdToOpen
    const [hasOpenedNotification, setHasOpenedNotification] = React.useState(false);
    
    React.useEffect(() => {
        if (notificationIdToOpen && notifications.length > 0 && !hasOpenedNotification) {
            const notification = notifications.find(n => n.id === notificationIdToOpen);
            if (notification) {
                handleViewDetails(notification);
                setHasOpenedNotification(true);
                // Xóa notificationId khỏi URL sau khi mở modal
                const url = new URL(window.location.href);
                url.searchParams.delete('notificationId');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [notificationIdToOpen, notifications, hasOpenedNotification]);
    
    // Reset flag khi notificationIdToOpen thay đổi (người dùng click thông báo khác)
    React.useEffect(() => {
        if (notificationIdToOpen) {
            setHasOpenedNotification(false);
        }
    }, [notificationIdToOpen]);

    const handleSaveNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
        await api.createNotification(data);
        refreshData(1, limit);
        setCreateModalOpen(false);
    };

    const confirmDelete = (ids: string[]) => {
        setIdsForBulkAction(ids);
        setDeleteModalOpen(true);
    };

    const confirmPublish = (ids: string[]) => {
        setIdsForBulkAction(ids);
        setPublishModalOpen(true);
    };

    const confirmRevoke = (ids: string[]) => {
        setIdsForBulkAction(ids);
        setRevokeModalOpen(true);
    };

    const handleDelete = async () => {
        await api.deleteNotifications(idsForBulkAction);
        refreshData(currentPage, limit);
        setIdsForBulkAction([]);
        setDeleteModalOpen(false);
    };

    const handlePublish = async () => {
        await api.publishNotifications(idsForBulkAction);
        refreshData(currentPage, limit);
        setIdsForBulkAction([]);
        setPublishModalOpen(false);
    };

    const handleRevoke = async () => {
        await api.revokeNotifications(idsForBulkAction);
        refreshData(currentPage, limit);
        setIdsForBulkAction([]);
        setRevokeModalOpen(false);
    };

    const handleMarkAsRead = async (ids: string[], asRead: boolean) => {
        await api.markNotificationsAsRead(ids, asRead);
        refreshData(currentPage, limit);
        // Cập nhật số lượng thông báo chưa đọc trên chuông
        await refreshUnreadCount();
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b border-gray-200 pb-2">
                <SubTabButton tabId="received" activeTab={activeSubTab} onClick={setActiveSubTab}>Thông báo nhận</SubTabButton>
                <SubTabButton tabId="sent" activeTab={activeSubTab} onClick={setActiveSubTab}>Thông báo đã gửi</SubTabButton>
            </div>

            {activeSubTab === 'received' && (
                <ReceivedNotificationsView
                    notifications={receivedNotifications}
                    onViewDetails={handleViewDetails}
                    onMarkAsRead={handleMarkAsRead}
                    loading={loading}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                    totalPages={receivedMeta?.totalPages}
                />
            )}

            {activeSubTab === 'sent' && (
                <SentNotificationsView
                    notifications={sentNotifications}
                    onViewDetails={handleViewDetails}
                    onCreate={() => setCreateModalOpen(true)}
                    onPublish={confirmPublish}
                    onRevoke={confirmRevoke}
                    onDelete={confirmDelete}
                    loading={loading}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                    totalPages={sentMeta?.totalPages}
                />
            )}

            {/* Modals được quản lý tập trung ở đây */}
            <CreateEditNotificationModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSave={handleSaveNotification} />
            
            {viewingNotification && 
                <NotificationDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setDetailModalOpen(false)} 
                    notification={viewingNotification}
                    onNavigateToAction={onNavigateToAction}
                />
            }
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Xác nhận xóa" footer={<><button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-lg border">Hủy</button><button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Xóa</button></>}>
                <p>Bạn có chắc muốn xóa {idsForBulkAction.length} thông báo nháp đã chọn không? Hành động này không thể hoàn tác.</p>
            </Modal>
            
            <Modal isOpen={isPublishModalOpen} onClose={() => setPublishModalOpen(false)} title="Xác nhận phát hành" footer={<><button onClick={() => setPublishModalOpen(false)} className="px-4 py-2 rounded-lg border">Hủy</button><button onClick={handlePublish} className="px-4 py-2 rounded-lg bg-green-600 text-white">Phát hành</button></>}>
                <p>Bạn có chắc muốn phát hành {idsForBulkAction.length} thông báo đã chọn không? Thông báo sẽ được gửi tới đối tượng đã chọn.</p>
            </Modal>
            
            <Modal isOpen={isRevokeModalOpen} onClose={() => setRevokeModalOpen(false)} title="Xác nhận thu hồi" footer={<><button onClick={() => setRevokeModalOpen(false)} className="px-4 py-2 rounded-lg border">Hủy</button><button onClick={handleRevoke} className="px-4 py-2 rounded-lg bg-orange-600 text-white">Thu hồi</button></>}>
                <p>Bạn có chắc muốn thu hồi {idsForBulkAction.length} thông báo đã chọn không? Thông báo sẽ được đưa về trạng thái nháp.</p>
            </Modal>
        </div>
    );
};

export default NotificationsTab;
