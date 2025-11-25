import React from 'react';
import type { User } from '../../../../types';
import { fetchUserById } from '../../../users/userApi';

interface ClickableUserProps {
  userId: string;
  onUserClick: (user: User) => void;
  children: React.ReactNode;
  className?: string;
  // Minimal fallback shape from Post.user; may miss fields like email
  fallbackUser?: Partial<User> & { id: string; name: string; avatar_url?: string; badge_level?: number; role?: User['role'] };
}

const ClickableUser: React.FC<ClickableUserProps> = ({
  userId,
  onUserClick,
  children,
  className = '',
  fallbackUser
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    try {
      const user = await fetchUserById(userId);
      onUserClick(user);
    } catch (err) {
      if (fallbackUser) {
        onUserClick(fallbackUser as User);
      } else {
        // eslint-disable-next-line no-console
        console.warn('Không lấy được thông tin người dùng', err);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          await handleClick(e as any);
        }
      }}
    >
      {children}
    </div>
  );
};

export default ClickableUser;