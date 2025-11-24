import React from 'react';
import { Notification } from '../../../../types';
import { EyeIcon, BellIcon, CheckCircleIcon } from '../../../../constants';

interface NotificationCardProps {
    notification: Notification;
    onViewDetails: (notification: Notification) => void;
    onMarkAsRead?: (ids: string[], asRead: boolean) => void;
    showCheckbox?: boolean;
    selected?: boolean;
    onSelect?: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onViewDetails,
    onMarkAsRead,
    showCheckbox = false,
    selected = false,
    onSelect
}) => {
    // Lấy màu theo loại thông báo
    const getTypeColor = () => {
        switch (notification.type) {
            case 'system': return 'text-blue-600 bg-blue-50';
            case 'report': return 'text-red-600 bg-red-50';
            case 'violation': return 'text-orange-600 bg-orange-50';
            case 'appeal': return 'text-purple-600 bg-purple-50';
            case 'achievement': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTypeLabel = () => {
        switch (notification.type) {
            case 'system': return 'Hệ thống';
            case 'report': return 'Báo cáo';
            case 'violation': return 'Vi phạm';
            case 'appeal': return 'Khiếu nại';
            case 'achievement': return 'Thành tích';
            case 'subscription': return 'Đăng ký';
            case 'community': return 'Cộng đồng';
            case 'reminder': return 'Nhắc nhở';
            case 'feedback': return 'Phản hồi';
            default: return 'Khác';
        }
    };

    const getAudienceLabel = () => {
        switch (notification.audience) {
            case 'admin': return 'Quản trị viên';
            case 'all': return 'Tất cả';
            default: return 'Người dùng';
        }
    };

    return (
        <div 
            className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer max-w-xs ${
                notification.read_at ? 'border-gray-200' : 'border-primary-200 bg-primary-50/30'
            } ${selected ? 'ring-2 ring-primary-500' : ''}`}
            onClick={() => onViewDetails(notification)}
        >
            <div className="p-3">
                {/* Header với checkbox (nếu có) và trạng thái */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {showCheckbox && onSelect && (
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onSelect(notification.id);
                                }}
                                className="h-3 w-3 text-primary-600 border-gray-300 rounded"
                            />
                        )}
                        <BellIcon className={`w-3 h-3 flex-shrink-0 ${notification.read_at ? 'text-gray-400' : 'text-primary-500'}`} />
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor()}`}>
                            {getTypeLabel()}
                        </span>
                    </div>
                    
                    {!notification.read_at && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                    )}
                </div>

                {/* Tiêu đề */}
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {notification.title}
                </h3>

                {/* Thông tin bổ sung */}
                <div className="text-xs text-gray-500 mb-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <span>Đối tượng: {getAudienceLabel()}</span>
                        <span>{new Date(notification.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    {/* Trạng thái phát hành cho sent notifications */}
                    {'is_push_sent' in notification && (
                        <div className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                notification.is_push_sent ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                            <span>{notification.is_push_sent ? 'Đã phát hành' : 'Nháp'}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {onMarkAsRead && !notification.read_at && (
                    <div className="flex items-center justify-start">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead([notification.id], true);
                            }}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                        >
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Đánh dấu đã đọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCard;