import React, { useState, useEffect } from 'react';
import { Bell, Send, Inbox, Plus, Filter, Search } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import ReceivedNotifications from './components/ReceivedNotifications';
import SentNotifications from './components/SentNotifications';
import CreateNotificationModal from './components/CreateNotificationModal';

type TabType = 'received' | 'sent';

const AdminNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('received');
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
    // Refresh sent notifications if on that tab
    if (activeTab === 'sent') {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Thông báo</h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý thông báo đã nhận và đã gửi
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo thông báo</span>
          </button>
        </div>

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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'received'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Inbox className="w-5 h-5" />
                <span>Thông báo nhận ({stats.totalReceived})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Thông báo đã gửi ({stats.totalSent})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'received' ? (
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

export default AdminNotificationsPage;
