// services/cacheService.ts

/**
 * Service quản lý cache trong localStorage
 * Giúp tránh load dữ liệu nhiều lần và giảm số lượng API calls
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

// Version để invalidate cache khi cần
const CACHE_VERSION = '1.0.0';

// Thời gian cache mặc định (milliseconds)
const DEFAULT_TTL = 5 * 60 * 1000; // 5 phút

// Các key cache
export const CACHE_KEYS = {
  EXAM_TYPES: 'cache_exam_types',
  EXAM_LEVELS: 'cache_exam_levels',
  EXAMS: 'cache_exams',
  BADGES: 'cache_badges',
  ACHIEVEMENTS: 'cache_achievements',
  COMMUNITY_RULES: 'cache_community_rules',
  MODERATION_LOGS: 'cache_moderation_logs',
  VIOLATIONS: 'cache_violations',
  ADMIN_LOGS: 'cache_admin_logs',
  VOCABULARIES: 'cache_vocabularies',
  NOTEBOOKS: 'cache_notebooks',
  TIPS: 'cache_tips',
  SUBSCRIPTIONS: 'cache_subscriptions',
  USER_SUBSCRIPTIONS: 'cache_user_subscriptions',
  USERS: 'cache_users',
  POSTS: 'cache_posts',
  COMMENTS: 'cache_comments',
} as const;

class CacheService {
  /**
   * Lưu dữ liệu vào cache
   */
  set<T>(key: string, data: T): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`Failed to cache data for key: ${key}`, error);
    }
  }

  /**
   * Lấy dữ liệu từ cache
   * @param key - Cache key
   * @param ttl - Time to live (milliseconds), mặc định 5 phút
   * @returns Dữ liệu từ cache hoặc null nếu không có/hết hạn
   */
  get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      // Kiểm tra version
      if (cacheItem.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      // Kiểm tra thời gian hết hạn
      const now = Date.now();
      if (now - cacheItem.timestamp > ttl) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`Failed to get cached data for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Xóa một cache item
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove cache for key: ${key}`, error);
    }
  }

  /**
   * Xóa tất cả cache
   */
  clearAll(): void {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear all cache', error);
    }
  }

  /**
   * Xóa cache liên quan đến violations khi có thay đổi
   */
  invalidateViolations(): void {
    this.remove(CACHE_KEYS.VIOLATIONS);
    this.remove(CACHE_KEYS.MODERATION_LOGS);
  }

  /**
   * Xóa cache liên quan đến community khi có thay đổi
   */
  invalidateCommunity(): void {
    this.remove(CACHE_KEYS.COMMUNITY_RULES);
    this.remove(CACHE_KEYS.VIOLATIONS);
    this.remove(CACHE_KEYS.MODERATION_LOGS);
  }

  /**
   * Xóa cache liên quan đến exams khi có thay đổi
   */
  invalidateExams(): void {
    this.remove(CACHE_KEYS.EXAMS);
  }

  /**
   * Xóa cache liên quan đến content khi có thay đổi
   */
  invalidateContent(): void {
    this.remove(CACHE_KEYS.VOCABULARIES);
    this.remove(CACHE_KEYS.NOTEBOOKS);
  }

  /**
   * Xóa cache liên quan đến settings khi có thay đổi
   */
  invalidateSettings(): void {
    this.remove(CACHE_KEYS.BADGES);
    this.remove(CACHE_KEYS.ACHIEVEMENTS);
  }

  /**
   * Xóa cache liên quan đến monetization khi có thay đổi
   */
  invalidateMonetization(): void {
    this.remove(CACHE_KEYS.SUBSCRIPTIONS);
    this.remove(CACHE_KEYS.USER_SUBSCRIPTIONS);
  }

  /**
   * Xóa cache liên quan đến users khi có thay đổi
   */
  invalidateUsers(): void {
    this.remove(CACHE_KEYS.USERS);
  }

  /**
   * Xóa cache liên quan đến posts/comments khi có thay đổi
   */
  invalidatePosts(): void {
    this.remove(CACHE_KEYS.POSTS);
    this.remove(CACHE_KEYS.COMMENTS);
    this.remove(CACHE_KEYS.VIOLATIONS);
    this.remove(CACHE_KEYS.MODERATION_LOGS);
  }
}

export const cacheService = new CacheService();
