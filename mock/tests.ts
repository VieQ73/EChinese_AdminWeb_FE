import { MockTest } from '../types';

export const mockTests: MockTest[] = [
    // FIX: Add missing `updated_at` property.
    { id: 't1', type: 'HSK', level: '5', title: 'Đề thi thử HSK Cấp 5 - Đề A', total_time_limit: 125, total_max_score: 300, is_active: true, created_at: '2023-10-01T00:00:00Z', updated_at: '2023-10-01T00:00:00Z' },
    // FIX: Add missing `updated_at` property.
    { id: 't2', type: 'HSK', level: '3', title: 'Đề thi thử HSK Cấp 3 - Đề B', total_time_limit: 90, total_max_score: 300, is_active: true, created_at: '2023-11-01T00:00:00Z', updated_at: '2023-11-01T00:00:00Z' },
    // FIX: Add missing `updated_at` property.
    { id: 't3', type: 'TOCFL', level: 'A2', title: 'Luyện tập TOCFL Band A Cấp 2', total_time_limit: 60, total_max_score: 100, is_active: false, created_at: '2023-12-01T00:00:00Z', updated_at: '2023-12-01T00:00:00Z' },
];