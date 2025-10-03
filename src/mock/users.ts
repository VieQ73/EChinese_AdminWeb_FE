import type { User } from '../types/entities';
import { getAllMockUsers, getUserById as getUserFromApi } from '../features/users/userApi';

// Import users từ userApi.ts để đồng nhất dữ liệu
export const mockUsers: User[] = getAllMockUsers();

export const getUserById = (userId: string): User => {
  const user = getUserFromApi(userId);
  return user || mockUsers[0]; // Fallback về Super Admin
};