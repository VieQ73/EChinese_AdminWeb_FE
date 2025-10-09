import React from 'react';
import { Report } from '../../../../types';
import StatusBadge from '../ui/StatusBadge';
import { EyeIcon, UsersIcon, XCircleIcon } from '../../../../constants';

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

    // Lấy mô tả đối tượng bị báo cáo
    const getTargetDescription = () => {
        return `${report.target_type}: ${report.target_id.substring(0,4)}...`;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all max-w-sm">
            <div className="p-4">
                {/* Header với loại đối tượng và trạng thái */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {getTargetDescription()}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(report.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={report.status} />
                </div>

                {/* Lý do báo cáo */}
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {report.reason}
                    </h3>
                    {report.details && (
                        <p className="text-xs text-gray-600 line-clamp-2" title={report.details}>
                            {report.details}
                        </p>
                    )}
                </div>

                {/* Thông tin người báo cáo */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <UsersIcon className="w-3 h-3" />
                        <span className={report.auto_flagged ? 'italic text-purple-600' : ''}>
                            {getReporterName()}
                        </span>
                    </div>
                    
                    <button 
                        onClick={() => onViewDetails(report)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                    >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;