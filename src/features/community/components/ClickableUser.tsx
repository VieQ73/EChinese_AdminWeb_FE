import React from 'react';
import type { User } from '../../../types/entities';
import { getAllMockUsers } from '../../users/userApi';

interface ClickableUserProps {
  userId: string;
  onUserClick: (user: User) => void;
  children: React.ReactNode;
  className?: string;
}

// Component để wrap avatar/tên user có thể click được
const ClickableUser: React.FC<ClickableUserProps> = ({
  userId,
  onUserClick,
  children,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn event bubble up
    
    // Tìm user từ userId
    const user = getAllMockUsers().find(u => u.id === userId);
    if (user) {
      onUserClick(user);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
    >
      {children}
    </div>
  );
};

export default ClickableUser;