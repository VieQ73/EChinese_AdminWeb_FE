import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, Book, FileText, MessageSquare,
    AlertCircle, Settings, LogOut, Menu, X
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * @fileoverview MainLayout component - Layout chính cho Admin Dashboard
 * @description Cung cấp cấu trúc layout chung cho các trang admin, bao gồm Sidebar điều hướng,
 * Header (cho mobile), và khu vực nội dung chính.
 */

// Định nghĩa tạm thời cho component Button để khắc phục lỗi biên dịch.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'ghost' | 'secondary' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    children, 
    ...props 
}) => {
    // Logic Tailwind CSS mapping cho các variant và size
    const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
    
    const sizeClasses = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10 p-0',
    }[size];

    const variantClasses = {
        default: 'bg-teal-600 text-white hover:bg-teal-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-200 bg-white hover:bg-gray-100',
    }[variant];

    const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className || ''}`;

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
};

// --- Kết thúc định nghĩa Button ---

interface NavItem {
    id: string;
    name: string;
    icon: React.ElementType;
    path: string;
}

// Định nghĩa các mục điều hướng với icons từ Lucide React
const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'users', name: 'Quản lý Người dùng', icon: Users, path: '/users' },
    { id: 'vocabulary', name: 'Sổ tay và Từ vựng', icon: Book, path: '/notebooks' },
    { id: 'tests', name: 'Đề thi Mock Test', icon: FileText, path: '/tests' },
    { id: 'posts', name: 'Nội dung Cộng đồng', icon: MessageSquare, path: '/admin/community' },
    { id: 'reports', name: 'Báo cáo vi phạm', icon: AlertCircle, path: '/reports' },
    { id: 'system', name: 'Hệ thống & Cấu hình', icon: Settings, path: '/system' },
    { id: 'change-password', name: 'Đổi mật khẩu', icon: Settings, path: '/change-password' },
];

interface SidebarItemProps {
    item: NavItem;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, onClick }) => {
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
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const currentPath = location.pathname;
    const currentNavItem = navItems.find(item => currentPath.startsWith(item.path));
    const currentTitle = currentNavItem?.name || 'EChinese Admin';

    const handleSidebarItemClick = () => {
        setIsSidebarOpen(false);
    };
    
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Cleanup function: Khôi phục style cũ khi component unmount
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    return (
        // Container chính: h-screen cố định chiều cao bằng viewport, thêm w-full.
        <div className="flex h-screen w-full bg-gray-50 font-sans">
            {/* Overlay cho Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (thêm h-full để kéo dài hết chiều dọc màn hình) */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-xl p-4 md:p-6 z-40 flex flex-col border-r border-gray-100 h-full`}
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

                {/* Navigation Links: flex-1 để chiếm hết khoảng trống giữa logo và nút Đăng xuất */}
                <nav className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            onClick={handleSidebarItemClick}
                        />
                    ))}
                    {/* Phần trống ở đây do nav class="flex-1" tạo ra */}
                </nav>

                {/* Footer/Logout: mt-auto đẩy nó xuống dưới cùng */}
                <div className="pt-6 border-t mt-auto">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={onLogout}
                        className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="truncate">Đăng xuất</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area: flex-1 để chiếm phần còn lại, flex-col để sắp xếp dọc */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header/Toggle Button for Mobile (Fixed Height) */}
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
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
