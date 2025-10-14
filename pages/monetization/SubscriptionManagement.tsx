import React, { useState } from 'react';

// Tab definitions and types
import { MONETIZATION_TABS, MonetizationTabId } from './constants';

// Lazy load tab components for better performance
const MonetizationDashboard = React.lazy(() => import('./dashboard/MonetizationDashboard'));
const SubscriptionPlans = React.lazy(() => import('./subscriptions/SubscriptionPlans'));
const PaymentList = React.lazy(() => import('./payments/PaymentList'));
const RefundList = React.lazy(() => import('./refunds/RefundList'));
const UserSubscriptionList = React.lazy(() => import('./user-subscriptions/UserSubscriptionList'));


const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    label: string;
    icon: React.FC<any>;
}> = ({ isActive, onClick, label, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
            isActive
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon className="w-5 h-5 mr-2" />
        {label}
    </button>
);

const SubscriptionManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MonetizationTabId>('dashboard');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard': return <MonetizationDashboard />;
            case 'subscriptions': return <SubscriptionPlans />;
            case 'payments': return <PaymentList />;
            case 'refunds': return <RefundList />;
            case 'user-subscriptions': return <UserSubscriptionList />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Gói đăng ký và Thanh toán</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {MONETIZATION_TABS.map(tab => (
                        <TabButton
                            key={tab.id}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            label={tab.label}
                            icon={tab.icon}
                        />
                    ))}
                </nav>
            </div>
            
            <React.Suspense fallback={<div className="text-center p-8">Đang tải...</div>}>
                {renderTabContent()}
            </React.Suspense>
        </div>
    );
};

export default SubscriptionManagement;
