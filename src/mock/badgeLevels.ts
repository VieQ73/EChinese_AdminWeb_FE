import type { BadgeLevel } from '../types/entities';

// Mock data cho BadgeLevel dựa trên database schema
export const mockBadgeLevels: BadgeLevel[] = [
  { level: 0, name: 'Người mới', icon: '🌱' },
  { level: 1, name: 'Học viên', icon: '📚' },
  { level: 2, name: 'Thành thạo', icon: '⭐' },
  { level: 3, name: 'Chuyên gia', icon: '🏆' },
  { level: 4, name: 'Quản trị viên', icon: '👑' },
  { level: 5, name: 'Siêu quản trị', icon: '💎' },
];

export const getBadgeByLevel = (level: number): BadgeLevel => {
  return mockBadgeLevels.find(b => b.level === level) || mockBadgeLevels[0];
};