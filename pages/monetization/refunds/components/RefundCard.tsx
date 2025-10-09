import React from 'react';
import { Refund } from '../../../../types';
import { formatCurrency, formatDateTime } from '../../utils';
import StatusBadge from '../../components/StatusBadge';
import { EyeIcon } from '../../../../constants';

interface RefundCardProps {
    refund: Refund;
    onViewDetails: (refund: Refund) => void;
}

const RefundCard: React.FC<RefundCardProps> = ({
    refund: r,
    onViewDetails,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all max-w-md">
            <div className="p-4">
                {/* Header gọn gàng */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-2">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                #{r.id.slice(-8)}
                            </span>
                            <StatusBadge status={r.status} />
                        </div>
                        <h3 className="font-bold text-gray-900">{r.userName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-red-600">{formatCurrency(r.refund_amount)}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {r.refund_method === 'gateway' ? 'Gateway' : 'Chuyển khoản'}
                        </span>
                    </div>
                    <button 
                        onClick={() => onViewDetails(r)} 
                        className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-gray-100" 
                        title="Xem chi tiết"
                    >
                        <EyeIcon className="w-4 h-4"/>
                    </button>
                </div>

                {/* Thông tin gọn gàng */}
                <div className="space-y-2 mb-3">
                    {r.reason && (
                        <div>
                            <span className="text-xs text-gray-600 font-medium">Lý do:</span>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{r.reason}</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Yêu cầu lúc:</span>
                        <span className="text-xs text-gray-500">{formatDateTime(r.created_at)}</span>
                    </div>
                    {r.processed_at && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Xử lý lúc:</span>
                            <span className="text-xs text-gray-500">{formatDateTime(r.processed_at)}</span>
                        </div>
                    )}
                </div>

                {/* Footer với thông tin bổ sung */}
                <div className="pt-2 border-t border-gray-100">
                    {r.processedByAdminName && (
                        <div className="text-xs text-gray-500 mb-1">
                            <span className="font-medium">Xử lý bởi:</span> {r.processedByAdminName}
                        </div>
                    )}
                    {r.notes && (
                        <div className="text-xs text-gray-500 mb-1">
                            <span className="font-medium">Ghi chú:</span> 
                            <span className="line-clamp-1" title={r.notes}> {r.notes}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Payment: #{r.payment_id.slice(-8)}</span>
                        <span>#{r.id.slice(-6)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundCard;