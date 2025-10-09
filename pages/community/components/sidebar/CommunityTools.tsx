import React from 'react';
import UserSearch from './UserSearch';
import { POST_TOPICS } from '../../../../constants';
import { User } from '../../../../types';

interface CommunityToolsProps {
    topic: string;
    onTopicChange: (topic: string) => void;
    onUserSelect: (user: User) => void;
}

const CommunityTools: React.FC<CommunityToolsProps> = ({ topic, onTopicChange, onUserSelect }) => {
    return (
        <div className="space-y-6">
            {/* Phần tìm kiếm người dùng */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <UserSearch onUserSelect={onUserSelect} />
            </div>

            {/* Phần lọc theo chủ đề */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-sm font-medium text-gray-700 mb-2">Lọc theo chủ đề</h3>
                <select
                    value={topic}
                    onChange={(e) => onTopicChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                    <option value="all">Tất cả chủ đề</option>
                    {POST_TOPICS.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
            </div>
        </div>
    );
};

export default CommunityTools;