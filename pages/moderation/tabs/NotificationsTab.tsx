import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import ReceivedNotifications from '../../notifications/components/ReceivedNotifications';
import SentNotifications from '../../notifications/components/SentNotifications';
import CreateNotificationModal from '../../notifications/components/CreateNotificationModal';
import { Bell, Send, Inbox, Plus } from 'lucide-react';

type ActiveSubTab = 'received' | 'sent';

interface NotificationsTabProps {
    notifications?: any[]; // Không dùng nữa, sẽ fetch trực tiếp
    onNavigateToAction?: (type?: string, id?: string) => void;
    refreshData?: () => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
    const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('received');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({
        totalReceived: 0,
        totalSent: 0,
        unreadCount: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await apiClient.get<any>('/admin/notifications/all?page=1&limit=1');
            setStats({
                totalReceived: response.meta?.totalReceived || 0,
                totalSent: response.meta?.totalSent || 0,
                unreadCount: response.meta?.unreadCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleNotificationCreated = () => {
        setShowCreateModal(false);
        fetchStats();
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Inbox className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Đã nhận</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalReceived}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Send className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Đã gửi</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalSent}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Bell className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Chưa đọc</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.unreadCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveSubTab('received')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    activeSubTab === 'received'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Inbox className="w-5 h-5" />
                                <span>Thông báo nhận ({stats.totalReceived})</span>
                            </button>

                            <button
                                onClick={() => setActiveSubTab('sent')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    activeSubTab === 'sent'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                                <span>Thông báo đã gửi ({stats.totalSent})</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Tạo thông báo</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeSubTab === 'received' ? (
                        <ReceivedNotifications onStatsUpdate={fetchStats} />
                    ) : (
                        <SentNotifications />
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateNotificationModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleNotificationCreated}
                />
            )}
        </div>
    );
};

export default NotificationsTab;
