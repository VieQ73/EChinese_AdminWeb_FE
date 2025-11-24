import React from 'react';
import { Payment } from '../../../../types';
import { formatCurrency, formatDateTime } from '../../utils';
import Checkbox from '../../../../ui/Checkbox';
import StatusBadge from '../../components/StatusBadge';
import { CheckCircleIcon, XCircleIcon } from '../../../../constants';

interface PaymentCardProps {
    payment: Payment;
    selected: boolean;
    onSelect: (id: string) => void;
    onViewDetails: (payment: Payment) => void;
    onConfirm: (payment: Payment) => void;
    onFail: (payment: Payment) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
    payment: p,
    selected,
    onSelect,
    onViewDetails,
    onConfirm,
    onFail,
}) => {
    return (
        <div 
            onClick={() => onViewDetails(p)}
            className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all max-w-md relative cursor-pointer ${selected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
        >
            <div className="p-4 pb-12">
                {/* Header gọn gàng - bỏ checkbox */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                #{p.id.slice(-8)}
                            </span>
                            <StatusBadge status={p.status} />
                        </div>
                        <h3 className="font-bold text-gray-900 truncate">{p.userName}</h3>
                        <p className="text-xs text-gray-500 truncate">{p.userEmail}</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-green-600">{formatCurrency(p.amount)}</span>
                        </div>
                    </div>
                    
                    {p.status === 'pending' && p.payment_channel === 'manual' && (
                        <div className="flex items-start space-x-1 ml-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm(p);
                                }}
                                className="text-green-500 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50" 
                                title="Xác nhận"
                            >
                                <CheckCircleIcon className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFail(p);
                                }}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50" 
                                title="Đánh dấu thất bại"
                            >
                                <XCircleIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </div>

                {/* Thông tin gọn gàng */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gói:</span>
                        <span className="font-medium text-blue-600 truncate ml-2">{p.subscriptionName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-medium capitalize">{p.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Kênh:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            p.payment_channel === 'auto' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {p.payment_channel === 'auto' ? 'Tự động' : 'Thủ công'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="text-xs text-gray-500">{formatDateTime(p.transaction_date)}</span>
                    </div>
                </div>

                {/* Additional Info - compact */}
                {(p.gateway_transaction_id || p.processedByAdminName || p.notes) && (
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                        {p.gateway_transaction_id && (
                            <div className="text-xs text-gray-500 flex items-start">
                                <span className="font-medium flex-shrink-0">Gateway:</span> 
                                <span className="truncate ml-1" title={p.gateway_transaction_id}>{p.gateway_transaction_id}</span>
                            </div>
                        )}
                        {p.processedByAdminName && (
                            <div className="text-xs text-gray-500 flex items-start">
                                <span className="font-medium flex-shrink-0">Xử lý:</span> 
                                <span className="truncate ml-1" title={p.processedByAdminName}>{p.processedByAdminName}</span>
                            </div>
                        )}
                        {p.notes && (
                            <div className="text-xs text-gray-500 flex items-start">
                                <span className="font-medium flex-shrink-0">Ghi chú:</span> 
                                <span className="truncate ml-1" title={p.notes}>{p.notes}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Checkbox ở góc dưới bên phải */}
                <div 
                    className="absolute bottom-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox 
                        checked={selected} 
                        onChange={() => onSelect(p.id)}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;