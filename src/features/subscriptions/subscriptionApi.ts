import { apiClient } from '../../services/apiClient';
import type { Subscription } from '../../types/entities';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-free-001',
    name: 'Gói Miễn Phí',
    price: 0,
    duration_months: null,
    daily_quota_translate: 5,
    daily_quota_ai_lesson: 1,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'sub-premium-001',
    name: 'Gói Premium 1 Tháng',
    price: 99000,
    duration_months: 1,
    daily_quota_translate: 100,
    daily_quota_ai_lesson: 10,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'sub-permanent-001',
    name: 'Gói Vĩnh Viễn',
    price: 999000,
    duration_months: null,
    daily_quota_translate: 999,
    daily_quota_ai_lesson: 99,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

export const fetchAllSubscriptions = (): Promise<Subscription[]> => {
  if (USE_MOCK_API) {
    return new Promise(resolve => setTimeout(() => resolve(mockSubscriptions), 300));
  }
  return apiClient.get('/subscriptions');
};