import React from 'react';
import { Subscription } from '../../../../types';
import { formatCurrency } from '../../utils';
import { PencilIcon, TrashIcon } from '../../../../components/icons';
import ToggleSwitch from '../../../../ui/ToggleSwitch';

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
    onToggleActive: (subscription: Subscription) => void;
    loading?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    subscription: sub,
    onEdit,
    onDelete,
    onToggleActive,
    loading = false,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all max-w-md">
            <div className="p-4">
                {/* Header với actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{sub.name}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xl font-bold text-primary-600">{formatCurrency(sub.price)}</span>
                            <span className="text-sm text-gray-500">
                                / {sub.duration_months ? `${sub.duration_months} tháng` : 'Vĩnh viễn'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => onEdit(sub)} 
                            className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-gray-100" 
                            title="Chỉnh sửa"
                            disabled={loading}
                        >
                            <PencilIcon className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => onDelete(sub)} 
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" 
                            title="Xóa"
                            disabled={loading}
                        >
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>

                {/* Quota thông tin gọn gàng */}
                <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 px-2 py-1 rounded text-blue-700">
                            <span className="font-medium">{sub.daily_quota_ai_lesson || 0}</span> bài học AI
                        </div>
                        <div className="bg-green-50 px-2 py-1 rounded text-green-700">
                            <span className="font-medium">{sub.daily_quota_translate || 0}</span> dịch thuật
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>

                {/* Description - hiển thị gọn */}
                {sub.description && (
                    <div className="mb-3">
                        <div 
                            className="text-sm text-gray-600 prose prose-sm max-w-none 
                                       prose-ul:my-1 prose-li:my-0 prose-li:text-sm
                                       prose-ul:pl-4 prose-li:leading-snug"
                            dangerouslySetInnerHTML={{ 
                                __html: typeof sub.description === 'string' ? 
                                    sub.description : 
                                    (sub.description as any)?.html || ''
                            }} 
                        />
                    </div>
                )}

                {/* Status Toggle - gọn gàng hơn */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <ToggleSwitch 
                            checked={sub.is_active}
                            onChange={() => onToggleActive(sub)}
                            disabled={loading}
                        />
                        <span className={`text-sm font-medium ${sub.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {sub.is_active ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        #{sub.id.slice(-6)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCard;