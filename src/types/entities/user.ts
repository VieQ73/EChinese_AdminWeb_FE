/**
 * User domain entities - Quản lý người dùng và hoạt động
 */

import type { UUID, Timestamp, Json } from './base';

// --- Users ---
export interface User {
  id: UUID;
  username: string; // Bắt buộc, không null
  password_hash?: string;
  name?: string | null; // Có thể null theo DB Note
  avatar_url?: string | null;
  email?: string | null;
  provider?: 'google' | 'apple' | 'local';
  provider_id?: string;
  role: 'user' | 'admin' | 'super admin';
  is_active: boolean;
  isVerify: boolean;
  community_points: number;
  subscription_id: UUID; // Bắt buộc, không null
  subscription_expiry?: Timestamp | null;
  level: '1' | '2' | '3' | '4' | '5' | '6' | '7-9';
  badge_level: number;
  language: 'Tiếng Việt' | 'Tiếng Anh';
  created_at: Timestamp;
  last_login?: Timestamp | null;
  achievements?: Json; // Array of achievement objects
}

export interface UserSession {
  id: UUID;
  user_id: UUID;
  login_at: Timestamp;
  logout_at?: Timestamp | null;
  device?: 'mobile' | 'web' | 'desktop' | string | null;
  ip_address?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserDailyActivity {
  user_id: UUID;
  date: string; // YYYY-MM-DD
  minutes_online: number;
  login_count: number;
  last_activity?: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserStreak {
  user_id: UUID;
  current_streak: number;
  longest_streak: number;
  last_login_date?: string | null; // YYYY-MM-DD
  updated_at: Timestamp;
}

export interface UserUsage {
  id: UUID;
  user_id: UUID;
  feature: 'ai_lesson' | 'ai_translate';
  daily_count: number;
  last_reset: Timestamp;
}

export interface RefreshToken {
  id: UUID;
  user_id: UUID;
  token: string;
  created_at: Timestamp;
  expires_at: Timestamp;
}

export interface BadgeLevel {
  level: number;
  name: string;
  /** Optional icon (emoji or URL) to display next to user names */
  icon?: string;
}