import React, { useState } from 'react';
import {
    LayoutDashboard, Users, Book, FileText, MessageSquare,
    AlertCircle, Settings, LogOut, Menu, X, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { NavLink, useLocation } from 'react-router-dom'; // Import NavLink và useLocation từ react-router-dom

/**
 * @fileoverview MainLayout component - Layout chính cho Admin Dashboard
 * @description Cung cấp cấu trúc layout chung cho các trang admin, bao gồm Sidebar điều hướng,
 * Header (cho mobile), và khu vực nội dung chính.
 * Sử dụng Lucide React cho icons và Button component chung.
 */

interface NavItem {
    id: string;
    name: string;
    icon: React.ElementType; // Sử dụng React.ElementType cho Lucide icon components
    path: string; // Thêm path để dùng với NavLink
}

// Định nghĩa các mục điều hướng với icons từ Lucide React
const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'users', name: 'Quản lý Người dùng', icon: Users, path: '/users' },
    { id: 'vocabulary', name: 'Sổ tay và Từ vựng', icon: Book, path: '/notebooks' }, // Link tới notebooks
    { id: 'tests', name: 'Đề thi Mock Test', icon: FileText, path: '/tests' }, // Path tạm
    { id: 'posts', name: 'Nội dung Cộng đồng', icon: MessageSquare, path: '/posts' }, // Path tạm
    { id: 'reports', name: 'Báo cáo vi phạm', icon: AlertCircle, path: '/reports' }, // Path tạm
    { id: 'system', name: 'Hệ thống & Cấu hình', icon: Settings, path: '/system' }, // Path tạm
    { id: 'change-password', name: 'Đổi mật khẩu', icon: Settings, path: '/change-password' },
];

interface SidebarItemProps {
    item: NavItem;
    // current: string; // Không cần current nữa vì NavLink tự quản lý active
    onClick: () => void; // Hàm này sẽ đóng sidebar trên mobile
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, onClick }) => {
    // NavLink tự động thêm class 'active' nếu path khớp, chúng ta sẽ dùng nó
    return (
        <NavLink
            to={item.path}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center p-3 rounded-xl transition duration-200 cursor-pointer text-sm font-medium w-full justify-start
                ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-teal-500 hover:text-white'}`
            }
        >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="truncate">{item.name}</span>
        </NavLink>
    );
};

interface MainLayoutProps {
    children: React.ReactNode;
    onLogout: () => void; // Thêm onLogout vào props
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Dành cho Mobile
    const location = useLocation(); // Để lấy path hiện tại và hiển thị tiêu đề

    // Sử dụng location để tìm tên trang hiện tại cho header mobile
    const currentPath = location.pathname;
    const currentNavItem = navItems.find(item => currentPath.startsWith(item.path));
    const currentTitle = currentNavItem?.name || 'EChinese Admin';

    // Đóng sidebar khi navigate trên mobile
    const handleSidebarItemClick = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Overlay cho Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-xl p-4 md:p-6 z-40 flex flex-col border-r border-gray-100`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 md:h-20 border-b pb-4 mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-wider">
                        <span className="text-teal-600">EChinese</span> Admin
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-gray-500 hover:text-teal-600"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            onClick={handleSidebarItemClick} // Đóng sidebar khi click
                        />
                    ))}
                </nav>

                {/* Footer/Logout */}
                <div className="pt-6 border-t mt-auto">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={onLogout} // Gọi onLogout từ props
                        className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="truncate">Đăng xuất</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header/Toggle Button for Mobile */}
                <header className="flex items-center justify-between p-4 bg-white shadow-sm lg:hidden h-16 md:h-20 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">
                        {currentTitle}
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-teal-600"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    {children} {/* Đây là nơi nội dung của route con sẽ được render */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;