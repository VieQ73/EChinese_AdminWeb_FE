import React from 'react';
import { Appeal } from '../../../../types';
import AppealCard from './AppealCard';

interface AppealCardListProps {
    appeals: (Appeal & { daysLeft?: number })[];
    loading: boolean;
    onViewDetails: (appeal: Appeal) => void;
}

const AppealCardList: React.FC<AppealCardListProps> = ({
    appeals,
    loading,
    onViewDetails
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (appeals.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không có khiếu nại nào khớp với bộ lọc.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {appeals.map(appeal => (
                <AppealCard
                    key={appeal.id}
                    appeal={appeal}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};

export default AppealCardList;