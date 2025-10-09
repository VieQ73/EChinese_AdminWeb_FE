import React, { useState } from 'react';
import { AchievementIcon, BadgeIcon } from '../../constants';
import AchievementsTab from './achievements/AchievementsTab';
import BadgesTab from './badges/BadgesTab';

type ActiveTab = 'achievements' | 'badges';

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

const AchievementManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('achievements');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'achievements':
                return <AchievementsTab />;
            case 'badges':
                return <BadgesTab />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Thành tích và Huy hiệu</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton 
                        tabName="achievements" 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                        label="Quản lý Thành tích" 
                        icon={AchievementIcon} 
                    />
                    <TabButton 
                        tabName="badges" 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                        label="Quản lý Huy hiệu" 
                        icon={BadgeIcon} 
                    />
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AchievementManagement;
