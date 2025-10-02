import { apiClient } from '../../services/apiClient';
import type { BadgeLevel } from '../../types/entities';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const mockBadgeLevels: BadgeLevel[] = [
  { level: 0, name: 'Chưa có huy hiệu', icon: '⚪' },         
  { level: 1, name: 'Tân Binh', icon: '🥉' },
  { level: 2, name: 'Học Giả', icon: '📘' },
  { level: 3, name: 'Thông Thái', icon: '🧠' },
  { level: 4, name: 'Bậc Thầy', icon: '👑' },
  { level: 5, name: 'Huyền Thoại', icon: '🌟' },
];

export const fetchAllBadgeLevels = (): Promise<BadgeLevel[]> => {
  if (USE_MOCK_API) {
    return new Promise(resolve => setTimeout(() => resolve(mockBadgeLevels), 300));
  }
  return apiClient.get('/badge-levels');
};