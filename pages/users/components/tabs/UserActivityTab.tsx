
import React from 'react';
import type { UserStreak, UserDailyActivity, UserSession } from '../../../../types';
import { FireIcon, AchievementIcon } from '../../../../constants';

interface UserActivityTabProps {
    streak?: UserStreak;
    dailyActivities: UserDailyActivity[];
    sessions: UserSession[];
}

const UserActivityTab: React.FC<UserActivityTabProps> = ({ streak, dailyActivities, sessions }) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thống kê Gamification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <FireIcon className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Chuỗi đăng nhập hiện tại</p>
                            <p className="text-2xl font-bold text-gray-900">{streak?.current_streak || 0} ngày</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
                        <div className="bg-gray-200 p-3 rounded-lg">
                            <AchievementIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Chuỗi dài nhất</p>
                            <p className="text-2xl font-bold text-gray-900">{streak?.longest_streak || 0} ngày</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Hoạt động hàng ngày</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số phút online</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lần đăng nhập</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dailyActivities.map(activity => (
                                <tr key={activity.date}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(activity.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.minutes_online}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.login_count}</td>
                                </tr>
                            ))}
                            {dailyActivities.length === 0 && (
                                <tr><td colSpan={3} className="text-center py-4 text-gray-500">Không có hoạt động nào được ghi nhận.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Các phiên đăng nhập gần đây</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian đăng nhập</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian đăng xuất</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ IP</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map(session => (
                                <tr key={session.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(session.login_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.logout_at ? new Date(session.logout_at).toLocaleString() : 'Đang hoạt động'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.device}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.ip_address}</td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-4 text-gray-500">Không có phiên đăng nhập nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserActivityTab;
