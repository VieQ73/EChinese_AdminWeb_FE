
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MockTest } from '../../types/mocktest';
import { MockTestList } from './components/MockTestList';
import { MockTestFormModal } from './modals/MockTestFormModal';
import { TestTypeTabs } from './components/TestTypeTabs';
import { useTestCounts } from './hooks/useTestCounts';

const MockTestManagement: React.FC = () => {
    const navigate = useNavigate();
    
    // Tab states
    const [activeTab, setActiveTab] = useState('hsk');
    const [activeLevel, setActiveLevel] = useState('all');
    const [activeType, setActiveType] = useState<'HSK' | 'TOCFL' | 'D4' | 'HSKK'>('HSK');
    
    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingTest, setEditingTest] = useState<MockTest | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Test counts
    const { testCounts, loading: countsLoading, refreshCounts } = useTestCounts();

    // Handlers
    const handleTabChange = (tabId: string, type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK') => {
        setActiveTab(tabId);
        setActiveType(type);
        setActiveLevel('all'); // Reset level when changing type
    };

    const handleLevelChange = (level: string) => {
        setActiveLevel(level);
    };

    const handleCreateClick = () => {
        setEditingTest(null);
        setShowFormModal(true);
    };

    const handleEditClick = (test: MockTest) => {
        setEditingTest(test);
        setShowFormModal(true);
    };

    const handleViewDetailsClick = (test: MockTest) => {
        navigate(`/tests/${test.id}`);
    };

    const handleFormModalClose = () => {
        setShowFormModal(false);
        setEditingTest(null);
    };

    const handleFormSave = (test: MockTest) => {
        // Refresh danh sách và đóng modal
        setRefreshKey(prev => prev + 1);
        refreshCounts(); // Also refresh the tab counts
        setShowFormModal(false);
        setEditingTest(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <TestTypeTabs
                    activeTab={activeTab}
                    activeLevel={activeLevel}
                    onTabChange={handleTabChange}
                    onLevelChange={handleLevelChange}
                    testCounts={testCounts}
                />
                
                <div className="p-6">
                    <MockTestList
                        onCreateClick={handleCreateClick}
                        onEditClick={handleEditClick}
                        onViewDetailsClick={handleViewDetailsClick}
                        refreshKey={refreshKey}
                        filterType={activeType}
                        filterLevel={activeLevel === 'all' ? undefined : activeLevel}
                    />
                </div>
            </div>
            
            <MockTestFormModal
                isOpen={showFormModal}
                onClose={handleFormModalClose}
                onSave={handleFormSave}
                editingTest={editingTest}
            />
        </div>
    );
};

export default MockTestManagement;
