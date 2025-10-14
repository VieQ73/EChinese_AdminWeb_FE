import type { UUID, Timestamp, Json } from './base';

// --- Users ---
export interface User {
  id: UUID;
  username: string;
  password_hash?: string;
  name: string; // not null
  avatar_url?: string | null;
  email?: string | null;
  //  Resolved duplicate identifier 'provider'. It is now a single, required property.
  provider: 'google' | 'apple' | 'local';
  provider_id?: string;
  role: 'user' | 'admin' | 'super admin';
  is_active: boolean;
  isVerify: boolean;
  community_points: number;
  level: '1' | '2' | '3' | '4' | '5' | '6' | '7-9';
  badge_level: number;
  language: 'Tiếng Việt' | 'Tiếng Anh';
  created_at: Timestamp;
  last_login?: Timestamp | null;
}

export interface UserSession {
  id: UUID;
  user_id: UUID;
  login_at: Timestamp;
  logout_at?: Timestamp | null;
  device?: 'mobile' | 'web' | 'desktop' | string | null;
  ip_address?: string | null;
}

export interface UserDailyActivity {
  user_id: UUID;
  date: string; // YYYY-MM-DD
  minutes_online: number;
  login_count: number;
}

export interface UserStreak {
  user_id: UUID;
  current_streak: number;
  longest_streak: number;
  last_login_date?: string | null; // YYYY-MM-DD
}

// --- Achievements ---
export interface Achievement {
  id: UUID;
  name: string;
  description: string;
  criteria: Json;
  icon?: string | null;
  points: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at?: Timestamp | null;
}

// --- UserAchievements ---
export interface UserAchievement {
  id: UUID;
  user_id: UUID;
  achievement_id: UUID;
  achieved_at: Timestamp;
  progress?: Json | null;
  achievement_name?: string; // For frontend convenience
  user_name?: string;
  user_avatar?: string;
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
  id: UUID;
  level: number;
  name: string;
  icon: string;
  min_points: number;
  rule_description: string;
  is_active: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}