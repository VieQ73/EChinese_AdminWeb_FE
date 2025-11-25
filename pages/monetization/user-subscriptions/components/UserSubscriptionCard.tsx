import React from 'react';
import { EnrichedUserSubscription } from '../../../../types';
import { formatDateTime } from '../../utils';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import { PencilIcon } from '../../../../components/icons';

interface UserSubscriptionCardProps {
    userSubscription: EnrichedUserSubscription;
    onManage: (userSub: EnrichedUserSubscription) => void;
}

const UserSubscriptionCard: React.FC<UserSubscriptionCardProps> = ({
    userSubscription: us,
    onManage,
}) => {
    const isExpiringSoon = us.userSubscription?.expiry_date && new Date(us.userSubscription.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isExpired = us.userSubscription?.expiry_date && new Date(us.userSubscription.expiry_date) <= new Date();
    
    return (
        <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all max-w-md ${
            isExpired ? 'border-red-200 bg-red-50' : 
            isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : 
            'border-gray-200'
        }`}>
            <div className="p-4">
                {/* Header gọn gàng */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-2">
                        <h3 className="font-bold text-gray-900 leading-tight">{us.user.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{us.user.email}</p>
                        {(isExpired || isExpiringSoon) && (
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {isExpired ? 'Đã hết hạn' : 'Sắp hết hạn'}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={() => onManage(us)} 
                        className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-gray-100" 
                        title="Quản lý"
                    >
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                </div>

                {/* Thông tin gói gọn gàng */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">{us.subscription?.name || 'Chưa có gói'}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            us.userSubscription?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {us.userSubscription?.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </div>
                    {us.userSubscription && (
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Từ: {formatDateTime(us.userSubscription.start_date)}</p>
                            {us.userSubscription.expiry_date ? (
                                <p className={isExpired ? 'text-red-600 font-medium' : ''}>
                                    Đến: {formatDateTime(us.userSubscription.expiry_date)}
                                </p>
                            ) : (
                                <p className="text-green-600 font-medium">Vĩnh viễn</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Quota usage - compact */}
                <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sử dụng quota</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Bài học AI:</span>
                            <span className="font-medium">
                                {(us.quotas?.ai_lesson?.daily_count ?? 0)}
                                {us.subscription?.daily_quota_ai_lesson && <span className="text-gray-500">/{us.subscription.daily_quota_ai_lesson}</span>}
                            </span>
                        </div>
                        {us.subscription?.daily_quota_ai_lesson && us.quotas?.ai_lesson && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all" 
                                    style={{ width: `${Math.min(100, ((us.quotas.ai_lesson?.daily_count || 0) / us.subscription.daily_quota_ai_lesson) * 100)}%` }}
                                ></div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Dịch thuật:</span>
                            <span className="font-medium">
                                {(us.quotas?.ai_translate?.daily_count ?? 0)}
                                {us.subscription?.daily_quota_translate && <span className="text-gray-500">/{us.subscription.daily_quota_translate}</span>}
                            </span>
                        </div>
                        {us.subscription?.daily_quota_translate && us.quotas?.ai_translate && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all" 
                                    style={{ width: `${Math.min(100, ((us.quotas.ai_translate?.daily_count || 0) / us.subscription.daily_quota_translate) * 100)}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Auto renewal - compact */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <ToggleSwitch 
                            checked={!!us.userSubscription?.auto_renew}
                            onChange={() => {/* disabled */}}
                            disabled={true}
                        />
                        <span className={`text-sm ${us.userSubscription?.auto_renew ? 'text-green-600' : 'text-gray-500'}`}>
                            Tự động gia hạn
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        #{us.user.id.slice(-6)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSubscriptionCard;