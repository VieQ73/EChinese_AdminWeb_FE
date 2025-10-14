import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_LINKS, IconProps } from '../constants';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    return (
        <aside 
            className={`flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-20'
            }`}
        >
            <div className="h-16 flex items-center justify-center border-b border-gray-200 flex-shrink-0">
                {isOpen ? (
                    <h1 className="text-2xl font-bold text-primary-600">EChinese Admin</h1>
                ) : (
                    <h1 className="text-3xl font-bold text-primary-600">E</h1>
                )}
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {NAVIGATION_LINKS.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-blue-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-primary-700'
                                    } ${
                                        !isOpen && 'justify-center'
                                    }`
                                }
                                title={!isOpen ? item.name : undefined}
                            >
                                <item.icon className="w-6 h-6 flex-shrink-0" />
                                {isOpen && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;