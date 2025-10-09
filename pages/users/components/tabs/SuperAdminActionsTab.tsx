
import React from 'react';
import { UsersIcon, KeyIcon, TrashIcon } from '../../../../constants';

interface SuperAdminActionsTabProps {
    isViewingSelf: boolean;
    onOpenModal: (type: string, title: string) => void;
}

const SuperAdminActionsTab: React.FC<SuperAdminActionsTabProps> = ({ isViewingSelf, onOpenModal }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-red-600">Hành động của Super Admin</h3>
            <div className="space-y-4 max-w-sm">
                <button
                    disabled={isViewingSelf}
                    onClick={() => onOpenModal('change-role', 'Thay đổi vai trò')}
                    className="w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <UsersIcon className="w-5 h-5 mr-2" /> Thay đổi vai trò
                </button>
                <button
                    onClick={() => onOpenModal('reset-password', 'Đặt lại mật khẩu')}
                    className="w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                    <KeyIcon className="w-5 h-5 mr-2" /> Đặt lại mật khẩu
                </button>
                <button
                    disabled={isViewingSelf}
                    onClick={() => onOpenModal('delete-user', 'Xóa người dùng')}
                    className="w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <TrashIcon className="w-5 h-5 mr-2" /> Xóa người dùng
                </button>
                {isViewingSelf && <p className="text-sm text-gray-500 text-center pt-2">Không thể thực hiện các hành động này trên tài khoản của chính bạn.</p>}
            </div>
        </div>
    );
};

export default SuperAdminActionsTab;
