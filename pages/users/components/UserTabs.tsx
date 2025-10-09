
import React from 'react';
import { ClockIcon, ShieldExclamationIcon } from '../../../constants';

interface UserTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSuperAdmin: boolean;
}

const TabButton: React.FC<{
    name: string;
    label: string;
    activeTab: string;
    onClick: (name: string) => void;
    icon?: React.FC<any>;
    isDanger?: boolean;
}> = ({ name, label, activeTab, onClick, icon: Icon, isDanger }) => {
    const isActive = activeTab === name;
    const activeClasses = isDanger ? 'border-red-500 text-red-600' : 'border-primary-500 text-primary-600';
    const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

    return (
        <button
            onClick={() => onClick(name)}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? activeClasses : inactiveClasses}`}
        >
            {Icon && <Icon className="w-4 h-4 mr-1.5" />}
            {label}
        </button>
    );
};

const UserTabs: React.FC<UserTabsProps> = ({ activeTab, setActiveTab, isSuperAdmin }) => {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <TabButton name="summary" label="Tổng quan" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton name="activity" label="Hoạt động" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton name="achievements" label="Thành tích" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton name="quota" label="Sử dụng & Quota" activeTab={activeTab} onClick={setActiveTab} icon={ClockIcon} />
                {isSuperAdmin && (
                    <TabButton name="actions" label="Hành động" activeTab={activeTab} onClick={setActiveTab} icon={ShieldExclamationIcon} isDanger />
                )}
            </nav>
        </div>
    );
};

export default UserTabs;
