import React from 'react';

interface UserSubscriptionToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const UserSubscriptionToolbar: React.FC<UserSubscriptionToolbarProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <input
                type="text"
                placeholder="Tìm theo tên, email, user ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
    );
};

export default UserSubscriptionToolbar;