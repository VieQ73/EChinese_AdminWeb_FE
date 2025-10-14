
import React, { useState } from 'react';
import { List, Settings } from 'lucide-react';

const ExamListPage = React.lazy(() => import('./exam/ExamListPage'));
const ConfigurationTab = React.lazy(() => import('./config/ConfigurationTab'));


type ActiveTab = 'exam' | 'config';

const TabButton: React.FC<{
    tabName: ActiveTab;
    activeTab: ActiveTab;
    onClick: (tab: ActiveTab) => void;
    label: string;
    icon: React.FC<any>;
}> = ({ tabName, activeTab, onClick, label, icon: Icon }) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => onClick(tabName)}
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
};

const MockTestManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('exam');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'exam':
                return <ExamListPage />;
            case 'config':
                return <ConfigurationTab />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài thi</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton 
                        tabName="exam" 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                        label="Quản lý & Tạo Bài thi" 
                        icon={List} 
                    />
                    <TabButton 
                        tabName="config" 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                        label="Quản lý Cấu hình" 
                        icon={Settings} 
                    />
                </nav>
            </div>
            
            <React.Suspense fallback={<div className="text-center p-8">Đang tải...</div>}>
                {renderTabContent()}
            </React.Suspense>
        </div>
    );
};

export default MockTestManagementPage;