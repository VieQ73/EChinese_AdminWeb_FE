import React from 'react';
import StatsDisplay from './StatsDisplay';
import CommunityTools from './CommunityTools'; // Import component công cụ mới
import type { ModerationLog, User } from '../../../../types';

interface StatsProps {
    postCount: number;
    commentCount: number;
    moderationCount: number;
    logs: ModerationLog[];
}

interface CommunitySidebarProps {
    stats: StatsProps;
    topicFilter: string;
    onTopicFilterChange: (topic: string) => void;
    onUserSelect: (user: User) => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ stats, topicFilter, onTopicFilterChange, onUserSelect }) => {
    return (
        <div className="space-y-6">
            {/* Component hiển thị thống kê */}
            <StatsDisplay
                postCount={stats.postCount}
                commentCount={stats.commentCount}
                moderationCount={stats.moderationCount}
                logs={stats.logs}
            />
            {/* Component mới chứa các công cụ */}
            <CommunityTools
                topic={topicFilter}
                onTopicChange={onTopicFilterChange}
                onUserSelect={onUserSelect}
            />
        </div>
    );
};

export default CommunitySidebar;