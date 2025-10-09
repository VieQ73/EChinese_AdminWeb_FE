import React from 'react';
import { Subscription } from '../../../../types';
import SubscriptionCard from './SubscriptionCard';

interface SubscriptionCardListProps {
    subscriptions: Subscription[];
    loading: boolean;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
    onToggleActive: (subscription: Subscription) => void;
}

const SubscriptionCardList: React.FC<SubscriptionCardListProps> = ({
    subscriptions,
    loading,
    onEdit,
    onDelete,
    onToggleActive,
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Chưa có gói đăng ký nào.
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map(subscription => (
                    <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
};

export default SubscriptionCardList;