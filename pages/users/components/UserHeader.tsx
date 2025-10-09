import React from 'react';
// FIX: Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import type { User } from '../../../types';
import { ArrowLeftIcon, ShieldExclamationIcon } from '../../../constants';

interface UserHeaderProps {
    user: User;
    onBack: () => void;
    violationCount: number; 
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onBack, violationCount }) => {
    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center text-primary-600 mb-4 font-medium hover:underline"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Quay lại danh sách
            </button>

            <div className="flex items-center">
                <img
                    src={user.avatar_url || ''}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mr-6"
                />

                <div>
                    {/* Hàng hiển thị tên + số vi phạm */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>

                        {violationCount > 0 && (
                            <div className="flex items-center text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                                {violationCount} vi phạm
                            </div>
                        )}
                    </div>

                    {/* Hàng hiển thị trạng thái hoạt động */}
                    <div className="mt-2">
                        <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {user.is_active ? 'Đang hoạt động' : 'Đã bị cấm'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHeader;
