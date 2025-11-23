import React, { useState } from 'react';
//  Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import Modal from '../../../../components/Modal';
import { Notification } from '../../../../types';
import { LinkIcon, Loader2 } from 'lucide-react';
import { handleNotificationNavigation, shouldShowNavigationButton } from '../../../../services/notificationNavigationService';
import * as api from '../../../community/api';

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
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    
    const isRead = (notification as any).is_read ?? (notification.read_at ? true : false);
    const redirectType = (notification as any).redirect_type || notification.related_type;
    const redirectId = notification.related_id;
    
    // Lấy type và id từ data của notification
    const notificationData = notification.data as any;
    const dataType = notificationData?.type;
    const dataId = notificationData?.id;
    
    // Kiểm tra xem có nên hiển thị nút "Đi tới chi tiết" không
    // Hỗ trợ cả format mới (post_id/comment_id) và format cũ (id)
    const hasNavigationData = dataType && (
        dataId || // Format cũ: có id
        notificationData?.post_id || // Format mới: có post_id
        notificationData?.comment_id // Format mới: có comment_id
    );
    const showNavigateButton = hasNavigationData && shouldShowNavigationButton(dataType);
    
    const handleNavigate = () => {
        if (redirectType && redirectId) {
            onNavigateToAction(redirectType, redirectId);
            onClose();
        }
    };
    
    const handleNavigateToDetail = async () => {
        setIsNavigating(true);
        
        try {
            let postId: string | null = null;
            let commentId: string | null = null;
            
            // Ưu tiên sử dụng post_id và comment_id từ data
            if (notificationData?.post_id) {
                postId = notificationData.post_id;
                commentId = notificationData.comment_id || null;
            } 
            // Fallback: sử dụng data.id và data.type (format cũ)
            else if (dataType && dataId) {
                if (dataType === 'post' || dataType === 'post_remove') {
                    // Nếu type là 'post', data.id chính là postId
                    postId = dataId;
                } else if (dataType === 'comment' || dataType === 'comment_remove') {
                    // Nếu type là 'comment', cần fetch comment để lấy post_id
                    commentId = dataId;
                    const comment = await api.fetchCommentById(dataId);
                    if (comment && comment.post_id) {
                        postId = comment.post_id;
                    } else {
                        navigate('/community');
                        setIsNavigating(false);
                        return;
                    }
                }
            }
            
            if (postId) {
                // Đóng modal notification trước
                onClose();
                // Navigate đến community page với query params
                if (commentId) {
                    navigate(`/community?post=${postId}&comment=${commentId}`);
                } else {
                    navigate(`/community?post=${postId}`);
                }
            } else {
                // Fallback: dùng navigation
                if (dataType && dataId) {
                    await handleNotificationNavigation(dataType, dataId, (url) => navigate(url), notificationData);
                }
                onClose();
            }
        } catch (error) {
            console.error('Error navigating:', error);
            // Fallback: navigate to community
            navigate('/community');
            onClose();
        } finally {
            setIsNavigating(false);
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
        <>
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
                {/* {notification.data && typeof notification.data === 'object' && (
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
                )} */}
                
                {/* Nút điều hướng */}
                <div className="flex gap-3">
                    {redirectId && (
                        <button 
                            onClick={handleNavigate}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <LinkIcon size={16} />
                            Đi đến chi tiết
                        </button>
                    )}
                    
                    {showNavigateButton && (
                        <button 
                            onClick={handleNavigateToDetail}
                            disabled={isNavigating}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isNavigating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LinkIcon size={16} />
                            )}
                            {dataType?.includes('post') ? 'Xem bài viết' : 'Xem bình luận'}
                        </button>
                    )}
                </div>
                </div>
            </Modal>
        </>
    );
};

export default NotificationDetailModal;
