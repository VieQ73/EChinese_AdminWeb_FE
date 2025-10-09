import React, { useMemo } from 'react';
import { useAppData } from '../../../../contexts/AppDataContext';
import { Achievement } from '../../../../types';

interface UserAchievementsTabProps {
    userId: string;
}

const UserAchievementsTab: React.FC<UserAchievementsTabProps> = ({ userId }) => {
    // Lấy cả thành tích của user và danh sách thành tích gốc từ context
    const { userAchievements, achievements: allAchievements } = useAppData();
    
    // Lọc và làm giàu dữ liệu thành tích để hiển thị
    const displayedAchievements = useMemo(() => {
        // Tạo một Set chứa ID của các thành tích đang hoạt động để tra cứu nhanh
        const activeAchievementIds = new Set(
            allAchievements.filter(ach => ach.is_active).map(ach => ach.id)
        );

        return userAchievements
            // 1. Lọc lấy thành tích của user hiện tại
            .filter(ach => ach.user_id === userId)
            // 2. Chỉ giữ lại những thành tích đang được kích hoạt
            .filter(ach => activeAchievementIds.has(ach.achievement_id))
            // 3. Làm giàu dữ liệu với thông tin đầy đủ từ danh sách gốc
            .map(userAch => {
                const masterAchievement = allAchievements.find(a => a.id === userAch.achievement_id);
                return {
                    ...userAch,
                    // Lấy thông tin mới nhất từ master data
                    name: masterAchievement?.name || userAch.achievement_name,
                    description: masterAchievement?.description || 'Không có mô tả',
                    icon: masterAchievement?.icon,
                };
            })
            // Sắp xếp theo ngày đạt được gần nhất
            .sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime());

    }, [userId, userAchievements, allAchievements]);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Các thành tích đã đạt được</h3>
            {displayedAchievements.length > 0 ? (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    {displayedAchievements.map(ach => (
                        <li key={ach.id} className="p-4 flex items-center">
                            <img 
                                src={ach.icon || 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png'} 
                                alt={ach.name}
                                className="w-12 h-12 object-contain mr-4 flex-shrink-0"
                            />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{ach.name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{ach.description}</p>
                                <p className="text-xs text-gray-400 mt-1">Đạt được vào: {new Date(ach.achieved_at).toLocaleDateString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Người dùng này chưa đạt được thành tích nào (đang hoạt động).</p>
                </div>
            )}
        </div>
    );
};

export default UserAchievementsTab;