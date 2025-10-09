
import React from 'react';
import type { User, Subscription } from '../../../../types';
import { PencilIcon } from '../../../../constants';

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-md text-gray-900 break-words">{value}</p>
    </div>
);

interface UserSummaryTabProps {
    user: User;
    subscription?: Subscription;
    onOpenModal: (type: string, title: string, data?: any) => void;
    isViewingSelf?: boolean;
}

const UserSummaryTab: React.FC<UserSummaryTabProps> = ({ user, subscription, onOpenModal, isViewingSelf }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Thông tin người dùng</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
                <InfoItem label="Tên đăng nhập" value={<span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">@{user.username}</span>} />
                <InfoItem label="Tên hiển thị" value={user.name} />
                <InfoItem label="Email" value={user.email || 'Chưa có'} />
                <InfoItem label="Vai trò" value={<span className="capitalize font-medium">{user.role}</span>} />
                <InfoItem label="Trình độ HSK" value={`Cấp ${user.level}`} />
                <InfoItem label="Điểm cộng đồng" value={user.community_points.toLocaleString()} />
                <InfoItem label="Gói đăng ký" value={subscription?.name || 'Chưa có'} />
                <InfoItem label="Ngày tham gia" value={new Date(user.created_at).toLocaleDateString()} />
                <InfoItem label="Đăng nhập lần cuối" value={user.last_login ? new Date(user.last_login).toLocaleString() : 'Chưa từng'} />
            </div>
            <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-200 pt-6">
                <button onClick={() => onOpenModal('edit-info', 'Sửa thông tin')} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                    <PencilIcon className="w-4 h-4 mr-2" /> Sửa thông tin
                </button>
                <button 
                    onClick={() => onOpenModal(
                        user.is_active ? 'ban-user' : 'unban-user', 
                        user.is_active ? 'Cấm người dùng' : 'Bỏ cấm người dùng'
                    )} 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isViewingSelf}
                >
                    {user.is_active ? 'Cấm người dùng' : 'Bỏ cấm'}
                </button>
            </div>
        </div>
    );
};

export default UserSummaryTab;
