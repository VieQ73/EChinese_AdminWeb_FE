// hooks/useDataLoader.ts

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Session cache - Cache trong memory, tồn tại trong suốt session
 * Không bị mất khi chuyển tab
 */
class SessionCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private loadingKeys = new Set<string>();

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string, ttl: number = Infinity): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Kiểm tra TTL
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  isLoading(key: string): boolean {
    return this.loadingKeys.has(key);
  }

  setLoading(key: string, loading: boolean): void {
    if (loading) {
      this.loadingKeys.add(key);
    } else {
      this.loadingKeys.delete(key);
    }
  }
}

// Singleton instance
const sessionCache = new SessionCache();

interface UseDataLoaderOptions<T> {
  /**
   * Key duy nhất để cache dữ liệu
   */
  cacheKey: string;

  /**
   * Hàm fetch dữ liệu từ API
   */
  fetchFn: () => Promise<T>;

  /**
   * Time to live (ms) - Thời gian cache hợp lệ
   * Default: Infinity (cache vĩnh viễn cho đến khi invalidate)
   */
  ttl?: number;

  /**
   * Dependencies - Khi thay đổi sẽ invalidate cache và load lại
   */
  deps?: any[];

  /**
   * Có tự động load khi mount không
   * Default: true
   */
  autoLoad?: boolean;
}

interface UseDataLoaderResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Custom hook để load và cache dữ liệu
 * 
 * Đặc điểm:
 * - Cache trong memory (không mất khi chuyển tab)
 * - Chỉ load lại khi:
 *   + Lần đầu mount (chưa có cache)
 *   + User gọi reload() thủ công
 *   + Dependencies thay đổi
 *   + Cache bị invalidate
 * - Không load lại khi chuyển tab và quay lại
 * 
 * @example
 * ```tsx
 * const { data, loading, reload } = useDataLoader({
 *   cacheKey: 'dashboard_data',
 *   fetchFn: fetchDashboardData,
 *   ttl: 5 * 60 * 1000, // 5 phút
 * });
 * ```
 */
export function useDataLoader<T>({
  cacheKey,
  fetchFn,
  ttl = Infinity,
  deps = [],
  autoLoad = true,
}: UseDataLoaderOptions<T>): UseDataLoaderResult<T> {
  const [data, setData] = useState<T | null>(() => {
    // Khởi tạo từ cache nếu có
    return sessionCache.get(cacheKey, ttl);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    // Nếu có cache thì không loading
    return !sessionCache.has(cacheKey);
  });
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const depsRef = useRef(deps);

  // Load dữ liệu
  const loadData = useCallback(async () => {
    // Nếu đang loading thì không load lại
    if (sessionCache.isLoading(cacheKey)) {
      return;
    }

    sessionCache.setLoading(cacheKey, true);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (mountedRef.current) {
        setData(result);
        sessionCache.set(cacheKey, result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu';
        setError(errorMessage);
      }
    } finally {
      sessionCache.setLoading(cacheKey, false);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, fetchFn]);

  // Reload - Force load lại dữ liệu
  const reload = useCallback(async () => {
    sessionCache.invalidate(cacheKey);
    await loadData();
  }, [cacheKey, loadData]);

  // Invalidate - Xóa cache
  const invalidate = useCallback(() => {
    sessionCache.invalidate(cacheKey);
  }, [cacheKey]);

  // Effect để load data khi mount hoặc deps thay đổi
  useEffect(() => {
    // Kiểm tra xem deps có thay đổi không
    const depsChanged = JSON.stringify(depsRef.current) !== JSON.stringify(deps);
    
    if (depsChanged) {
      // Deps thay đổi → Invalidate cache và load lại
      sessionCache.invalidate(cacheKey);
      depsRef.current = deps;
    }

    // Chỉ load nếu:
    // 1. autoLoad = true
    // 2. Chưa có cache hoặc deps thay đổi
    if (autoLoad && (!sessionCache.has(cacheKey) || depsChanged)) {
      loadData();
    }
  }, [cacheKey, loadData, autoLoad, ...deps]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    reload,
    invalidate,
  };
}

/**
 * Export sessionCache để có thể invalidate từ bên ngoài
 */
export { sessionCache };
