import React from 'react';
import { Violation } from '../../../../types';
import StatusBadge from '../ui/StatusBadge';
import { UsersIcon, ClockIcon, ShieldExclamationIcon } from '../../../../constants';

interface ViolationCardProps {
    violation: Violation;
    onViewDetails: (violation: Violation) => void;
}

const ViolationCard: React.FC<ViolationCardProps> = ({ violation, onViewDetails }) => {
    // Chuyển đổi target_type sang tiếng Việt
    const getTargetTypeLabel = () => {
        switch (violation.target_type) {
            case 'post': return 'Bài viết';
            case 'comment': return 'Bình luận';
            case 'user': return 'Người dùng';
            default: return violation.target_type;
        }
    };

    // Lấy màu theo mức độ nghiêm trọng
    const getSeverityColor = () => {
        switch (violation.severity) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSeverityLabel = () => {
        switch (violation.severity) {
            case 'high': return 'Nghiêm trọng';
            case 'medium': return 'Trung bình';
            case 'low': return 'Nhẹ';
            default: return 'Chưa xác định';
        }
    };

    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer max-w-sm"
            onClick={() => onViewDetails(violation)}
        >
            {/* Header với user info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <UsersIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {violation.user?.name || 'Người dùng ẩn danh'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            ID: {violation.user_id?.substring(0, 8)}...
                        </p>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor()}`}>
                    {getSeverityLabel()}
                </span>
            </div>

            {/* Nội dung vi phạm */}
            <div className="mb-3">
                <div className="flex items-start space-x-2">
                    <ShieldExclamationIcon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{getTargetTypeLabel()}</span>
                            {violation.rules && violation.rules.length > 0 && (
                                <>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {violation.rules.map(r => r.title).join(', ')}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer với thời gian */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{new Date(violation.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                
                {violation.resolved_at && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        <span>✓ Đã xử lý</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViolationCard;