// contexts/appData/actions/settingsActions.ts
import { useCallback } from 'react';
import { Achievement, UserAchievement, BadgeLevel, User } from '../../../types';
import * as api from '../../../pages/settings/api';
import type { AddAdminLogPayload } from '../types';
import { cacheService } from '../../../services/cacheService';

interface UseSettingsActionsProps {
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  setUserAchievements: React.Dispatch<React.SetStateAction<UserAchievement[]>>;
  setBadges: React.Dispatch<React.SetStateAction<BadgeLevel[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useSettingsActions = ({
  setAchievements,
  setUserAchievements,
  setBadges,
  users,
  setUsers,
  addAdminLog,
}: UseSettingsActionsProps) => {

  // Achievements
  const createAchievement = useCallback(async (payload: api.AchievementPayload) => {
    const newAchievement = await api.createAchievement(payload);
    setAchievements(prev => [newAchievement, ...prev]);
    addAdminLog({ action_type: 'CREATE_ACHIEVEMENT', target_id: newAchievement.id, description: `Tạo thành tích: ${newAchievement.name}` });
    cacheService.invalidateSettings();
  }, [setAchievements, addAdminLog]);

  const updateAchievement = useCallback(async (id: string, payload: Partial<api.AchievementPayload>) => {
    const updated = await api.updateAchievement(id, payload);
    setAchievements(prev => prev.map(a => (a.id === id ? updated : a)));
    addAdminLog({ action_type: 'UPDATE_ACHIEVEMENT', target_id: id, description: `Cập nhật thành tích: ${updated.name}` });
    cacheService.invalidateSettings();
  }, [setAchievements, addAdminLog]);

  const deleteAchievement = useCallback(async (id: string) => {
    const achievementToDelete = (await api.fetchAchievements()).data.find(a => a.id === id);
    await api.deleteAchievement(id);
    setAchievements(prev => prev.filter(a => a.id !== id));
    setUserAchievements(prev => prev.filter(ua => ua.achievement_id !== id));
    if (achievementToDelete) {
        addAdminLog({ action_type: 'DELETE_ACHIEVEMENT', target_id: id, description: `Xóa thành tích: ${achievementToDelete.name}` });
    }
    cacheService.invalidateSettings();
  }, [setAchievements, setUserAchievements, addAdminLog]);
  
  const grantAchievementToUser = useCallback(async (userId: string, achievementId: string) => {
      const newUserAchievement = await api.grantAchievementToUser(userId, achievementId);
      setUserAchievements(prev => [newUserAchievement, ...prev]);
      addAdminLog({ action_type: 'GRANT_ACHIEVEMENT', target_id: userId, description: `Cấp thành tích (ID: ${achievementId}) cho người dùng.` });
  }, [setUserAchievements, addAdminLog]);

  // Badges
  const createBadge = useCallback(async (payload: api.BadgePayload) => {
    const newBadge = await api.createBadge(payload);
    setBadges(prev => [...prev, newBadge].sort((a,b) => a.min_points - b.min_points));
    addAdminLog({ action_type: 'CREATE_BADGE', target_id: newBadge.id, description: `Tạo huy hiệu: ${newBadge.name}` });
    cacheService.invalidateSettings();
  }, [setBadges, addAdminLog]);

  const updateBadge = useCallback(async (id: string, payload: Partial<api.BadgePayload>) => {
    const updated = await api.updateBadge(id, payload);
    setBadges(prev => prev.map(b => (b.id === id ? updated : b)).sort((a,b) => a.min_points - b.min_points));
    addAdminLog({ action_type: 'UPDATE_BADGE', target_id: id, description: `Cập nhật huy hiệu: ${updated.name}` });
    cacheService.invalidateSettings();
  }, [setBadges, addAdminLog]);

  const deleteBadge = useCallback(async (id: string) => {
    const badgeToDelete = (await api.fetchBadges()).find(b => b.id === id);
    await api.deleteBadge(id);
    setBadges(prev => prev.filter(b => b.id !== id));
    if (badgeToDelete) {
        addAdminLog({ action_type: 'DELETE_BADGE', target_id: id, description: `Xóa huy hiệu: ${badgeToDelete.name}` });
    }
    cacheService.invalidateSettings();
  }, [setBadges, addAdminLog]);

  const resyncAllUserBadges = useCallback(async () => {
      const  updatedUsers = await api.resyncAllUserBadges();
      // This is a mock implementation; a real app might just refetch all users.
      // Here, we update the existing users state.
      setUsers(updatedUsers);
      addAdminLog({ action_type: 'RESYNC_BADGES', description: 'Đồng bộ lại huy hiệu cho tất cả người dùng.' });
  }, [setUsers, addAdminLog]);

  return { createAchievement, updateAchievement, deleteAchievement, grantAchievementToUser, createBadge, updateBadge, deleteBadge, resyncAllUserBadges };
};
