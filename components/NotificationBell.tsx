import React from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { unreadCount } = useNotification();

  const handleClick = () => {
    window.location.hash = '/notifications';
  };

  return (
    <button
      className={`relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none ${className}`}
      aria-label="Thông báo"
      onClick={handleClick}
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
