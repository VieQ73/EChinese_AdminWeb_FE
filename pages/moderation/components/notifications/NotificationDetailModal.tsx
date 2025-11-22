import React from 'react';
//  Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
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
    const isRead = (notification as any).is_read ?? (notification.read_at ? true : false);
    const redirectType = (notification as any).redirect_type || notification.related_type;
    const redirectId = notification.related_id;
    
    const handleNavigate = () => {
        if (redirectType && redirectId) {
            onNavigateToAction(redirectType, redirectId);
            onClose();
        }
    };
    
    // Hàm decode HTML entities
    const decodeHtmlEntities = (text: string): string => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };
    
    // Hàm chuyển đổi loại thông báo sang tiếng Việt
    const getNotificationTypeLabel = (type: string): string => {
        const typeLabels: Record<string, string> = {
            'system': 'Hệ thống',
            'community': 'Cộng đồng',
            'violation': 'Vi phạm',
            'achievement': 'Thành tích',
            'subscription': 'Đăng ký',
            'comment_ban': 'Cấm bình luận',
            'post_removed': 'Bài viết bị gỡ',
            'comment_removed': 'Bình luận bị gỡ',
            'like': 'Thích',
            'comment': 'Bình luận',
            'reply': 'Trả lời',
            'follow': 'Theo dõi',
            'mention': 'Nhắc đến'
        };
        return typeLabels[type] || type;
    };
    
    // Hàm chuyển đổi đối tượng sang tiếng Việt
    const getAudienceLabel = (audience: string): string => {
        const audienceLabels: Record<string, string> = {
            'all': 'Tất cả người dùng',
            'user': 'Người dùng cụ thể',
            'admin': 'Quản trị viên'
        };
        return audienceLabels[audience] || audience;
    };
    
    // Lấy nội dung hiển thị
    const getContent = () => {
        const data = notification.data as any;
        let rawContent = '';
        
        if (data?.message) rawContent = data.message;
        else if (typeof notification.content === 'string') rawContent = notification.content;
        else if (notification.content && typeof notification.content === 'object') {
            rawContent = (notification.content as any).html || (notification.content as any).text || '';
        }
        
        // Decode HTML entities nếu có
        if (rawContent && typeof rawContent === 'string') {
            return decodeHtmlEntities(rawContent);
        }
        
        return rawContent;
    };
    
    const content = getContent();
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thông báo" className="max-w-2xl">
            <div className="space-y-6">
                <h2 className="text-xl font-bold">{notification.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {notification.audience && (
                        <DetailRow label="Đối tượng" value={getAudienceLabel(notification.audience)} />
                    )}
                    <DetailRow label="Loại" value={getNotificationTypeLabel(notification.type)} />
                    <DetailRow label="Ngày gửi" value={new Date(notification.created_at).toLocaleString('vi-VN')} />
                    <DetailRow 
                        label="Trạng thái" 
                        value={isRead 
                            ? (notification.read_at ? `Đã đọc lúc ${new Date(notification.read_at).toLocaleTimeString('vi-VN')}` : 'Đã đọc')
                            : 'Chưa đọc'
                        } 
                    />
                </div>
                
                {content && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nội dung</p>
                        <div 
                            className="p-4 bg-gray-50 border border-gray-200 rounded-lg prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                )}
                
                {/* Hiển thị data bổ sung nếu có */}
                {notification.data && typeof notification.data === 'object' && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin bổ sung</p>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm space-y-2">
                            {Object.entries(notification.data as any).map(([key, value]) => {
                                if (key === 'message') return null; // Đã hiển thị ở trên
                                return (
                                    <div key={key} className="flex justify-between">
                                        <span className="font-medium text-gray-600">{key}:</span>
                                        <span className="text-gray-900">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {redirectId && (
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
