import React from 'react';
import type { User } from '../../../../types';
import { fetchUserById } from '../../../users/userApi';

interface ClickableUserProps {
  userId: string;
  onUserClick: (user: User) => void;
  children: React.ReactNode;
  className?: string;
}

const ClickableUser: React.FC<ClickableUserProps> = ({
  userId,
  onUserClick,
  children,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const user = fetchUserById(userId);
    if (user) {
      onUserClick(user);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
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