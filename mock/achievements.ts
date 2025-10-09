import { Achievement, UserAchievement } from '../types';
import { mockUsers } from './users';

export const mockAchievements: Achievement[] = [
    { id: 'ach1', name: 'Gấu chăm chỉ', description: 'Đăng nhập liên tục 7 ngày', icon: 'https://cdn-icons-png.flaticon.com/512/2942/2942821.png', points: 50, is_active: true, criteria: { type: 'login_streak', min_streak: 7 }, created_at: '2023-01-10T00:00:00Z', updated_at: '2023-01-10T00:00:00Z' },
    { id: 'ach2', name: 'Người đóng góp', description: 'Đạt 1000 điểm cộng đồng', icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png', points: 100, is_active: true, criteria: { type: 'community_points', min_points: 1000 }, created_at: '2023-02-15T00:00:00Z', updated_at: '2023-02-15T00:00:00Z' },
    { id: 'ach3', name: 'Thánh Dịch Thuật', description: 'Sử dụng tính năng Dịch AI 50 lần', icon: 'https://cdn-icons-png.flaticon.com/512/2898/2898288.png', points: 75, is_active: true, criteria: { type: 'usage', feature: 'ai_translate', min_count: 50 }, created_at: '2023-03-20T00:00:00Z', updated_at: '2023-03-20T00:00:00Z' },
    { id: 'ach4', name: 'Nhà soạn thảo AI', description: 'Sử dụng tính năng Bài học AI 20 lần', icon: 'https://cdn-icons-png.flaticon.com/512/3242/3242257.png', points: 60, is_active: false, criteria: { type: 'usage', feature: 'ai_lesson', min_count: 20 }, created_at: '2023-04-25T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
    { id: 'ach5', name: 'Nhà Thám Hiểm', description: 'Hoàn thành 10 bài thi thử HSK', icon: 'https://cdn-icons-png.flaticon.com/512/942/942799.png', points: 150, is_active: true, criteria: { type: 'mock_test', test_type: 'HSK', min_completed: 10 }, created_at: '2023-05-30T00:00:00Z', updated_at: '2023-05-30T00:00:00Z' }
];

export let mockUserAchievements: UserAchievement[] = [
    // u1 (Linh Lê)
    { id: 'ua1', user_id: 'u1', achievement_id: 'ach1', achieved_at: '2023-06-01T00:00:00Z', achievement_name: 'Gấu chăm chỉ', user_name: mockUsers.find(u => u.id === 'u1')?.name, user_avatar: mockUsers.find(u => u.id === 'u1')?.avatar_url },
    { id: 'ua2', user_id: 'u1', achievement_id: 'ach2', achieved_at: '2024-02-15T00:00:00Z', achievement_name: 'Người đóng góp', user_name: mockUsers.find(u => u.id === 'u1')?.name, user_avatar: mockUsers.find(u => u.id === 'u1')?.avatar_url },
    // u5 (Nguyễn An Nhiên)
    { id: 'ua3', user_id: 'u5', achievement_id: 'ach1', achieved_at: '2023-07-20T00:00:00Z', achievement_name: 'Gấu chăm chỉ', user_name: mockUsers.find(u => u.id === 'u5')?.name, user_avatar: mockUsers.find(u => u.id === 'u5')?.avatar_url },
    { id: 'ua4', user_id: 'u5', achievement_id: 'ach3', achieved_at: '2023-08-10T00:00:00Z', achievement_name: 'Thánh Dịch Thuật', user_name: mockUsers.find(u => u.id === 'u5')?.name, user_avatar: mockUsers.find(u => u.id === 'u5')?.avatar_url, progress: { current_count: 50, required: 50 } },
    // u7 (Trần Thị Thảo)
    { id: 'ua5', user_id: 'u7', achievement_id: 'ach1', achieved_at: '2023-12-01T00:00:00Z', achievement_name: 'Gấu chăm chỉ', user_name: mockUsers.find(u => u.id === 'u7')?.name, user_avatar: mockUsers.find(u => u.id === 'u7')?.avatar_url },
    // u4 (Hoàng Văn Việt) - Streak: 8 days
    { id: 'ua6', user_id: 'u4', achievement_id: 'ach1', achieved_at: '2025-10-02T00:00:00Z', achievement_name: 'Gấu chăm chỉ', user_name: mockUsers.find(u => u.id === 'u4')?.name, user_avatar: mockUsers.find(u => u.id === 'u4')?.avatar_url },
];