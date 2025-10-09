import React from 'react';
import { BadgeLevel } from '../../../../types';
import { useAppData } from '../../../../contexts/AppDataContext';
import { BadgeIcon } from '../../../../constants';

interface BadgeProps {
    badge: BadgeLevel;
}

const BADGE_COLORS = [
    'bg-gray-100 text-gray-800',       // Level 0
    'bg-green-100 text-green-800',     // Level 1
    'bg-blue-100 text-blue-800',       // Level 2
    'bg-purple-100 text-purple-800',   // Level 3
    'bg-yellow-100 text-yellow-800',   // Level 4
    'bg-red-100 text-red-800',         // Level 5
];

const Badge: React.FC<BadgeProps> = ({ badge: initialBadge }) => {
    const { badges } = useAppData();
    // Lấy thông tin huy hiệu mới nhất từ context, nếu không có thì dùng prop ban đầu
    // Điều này đảm bảo tên/icon luôn được cập nhật
    const badge = badges.find(b => b.level === initialBadge.level) || initialBadge;

    const colorClass = BADGE_COLORS[badge.level] || BADGE_COLORS[0];

    return (
        <div className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            <img src={badge.icon} alt={badge.name} className="w-3 h-3 mr-1" />
            {badge.name}
        </div>
    );
};

export default Badge;