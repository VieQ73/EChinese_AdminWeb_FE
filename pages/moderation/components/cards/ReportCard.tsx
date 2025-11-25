import React from 'react';
import { Report } from '../../../../types';
import StatusBadge from '../ui/StatusBadge';
import { UsersIcon, ClockIcon, XCircleIcon } from '../../../../constants';

interface ReportCardProps {
    report: Report;
    onViewDetails: (report: Report) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onViewDetails }) => {
    // Lấy thông tin reporter
    const getReporterName = () => {
        if (report.auto_flagged) return 'Hệ thống AI';
        return report.reporter?.name || 'Không rõ';
    };

    // Chuyển đổi target_type sang tiếng Việt
    const getTargetTypeLabel = () => {
        switch (report.target_type) {
            case 'post': return 'Bài viết';
            case 'comment': return 'Bình luận';
            case 'user': return 'Người dùng';
            case 'bug': return 'Lỗi';
            case 'other': return 'Khác';
            default: return report.target_type;
        }
    };

    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer max-w-sm"
            onClick={() => onViewDetails(report)}
        >
            {/* Header với user info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <UsersIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {getReporterName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            ID: {report.reporter_id ? report.reporter_id.substring(0, 8) + '...' : 'N/A'}
                        </p>
                    </div>
                </div>
                <StatusBadge status={report.status} />
            </div>

            {/* Nội dung báo cáo */}
            <div className="mb-3">
                <div className="flex items-start space-x-2">
                    <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{getTargetTypeLabel()}</span>
                            {report.reason && (
                                <>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {report.reason}
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
                    <span>{new Date(report.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;