import React from 'react';
import { EnrichedUserSubscription } from '../../../../types';
import UserSubscriptionCard from './UserSubscriptionCard';

interface UserSubscriptionCardListProps {
    userSubscriptions: EnrichedUserSubscription[];
    loading: boolean;
    onManage: (userSub: EnrichedUserSubscription) => void;
}

const UserSubscriptionCardList: React.FC<UserSubscriptionCardListProps> = ({
    userSubscriptions,
    loading,
    onManage,
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (userSubscriptions.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy người dùng đăng ký nào.
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSubscriptions.map(userSub => (
                    <UserSubscriptionCard
                        key={userSub.user.id}
                        userSubscription={userSub}
                        onManage={onManage}
                    />
                ))}
            </div>
        </div>
    );
};

export default UserSubscriptionCardList;