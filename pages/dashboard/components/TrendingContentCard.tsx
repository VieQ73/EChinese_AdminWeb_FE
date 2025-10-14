import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { User } from '../../../types';
import { Users, BarChart2 } from 'lucide-react';

interface TopUser {
    user?: User;
    score: number;
    scorePercent: number;
}

interface TopTopic {
    topic: string;
    count: number;
    percent: number;
}

interface TrendingContentCardProps {
    topUsers: TopUser[];
    topTopics: TopTopic[];
}

type ActiveTab = 'users' | 'topics';

const TrendingContentCard: React.FC<TrendingContentCardProps> = ({ topUsers, topTopics }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('users');
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Xu hướng Cộng đồng</h2>
            
            {/* Tabs */}
            <div className="flex-shrink-0 mb-4">
                <div className="bg-gray-100 p-1 rounded-full flex space-x-1">
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                        <Users size={16} className="mr-2"/> Người dùng nổi bật
                    </TabButton>
                    <TabButton active={activeTab === 'topics'} onClick={() => setActiveTab('topics')}>
                        <BarChart2 size={16} className="mr-2"/> Chủ đề sôi nổi
                    </TabButton>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                {activeTab === 'users' && <TopUsersList users={topUsers} onUserClick={(id) => navigate(`/users/${id}`)} />}
                {activeTab === 'topics' && <TopTopicsList topics={topTopics} />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center ${
            active ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);

const TopUsersList: React.FC<{ users: TopUser[], onUserClick: (id: string) => void }> = ({ users, onUserClick }) => (
    <ol className="space-y-3">
        {users.map((item, index) => item.user && (
            <li key={item.user.id} className="group cursor-pointer" onClick={() => onUserClick(item.user!.id)}>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-400 w-5 text-center">{index + 1}</span>
                    <img src={item.user.avatar_url || ''} alt={item.user.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate group-hover:text-primary-600">{item.user.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${item.scorePercent}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{item.score.toFixed(1)}</span>
                </div>
            </li>
        ))}
        {users.length === 0 && <p className="text-sm text-center text-gray-500 py-8">Không có hoạt động nào trong tuần qua.</p>}
    </ol>
);

const TopTopicsList: React.FC<{ topics: TopTopic[] }> = ({ topics }) => (
    <ul className="space-y-4">
        {topics.map(item => (
            <li key={item.topic}>
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-semibold text-gray-800">{item.topic}</span>
                    <span className="font-medium text-gray-500">{item.count} bài</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percent}%` }}
                    />
                </div>
            </li>
        ))}
        {topics.length === 0 && <p className="text-sm text-center text-gray-500 py-8">Không có bài viết nào trong tuần qua.</p>}
    </ul>
);

export default TrendingContentCard;