import React from 'react';
import { Violation } from '../../../../types';
import StatusBadge from '../ui/StatusBadge';
import { EyeIcon, ShieldExclamationIcon, ClockIcon } from '../../../../constants';

interface ViolationCardProps {
    violation: Violation;
    onViewDetails: (violation: Violation) => void;
}

const ViolationCard: React.FC<ViolationCardProps> = ({ violation, onViewDetails }) => {
    // Lấy mô tả đối tượng vi phạm
    const getTargetDescription = () => {
        return `${violation.target_type}: ${violation.target_id.substring(0,4)}...`;
    };

    // Lấy tên người phát hiện vi phạm
    //  Correctly handle the string union type of 'detected_by'.
    const getDetectedBy = () => {
        if (violation.detected_by === 'auto_ai') return 'Hệ thống AI';
        if (violation.detected_by === 'admin') return 'Admin';
        if (violation.detected_by === 'super admin') return 'Super Admin';
        return 'Hệ thống';
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all max-w-sm">
            <div className="p-4">
                {/* Header với loại đối tượng và mức độ nghiêm trọng */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <ShieldExclamationIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {getTargetDescription()}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(violation.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor()}`}>
                        {getSeverityLabel()}
                    </span>
                </div>

                {/* Lý do vi phạm */}
                <div className="mb-3">
                    {/*  Replaced incorrect 'reason' and 'details' properties with 'rules' and 'resolution' from the Violation type. */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {violation.rules?.map(r => r.title).join(', ') || 'Vi phạm không xác định'}
                    </h3>
                    {violation.resolution && (
                        <p className="text-xs text-gray-600 line-clamp-2" title={violation.resolution}>
                            {violation.resolution}
                        </p>
                    )}
                </div>

                {/* Thông tin phát hiện và trạng thái */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>Phát hiện bởi: {getDetectedBy()}</span>
                    </div>
                    
                    <button 
                        onClick={() => onViewDetails(violation)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                    >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        Chi tiết
                    </button>
                </div>

                {/* Trạng thái xử lý */}
                {violation.resolved_at && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-green-600">
                            ✓ Đã xử lý vào {new Date(violation.resolved_at).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViolationCard;