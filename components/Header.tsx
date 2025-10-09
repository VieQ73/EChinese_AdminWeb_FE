
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogoutIcon, ChevronDownIcon } from '../constants';

const Header: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (!authContext) return null;
    const { user, logout } = authContext;

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
            <div>
                {/* Thanh tìm kiếm có thể đặt ở đây */}
            </div>
            <div className="relative">
                <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="flex items-center space-x-2 focus:outline-none p-1 rounded-lg hover:bg-gray-100"
                >
                    <img
                        className="h-9 w-9 rounded-full object-cover"
                        src={user?.avatar_url || `https://picsum.photos/seed/${user?.id}/100`}
                        alt="Ảnh đại diện quản trị viên"
                    />
                    <span className="text-gray-700 font-medium">{user?.name}</span>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <button
                            onClick={logout}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary-700"
                        >
                            <LogoutIcon className="w-5 h-5 mr-2" />
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
