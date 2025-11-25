// React Query-like hooks cho Community Stats
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCommunityStats, CommunityStats } from '../api/communityStats';

// Cache TTL mặc định 30 giây
const DEFAULT_CACHE_TTL = 30000;

/**
 * Hook lấy community stats với caching
 */
export function useCommunityStats() {
    const [data, setData] = useState<CommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<{ data: CommunityStats; timestamp: number } | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        // Kiểm tra cache còn hiệu lực
        if (!forceRefresh && cacheRef.current) {
            const isExpired = Date.now() - cacheRef.current.timestamp > DEFAULT_CACHE_TTL;
            if (!isExpired) {
                setData(cacheRef.current.data);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchCommunityStats();
            cacheRef.current = { data: result, timestamp: Date.now() };
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}

// Export types
export type { CommunityStats };
