/**
 * UI Components dùng chung cho UserActivityModal
 */
import React from 'react';

// Tab button component
export const TabButton: React.FC<{ 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    count?: number;
}> = ({ active, onClick, children, count }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            active ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
        {children}
        {count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20' : 'bg-gray-200'
            }`}>
                {count}
            </span>
        )}
    </button>
);

// SubTab button cho tab "Đã gỡ"
export const SubTabButton: React.FC<{ 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode 
}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            active ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

// Empty state component
export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <p className="text-center text-gray-500 py-16">{message}</p>
);
