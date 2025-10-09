import React, { useState, useMemo } from 'react';
import { Notification } from '../../../types';
import CreateEditNotificationModal from '../components/notifications/CreateEditNotificationModal';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import Modal from '../../../components/Modal';
import ReceivedNotificationsView from '../components/notifications/tabs/ReceivedNotificationsView';
import SentNotificationsView from '../components/notifications/tabs/SentNotificationsView';
import * as api from '../api';

type ActiveSubTab = 'received' | 'sent';

interface NotificationsTabProps {
    notifications: Notification[];
    onNavigateToAction: (type?: string, id?: string) => void;
    refreshData: () => void; // Hàm để tải lại dữ liệu từ component cha
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
const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications, onNavigateToAction, refreshData }) => {
    const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('received');
    
    // State cho modals
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setPublishModalOpen] = useState(false);
    const [idsForBulkAction, setIdsForBulkAction] = useState<string[]>([]);

    // Tách dữ liệu cho từng tab
    const sentNotifications = useMemo(() => notifications.filter(n => !n.from_system), [notifications]);
    const receivedNotifications = useMemo(() => notifications.filter(n => n.from_system || n.audience === 'admin'), [notifications]);
    
    // --- Handlers cho Modal và Actions ---
    const handleViewDetails = async (notification: Notification) => {
        setViewingNotification(notification);
        setDetailModalOpen(true);
        if (!notification.read_at && (notification.audience === 'admin' || notification.from_system)) {
            await api.markNotificationsAsRead([notification.id], true);
            refreshData();
        }
    };
    
    const handleSaveNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
        await api.createNotification(data);
        refreshData();
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

    const handleDelete = async () => {
        await api.deleteNotifications(idsForBulkAction);
        refreshData();
        setIdsForBulkAction([]);
        setDeleteModalOpen(false);
    };
    
    const handlePublish = async () => {
        await api.publishNotifications(idsForBulkAction);
        refreshData();
        setIdsForBulkAction([]);
        setPublishModalOpen(false);
    };

    const handleMarkAsRead = async (ids: string[], asRead: boolean) => {
        await api.markNotificationsAsRead(ids, asRead);
        refreshData();
    }
    
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
                />
            )}

            {activeSubTab === 'sent' && (
                <SentNotificationsView
                    notifications={sentNotifications}
                    onViewDetails={handleViewDetails}
                    onCreate={() => setCreateModalOpen(true)}
                    onPublish={confirmPublish}
                    onDelete={confirmDelete}
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
        </div>
    );
};

export default NotificationsTab;
