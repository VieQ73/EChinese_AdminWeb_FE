import React, { useState } from 'react';

interface NavItem {
    id: string;
    name: string;
    icon: string; // SVG path
}

const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'users', name: 'Quản lý Người dùng', icon: 'M17 20h5v-5a3 3 0 00-3-3H8a3 3 0 00-3 3v5h5M17 4v2a3 3 0 003 3h2v5a3 3 0 01-3 3H8a3 3 0 01-3-3V9a3 3 0 013-3h5' },
    { id: 'vocabulary', name: 'Từ vựng & Bài học', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'tests', name: 'Đề thi Mock Test', icon: 'M9 12h6m-6 4h6m-5 4h4a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'posts', name: 'Nội dung Cộng đồng', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H7a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v2M7 12h4' },
    { id: 'reports', name: 'Báo cáo vi phạm', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.464c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'system', name: 'Hệ thống & Cấu hình', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const SidebarItem: React.FC<{ item: NavItem; current: string; onClick: (id: string) => void }> = ({ item, current, onClick }) => {
    const isActive = item.id === current;
    const baseClasses = "flex items-center p-3 rounded-xl transition duration-200 cursor-pointer text-sm font-medium hover:bg-teal-500 hover:text-white";
    const activeClasses = isActive ? "bg-teal-600 text-white shadow-md" : "text-gray-700 hover:bg-teal-500 hover:text-white";

    return (
        <button
            onClick={() => onClick(item.id)}
            className={`${baseClasses} ${activeClasses} w-full`}
        >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
            </svg>
            <span className="truncate">{item.name}</span>
        </button>
    );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Dành cho Mobile

    const handleLogout = () => {
        // Giả lập logic đăng xuất
        localStorage.removeItem('admin_token');
        window.location.reload(); // Tải lại trang để về AuthPage
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Overlay cho Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out w-64 bg-white shadow-xl p-6 z-40 flex flex-col border-r border-gray-100`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 border-b pb-6 mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-wider">
                        <span className="text-teal-600">EChinese</span> Admin
                    </h1>
                    <button 
                        className="lg:hidden text-gray-500 hover:text-teal-600"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            current={currentPage}
                            onClick={setCurrentPage}
                        />
                    ))}
                </nav>

                {/* Footer/Logout */}
                <div className="pt-6 border-t mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition duration-200"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header/Toggle Button for Mobile */}
                <header className="flex items-center justify-between p-4 bg-white shadow-sm lg:hidden h-16 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">
                        {navItems.find(item => item.id === currentPage)?.name || 'EChinese Admin'}
                    </h1>
                    <button
                        className="text-gray-500 hover:text-teal-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
