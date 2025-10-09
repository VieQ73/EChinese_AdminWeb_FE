import React from 'react';
// FIX: Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import Modal from '../../../../components/Modal';
import { Notification } from '../../../../types';
import { LinkIcon } from 'lucide-react';

interface NotificationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification;
    onNavigateToAction: (type?: string, id?: string) => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
    </div>
);

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, onClose, notification, onNavigateToAction }) => {
    const handleNavigate = () => {
        if (notification.related_type && notification.related_id) {
            onNavigateToAction(notification.related_type, notification.related_id);
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thông báo" className="max-w-2xl">
            <div className="space-y-6">
                <h2 className="text-xl font-bold">{notification.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <DetailRow label="Đối tượng" value={<span className="capitalize">{notification.audience}</span>} />
                    <DetailRow label="Loại" value={<span className="capitalize">{notification.type}</span>} />
                    <DetailRow label="Ngày gửi" value={new Date(notification.created_at).toLocaleString()} />
                    <DetailRow label="Trạng thái" value={notification.read_at ? `Đã đọc lúc ${new Date(notification.read_at).toLocaleTimeString()}`: 'Chưa đọc'} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nội dung</p>
                    <div 
                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (notification.content as any)?.html || ''}}
                    />
                </div>
                {notification.related_id && (
                    <div>
                        <button 
                            onClick={handleNavigate}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                            <LinkIcon size={16} />
                            Đi đến chi tiết
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NotificationDetailModal;
