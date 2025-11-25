import React from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { BellIcon, ChatAlt2Icon } from '../../../constants';

interface RecentUser {
    id: string;
    name: string;
    avatar_url: string | null;
    created_at: string;
}

interface CommunityActivityFeedProps {
    recentUsers: RecentUser[];
    pendingReportsCount: number;
    pendingAppealsCount: number;
    unreadNotificationsCount: number;
}

/**
 * Component hiển thị các hoạt động cộng đồng mới nhất,
 * bao gồm các mục cần hành động và người dùng mới.
 */
const CommunityActivityFeed: React.FC<CommunityActivityFeedProps> = ({ 
    recentUsers, 
    pendingReportsCount,
    pendingAppealsCount,
    unreadNotificationsCount
}) => {
    const navigate = useNavigate();
    const hasActionItems = pendingReportsCount > 0 || pendingAppealsCount > 0 || unreadNotificationsCount > 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động Cộng đồng</h2>
            <div className="flex-1 space-y-2">
                {/* Mục báo cáo - được làm nổi bật */}
                {pendingReportsCount > 0 && (
                    <ActionItem
                        icon={AlertTriangle}
                        iconColor="text-red-500"
                        bgColor="bg-red-50/50 hover:bg-red-100/70"
                        borderColor="border-red-400"
                        onClick={() => navigate('/reports')}
                    >
                        Bạn có <span className="font-bold text-red-600">{pendingReportsCount} báo cáo</span> đang chờ xử lý.
                    </ActionItem>
                )}
                
                {/* Mục khiếu nại - mới */}
                {pendingAppealsCount > 0 && (
                    <ActionItem
                        icon={ChatAlt2Icon}
                        iconColor="text-yellow-500"
                        bgColor="bg-yellow-50/50 hover:bg-yellow-100/70"
                        borderColor="border-yellow-400"
                        onClick={() => navigate('/reports?tab=appeals')}
                    >
                        Bạn có <span className="font-bold text-yellow-600">{pendingAppealsCount} khiếu nại</span> đang chờ xử lý.
                    </ActionItem>
                )}

                {/* Mục thông báo - mới */}
                {unreadNotificationsCount > 0 && (
                    <ActionItem
                        icon={BellIcon}
                        iconColor="text-blue-500"
                        bgColor="bg-blue-50/50 hover:bg-blue-100/70"
                        borderColor="border-blue-400"
                        onClick={() => navigate('/reports?tab=notifications')}
                    >
                         Bạn có <span className="font-bold text-blue-600">{unreadNotificationsCount} thông báo</span> chưa đọc.
                    </ActionItem>
                )}
                
                {/* Divider */}
                {hasActionItems && (
                    <div className="pt-2">
                        <hr className="border-gray-100" />
                    </div>
                )}
                
                {/* Danh sách người dùng mới */}
                <ul className="divide-y divide-gray-100">
                    {recentUsers.map(user => (
                        <li key={user.id} className="py-2">
                            <button onClick={() => navigate(`/users/${user.id}`)} className="w-full text-left flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <img src={user.avatar_url || ''} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="text-gray-800">
                                        Người dùng mới <span className="font-semibold text-primary-600">{user.name}</span> đã đăng ký.
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                     {recentUsers.length === 0 && (
                         <li className="text-center text-sm text-gray-400 pt-4">
                             Không có người dùng mới nào gần đây.
                         </li>
                     )}
                </ul>
            </div>
        </div>
    );
};

// Component con để tái sử dụng cho các mục action
const ActionItem: React.FC<{
    icon: React.ElementType,
    iconColor: string,
    bgColor: string,
    borderColor: string,
    onClick: () => void,
    children: React.ReactNode
}> = ({ icon: Icon, iconColor, bgColor, borderColor, onClick, children }) => {
    return (
        <button 
            onClick={onClick} 
            className={`w-full text-left p-3 rounded-lg border-l-4 transition-colors ${bgColor} ${borderColor}`}
        >
            <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 ${iconColor}`} />
                <div>
                    <p className="text-gray-800">{children}</p>
                    <p className="text-sm text-primary-600 font-medium hover:underline">Xem chi tiết</p>
                </div>
            </div>
        </button>
    );
};


export default CommunityActivityFeed;