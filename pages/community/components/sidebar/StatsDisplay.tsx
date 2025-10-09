// StatsDisplay.tsx
import React, { useState } from 'react';
import { DocumentTextIcon, ChatAltIcon, ShieldExclamationIcon } from '../../../../constants';
import type { ModerationLog } from '../../../../types';
import ModerationLogList from '../moderation/ModerationLogList';

interface StatsDisplayProps {
    postCount: number;
    commentCount: number;
    moderationCount: number;
    logs: ModerationLog[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="flex items-center">
      <Icon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
      <div>
        <p className="text-lg font-semibold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500 truncate">{title}</p>
      </div>
    </div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
    active,
    onClick,
    children,
}) => (
    <button
        onClick={onClick}
        className={`flex-1 text-center px-4 py-2 text-sm font-medium transition-colors rounded-t-lg border ${
            active
                ? 'bg-white border-b-0 border-gray-200 text-primary-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200'
        }`}
    >
        {children}
    </button>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ postCount, commentCount, moderationCount, logs }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'logs'>('stats');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            {/* Tabs */}
            <div className="flex w-full border-b border-gray-200 -mb-px">
                <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
                    Thống kê nhanh
                </TabButton>
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
                    Kiểm duyệt
                </TabButton>
            </div>

            {/* Content */}
            <div className="pt-6">
                {activeTab === 'stats' && (
                    <div className="flex flex-col gap-4">
                        <StatCard title="Bài viết (Đã đăng)" value={postCount.toLocaleString()} icon={DocumentTextIcon} />
                        <StatCard title="Bình luận (Hoạt động)" value={commentCount.toLocaleString()} icon={ChatAltIcon} />
                        <StatCard title="Nội dung đã gỡ" value={moderationCount.toLocaleString()} icon={ShieldExclamationIcon} />
                    </div>
                )}
                {activeTab === 'logs' && <ModerationLogList logs={logs} />}
            </div>
        </div>
    );
};

export default StatsDisplay;