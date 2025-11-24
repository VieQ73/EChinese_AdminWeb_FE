import React from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Users } from 'lucide-react';
import { BellIcon, ChatAlt2Icon } from '../../../constants';

const UsersIcon = Users;

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
    
    // Tạo danh sách các items theo thứ tự ưu tiên
    const items: Array<{ type: string; component: React.ReactNode }> = [];
    
    // 1. Báo cáo (ưu tiên cao nhất)
    if (pendingReportsCount >= 0) {
        items.push({
            type: 'report',
            component: (
                <ActionItem
                    key="reports"
                    icon={AlertTriangle}
                    iconColor="text-red-500"
                    bgColor="bg-red-50/50 hover:bg-red-100/70"
                    borderColor="border-red-400"
                    onClick={() => navigate('/reports')}
                >
                    Bạn có <span className="font-bold text-red-600">{pendingReportsCount} báo cáo</span> đang chờ xử lý.
                </ActionItem>
            )
        });
    }
    
    // 2. Khiếu nại
    if (pendingAppealsCount >= 0) {
        items.push({
            type: 'appeal',
            component: (
                <ActionItem
                    key="appeals"
                    icon={ChatAlt2Icon}
                    iconColor="text-yellow-500"
                    bgColor="bg-yellow-50/50 hover:bg-yellow-100/70"
                    borderColor="border-yellow-400"
                    onClick={() => navigate('/reports?tab=appeals')}
                >
                    Bạn có <span className="font-bold text-yellow-600">{pendingAppealsCount} khiếu nại</span> đang chờ xử lý.
                </ActionItem>
            )
        });
    }
    
    // 3. Thông báo
    if (unreadNotificationsCount >= 0) {
        items.push({
            type: 'notification',
            component: (
                <ActionItem
                    key="notifications"
                    icon={BellIcon}
                    iconColor="text-blue-500"
                    bgColor="bg-blue-50/50 hover:bg-blue-100/70"
                    borderColor="border-blue-400"
                    onClick={() => navigate('/reports?tab=notifications')}
                >
                    Bạn có <span className="font-bold text-blue-600">{unreadNotificationsCount} thông báo</span> chưa đọc.
                </ActionItem>
            )
        });
    }
    
    // 4. Người dùng mới
    if (recentUsers.length > 0) {
        items.push({
            type: 'users',
            component: (
                <ActionItem
                    key="users"
                    icon={UsersIcon}
                    iconColor="text-green-500"
                    bgColor="bg-green-50/50 hover:bg-green-100/70"
                    borderColor="border-green-400"
                    onClick={() => navigate('/users')}
                >
                    Bạn có <span className="font-bold text-green-600">{recentUsers.length} người dùng mới</span> đã đăng ký gần đây.
                </ActionItem>
            )
        });
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động Cộng đồng</h2>
            <div className="flex-1 space-y-2">
                {items.length > 0 ? (
                    items.map(item => item.component)
                ) : (
                    <p className="text-center text-sm text-gray-400 pt-4">
                        Không có hoạt động nào gần đây.
                    </p>
                )}
            </div>
            <button
                onClick={() => navigate('/reports')}
                className="w-full mt-4 text-center text-sm font-medium text-primary-600 hover:text-primary-800"
            >
                Xem chi tiết
            </button>
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
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${iconColor}`} />
                <div className="flex-1">
                    <p className="text-sm text-gray-800">{children}</p>
                    <p className="text-xs text-primary-600 font-medium mt-1">Xem chi tiết</p>
                </div>
            </div>
        </button>
    );
};


export default CommunityActivityFeed;