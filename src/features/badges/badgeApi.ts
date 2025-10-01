import { apiClient } from '../../services/apiClient';
import type { BadgeLevel } from '../../types/entities';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const mockBadgeLevels: BadgeLevel[] = [
  { level: 0, name: 'Chưa có huy hiệu' },
  { level: 1, name: 'Tân Binh' },
  { level: 2, name: 'Học Giả' },
  { level: 3, name: 'Thông Thái' },
  { level: 4, name: 'Bậc Thầy' },
  { level: 5, name: 'Huyền Thoại' },
];

export const fetchAllBadgeLevels = (): Promise<BadgeLevel[]> => {
  if (USE_MOCK_API) {
    return new Promise(resolve => setTimeout(() => resolve(mockBadgeLevels), 300));
  }
  return apiClient.get('/badge-levels');
};