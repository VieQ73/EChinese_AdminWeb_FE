import React, { useState } from 'react';
import { BellIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
}

// Component icon chuông thông báo với badge số lượng chưa đọc
const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { unreadCount } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Format số thông báo hiển thị
  const formatCount = (count: number) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <div className="relative">
      <button
        className={`relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors ${className}`}
        aria-label="Thông báo"
        onClick={handleClick}
      >
        <BellIcon className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full ring-2 ring-white">
            {formatCount(unreadCount)}
          </span>
        )}
      </button>
      
      <NotificationDropdown 
        isOpen={isDropdownOpen} 
        onClose={() => setIsDropdownOpen(false)} 
      />
    </div>
  );
};

export default NotificationBell;
