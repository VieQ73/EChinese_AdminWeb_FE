import React from 'react';
import { Payment } from '../../../../types';
import Checkbox from '../../../../ui/Checkbox';
import PaymentCard from './PaymentCard';

interface PaymentCardListProps {
    payments: Payment[];
    loading: boolean;
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onViewDetails: (payment: Payment) => void;
    onConfirm: (payment: Payment) => void;
    onFail: (payment: Payment) => void;
}

const PaymentCardList: React.FC<PaymentCardListProps> = ({
    payments,
    loading,
    selectedIds,
    onSelect,
    onSelectAll,
    onViewDetails,
    onConfirm,
    onFail,
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy giao dịch nào.
            </div>
        );
    }

    // Tính toán trạng thái checkbox "Chọn tất cả"
    const selectAllState = React.useMemo(() => {
        if (selectedIds.size === 0) return { checked: false, indeterminate: false };
        if (selectedIds.size === payments.length) return { checked: true, indeterminate: false };
        return { checked: false, indeterminate: true };
    }, [selectedIds.size, payments.length]);

    return (
        <div className="p-4">
            {/* Header với select all */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                    <div 
                        className="relative"
                        title={
                            selectAllState.indeterminate 
                                ? 'Một số mục đã được chọn - click để chọn tất cả'
                                : selectAllState.checked 
                                    ? 'Tất cả đã được chọn - click để bỏ chọn tất cả'
                                    : 'Chưa chọn mục nào - click để chọn tất cả'
                        }
                    >
                        <Checkbox
                            checked={selectAllState.checked}
                            onChange={(e) => onSelectAll(e)}
                        />
                        {/* Hiển thị indeterminate state bằng một đường ngang nhỏ */}
                        {selectAllState.indeterminate && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-2.5 h-0.5 bg-white rounded-full"></div>
                            </div>
                        )}
                    </div>
                    <span 
                        className="text-sm text-gray-600 cursor-pointer select-none hover:text-primary-600 transition-colors"
                        onClick={() => {
                            onSelectAll({ target: { checked: !selectAllState.checked } } as any);
                        }}
                    >
                        {selectAllState.indeterminate ? 'Chọn tất cả' : selectAllState.checked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </span>
                </div>
                <span className="text-sm font-medium text-primary-600">
                    {selectedIds.size > 0 ? `${selectedIds.size} đã chọn` : `${payments.length} giao dịch`}
                </span>
            </div>

            {/* Danh sách cards - grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {payments.map(payment => (
                    <PaymentCard
                        key={payment.id}
                        payment={payment}
                        selected={selectedIds.has(payment.id)}
                        onSelect={onSelect}
                        onViewDetails={onViewDetails}
                        onConfirm={onConfirm}
                        onFail={onFail}
                    />
                ))}
            </div>
        </div>
    );
};

export default PaymentCardList;