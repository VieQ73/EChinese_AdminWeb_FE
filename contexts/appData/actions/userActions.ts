// contexts/appData/actions/userActions.ts
import { useCallback } from 'react';
import { User, UserUsage } from '../../../types';
import type { AddAdminLogPayload } from '../types';

interface UseUserActionsProps {
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setUserUsage: React.Dispatch<React.SetStateAction<UserUsage[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useUserActions = ({ setUsers, setUserUsage, addAdminLog }: UseUserActionsProps) => {

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    // Ghi log được xử lý ở tầng cao hơn (ví dụ: useUserActions hook của trang UserDetail)
    // để có ngữ cảnh đầy đủ hơn.
  }, [setUsers]);
  
  const updateUserUsage = useCallback((userId: string, feature: 'ai_lesson' | 'ai_translate', updates: Partial<UserUsage>) => {
      setUserUsage(prev => {
          const index = prev.findIndex(u => u.user_id === userId && u.feature === feature);
          if (index > -1) {
              const newState = [...prev];
              newState[index] = { ...newState[index], ...updates };
              return newState;
          }
          return prev; // Or create a new one if it doesn't exist
      });
  }, [setUserUsage]);

  return { updateUser, updateUserUsage };
};
