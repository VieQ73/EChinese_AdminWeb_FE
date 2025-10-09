import React from 'react';
import { Refund } from '../../../../types';
import RefundCard from './RefundCard';

interface RefundCardListProps {
    refunds: Refund[];
    loading: boolean;
    onViewDetails: (refund: Refund) => void;
}

const RefundCardList: React.FC<RefundCardListProps> = ({
    refunds,
    loading,
    onViewDetails,
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (refunds.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy yêu cầu hoàn tiền nào.
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {refunds.map(refund => (
                    <RefundCard
                        key={refund.id}
                        refund={refund}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        </div>
    );
};

export default RefundCardList;