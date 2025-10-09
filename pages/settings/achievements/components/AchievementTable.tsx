import React from 'react';
import { Achievement } from '../../../../types';
import { PencilIcon, TrashIcon, UsersIcon } from '../../../../constants';
import ToggleSwitch from '../../../../ui/ToggleSwitch';

interface AchievementTableProps {
    achievements: Achievement[];
    loading: boolean;
    onEdit: (achievement: Achievement) => void;
    onDelete: (achievement: Achievement) => void;
    onViewUsers: (achievement: Achievement) => void;
    onToggleActive: (achievement: Achievement, isActive: boolean) => void; // Thêm prop mới
}

const AchievementTable: React.FC<AchievementTableProps> = ({ achievements, loading, onEdit, onDelete, onViewUsers, onToggleActive }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tích</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm thưởng</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kích hoạt</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
                    ) : achievements.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không tìm thấy thành tích nào.</td></tr>
                    ) : (
                        achievements.map(ach => (
                            <tr key={ach.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 object-contain mr-4" src={ach.icon || ''} alt="" />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{ach.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{ach.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">{ach.points}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ach.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <ToggleSwitch
                                        checked={ach.is_active}
                                        onChange={(checked) => onToggleActive(ach, checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => onViewUsers(ach)} className="text-gray-500 hover:text-blue-700" title="Xem người dùng"><UsersIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onEdit(ach)} className="text-gray-500 hover:text-primary-700" title="Chỉnh sửa"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(ach)} className="text-gray-500 hover:text-red-700" title="Xóa"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AchievementTable;