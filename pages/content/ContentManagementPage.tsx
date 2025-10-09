import React, { useState } from 'react';
import NotebooksTab from './notebooks/NotebooksTab';
import VocabularyTab from './vocabulary/VocabularyTab';
import { NotebookIcon, SparklesIcon } from '../../constants';

type ActiveTab = 'notebooks' | 'vocabulary';

const ContentManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('notebooks');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'notebooks':
                return <NotebooksTab />;
            case 'vocabulary':
                return <VocabularyTab />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.FC<any> }> = ({ tabName, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tabName
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Sổ tay & Từ vựng</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabName="notebooks" label="Quản lý Sổ tay" icon={NotebookIcon} />
                    <TabButton tabName="vocabulary" label="Quản lý Từ vựng" icon={SparklesIcon} />
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ContentManagementPage;