import React from 'react';
import { Violation } from '../../../../types';
import ViolationCard from './ViolationCard';

interface ViolationCardListProps {
    violations: Violation[];
    loading: boolean;
    onViewDetails: (violation: Violation) => void;
}

const ViolationCardList: React.FC<ViolationCardListProps> = ({
    violations,
    loading,
    onViewDetails
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (violations.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy vi phạm nào.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {violations.map(violation => (
                <ViolationCard
                    key={violation.id}
                    violation={violation}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};

export default ViolationCardList;