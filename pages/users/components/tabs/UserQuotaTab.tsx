
import React from 'react';
import type { UserUsage, Subscription } from '../../../../types';

interface QuotaCardProps {
    title: string;
    count: number;
    limit: number;
    onReset: () => void;
    canReset: boolean;
}

const QuotaCard: React.FC<QuotaCardProps> = ({ title, count, limit, onReset, canReset }) => {
    const percentage = limit > 0 ? Math.min((count / limit) * 100, 100) : 0;
    const isOverQuota = count > limit;

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                {canReset && <button onClick={onReset} className="text-xs font-medium text-primary-600 hover:underline">Reset</button>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${isOverQuota ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className={`text-sm mt-2 text-right font-medium ${isOverQuota ? 'text-red-600' : 'text-gray-600'}`}>
                {count.toLocaleString()} / {limit.toLocaleString()}
            </p>
        </div>
    );
};


interface UserQuotaTabProps {
    usageLesson?: UserUsage;
    usageTranslate?: UserUsage;
    subscription?: Subscription;
    isSuperAdmin: boolean;
    onOpenModal: (type: string, title: string, data?: any) => void;
}

const UserQuotaTab: React.FC<UserQuotaTabProps> = ({
    usageLesson,
    usageTranslate,
    subscription,
    isSuperAdmin,
    onOpenModal
}) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Quản lý Quota AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuotaCard
                    title="Tạo bài học AI"
                    count={usageLesson?.daily_count || 0}
                    limit={subscription?.daily_quota_ai_lesson || 0}
                    onReset={() => onOpenModal('reset-quota', 'Reset Quota Bài học AI', { feature: 'ai_lesson' })}
                    canReset={isSuperAdmin}
                />
                <QuotaCard
                    title="Dịch thuật AI"
                    count={usageTranslate?.daily_count || 0}
                    limit={subscription?.daily_quota_translate || 0}
                    onReset={() => onOpenModal('reset-quota', 'Reset Quota Dịch thuật AI', { feature: 'ai_translate' })}
                    canReset={isSuperAdmin}
                />
            </div>
        </div>
    );
};

export default UserQuotaTab;
