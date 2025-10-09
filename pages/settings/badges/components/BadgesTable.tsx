import React from 'react';
import { BadgeLevel } from '../../../../types';
import { PencilIcon, TrashIcon } from '../../../../constants';
import ToggleSwitch from '../../../../ui/ToggleSwitch';

interface BadgesTableProps {
    badges: BadgeLevel[];
    onEdit: (badge: BadgeLevel) => void;
    onToggleActive: (badge: BadgeLevel, isActive: boolean) => void;
    onDelete: (badge: BadgeLevel) => void;
}

const BadgesTable: React.FC<BadgesTableProps> = ({ badges, onEdit, onToggleActive, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Huy hiệu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm yêu cầu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả quy tắc</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kích hoạt</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {badges.map(badge => {
                        const canBeModified = ![0, 4, 5].includes(badge.level);
                        return (
                            <tr key={badge.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{badge.level}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={badge.icon} alt={badge.name} className="w-8 h-8 mr-3" />
                                        <span className="text-sm font-medium text-gray-800">{badge.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                    {badge.min_points.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={badge.rule_description}>
                                    {badge.rule_description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <ToggleSwitch 
                                        checked={badge.is_active}
                                        onChange={(checked) => onToggleActive(badge, checked)}
                                        disabled={!canBeModified}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(badge)} className="text-primary-600 hover:text-primary-900">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={() => onDelete(badge)} 
                                        className="text-red-600 hover:text-red-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        disabled={!canBeModified}
                                        title={!canBeModified ? "Không thể xóa huy hiệu hệ thống" : "Xóa huy hiệu"}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BadgesTable;